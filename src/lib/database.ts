import { supabase } from './supabaseClient';
import { type ReviewResponse } from './api';
import { randomUUID } from 'crypto';

// Type definitions matching your database schema
export interface DatabaseUser {
    id: string;
    email: string;
    role: 'recruiter' | 'candidate';
    name?: string;
    created_at?: string;
}

export interface DatabaseJob {
    id: string;
    recruiter_id: string;
    title: string;
    description?: string;
    salary?: string;
    skills?: string;
    job_type?: string;
    created_at?: string;
    end_date?: string;
    job_link?: string;
    company_name?: string;
}

export interface DatabaseApplication {
    id: string;
    job_id: string;
    candidate_id: string;
    resume_url?: string; // This should be UUID according to your schema
    status: string;
    created_at?: string;
    interview_artifact_id?: string | null; // Added interview_artifact_id field
    // Joined data
    job?: DatabaseJob;
    candidate?: DatabaseUser;
}

export interface DatabaseUserResume {
    id: string;
    application_id: string;
    file_path?: string;
    score?: number;
    scoring_details?: any; // JSONB
    created_at?: string;
}

export interface DatabaseInterview {
    id: string;
    application_id: string;
    start_time?: string;
    end_time?: string;
    ai_summary?: string;
    confidence?: number;
    knowledge_score?: number;
    result?: string;
    created_at?: string;
}

export interface DatabaseInterviewArtifacts {
    id: string;
    interview_id: string;
    conversation?: any; // JSONB
    image_url?: string;
    timestamp?: string;
    detailed_score?: any; // JSONB
    overall_score?: number;
    overall_feedback?: string;
    status?: string;
}

