'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@contexts/AuthContext'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push('/login')
    }
  }, [isAuth, loading, router])

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuth) {
    return null
  }

  return children
}

export default ProtectedRoute
