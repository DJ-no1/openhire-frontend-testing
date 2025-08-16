-- Updated interview_artifacts table to match the expected structure in the interview result page
-- This should be run if the table doesn't exist with the correct columns

-- Drop existing table if it exists (use with caution in production)
-- DROP TABLE IF EXISTS public.interview_artifacts CASCADE;

-- Create the updated interview_artifacts table
CREATE TABLE IF NOT EXISTS public.interview_artifacts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id text NOT NULL,  -- Direct reference to application ID
    interview_type text DEFAULT 'ai_interview',
    status text DEFAULT 'in_progress',
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    completed_at timestamp with time zone,
    duration_minutes integer DEFAULT 0,
    total_questions integer DEFAULT 0,
    answered_questions integer DEFAULT 0,
    ai_assessment jsonb DEFAULT '{}'::jsonb,
    conversation_log jsonb DEFAULT '[]'::jsonb,
    image_url text,  -- Comma-separated URLs of captured images
    audio_url text,  -- URL to audio recording (if available)
    video_url text,  -- URL to video recording (if available)
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT interview_artifacts_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_application_id ON public.interview_artifacts(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_created_at ON public.interview_artifacts(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_artifacts_status ON public.interview_artifacts(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.interview_artifacts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for now (adjust based on your auth requirements)
DROP POLICY IF EXISTS "Allow all operations on interview_artifacts" ON public.interview_artifacts;
CREATE POLICY "Allow all operations on interview_artifacts" ON public.interview_artifacts
  FOR ALL USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_interview_artifacts_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_interview_artifacts_updated_at_trigger ON public.interview_artifacts;
CREATE TRIGGER update_interview_artifacts_updated_at_trigger
    BEFORE UPDATE ON public.interview_artifacts
    FOR EACH ROW EXECUTE FUNCTION public.update_interview_artifacts_updated_at();

-- Comments
COMMENT ON TABLE public.interview_artifacts IS 'Interview artifacts including conversation logs, images, AI assessments, and performance metrics';
COMMENT ON COLUMN public.interview_artifacts.application_id IS 'Reference to the application ID being interviewed';
COMMENT ON COLUMN public.interview_artifacts.image_url IS 'Comma-separated URLs of images captured during the interview';
COMMENT ON COLUMN public.interview_artifacts.ai_assessment IS 'AI-generated assessment and scoring of the interview';
COMMENT ON COLUMN public.interview_artifacts.conversation_log IS 'Full conversation log between AI and candidate';
COMMENT ON COLUMN public.interview_artifacts.performance_metrics IS 'Various performance metrics and statistics';
