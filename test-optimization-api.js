// Test script for optimization API endpoint
// This tests that the /api/optimize-image endpoint is properly configured

const fetch = require('node-fetch');

async function testOptimizationAPI() {
  console.log('Testing optimization API endpoint...\n');
  
  // Test 1: Check if endpoint exists (should return 405 for GET request)
  console.log('Test 1: Checking endpoint availability...');
  try {
    const response = await fetch('http://localhost:3000/api/optimize-image', {
      method: 'GET'
    });
    
    if (response.status === 405) {
      console.log('✓ Endpoint exists (returns 405 for GET as expected)');
    } else {
      console.log(`✗ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`✗ Cannot reach endpoint: ${error.message}`);
    console.log('Note: Make sure the dev server is running (npm run dev)');
  }
  
  // Test 2: Check CORS headers
  console.log('\nTest 2: Checking CORS headers...');
  try {
    const response = await fetch('http://localhost:3000/api/optimize-image', {
      method: 'OPTIONS'
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    if (corsHeaders['access-control-allow-origin'] === '*') {
      console.log('✓ CORS headers properly configured');
    } else {
      console.log('✗ CORS headers missing or incorrect:', corsHeaders);
    }
  } catch (error) {
    console.log(`✗ CORS test failed: ${error.message}`);
  }
  
  // Test 3: Check MediaManager component uses correct endpoint
  console.log('\nTest 3: Checking MediaManager component...');
  try {
    const fs = require('fs');
    const mediaManagerContent = fs.readFileSync('src/admin/components/MediaManager.tsx', 'utf8');
    
    if (mediaManagerContent.includes("fetch('/api/optimize-image'")) {
      console.log('✓ MediaManager uses correct endpoint: /api/optimize-image');
    } else if (mediaManagerContent.includes("fetch('/.netlify/functions/optimize-image'")) {
      console.log('✗ MediaManager still uses Netlify endpoint');
    } else {
      console.log('✗ Cannot find optimize-image endpoint in MediaManager');
    }
  } catch (error) {
    console.log(`✗ Cannot read MediaManager file: ${error.message}`);
  }
  
  // Test 4: Check Vercel configuration
  console.log('\nTest 4: Checking Vercel configuration...');
  try {
    const fs = require('fs');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    const hasOptimizeRoute = vercelConfig.rewrites?.some(rewrite => 
      rewrite.source === '/api/optimize-image'
    );
    
    if (hasOptimizeRoute) {
      console.log('✓ Vercel has route for /api/optimize-image');
    } else {
      console.log('✗ Vercel missing route for /api/optimize-image');
    }
    
    const hasOptimizeFunction = vercelConfig.functions?.['api/optimize-image.js'];
    if (hasOptimizeFunction) {
      console.log('✓ Vercel has function configuration for optimize-image');
    } else {
      console.log('✗ Vercel missing function configuration for optimize-image');
    }
  } catch (error) {
    console.log(`✗ Cannot read Vercel configuration: ${error.message}`);
  }
  
  console.log('\n=== Summary ===');
  console.log('The optimization system has been updated to use Vercel API routes.');
  console.log('Key changes made:');
  console.log('1. Updated MediaManager.tsx to use /api/optimize-image instead of Netlify function');
  console.log('2. Updated vercel.json to include route for /api/optimize-image');
  console.log('3. Created platform-agnostic API route at api/optimize-image.js');
  console.log('\nTo test the full functionality:');
  console.log('1. Run the dev server: npm run dev');
  console.log('2. Access the admin panel at /admin');
  console.log('3. Navigate to Media section and try uploading an image');
  console.log('4. Use the optimization features in the MediaManager');
}

// Run the test
testOptimizationAPI().catch(console.error);