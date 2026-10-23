import { useCallback, useEffect, useRef, useState } from 'react'
import { Chat, Credentials, Message } from '../../types'
import { deleteNotification, receiveNotification, sendMessage } from '../../api'
import { useErrorActions } from '../../context/ErrorContext'
import styles from './ChatMessagesWindow.module.css'

interface ChatMessagesWindowProps {
	creds: Credentials
	active: Chat | null | undefined
	messages: Record<string, Message[]>
	setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>
	isLoadingMessages: boolean
}

export function ChatMessagesWindow({
	creds,
	active,
	messages,
	setMessages,
	isLoadingMessages,
}: ChatMessagesWindowProps) {
	const [msgText, setMsgText] = useState('')

	const { setError } = useErrorActions()
	const bottomRef = useRef<HTMLDivElement | null>(null)
	const activeChatId = active?.chatId ?? ''

	const addMessage = useCallback((chatId: string, message: Message) => {
		setMessages(prevMessagesObj => {
			const messObj = { ...prevMessagesObj }
			const targetChatPrevMessages = messObj[chatId] ?? []
			messObj[chatId] = [...targetChatPrevMessages, message]
			return messObj
		})
	}, [])

	// Получение сообщений через HTTP API
	useEffect(() => {
		let stopped = false

		const poll = async () => {
			while (!stopped) {
				try {
					const notification = await receiveNotification(creds)

					if (notification && notification.receiptId && notification.body) {
						const { body } = notification
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

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [activeChatId])

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

	return (
		<main className={styles.chat}>
			{isLoadingMessages ? (
				<div className='spinner-container'>
					<div className='spinner-dual' />
				</div>
			) : active ? (
				<>
					<div className={styles.chatHeader}>
						<div className='avatar'>{active.name.charAt(0)}</div>
						<span>{active.name}</span>
					</div>
					<div className={styles.messages}>
						{messages[activeChatId]
							? messages[activeChatId].map((mess: Message) => (
									<div
										key={mess.idMessage}
										className={`${styles.bubble} ${mess.type === 'outgoing' ? styles.out : styles.in}`}
									>
										<div>{mess.textMessage}</div>
										<div className={styles.time}>
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
					<form className={styles.composerForm} onSubmit={handleSend}>
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
	)
}