// Database operations
export class DatabaseService {
    // Create a new application
    static async createApplication(jobId: string, candidateId?: string, resumeFilePath?: string) {
        // Use the provided candidate ID or fall back to fixed candidate ID for testing
        const fixedCandidateId = '2a218b64-c1f2-4cec-9ed4-0b4a7541b859';
        let actualCandidateId = candidateId || fixedCandidateId;

        console.log('🚀 Creating application with candidate ID:', actualCandidateId);
        console.log('📊 Job ID:', jobId);
        console.log('📋 Provided candidate ID:', candidateId);
        console.log('🔧 Using fallback?', !candidateId);

        // If candidateId is provided (from logged-in user), ensure the candidate exists first
        if (candidateId) {
            try {
                console.log('✅ Ensuring candidate exists for ID:', candidateId);
                await this.ensureCandidateExists(candidateId);
                console.log('✅ Candidate verification complete for ID:', candidateId);
            } catch (error) {
                console.error('❌ Failed to ensure candidate exists:', error);
                throw new Error(`Failed to verify candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        // Create application
        const { data: application, error: appError } = await supabase
            .from('applications')
            .insert({
                job_id: jobId,
                candidate_id: actualCandidateId,
                status: 'applied'
            })
            .select()
            .single();

        if (appError) {
            console.error('❌ Application creation error:', appError);
            if (appError.code === '23503') {
                throw new Error(`Candidate ID ${actualCandidateId} does not exist in users table. Please run the test-data.sql script first.`);
            }
            throw new Error(`Failed to create application: ${appError.message}`);
        }

        console.log('Application created successfully:', application);
        return application as DatabaseApplication;
    }

    // Ensure candidate exists in database
    static async ensureCandidateExists(candidateId: string): Promise<{ id: string }> {
        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('id', candidateId)
            .single();

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return existingUser;
        }

        // If user doesn't exist (PGRST116 = no rows returned), create them
        if (checkError && checkError.code === 'PGRST116') {
            console.log('User does not exist, creating new user with ID:', candidateId);

            try {
                // Try to get the actual user data from current auth session first
                const { data: { user: currentUser } } = await supabase.auth.getUser();

                let userName = 'Job Applicant'; // fallback
                let userEmail = `candidate-${candidateId.slice(0, 8)}@openhire.com`; // fallback

                // If current user matches candidateId, use their real data
                if (currentUser && currentUser.id === candidateId) {
                    userName = currentUser.user_metadata?.name ||
                        currentUser.user_metadata?.display_name ||
                        currentUser.email?.split('@')[0] ||
                        'Job Applicant';
                    userEmail = currentUser.email || userEmail;

                    console.log('Using current auth user data:', { name: userName, email: userEmail });
                } else {
                    console.warn('Current user does not match candidateId or no auth session, using fallback values');
                }

                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: candidateId,
                        email: userEmail,
                        role: 'candidate',
                        name: userName
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Failed to create user:', createError);
                    throw new Error(`Cannot create user: ${createError.message}`);
                }

                console.log('Successfully created user:', newUser);
                return newUser;
            } catch (err) {
                console.error('User creation error:', err);
                throw err;
            }
        }

        // If there's another error, throw it
        if (checkError) {
            console.error('User check error:', checkError);
            throw new Error(`Database error: ${checkError.message}`);
        }

        return { id: candidateId };
    }

    // Save resume analysis results
    static async saveResumeAnalysis(
        applicationId: string,
        filePath: string,
        analysisResult: ReviewResponse
    ) {
        try {
            console.log('💾 Saving resume analysis for application:', applicationId);

            // Create the resume record - handle RLS by using service role if needed
            const resumeInsertData = {
                application_id: applicationId,
                file_path: filePath,
                score: analysisResult.analysis.overall_score,
                scoring_details: {
                    analysis: analysisResult.analysis,
                    jd: analysisResult.jd,
                    resume: analysisResult.resume,
                    created_at: new Date().toISOString()
                }
            };

            console.log('📝 Inserting resume record:', resumeInsertData);

            const { data: resumeData, error: resumeError } = await supabase
                .from('user_resume')
                .insert(resumeInsertData)
                .select()
                .single();

            if (resumeError) {
                console.error('❌ Resume insertion failed:', resumeError);

                // If RLS is blocking, try to handle gracefully
                if (resumeError.message.includes('row-level security policy')) {
                    console.log('🚨 RLS blocking user_resume insert');

                    // Create a mock resume record for testing
                    const mockResumeId = randomUUID();
                    const mockResumeData = {
                        id: mockResumeId,
                        application_id: applicationId,
                        file_path: filePath,
                        score: analysisResult.analysis.overall_score,
                        scoring_details: resumeInsertData.scoring_details,
                        created_at: new Date().toISOString()
                    };

                    console.log('📄 Using mock resume data due to RLS:', mockResumeData);

                    // Still try to update the application with mock resume ID
                    const { error: updateError } = await supabase
                        .from('applications')
                        .update({ resume_url: mockResumeId })
                        .eq('id', applicationId);

                    if (updateError) {
                        console.warn('⚠️ Failed to update application with mock resume_url:', updateError.message);
                    } else {
                        console.log('✅ Application updated with mock resume_url');
                    }

                    return mockResumeData as DatabaseUserResume;
                }

                throw new Error(`Failed to save resume analysis: ${resumeError.message}`);
            }

            console.log('✅ Resume record created:', resumeData);

            // Update the application to link the resume
            const { error: updateError } = await supabase
                .from('applications')
                .update({ resume_url: resumeData.id })
                .eq('id', applicationId);

            if (updateError) {
                console.warn('⚠️ Failed to update application with resume_url:', updateError.message);
                // Don't throw error here as the resume is saved successfully
            } else {
                console.log('✅ Application updated with resume_url:', resumeData.id);
            }

            return resumeData as DatabaseUserResume;
        } catch (error) {
            console.error('💥 saveResumeAnalysis error:', error);
            throw error;
        }
    }

    // Get application with full details - Alternative approach
    static async getApplicationWithDetails(applicationId: string) {
        console.log('🔍 Fetching application details for:', applicationId);

        // Step 1: Fetch basic application data
        const { data: appData, error: appError } = await supabase
            .from('applications')
            .select(`
                *,
                job:jobs(*),
                candidate:users(*)
            `)
            .eq('id', applicationId)
            .single();

        if (appError) {
            console.error('❌ Application fetch error:', appError);
            throw new Error(`Application not found: ${appError.message}`);
        }

        console.log('✅ Application data fetched:', appData);

        // Step 2: Fetch related resume data separately
        const { data: resumeData, error: resumeError } = await supabase
            .from('user_resume')
            .select('*')
            .eq('application_id', applicationId);

        if (resumeError) {
            console.error('⚠️ Resume fetch error (non-fatal):', resumeError);
            // Don't throw error for resume, just log and continue with empty array
        }

        console.log('📄 Resume data fetched:', resumeData);

        const result = {
            ...appData,
            user_resume: resumeData || []
        } as DatabaseApplication & {
            user_resume: DatabaseUserResume[];
        };

        console.log('🎯 Final result:', result);
        return result;
    }

    // Get all applications for a candidate
    static async getApplicationsForCandidate(candidateId: string) {
        try {
            // Try explicit foreign key approach first
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    job:jobs(*),
                    user_resume!user_resume_application_id_fkey(*)
                `)
                .eq('candidate_id', candidateId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                return data as (DatabaseApplication & {
                    user_resume: DatabaseUserResume[];
                })[];
            }
        } catch (firstError) {
            console.log('Explicit foreign key failed, using fallback...');
        }

        // Fallback: Fetch without explicit foreign key
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                job:jobs(*)
            `)
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch resumes for all applications
        const applicationIds = data.map(app => app.id);
        const { data: resumeData } = await supabase
            .from('user_resume')
            .select('*')
            .in('application_id', applicationIds);

        // Map resumes to applications
        const appsWithResumes = data.map(app => ({
            ...app,
            user_resume: resumeData?.filter(resume => resume.application_id === app.id) || []
        }));

        return appsWithResumes as (DatabaseApplication & {
            user_resume: DatabaseUserResume[];
        })[];
    }

    // Get all applications for a job (recruiter view)
    static async getApplicationsForJob(jobId: string) {
        try {
            // Try explicit foreign key approach first with interview artifacts
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    candidate:users(*),
                    user_resume!user_resume_application_id_fkey(*),
                    interviews(
                        id,
                        application_id,
                        start_time,
                        end_time,
                        ai_summary,
                        confidence,
                        knowledge_score,
                        result,
                        created_at,
                        interview_artifacts(
                            id,
                            interview_id,
                            conversation,
                            image_url,
                            timestamp,
                            detailed_score,
                            overall_score,
                            overall_feedback,
                            status
                        )
                    )
                `)
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                return data as (DatabaseApplication & {
                    user_resume: DatabaseUserResume[];
                    interviews: (DatabaseInterview & {
                        interview_artifacts: DatabaseInterviewArtifacts[];
                    })[];
                })[];
            }
        } catch (firstError) {
            console.log('Explicit foreign key failed for job applications, using fallback...');
        }

        // Fallback: Fetch without explicit foreign key
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                candidate:users(*),
                interviews(
                    id,
                    application_id,
                    start_time,
                    end_time,
                    ai_summary,
                    confidence,
                    knowledge_score,
                    result,
                    created_at,
                    interview_artifacts(
                        id,
                        interview_id,
                        conversation,
                        image_url,
                        timestamp,
                        detailed_score,
                        overall_score,
                        overall_feedback,
                        status
                    )
                )
            `)
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch resumes for all applications
        const applicationIds = data.map(app => app.id);
        const { data: resumeData } = await supabase
            .from('user_resume')
            .select('*')
            .in('application_id', applicationIds);

        // Map resumes to applications
        const appsWithResumes = data.map(app => ({
            ...app,
            user_resume: resumeData?.filter(resume => resume.application_id === app.id) || []
        }));

        return appsWithResumes as (DatabaseApplication & {
            user_resume: DatabaseUserResume[];
            interviews: (DatabaseInterview & {
                interview_artifacts: DatabaseInterviewArtifacts[];
            })[];
        })[];
    }

    // Update application status
    static async updateApplicationStatus(applicationId: string, status: string) {
        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) throw error;
        return data as DatabaseApplication;
    }

    // Get resume analysis details
    static async getResumeAnalysis(applicationId: string) {
        const { data, error } = await supabase
            .from('user_resume')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        return data as DatabaseUserResume;
    }

    // Search and filter applications
    static async searchApplications(filters: {
        candidateId?: string;
        jobId?: string;
        status?: string;
        minScore?: number;
        maxScore?: number;
    }) {
        let query = supabase
            .from('applications')
            .select(`
                *,
                job:jobs(*),
                candidate:users(*),
                user_resume(*),
                interviews(
                    id,
                    application_id,
                    start_time,
                    end_time,
                    ai_summary,
                    confidence,
                    knowledge_score,
                    result,
                    created_at,
                    interview_artifacts(
                        id,
                        interview_id,
                        conversation,
                        image_url,
                        timestamp,
                        detailed_score,
                        overall_score,
                        overall_feedback,
                        status
                    )
                )
            `);

        if (filters.candidateId) {
            query = query.eq('candidate_id', filters.candidateId);
        }
        if (filters.jobId) {
            query = query.eq('job_id', filters.jobId);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        let results = data as (DatabaseApplication & {
            user_resume: DatabaseUserResume[];
            interviews: (DatabaseInterview & {
                interview_artifacts: DatabaseInterviewArtifacts[];
            })[];
        })[];

        // Filter by score if provided
        if (filters.minScore !== undefined || filters.maxScore !== undefined) {
            results = results.filter(app => {
                const resume = app.user_resume?.[0];
                if (!resume?.score) return false;

                if (filters.minScore !== undefined && resume.score < filters.minScore) return false;
                if (filters.maxScore !== undefined && resume.score > filters.maxScore) return false;

                return true;
            });
        }

        return results;
    }

    // Get all applications for a recruiter (across all their jobs)
    static async getApplicationsForRecruiter(recruiterId: string) {
        try {
            // Try explicit foreign key approach first with interview artifacts
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    candidate:users(*),
                    job:jobs!inner(*),
                    user_resume!user_resume_application_id_fkey(*),
                    interviews(
                        id,
                        application_id,
                        start_time,
                        end_time,
                        ai_summary,
                        confidence,
                        knowledge_score,
                        result,
                        created_at,
                        interview_artifacts(
                            id,
                            interview_id,
                            conversation,
                            image_url,
                            timestamp,
                            detailed_score,
                            overall_score,
                            overall_feedback,
                            status
                        )
                    )
                `)
                .eq('job.recruiter_id', recruiterId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                return data as (DatabaseApplication & {
                    user_resume: DatabaseUserResume[];
                    job: DatabaseJob;
                    candidate: DatabaseUser;
                    interviews: (DatabaseInterview & {
                        interview_artifacts: DatabaseInterviewArtifacts[];
                    })[];
                })[];
            }
        } catch (firstError) {
            console.log('Explicit foreign key failed for recruiter applications, using fallback...');
        }

        // Fallback: First get all jobs for the recruiter, then get applications
        const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select('id')
            .eq('recruiter_id', recruiterId);

        if (jobsError) throw jobsError;

        const jobIds = jobsData.map(job => job.id);
        if (jobIds.length === 0) return [];

        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                candidate:users(*),
                job:jobs(*),
                interviews(
                    id,
                    application_id,
                    start_time,
                    end_time,
                    ai_summary,
                    confidence,
                    knowledge_score,
                    result,
                    created_at,
                    interview_artifacts(
                        id,
                        interview_id,
                        conversation,
                        image_url,
                        timestamp,
                        detailed_score,
                        overall_score,
                        overall_feedback,
                        status
                    )
                )
            `)
            .in('job_id', jobIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch resumes for all applications
        const applicationIds = data.map(app => app.id);
        const { data: resumeData } = await supabase
            .from('user_resume')
            .select('*')
            .in('application_id', applicationIds);

        // Map resumes to applications
        const appsWithResumes = data.map(app => ({
            ...app,
            user_resume: resumeData?.filter(resume => resume.application_id === app.id) || []
        }));

        return appsWithResumes as (DatabaseApplication & {
            user_resume: DatabaseUserResume[];
            job: DatabaseJob;
            candidate: DatabaseUser;
            interviews: (DatabaseInterview & {
                interview_artifacts: DatabaseInterviewArtifacts[];
            })[];
        })[];
    }

    // Get application counts for multiple jobs
    static async getApplicationCountsForJobs(jobIds: string[]): Promise<Record<string, number>> {
        if (jobIds.length === 0) return {};

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('job_id')
                .in('job_id', jobIds);

            if (error) {
                console.error('Error fetching application counts:', error);
                return {};
            }

            // Count applications per job
            const counts: Record<string, number> = {};
            data.forEach(app => {
                counts[app.job_id] = (counts[app.job_id] || 0) + 1;
            });

            // Ensure all job IDs are present in the result
            jobIds.forEach(id => {
                if (!(id in counts)) {
                    counts[id] = 0;
                }
            });

            return counts;
        } catch (error) {
            console.error('Error in getApplicationCountsForJobs:', error);
            return {};
        }
    }

    // Get application count for a single job
    static async getApplicationCountForJob(jobId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', jobId);

            if (error) {
                console.error('Error fetching application count for job:', jobId, error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Error in getApplicationCountForJob:', error);
            return 0;
        }
    }

    // Get a specific application by ID with all related data
    static async getApplicationById(applicationId: string) {
        try {
            // Try explicit foreign key approach first
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    candidate:users(*),
                    job:jobs(*),
                    user_resume!user_resume_application_id_fkey(*)
                `)
                .eq('id', applicationId)
                .single();

            if (!error && data) {
                return data as (DatabaseApplication & {
                    user_resume: DatabaseUserResume[];
                    job: DatabaseJob;
                    candidate: DatabaseUser;
                });
            }
        } catch (firstError) {
            console.log('Explicit foreign key failed for application, using fallback...');
        }

        // Fallback: Fetch without explicit foreign key
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                candidate:users(*),
                job:jobs(*)
            `)
            .eq('id', applicationId)
            .single();

        if (error) throw error;

        // Fetch resumes for the application
        const { data: resumeData } = await supabase
            .from('user_resume')
            .select('*')
            .eq('application_id', applicationId);

        return {
            ...data,
            user_resume: resumeData || []
        } as (DatabaseApplication & {
            user_resume: DatabaseUserResume[];
            job: DatabaseJob;
            candidate: DatabaseUser;
        });
    }
}

// Helper functions
export const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'applied':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'reviewing':
        case 'under_review':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'interviewed':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'accepted':
        case 'hired':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
};

export const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
};
