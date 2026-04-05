import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginUser, registerUser, updateMe } from '../services/authService.js'

const AUTH_STORAGE_KEY = 'hisabkitab_auth'

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth)

  const persistAuth = useCallback((data) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
    if (data?.token) {
      localStorage.setItem('token', data.token)
    }
    setAuth(data)
  }, [])

  const refreshProfile = useCallback(async () => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!parsed?.token) return
    const me = await getMe()
    const next = {
      ...parsed,
      _id: me._id,
      name: me.name,
      phone: me.phone,
      subscription: me.subscription ?? null,
      subscriptionActive: Boolean(me.subscriptionActive),
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    if (next.token) localStorage.setItem('token', next.token)
    setAuth(next)
  }, [])

  useEffect(() => {
    if (!auth?.token) return
    refreshProfile().catch(() => {})
  }, [auth?.token, refreshProfile])

  const login = useCallback(
    async (payload) => {
      const user = await loginUser(payload)
      persistAuth(user)
      return user
    },
    [persistAuth],
  )

  const register = useCallback(
    async (payload) => {
      const user = await registerUser(payload)
      persistAuth(user)
      return user
    },
    [persistAuth],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem('token')
    setAuth(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const me = await updateMe(payload)
    setAuth((prev) => {
      const next = {
        ...prev,
        _id: me._id,
        name: me.name,
        phone: me.phone,
        subscription: me.subscription ?? null,
        subscriptionActive: Boolean(me.subscriptionActive),
        token: prev?.token,
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
      if (next.token) localStorage.setItem('token', next.token)
      return next
    })
    return me
  }, [])

  const value = useMemo(
    () => ({
      user: auth
        ? {
            _id: auth._id,
            name: auth.name,
            phone: auth.phone,
            subscription: auth.subscription,
            subscriptionActive: auth.subscriptionActive,
          }
        : null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [auth, login, logout, refreshProfile, updateProfile, register],
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
