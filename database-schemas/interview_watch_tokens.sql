-- Create interview_watch_tokens table for secure recruiter access
CREATE TABLE public.interview_watch_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL,
  recruiter_id uuid NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT interview_watch_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT interview_watch_tokens_token_unique UNIQUE (token),
  CONSTRAINT interview_watch_tokens_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE,
  CONSTRAINT interview_watch_tokens_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for fast token lookups
CREATE INDEX idx_interview_watch_tokens_token ON public.interview_watch_tokens(token);
CREATE INDEX idx_interview_watch_tokens_interview_id ON public.interview_watch_tokens(interview_id);
CREATE INDEX idx_interview_watch_tokens_expires_at ON public.interview_watch_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.interview_watch_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recruiters can manage their own watch tokens" ON public.interview_watch_tokens
  FOR ALL USING (recruiter_id = auth.uid());

-- Comments
COMMENT ON TABLE public.interview_watch_tokens IS 'Secure tokens for recruiters to watch live interviews';
COMMENT ON COLUMN public.interview_watch_tokens.token IS 'Unique token for accessing interview watch stream';
COMMENT ON COLUMN public.interview_watch_tokens.expires_at IS 'Token expiration timestamp (24 hours by default)';
