// Contact form function with Supabase - FIXED VERSION
import { createClient } from '@supabase/supabase-js';

// Use same logic as book.mjs which works
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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

    // Validate
    if (!name || (!email && !phone)) {
      return new Response(JSON.stringify({ error: 'Name and contact info required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save to Supabase - same pattern as book.mjs
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name,
        email: email || null,
        phone: phone || null,
        message: message || '',
        type,
        status: 'new'
      }])
      .select();

    if (error) {
      console.error('Supabase contact error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Message sent',
      contact: data[0]
    }), {
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