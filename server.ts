import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import { startOfDay, endOfDay, addDays, parseISO } from 'date-fns';

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Google Calendar Setup
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Initialize JWT client
// We use a function to get the client to ensure we pick up the latest env vars
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

// API Routes

// 1. Get Availability
app.get('/api/availability', async (req, res) => {
  const auth = getAuthClient();
  
  // DEMO MODE: If no credentials, return empty busy slots (all available)
  if (!auth) {
    return res.json({ busy: [] });
  }

  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Define the time range for the day (e.g., 8 AM to 8 PM)
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

// 2. Create Booking
app.post('/api/book', async (req, res) => {
  const auth = getAuthClient();
  
  // DEMO MODE: If no credentials, simulate success
  if (!auth) {
    console.log('Missing Google Credentials - Simulating Booking Success');
    console.log('Booking Data:', req.body);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.json({ success: true, message: 'Booking simulated (Demo Mode)' });
  }

  const { name, email, phone, service, date, time } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration default

    const event = {
      summary: `Rdv: ${service} - ${name}`,
      description: `Client: ${name}\nEmail: ${email}\nTel: ${phone}\nService: ${service}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Africa/Douala', // Cameroun Time Zone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Africa/Douala',
      },
    };

    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    res.json({ success: true, message: 'Booking confirmed' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
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
    // For this environment, we mostly rely on dev mode, but good practice:
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
