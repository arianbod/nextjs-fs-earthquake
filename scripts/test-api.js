/**
 * API Testing Script
 * Simple script to test the QuakeWise External API endpoints
 *
 * Usage: node scripts/test-api.js <platform-token>
 */

const readline = require('readline');

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  log(`\n📍 Testing: ${name}`, 'blue');
  log(`   URL: ${url}`);
  log(`   Method: ${options.method || 'GET'}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();

    const data = await response.json();

    log(`   Status: ${response.status} ${response.statusText}`,
        response.ok ? 'green' : 'red');
    log(`   Time: ${endTime - startTime}ms`);

    if (response.ok) {
      log('   ✅ Success', 'green');
      return { success: true, data, response };
    } else {
      log('   ❌ Failed', 'red');
      log(`   Error: ${data.error?.message || 'Unknown error'}`, 'red');
      return { success: false, data, response };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function main() {
  const platformToken = process.argv[2];

  log('\n🚀 QuakeWise API Test Suite\n', 'blue');
  log('════════════════════════════════════════════════════════════\n');

  // Test 1: Status endpoint (no auth required)
  log('Test 1: Health Check', 'yellow');
  const statusResult = await testEndpoint(
    'GET /status',
    `${BASE_URL}/status`
  );

  // Test 2: Parameters endpoint (no auth required)
  log('\n\nTest 2: Get Parameters', 'yellow');
  const paramsResult = await testEndpoint(
    'GET /parameters',
    `${BASE_URL}/parameters`
  );

  if (!platformToken) {
    log('\n\n⚠️  No platform token provided', 'yellow');
    log('To test authenticated endpoints, run:', 'yellow');
    log('  node scripts/test-api.js <your-platform-token>\n', 'yellow');
    return;
  }

  // Test 3: Issue JWT token
  log('\n\nTest 3: Issue JWT Token', 'yellow');
  const tokenResult = await testEndpoint(
    'POST /auth/issue-token',
    `${BASE_URL}/auth/issue-token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': platformToken
      },
      body: JSON.stringify({
        userId: 'test_user_' + Date.now(),
        appId: 'test-app',
        tier: 'pro'
      })
    }
  );

  if (!tokenResult.success) {
    log('\n❌ Authentication failed. Cannot continue with remaining tests.', 'red');
    log('Please check your platform token.', 'red');
    return;
  }

  const jwtToken = tokenResult.data.data?.token;
  log(`   JWT Token: ${jwtToken?.substring(0, 50)}...`, 'green');

  // Test 4: Verify JWT token
  log('\n\nTest 4: Verify JWT Token', 'yellow');
  await testEndpoint(
    'POST /auth/verify-token',
    `${BASE_URL}/auth/verify-token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': platformToken
      },
      body: JSON.stringify({
        token: jwtToken
      })
    }
  );

  // Test 5: Complete assessment
  log('\n\nTest 5: Complete Building Assessment', 'yellow');
  const assessmentResult = await testEndpoint(
    'POST /assessment/complete',
    `${BASE_URL}/assessment/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': platformToken,
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        location: {
          latitude: 41.0082,
          longitude: 28.9784
        },
        building: {
          structuralSystem: 'C2',
          numberOfStories: 5,
          yearOfConstruction: 2010,
          designRegulation: '2007-2018',
          typeOfSoil: 'ZC',
          typeOfEarthquake: 'Zone 4'
        },
        options: {
          includeAiAnalysis: false, // Disable AI to test basic flow
          includeLocationIntelligence: true,
          includeWeatherRisk: true
        }
      })
    }
  );

  if (assessmentResult.success) {
    const score = assessmentResult.data.data?.safetyScore?.overall;
    log(`\n   📊 Safety Score: ${score}`, 'green');
  }

  // Summary
  log('\n\n════════════════════════════════════════════════════════════', 'blue');
  log('Test Summary', 'blue');
  log('════════════════════════════════════════════════════════════\n', 'blue');

  const tests = [
    { name: 'Health Check', result: statusResult },
    { name: 'Get Parameters', result: paramsResult },
    { name: 'Issue JWT Token', result: tokenResult },
    { name: 'Complete Assessment', result: assessmentResult }
  ];

  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    const color = test.result.success ? 'green' : 'red';
    log(`  ${status} ${test.name}`, color);
  });

  const passed = tests.filter(t => t.result.success).length;
  const total = tests.length;

  log(`\n  Total: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  log('');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
