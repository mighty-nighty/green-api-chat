import { Navigate, Outlet } from 'react-router'
import { useAuthCreds } from '../../context/AuthContext'
import { useErrorValue, useErrorActions } from '../../context/ErrorContext'
import styles from './ProtectedRoutes.module.css'

export function ProtectedRoutes() {
	const { error } = useErrorValue()
	const { clearError } = useErrorActions()
	const { credentials } = useAuthCreds()

	if (!credentials) {
		return <Navigate to='/login' replace />
	}

	return (
		<div className={styles.mainContainer}>
			{error && (
				<div className={styles.toast} onClick={clearError}>
					{error.message}
				</div>
			)}

			<Outlet />
		</div>
	)
}
