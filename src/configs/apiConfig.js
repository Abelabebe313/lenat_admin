// API Configuration
export const API_CONFIG = {
  // GraphQL endpoint - Hasura GraphQL endpoint
  GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://api.lenatmom.com/v1/graphql',
  
  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
  },
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
  
  // Environment
  ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
}

export default API_CONFIG
