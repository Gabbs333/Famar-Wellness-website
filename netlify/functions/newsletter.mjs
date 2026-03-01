// Newsletter subscription with Supabase
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Newsletter function - Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Newsletter function - Supabase Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set');

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { email } = body;

    console.log('Newsletter request received:', { email });

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test connection first
    console.log('Testing Supabase connection for subscribers...');
    const { data: testData, error: testError } = await supabase
      .from('subscribers')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test error:', testError);
      console.error('Table might not exist or RLS is blocking access');
    } else {
      console.log('Supabase connection test successful');
    }

    console.log('Attempting to insert subscriber...');
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        console.log('Email already subscribed');
        return new Response(JSON.stringify({ success: true, message: 'Already subscribed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to subscribe',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Subscriber saved successfully:', data);
    
    return new Response(JSON.stringify({ success: true, message: 'Subscribed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};