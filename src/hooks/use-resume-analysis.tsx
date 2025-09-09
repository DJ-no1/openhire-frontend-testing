'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface ResumeAnalysisData {
    overall_score?: number;
    scoring_details?: any;
    file_path?: string;
    created_at?: string;
}

export interface ApplicationData {
    id: string;
    candidate_name?: string;
    candidate_email?: string;
    job_title?: string;
    status?: string;
    created_at?: string;
    resume_data?: ResumeAnalysisData;
    job_data?: any;
}

export function useResumeAnalysis(applicationId: string) {
    const [data, setData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setLoading(false);
            return;
        }

        const fetchResumeAnalysis = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔍 Fetching resume analysis for application:', applicationId);

                // Step 1: Fetch application with basic details
                const { data: appData, error: appError } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        status,
                        created_at,
                        candidate_id,
                        job_id,
                        resume_url,
                        users!applications_candidate_id_fkey (
                            name,
                            email
                        ),
                        jobs (
                            title,
                            skills,
                            salary,
                            company_name,
                            location
                        )
                    `)
                    .eq('id', applicationId)
                    .single();

                if (appError) {
                    console.error('❌ Error fetching application:', appError);
                    throw new Error(`Failed to fetch application: ${appError.message}`);
                }

                if (!appData) {
                    throw new Error('Application not found');
                }

                console.log('✅ Application data fetched:', {
                    id: appData.id,
                    resume_url: appData.resume_url,
                    candidate: (appData.users as any)?.name,
                    job: (appData.jobs as any)?.title
                });

                // Step 2: Fetch resume data if resume_url exists
                let resumeData = null;
                if (appData.resume_url) {
                    console.log('📄 Fetching resume data for ID:', appData.resume_url);

                    const { data: resumeResult, error: resumeError } = await supabase
                        .from('user_resume')
                        .select('id, file_path, score, scoring_details, created_at')
                        .eq('id', appData.resume_url)
                        .single();

                    if (resumeError) {
                        console.warn('⚠️ Resume data not found:', resumeError.message);
                        // Don't throw error - resume might not exist yet
                    } else if (resumeResult) {
                        resumeData = resumeResult;
                        console.log('✅ Resume data fetched:', {
                            id: resumeResult.id,
                            score: resumeResult.score,
                            has_scoring_details: !!resumeResult.scoring_details
                        });
                    }
                } else {
                    console.log('📝 No resume_url found in application');
                }

                // Step 3: Structure the data for the component
                const structuredData: ApplicationData = {
                    id: appData.id,
                    candidate_name: (appData.users as any)?.name || 'Unknown Candidate',
                    candidate_email: (appData.users as any)?.email || 'No email',
                    job_title: (appData.jobs as any)?.title || 'Unknown Position',
                    status: appData.status,
                    created_at: appData.created_at,
                    resume_data: resumeData || undefined,
                    job_data: appData.jobs
                };

                setData(structuredData);
                console.log('🎉 Resume analysis data loaded successfully');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('💥 Error in fetchResumeAnalysis:', errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchResumeAnalysis();
    }, [applicationId]);

    return { data, loading, error, refetch: () => setLoading(true) };
}
