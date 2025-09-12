'use client'

// Apollo Client Imports
import { ApolloProvider } from '@apollo/client/react'
import apolloClient from '@lib/apollo-client'

// Context Imports
import { AuthProvider } from '@contexts/AuthContext'

const ClientProviders = ({ children }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApolloProvider>
  )
}

export default ClientProviders
