// Booking function with Supabase
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for bookings
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req, context) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { name, email, phone, service, date, time } = body;

    console.log('Booking request:', { name, email, service, date, time });

    // Validate
    if (!name || !email || !date || !time) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test error:', testError);
      console.error('Table might not exist or RLS is blocking access');
    } else {
      console.log('Supabase connection test successful');
    }

    // Save to Supabase - try different approaches
    console.log('Attempting to insert booking...');
    
    // Approach 1: Direct insert
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          service: service || '',
          date,
          time,
          client_name: name,
          client_email: email,
          client_phone: phone || null,
          status: 'confirmed'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Try alternative approach if RLS is blocking
      if (error.code === '42501' || error.message.includes('row-level security')) {
        console.log('RLS blocking insert, trying alternative approach...');
        
        // Try with different headers or approach
        return new Response(JSON.stringify({ 
          error: 'RLS policy blocking booking. Please execute RLS fix SQL in Supabase.',
          details: error.message,
          sql_fix_file: 'supabase-rls-simple.sql'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to save booking',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Booking saved successfully:', data);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Réservation confirmée',
      booking: data[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Booking error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};