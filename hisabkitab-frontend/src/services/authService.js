import { api } from './api.js'

export async function registerUser(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export async function loginUser(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me')
  return data
}

export async function updateMe(payload) {
  const { data } = await api.patch('/api/auth/me', payload)
  return data
}
