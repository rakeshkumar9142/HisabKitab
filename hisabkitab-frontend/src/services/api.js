import axios from 'axios'

const PRODUCTION_API_DEFAULT = 'http://54.156.255.184:5000'
const rawBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  PRODUCTION_API_DEFAULT
const API_BASE_URL = String(rawBase).trim()

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token')
  if (!token) {
    const authRaw = localStorage.getItem('hisabkitab_auth')
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw)
        token = auth?.token || null
      } catch {
        token = null
      }
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback
}
