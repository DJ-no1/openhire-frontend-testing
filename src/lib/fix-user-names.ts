import { supabase } from './supabaseClient';

/**
 * Utility to fix existing users who have "Job Applicant" as their name
 * by syncing their real name from Supabase auth metadata
 */

export async function fixJobApplicantNames(): Promise<{ fixed: number; errors: string[] }> {
    const errors: string[] = [];
    let fixed = 0;

    try {
        // Get all users with "Job Applicant" name
        const { data: usersToFix, error: fetchError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('name', 'Job Applicant');

        if (fetchError) {
            errors.push(`Failed to fetch users: ${fetchError.message}`);
            return { fixed, errors };
        }

        if (!usersToFix || usersToFix.length === 0) {
            console.log('No users with "Job Applicant" name found');
            return { fixed, errors };
        }

        console.log(`Found ${usersToFix.length} users with "Job Applicant" name`);

        // Process each user
        for (const user of usersToFix) {
            try {
                // Try to get current auth user if this is the logged-in user
                const { data: { user: currentAuthUser } } = await supabase.auth.getUser();

                let realName = null;
                let realEmail = null;

                // If this is the current logged-in user, get their real data
                if (currentAuthUser && currentAuthUser.id === user.id) {
                    realName = currentAuthUser.user_metadata?.name ||
                        currentAuthUser.user_metadata?.display_name ||
                        currentAuthUser.email?.split('@')[0];
                    realEmail = currentAuthUser.email;

                    console.log(`Found current user data for ${user.id}:`, { realName, realEmail });
                }

                // Only update if we found real data
                if (realName && realName !== 'Job Applicant') {
                    const updateData: any = { name: realName };

                    // Also update email if we have a real one and it's not a placeholder
                    if (realEmail && !user.email.includes('candidate-')) {
                        updateData.email = realEmail;
                    }

                    const { error: updateError } = await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', user.id);

                    if (updateError) {
                        errors.push(`Failed to update user ${user.id}: ${updateError.message}`);
                    } else {
                        console.log(`✅ Updated user ${user.id}: ${realName}`);
                        fixed++;

                        // Also sync the display_name in auth metadata
                        if (currentAuthUser && currentAuthUser.id === user.id) {
                            const { error: authUpdateError } = await supabase.auth.updateUser({
                                data: {
                                    display_name: realName,
                                    name: realName
                                }
                            });

                            if (authUpdateError) {
                                console.warn(`Could not update auth metadata for ${user.id}:`, authUpdateError.message);
                            }
                        }
                    }
                } else {
                    console.log(`⚠️ Could not find real name for user ${user.id}, skipping`);
                }

            } catch (err) {
                errors.push(`Error processing user ${user.id}: ${err}`);
            }
        }

        return { fixed, errors };

    } catch (error) {
        errors.push(`General error: ${error}`);
        return { fixed, errors };
    }
}

/**
 * Fix a specific user's name by their ID
 */
export async function fixUserNameById(userId: string, newName?: string): Promise<{ success: boolean; message: string }> {
    try {
        // Get current auth user to see if this is them
        const { data: { user: currentAuthUser } } = await supabase.auth.getUser();

        let nameToUse = newName;

        // If no name provided and this is the current user, get from auth
        if (!nameToUse && currentAuthUser && currentAuthUser.id === userId) {
            nameToUse = currentAuthUser.user_metadata?.name ||
                currentAuthUser.user_metadata?.display_name ||
                currentAuthUser.email?.split('@')[0];
        }

        if (!nameToUse) {
            return { success: false, message: 'No name provided and could not extract from auth' };
        }

        // Update the users table
        const { error: updateError } = await supabase
            .from('users')
            .update({ name: nameToUse })
            .eq('id', userId);

        if (updateError) {
            return { success: false, message: `Failed to update user: ${updateError.message}` };
        }

        // If this is the current user, also update auth metadata
        if (currentAuthUser && currentAuthUser.id === userId) {
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: {
                    display_name: nameToUse,
                    name: nameToUse
                }
            });

            if (authUpdateError) {
                console.warn('Could not update auth metadata:', authUpdateError.message);
            }
        }

        return { success: true, message: `Successfully updated name to: ${nameToUse}` };

    } catch (error) {
        return { success: false, message: `Error: ${error}` };
    }
}

/**
 * Get current user's real name from auth and ensure it's synced
 */
export async function syncCurrentUserName(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return { success: false, message: 'No authenticated user found' };
        }

        const realName = authUser.user_metadata?.name ||
            authUser.user_metadata?.display_name ||
            authUser.email?.split('@')[0] ||
            'User';

        // Get current user profile
        const { data: userProfile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (fetchError) {
            return { success: false, message: `Failed to fetch user profile: ${fetchError.message}` };
        }

        // Check if name needs updating
        if (userProfile.name === realName) {
            return {
                success: true,
                message: 'Name is already synced correctly',
                data: { currentName: userProfile.name, authName: realName }
            };
        }

        // Update the name
        const { error: updateError } = await supabase
            .from('users')
            .update({ name: realName })
            .eq('id', authUser.id);

        if (updateError) {
            return { success: false, message: `Failed to update name: ${updateError.message}` };
        }

        // Also ensure auth display_name is correct
        const { error: authUpdateError } = await supabase.auth.updateUser({
            data: {
                display_name: realName,
                name: realName
            }
        });

        if (authUpdateError) {
            console.warn('Could not update auth display_name:', authUpdateError.message);
        }

        return {
            success: true,
            message: `Successfully synced name from "${userProfile.name}" to "${realName}"`,
            data: {
                previousName: userProfile.name,
                newName: realName,
                authName: realName
            }
        };

    } catch (error) {
        return { success: false, message: `Error: ${error}` };
    }
}
