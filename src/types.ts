// Учётные данные GREEN-API из личного кабинета
export interface Credentials {
	apiUrl: string
	idInstance: string
	apiTokenInstance: string
}

// export interface HystoryMessage {
// 	chatId: string
// 	deletedMessageId: string
// 	editedMessageId: string
// 	idMessage: string
// 	isDeleted: boolean
// 	isEdited: boolean
// 	sendByApi: boolean
// 	statusMessage: string
// 	textMessage: string
// 	timestamp: number
// 	type: string
// 	typeMessage: string
// }

export type Chat = Pick<Contact, 'name' | 'type'> & { chatId: string; phone: string; }

export type Message = {
  chatId: string
  idMessage: string
  isDeleted: boolean
  isEdited: boolean
  sendByApi: boolean
  statusMessage: string
  textMessage: string
  timestamp: number // миллисекунды
  type: string
}

export type Chats = Record<string, Chat>

// Форматы GREEN-API
export interface SendMessageResponse {
	idMessage: string
}

export interface ReceiveNotificationResponse {
	receiptId: number
	body: {
		typeWebhook: string
		instanceData?: {
			idInstance: number
			wid: string
			typeInstance: string
		}
		timestamp: number
		idMessage: string
		senderData: {
			chatId: string
			sender?: string
			senderName?: string
			senderContactName?: string
		}
		messageData: {
			typeMessage: string
			textMessageData?: {
				textMessage: string
			}
		}
	}
}

export interface DeleteNotificationResponse {
	result: boolean
}

export type ApiError = {
	code?: string
	message?: string
	status?: string
}

export interface Contact {
	id: string // chatId
	name: string
	type: string
}

export interface HistoryMessage {
	idMessage: string
	timestamp: number
	typeMessage: string
	textMessage?: string
	senderId?: string
	senderName?: string
	chatId?: string
}

// utils, guards
export const isNumber = (v: unknown): v is number =>
	typeof v === 'number' && Number.isFinite(v)
export const isObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v)
export const isString = (v: unknown): v is string => typeof v === 'string'

interface Body {
	typeWebhook: string
	instanceData?: object
	timestamp: number
	idMessage: string
	senderData: object
	messageData: object
}

const isBody = (v: unknown): v is Body =>
	isObject(v) &&
	isString(v.typeWebhook) &&
	isNumber(v.timestamp) &&
	isString(v.idMessage) &&
	isObject(v.senderData) &&
	isObject(v.messageData)

export function isReceiveNotificationResponse(
	data: unknown,
): data is ReceiveNotificationResponse {
	if (typeof data !== 'object' || data === null) return false
	return isObject(data) && isNumber(data.receiptId) && isBody(data.body)
}
