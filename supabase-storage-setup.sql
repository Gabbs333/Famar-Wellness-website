-- Supabase Storage Configuration for CMS Media Management
-- Run this in your Supabase SQL Editor after creating the database schema

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Note: In Supabase, storage buckets are created through the Storage API or Dashboard
-- This SQL file provides the policies for existing buckets

-- Assuming buckets are created manually through:
-- 1. Supabase Dashboard → Storage → Create New Bucket
-- 2. Create these buckets:
--    - 'cms-images' for website images
--    - 'cms-documents' for PDFs and documents  
--    - 'cms-media' for other media files

-- ============================================
-- STORAGE POLICIES FOR CMS BUCKETS
-- ============================================

-- Policies for 'cms-images' bucket
-- Allow public read access for published content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for 'cms-documents' bucket  
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-documents', 'cms-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policies for 'cms-media' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-media', 'cms-media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ============================================
-- STORAGE POLICIES FOR 'cms-images' BUCKET
-- ============================================

-- Policy 1: Anyone can view images (public bucket)
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');

-- Policy 2: Authenticated users can upload images
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update their own images
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Authenticated users can delete their own images
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES FOR 'cms-documents' BUCKET
-- ============================================

-- Policy 1: Authenticated users can view documents
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cms-documents' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Authenticated users can upload documents
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-documents' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update their own documents
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Authenticated users can delete their own documents
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES FOR 'cms-media' BUCKET
-- ============================================

-- Policy 1: Authenticated users can view media
DROP POLICY IF EXISTS "Authenticated users can view media" ON storage.objects;
CREATE POLICY "Authenticated users can view media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cms-media' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Authenticated users can upload media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-media' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update their own media
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms-media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Authenticated users can delete their own media
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE ORGANIZATION FUNCTIONS
-- ============================================

