import { api } from './api.js'

function normalizeAuthResponse(data) {
  if (!data) return data
  if (data.token != null && data.user) {
    return { ...data.user, token: data.token }
  }
  return data
}

export async function registerUser(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  const normalized = normalizeAuthResponse(data)
  if (normalized?.token) {
    localStorage.setItem('token', normalized.token)
  }
  return normalized
}

export async function loginUser(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  const normalized = normalizeAuthResponse(data)
  if (normalized?.token) {
    localStorage.setItem('token', normalized.token)
  }
  return normalized
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me')
  return data
}

export async function updateMe(payload) {
  const { data } = await api.patch('/api/auth/me', payload)
  return data
}
