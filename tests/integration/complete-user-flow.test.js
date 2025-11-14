/**
 * Integration Tests: Complete User Flow
 * End-to-end tests simulating real mobile app usage
 * CRITICAL FOR MOBILE APP DEVELOPERS
 */

import { describe, it, expect } from 'vitest';
import { POST as issueToken } from '@/app/api/v1/auth/issue-token/route';
import { POST as verifyToken } from '@/app/api/v1/auth/verify-token/route';
import { POST as assessBuilding } from '@/app/api/v1/assessment/complete/route';
import { GET as getParameters } from '@/app/api/v1/parameters/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
  generateTestUserId,
  getApiUsageCount,
} from '../utils/testHelpers';
import { createTokenRequest, createMockAssessmentData, TEST_TOKENS } from '../utils/mockData';

describe('[Integration] Complete User Flow', () => {
  const webAppToken = TEST_TOKENS.valid.webApp;
  const mobileAppToken = TEST_TOKENS.valid.mobile;

  describe('🌐 Web App User Journey', () => {
    it('should complete full assessment flow for web app user', async () => {
      const userId = generateTestUserId();

      // Step 1: User signs in to web app → Web app requests JWT
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({ userId, appId: 'test-web-app' }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);

      expect(issueResponse.status).toBe(201);
      expect(issueData.data.token).toBeDefined();

      const userJWT = issueData.data.token;

      // Step 2: Web app verifies the token (optional but good practice)
      const verifyRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/verify-token',
        headers: createAuthHeaders(webAppToken),
        body: { token: userJWT },
      });

      const verifyResponse = await verifyToken(verifyRequest);
      const verifyData = await parseResponse(verifyResponse);

      expect(verifyData.data.valid).toBe(true);
      expect(verifyData.data.payload.userId).toBe(userId);

      // Step 3: User performs building assessment
      const assessmentRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, userJWT),
        body: createMockAssessmentData(),
      });

      const assessmentResponse = await assessBuilding(assessmentRequest);
      const assessmentData = await parseResponse(assessmentResponse);

      expect(assessmentResponse.status).toBe(200);
      expect(assessmentData.data.safetyScore).toBeDefined();
      expect(assessmentData.data.assessmentId).toBeDefined();

      // Step 4: Verify API usage was tracked
      const usageCount = await getApiUsageCount(userId, 'test-web-app');
      expect(usageCount).toBeGreaterThan(0);
    });
  });

  describe('📱 Mobile App User Journey', () => {
    it('should complete full assessment flow for mobile app user', async () => {
      const userId = generateTestUserId();

      // Step 1: Mobile app requests JWT after user signs in
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(mobileAppToken),
        body: createTokenRequest({
          userId,
          appId: 'test-mobile-app',
          tier: 'WEB_APP',
          metadata: {
            deviceType: 'iOS',
            appVersion: '2.1.0',
          },
        }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);

      expect(issueResponse.status).toBe(201);
      const userJWT = issueData.data.token;

      // Step 2: Mobile app fetches valid parameters for UI dropdowns
      const paramsRequest = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/parameters',
        headers: createAuthHeaders(mobileAppToken),
      });

      const paramsResponse = await getParameters(paramsRequest);
      const paramsData = await parseResponse(paramsResponse);

      expect(paramsResponse.status).toBe(200);
      expect(paramsData.data.structuralSystems).toBeDefined();

      // Step 3: User fills form and submits assessment
      const assessmentData = createMockAssessmentData({
        building: {
          structuralSystem: paramsData.data.structuralSystems[0], // Use valid option
          numberOfStories: 5,
          yearOfConstruction: 2015,
          designRegulation: paramsData.data.designRegulations[0],
        },
      });

      const assessmentRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(mobileAppToken, userJWT),
        body: assessmentData,
      });

      const assessmentResponse = await assessBuilding(assessmentRequest);
      const assessmentResult = await parseResponse(assessmentResponse);

      expect(assessmentResponse.status).toBe(200);
      expect(assessmentResult.data.safetyScore.overall).toBeGreaterThanOrEqual(0);
      expect(assessmentResult.data.safetyScore.overall).toBeLessThanOrEqual(100);
    });

    it('should handle multiple assessments by the same user', async () => {
      const userId = generateTestUserId();

      // Issue token once
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(mobileAppToken),
        body: createTokenRequest({ userId, appId: 'test-mobile-app' }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const userJWT = issueData.data.token;

      // Perform 3 assessments with the same token
      const assessmentIds = [];

      for (let i = 0; i < 3; i++) {
        const assessmentRequest = createNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/v1/assessment/complete',
          headers: createAuthHeaders(mobileAppToken, userJWT),
          body: createMockAssessmentData(),
        });

        const assessmentResponse = await assessBuilding(assessmentRequest);
        const assessmentData = await parseResponse(assessmentResponse);

        expect(assessmentResponse.status).toBe(200);
        assessmentIds.push(assessmentData.data.assessmentId);
      }

      // Verify all assessments have unique IDs
      const uniqueIds = new Set(assessmentIds);
      expect(uniqueIds.size).toBe(3);

      // Verify usage tracking
      const usageCount = await getApiUsageCount(userId, 'test-mobile-app');
      expect(usageCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('🔄 Token Refresh Flow', () => {
    it('should handle token expiration gracefully', async () => {
      const userId = generateTestUserId();

      // Issue token with short expiration
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({
          userId,
          appId: 'test-web-app',
          expiresIn: '1h',
        }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const token1 = issueData.data.token;

      // Perform assessment with first token
      const assessment1Request = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, token1),
        body: createMockAssessmentData(),
      });

      const assessment1Response = await assessBuilding(assessment1Request);
      expect(assessment1Response.status).toBe(200);

      // Simulate token refresh (mobile app requests new token)
      const refreshRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({ userId, appId: 'test-web-app' }),
      });

      const refreshResponse = await issueToken(refreshRequest);
      const refreshData = await parseResponse(refreshResponse);
      const token2 = refreshData.data.token;

      expect(token2).not.toBe(token1); // New token should be different

      // Perform assessment with new token
      const assessment2Request = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, token2),
        body: createMockAssessmentData(),
      });

      const assessment2Response = await assessBuilding(assessment2Request);
      expect(assessment2Response.status).toBe(200);
    });
  });

  describe('❌ Error Recovery Flow', () => {
    it('should handle authentication errors gracefully', async () => {
      const userId = generateTestUserId();

      // Step 1: Get valid token
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({ userId }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const validToken = issueData.data.token;

      // Step 2: Try assessment with wrong platform token
      const wrongPlatformRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders('wrong-token', validToken),
        body: createMockAssessmentData(),
      });

      const wrongPlatformResponse = await assessBuilding(wrongPlatformRequest);
      expect(wrongPlatformResponse.status).toBe(401);

      // Step 3: Retry with correct credentials
      const correctRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, validToken),
        body: createMockAssessmentData(),
      });

      const correctResponse = await assessBuilding(correctRequest);
      expect(correctResponse.status).toBe(200);
    });

    it('should handle validation errors and allow retry', async () => {
      const userId = generateTestUserId();

      // Get token
      const issueRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({ userId }),
      });

      const issueResponse = await issueToken(issueRequest);
      const issueData = await parseResponse(issueResponse);
      const userToken = issueData.data.token;

      // Try with invalid data
      const invalidRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, userToken),
        body: { location: { latitude: 41.0082 } }, // Missing longitude and building
      });

      const invalidResponse = await assessBuilding(invalidRequest);
      expect(invalidResponse.status).toBe(400);

      // Retry with valid data
      const validRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/assessment/complete',
        headers: createAuthHeaders(webAppToken, userToken),
        body: createMockAssessmentData(),
      });

      const validResponse = await assessBuilding(validRequest);
      expect(validResponse.status).toBe(200);
    });
  });

  describe('📊 Usage Tracking Integration', () => {
    it('should track all API calls for analytics', async () => {
      const userId = generateTestUserId();
      const initialCount = await getApiUsageCount(userId);

      // Issue token
      await issueToken(createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(webAppToken),
        body: createTokenRequest({ userId }),
      }));

      // Get parameters
      await getParameters(createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/parameters',
        headers: createAuthHeaders(webAppToken),
      }));

      // Final count should be higher
      const finalCount = await getApiUsageCount(userId);
      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });
});
