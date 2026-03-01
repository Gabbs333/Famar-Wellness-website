// Booking function with Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

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

    // Save to Supabase
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
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to save booking',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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