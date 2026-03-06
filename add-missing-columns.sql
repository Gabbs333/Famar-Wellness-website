-- Add missing file_path column to media_items table
-- Run this in Supabase SQL Editor

-- Add the file_path column if it doesn't exist
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Make uploaded_by column nullable (if it's not already)
ALTER TABLE media_items ALTER COLUMN uploaded_by DROP NOT NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'media_items'
ORDER BY ordinal_position;
