// Netlify Function for /api/book
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, service, date, time } = body;

    console.log('Booking request received:', { name, email, service, date, time });

    // Validate required fields
    if (!name || !email || !date || !time) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // In a real implementation, you would:
    // 1. Save to a database
    // 2. Send to Google Calendar
    // 3. Send confirmation email
    
    // For demo purposes, simulate success
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Booking confirmed (Netlify Function Demo)',
        booking: {
          name,
          email,
          service,
          date,
          time,
          id: Date.now().toString() // Simulated booking ID
        }
      })
    };
  } catch (error) {
    console.error('Error processing booking:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};