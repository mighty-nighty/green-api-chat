import { useCallback, useEffect, useRef, useState } from 'react'
import { Chat, Contact, Credentials, Message } from '../types'
import {
	sendMessage,
	receiveNotification,
	deleteNotification,
	getChats,
} from '../api'
import { ChatList } from '../components/ChatList'
import { useErrorActions } from '../context/ErrorContext'

interface ChatScreenProps {
	creds: Credentials
	onLogout: () => void
}

export function ChatScreen({ creds, onLogout }: ChatScreenProps) {
	const [chats, setChats] = useState<Chat[]>([])
	const [messages, setMessages] = useState<Record<string, Message[]>>({})
	const [activeChatId, setActiveChatId] = useState<string>('')
	const [newPhone, setNewPhone] = useState('')
	const [msgText, setMsgText] = useState('')
	// const [error, setError] = useState('')
	const [loadingChats, setLoadingChats] = useState(false)
	const { setError, clearError } = useErrorActions()
	const bottomRef = useRef<HTMLDivElement | null>(null)

	// console.log('CHATS', chats)

	const addMessage = useCallback((chatId: string, message: Message) => {
		setMessages(prevMessagesObj => {
			const messObj = { ...prevMessagesObj }
			const targetChatPrevMessages = messObj[chatId] ?? []
			messObj[chatId] = [...targetChatPrevMessages, message]
			return messObj
		})
	}, [])

	// Отправка сообщения
	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!msgText.trim() || !activeChatId) return

		const chatId = activeChatId
		setMsgText('')

		try {
			const message = msgText.trim()

			const { idMessage: messId } = await sendMessage(creds, chatId, message)
			const outgoingMsg: Message = {
				chatId: chatId,
				idMessage: messId,
				isDeleted: false,
				isEdited: false,
				sendByApi: true,
				statusMessage: '',
				textMessage: message,
				timestamp: Date.now(),
				type: 'outgoing',
			}
			addMessage(chatId, outgoingMsg)
		} catch (err) {
			setError(
				`Ошибка отправки: ${err instanceof Error ? err.message : String(err)}`,
			)
		}
	}

	// Создание нового чата по номеру телефона получателя
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
			setLoadingChats(false)
		} catch (err: any) {
			setError('Не удалось загрузить контакты: ' + err.message)
			setLoadingChats(false)
		}
	}

	const handleLogout = () => {
		onLogout()
		setChats([])
	}

	// const handleChatSelect = async (selectedChatId: string) => {
	// 	setActiveChatId(selectedChatId)

	// 	if (messages[selectedChatId]?.length) return

	// 	try {
	// 		const selectedChatMessages = await getChatHistory(creds, selectedChatId)
	// 		setMessages(prevMessages => {
	// 			const messObj = { ...prevMessages }
	// 			messObj[selectedChatId] = [...selectedChatMessages.reverse()]
	// 			return messObj
	// 		})
	// 	} catch (err) {
	// 		setError(
	// 			`Ошибка получения сообщений: ${err instanceof Error ? err.message : String(err)}`,
	// 		)
	// 	}

	// }

	useEffect(() => {
		if (!chats.length) {
			loadChats(creds)
		}
	}, [chats, creds])

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [activeChatId])

	// Получение сообщений через HTTP API
	useEffect(() => {
		let stopped = false

		const poll = async () => {
			while (!stopped) {
				try {
					const notification = await receiveNotification(creds)
					console.log('NOTIF--', notification)

					if (notification && notification.receiptId && notification.body) {
						const { body } = notification
						console.warn('INCOMING M', notification)
						if (
							body.typeWebhook === 'incomingMessageReceived' &&
							body.messageData?.typeMessage === 'textMessage' &&
							body.messageData.textMessageData
						) {
							addMessage(body.senderData.chatId, {
								chatId: body.senderData.chatId,
								idMessage: body.idMessage,
								isDeleted: false,
								isEdited: false,
								sendByApi: true,
								statusMessage: '',
								textMessage: body.messageData.textMessageData.textMessage,
								timestamp:
									(body.timestamp || Math.floor(Date.now() / 1000)) * 1000,
								type: 'incoming',
							})
						}
						// await getChatHistory(creds, body.senderData.chatId)
						await deleteNotification(creds, notification.receiptId)
					}
				} catch (err) {
					setError(
						`Ошибка получения: ${err instanceof Error ? err.message : String(err)}`,
					)
				}
				await new Promise(res => setTimeout(res, 5000))
			}
		}

		poll()

		return () => {
			stopped = true
		}
	}, [creds, addMessage])

	const active = activeChatId
		? chats.find(chat => chat.chatId === activeChatId)
		: null
	console.log('ACTIVE', [activeChatId, chats])

	// Разбить на меньшие компоненты
	return (
		<div className='chat-screen-container'>
			<aside className='sidebar'>
				<div className='sidebar-header'>
					<span>WhatsApp Chat</span>
					<button className='link' onClick={handleLogout}>
						Выйти
					</button>
				</div>
				<form className='new-chat' onSubmit={handleNewChat}>
					<input
						value={newPhone}
						onChange={e => setNewPhone(e.target.value)}
						placeholder='Номер телефона получателя'
					/>
					<button type='submit' className='add-chat-btn'>
						&#43;
					</button>
				</form>
				{loadingChats ? (
					<div className='spinner-container'>
						<div className='spinner-dual' />
					</div>
				) : (
					<ChatList
						creds={creds}
						chats={chats}
						messages={messages}
						activeChatId={activeChatId}
						setActiveChatId={setActiveChatId}
						setMessages={setMessages}
					/>
				)}
			</aside>

			<main className='chat'>
				{active ? (
					<>
						<div className='chat-header'>
							<div className='avatar'>{active.name.charAt(0)}</div>
							<span>{active.name}</span>
						</div>
						<div className='messages'>
							{messages[activeChatId]
								? messages[activeChatId].map((mess: Message) => (
										<div
											key={mess.idMessage}
											className={`bubble ${mess.type === 'outgoing' ? 'out' : 'in'}`}
										>
											<div>{mess.textMessage}</div>
											<div className='time'>
												{new Date(mess.timestamp).toLocaleTimeString('ru-RU', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										</div>
									))
								: null}
							<div ref={bottomRef} />
						</div>
						<form className='composer' onSubmit={handleSend}>
							<input
								value={msgText}
								onChange={e => setMsgText(e.target.value)}
								placeholder='Введите сообщение...'
							/>
							<button type='submit' disabled={!msgText.trim()}>
								Отправить
							</button>
						</form>
					</>
				) : (
					<div className='empty muted'>
						Выберите чат или создайте новый, введя номер телефона
					</div>
				)}
			</main>
		</div>
	)
}
