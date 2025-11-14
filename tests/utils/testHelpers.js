/**
 * Test Helper Functions
 * Common utilities used across all tests
 */

import { nanoid } from 'nanoid';
import * as jose from 'jose';

/**
 * Generate a test JWT token
 */
export async function generateTestJWT(payload = {}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const defaultPayload = {
    userId: 'test_user_123',
    appId: 'test-web-app',
    tier: 'WEB_APP',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    ...payload,
  };

  const jwt = await new jose.SignJWT(defaultPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(defaultPayload.iat)
    .setExpirationTime(defaultPayload.exp)
    .sign(secret);

  return jwt;
}

/**
 * Generate an expired JWT token
 */
export async function generateExpiredJWT(payload = {}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const expiredPayload = {
    userId: 'test_user_123',
    appId: 'test-web-app',
    tier: 'WEB_APP',
    iat: Math.floor(Date.now() / 1000) - 48 * 60 * 60, // 48 hours ago
    exp: Math.floor(Date.now() / 1000) - 24 * 60 * 60, // Expired 24 hours ago
    ...payload,
  };

  const jwt = await new jose.SignJWT(expiredPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(expiredPayload.iat)
    .setExpirationTime(expiredPayload.exp)
    .sign(secret);

  return jwt;
}

/**
 * Generate a JWT with invalid signature
 */
export async function generateInvalidJWT(payload = {}) {
  const wrongSecret = new TextEncoder().encode('wrong-secret-key-that-does-not-match');

  const invalidPayload = {
    userId: 'test_user_123',
    appId: 'test-web-app',
    tier: 'WEB_APP',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    ...payload,
  };

  const jwt = await new jose.SignJWT(invalidPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(invalidPayload.iat)
    .setExpiationTime(invalidPayload.exp)
    .sign(wrongSecret);

  return jwt;
}

/**
 * Create a mock API request object
 */
export function createMockRequest({ method = 'GET', headers = {}, body = null, url = '/' } = {}) {
  const request = {
    method,
    url,
    headers: new Map(Object.entries(headers)),
    body,
    json: async () => body,
  };

  // Add headers.get() method
  request.headers.get = function (key) {
    return this.get(key.toLowerCase());
  };

  return request;
}

/**
 * Create a mock Next.js API request
 */
export function createNextRequest({
  method = 'GET',
  headers = {},
  body = null,
  url = 'http://localhost:3000/api/v1/test',
} = {}) {
  const headersMap = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    headersMap.set(key, value);
  });

  return new Request(url, {
    method,
    headers: headersMap,
    body: body ? JSON.stringify(body) : null,
  });
}

/**
 * Parse JSON response
 */
export async function parseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

/**
 * Generate a unique test user ID
 */
export function generateTestUserId() {
  return `test_user_${nanoid(10)}`;
}

/**
 * Generate a unique test app ID
 */
export function generateTestAppId() {
  return `test_app_${nanoid(10)}`;
}

/**
 * Wait for a specified time (for rate limit tests)
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create test building data for assessments
 */
export function createTestBuildingData(overrides = {}) {
  return {
    location: {
      latitude: 41.0082,
      longitude: 28.9784,
      ...overrides.location,
    },
    building: {
      structuralSystem: 'C2',
      numberOfStories: 5,
      yearOfConstruction: 2010,
      designRegulation: '2007-2018',
      totalFloorArea: 1000,
      softStory: false,
      planIrregularity: 'none',
      verticalIrregularity: 'none',
      apparentQuality: 'good',
      maintenance: 'good',
      soil: {
        type: 'Z2',
        slope: 0,
      },
      ...overrides.building,
    },
  };
}

/**
 * Validate API response structure
 */
export function validateSuccessResponse(response) {
  return (
    response &&
    typeof response === 'object' &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Validate API error response structure
 */
export function validateErrorResponse(response) {
  return (
    response &&
    typeof response === 'object' &&
    (response.success === false || response.error) &&
    'message' in response
  );
}

/**
 * Create headers for authenticated request
 */
export function createAuthHeaders(platformToken, jwtToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Platform-Token': platformToken,
  };

  if (jwtToken) {
    headers.Authorization = `Bearer ${jwtToken}`;
  }

  return headers;
}

/**
 * Simulate multiple requests (for rate limit testing)
 */
export async function simulateRequests(requestFn, count) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(requestFn());
  }
  return Promise.all(promises);
}

/**
 * Get current rate limit count from database
 */
export async function getCurrentRateLimitCount(appId, type = 'hour') {
  const now = new Date();
  const resetTime =
    type === 'hour'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

  const record = await global.prisma.apiRateLimit.findFirst({
    where: {
      appId,
      type,
      resetAt: {
        gte: now,
      },
    },
  });

  return record?.requestCount || 0;
}

/**
 * Clear all rate limits for an app
 */
export async function clearRateLimits(appId) {
  await global.prisma.apiRateLimit.deleteMany({
    where: { appId },
  });
}

/**
 * Get API usage count for a user
 */
export async function getApiUsageCount(userId, appId = null) {
  const where = { userId };
  if (appId) {
    where.appId = appId;
  }

  return global.prisma.apiUsage.count({ where });
}

/**
 * Assert response status code
 */
export function assertStatusCode(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}`
    );
  }
}

/**
 * Assert response has required fields
 */
export function assertHasFields(obj, fields) {
  const missing = fields.filter((field) => !(field in obj));
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
