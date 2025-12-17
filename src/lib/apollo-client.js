import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getRefreshToken, updateTokens, clearTokens, isRefreshTokenExpired } from '@utils/tokenManager'
import { REFRESH_TOKEN } from '@lib/graphql/mutations'

// Track if we're currently refreshing the token to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue = []

// Process failed requests queue after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ operation, resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      // Update operation context with new token before resolving
      if (operation && token) {
        operation.setContext({
          headers: {
            ...operation.getContext().headers,
            authorization: `Bearer ${token}`
          }
        })
      }
      resolve(token)
    }
  })
  failedQueue = []
}

// Create HTTP link
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://api.lenatmom.com/v1/graphql',
})

// Create auth link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token and user ID from localStorage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      'content-type': 'application/json',
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
      authorization: token ? `Bearer ${token}` : '',
      'x-hasura-user-id': userId || '',
    }
  }
})

// Helper function to handle token refresh
const handleTokenRefresh = (operation, forward) => {
  // If we're already refreshing, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ operation, resolve, reject })
    })
      .then(() => {
        // Retry the request with new token (operation context already updated in processQueue)
        return forward(operation)
      })
      .catch(err => {
        throw err
      })
  }

  // Check if refresh token is expired
  if (isRefreshTokenExpired()) {
    // Refresh token is expired, logout user
    if (typeof window !== 'undefined') {
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(new Error('Refresh token expired'))
  }

  // Start token refresh process
  isRefreshing = true
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    // No refresh token available, logout user
    isRefreshing = false
    if (typeof window !== 'undefined') {
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(new Error('No refresh token available'))
  }

  // Create a temporary client for the refresh mutation (without error link to avoid infinite loop)
  // Also remove authorization header for refresh token request
  const refreshAuthLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'content-type': 'application/json',
        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
        // Don't include authorization header for refresh token request
      }
    }
  })

  const tempClient = new ApolloClient({
    link: refreshAuthLink.concat(httpLink),
    cache: new InMemoryCache(),
  })

  // Call refresh token mutation
  if (process.env.NODE_ENV === 'development') {
    console.log('Refreshing access token...')
  }
  
  return tempClient.mutate({
    mutation: REFRESH_TOKEN,
    variables: { refresh_token: refreshToken },
  })
    .then(({ data }) => {
      // Update tokens in localStorage
      if (data?.auth_refresh_tokens?.access_token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Token refreshed successfully, retrying original request...')
        }
        
        // Always save both tokens - refresh token mutation returns both new tokens
        const newAccessToken = data.auth_refresh_tokens.access_token
        const newRefreshToken = data.auth_refresh_tokens.refresh_token || refreshToken
        
        updateTokens(newAccessToken, newRefreshToken)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Both tokens updated:', {
            hasAccessToken: !!newAccessToken,
            hasRefreshToken: !!newRefreshToken
          })
        }
        
        // Process queued requests
        processQueue(null, newAccessToken)
        isRefreshing = false
        
        // Update the operation's headers with the new token before retrying
        operation.setContext({
          headers: {
            ...operation.getContext().headers,
            authorization: `Bearer ${newAccessToken}`
          }
        })
        
        // Retry the original request with new token
        return forward(operation)
      } else {
        throw new Error('No access token received from refresh')
      }
    })
    .catch((error) => {
      // Refresh failed, logout user
      processQueue(error, null)
      isRefreshing = false
      
      console.error('Token refresh failed:', error)
      
      if (typeof window !== 'undefined') {
        clearTokens()
        window.location.href = '/login'
      }
      
      return Promise.reject(error)
    })
}

// Helper function to check if error is related to token expiration
const isTokenError = (graphQLErrors, networkError) => {
  // Check network errors (401 status)
  if (networkError && networkError.statusCode === 401) {
    return true
  }

  // Check GraphQL errors
  if (graphQLErrors && graphQLErrors.length > 0) {
    return graphQLErrors.some(err => {
      const errorMessage = err.message?.toLowerCase() || ''
      const errorCode = err.extensions?.code || ''
      
      // Check for various token expiration/authentication error patterns
      return (
        errorCode === 'UNAUTHENTICATED' ||
        errorCode === 'UNAUTHORIZED' ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('unauthenticated') ||
        errorMessage.includes('token has expired') ||
        errorMessage.includes('token expired') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('jwt') ||
        errorMessage.includes('invalid token') ||
        errorMessage.includes('token invalid') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('access denied') ||
        (errorMessage.includes('token') && (
          errorMessage.includes('expired') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('error')
        ))
      )
    })
  }

  return false
}

// Create error link to handle token refresh
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // Check if error is due to unauthorized/expired token
  if (isTokenError(graphQLErrors, networkError)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Token error detected, attempting refresh...', {
        graphQLErrors: graphQLErrors?.map(e => e.message),
        networkError: networkError?.message,
        operation: operation.operationName
      })
    }
    
    // Don't retry refresh token mutation itself
    if (operation.operationName === 'RefreshToken') {
      return
    }
    
    return handleTokenRefresh(operation, forward)
  }
})

// Create Apollo Client with error link
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

export default client
