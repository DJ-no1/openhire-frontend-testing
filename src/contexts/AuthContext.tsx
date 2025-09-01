'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { error }
    }

    const signUp = async (email: string, password: string, metadata?: any) => {
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    ...metadata,
                    display_name: metadata?.name // Ensure display_name is set to the provided name
                },
            },
        })

        // If signup is successful, immediately create user profile in public.users table
        if (!error && authData.user && metadata) {
            const userName = metadata.name || email.split('@')[0] || 'User'
            const userRole = metadata.role || 'candidate'

            // Update auth user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    display_name: userName,
                    name: userName,
                    role: userRole
                }
            })

            if (updateError) {
                console.warn('Could not update auth user display_name:', updateError.message)
            }

            // Immediately create user profile in public.users table
            const { error: createProfileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email,
                    name: userName,
                    role: userRole,
                })

            if (createProfileError) {
                console.error('Failed to create user profile immediately after signup:', createProfileError)
                // Note: We don't return this error to avoid blocking signup, but we log it
            } else {
                console.log('✅ User profile created immediately after signup:', { id: authData.user.id, email, name: userName, role: userRole })
            }
        }

        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
