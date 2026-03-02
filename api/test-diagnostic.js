// Endpoint de diagnostic pour l'admin
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialiser Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('=== DIAGNOSTIC ENDPOINT CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  try {
    // 1. Vérifier les variables d'environnement
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'PRESENT' : 'MISSING',
    };

    // 2. Tester la connexion à Supabase
    let supabaseTest = { success: false, error: null, data: null };
    try {
      const testResult = await supabase.from('contacts').select('*', { count: 'exact', head: true });
      supabaseTest = {
        success: !testResult.error,
        error: testResult.error ? testResult.error.message : null,
        count: testResult.count || 0
      };
    } catch (error) {
      supabaseTest.error = error.message;
    }

    // 3. Vérifier l'authentification
    const authHeader = req.headers.authorization;
    let authCheck = {
      hasHeader: !!authHeader,
      headerValue: authHeader ? authHeader.substring(0, 20) + '...' : null,
      token: null,
      tokenLength: null,
      isValidFormat: false
    };

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        authCheck.token = token.substring(0, 10) + '...';
        authCheck.tokenLength = token.length;
        authCheck.isValidFormat = token.length === 64;
      }
    }

    // 4. Compter les données réelles
    let dataCounts = { contacts: 0, bookings: 0, subscribers: 0, errors: [] };
    try {
      const [contacts, bookings, subscribers] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact' }),
        supabase.from('bookings').select('*', { count: 'exact' }),
        supabase.from('subscribers').select('*', { count: 'exact' })
      ]);

      dataCounts = {
        contacts: contacts.count || 0,
        bookings: bookings.count || 0,
        subscribers: subscribers.count || 0,
        errors: [
          contacts.error ? `Contacts: ${contacts.error.message}` : null,
          bookings.error ? `Bookings: ${bookings.error.message}` : null,
          subscribers.error ? `Subscribers: ${subscribers.error.message}` : null
        ].filter(Boolean)
      };
    } catch (error) {
      dataCounts.errors.push(`Count error: ${error.message}`);
    }

    // 5. Retourner les résultats
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: supabaseTest,
      authentication: authCheck,
      data: dataCounts,
      notes: [
        'Ce endpoint aide à diagnostiquer pourquoi l\'admin ne voit pas les données.',
        'Vérifie: 1) Variables d\'env, 2) Connexion Supabase, 3) Authentification, 4) Données existantes'
      ]
    };

    console.log('Diagnostic result:', JSON.stringify(diagnostic, null, 2));
    
    return res.status(200).json(diagnostic);

  } catch (error) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}