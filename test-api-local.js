// Test script for local API testing
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, path, body = null, description) {
  console.log(`\n=== Testing: ${description} ===`);
  console.log(`Endpoint: ${method} ${BASE_URL}${path}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json().catch(() => ({ text: await response.text() }));
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('Starting API tests...');
  
  // Test 1: Simple GET endpoint
  await testEndpoint('GET', '/api/test-simple', null, 'Simple test endpoint');
  
  // Test 2: Health endpoint
  await testEndpoint('GET', '/api/health', null, 'Health check endpoint');
  
  // Test 3: Test login endpoint (simplified)
  await testEndpoint('POST', '/api/test-login', {
    username: 'admin',
    password: 'admin'
  }, 'Test login endpoint (simplified)');
  
  // Test 4: Actual auth/login endpoint
  await testEndpoint('POST', '/api/auth/login', {
    username: 'admin',
    password: 'admin'
  }, 'Actual auth/login endpoint');
  
  // Test 5: Debug endpoint
  await testEndpoint('GET', '/api/debug', null, 'Debug endpoint');
  
  // Test 6: Test with wrong credentials
  await testEndpoint('POST', '/api/auth/login', {
    username: 'admin',
    password: 'wrong'
  }, 'Auth/login with wrong credentials');
  
  // Test 7: Test missing fields
  await testEndpoint('POST', '/api/auth/login', {
    username: 'admin'
    // missing password
  }, 'Auth/login with missing password');
  
  // Test 8: Test invalid JSON
  console.log('\n=== Testing: Invalid JSON body ===');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json' // Malformed JSON
    });
    const text = await response.text();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', text);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n=== All tests completed ===');
}

// Run tests
runAllTests().catch(console.error);