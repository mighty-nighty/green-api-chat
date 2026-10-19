import { useErrorValue, useErrorActions } from '../context/ErrorContext'
import { ChatScreen } from '../screens/ChatScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { Credentials } from '../types'
import { ErrorBoundary } from './ErrorBoundary'

interface Props {
	creds: Credentials | null
	handleLogin: (creds: Credentials) => Promise<void>
	handleLogout: () => void
}

export function Layout({ creds, handleLogin, handleLogout }: Props) {
	const { error } = useErrorValue()
	const { clearError } = useErrorActions()

	return (
		<div className='main-container'>
			<ErrorBoundary>
				{error && (
					<div className='toast' onClick={clearError}>
						{error.message}
					</div>
				)}

				{creds ? (
					<ChatScreen creds={creds} onLogout={handleLogout} />
				) : (
					<LoginScreen onLogin={handleLogin} />
				)}
			</ErrorBoundary>
		</div>
	)
}
