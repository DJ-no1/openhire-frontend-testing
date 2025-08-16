-- Create test data for interview system
-- Run this in your Supabase SQL Editor to set up test data

-- Create a test user (recruiter)
INSERT INTO public.users (id, email, role, name) 
VALUES (
    'rec-test-uuid-12345678901234567890',
    'test-recruiter@example.com',
    'recruiter',
    'Test Recruiter'
) ON CONFLICT (email) DO NOTHING;

-- Create a test user (candidate)
INSERT INTO public.users (id, email, role, name) 
VALUES (
    'cand-test-uuid-1234567890123456789',
    'test-candidate@example.com',
    'candidate',
    'Test Candidate'
) ON CONFLICT (email) DO NOTHING;

-- Create a test job
INSERT INTO public.jobs (id, title, recruiter_id, status, company_name, location, job_type, description) 
VALUES (
    'job-test-uuid-12345678901234567890',
    'Test Software Developer Position',
    'rec-test-uuid-12345678901234567890',
    'active',
    'Test Company',
    'Remote',
    'full-time',
    '{"role": "Software Developer", "requirements": ["JavaScript", "React", "Node.js"]}'
) ON CONFLICT (id) DO NOTHING;

-- Create the test application with your hardcoded ID
INSERT INTO public.applications (id, job_id, candidate_id, status) 
VALUES (
    '4cc1f02d-2c2f-441e-9a90-ccfda8be4ab4',
    'job-test-uuid-12345678901234567890',
    'cand-test-uuid-1234567890123456789',
    'applied'
) ON CONFLICT (id) DO NOTHING;

-- Verify the data was created
SELECT 'Applications' as table_name, count(*) as count FROM public.applications WHERE id = '4cc1f02d-2c2f-441e-9a90-ccfda8be4ab4'
UNION ALL
SELECT 'Jobs', count(*) FROM public.jobs WHERE id = 'job-test-uuid-12345678901234567890'
UNION ALL
SELECT 'Users', count(*) FROM public.users WHERE role IN ('recruiter', 'candidate');
