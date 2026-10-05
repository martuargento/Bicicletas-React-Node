import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { cargarPerfil, login as requestLogin, registro as requestRegistro } from '../api/auth'

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
        setUser(await cargarPerfil())
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

  const registro = async (username, email, password) => {
    const session = await requestRegistro(username, email, password)
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

  const value = useMemo(() => ({ user, token, loading, login, registro, logout }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
