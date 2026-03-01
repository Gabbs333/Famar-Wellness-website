import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import db from './src/db.ts';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

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

const verifyPassword = (password: string, hash: string) => {
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
  
  // Extend session?
  next();
};

// --- GOOGLE CALENDAR SETUP ---
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

const getAuthClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    return null;
  }

  return new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    SCOPES
  );
};

// --- API ROUTES ---

// 1. Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    
    if (!user || !verifyPassword(password, user.password_hash)) {
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

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message, type = 'contact' } = req.body;
  
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and contact info required' });
  }

  try {
    db.prepare(
      'INSERT INTO contacts (name, email, phone, message, type) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone, message, type);
    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
    res.json({ success: true, message: 'Subscribed' });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.json({ success: true, message: 'Already subscribed' });
    }
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.get('/api/availability', async (req, res) => {
  const auth = getAuthClient();
  
  if (!auth) return res.json({ busy: [] });

  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const timeMin = new Date(`${date}T00:00:00`);
    const timeMax = new Date(`${date}T23:59:59`);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots = response.data.calendars?.[CALENDAR_ID]?.busy || [];
    res.json({ busy: busySlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.post('/api/book', async (req, res) => {
  const auth = getAuthClient();
  const { name, email, phone, service, date, time } = req.body;

  console.log('Booking request received:', req.body);

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Save to Local DB
  let bookingId;
  try {
    const result = db.prepare(
      'INSERT INTO bookings (service, date, time, client_name, client_email, client_phone) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(service, date, time, name, email, phone);
    bookingId = result.lastInsertRowid;
  } catch (err) {
    console.error('Local booking error:', err);
    // Continue to try Google Calendar even if local DB fails
  }

  // 2. Save to Google Calendar (if configured)
  if (!auth) {
    console.log('Missing Google Credentials - Simulating Booking Success');
    console.log('Booking Data:', req.body);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.json({ success: true, message: 'Booking simulated (Demo Mode)' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `Rdv: ${service} - ${name}`,
      description: `Client: ${name}\nEmail: ${email}\nTel: ${phone}\nService: ${service}`,
      start: { dateTime: startDateTime.toISOString(), timeZone: 'Africa/Douala' },
      end: { dateTime: endDateTime.toISOString(), timeZone: 'Africa/Douala' },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    res.json({ success: true, message: 'Booking confirmed' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});


// 3. Admin Routes (Protected)

app.get('/api/admin/stats', requireAuth, (req, res) => {
    try {
        const contactsCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'new'").get() as any;
        const bookingsCount = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE date >= date('now')").get() as any;
        const subscribersCount = db.prepare("SELECT COUNT(*) as count FROM subscribers").get() as any;
        
        res.json({
            newContacts: contactsCount.count,
            upcomingBookings: bookingsCount.count,
            subscribers: subscribersCount.count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.get('/api/admin/contacts', requireAuth, (req, res) => {
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(contacts);
});

app.patch('/api/admin/contacts/:id', requireAuth, (req, res) => {
    const { status } = req.body;
    try {
        db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Update contact error:', err);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

app.get('/api/admin/bookings', requireAuth, (req, res) => {
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY date DESC, time DESC').all();
    res.json(bookings);
});

app.patch('/api/admin/bookings/:id', requireAuth, (req, res) => {
    const { status } = req.body;
    try {
        db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Update booking error:', err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

app.get('/api/admin/subscribers', requireAuth, (req, res) => {
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all();
    res.json(subscribers);
});

// Blog Posts
app.get('/api/posts', (req, res) => {
    // Public endpoint for frontend
    const posts = db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC').all();
    res.json(posts);
});

app.get('/api/admin/posts', requireAuth, (req, res) => {
    const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    res.json(posts);
});

app.post('/api/admin/posts', requireAuth, (req, res) => {
    const { title, slug, content, excerpt, image_url, published } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO posts (title, slug, content, excerpt, image_url, published) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(title, slug, content, excerpt, image_url, published ? 1 : 0);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/admin/posts/:id', requireAuth, (req, res) => {
    const { title, slug, content, excerpt, image_url, published } = req.body;
    try {
        const stmt = db.prepare('UPDATE posts SET title=?, slug=?, content=?, excerpt=?, image_url=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?');
        stmt.run(title, slug, content, excerpt, image_url, published ? 1 : 0, req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/admin/posts/:id', requireAuth, (req, res) => {
    try {
        db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});


// Vite Middleware
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
  });
}

startServer();
