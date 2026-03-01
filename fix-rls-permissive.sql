-- Fix RLS policies for contacts and subscribers tables
-- Make them very permissive for testing

-- 1. First, disable RLS temporarily to test
-- ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;

-- 2. Or create very permissive policies
-- Drop all existing policies for contacts
DROP POLICY IF EXISTS "contacts_insert_anon" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_auth" ON contacts;
DROP POLICY IF EXISTS "contacts_select_auth" ON contacts;
DROP POLICY IF EXISTS "contacts_update_auth" ON contacts;

-- Drop all existing policies for subscribers
DROP POLICY IF EXISTS "subscribers_insert_anon" ON subscribers;
DROP POLICY IF EXISTS "subscribers_insert_auth" ON subscribers;
DROP POLICY IF EXISTS "subscribers_select_auth" ON subscribers;

-- Create super permissive policies for contacts
-- Allow ANYONE to insert (including service role, anon, authenticated)
CREATE POLICY "contacts_allow_all_insert" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Allow ANYONE to select (for testing)
CREATE POLICY "contacts_allow_all_select" ON contacts
  FOR SELECT
  USING (true);

-- Create super permissive policies for subscribers
-- Allow ANYONE to insert
CREATE POLICY "subscribers_allow_all_insert" ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow ANYONE to select
CREATE POLICY "subscribers_allow_all_select" ON subscribers
  FOR SELECT
  USING (true);

-- Test insert
INSERT INTO contacts (name, email, phone, message, type, status)
VALUES ('RLS Test', 'rls@test.com', '1234567890', 'Testing RLS policies', 'contact', 'new');

INSERT INTO subscribers (email) VALUES ('rls-test@test.com');

-- Check if inserts worked
SELECT * FROM contacts WHERE email = 'rls@test.com';
SELECT * FROM subscribers WHERE email = 'rls-test@test.com';