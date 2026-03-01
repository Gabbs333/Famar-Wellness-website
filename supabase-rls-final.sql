-- Famar Wellness - RLS Policies Fix
-- Execute this in Supabase SQL Editor

-- 1. First, drop all existing policies (if they exist)
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

-- 2. Create new policies for bookings table
-- Allow anonymous users (site visitors) to insert bookings
CREATE POLICY "bookings_insert_anon" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users (admin) to insert bookings
CREATE POLICY "bookings_insert_auth" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users (admin) to view all bookings
CREATE POLICY "bookings_select_auth" ON bookings
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update bookings
CREATE POLICY "bookings_update_auth" ON bookings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Create policies for contacts table
-- Allow anonymous users to insert contacts
CREATE POLICY "contacts_insert_anon" ON contacts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert contacts
CREATE POLICY "contacts_insert_auth" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view contacts
CREATE POLICY "contacts_select_auth" ON contacts
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to update contacts
CREATE POLICY "contacts_update_auth" ON contacts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create policies for subscribers table
-- Allow anonymous users to subscribe
CREATE POLICY "subscribers_insert_anon" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to subscribe
CREATE POLICY "subscribers_insert_auth" ON subscribers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view subscribers
CREATE POLICY "subscribers_select_auth" ON subscribers
  FOR SELECT TO authenticated
  USING (true);

-- 5. Create policies for posts table
-- Allow anonymous users to view published posts
CREATE POLICY "posts_select_published" ON posts
  FOR SELECT TO anon
  USING (published = true);

-- Allow authenticated users to view all posts
CREATE POLICY "posts_select_all" ON posts
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert posts
CREATE POLICY "posts_insert_auth" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update posts
CREATE POLICY "posts_update_auth" ON posts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete posts
CREATE POLICY "posts_delete_auth" ON posts
  FOR DELETE TO authenticated
  USING (true);

-- 6. Create policies for users table (admin only)
-- Allow authenticated users to view users
CREATE POLICY "users_select_auth" ON users
  FOR SELECT TO authenticated
  USING (true);

-- 7. Test the policies
-- You can test with these queries:
/*
-- Test booking insert (should work for anonymous)
INSERT INTO bookings (service, date, time, client_name, client_email, client_phone, status)
VALUES ('Massage Test', '2026-03-02', '10:00', 'Test User', 'test@test.com', '1234567890', 'confirmed');

-- Test contact insert (should work for anonymous)
INSERT INTO contacts (name, email, phone, message, type, status)
VALUES ('Test Contact', 'contact@test.com', '1234567890', 'Test message', 'contact', 'new');

-- Test subscriber insert (should work for anonymous)
INSERT INTO subscribers (email) VALUES ('subscriber@test.com');

-- View bookings as admin (requires authenticated role)
SELECT * FROM bookings LIMIT 5;
*/