'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import OTPVerification from '@components/auth/OTPVerification'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@hooks/useAuth'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }) => {
  // States
  const [email, setEmail] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/login-light.png'
  const lightIllustration = '/images/illustrations/auth/login-dark.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { requestOTP, loading, error, clearError } = useAuth()

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    clearError()
    setSuccessMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      return
    }

    const result = await requestOTP(email.trim())
    
    if (result.success) {
      setSuccessMessage(result.message)
      setShowOTP(true)
    }
  }

  const handleBackToLogin = () => {
    setShowOTP(false)
    setEmail('')
    setSuccessMessage('')
    clearError()
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        {showOTP ? (
          <OTPVerification email={email} onBack={handleBackToLogin} />
        ) : (
          <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h3'>Welcome to Lenat Admin!</Typography>
              <Typography variant='body2' color='text.secondary'>
                Enter your email to receive a verification code
              </Typography>
            </div>

            {error && (
              <Alert severity='error' onClose={clearError}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity='success'>
                {successMessage}
              </Alert>
            )}

            <form
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit}
              className='flex flex-col gap-5'
            >
              <CustomTextField 
                autoFocus 
                fullWidth 
                label='Email Address or Phone Number' 
                placeholder='Enter your email or phone number'
                type='email'
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                required
              />
              
              <Button 
                fullWidth 
                variant='contained' 
                type='submit'
                disabled={!email.trim() || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginV2
