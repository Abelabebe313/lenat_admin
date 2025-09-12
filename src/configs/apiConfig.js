// API Configuration
export const API_CONFIG = {
  // GraphQL endpoint - Hasura GraphQL endpoint
  GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://92.205.167.80:8080/v1/graphql',
  
  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': '123',
  },
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
}

export default API_CONFIG
