// Учётные данные GREEN-API из личного кабинета
export interface Credentials {
	apiUrl: string
	idInstance: string
	apiTokenInstance: string
}

export type Chat = Pick<Contact, 'name' | 'type'> & {
	chatId: string
	phone: string
}

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

// utils, guards
export function assertCredsData(
	data: Credentials | null,
): asserts data is Credentials {
	if (!data) throw new Error('Credentials expected')
}
export const isNumber = (val: unknown): val is number =>
	typeof val === 'number' && Number.isFinite(val)
export const isObject = (val: unknown): val is Record<string, unknown> =>
	typeof val === 'object' && val !== null && !Array.isArray(val)
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isApiError = (val: unknown): val is ApiError =>
	isObject(val) && 'message' in val

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
