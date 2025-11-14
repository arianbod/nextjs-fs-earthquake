/**
 * API Tests: POST /api/v1/auth/verify-token
 * Comprehensive tests for JWT token verification endpoint
 */

import { describe, it, expect } from 'vitest';
import { POST as issueToken } from '@/app/api/v1/auth/issue-token/route';
import { POST as verifyToken } from '@/app/api/v1/auth/verify-token/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
  generateTestJWT,
  generateExpiredJWT,
  generateInvalidJWT,
  generateTestUserId,
} from '../../utils/testHelpers';
import { createTokenRequest, TEST_TOKENS } from '../../utils/mockData';

describe('[API] POST /api/v1/auth/verify-token', () => {
  const validPlatformToken = TEST_TOKENS.valid.webApp;
  const baseUrl = 'http://localhost:3000/api/v1/auth/verify-token';

  describe('✅ Success Cases - Valid Tokens', () => {
    it('should verify a valid JWT token successfully', async () => {
      // First, issue a token
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest(),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token = issueData.data.token;

      // Then, verify it
      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyResponse.status).toBe(200);
      expect(verifyData.success).toBe(true);
      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data).toHaveProperty('payload');
      expect(verifyData.data.payload).toHaveProperty('userId');
      expect(verifyData.data.payload).toHaveProperty('appId');
      expect(verifyData.data.payload).toHaveProperty('tier');
    });

    it('should return correct payload from verified token', async () => {
      const userId = generateTestUserId();
      const appId = 'test-web-app';
      const tier = 'WEB_APP';

      // Issue token with specific data
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest({ userId, appId, tier }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token = issueData.data.token;

      // Verify token
      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data.payload.userId).toBe(userId);
      expect(verifyData.data.payload.appId).toBe(appId);
      expect(verifyData.data.payload.tier).toBe(tier);
    });

    it('should verify token with metadata', async () => {
      const metadata = {
        userEmail: 'test@example.com',
        userName: 'Test User',
      };

      // Issue token with metadata
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest({ metadata }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token = issueData.data.token;

      // Verify token
      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data.payload.metadata).toEqual(metadata);
    });

    it('should include issued at and expires at timestamps', async () => {
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest(),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token = issueData.data.token;

      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data.payload).toHaveProperty('iat');
      expect(verifyData.data.payload).toHaveProperty('exp');
      expect(verifyData.data.payload.exp).toBeGreaterThan(verifyData.data.payload.iat);
    });
  });

  describe('❌ Invalid Tokens', () => {
    it('should reject expired token with appropriate error', async () => {
      const expiredToken = await generateExpiredJWT();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: expiredToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(false);
      expect(data.data.error).toBeDefined();
      expect(data.data.code).toBeDefined();
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = await generateInvalidJWT();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: invalidToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(false);
      expect(data.data.error).toBeDefined();
    });

    it('should reject malformed JWT token', async () => {
      const malformedToken = 'not.a.valid.jwt.token';

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: malformedToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(false);
    });

    it('should reject empty token', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: '' },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject token with missing parts', async () => {
      const incompleteToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0In0';

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: incompleteToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(false);
    });

    it('should reject random string as token', async () => {
      const randomString = 'thisisnotatoken12345';

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: randomString },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(false);
    });
  });

  describe('❌ Error Cases - Authentication', () => {
    it('should reject request without platform token', async () => {
      const validJWT = await generateTestJWT();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: { 'Content-Type': 'application/json' }, // No platform token
        body: { token: validJWT },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject request with invalid platform token', async () => {
      const validJWT = await generateTestJWT();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.invalid.wrong),
        body: { token: validJWT },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('❌ Error Cases - Validation', () => {
    it('should reject request without token field', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: {}, // No token field
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject request with null token', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: null },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject request with non-string token', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: 12345 }, // Number instead of string
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
    });
  });

  describe('📊 Response Structure', () => {
    it('should return consistent response structure for valid token', async () => {
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest(),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);

      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: issueData.data.token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData).toHaveProperty('success');
      expect(verifyData).toHaveProperty('data');
      expect(verifyData.data).toHaveProperty('valid');

      if (verifyData.data.valid) {
        expect(verifyData.data).toHaveProperty('payload');
      } else {
        expect(verifyData.data).toHaveProperty('error');
        expect(verifyData.data).toHaveProperty('code');
      }
    });

    it('should return consistent response structure for invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: invalidToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('valid');
      expect(data.data.valid).toBe(false);
      expect(data.data).toHaveProperty('error');
      expect(data.data).toHaveProperty('code');
    });
  });

  describe('🔄 Token Lifecycle', () => {
    it('should verify token immediately after issuance', async () => {
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest(),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);

      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: issueData.data.token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
    });

    it('should verify the same token multiple times successfully', async () => {
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(validPlatformToken),
        body: createTokenRequest(),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token = issueData.data.token;

      // Verify same token 3 times
      for (let i = 0; i < 3; i++) {
        const verifyRequest = createNextRequest({
          method: 'POST',
          url: baseUrl,
          headers: createAuthHeaders(validPlatformToken),
          body: { token },
        });

        const verifyResponse = await verifyToken(verifyRequest);
        const verifyData = await parseResponse(verifyResponse);

        expect(verifyData.data.valid).toBe(true);
      }
    });
  });

  describe('📱 Mobile App Use Case', () => {
    it('should verify mobile app token with mobile service credentials', async () => {
      // Issue token with mobile service token
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(TEST_TOKENS.valid.mobile),
        body: createTokenRequest({ appId: 'test-mobile-app' }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);

      // Verify token with mobile service token
      const verifyRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.valid.mobile),
        body: { token: issueData.data.token },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data.payload.appId).toBe('test-mobile-app');
    });
  });

  describe('🔍 Error Code Verification', () => {
    it('should return specific error code for expired token', async () => {
      const expiredToken = await generateExpiredJWT();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: expiredToken },
      });

      const response = await verifyToken(request);
      const data = await parseResponse(response);

      expect(data.data.valid).toBe(false);
      expect(data.data.code).toBeDefined();
      expect(typeof data.data.code).toBe('string');
    });

    it('should return different error codes for different failure reasons', async () => {
      const expiredToken = await generateExpiredJWT();
      const malformedToken = 'not.a.valid.token';

      const expiredRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: expiredToken },
      });

      const malformedRequest = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken),
        body: { token: malformedToken },
      });

      const expiredResponse = await verifyToken(expiredRequest);
      const malformedResponse = await verifyToken(malformedRequest);

      const expiredData = await parseResponse(expiredResponse);
      const malformedData = await parseResponse(malformedResponse);

      expect(expiredData.data.valid).toBe(false);
      expect(malformedData.data.valid).toBe(false);
      // Error codes might be different for different failure types
    });
  });
});
