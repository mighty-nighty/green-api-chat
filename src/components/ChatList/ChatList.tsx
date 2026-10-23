import { Chat } from '../../types'
import styles from './ChatList.module.css'

interface ChatListProps {
	chats: Chat[]
	activeChatId: string
	handleChatSelect: (selectedChatId: string) => Promise<void>
}

export function ChatList({
	chats,
	activeChatId,
	handleChatSelect,
}: ChatListProps) {
	return (
		<div className={styles.chatList}>
			{chats
				? (chats.length === 0 && (
						<div className={`${styles.muted} ${styles.pad16}`}>Нет чатов</div>
					)) ||
					chats.map(({ chatId, name }) => (
						<button
							key={chatId}
							className={`${styles.chatItem} ${chatId === activeChatId ? styles.active : ''}`}
							onClick={() => handleChatSelect(chatId)}
						>
							<div className='avatar'>{name.charAt(0)}</div>
							<div className={styles.chatItemInfo}>
								<div className={styles.muted}>{name ?? 'Нет имени'}</div>
							</div>
						</button>
					))
				: null}
		</div>
	)
}
