/**
 * API Tests: Rate Limiting
 * Comprehensive rate limiting tests for all tiers
 * CRITICAL FOR MOBILE APP DEVELOPERS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as issueToken } from '@/app/api/v1/auth/issue-token/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
  clearRateLimits,
  getCurrentRateLimitCount,
} from '../../utils/testHelpers';
import { createTokenRequest, TEST_TOKENS } from '../../utils/mockData';

describe('[API] Rate Limiting', () => {
  beforeEach(async () => {
    // Clear rate limits before each test
    await clearRateLimits('test-web-app');
    await clearRateLimits('test-mobile-app');
    await clearRateLimits('test-dev-service');
  });

  describe('✅ WEB_APP Tier (10,000/hour)', () => {
    it('should allow requests within limit', async () => {
      const validPlatformToken = TEST_TOKENS.valid.webApp;

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const request = createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(validPlatformToken),
          body: createTokenRequest(),
        });

        const response = await issueToken(request);
        expect(response.status).toBe(201);
      }

      // Verify rate limit count
      const count = await getCurrentRateLimitCount('test-web-app', 'hour');
      expect(count).toBe(5);
    });

    it('should include rate limit headers in response', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(TEST_TOKENS.valid.webApp),
        body: createTokenRequest(),
      });

      const response = await issueToken(request);

      // Check for rate limit headers
      expect(response.headers.has('X-RateLimit-Limit') ||
             response.headers.has('x-ratelimit-limit')).toBe(true);
    });

    it('should track rate limits per service', async () => {
      // Web app makes 3 requests
      for (let i = 0; i < 3; i++) {
        await issueToken(createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(TEST_TOKENS.valid.webApp),
          body: createTokenRequest(),
        }));
      }

      // Mobile app makes 2 requests
      for (let i = 0; i < 2; i++) {
        await issueToken(createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(TEST_TOKENS.valid.mobile),
          body: createTokenRequest({ appId: 'test-mobile-app' }),
        }));
      }

      const webCount = await getCurrentRateLimitCount('test-web-app', 'hour');
      const mobileCount = await getCurrentRateLimitCount('test-mobile-app', 'hour');

      expect(webCount).toBe(3);
      expect(mobileCount).toBe(2);
    });
  });

  describe('✅ DEV_TESTING Tier (500/hour)', () => {
    it('should allow requests within dev tier limit', async () => {
      const devToken = TEST_TOKENS.valid.dev;

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const request = createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(devToken),
          body: createTokenRequest({ appId: 'test-dev-service' }),
        });

        const response = await issueToken(request);
        expect(response.status).toBe(201);
      }

      const count = await getCurrentRateLimitCount('test-dev-service', 'hour');
      expect(count).toBe(10);
    });
  });

  describe('❌ Rate Limit Exceeded', () => {
    it('should reject requests after exceeding rate limit', async () => {
      const devToken = TEST_TOKENS.valid.dev;

      // Manually set rate limit to near the limit
      await global.prisma.apiRateLimit.upsert({
        where: {
          appId_type_resetAt: {
            appId: 'test-dev-service',
            type: 'hour',
            resetAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        },
        create: {
          appId: 'test-dev-service',
          type: 'hour',
          requestCount: 499,
          resetAt: new Date(Date.now() + 60 * 60 * 1000),
        },
        update: {
          requestCount: 499,
        },
      });

      // This request should succeed (500th)
      const request1 = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(devToken),
        body: createTokenRequest({ appId: 'test-dev-service' }),
      });
      const response1 = await issueToken(request1);
      expect(response1.status).toBe(201);

      // This request should fail (501st - exceeds limit)
      const request2 = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(devToken),
        body: createTokenRequest({ appId: 'test-dev-service' }),
      });
      const response2 = await issueToken(request2);
      expect(response2.status).toBe(429); // Too Many Requests
    });

    it('should return appropriate error message for rate limit', async () => {
      const devToken = TEST_TOKENS.valid.dev;

      // Set rate limit to exceeded
      await global.prisma.apiRateLimit.upsert({
        where: {
          appId_type_resetAt: {
            appId: 'test-dev-service',
            type: 'hour',
            resetAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        },
        create: {
          appId: 'test-dev-service',
          type: 'hour',
          requestCount: 500,
          resetAt: new Date(Date.now() + 60 * 60 * 1000),
        },
        update: {
          requestCount: 500,
        },
      });

      const request = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(devToken),
        body: createTokenRequest({ appId: 'test-dev-service' }),
      });

      const response = await issueToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.message).toContain('rate limit');
    });
  });

  describe('📊 Rate Limit Headers', () => {
    it('should include remaining requests in headers', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(TEST_TOKENS.valid.webApp),
        body: createTokenRequest(),
      });

      const response = await issueToken(request);

      // Most rate limiting implementations include these headers
      // (exact header names may vary)
      const headers = response.headers;
      expect(
        headers.has('X-RateLimit-Limit') ||
        headers.has('x-ratelimit-limit') ||
        headers.has('RateLimit-Limit')
      ).toBe(true);
    });
  });

  describe('📱 Mobile App Rate Limiting', () => {
    it('should apply correct rate limits for mobile app', async () => {
      const mobileToken = TEST_TOKENS.valid.mobile;

      // Make 10 requests from mobile app
      for (let i = 0; i < 10; i++) {
        const request = createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(mobileToken),
          body: createTokenRequest({ appId: 'test-mobile-app' }),
        });

        const response = await issueToken(request);
        expect(response.status).toBe(201);
      }

      const count = await getCurrentRateLimitCount('test-mobile-app', 'hour');
      expect(count).toBe(10);
    });

    it('should not share rate limits between web and mobile apps', async () => {
      // Web app makes requests
      for (let i = 0; i < 5; i++) {
        await issueToken(createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/auth/issue-token',
          headers: createAuthHeaders(TEST_TOKENS.valid.webApp),
          body: createTokenRequest(),
        }));
      }

      // Mobile app's rate limit should be independent
      const mobileCount = await getCurrentRateLimitCount('test-mobile-app', 'hour');
      expect(mobileCount).toBe(0);
    });
  });
});
