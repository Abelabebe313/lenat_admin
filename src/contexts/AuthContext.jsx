'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  saveTokens, 
  clearTokens, 
  getAccessToken, 
  getUserData, 
  isAuthenticated 
} from '@utils/tokenManager'

// Create Auth Context
export const AuthContext = createContext(null)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = getAccessToken()
        const userData = getUserData()
        const authenticated = isAuthenticated()

        if (authenticated && userData) {
          setUser(userData)
          setIsAuth(true)
        } else {
          // Clear invalid tokens
          clearTokens()
          setUser(null)
          setIsAuth(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearTokens()
        setUser(null)
        setIsAuth(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = (authData) => {
    const { access_token, refresh_token, ...userData } = authData
    
    // Save tokens and user data
    saveTokens(access_token, refresh_token, userData)
    
    // Update state
    setUser(userData)
    setIsAuth(true)
  }

  // Logout function
  const logout = () => {
    // Clear tokens and user data
    clearTokens()
    
    // Update state
    setUser(null)
    setIsAuth(false)
    
    // Redirect to login
    router.push('/login')
  }

  // Update user data
  const updateUser = (newUserData) => {
    const currentToken = getAccessToken()
    const currentRefreshToken = localStorage.getItem('refresh_token')
    
    if (currentToken && currentRefreshToken) {
      saveTokens(currentToken, currentRefreshToken, newUserData)
      setUser(newUserData)
    }
  }

  const value = {
    user,
    isAuth,
    loading,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
