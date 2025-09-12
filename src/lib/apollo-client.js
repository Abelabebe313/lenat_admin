import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

// Create HTTP link
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://92.205.167.80:8080/v1/graphql',
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
      'x-hasura-admin-secret': '123',
      authorization: token ? `Bearer ${token}` : '',
      'x-hasura-user-id': userId || '',
    }
  }
})

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