-- Function to generate organized folder structure
CREATE OR REPLACE FUNCTION generate_media_folder_path(
  user_id BIGINT,
  media_type TEXT,
  original_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
  folder_path TEXT;
  file_ext TEXT;
  timestamp TEXT;
  safe_filename TEXT;
BEGIN
  -- Get file extension
  file_ext := SUBSTRING(original_filename FROM '\.([^\.]+)$');
  
  -- Generate timestamp for uniqueness
  timestamp := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  
  -- Create safe filename (remove special characters)
  safe_filename := REGEXP_REPLACE(
    SUBSTRING(original_filename FROM '^([^\.]+)'),
    '[^a-zA-Z0-9_-]',
    '_',
    'g'
  );
  
  -- Build folder path: user_id/media_type/YYYY/MM/DD/filename_timestamp.ext
  folder_path := format('%s/%s/%s/%s/%s/%s_%s.%s',
    user_id,
    media_type,
    EXTRACT(YEAR FROM NOW()),
    LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0'),
    LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0'),
    safe_filename,
    timestamp,
    file_ext
  );
  
  RETURN folder_path;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get media type from MIME type
CREATE OR REPLACE FUNCTION get_media_type_from_mime(mime_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN mime_type LIKE 'image/%' THEN 'images'
    WHEN mime_type LIKE 'video/%' THEN 'videos'
    WHEN mime_type LIKE 'audio/%' THEN 'audio'
    WHEN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') THEN 'documents'
    ELSE 'other'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGER FOR AUTOMATIC MEDIA ORGANIZATION
-- ============================================

-- Function to automatically organize uploaded files
CREATE OR REPLACE FUNCTION organize_uploaded_media()
RETURNS TRIGGER AS $$
DECLARE
  media_type TEXT;
  bucket_name TEXT;
BEGIN
  -- Determine media type from MIME type
  media_type := get_media_type_from_mime(NEW.mime_type);
  
  -- Determine bucket based on media type
  bucket_name := CASE media_type
    WHEN 'images' THEN 'cms-images'
    WHEN 'documents' THEN 'cms-documents'
    ELSE 'cms-media'
  END;
  
  -- Update the record with organized information
  NEW.file_path := generate_media_folder_path(
    NEW.uploaded_by,
    media_type,
    NEW.original_filename
  );
  
  -- Note: The actual file upload to storage bucket would happen in the application code
  -- This function just prepares the metadata
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organize_media_on_insert
  BEFORE INSERT ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION organize_uploaded_media();

-- ============================================
-- IMAGE TRANSFORMATION CONFIGURATION
-- ============================================

-- Table to store image transformation configurations
CREATE TABLE IF NOT EXISTS image_transformations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  quality INTEGER DEFAULT 80,
  format TEXT DEFAULT 'webp',
  fit TEXT DEFAULT 'cover', -- 'cover', 'contain', 'fill'
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default image transformations
INSERT INTO image_transformations (name, width, height, quality, format, fit, is_default) VALUES
('thumbnail', 150, 150, 80, 'webp', 'cover', true),
('small', 300, 300, 85, 'webp', 'cover', true),
('medium', 600, 600, 90, 'webp', 'cover', true),
('large', 1200, 1200, 90, 'webp', 'cover', true),
('xlarge', 1920, 1080, 95, 'webp', 'cover', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STORAGE USAGE MONITORING
-- ============================================

-- View to monitor storage usage by user
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT 
  uploaded_by as user_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_size_bytes,
  ROUND(SUM(file_size) / 1048576.0, 2) as total_size_mb,
  get_media_type_from_mime(mime_type) as media_type
FROM media_items
GROUP BY uploaded_by, get_media_type_from_mime(mime_type)
ORDER BY total_size_bytes DESC;

-- View to monitor storage usage by media type
CREATE OR REPLACE VIEW storage_usage_by_type AS
SELECT 
  get_media_type_from_mime(mime_type) as media_type,
  COUNT(*) as file_count,
  SUM(file_size) as total_size_bytes,
  ROUND(SUM(file_size) / 1048576.0, 2) as total_size_mb,
  ROUND(AVG(file_size) / 1024.0, 2) as avg_size_kb
FROM media_items
GROUP BY get_media_type_from_mime(mime_type)
ORDER BY total_size_bytes DESC;

-- ============================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- ============================================

-- Function to find and report unused media files
CREATE OR REPLACE FUNCTION find_unused_media(days_old INTEGER DEFAULT 30)
RETURNS TABLE (
  media_id UUID,
  filename TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ,
  days_unused INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.filename,
    mi.file_size,
    mi.created_at,
    EXTRACT(DAY FROM NOW() - mi.created_at)::INTEGER as days_unused
  FROM media_items mi
  LEFT JOIN media_usage mu ON mi.id = mu.media_id
  WHERE mu.media_id IS NULL
    AND mi.created_at < NOW() - (days_old || ' days')::INTERVAL
  ORDER BY mi.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup orphaned storage files
-- Note: This would need to be integrated with actual storage cleanup
CREATE OR REPLACE FUNCTION cleanup_orphaned_media(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Find media items without usage and older than specified days
  WITH orphaned_media AS (
    SELECT mi.id, mi.file_path
    FROM media_items mi
    LEFT JOIN media_usage mu ON mi.id = mu.media_id
    WHERE mu.media_id IS NULL
      AND mi.created_at < NOW() - (days_old || ' days')::INTERVAL
  )
  -- Delete from database (storage files would need separate cleanup)
  DELETE FROM media_items
  WHERE id IN (SELECT id FROM orphaned_media)
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONFIGURATION SUMMARY
-- ============================================

DO $do$
BEGIN
  RAISE NOTICE 'Supabase Storage Configuration Complete!';
  RAISE NOTICE 'Buckets configured: cms-images (public), cms-documents (private), cms-media (private)';
  RAISE NOTICE 'Storage policies: Read/Write permissions based on authentication and ownership';
  RAISE NOTICE 'Automatic organization: Files organized by user/type/date structure';
  RAISE NOTICE 'Image transformations: 5 default sizes configured (thumbnail to xlarge)';
  RAISE NOTICE 'Monitoring: Views available for storage usage analytics';
  RAISE NOTICE 'Cleanup: Functions available for finding and removing unused media';
END
$do$;