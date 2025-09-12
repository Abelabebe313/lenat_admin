'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useAuth } from '@hooks/useAuth'

const OTPVerification = ({ email, onBack }) => {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const router = useRouter()
  const { verifyOTP, requestOTP, loading, error, clearError } = useAuth()
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 6) {
      setOtp(value)
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      return
    }

    const result = await verifyOTP(otp, email)
    
    if (result.success) {
      // Redirect to dashboard
      router.push('/home')
    }
  }

  const handleResendOtp = async () => {
    setCanResend(false)
    setTimer(60)
    setOtp('')
    clearError()
    
    const result = await requestOTP(email)
    if (!result.success) {
      setCanResend(true)
      setTimer(0)
    }
  }

  return (
    <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
      <div className='flex flex-col gap-1'>
        <Typography variant='h4'>Verify Your Email</Typography>
        <Typography variant='body2' color='text.secondary'>
          We've sent a 6-digit code to <strong>{email}</strong>
        </Typography>
      </div>

      {error && (
        <Alert severity='error' onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <CustomTextField
          ref={inputRef}
          fullWidth
          label='Enter 6-digit code'
          placeholder='000000'
          value={otp}
          onChange={handleOtpChange}
          inputProps={{
            maxLength: 6,
            style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
          }}
          disabled={loading}
        />

        <Button 
          fullWidth 
          variant='contained' 
          type='submit'
          disabled={otp.length !== 6 || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify Code'}
        </Button>

        <Box className='flex flex-col items-center gap-2'>
          <Typography variant='body2' color='text.secondary'>
            Didn't receive the code?
          </Typography>
          
          {canResend ? (
            <Button 
              variant='text' 
              color='primary' 
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend Code
            </Button>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              Resend in {timer}s
            </Typography>
          )}
        </Box>

        <Box className='flex justify-center'>
          <Button 
            variant='text' 
            color='primary' 
            onClick={onBack}
            disabled={loading}
          >
            Back to Login
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default OTPVerification
