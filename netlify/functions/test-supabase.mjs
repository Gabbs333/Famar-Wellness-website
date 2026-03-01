// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

export default async (req, context) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  
  console.log('=== TEST SUPABASE CONNECTION ===');
  console.log('URL:', supabaseUrl);
  console.log('Key type:', 
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 
    process.env.SUPABASE_ANON_KEY ? 'ANON' : 'NONE');
  console.log('Key first 10 chars:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'None');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test bookings table
  console.log('\n=== Testing bookings table ===');
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('count', { count: 'exact', head: true });
  
  console.log('Bookings test:', bookingsError ? `ERROR: ${bookingsError.message}` : `SUCCESS: ${bookings} records`);
  
  // Test contacts table
  console.log('\n=== Testing contacts table ===');
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('count', { count: 'exact', head: true });
  
  console.log('Contacts test:', contactsError ? `ERROR: ${contactsError.message}` : `SUCCESS: ${contacts} records`);
  
  // Test subscribers table
  console.log('\n=== Testing subscribers table ===');
  const { data: subscribers, error: subscribersError } = await supabase
    .from('subscribers')
    .select('count', { count: 'exact', head: true });
  
  console.log('Subscribers test:', subscribersError ? `ERROR: ${subscribersError.message}` : `SUCCESS: ${subscribers} records`);
  
  // Try to insert a test contact
  console.log('\n=== Testing contact insert ===');
  const testContact = {
    name: 'Test from function',
    email: 'test-function@test.com',
    phone: '1234567890',
    message: 'Test message from function',
    type: 'contact',
    status: 'new'
  };
  
  const { data: insertedContact, error: insertError } = await supabase
    .from('contacts')
    .insert([testContact])
    .select();
  
  console.log('Contact insert:', insertError ? `ERROR: ${insertError.message}` : `SUCCESS: ${JSON.stringify(insertedContact)}`);
  
  return new Response(JSON.stringify({
    url: supabaseUrl ? 'Set' : 'Not set',
    keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : process.env.SUPABASE_ANON_KEY ? 'ANON' : 'NONE',
    bookings: bookingsError ? { error: bookingsError.message } : { count: bookings },
    contacts: contactsError ? { error: contactsError.message } : { count: contacts },
    subscribers: subscribersError ? { error: subscribersError.message } : { count: subscribers },
    contactInsert: insertError ? { error: insertError.message } : { success: true, data: insertedContact }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};