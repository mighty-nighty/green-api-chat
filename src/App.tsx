import { ErrorProvider } from './context/ErrorContext'
import { ProtectedRoutes } from './components/ProtectedRoutes/ProtectedRoutes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { ChatPage } from './pages/ChatPage/ChatPage'

export default function App() {
	return (
		<ErrorBoundary>
			<ErrorProvider>
				<AuthProvider>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={<Navigate to='/chat' replace />} />
							<Route path='/login' element={<LoginPage />} />
							<Route path='/chat' element={<ProtectedRoutes />}>
								<Route index element={<ChatPage />} />
							</Route>
							<Route path='*' element={<NotFoundPage />} />
						</Routes>
					</BrowserRouter>
				</AuthProvider>
			</ErrorProvider>
		</ErrorBoundary>
	)
}
