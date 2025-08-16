-- Create the pictures bucket in Supabase Storage
-- Run this in your Supabase SQL Editor

-- First, create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'pictures', 
    'pictures', 
    true, 
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies to allow public access (adjust based on your needs)
CREATE POLICY "Allow public uploads to pictures bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pictures');

CREATE POLICY "Allow public reads from pictures bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'pictures');

CREATE POLICY "Allow public updates to pictures bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pictures');

-- Verify the bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'pictures';
