import { useEffect, useState } from 'react'
import type { Credentials } from './types'
import { ChatScreen } from './screens/ChatScreen'
import { LoginScreen } from './screens/LoginScreen'
import { STORAGE_KEY } from './constants'
import { ErrorProvider } from './context/ErrorContext'
import { Layout } from './components/Layout'

function loadCreds(): Credentials | null {
	try {
		const rawData = localStorage.getItem(STORAGE_KEY)
		if (!rawData) return null
		const parsedData = JSON.parse(rawData) as Credentials
		if (!parsedData?.idInstance || !parsedData?.apiTokenInstance) return null
		return parsedData
	} catch {
		console.log('loadCreds error!')
		return null
	}
}

export default function App() {
	const [creds, setCreds] = useState<Credentials | null>(() => loadCreds())

	// console.log('APP RENDERED--')
	useEffect(() => {
		if (creds) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
		} else {
			localStorage.removeItem(STORAGE_KEY)
		}
	}, [creds])

	const handleLogin = async (creds: Credentials) => {
		setCreds(creds)
		// const creds: Credentials = { idInstance, apiTokenInstance, apiUrl }
		try {
			// await getSettings(creds) // проверка авторизации
			setCreds(creds)
		} catch (err: any) {
			// setError(err.message)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem(STORAGE_KEY)
		setCreds(null)
	}

	return (
		<ErrorProvider>
			<Layout
				creds={creds}
				handleLogin={handleLogin}
				handleLogout={handleLogout}
			/>
		</ErrorProvider>
	)
}
