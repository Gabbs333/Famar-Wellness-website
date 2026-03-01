-- Famar Wellness - RLS Policies Fix (Corrected)
-- Execute this in Supabase SQL Editor

-- Drop existing policies first (if they exist)
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

-- Create new simplified policies

-- Bookings: Anyone can insert (including anonymous), authenticated users can read/update
CREATE POLICY "bookings_insert_policy" ON bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_select_policy" ON bookings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bookings_update_policy" ON bookings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contacts: Anyone can insert, authenticated users can read/update
CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Subscribers: Anyone can insert, authenticated users can read
CREATE POLICY "subscribers_insert_policy" ON subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "subscribers_select_policy" ON subscribers
  FOR SELECT TO authenticated
  USING (true);

-- Posts: Published posts are public, all posts viewable by authenticated
CREATE POLICY "posts_select_public" ON posts
  FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "posts_select_authenticated" ON posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "posts_insert_policy" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "posts_update_policy" ON posts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "posts_delete_policy" ON posts
  FOR DELETE TO authenticated
  USING (true);

-- Users: Only authenticated users can read
CREATE POLICY "users_select_policy" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Simple test
-- INSERT INTO bookings (service, date, time, client_name, client_email) 
-- VALUES ('Test Service', '2026-03-02', '10:00', 'Test User', 'test@test.com');