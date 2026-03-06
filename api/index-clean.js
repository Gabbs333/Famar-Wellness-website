// Vercel Serverless Function - Main API handler
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase client - initialized lazily
let supabaseClient = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    console.log('Initializing Supabase client...');
    console.log('Supabase URL present:', !!supabaseUrl);
    console.log('Supabase Key present:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables!');
      console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
      console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      throw new Error('Supabase environment variables not configured');
    }
    
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client created successfully');
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  return supabaseClient;
};

// Simple authentication helper
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Helper to generate token (simplified for now)
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Authentication middleware
const authenticate = (req) => {
  console.log('=== AUTHENTICATE CALLED ===');
  console.log('Authorization header:', req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('No authorization header');
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token in authorization header');
    return false;
  }
  
  console.log('Token received:', token);
  console.log('Token length:', token.length);
  console.log('Token is 64 chars?', token.length === 64);
  
  // For now, we'll accept any token that's in the format we generate
  // In production, you should verify the token properly
  const isValid = token.length === 64; // Our tokens are 64 hex characters
  console.log('Authentication result:', isValid);
  return isValid;
};

export default async function handler(req, res) {
  console.log('=== API HANDLER STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
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
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Parse the URL to get the path
  console.log('Raw request info:', {
    rawUrl: req.url,
    rawMethod: req.method,
    host: req.headers.host
  });
  
  // In Vercel Serverless Functions, req.url contains the full path
  // We need to handle both cases: with and without query parameters
  let pathname = req.url;
  
  // Remove query parameters if present
  if (pathname.includes('?')) {
    pathname = pathname.split('?')[0];
  }
  
  // Extract API path (remove /api/ prefix)
  const apiPath = pathname.replace(/^\/api\//, '');
  
  console.log('API Request:', {
    method: req.method,
    path: pathname,
    apiPath: apiPath,
    url: req.url,
    host: req.headers.host
  });

  try {
    // Debug: Log exact apiPath for auth/login
    if (apiPath.includes('auth')) {
      console.log('DEBUG auth route:', {
        apiPath: apiPath,
        exactMatch: apiPath === 'auth/login',
        startsWith: apiPath.startsWith('auth/login'),
        rawApiPath: JSON.stringify(apiPath)
      });
    }
    
    // Route based on path with pattern matching
    if (apiPath === 'book') {
      return await handleBooking(req, res);
    } else if (apiPath === 'contact') {
      return await handleContact(req, res);
    } else if (apiPath === 'newsletter') {
      return await handleNewsletter(req, res);
    } else if (apiPath === 'health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } else if (apiPath === 'test') {
      // Simple test endpoint
      return res.status(200).json({ 
        message: 'API is working',
        apiPath: apiPath,
        pathname: pathname,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    } else if (apiPath === 'test-simple') {
      // Even simpler test endpoint
      return res.json({ 
        success: true,
        message: 'Simple test endpoint works',
        timestamp: new Date().toISOString()
      });
    } else if (apiPath === 'test-admin') {
      // Test admin endpoint without authentication
      try {
        // Test Supabase connection
        const supabase = getSupabaseClient();
        const contactsResult = await supabase.from('contacts').select('*', { count: 'exact', head: true });
        const bookingsResult = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        const subscribersResult = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
        
        return res.json({
          success: true,
          supabase: {
            connected: true,
            contactsCount: contactsResult.count || 0,
            bookingsCount: bookingsResult.count || 0,
            subscribersCount: subscribersResult.count || 0,
            contactsError: contactsResult.error ? contactsResult.error.message : null,
            bookingsError: bookingsResult.error ? bookingsResult.error.message : null,
            subscribersError: subscribersResult.error ? subscribersResult.error.message : null
          },
          env: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
            hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
          stack: error.stack
        });
      }
    } else if (apiPath === 'test-login') {
      // Test login endpoint without dependencies
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        let body = {};
        try {
          body = req.body || {};
        } catch (error) {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
        
        const { username, password } = body;
        
        if (!username || !password) {
          return res.status(400).json({ error: 'Username and password required' });
        }
        
        // Simple hardcoded check
        if (username === 'admin' && password === 'admin') {
          return res.json({ 
            success: true, 
            token: 'test-token-123',
            user: { username: 'admin' }
          });
        }
        
        return res.status(401).json({ error: 'Invalid credentials' });
      } catch (error) {
        console.error('Test login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else if (apiPath === 'auth/login' || apiPath.startsWith('auth/login')) {
      console.log('Routing to auth/login handler (exact or starts with)');
      return await handleLogin(req, res);
    } else if (apiPath === 'auth/logout') {
      return await handleLogout(req, res);
    } else if (apiPath === 'debug') {
      // Debug endpoint to see what's happening
      return res.status(200).json({
        message: 'Debug info',
        apiPath: apiPath,
        pathname: pathname,
        method: req.method,
        url: req.url,
        host: req.headers.host,
        rawUrl: req.url,
        env: {
          supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
          supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
          supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
          adminUsername: process.env.ADMIN_USERNAME ? 'Set' : 'Not set'
        },
        timestamp: new Date().toISOString()
      });
    } else if (apiPath === 'admin/stats') {
      return await handleAdminStats(req, res);
    } else if (apiPath.startsWith('admin/bookings/')) {
      return await handleAdminBookingUpdate(req, res);
    } else if (apiPath === 'admin/bookings') {
      return await handleAdminBookings(req, res);
    } else if (apiPath.startsWith('admin/contacts/')) {
      return await handleAdminContactUpdate(req, res);
    } else if (apiPath === 'admin/contacts') {
      return await handleAdminContacts(req, res);
    } else if (apiPath.startsWith('admin/posts/')) {
      return await handleAdminPostUpdate(req, res);
    } else if (apiPath === 'admin/posts') {
      return await handleAdminPosts(req, res);
    } else {
      console.log('API endpoint not found:', apiPath);
      console.log('Available endpoints: book, contact, newsletter, health, auth/login, auth/logout, admin/stats, admin/bookings, admin/contacts, admin/posts');
      return res.status(404).json({ error: 'API endpoint not found', path: apiPath, available: ['book', 'contact', 'newsletter', 'health', 'auth/login', 'auth/logout', 'admin/stats', 'admin/bookings', 'admin/contacts', 'admin/posts'] });
    }
  } catch (error) {
    console.error('API error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    console.log('=== API HANDLER COMPLETED ===');
  }
}

// ========== PUBLIC ENDPOINTS ==========

// Booking handler
async function handleBooking(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In Vercel, req.body is already parsed when content-type is application/json
    const { name, email, phone, service, date, time } = req.body || {};

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await getSupabaseClient()
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
    // In Vercel, req.body is already parsed when content-type is application/json
    const { name, email, phone, message, type = 'contact' } = req.body || {};

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and contact info required' });
    }

    const { data, error } = await getSupabaseClient()
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
    // In Vercel, req.body is already parsed when content-type is application/json
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const { data, error } = await getSupabaseClient()
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') { // Unique violation
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

// ========== ADMIN AUTHENTICATION ==========

// Login handler
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In Vercel, req.body is already parsed when content-type is application/json
    // Wrap in try-catch in case of malformed JSON
    let body = {};
    try {
      body = req.body || {};
    } catch (error) {
      console.error('Error accessing req.body:', error);
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // For now, use simple hardcoded credentials
    // In production, you should query the users table
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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

// Logout handler
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, just return success
  // In production, you might want to invalidate the token
  return res.status(200).json({ success: true, message: 'Logged out' });
}

// ========== ADMIN DATA ENDPOINTS ==========

// Admin stats handler
async function handleAdminStats(req, res) {
  console.log('=== HANDLE ADMIN STATS CALLED ===');
  
  if (req.method !== 'GET') {
    console.log('Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isAuthenticated = authenticate(req);
  console.log('Is authenticated?', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('Authentication failed, returning 401');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Fetching stats from Supabase...');
    const supabase = getSupabaseClient();
    
    // Get counts for dashboard
    const [newContacts, upcomingBookings, subscribers] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0]),
      supabase.from('subscribers').select('*', { count: 'exact', head: true })
    ]);

    console.log('Supabase results:', {
      newContacts: newContacts,
      upcomingBookings: upcomingBookings,
      subscribers: subscribers
    });

    return res.status(200).json({
      newContacts: newContacts.count || 0,
      upcomingBookings: upcomingBookings.count || 0,
      subscribers: subscribers.count || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin bookings handler
async function handleAdminBookings(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase bookings error:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Admin bookings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin booking update handler
async function handleAdminBookingUpdate(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Extract ID from URL path
    const pathParts = req.url.split('/');
    const id = pathParts[pathParts.length - 1];

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase booking update error:', error);
      return res.status(500).json({ error: 'Failed to update booking' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Admin booking update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin contacts handler
async function handleAdminContacts(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase contacts error:', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Admin contacts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin contact update handler
async function handleAdminContactUpdate(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Extract ID from URL path
    const pathParts = req.url.split('/');
    const id = pathParts[pathParts.length - 1];

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase contact update error:', error);
      return res.status(500).json({ error: 'Failed to update contact' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Admin contact update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Admin posts handler
async function handleAdminPosts(req, res) {
  if (req.method === 'GET') {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase posts error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Admin posts error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { title, slug, content, excerpt, image_url, published } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content required' });
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          title, 
          slug, 
          content, 
          excerpt: excerpt || '', 
          image_url: image_url || '', 
          published: published || false 
        }])
        .select();

      if (error) {
        console.error('Supabase post create error:', error);
        return res.status(500).json({ error: 'Failed to create post' });
      }

      return res.status(201).json(data[0]);
    } catch (error) {
      console.error('Admin post create error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Admin post update handler
async function handleAdminPostUpdate(req, res) {
  // Extract ID from URL path
  const pathParts = req.url.split('/');
  const id = pathParts[pathParts.length - 1];

  if (req.method === 'PUT') {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { title, slug, content, excerpt, image_url, published } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content required' });
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('posts')
        .update({ 
          title, 
          slug, 
          content, 
          excerpt: excerpt || '', 
          image_url: image_url || '', 
          published: published || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase post update error:', error);
        return res.status(500).json({ error: 'Failed to update post' });
      }

      return res.status(200).json(data[0]);
    } catch (error) {
      console.error('Admin post update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    if (!authenticate(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase post delete error:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Admin post delete error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}