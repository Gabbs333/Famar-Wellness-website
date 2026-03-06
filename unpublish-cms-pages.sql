-- Quick fix: Unpublish all CMS pages
-- Run this in Supabase SQL Editor to restore original website content

UPDATE cms_pages SET published = false;
