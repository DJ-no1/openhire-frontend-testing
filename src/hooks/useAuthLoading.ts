'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthLoading() {
    const { loading } = useAuth()
    const [pageLoading, setPageLoading] = useState(false)

    return {
        authLoading: loading,
        pageLoading,
        setPageLoading,
        isLoading: loading || pageLoading,
    }
}
