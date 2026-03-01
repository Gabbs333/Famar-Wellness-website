// Simple function to explain the backend situation
export const handler = async (event, context) => {
  return {
    statusCode: 503,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: 'Backend not available on Netlify',
      message: 'This application requires a Node.js server with SQLite. Please deploy the backend separately using: npm run dev (local) or deploy to Render/Railway/Fly.io',
      documentation: 'The backend (server.ts) needs to run on a platform that supports persistent Node.js servers with SQLite.',
      localDevelopment: 'Run "npm run dev" locally to test the full application with backend'
    })
  };
};