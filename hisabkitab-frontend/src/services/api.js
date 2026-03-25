import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const authRaw = localStorage.getItem('hisabkitab_auth')
  if (authRaw) {
    const auth = JSON.parse(authRaw)
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
  }
  return config
})

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback
}
