-- Debug script to check data consistency with comma-separated interview_artifact_ids

-- 1. Check applications table for interview_artifact_id format (including comma-separated)
SELECT 
    id,
    interview_artifact_id,
    LENGTH(interview_artifact_id) as id_length,
    CASE 
        WHEN interview_artifact_id LIKE '%,%' THEN 'Multiple IDs (comma-separated)'
        WHEN interview_artifact_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN 'Single Valid UUID'
        WHEN interview_artifact_id IS NULL THEN 'NULL'
        ELSE 'Invalid Format'
    END as id_format_check,
    -- Extract the last (most recent) interview artifact ID
    CASE 
        WHEN interview_artifact_id LIKE '%,%' THEN 
            TRIM(SUBSTRING(interview_artifact_id FROM '.*, *(.*)'))
        ELSE interview_artifact_id
    END as latest_artifact_id
FROM applications 
WHERE interview_artifact_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check for comma-separated interview_artifact_ids and their components
SELECT 
    id,
    interview_artifact_id,
    -- Count how many IDs are in the comma-separated string
    ARRAY_LENGTH(STRING_TO_ARRAY(interview_artifact_id, ','), 1) as artifact_count,
    -- Show all individual IDs
    STRING_TO_ARRAY(interview_artifact_id, ',') as all_artifact_ids,
    -- Show the latest (last) ID
    TRIM(SPLIT_PART(interview_artifact_id, ',', 
        ARRAY_LENGTH(STRING_TO_ARRAY(interview_artifact_id, ','), 1))) as latest_id
FROM applications 
WHERE interview_artifact_id IS NOT NULL 
    AND interview_artifact_id LIKE '%,%'
ORDER BY created_at DESC;

-- 3. Check interview_artifacts table structure
SELECT 
    id,
    application_id,
    status,
    completed_at,
    image_url,
    CASE 
        WHEN image_url LIKE '%,%' THEN 'Multiple Images'
        WHEN image_url IS NULL THEN 'No Images'
        ELSE 'Single Image'
    END as image_status
FROM interview_artifacts 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Validate that the latest artifact IDs from applications exist in interview_artifacts
WITH latest_artifacts AS (
    SELECT 
        id as app_id,
        TRIM(SPLIT_PART(interview_artifact_id, ',', 
            ARRAY_LENGTH(STRING_TO_ARRAY(interview_artifact_id, ','), 1))) as latest_artifact_id
    FROM applications 
    WHERE interview_artifact_id IS NOT NULL 
)
SELECT 
    la.app_id,
    la.latest_artifact_id,
    CASE 
        WHEN ia.id IS NOT NULL THEN 'Exists'
        ELSE 'Missing'
    END as artifact_status,
    ia.status,
    ia.completed_at
FROM latest_artifacts la
LEFT JOIN interview_artifacts ia ON ia.id::text = la.latest_artifact_id
ORDER BY la.app_id DESC
LIMIT 10;
