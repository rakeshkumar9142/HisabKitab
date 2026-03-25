import { api } from './api.js'

export async function createBill(payload) {
  const { data } = await api.post('/api/bills', payload)
  return data
}

export async function getBills() {
  const { data } = await api.get('/api/bills')
  return data
}
