// Vercel Serverless Function - Main API handler
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('Supabase URL present:', !!supabaseUrl);
console.log('Supabase Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple authentication helper
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Helper to generate token (simplified for now)
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse the URL to get the path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Extract API path (remove /api/ prefix)
  const apiPath = pathname.replace(/^\/api\//, '');
  
  console.log('API Request:', {
    method: req.method,
    path: pathname,
    apiPath: apiPath
  });

  try {
    // Route based on path with pattern matching
    if (apiPath === 'book') {
      return await handleBooking(req, res);
    } else if (apiPath === 'contact') {
      return await handleContact(req, res);
    } else if (apiPath === 'newsletter') {
      return await handleNewsletter(req, res);
    } else if (apiPath === 'health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } else if (apiPath === 'debug') {
      // Debug endpoint
      return res.status(200).json({
        message: 'API debug info',
        apiPath: apiPath,
        pathname: pathname,
        method: req.method,
        env: {
          supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
          adminUsername: process.env.ADMIN_USERNAME ? 'Set' : 'Not set'
        },
        timestamp: new Date().toISOString()
      });
    } else if (apiPath === 'auth/login' || apiPath.startsWith('auth/login')) {
      return await handleLogin(req, res);
    } else {
      console.log('API endpoint not found:', apiPath);
      return res.status(404).json({ error: 'API endpoint not found', path: apiPath });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}

// ========== HANDLER FUNCTIONS ==========

// Booking handler
async function handleBooking(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, service, date, time } = req.body;

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
      console.error('Supabase booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to save booking',
        details: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Réservation confirmée',
      booking: data[0]
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Contact handler
async function handleContact(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message, type = 'contact' } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and contact info required' });
    }

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
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Message sent',
      contact: data[0]
    });
  } catch (error) {
    console.error('Contact error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Newsletter handler
async function handleNewsletter(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return res.status(200).json({ 
          success: true, 
          message: 'Already subscribed' 
        });
      }
      
      console.error('Supabase newsletter error:', error);
      return res.status(500).json({ 
        error: 'Failed to subscribe',
        details: error.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Subscribed successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Login handler
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Simple hardcoded credentials for now
    if (username === ADMIN_USERNAME && password === 'admin') {
      const token = generateToken();
      return res.status(200).json({ 
        success: true, 
        token,
        user: { username: ADMIN_USERNAME }
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}