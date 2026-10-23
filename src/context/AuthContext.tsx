import {
	createContext,
	useState,
	useContext,
	useEffect,
	useCallback,
} from 'react'
import { Credentials } from '../types'
import { STORAGE_KEY } from '../constants'

interface AuthProviderProps {
	children: React.ReactNode
}

type AuthCredsContextValue = {
	credentials: Credentials | null
}

type AuthActionsContextValue = {
	handleLogin: (creds: Credentials) => void
	handleLogout: () => void
}

function loadCreds(): Credentials | null {
	try {
		const storedData = localStorage.getItem(STORAGE_KEY)
		if (!storedData) return null
		const parsedData = JSON.parse(storedData) as Credentials
		if (!parsedData?.idInstance || !parsedData?.apiTokenInstance) return null
		return parsedData
	} catch (err) {
		console.error('Ошибка loadCreds!', err)
		return null
	}
}

const AuthCredentialsContext = createContext<AuthCredsContextValue | null>(null)
const AuthActionsContext = createContext<AuthActionsContextValue | null>(null)

export function AuthProvider({ children }: AuthProviderProps) {
	const [credentials, setCredentials] = useState<Credentials | null>(() =>
		loadCreds(),
	)

	useEffect(() => {
		if (credentials) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
		} else {
			localStorage.removeItem(STORAGE_KEY)
		}
	}, [credentials])

	const handleLogin = useCallback((creds: Credentials) => {
		setCredentials(creds)
	}, [])

	const handleLogout = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY)
		setCredentials(null)
	}, [])

	return (
		<AuthCredentialsContext.Provider value={{ credentials }}>
			<AuthActionsContext.Provider value={{ handleLogin, handleLogout }}>
				{children}
			</AuthActionsContext.Provider>
		</AuthCredentialsContext.Provider>
	)
}

export const useAuthCreds = () => {
	const ctx = useContext(AuthCredentialsContext)
	if (!ctx) {
		throw new Error(
			'useAuthCreds must be used within AuthCredentialsContext provider',
		)
	}
	return ctx
}

export const useAuthActions = () => {
	const ctx = useContext(AuthActionsContext)
	if (!ctx) {
		throw new Error(
			'useAuthActions must be used within AuthActionsContext provider',
		)
	}
	return ctx
}
