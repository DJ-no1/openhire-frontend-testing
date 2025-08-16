-- Create the main interviews table
CREATE TABLE public.interviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id text NOT NULL,
    start_time timestamp with time zone DEFAULT timezone('utc'::text, now()),
    end_time timestamp with time zone,
    ai_summary text,
    confidence numeric(5,2),
    knowledge_score numeric(5,2),
    result text DEFAULT 'in_progress',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT interviews_pkey PRIMARY KEY (id)
);

-- Create the interview_artifacts table
CREATE TABLE public.interview_artifacts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    interview_id uuid NOT NULL,
    timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
    status text DEFAULT 'active',
    image_url text DEFAULT '',
    conversation jsonb DEFAULT '[]'::jsonb,
    detailed_score jsonb,
    overall_score numeric(5,2),
    overall_feedback text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT interview_artifacts_pkey PRIMARY KEY (id),
    CONSTRAINT interview_artifacts_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_created_at ON public.interviews(created_at);
CREATE INDEX idx_interview_artifacts_interview_id ON public.interview_artifacts(interview_id);
CREATE INDEX idx_interview_artifacts_timestamp ON public.interview_artifacts(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_artifacts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on interviews" ON public.interviews
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on interview_artifacts" ON public.interview_artifacts
  FOR ALL USING (true);

-- Comments
COMMENT ON TABLE public.interviews IS 'Main interviews table storing interview sessions';
COMMENT ON TABLE public.interview_artifacts IS 'Interview artifacts including conversation, images, and detailed scores';
COMMENT ON COLUMN public.interviews.application_id IS 'Reference to the job application';
COMMENT ON COLUMN public.interviews.result IS 'Interview result: in_progress, completed, cancelled';
COMMENT ON COLUMN public.interview_artifacts.conversation IS 'JSON array of interview messages';
COMMENT ON COLUMN public.interview_artifacts.detailed_score IS 'Complete assessment object from AI';
