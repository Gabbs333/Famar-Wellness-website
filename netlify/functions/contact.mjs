// Contact form function with Supabase
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Contact function - Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Contact function - Supabase Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set');

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
    const { name, email, phone, message, type = 'contact' } = body;

    console.log('Contact request received:', { name, email, phone, type });

    if (!name || (!email && !phone)) {
      return new Response(JSON.stringify({ error: 'Name and contact info required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test connection first
    console.log('Testing Supabase connection for contacts...');
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test error:', testError);
      console.error('Table might not exist or RLS is blocking access');
    } else {
      console.log('Supabase connection test successful');
    }

    console.log('Attempting to insert contact...');
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, phone, message, type, status: 'new' }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to send message',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Contact saved successfully:', data);
    
    return new Response(JSON.stringify({ success: true, message: 'Message sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Contact error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};