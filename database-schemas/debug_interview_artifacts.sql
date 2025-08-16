-- Debug script to check and create interview_artifacts table structure
-- Run this in your Supabase SQL editor to ensure the table exists with the correct structure

-- First, check if the table exists and show its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'interview_artifacts' 
ORDER BY ordinal_position;

-- If the table doesn't exist or has wrong structure, create/recreate it
-- WARNING: This will drop existing data if the table exists
-- Comment out the DROP line if you want to preserve data

-- DROP TABLE IF EXISTS public.interview_artifacts CASCADE;

-- Create the interview_artifacts table with the correct structure
CREATE TABLE IF NOT EXISTS public.interview_artifacts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id text NOT NULL,
    interview_type text DEFAULT 'ai_interview',
    status text DEFAULT 'in_progress',
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    completed_at timestamp with time zone,
    duration_minutes integer DEFAULT 0,
    total_questions integer DEFAULT 0,
    answered_questions integer DEFAULT 0,
    ai_assessment jsonb DEFAULT '{}'::jsonb,
    conversation_log jsonb DEFAULT '[]'::jsonb,
    image_url text,
    audio_url text,
    video_url text,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT interview_artifacts_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_application_id ON public.interview_artifacts(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_status ON public.interview_artifacts(status);
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_created_at ON public.interview_artifacts(created_at);

-- Enable RLS
ALTER TABLE public.interview_artifacts ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust based on your auth requirements)
DROP POLICY IF EXISTS "Allow all operations on interview_artifacts" ON public.interview_artifacts;
CREATE POLICY "Allow all operations on interview_artifacts" ON public.interview_artifacts
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_interview_artifacts_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_interview_artifacts_updated_at_trigger ON public.interview_artifacts;
CREATE TRIGGER update_interview_artifacts_updated_at_trigger
    BEFORE UPDATE ON public.interview_artifacts
    FOR EACH ROW EXECUTE FUNCTION public.update_interview_artifacts_updated_at();

-- Test query to verify the table is working
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
FROM public.interview_artifacts;

-- Insert a test record (optional - remove if you don't want test data)
-- INSERT INTO public.interview_artifacts (
--     application_id,
--     status,
--     total_questions,
--     answered_questions,
--     duration_minutes,
--     conversation_log,
--     ai_assessment
-- ) VALUES (
--     'test-app-id-123',
--     'completed',
--     10,
--     8,
--     25,
--     '[{"type": "system", "content": "Welcome to the interview", "timestamp": "2025-01-16T10:00:00Z"}]'::jsonb,
--     '{"overall_score": 85, "recommendation": "Good candidate"}'::jsonb
-- );

COMMENT ON TABLE public.interview_artifacts IS 'Stores interview artifacts, conversation logs, and AI assessments';
