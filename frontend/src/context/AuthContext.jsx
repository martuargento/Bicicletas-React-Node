import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getProfile, login as requestLogin, register as requestRegister } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        setUser(await getProfile())
      } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [token])

  const login = async (username, password) => {
    const session = await requestLogin(username, password)
    setToken(session.access)
    setUser(session.user)
    return session
  }

  const register = async (username, email, password) => {
    const session = await requestRegister(username, email, password)
    setToken(session.access)
    setUser(session.user)
    return session
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
