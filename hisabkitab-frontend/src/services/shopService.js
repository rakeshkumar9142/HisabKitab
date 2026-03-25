import { api } from './api.js'

export async function renewSubscription() {
  const { data } = await api.post('/api/shop/renew')
  return data
}
