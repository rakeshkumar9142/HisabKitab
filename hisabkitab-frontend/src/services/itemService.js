import { api } from './api.js'

export async function getItems() {
  const { data } = await api.get('/api/items')
  return data
}

export async function createItem(payload) {
  const { data } = await api.post('/api/items', payload)
  return data
}

export async function updateItem(id, payload) {
  const { data } = await api.put(`/api/items/${id}`, payload)
  return data
}

export async function deleteItem(id) {
  const { data } = await api.delete(`/api/items/${id}`)
  return data
}
