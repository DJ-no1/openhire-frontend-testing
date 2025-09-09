import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ResumeData {
    id: string;
    file_path: string | null;
    score: number | null;
    scoring_details: any; // This contains the full analysis object with jd, resume, and analysis
    created_at: string;
}

interface ApplicationData {
    id: string;
    status: string;
    created_at: string;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    job_data: any;
    resume_data: ResumeData | null;
    // Add processed analysis data for easier component access
    analysis: {
        dimension_breakdown?: any;
        risk_flags?: any[];
        hard_filter_failures?: any[];
    } | null;
}

// Helper function to extract analysis data from the complex structure
function extractAnalysisData(scoringDetails: any) {
    console.log('🔍 Extracting analysis data from scoring_details:', scoringDetails);

    // The scoring_details structure is:
    // { jd: "...", resume: "...", analysis: { actual scoring data }, created_at: "..." }
    if (scoringDetails && typeof scoringDetails === 'object') {
        if (scoringDetails.analysis) {
            console.log('✅ Found analysis data in scoring_details.analysis');
            return scoringDetails.analysis;
        } else if (scoringDetails.dimension_breakdown) {
            // Fallback: if it's already the analysis object directly
            console.log('✅ Found analysis data directly in scoring_details');
            return scoringDetails;
        }
    }

    console.log('❌ No valid analysis data found');
    return null;
}

export function useResumeData(applicationId: string | null) {
    const [data, setData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setLoading(false);
            setError('No application ID provided');
            return;
        }

        const fetchResumeData = async () => {
            try {
                setLoading(true);
                setError(null);

                const supabase = createClient();

                console.log('🔍 Fetching resume data for application:', applicationId);

                // Query 1: Get application details with user and job data
                const { data: applicationData, error: appError } = await supabase
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
              location,
              description
            )
          `)
                    .eq('id', applicationId)
                    .single();

                if (appError) {
                    console.error('❌ Error fetching application data:', appError);
                    throw new Error(`Failed to fetch application: ${appError.message}`);
                }

                if (!applicationData) {
                    throw new Error('Application not found');
                }

                console.log('✅ Application data fetched:', applicationData);

                // Query 2: Get resume data using the application_id foreign key
                const { data: resumeData, error: resumeError } = await supabase
                    .from('user_resume')
                    .select('*')
                    .eq('application_id', applicationId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (resumeError) {
                    console.error('❌ Error fetching resume data:', resumeError);
                    // Don't throw error here - resume might not exist yet
                    console.warn('Resume data not found, but continuing with application data');
                }

                console.log('📄 Resume data fetched:', resumeData);

                // Process the scoring details to extract analysis data
                let processedAnalysis = null;
                if (resumeData && resumeData.length > 0 && resumeData[0].scoring_details) {
                    const analysisData = extractAnalysisData(resumeData[0].scoring_details);
                    if (analysisData) {
                        processedAnalysis = {
                            dimension_breakdown: analysisData.dimension_breakdown || null,
                            risk_flags: analysisData.risk_flags || [],
                            hard_filter_failures: analysisData.hard_filter_failures || []
                        };
                        console.log('✅ Successfully processed analysis data:', processedAnalysis);
                    }
                }

                // Transform the data into the expected format
                const transformedData: ApplicationData = {
                    id: applicationData.id,
                    status: applicationData.status,
                    created_at: applicationData.created_at,
                    candidate_name: (applicationData.users as any)?.name || 'Unknown Candidate',
                    candidate_email: (applicationData.users as any)?.email || 'Unknown Email',
                    job_title: (applicationData.jobs as any)?.title || 'Unknown Position',
                    job_data: applicationData.jobs,
                    resume_data: resumeData && resumeData.length > 0 ? resumeData[0] : null,
                    analysis: processedAnalysis
                };

                console.log('🎯 Transformed data ready for component:', transformedData);
                setData(transformedData);

            } catch (err) {
                console.error('💥 Critical error in useResumeData:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchResumeData();
    }, [applicationId]);

    return {
        data, loading, error, refetch: () => {
            if (applicationId) {
                setLoading(true);
                setError(null);
            }
        }
    };
}
