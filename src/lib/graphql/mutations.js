import { gql } from '@apollo/client/core'

// Mutation to request OTP
export const AUTH_OTP = gql`
  mutation AuthOtp($value: String!) {
    auth_otp(value: $value) {
      message
    }
  }
`

// Mutation to verify OTP and get tokens
export const AUTH_OTP_CALLBACK = gql`
  mutation AuthOtpCallback($code: String!, $value: String!) {
    auth_otp_callback(code: $code, value: $value) {
      access_token
      refresh_token
      id
      email
      new_user
      phone_number
      role
    }
  }
`
