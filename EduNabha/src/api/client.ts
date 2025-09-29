export type Role = 'student' | 'teacher' | 'parent'

const TOKEN_KEY = 'edunabha_token'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function setToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY) || ''
}

export function clearToken() {
	localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
	const token = getToken()
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as any),
	}
	if (token) headers['Authorization'] = `Bearer ${token}`
	const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
	const res = await fetch(fullUrl, { ...options, headers })
	if (!res.ok) {
		const errorText = await res.text()
		let errorMessage: string
		try {
			const errorJson = JSON.parse(errorText)
			errorMessage = errorJson.message || errorJson.error || 'An error occurred'
		} catch {
			errorMessage = errorText || `HTTP ${res.status}: ${res.statusText}`
		}
		throw new Error(errorMessage)
	}
	return res.json() as Promise<T>
}

// Google Authentication
export async function googleSignIn(credential: string, role: Role) {
	return request<{ token: string; user: any }>('/api/auth/google', {
		method: 'POST',
		body: JSON.stringify({ credential, role })
	})
}

// Email/Password Authentication
export async function signup(payload: { role: Role; email: string; password: string; profile: any }) {
	return request<{ token: string; user: any }>('/api/auth/signup', {
		method: 'POST',
		body: JSON.stringify(payload)
	})
}

export async function login(payload: { email: string; password: string }) {
	return request<{ token: string; user: any }>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(payload)
	})
}

// User Profile
export async function me() {
	return request<{ user: any }>('/api/me')
}

// AI Chat
export async function askAI(payload: { prompt?: string; imageBase64?: string }) {
	return request<{ answer: string }>('/api/ai/ask', {
		method: 'POST',
		body: JSON.stringify(payload)
	})
}

// Courses API
export async function getCourses() {
	return request<any[]>('/api/courses')
}

export async function createCourse(courseData: any) {
	return request<any>('/api/courses', {
		method: 'POST',
		body: JSON.stringify(courseData)
	})
}

// Videos API
export async function downloadVideo(videoId: string) {
	return request<any>(`/api/videos/${videoId}/download`, {
		method: 'POST'
	})
}

export async function getDownloads() {
	return request<any[]>('/api/downloads')
}

export async function getOfflineVideos() {
	return request<any[]>('/api/videos/offline')
}

export async function updateVideoProgress(videoId: string, watchTime: number, completed: boolean) {
	return request<any>(`/api/videos/${videoId}/progress`, {
		method: 'POST',
		body: JSON.stringify({ watchTime, completed })
	})
}

// Storage API
export async function getStorageInfo() {
	return request<any>('/api/storage/info')
}

export async function deleteOfflineVideo(videoId: string) {
	return request<any>(`/api/videos/${videoId}/offline`, {
		method: 'DELETE'
	})
}

// Logout
export function logout() {
	clearToken()
	window.location.href = '/login'
}
