import axios from 'axios'

const PRINT_BRIDGE_URL = import.meta.env.VITE_PRINT_BRIDGE_URL || 'http://127.0.0.1:8080'

export const PRINT_DEVICE_TOKEN_KEY = 'hisabkitab_print_device_token'

export function getPrintDeviceToken() {
  return localStorage.getItem(PRINT_DEVICE_TOKEN_KEY) || ''
}

export function setPrintDeviceToken(token) {
  const t = String(token || '').trim()
  if (t) localStorage.setItem(PRINT_DEVICE_TOKEN_KEY, t)
  else localStorage.removeItem(PRINT_DEVICE_TOKEN_KEY)
}

const printClient = axios.create({
  baseURL: PRINT_BRIDGE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export async function printReceipt({ deviceToken, receiptText }) {
  const { data } = await printClient.post('/print', {
    deviceToken: String(deviceToken || '').trim(),
    receiptText: String(receiptText || ''),
  })
  return data
}
