import { useEffect, useState } from 'react'
import {
	assertCredsData,
	Chat,
	Contact,
	Credentials,
	isApiError,
	Message,
} from '../../types'
import { getChatHistory, getChats } from '../../api'
import { ChatList } from '../../components/ChatList/ChatList'
import { useErrorActions } from '../../context/ErrorContext'
import { ChatMessagesWindow } from '../../components/ChatMessagesWindow/ChatMessagesWindow'
import { useAuthActions, useAuthCreds } from '../../context/AuthContext'
import styles from './ChatPage.module.css'

export function ChatPage() {
	const [chats, setChats] = useState<Chat[]>([])
	const [messages, setMessages] = useState<Record<string, Message[]>>({})
	const [activeChatId, setActiveChatId] = useState<string>('')
	const [newPhone, setNewPhone] = useState('')
	const [isLoadingChats, setLoadingChats] = useState(false)
	const [isLoadingMessages, setLoadingMessages] = useState(false)
	const { credentials: creds } = useAuthCreds()
	const { handleLogout } = useAuthActions()
	const { setError, clearError } = useErrorActions()
	assertCredsData(creds)

	const handleNewChat = (e: React.FormEvent) => {
		e.preventDefault()
		const digits = newPhone.replace(/\D/g, '')
		if (digits.length < 10) {
			setError('Введите корректный номер телефона')
			return
		}
		const chatId = `${digits}@c.us` // суффикс личного чата WhatsApp в GREEN-API
		const newChat: Chat = {
			chatId,
			name: digits,
			phone: digits,
			type: 'user',
		}

		setChats(prevChats => [newChat, ...prevChats])
		setActiveChatId(chatId)
		setNewPhone('')
		clearError()
	}

	async function loadChats(creds: Credentials) {
		setLoadingChats(true)
		try {
			const responce: Contact[] = await getChats(creds)
			const chatList: Chat[] = responce.map(contact => ({
				chatId: contact.id,
				name: contact.name || contact.id.replace('@c.us', ''),
				type: contact.type,
				phone: contact.id.replace('@c.us', ''),
			}))
			setChats(chatList)
		} catch (err) {
			setError(
				`Не удалось загрузить контакты: ${isApiError(err) ? err.message : 'Ошибка'}`,
			)
		} finally {
			setLoadingChats(false)
		}
	}

	const handleChatSelect = async (selectedChatId: string) => {
		setActiveChatId(selectedChatId)

		if (messages[selectedChatId]?.length) return

		setLoadingMessages(true)
		try {
			const selectedChatMessages = await getChatHistory(creds, selectedChatId)
			setMessages(prevMessages => {
				const messObj = { ...prevMessages }
				messObj[selectedChatId] = [...selectedChatMessages.reverse()]
				return messObj
			})
		} catch (err) {
			setError(
				`Не удалось получить сообщения: ${isApiError(err) ? err.message : 'Ошибка'}`,
			)
		} finally {
			setLoadingMessages(false)
		}
	}

	const onLogout = () => {
		handleLogout()
		setChats([])
	}

	useEffect(() => {
		if (!chats.length) {
			loadChats(creds)
		}
	}, [chats, creds])

	const active = activeChatId
		? chats.find(chat => chat.chatId === activeChatId)
		: null

	return (
		<div className={styles.chatScreenContainer}>
			<aside className={styles.sidebar}>
				<div className={styles.sidebarHeader}>
					<span>WhatsApp Chat</span>
					<button className={styles.link} onClick={onLogout}>
						Выйти
					</button>
				</div>
				<form className={styles.newChat} onSubmit={handleNewChat}>
					<input
						value={newPhone}
						onChange={e => setNewPhone(e.target.value)}
						placeholder='Номер телефона получателя'
					/>
					<button type='submit' className={styles.addChatBtn}>
						&#43;
					</button>
				</form>
				{isLoadingChats ? (
					<div className='spinner-container'>
						<div className='spinner-dual' />
					</div>
				) : (
					<ChatList
						chats={chats}
						activeChatId={activeChatId}
						handleChatSelect={handleChatSelect}
					/>
				)}
			</aside>

			<ChatMessagesWindow
				creds={creds}
				active={active}
				messages={messages}
				setMessages={setMessages}
				isLoadingMessages={isLoadingMessages}
			/>
		</div>
	)
}
