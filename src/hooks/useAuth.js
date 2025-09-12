'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { AUTH_OTP, AUTH_OTP_CALLBACK } from '@lib/graphql/mutations'
import { useAuth as useAuthContext } from '@contexts/AuthContext'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuthContext()

  // Request OTP mutation
  const [requestOtp] = useMutation(AUTH_OTP, {
    onError: (error) => {
      setError(error.message)
      setLoading(false)
    }
  })

  // Verify OTP mutation
  const [verifyOtp] = useMutation(AUTH_OTP_CALLBACK, {
    onCompleted: (data) => {
      if (data?.auth_otp_callback) {
        // Login user with received data
        login(data.auth_otp_callback)
        setError(null)
      }
      setLoading(false)
    },
    onError: (error) => {
      setError(error.message)
      setLoading(false)
    }
  })

  // Request OTP function
  const requestOTP = async (email) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await requestOtp({
        variables: { value: email }
      })
      
      if (result.data?.auth_otp?.message) {
        setLoading(false)
        return { success: true, message: result.data.auth_otp.message }
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }

  // Verify OTP function
  const verifyOTP = async (code, email) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await verifyOtp({
        variables: { code, value: email }
      })
      
      if (result.data?.auth_otp_callback) {
        setLoading(false)
        return { success: true, data: result.data.auth_otp_callback }
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }

  return {
    requestOTP,
    verifyOTP,
    loading,
    error,
    clearError: () => setError(null)
  }
}
