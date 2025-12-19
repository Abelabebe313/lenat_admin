'use client'

// Apollo Client Imports
import { ApolloProvider } from '@apollo/client/react'
import apolloClient from '@lib/apollo-client'

// Context Imports
import { AuthProvider } from '@contexts/AuthContext'

import { Toaster } from 'react-hot-toast'

const ClientProviders = ({ children }) => {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        {children}
        <Toaster position='top-center' />
      </AuthProvider>
    </ApolloProvider>
  )
}

export default ClientProviders
