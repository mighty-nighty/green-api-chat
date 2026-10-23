import { useState } from 'react'
import { useAuthActions } from '../../context/AuthContext'
import { useNavigate } from 'react-router'
import styles from './LoginPage.module.css'

export function LoginPage() {
	const [apiUrl, setApiUrl] = useState('')
	const [idInstance, setIdInstance] = useState('')
	const [apiTokenInstance, setApiTokenInstance] = useState('')
	const { handleLogin } = useAuthActions()
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!idInstance.trim() || !apiTokenInstance.trim()) {
			setError('Введите idInstance и apiTokenInstance')
			return
		}
		handleLogin({
			apiUrl: apiUrl.replace(/\/+$/, ''),
			idInstance: idInstance.trim(),
			apiTokenInstance: apiTokenInstance.trim(),
		})
		navigate('/chat')
	}

	return (
		<div className={styles.login}>
			<form className={styles.loginCard} onSubmit={handleSubmit}>
				<h1>WhatsApp Chat</h1>
				<p className='muted'>
					Введите данные из личного кабинета GREEN-API (green-api.com)
				</p>
				<label>
					<b>API URL</b>
					<input
						value={apiUrl}
						onChange={e => setApiUrl(e.target.value)}
						placeholder='https://api.green-api.com'
					/>
				</label>
				<label>
					<b>Id Instance</b>
					<input
						value={idInstance}
						onChange={e => setIdInstance(e.target.value)}
						placeholder='1101123456'
					/>
				</label>
				<label>
					<b>API Token Instance</b>
					<input
						type='password'
						value={apiTokenInstance}
						onChange={e => setApiTokenInstance(e.target.value)}
						placeholder='Токен из кабинета'
					/>
				</label>

				{error && <div className='error'>{error}</div>}

				<button type='submit' className='submit-button'>
					Войти
				</button>
			</form>
		</div>
	)
}
