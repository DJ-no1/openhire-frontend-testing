'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const { data: authData } = await supabase.auth.getUser();

            if (!authData.user) {
                setUser(null);
                return;
            }

            // Get user profile from our users table
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id);

            if (error) {
                console.error('Error fetching user profile:', error);
                setUser(null);
                return;
            }

            // If no user profile exists, create one automatically
            if (!userData || userData.length === 0) {
                console.log('No user profile found, creating one...');
                const userName = authData.user.user_metadata?.name || authData.user.user_metadata?.display_name || authData.user.email?.split('@')[0] || 'User';
                const userRole = authData.user.user_metadata?.role || 'candidate'; // Use role from metadata, default to candidate

                // First, update the auth user metadata with the name and role to ensure display_name is set
                const { error: updateError } = await supabase.auth.updateUser({
                    data: {
                        display_name: userName,
                        name: userName,
                        role: userRole
                    }
                });

                if (updateError) {
                    console.warn('Could not update auth user metadata:', updateError.message);
                }

                // Then create user profile in our users table
                const { data: newUserData, error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: authData.user.email || '',
                        name: userName,
                        role: userRole,
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Failed to create user profile:', createError);
                    setUser(null);
                    return;
                }

                setUser(newUserData);
                return;
            }

            setUser(userData[0]);

            // Check if name needs syncing (fix for existing "Job Applicant" names)
            const authName = authData.user.user_metadata?.name ||
                authData.user.user_metadata?.display_name;
            if (authName && userData[0].name !== authName && userData[0].name === 'Job Applicant') {
                console.log('Detected name mismatch, syncing:', { auth: authName, db: userData[0].name });

                // Update the database with the correct name
                const { error: nameUpdateError } = await supabase
                    .from('users')
                    .update({ name: authName })
                    .eq('id', authData.user.id);

                if (!nameUpdateError) {
                    console.log('✅ Fixed user name from "Job Applicant" to:', authName);
                    // Update local state
                    setUser({ ...userData[0], name: authName });
                } else {
                    console.warn('Could not update user name:', nameUpdateError);
                }
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
            setUser(null);
        }
    };

    const signOut = async () => {
        try {
            // Clear cookies
            if (typeof window !== 'undefined') {
                document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }

            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Store session tokens in cookies for persistence
                    if (typeof window !== 'undefined') {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=86400; secure; samesite=strict`;
                        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; secure; samesite=strict`;
                    }

                    // Get user profile from our users table
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id);

                    if (!error && userData && userData.length > 0) {
                        setUser(userData[0]);
                    } else if (!error && (!userData || userData.length === 0)) {
                        // Create user profile if it doesn't exist
                        console.log('No user profile found, creating one...');
                        const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
                        const userRole = session.user.user_metadata?.role || 'candidate';

                        // First, update the auth user metadata
                        const { error: updateError } = await supabase.auth.updateUser({
                            data: {
                                name: userName,
                                role: userRole
                            }
                        });

                        if (updateError) {
                            console.warn('Could not update auth user metadata:', updateError.message);
                        }

                        // Then create user profile in our users table
                        const { data: newUserData, error: createError } = await supabase
                            .from('users')
                            .insert({
                                id: session.user.id,
                                email: session.user.email || '',
                                name: userName,
                                role: userRole,
                            })
                            .select()
                            .single();

                        if (!createError && newUserData) {
                            setUser(newUserData);
                        }
                    }
                } else {
                    // Clear cookies if no session
                    if (typeof window !== 'undefined') {
                        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    }
                }
            } catch (error) {
                console.error('Error getting initial session:', error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes with improved session persistence
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);

                if (event === 'SIGNED_IN' && session?.user) {
                    // Store session tokens in cookies
                    if (typeof window !== 'undefined') {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=86400; secure; samesite=strict`;
                        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; secure; samesite=strict`;
                    }
                    await refreshUser();
                } else if (event === 'SIGNED_OUT') {
                    // Clear cookies and user state
                    if (typeof window !== 'undefined') {
                        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    }
                    setUser(null);
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    // Update cookies with new tokens
                    if (typeof window !== 'undefined') {
                        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=86400; secure; samesite=strict`;
                        document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; secure; samesite=strict`;
                    }
                    // Optionally refresh user data to ensure it's up to date
                    await refreshUser();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
