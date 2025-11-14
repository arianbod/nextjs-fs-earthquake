/**
 * API Tests: POST /api/v1/auth/issue-token
 * Comprehensive tests for JWT token issuance endpoint
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/v1/auth/issue-token/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
  generateTestUserId,
  validateSuccessResponse,
  validateErrorResponse,
} from '../../utils/testHelpers';
import {
  createTokenRequest,
  createInvalidTokenRequest,
  TEST_TOKENS,
} from '../../utils/mockData';
import * as jose from 'jose';

describe('[API] POST /api/v1/auth/issue-token', () => {
  const validPlatformToken = TEST_TOKENS.valid.webApp;
  const baseUrl = 'http://localhost:3000/api/v1/auth/issue-token';

  describe('✅ Success Cases', () => {
    it('should issue a valid JWT token with valid platform token and request body', async () => {
      const requestBody = createTokenRequest();
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(validateSuccessResponse(data)).toBe(true);
      expect(data.data).toHaveProperty('token');
      expect(data.data).toHaveProperty('expiresAt');
      expect(data.data).toHaveProperty('expiresIn');
      expect(typeof data.data.token).toBe('string');
      expect(data.data.token.split('.').length).toBe(3); // Valid JWT format
    });

    it('should issue token with default tier when tier is not specified', async () => {
      const requestBody = {
        userId: generateTestUserId(),
        appId: 'test-web-app',
        // No tier specified
      };

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify token contains default tier
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.tier).toBeDefined();
    });

    it('should issue token with custom metadata', async () => {
      const customMetadata = {
        userEmail: 'test@example.com',
        userName: 'Test User',
        customField: 'customValue',
      };

      const requestBody = createTokenRequest({
        metadata: customMetadata,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify token contains metadata
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.metadata).toEqual(customMetadata);
    });

    it('should issue token with custom expiration time', async () => {
      const requestBody = createTokenRequest({
        expiresIn: '1h', // 1 hour
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.expiresIn).toBe(3600); // 1 hour in seconds
    });

    it('should issue different tokens for different users', async () => {
      const user1Request = createTokenRequest({ userId: 'user_1' });
      const user2Request = createTokenRequest({ userId: 'user_2' });

      const request1 = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: user1Request,
      });

      const request2 = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: user2Request,
      });

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      const data1 = await parseResponse(response1);
      const data2 = await parseResponse(response2);

      expect(data1.data.token).not.toBe(data2.data.token);

      // Verify each token has correct userId
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const payload1 = await jose.jwtVerify(data1.data.token, secret);
      const payload2 = await jose.jwtVerify(data2.data.token, secret);

      expect(payload1.payload.userId).toBe('user_1');
      expect(payload2.payload.userId).toBe('user_2');
    });

    it('should issue token for WEB_APP tier', async () => {
      const requestBody = createTokenRequest({ tier: 'WEB_APP' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.tier).toBe('WEB_APP');
    });

    it('should issue token for BATCH_JOB tier', async () => {
      const requestBody = createTokenRequest({ tier: 'BATCH_JOB' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.tier).toBe('BATCH_JOB');
    });

    it('should issue token for DEV_TESTING tier', async () => {
      const requestBody = createTokenRequest({ tier: 'DEV_TESTING' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.tier).toBe('DEV_TESTING');
    });
  });

  describe('❌ Error Cases - Authentication', () => {
    it('should reject request without platform token', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: { 'Content-Type': 'application/json' }, // No X-Platform-Token
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with invalid platform token', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.invalid.wrong),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with empty platform token', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.invalid.empty),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with inactive service token', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.invalid.inactive),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(validateErrorResponse(data)).toBe(true);
      expect(data.message).toContain('Invalid service token');
    });
  });

  describe('❌ Error Cases - Validation', () => {
    it('should reject request without userId', async () => {
      const requestBody = createInvalidTokenRequest('userId');

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request without appId', async () => {
      const requestBody = createInvalidTokenRequest('appId');

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with empty userId', async () => {
      const requestBody = createTokenRequest({ userId: '' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with empty appId', async () => {
      const requestBody = createTokenRequest({ appId: '' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with invalid JSON body', async () => {
      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': validPlatformToken,
        },
        body: 'invalid json{',
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(validateErrorResponse(data)).toBe(true);
    });

    it('should reject request with invalid expiresIn format', async () => {
      const requestBody = createTokenRequest({ expiresIn: 'invalid' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(validateErrorResponse(data)).toBe(true);
    });
  });

  describe('🔍 Token Verification', () => {
    it('should create a valid JWT that can be verified', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);

      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);

      expect(payload.userId).toBe(requestBody.userId);
      expect(payload.appId).toBe(requestBody.appId);
      expect(payload.tier).toBeDefined();
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should include all required claims in JWT', async () => {
      const requestBody = createTokenRequest({
        userId: 'specific_user_123',
        appId: 'specific_app_456',
        tier: 'WEB_APP',
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);

      // Required claims
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('appId');
      expect(payload).toHaveProperty('tier');
      expect(payload).toHaveProperty('iat'); // Issued at
      expect(payload).toHaveProperty('exp'); // Expiration
    });

    it('should set correct expiration time', async () => {
      const requestBody = createTokenRequest({ expiresIn: '2h' });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);

      const now = Math.floor(Date.now() / 1000);
      const expectedExpiry = now + 7200; // 2 hours
      const tolerance = 10; // 10 seconds tolerance

      expect(payload.exp).toBeGreaterThan(expectedExpiry - tolerance);
      expect(payload.exp).toBeLessThan(expectedExpiry + tolerance);
    });
  });

  describe('📊 Response Structure', () => {
    it('should return response with correct structure', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('token');
      expect(data.data).toHaveProperty('expiresAt');
      expect(data.data).toHaveProperty('expiresIn');
    });

    it('should return ISO 8601 formatted expiresAt', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      const expiresAt = data.data.expiresAt;
      expect(expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      const expiryDate = new Date(expiresAt);
      expect(expiryDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return expiresIn in seconds', async () => {
      const requestBody = createTokenRequest();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(typeof data.data.expiresIn).toBe('number');
      expect(data.data.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('🔄 Multiple Requests', () => {
    it('should handle multiple concurrent token issuance requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const requestBody = createTokenRequest({ userId: `concurrent_user_${i}` });

        const request = createNextRequest({
          method: 'POST',
          url: baseUrl,
          headers: createAuthHeaders(validPlatformToken),
          body: requestBody,
        });

        return POST(request);
      });

      const responses = await Promise.all(promises);

      for (const response of responses) {
        expect(response.status).toBe(201);
        const data = await parseResponse(response);
        expect(data.success).toBe(true);
        expect(data.data.token).toBeDefined();
      }

      // Verify all tokens are unique
      const tokens = await Promise.all(
        responses.map(async (r) => {
          const d = await parseResponse(r);
          return d.data.token;
        })
      );

      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10);
    });
  });

  describe('📱 Mobile App Use Case', () => {
    it('should issue token for mobile app with mobile service token', async () => {
      const requestBody = createTokenRequest({
        appId: 'test-mobile-app',
        tier: 'WEB_APP',
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.valid.mobile),
        body: requestBody,
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(data.data.token, secret);
      expect(payload.appId).toBe('test-mobile-app');
    });
  });
});
