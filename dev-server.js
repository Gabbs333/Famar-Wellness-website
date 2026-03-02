// Development server for local testing
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple authentication helper
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Helper to generate token (simplified for now)
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Authentication middleware
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const token = authHeader.split(' ')[1];
  if (!token) return false;
  
  // For now, we'll accept any token that's in the format we generate
  return token.length === 64; // Our tokens are 64 hex characters
};

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ========== PUBLIC ENDPOINTS ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Booking endpoint
app.post('/api/book', async (req, res) => {
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
});

// Contact endpoint
app.post('/api/contact', async (req, res) => {
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
});

// Newsletter endpoint
app.post('/api/newsletter', async (req, res) => {
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
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  return res.status(200).json({
    message: 'Debug info from dev-server.js',
    path: req.path,
    url: req.url,
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// ========== ADMIN AUTHENTICATION ==========

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

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
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  // For now, just return success
  return res.status(200).json({ success: true, message: 'Logged out' });
});

// ========== ADMIN DATA ENDPOINTS ==========

// Admin stats endpoint
app.get('/api/admin/stats', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get counts for dashboard
    const [newContacts, upcomingBookings, subscribers] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0]),
      supabase.from('subscribers').select('*', { count: 'exact', head: true })
    ]);

    return res.status(200).json({
      newContacts: newContacts.count || 0,
      upcomingBookings: upcomingBookings.count || 0,
      subscribers: subscribers.count || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin bookings endpoints
app.get('/api/admin/bookings', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
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
});

app.patch('/api/admin/bookings/:id', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

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
});

// Admin contacts endpoints
app.get('/api/admin/contacts', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
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
});

app.patch('/api/admin/contacts/:id', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

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
});

// Admin posts endpoints
app.get('/api/admin/posts', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
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
});

app.post('/api/admin/posts', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { title, slug, content, excerpt, image_url, published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content required' });
    }

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
});

app.put('/api/admin/posts/:id', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, image_url, published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content required' });
    }

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
});

app.delete('/api/admin/posts/:id', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
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
});

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log(`\n=== PUBLIC API ENDPOINTS ===`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/book`);
  console.log(`  POST http://localhost:${PORT}/api/contact`);
  console.log(`  POST http://localhost:${PORT}/api/newsletter`);
  console.log(`\n=== ADMIN AUTH ENDPOINTS ===`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`\n=== ADMIN DATA ENDPOINTS ===`);
  console.log(`  GET  http://localhost:${PORT}/api/admin/stats`);
  console.log(`  GET  http://localhost:${PORT}/api/admin/bookings`);
  console.log(`  PATCH http://localhost:${PORT}/api/admin/bookings/:id`);
  console.log(`  GET  http://localhost:${PORT}/api/admin/contacts`);
  console.log(`  PATCH http://localhost:${PORT}/api/admin/contacts/:id`);
  console.log(`  GET  http://localhost:${PORT}/api/admin/posts`);
  console.log(`  POST http://localhost:${PORT}/api/admin/posts`);
  console.log(`  PUT  http://localhost:${PORT}/api/admin/posts/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/admin/posts/:id`);
  console.log(`\n=== ADMIN PANEL ===`);
  console.log(`  http://localhost:${PORT}/admin/login`);
  console.log(`  http://localhost:${PORT}/admin/dashboard`);
});