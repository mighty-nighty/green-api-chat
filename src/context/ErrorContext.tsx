import { createContext, useCallback, useContext, useState } from 'react'

type ErrorState = {
	message: string
	id: number
} | null

type ErrorContextValue = {
	error: ErrorState
}

type ErrorActionContextValue = {
	setError: (message: string) => void
	clearError: () => void
}

const ErrorValueContext = createContext<ErrorContextValue | undefined>(
	undefined,
)
const ErrorActionContext = createContext<ErrorActionContextValue | undefined>(
	undefined,
)

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [error, setErrorState] = useState<ErrorState>(null)

	const setError = useCallback((message: string) => {
		setErrorState({ message, id: Date.now() })
	}, [])

	const clearError = useCallback(() => {
		setErrorState(null)
	}, [])

	return (
		<ErrorValueContext.Provider value={{ error }}>
			<ErrorActionContext.Provider value={{ setError, clearError }}>
				{children}
			</ErrorActionContext.Provider>
		</ErrorValueContext.Provider>
	)
}

export const useErrorValue = (): ErrorContextValue => {
	const ctx = useContext(ErrorValueContext)
	if (!ctx) {
		throw new Error(
			'useErrorValue must be used within ErrorValueContext provider',
		)
	}
	return ctx
}

export const useErrorActions = (): ErrorActionContextValue => {
	const ctx = useContext(ErrorActionContext)
	if (!ctx) {
		throw new Error(
			'useErrorActions must be used within ErrorActionContext provider',
		)
	}
	return ctx
}
