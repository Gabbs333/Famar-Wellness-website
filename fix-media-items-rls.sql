-- Fix RLS policies for media_items table
-- Run this in Supabase SQL Editor

-- Enable RLS if not already enabled
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow insert for authenticated users" ON media_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to select
CREATE POLICY "Allow select for authenticated users" ON media_items
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow update for authenticated users" ON media_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow delete for authenticated users" ON media_items
FOR DELETE
TO authenticated
USING (true);

-- Also allow anon for public reads (optional)
CREATE POLICY "Allow public read" ON media_items
FOR SELECT
TO anon
USING (true);
