'use client'

import api from '@/lib/api'
import Cookies from 'js-cookie'
import { createContext, useContext, useEffect, useState } from 'react'

interface UserData {
  email: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserData | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/users/me')
        setUser({ email: data.email })
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (token: string) => {
    Cookies.set('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    try {
      const { data } = await api.get('/users/me')
      setUser({ email: data.email })
    } catch {
      setUser(null)
      throw new Error('Erro ao buscar usuário')
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
