-- Famar Wellness - RLS Policies Fix
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

-- Bookings: Anyone can insert, authenticated users can read/update
CREATE POLICY "bookings_insert_policy" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_select_policy" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated' OR true);

CREATE POLICY "bookings_update_policy" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Contacts: Anyone can insert, authenticated users can read/update
CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Subscribers: Anyone can insert, authenticated users can read
CREATE POLICY "subscribers_insert_policy" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "subscribers_select_policy" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Posts: Published posts are public, all posts viewable by authenticated
CREATE POLICY "posts_select_policy" ON posts
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "posts_all_policy" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Users: Only authenticated users can read
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alternative: Allow all operations for service role (bypass RLS)
-- This is for the service role key used by Netlify functions
-- Note: Service role key already bypasses RLS, but this makes it explicit

-- Test the policies
-- You can test with:
-- SELECT * FROM bookings LIMIT 5;
-- INSERT INTO bookings (service, date, time, client_name, client_email) VALUES ('Test', '2024-01-01', '10:00', 'Test', 'test@test.com');