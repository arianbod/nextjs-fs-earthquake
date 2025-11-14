# QuakeWise API Test Suite

Comprehensive Vitest testing suite for QuakeWise Internal API endpoints.

**For Mobile App Developers:** This test suite demonstrates exactly how to use the QuakeWise API in your applications.

---

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [For Mobile Developers](#for-mobile-developers)
- [Common Test Scenarios](#common-test-scenarios)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Authentication tests
npm test auth

# Assessment tests
npm test assessment

# Rate limiting tests
npm test rate-limit

# Integration tests
npm test integration
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### View Test UI

```bash
npm run test:ui
```

Open http://localhost:51204/__vitest__/ to view interactive test results.

### Generate Coverage Report

```bash
npm run test:coverage
```

---

## 📁 Test Structure

```
tests/
├── setup.js                          # Global test setup
├── utils/
│   ├── testHelpers.js               # Helper functions
│   └── mockData.js                  # Mock data factories
├── api/
│   ├── auth/
│   │   ├── issue-token.test.js      # JWT issuance tests
│   │   └── verify-token.test.js     # JWT verification tests
│   ├── assessment/
│   │   └── complete.test.js         # Building assessment tests
│   ├── utility/
│   │   └── utility-endpoints.test.js # Status, parameters tests
│   └── rate-limit/
│       └── rate-limiting.test.js    # Rate limiting tests
└── integration/
    └── complete-user-flow.test.js   # End-to-end flow tests
```

---

## 🎯 Test Coverage

### Authentication Endpoints

**`POST /api/v1/auth/issue-token`**
- ✅ Issue valid JWT tokens
- ✅ Handle different tiers (WEB_APP, BATCH_JOB, DEV_TESTING)
- ✅ Include custom metadata
- ✅ Set custom expiration times
- ✅ Reject invalid platform tokens
- ✅ Validate request body
- ✅ Concurrent token issuance
- ✅ Mobile app use cases

**`POST /api/v1/auth/verify-token`**
- ✅ Verify valid JWT tokens
- ✅ Reject expired tokens
- ✅ Reject tokens with invalid signatures
- ✅ Handle malformed tokens
- ✅ Consistent error responses
- ✅ Token lifecycle management

### Assessment Endpoint

**`POST /api/v1/assessment/complete`**
- ✅ Complete safety assessments
- ✅ Edge case buildings (very old, very new, very tall, etc.)
- ✅ High/low seismic risk scenarios
- ✅ Dual authentication (platform + JWT)
- ✅ Input validation
- ✅ Response structure
- ✅ Unique assessment IDs
- ✅ Mobile app integration

### Utility Endpoints

**`GET /api/v1/status`**
- ✅ Return operational status
- ✅ Work without authentication

**`GET /api/v1/parameters`**
- ✅ Return valid parameter options
- ✅ Structural systems, regulations, soil types
- ✅ Require authentication

### Rate Limiting

- ✅ WEB_APP tier (10,000/hour)
- ✅ BATCH_JOB tier (1,000/hour)
- ✅ DEV_TESTING tier (500/hour)
- ✅ Per-service tracking
- ✅ Rate limit headers
- ✅ Exceeded limit handling
- ✅ Independent limits per app

### Integration Tests

- ✅ Complete web app user flow
- ✅ Complete mobile app user flow
- ✅ Multiple assessments per user
- ✅ Token refresh flow
- ✅ Error recovery
- ✅ Usage tracking

---

## 📱 For Mobile Developers

### Essential Test Files to Read

1. **`tests/integration/complete-user-flow.test.js`**
   - Shows complete mobile app integration
   - Demonstrates authentication → parameters → assessment flow
   - Includes error handling examples

2. **`tests/api/auth/issue-token.test.js`**
   - How to get JWT tokens for users
   - Custom metadata examples
   - Token expiration handling

3. **`tests/api/assessment/complete.test.js`**
   - How to perform building assessments
   - Required/optional fields
   - Edge case handling

4. **`tests/api/rate-limit/rate-limiting.test.js`**
   - Rate limit best practices
   - How to handle rate limit errors
   - Mobile app rate limiting

### Quick Example: Mobile App Flow

```javascript
// 1. User signs in → Request JWT from API
const issueRequest = {
  method: 'POST',
  url: 'https://quakewise.com/api/v1/auth/issue-token',
  headers: {
    'X-Platform-Token': 'YOUR_MOBILE_SERVICE_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: clerkUserId,
    appId: 'quakewise-mobile-api',
    tier: 'WEB_APP'
  })
};

const issueResponse = await fetch(issueRequest);
const { data: { token: userToken } } = await issueResponse.json();

// 2. Get valid parameters for UI dropdowns
const paramsRequest = {
  method: 'GET',
  url: 'https://quakewise.com/api/v1/parameters',
  headers: {
    'X-Platform-Token': 'YOUR_MOBILE_SERVICE_TOKEN'
  }
};

const paramsResponse = await fetch(paramsRequest);
const { data: parameters } = await paramsResponse.json();

// 3. User fills form → Submit assessment
const assessmentRequest = {
  method: 'POST',
  url: 'https://quakewise.com/api/v1/assessment/complete',
  headers: {
    'X-Platform-Token': 'YOUR_MOBILE_SERVICE_TOKEN',
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    location: {
      latitude: 41.0082,
      longitude: 28.9784
    },
    building: {
      structuralSystem: 'C2',
      numberOfStories: 5,
      yearOfConstruction: 2015,
      designRegulation: '2007-2018'
    }
  })
};

const assessmentResponse = await fetch(assessmentRequest);
const { data: assessment } = await assessmentResponse.json();

console.log('Safety Score:', assessment.safetyScore.overall);
```

See **`tests/integration/complete-user-flow.test.js`** for the complete working example.

---

## 🔧 Common Test Scenarios

### Test 1: Verify Your Service Token Works

```javascript
import { POST as issueToken } from '@/app/api/v1/auth/issue-token/route';

const request = createNextRequest({
  method: 'POST',
  url: 'http://localhost:3000/api/v1/auth/issue-token',
  headers: {
    'X-Platform-Token': 'YOUR_SERVICE_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: {
    userId: 'test_user_123',
    appId: 'your-app-id',
    tier: 'WEB_APP'
  }
});

const response = await issueToken(request);
expect(response.status).toBe(201);
```

### Test 2: Perform Sample Assessment

```javascript
import { POST as assessBuilding } from '@/app/api/v1/assessment/complete/route';

const request = createNextRequest({
  method: 'POST',
  url: 'http://localhost:3000/api/v1/assessment/complete',
  headers: {
    'X-Platform-Token': 'YOUR_SERVICE_TOKEN',
    'Authorization': 'Bearer YOUR_USER_JWT',
    'Content-Type': 'application/json'
  },
  body: {
    location: { latitude: 41.0082, longitude: 28.9784 },
    building: {
      structuralSystem: 'C2',
      numberOfStories: 5,
      yearOfConstruction: 2015,
      designRegulation: '2007-2018'
    }
  }
});

const response = await assessBuilding(request);
const data = await parseResponse(response);
expect(data.data.safetyScore.overall).toBeGreaterThanOrEqual(0);
```

### Test 3: Handle Rate Limiting

```javascript
// Check rate limit before making request
const currentCount = await getCurrentRateLimitCount('your-app-id', 'hour');
const rateLimit = 10000; // WEB_APP tier

if (currentCount >= rateLimit) {
  // Handle rate limit exceeded
  console.log('Rate limit exceeded, retry after reset');
} else {
  // Make request
  await makeApiRequest();
}
```

---

## 🐛 Troubleshooting

### Tests Failing with 401 Errors

**Problem:** Authentication failures

**Solution:**
1. Check service tokens are set in `.env.local`:
   ```bash
   SERVICE_TOKEN_WEB_APP=test-web-app-token-123
   SERVICE_TOKEN_MOBILE=test-mobile-token-456
   SERVICE_TOKEN_DEV=test-dev-token-789
   ```

2. Verify test database is seeded:
   ```bash
   npm run db:seed
   ```

3. Check `tests/setup.js` is creating test services correctly

### Tests Failing with Database Errors

**Problem:** Cannot connect to database

**Solution:**
1. Verify `DATABASE_URL` is set:
   ```bash
   echo $DATABASE_URL
   ```

2. Run database migrations:
   ```bash
   npm run db:push
   ```

3. Seed test data:
   ```bash
   npm run db:seed
   ```

### Rate Limit Tests Failing

**Problem:** Rate limits not resetting

**Solution:**
1. Clear rate limits before each test (already done in `beforeEach`)
2. Check `tests/setup.js` is running `beforeEach` hooks
3. Manually clear:
   ```javascript
   await clearRateLimits('your-app-id');
   ```

### Integration Tests Timeout

**Problem:** Tests take too long

**Solution:**
1. Increase timeout in `vitest.config.js`:
   ```javascript
   testTimeout: 60000, // 60 seconds
   ```

2. Run specific tests instead of all:
   ```bash
   npm test integration -- --run
   ```

---

## 📊 Test Reports

### Generate HTML Coverage Report

```bash
npm run test:coverage
```

Open `coverage/index.html` in your browser.

### Generate JSON Report

```bash
vitest run --reporter=json --outputFile=test-results.json
```

---

## 🔗 Related Documentation

- [API Documentation](../API_README.md)
- [Team Access Guide](../TEAM_ACCESS_GUIDE.md)
- [User Flow Diagram](../USER_FLOW_DIAGRAM.md)
- [Vercel Deployment Guide](../VERCEL_DEPLOYMENT_GUIDE.md)

---

## 📞 Support

**Questions about tests?**
- Check existing test files for examples
- Review integration tests for complete flows
- Contact DevOps team or post in #api-support

**Found a bug in tests?**
- Open an issue with failing test output
- Include environment details
- Provide steps to reproduce

---

## ✅ Quick Checklist for Mobile Developers

Before integrating the API:

- [ ] Read `tests/integration/complete-user-flow.test.js`
- [ ] Understand dual authentication (service token + JWT)
- [ ] Know your service token and app ID
- [ ] Understand rate limits for your tier
- [ ] Test authentication flow locally
- [ ] Test assessment endpoint with sample data
- [ ] Implement error handling for 401, 400, 429
- [ ] Implement token refresh logic
- [ ] Test with edge case buildings
- [ ] Review rate limiting best practices

---

**Happy Testing! 🧪**
