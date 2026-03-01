// Generic API function for other routes
exports.handler = async function(event, context) {
  const path = event.path.replace('/api/', '');
  
  console.log(`API request: ${event.httpMethod} ${event.path}`);
  
  // Handle different API routes
  if (path === 'availability' && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busy: [] })
    };
  }
  
  if (path === 'contact' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Contact form submitted:', body);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Message sent (Demo)' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  if (path === 'newsletter' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Newsletter subscription:', body.email);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Subscribed (Demo)' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
  
  // Default 404 for unknown API routes
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'API route not found' })
  };
};