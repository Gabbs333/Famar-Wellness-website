-- Add CSS column to cms_pages table for visual editor
-- Run this in Supabase SQL Editor after the main schema

ALTER TABLE cms_pages 
ADD COLUMN IF NOT EXISTS css TEXT NULL;

COMMENT ON COLUMN cms_pages.css IS 'Custom CSS from GrapesJS visual editor';
