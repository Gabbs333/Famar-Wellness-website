-- Simple RLS fix for Famar Wellness
-- Execute in Supabase SQL Editor

-- For bookings table: allow all operations for everyone
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;

-- Allow anonymous users to insert bookings
CREATE POLICY "Allow anonymous booking inserts" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to do everything with bookings
CREATE POLICY "Allow all booking operations for authenticated" ON bookings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- For testing: also allow service role to bypass RLS (should already work)
-- But this makes it explicit

-- Test insert
-- INSERT INTO bookings (service, date, time, client_name, client_email, client_phone, status)
-- VALUES ('Test Service', '2026-03-02', '10:00', 'Test Name', 'test@test.com', '1234567890', 'confirmed');