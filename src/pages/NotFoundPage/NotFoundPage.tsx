import { useNavigate } from 'react-router'
import styles from './NotFoundPage.module.css'

// interface Props {}

export function NotFoundPage() {
	const navigate = useNavigate()

	const handleRedirect = () => {
		navigate('/chat', { replace: true })
	}

	return (
		<div className={styles.noPageContainer}>
			<div className={styles.noPageMessage}>Нет такой страницы.</div>
			<button type='submit' className='submit-button' onClick={handleRedirect}>
				На главную
			</button>
		</div>
	)
}
