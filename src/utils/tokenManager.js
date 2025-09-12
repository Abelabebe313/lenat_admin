// Token management utilities
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  USER_ID: 'user_id'
}

// Save tokens to localStorage
export const saveTokens = (accessToken, refreshToken, userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData))
    if (userData?.id) {
      localStorage.setItem(TOKEN_KEYS.USER_ID, userData.id)
    }
  }
}

// Get access token from localStorage
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
  }
  return null
}

// Get refresh token from localStorage
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
  }
  return null
}

// Get user data from localStorage
export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA)
    return userData ? JSON.parse(userData) : null
  }
  return null
}

// Get user ID from localStorage
export const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEYS.USER_ID)
  }
  return null
}

// Clear all tokens and user data
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(TOKEN_KEYS.USER_DATA)
    localStorage.removeItem(TOKEN_KEYS.USER_ID)
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken()
  if (!token) return false
  
  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch (error) {
    console.error('Error checking token validity:', error)
    return false
  }
}

// Update access token
export const updateAccessToken = (newAccessToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, newAccessToken)
  }
}
