'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RootPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/home')
  }, [router])

  return null
}

export default RootPage
