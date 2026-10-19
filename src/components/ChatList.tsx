import { getChatHistory } from '../api'
import { Chat, Credentials, Message } from '../types'

interface ChatListProps {
  creds: Credentials
	chats: Chat[]
	messages: Record<string, Message[]>
	activeChatId: string
	setActiveChatId: React.Dispatch<React.SetStateAction<string>>
	setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>
}

export function ChatList({
  creds,
	chats,
	messages,
	activeChatId,
	setActiveChatId,
	setMessages,
}: ChatListProps) {	
  
	const handleChatSelect = async (selectedChatId: string) => {
		setActiveChatId(selectedChatId)

		if (messages[selectedChatId]?.length) return

		try {
			const selectedChatMessages = await getChatHistory(creds, selectedChatId)
			setMessages(prevMessages => {
				const messObj = { ...prevMessages }
				messObj[selectedChatId] = [...selectedChatMessages.reverse()]
				return messObj
			})
		} catch (err) {
			// setError(
			// 	`Ошибка получения сообщений: ${err instanceof Error ? err.message : String(err)}`,
			// )
		}
		// console.log('messages--', messages)
	}

	return (
		<div className='chat-list'>
			{chats
				? (chats.length === 0 && <div className='muted pad'>Нет чатов</div>) ||
					chats.map(({ chatId, name }) => (
						<button
							key={chatId}
							className={`chat-item ${chatId === activeChatId ? 'active' : ''}`}
							onClick={() => handleChatSelect(chatId)}
						>
							<div className='avatar'>{name.charAt(0)}</div>
							<div className='chat-item-info'>
								{/* <div className='phone'>{chat?.phone}</div> */}
								<div className='muted'>{name ?? 'Нет имени'}</div>
							</div>
						</button>
					))
				: null}
		</div>
	)
}
