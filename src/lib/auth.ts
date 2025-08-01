import { supabase } from './supabaseClient';

export interface User {
    id: string;
    email: string;
    role: 'recruiter' | 'candidate';
    name?: string;
    created_at: string;
}

export interface AuthError {
    message: string;
    code?: string;
}

export interface SignUpData {
    email: string;
    password: string;
    name: string;
    role: 'recruiter' | 'candidate';
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user?: User;
    error?: AuthError;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
    try {
        // First, sign up with Supabase Auth and include role in metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    role: data.role
                }
            }
        });

        if (authError) {
            return { error: { message: authError.message, code: authError.name } };
        }

        if (!authData.user) {
            return { error: { message: 'Failed to create user account' } };
        }

        // Then create user profile in our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: data.email,
                name: data.name,
                role: data.role,
            })
            .select()
            .single();

        if (userError) {
            // If user creation fails, we should clean up the auth user
            // Note: This is a simplified approach - in production you might want to handle this differently
            await supabase.auth.signOut();
            return { error: { message: 'Failed to create user profile: ' + userError.message } };
        }

        return { user: userData };
    } catch (error) {
        return { error: { message: 'An unexpected error occurred during sign up' } };
    }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            return { error: { message: authError.message, code: authError.name } };
        }

        if (!authData.user) {
            return { error: { message: 'Sign in failed' } };
        }

        // Get user profile from our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id);

        if (userError) {
            return { error: { message: 'Failed to load user profile: ' + userError.message } };
        }

        // If no user profile exists, create one automatically
        if (!userData || userData.length === 0) {
            console.log('No user profile found, creating one...');
            const userName = authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User';
            const userRole = authData.user.user_metadata?.role || 'candidate'; // Use role from metadata, default to candidate

            // First, update the auth user metadata with the name and role
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
                    id: authData.user.id,
                    email: authData.user.email || data.email,
                    name: userName,
                    role: userRole,
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to create user profile:', createError);
                return { error: { message: 'Failed to create user profile: ' + createError.message } };
            }

            return { user: newUserData };
        }

        return { user: userData[0] };
    } catch (error) {
        console.error('Sign in error:', error);
        return { error: { message: 'An unexpected error occurred during sign in' } };
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error?: AuthError }> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { error: { message: error.message, code: error.name } };
        }
        return {};
    } catch (error) {
        return { error: { message: 'An unexpected error occurred during sign out' } };
    }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
    try {
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return { error: { message: 'No authenticated user' } };
        }

        // Get user profile from our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id);

        if (userError) {
            return { error: { message: 'Failed to load user profile: ' + userError.message } };
        }

        // If no user profile exists, create one automatically
        if (!userData || userData.length === 0) {
            console.log('No user profile found, creating one...');
            const userName = authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User';
            const userRole = authData.user.user_metadata?.role || 'candidate'; // Use role from metadata, default to candidate

            // First, update the auth user metadata with the name and role
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
                    id: authData.user.id,
                    email: authData.user.email || '',
                    name: userName,
                    role: userRole,
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to create user profile:', createError);
                return { error: { message: 'Failed to create user profile: ' + createError.message } };
            }

            return { user: newUserData };
        }

        return { user: userData[0] };
    } catch (error) {
        console.error('Get current user error:', error);
        return { error: { message: 'An unexpected error occurred while getting user' } };
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const { data } = await supabase.auth.getUser();
        return !!data.user;
    } catch (error) {
        return false;
    }
}

/**
 * Reset password for a user
 */
export async function resetPassword(email: string): Promise<{ error?: AuthError }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            return { error: { message: error.message, code: error.name } };
        }
        return {};
    } catch (error) {
        return { error: { message: 'An unexpected error occurred during password reset' } };
    }
}

/**
 * Update user profile (and sync name to auth metadata)
 */
export async function updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'role'>>): Promise<AuthResponse> {
    try {
        // Update user profile in our users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (userError) {
            return { error: { message: 'Failed to update user profile: ' + userError.message } };
        }

        // If name was updated, also update auth metadata
        if (updates.name) {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { name: updates.name }
            });

            if (updateError) {
                console.warn('Could not update auth user metadata:', updateError.message);
            }
        }

        return { user: userData };
    } catch (error) {
        return { error: { message: 'An unexpected error occurred while updating profile' } };
    }
}
