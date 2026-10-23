import {
	type Credentials,
	type SendMessageResponse,
	type ReceiveNotificationResponse,
	type DeleteNotificationResponse,
	isReceiveNotificationResponse,
  Contact,
  Message,
} from './types'

// Отправка текстового сообщения
export async function sendMessage(
	creds: Credentials,
	chatId: string,
	message: string,
): Promise<SendMessageResponse> {
	const url = `${creds.apiUrl}/waInstance${creds.idInstance}/sendMessage/${creds.apiTokenInstance}`
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chatId, message }),
	})
	if (!res.ok)
		throw new Error(`SendMessage failed: ${res.status} ${await res.text()}`)
	return res.json()
}

// Получение уведомлений
export async function receiveNotification(
	creds: Credentials,
): Promise<ReceiveNotificationResponse | null> {
	const url = `${creds.apiUrl}/waInstance${creds.idInstance}/receiveNotification/${creds.apiTokenInstance}`
	const resp = await fetch(url)

	if (!resp.ok) throw new Error(`ReceiveNotification failed: ${resp.status}`)

	const data: unknown = await resp.json()
	if (isReceiveNotificationResponse(data)) {
		return data
	} else {
		return null
	}
}

async function request<T>(
	creds: Credentials,
	endpoint: string,
	httpMethod: 'GET' | 'POST',
	body?: object,
): Promise<T> {
	const url = `https://api.green-api.com/waInstance${creds.idInstance}/${endpoint}/${creds.apiTokenInstance}`
	const options: RequestInit = {
		method: httpMethod,
		headers: { 'Content-Type': 'application/json' },
	}
	if (body) options.body = JSON.stringify(body)
	const res = await fetch(url, options)
	if (!res.ok) {
		const text = await res.text()
		throw new Error(`GREEN-API ${endpoint}: ${res.status} ${text}`)
	}
	return (await res.json()) as T
}

// Подтверждение обработки
export async function deleteNotification(
	creds: Credentials,
	receiptId: number,
): Promise<DeleteNotificationResponse> {
	const url = `${creds.apiUrl}/waInstance${creds.idInstance}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`
	const res = await fetch(url, { method: 'DELETE' })
	if (!res.ok) throw new Error(`DeleteNotification failed: ${res.status}`)
	return res.json()
}

export function getChats(creds: Credentials): Promise<Contact[]> {
	return request<Contact[]>(creds, 'getChats', 'GET')
}

// История сообщений чата
export function getChatHistory(
	creds: Credentials,
	chatId: string,
	count = 30,
): Promise<Message[]> {
	return request<Message[]>(creds, 'getChatHistory', 'POST', {
		chatId,
		count,
	})
}