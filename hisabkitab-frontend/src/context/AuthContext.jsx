/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/authService.js'

const AUTH_STORAGE_KEY = 'hisabkitab_auth'

const AuthContext = createContext(null)

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth)

  const persistAuth = (data) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    setAuth(data)
  }

  const login = async (payload) => {
    const user = await loginUser(payload)
    persistAuth(user)
    return user
  }

  const register = async (payload) => {
    const user = await registerUser(payload)
    persistAuth(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }

  const value = useMemo(
    () => ({
      user: auth ? { _id: auth._id, name: auth.name } : null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
