#!/usr/bin/env node

/**
 * EventHive Application Testing Script
 * 
 * This script performs comprehensive testing of the EventHive application
 * including backend API endpoints, frontend functionality, and integration tests.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  backend: {
    protocol: 'http:',
    host: 'localhost',
    port: 5000,
    basePath: '/api'
  },
  frontend: {
    protocol: 'http:',
    host: 'localhost',
    port: 3000
  },
  testCredentials: {
    email: 'admin@eventhive.com',
    password: 'admin123'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  const status = passed ? 'PASS' : 'FAIL';
  const statusColor = passed ? colors.green : colors.red;
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    name: testName,
    passed,
    details
  });
  
  log(`[${status}] ${testName}${details ? ` - ${details}` : ''}`, statusColor);
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  log('\n🔍 Testing Backend Health...', colors.cyan);
  
  try {
    const response = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/health',
      method: 'GET'
    });
    
    const passed = response.statusCode === 200;
    logTest('Backend Health Check', passed, `Status: ${response.statusCode}`);
    
    return passed;
  } catch (error) {
    logTest('Backend Health Check', false, `Error: ${error.message}`);
    return false;
  }
}

async function testFrontendAccess() {
  log('\n🌐 Testing Frontend Access...', colors.cyan);
  
  try {
    const response = await makeRequest({
      protocol: config.frontend.protocol,
      hostname: config.frontend.host,
      port: config.frontend.port,
      path: '/',
      method: 'GET'
    });
    
    const passed = response.statusCode === 200;
    logTest('Frontend Access', passed, `Status: ${response.statusCode}`);
    
    return passed;
  } catch (error) {
    logTest('Frontend Access', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAuthenticationAPI() {
  log('\n🔐 Testing Authentication API...', colors.cyan);
  
  try {
    // Test login endpoint
    const loginResponse = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: `${config.backend.basePath}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, config.testCredentials);
    
    const loginPassed = loginResponse.statusCode === 200 && loginResponse.data.token;
    logTest('Login API', loginPassed, `Status: ${loginResponse.statusCode}`);
    
    if (loginPassed) {
      // Test protected endpoint
      const token = loginResponse.data.token;
      const profileResponse = await makeRequest({
        protocol: config.backend.protocol,
        hostname: config.backend.host,
        port: config.backend.port,
        path: `${config.backend.basePath}/auth/profile`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const profilePassed = profileResponse.statusCode === 200;
      logTest('Protected Route Access', profilePassed, `Status: ${profileResponse.statusCode}`);
      
      return { success: true, token };
    }
    
    return { success: false, token: null };
  } catch (error) {
    logTest('Authentication API', false, `Error: ${error.message}`);
    return { success: false, token: null };
  }
}

async function testEventsAPI() {
  log('\n📅 Testing Events API...', colors.cyan);
  
  try {
    // Test get events
    const eventsResponse = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: `${config.backend.basePath}/events`,
      method: 'GET'
    });
    
    const eventsPassed = eventsResponse.statusCode === 200;
    logTest('Get Events API', eventsPassed, `Status: ${eventsResponse.statusCode}`);
    
    // Test events search
    const searchResponse = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: `${config.backend.basePath}/events?search=tech`,
      method: 'GET'
    });
    
    const searchPassed = searchResponse.statusCode === 200;
    logTest('Events Search API', searchPassed, `Status: ${searchResponse.statusCode}`);
    
    return eventsPassed && searchPassed;
  } catch (error) {
    logTest('Events API', false, `Error: ${error.message}`);
    return false;
  }
}

async function testFileUploadAPI(token) {
  log('\n📁 Testing File Upload API...', colors.cyan);
  
  if (!token) {
    logTest('File Upload API', false, 'No authentication token available');
    return false;
  }
  
  try {
    // Test upload endpoint (without actual file for this test)
    const uploadResponse = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: `${config.backend.basePath}/upload/profile`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // We expect 400 (bad request) since we're not sending a file
    const passed = uploadResponse.statusCode === 400;
    logTest('File Upload Endpoint', passed, `Status: ${uploadResponse.statusCode} (expected 400 without file)`);
    
    return passed;
  } catch (error) {
    logTest('File Upload API', false, `Error: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnectivity() {
  log('\n🗄️  Testing Database Connectivity...', colors.cyan);
  
  try {
    // Test through API endpoint that requires DB
    const response = await makeRequest({
      protocol: config.backend.protocol,
      hostname: config.backend.host,
      port: config.backend.port,
      path: `${config.backend.basePath}/events`,
      method: 'GET'
    });
    
    const passed = response.statusCode === 200;
    logTest('Database Connectivity', passed, `Status: ${response.statusCode}`);
    
    return passed;
  } catch (error) {
    logTest('Database Connectivity', false, `Error: ${error.message}`);
    return false;
  }
}

function testFileStructure() {
  log('\n📂 Testing File Structure...', colors.cyan);
  
  const requiredFiles = [
    'package.json',
    'README.md',
    'CONTEXT.md',
    'DEPLOYMENT_GUIDE.md',
    'backend/package.json',
    'backend/src/server.js',
    'backend/.env.example',
    'frontend/package.json',
    'frontend/src/App.js',
    'frontend/public/index.html'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    logTest(`File exists: ${filePath}`, exists);
    if (!exists) allFilesExist = false;
  });
  
  return allFilesExist;
}

function testDirectoryStructure() {
  log('\n📁 Testing Directory Structure...', colors.cyan);
  
  const requiredDirectories = [
    'backend',
    'backend/src',
    'backend/src/routes',
    'backend/src/controllers',
    'backend/src/models',
    'backend/src/middleware',
    'backend/uploads',
    'frontend',
    'frontend/src',
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/services',
    'frontend/src/store'
  ];
  
  let allDirsExist = true;
  
  requiredDirectories.forEach(dirPath => {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    logTest(`Directory exists: ${dirPath}`, exists);
    if (!exists) allDirsExist = false;
  });
  
  return allDirsExist;
}

async function testAPIEndpoints(token) {
  log('\n🔗 Testing API Endpoints...', colors.cyan);
  
  const endpoints = [
    { path: '/events', method: 'GET', requiresAuth: false },
    { path: '/events/1', method: 'GET', requiresAuth: false },
    { path: '/auth/profile', method: 'GET', requiresAuth: true },
    { path: '/bookings/my-bookings', method: 'GET', requiresAuth: true }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      const headers = endpoint.requiresAuth && token ? 
        { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await makeRequest({
        protocol: config.backend.protocol,
        hostname: config.backend.host,
        port: config.backend.port,
        path: `${config.backend.basePath}${endpoint.path}`,
        method: endpoint.method,
        headers
      });
      
      // Consider 200, 401 (for auth required), and 404 (for non-existent resources) as valid responses
      const validStatuses = [200, 401, 404];
      const passed = validStatuses.includes(response.statusCode);
      
      logTest(`${endpoint.method} ${endpoint.path}`, passed, `Status: ${response.statusCode}`);
      
      if (!passed) allPassed = false;
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, `Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

function generateTestReport() {
  log('\n📊 Test Report', colors.bright);
  log('='.repeat(50), colors.bright);
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log(`Total Tests: ${testResults.total}`, colors.cyan);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? colors.green : colors.red);
  
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  • ${test.name}${test.details ? ` - ${test.details}` : ''}`, colors.red);
      });
  }
  
  log('\n' + '='.repeat(50), colors.bright);
  
  if (passRate >= 80) {
    log('🎉 Application is ready for deployment!', colors.green);
  } else {
    log('⚠️  Application needs attention before deployment.', colors.yellow);
  }
  
  return passRate >= 80;
}

// Main test execution
async function runAllTests() {
  log('🚀 EventHive Application Testing', colors.bright);
  log('Starting comprehensive application tests...\n', colors.cyan);
  
  // File structure tests (synchronous)
  testFileStructure();
  testDirectoryStructure();
  
  // Backend tests
  const backendHealthy = await testBackendHealth();
  
  if (backendHealthy) {
    await testDatabaseConnectivity();
    const authResult = await testAuthenticationAPI();
    await testEventsAPI();
    await testFileUploadAPI(authResult.token);
    await testAPIEndpoints(authResult.token);
  } else {
    log('\n⚠️  Skipping backend-dependent tests due to health check failure', colors.yellow);
  }
  
  // Frontend tests
  await testFrontendAccess();
  
  // Generate final report
  const success = generateTestReport();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ Test execution failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  config
};
