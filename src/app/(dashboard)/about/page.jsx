'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AboutPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since this is now the main admin panel
    router.replace('/home')
  }, [router])

  return null
}

export default AboutPage
