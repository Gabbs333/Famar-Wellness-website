-- Famar Wellness - Simple RLS Policies
-- Execute this in Supabase SQL Editor
-- This allows: 
-- - Anonymous users (site visitors) to INSERT into bookings, contacts, subscribers
-- - Authenticated users (admin) to do ALL operations on all tables

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;

DROP POLICY IF EXISTS "Anyone can create contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;

DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON subscribers;

DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON posts;

DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;

-- 2. Bookings table policies
-- Anonymous users can insert bookings (site visitors making reservations)
CREATE POLICY "Allow anonymous booking inserts" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users (admin) can do everything with bookings
CREATE POLICY "Allow all booking operations for admin" ON bookings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Contacts table policies
-- Anonymous users can insert contacts (site visitors sending messages)
CREATE POLICY "Allow anonymous contact inserts" ON contacts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users (admin) can do everything with contacts
CREATE POLICY "Allow all contact operations for admin" ON contacts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Subscribers table policies
-- Anonymous users can subscribe (site visitors signing up for newsletter)
CREATE POLICY "Allow anonymous subscriber inserts" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users (admin) can do everything with subscribers
CREATE POLICY "Allow all subscriber operations for admin" ON subscribers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Posts table policies
-- Anonymous users can view published posts (blog readers)
CREATE POLICY "Allow viewing published posts" ON posts
  FOR SELECT TO anon
  USING (published = true);

-- Authenticated users (admin) can do everything with posts
CREATE POLICY "Allow all post operations for admin" ON posts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Users table policies (admin only)
-- Only authenticated users (admin) can view users
CREATE POLICY "Allow viewing users for admin" ON users
  FOR SELECT TO authenticated
  USING (true);

-- 7. Test queries (uncomment to test)
/*
-- Test as anonymous user (should work):
INSERT INTO bookings (service, date, time, client_name, client_email, client_phone, status)
VALUES ('Test Service', '2026-03-02', '10:00', 'Test Name', 'test@test.com', '1234567890', 'confirmed');

INSERT INTO contacts (name, email, phone, message, type, status)
VALUES ('Test Contact', 'contact@test.com', '1234567890', 'Test message', 'contact', 'new');

INSERT INTO subscribers (email) VALUES ('subscriber@test.com');

-- Test as admin (should work for all operations):
-- SELECT, INSERT, UPDATE, DELETE on all tables
*/