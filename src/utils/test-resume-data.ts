/**
 * Database Testing Script for Resume Analysis
 * 
 * This script helps debug the Supabase connection and data structure
 * for the resume analysis tab component.
 * 
 * Usage: Run this in the browser console on the resume tab page
 * or add it as a temporary debug component.
 */

import { createClient } from '@/lib/supabase/client';

export async function testResumeDataFetching(applicationId: string) {
    console.log('🧪 Starting Resume Data Test for Application:', applicationId);

    const supabase = createClient();

    try {
        // Test 1: Check if we can connect to Supabase
        console.log('📡 Testing Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('applications')
            .select('count')
            .limit(1);

        if (connectionError) {
            console.error('❌ Supabase connection failed:', connectionError);
            return { success: false, error: 'Connection failed', details: connectionError };
        }

        console.log('✅ Supabase connection successful');

        // Test 2: Fetch application data
        console.log('📋 Testing application data fetch...');
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
          location,
          description
        )
      `)
            .eq('id', applicationId)
            .single();

        if (appError) {
            console.error('❌ Application fetch failed:', appError);
            return { success: false, error: 'Application fetch failed', details: appError };
        }

        console.log('✅ Application data:', appData);

        // Test 3: Fetch resume data using application_id
        console.log('📄 Testing resume data fetch (method 1: application_id)...');
        const { data: resumeData1, error: resumeError1 } = await supabase
            .from('user_resume')
            .select('*')
            .eq('application_id', applicationId);

        console.log('📄 Resume data (application_id method):', { data: resumeData1, error: resumeError1 });

        // Test 4: Fetch resume data using resume_url from applications
        if (appData.resume_url) {
            console.log('📄 Testing resume data fetch (method 2: resume_url)...');
            const { data: resumeData2, error: resumeError2 } = await supabase
                .from('user_resume')
                .select('*')
                .eq('id', appData.resume_url);

            console.log('📄 Resume data (resume_url method):', { data: resumeData2, error: resumeError2 });
        }

        // Test 5: Check what's in the user_resume table
        console.log('🔍 Checking all resume records for debugging...');
        const { data: allResumes, error: allResumesError } = await supabase
            .from('user_resume')
            .select('id, application_id, file_path, score, created_at')
            .limit(10);

        console.log('📚 All resume records (sample):', { data: allResumes, error: allResumesError });

        // Test 6: Check applications table structure
        console.log('🔍 Checking application records...');
        const { data: allApps, error: allAppsError } = await supabase
            .from('applications')
            .select('id, resume_url, candidate_id, job_id')
            .limit(5);

        console.log('📚 Application records (sample):', { data: allApps, error: allAppsError });

        return {
            success: true,
            data: {
                application: appData,
                resumeByApplicationId: resumeData1,
                resumeByResumeUrl: appData.resume_url ? 'Check console for results' : 'No resume_url',
                allResumes: allResumes?.slice(0, 3), // Show first 3 for brevity
            }
        };

    } catch (error) {
        console.error('💥 Unexpected error during testing:', error);
        return { success: false, error: 'Unexpected error', details: error };
    }
}

// Example usage:
// testResumeDataFetching('your-application-id-here').then(console.log);

export default testResumeDataFetching;
