import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import serverless from 'serverless-http';

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// --- AUTHENTICATION HELPER ---
const sessions = new Map(); // token -> username

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const verifyPassword = async (password: string, hash: string) => {
  const [salt, originalHash] = hash.split(':');
  const derivedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return originalHash === derivedHash;
};

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// --- API ROUTES ---

// 1. Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    sessions.set(token, username);
    
    // Set user info excluding password
    const userInfo = { id: user.id, username: user.username };
    res.json({ token, user: userInfo });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token) sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const username = sessions.get(token);
    res.json({ username });
});


// 2. Public Actions (Contact, Newsletter, Booking)

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, type = 'contact' } = req.body;
  
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and contact info required' });
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, phone, message, type }])
      .select();

    if (error) {
      console.error('Contact error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.json({ success: true, message: 'Already subscribed' });
      }
      console.error('Newsletter error:', error);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    res.json({ success: true, message: 'Subscribed' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.post('/api/book', async (req, res) => {
  const { name, email, phone, service, date, time } = req.body;

  console.log('Booking request received:', req.body);

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        service: service || '',
        date,
        time,
        client_name: name,
        client_email: email,
        client_phone: phone || null,
        status: 'confirmed'
      }])
      .select();

    if (error) {
      console.error('Supabase booking error:', error);
      return res.status(500).json({ 
        error: 'Failed to save booking',
        details: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Réservation confirmée',
      booking: data[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});


// 3. Admin Routes (Protected)

app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
        // Get new contacts count
        const { count: newContacts } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        // Get upcoming bookings count (today and future)
        const today = new Date().toISOString().split('T')[0];
        const { count: upcomingBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('date', today);

        // Get subscribers count
        const { count: subscribers } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true });

        res.json({
            newContacts: newContacts || 0,
            upcomingBookings: upcomingBookings || 0,
            subscribers: subscribers || 0
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.get('/api/admin/contacts', requireAuth, async (req, res) => {
    try {
        const { data: contacts, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(contacts);
    } catch (err) {
        console.error('Contacts error:', err);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.patch('/api/admin/contacts/:id', requireAuth, async (req, res) => {
    const { status } = req.body;
    try {
        const { error } = await supabase
          .from('contacts')
          .update({ status })
          .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Update contact error:', err);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

app.get('/api/admin/bookings', requireAuth, async (req, res) => {
    try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .order('date', { ascending: false })
          .order('time', { ascending: false });

        if (error) throw error;
        res.json(bookings);
    } catch (err) {
        console.error('Bookings error:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

app.patch('/api/admin/bookings/:id', requireAuth, async (req, res) => {
    const { status } = req.body;
    try {
        const { error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Update booking error:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

app.get('/api/admin/subscribers', requireAuth, async (req, res) => {
    try {
        const { data: subscribers, error } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(subscribers);
    } catch (err) {
        console.error('Subscribers error:', err);
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

// Blog Posts
app.get('/api/posts', async (req, res) => {
    // Public endpoint for frontend
    try {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(posts);
    } catch (err) {
        console.error('Posts error:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/api/admin/posts', requireAuth, async (req, res) => {
    try {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(posts);
    } catch (err) {
        console.error('Posts error:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/admin/posts', requireAuth, async (req, res) => {
    const { title, slug, content, excerpt, image_url, published } = req.body;
    try {
        const { error } = await supabase
          .from('posts')
          .insert([{ title, slug, content, excerpt, image_url, published }]);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/admin/posts/:id', requireAuth, async (req, res) => {
    const { title, slug, content, excerpt, image_url, published } = req.body;
    try {
        const { error } = await supabase
          .from('posts')
          .update({ title, slug, content, excerpt, image_url, published, updated_at: new Date().toISOString() })
          .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/admin/posts/:id', requireAuth, async (req, res) => {
    try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files (if built)
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Supabase connected: ${supabaseUrl ? 'Yes' : 'No'}`);
  });
}

// Export for Netlify Functions
export const handler = serverless(app);

// Start server if not in Netlify Functions environment
if (process.env.NETLIFY !== 'true') {
  startServer();
}