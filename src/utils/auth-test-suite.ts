import { supabase } from '../lib/supabaseClient';
import { validateUserDataConsistency } from '../lib/user-sync';

/**
 * Test utility to verify that user account creation and data synchronization works correctly
 */

export interface TestResult {
    success: boolean;
    message: string;
    details?: any;
}

export class AuthTestSuite {
    /**
     * Test candidate account creation with name and role synchronization
     */
    static async testCandidateSignup(email: string, password: string, name: string): Promise<TestResult> {
        try {
            console.log('Testing candidate signup...');

            // Attempt to sign up
            const { data: authData, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'candidate',
                        display_name: name
                    }
                }
            });

            if (signupError) {
                return { success: false, message: `Signup failed: ${signupError.message}` };
            }

            if (!authData.user) {
                return { success: false, message: 'No user returned from signup' };
            }

            // Update display_name in auth
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    display_name: name,
                    name: name,
                    role: 'candidate'
                }
            });

            if (updateError) {
                console.warn('Display name update warning:', updateError.message);
            }

            // Create user profile
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    name,
                    role: 'candidate',
                })
                .select()
                .single();

            if (profileError) {
                return { success: false, message: `Profile creation failed: ${profileError.message}` };
            }

            // Validate consistency
            const validation = await validateUserDataConsistency(authData.user.id);

            return {
                success: validation.isConsistent,
                message: validation.isConsistent
                    ? 'Candidate signup test passed - all data synchronized correctly'
                    : `Data inconsistency found: ${validation.issues.join(', ')}`,
                details: { userId: authData.user.id, userData, validation }
            };

        } catch (error) {
            return { success: false, message: `Test error: ${error}` };
        }
    }

    /**
     * Test recruiter account creation with name and role synchronization
     */
    static async testRecruiterSignup(email: string, password: string, name: string): Promise<TestResult> {
        try {
            console.log('Testing recruiter signup...');

            // Attempt to sign up
            const { data: authData, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'recruiter',
                        display_name: name
                    }
                }
            });

            if (signupError) {
                return { success: false, message: `Signup failed: ${signupError.message}` };
            }

            if (!authData.user) {
                return { success: false, message: 'No user returned from signup' };
            }

            // Update display_name in auth
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    display_name: name,
                    name: name,
                    role: 'recruiter'
                }
            });

            if (updateError) {
                console.warn('Display name update warning:', updateError.message);
            }

            // Create user profile
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    name,
                    role: 'recruiter',
                })
                .select()
                .single();

            if (profileError) {
                return { success: false, message: `Profile creation failed: ${profileError.message}` };
            }

            // Validate consistency
            const validation = await validateUserDataConsistency(authData.user.id);

            return {
                success: validation.isConsistent,
                message: validation.isConsistent
                    ? 'Recruiter signup test passed - all data synchronized correctly'
                    : `Data inconsistency found: ${validation.issues.join(', ')}`,
                details: { userId: authData.user.id, userData, validation }
            };

        } catch (error) {
            return { success: false, message: `Test error: ${error}` };
        }
    }

    /**
     * Test data consistency for existing user
     */
    static async testUserDataConsistency(userId: string): Promise<TestResult> {
        try {
            const validation = await validateUserDataConsistency(userId);

            return {
                success: validation.isConsistent,
                message: validation.isConsistent
                    ? 'User data is consistent between auth and users table'
                    : `Data inconsistency found: ${validation.issues.join(', ')}`,
                details: validation
            };

        } catch (error) {
            return { success: false, message: `Validation error: ${error}` };
        }
    }

    /**
     * Run comprehensive test suite
     */
    static async runFullTestSuite(): Promise<{ results: TestResult[]; summary: string }> {
        const results: TestResult[] = [];
        const timestamp = Date.now();

        // Test candidate signup
        const candidateEmail = `test-candidate-${timestamp}@openhire-test.com`;
        const candidateResult = await this.testCandidateSignup(candidateEmail, 'test123456', 'Test Candidate User');
        results.push(candidateResult);

        // Test recruiter signup
        const recruiterEmail = `test-recruiter-${timestamp}@openhire-test.com`;
        const recruiterResult = await this.testRecruiterSignup(recruiterEmail, 'test123456', 'Test Recruiter User');
        results.push(recruiterResult);

        const successCount = results.filter(r => r.success).length;
        const summary = `Test Suite Complete: ${successCount}/${results.length} tests passed`;

        return { results, summary };
    }
}
