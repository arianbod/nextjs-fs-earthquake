/**
 * API Tests: POST /api/v1/assessment/complete
 * Comprehensive tests for building safety assessment endpoint
 * CRITICAL FOR MOBILE APP DEVELOPERS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as issueToken } from '@/app/api/v1/auth/issue-token/route';
import { POST as assessBuilding } from '@/app/api/v1/assessment/complete/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
  generateTestUserId,
} from '../../utils/testHelpers';
import {
  createMockAssessmentData,
  createTokenRequest,
  TEST_TOKENS,
  EDGE_CASE_BUILDINGS,
  INVALID_BUILDINGS,
} from '../../utils/mockData';

describe('[API] POST /api/v1/assessment/complete', () => {
  const validPlatformToken = TEST_TOKENS.valid.webApp;
  const baseUrl = 'http://localhost:3000/api/v1/assessment/complete';
  let userToken;

  beforeEach(async () => {
    // Issue a user token before each test
    const issueRequest = createNextRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/auth/issue-token',
      headers: createAuthHeaders(validPlatformToken),
      body: createTokenRequest({ userId: generateTestUserId() }),
    });

    const issueResponse = await issueToken(issueRequest);
    const issueData = await parseResponse(issueResponse);
    userToken = issueData.data.token;
  });

  describe('✅ Success Cases - Basic Assessment', () => {
    it('should perform complete assessment with valid data', async () => {
      const assessmentData = createMockAssessmentData();

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('assessmentId');
      expect(data.data).toHaveProperty('safetyScore');
      expect(data.data.safetyScore).toHaveProperty('overall');
    });

    it('should return safety score with all components', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(data.data.safetyScore).toHaveProperty('overall');
      expect(data.data.safetyScore).toHaveProperty('structural');
      expect(data.data.safetyScore).toHaveProperty('seismic');
      expect(data.data.safetyScore).toHaveProperty('environmental');
    });

    it('should include seismic data in response', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(data.data).toHaveProperty('seismicData');
    });

    it('should include recommendations', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(data.data).toHaveProperty('recommendations');
      expect(Array.isArray(data.data.recommendations)).toBe(true);
    });
  });

  describe('✅ Edge Case Buildings', () => {
    it('should assess very old building correctly', async () => {
      const assessmentData = createMockAssessmentData({
        building: EDGE_CASE_BUILDINGS.veryOld,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.safetyScore.overall).toBeLessThan(70); // Old building should have lower score
    });

    it('should assess very new building correctly', async () => {
      const assessmentData = createMockAssessmentData({
        building: EDGE_CASE_BUILDINGS.veryNew,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.safetyScore.overall).toBeGreaterThan(60); // New building should have higher score
    });

    it('should assess very tall building', async () => {
      const assessmentData = createMockAssessmentData({
        building: EDGE_CASE_BUILDINGS.veryTall,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should assess high seismic risk building', async () => {
      const assessmentData = createMockAssessmentData({
        building: EDGE_CASE_BUILDINGS.highSeismicRisk,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.safetyScore.overall).toBeLessThan(50);
    });

    it('should assess low seismic risk building', async () => {
      const assessmentData = createMockAssessmentData({
        building: EDGE_CASE_BUILDINGS.lowSeismicRisk,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: assessmentData,
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.data.safetyScore.overall).toBeGreaterThan(70);
    });
  });

  describe('❌ Error Cases - Authentication', () => {
    it('should reject request without platform token', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(401);
    });

    it('should reject request without user JWT token', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: { 'X-Platform-Token': validPlatformToken, 'Content-Type': 'application/json' },
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(401);
    });

    it('should reject request with both tokens missing', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: { 'Content-Type': 'application/json' },
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(401);
    });
  });

  describe('❌ Error Cases - Validation', () => {
    it('should reject request with missing location', async () => {
      const invalidData = createMockAssessmentData();
      delete invalidData.location;

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: invalidData,
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(400);
    });

    it('should reject request with missing building data', async () => {
      const invalidData = createMockAssessmentData();
      delete invalidData.building;

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: invalidData,
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid structural system', async () => {
      const invalidData = createMockAssessmentData({
        building: INVALID_BUILDINGS.invalidStructuralSystem,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: invalidData,
      });

      const response = await assessBuilding(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject negative number of stories', async () => {
      const invalidData = createMockAssessmentData({
        building: INVALID_BUILDINGS.negativeStories,
      });

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: invalidData,
      });

      const response = await assessBuilding(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('📱 Mobile App Use Cases', () => {
    it('should work with mobile app service token', async () => {
      // Issue token with mobile credentials
      const mobileTokenRequest = createNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/auth/issue-token',
        headers: createAuthHeaders(TEST_TOKENS.valid.mobile),
        body: createTokenRequest({ appId: 'test-mobile-app', userId: generateTestUserId() }),
      });

      const mobileTokenResponse = await issueToken(mobileTokenRequest);
      const mobileTokenData = await parseResponse(mobileTokenResponse);
      const mobileUserToken = mobileTokenData.data.token;

      // Use mobile tokens for assessment
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(TEST_TOKENS.valid.mobile, mobileUserToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle assessment without optional images', async () => {
      const minimalData = {
        location: { latitude: 41.0082, longitude: 28.9784 },
        building: {
          structuralSystem: 'C2',
          numberOfStories: 5,
          yearOfConstruction: 2010,
          designRegulation: '2007-2018',
        },
      };

      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: minimalData,
      });

      const response = await assessBuilding(request);
      expect(response.status).toBe(200);
    });
  });

  describe('📊 Response Structure & Metadata', () => {
    it('should include processing time in metadata', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(data).toHaveProperty('metadata');
      expect(data.metadata).toHaveProperty('processingTime');
      expect(typeof data.metadata.processingTime).toBe('number');
    });

    it('should include timestamp in metadata', async () => {
      const request = createNextRequest({
        method: 'POST',
        url: baseUrl,
        headers: createAuthHeaders(validPlatformToken, userToken),
        body: createMockAssessmentData(),
      });

      const response = await assessBuilding(request);
      const data = await parseResponse(response);

      expect(data.metadata).toHaveProperty('timestamp');
      const timestamp = new Date(data.metadata.timestamp);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return unique assessment ID for each request', async () => {
      const assessmentIds = [];

      for (let i = 0; i < 3; i++) {
        const request = createNextRequest({
          method: 'POST',
          url: baseUrl,
          headers: createAuthHeaders(validPlatformToken, userToken),
          body: createMockAssessmentData(),
        });

        const response = await assessBuilding(request);
        const data = await parseResponse(response);
        assessmentIds.push(data.data.assessmentId);
      }

      const uniqueIds = new Set(assessmentIds);
      expect(uniqueIds.size).toBe(3);
    });
  });
});
