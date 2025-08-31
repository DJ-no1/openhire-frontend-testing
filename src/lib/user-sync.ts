import { supabase } from './supabaseClient';
import { User } from './auth';

/**
 * Utility functions for synchronizing user data between Supabase auth and custom users table
 */

export interface UserSyncData {
    email: string;
    name: string;
    role: 'recruiter' | 'candidate';
}

/**
 * Create a user profile in the custom users table and sync with auth metadata
 */
export async function createUserProfile(userId: string, userData: UserSyncData): Promise<{ user?: User; error?: any }> {
    try {
        // First, update auth user metadata to include display_name
        const { error: authUpdateError } = await supabase.auth.updateUser({
            data: {
                display_name: userData.name,
                name: userData.name,
                role: userData.role
            }
        });

        if (authUpdateError) {
            console.warn('Could not update auth user metadata:', authUpdateError.message);
        }

        // Then create user profile in our users table
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userData.email,
                name: userData.name,
                role: userData.role,
            })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create user profile:', createError);
            return { error: createError };
        }

        return { user: newUser };
    } catch (error) {
        console.error('User profile creation error:', error);
        return { error };
    }
}

/**
 * Update user profile and sync with auth metadata
 */
export async function updateUserProfile(userId: string, updates: Partial<UserSyncData>): Promise<{ user?: User; error?: any }> {
    try {
        // First, update the users table
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('Failed to update user profile:', updateError);
            return { error: updateError };
        }

        // If name was updated, sync it to auth metadata
        if (updates.name) {
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: {
                    display_name: updates.name,
                    name: updates.name,
                    ...(updates.role && { role: updates.role })
                }
            });

            if (authUpdateError) {
                console.warn('Could not update auth user metadata:', authUpdateError.message);
            }
        }

        return { user: updatedUser };
    } catch (error) {
        console.error('User profile update error:', error);
        return { error };
    }
}

/**
 * Sync existing auth user with custom users table
 */
export async function syncAuthUserWithProfile(authUser: any): Promise<{ user?: User; error?: any }> {
    try {
        // Check if user profile exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        // If user exists, return it
        if (existingUser && !checkError) {
            return { user: existingUser };
        }

        // If user doesn't exist, create profile from auth metadata
        const userName = authUser.user_metadata?.name ||
            authUser.user_metadata?.display_name ||
            authUser.email?.split('@')[0] ||
            'User';
        const userRole = authUser.user_metadata?.role || 'candidate';

        return await createUserProfile(authUser.id, {
            email: authUser.email,
            name: userName,
            role: userRole
        });

    } catch (error) {
        console.error('Auth user sync error:', error);
        return { error };
    }
}

/**
 * Ensure data consistency between auth.users and custom users table
 */
export async function validateUserDataConsistency(userId: string): Promise<{ isConsistent: boolean; issues: string[] }> {
    try {
        const issues: string[] = [];

        // Get auth user data
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser || authUser.id !== userId) {
            issues.push('Auth user not found or ID mismatch');
            return { isConsistent: false, issues };
        }

        // Get custom user data
        const { data: customUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !customUser) {
            issues.push('Custom user profile not found');
            return { isConsistent: false, issues };
        }

        // Check name consistency
        const authName = authUser.user_metadata?.name || authUser.user_metadata?.display_name;
        if (authName && authName !== customUser.name) {
            issues.push(`Name mismatch: auth(${authName}) vs custom(${customUser.name})`);
        }

        // Check role consistency
        const authRole = authUser.user_metadata?.role;
        if (authRole && authRole !== customUser.role) {
            issues.push(`Role mismatch: auth(${authRole}) vs custom(${customUser.role})`);
        }

        // Check email consistency
        if (authUser.email !== customUser.email) {
            issues.push(`Email mismatch: auth(${authUser.email}) vs custom(${customUser.email})`);
        }

        return { isConsistent: issues.length === 0, issues };

    } catch (error) {
        console.error('Validation error:', error);
        return { isConsistent: false, issues: ['Validation check failed'] };
    }
}
