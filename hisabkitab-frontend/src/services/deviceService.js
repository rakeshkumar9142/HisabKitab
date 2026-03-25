import { api } from './api.js'

export async function registerDevice(payload) {
  const { data } = await api.post('/api/devices', payload)
  return data
}

export async function getDevices() {
  const { data } = await api.get('/api/devices')
  return data
}

export async function disableDevice(id) {
  const { data } = await api.delete(`/api/devices/${id}`)
  return data
}
