/**
 * API Tests: Utility Endpoints
 * Tests for status, parameters, and usage endpoints
 */

import { describe, it, expect } from 'vitest';
import { GET as getStatus } from '@/app/api/v1/status/route';
import { GET as getParameters } from '@/app/api/v1/parameters/route';
import {
  createNextRequest,
  parseResponse,
  createAuthHeaders,
} from '../../utils/testHelpers';
import { TEST_TOKENS } from '../../utils/mockData';

describe('[API] Utility Endpoints', () => {
  const validPlatformToken = TEST_TOKENS.valid.webApp;

  describe('GET /api/v1/status', () => {
    it('should return operational status', async () => {
      const request = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/status',
      });

      const response = await getStatus(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('timestamp');
      expect(data.data).toHaveProperty('version');
    });

    it('should work without authentication', async () => {
      const request = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/status',
      });

      const response = await getStatus(request);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/parameters', () => {
    it('should return valid parameter options', async () => {
      const request = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/parameters',
        headers: createAuthHeaders(validPlatformToken),
      });

      const response = await getParameters(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('structuralSystems');
      expect(data.data).toHaveProperty('designRegulations');
      expect(data.data).toHaveProperty('soilTypes');
    });

    it('should return arrays of valid options', async () => {
      const request = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/parameters',
        headers: createAuthHeaders(validPlatformToken),
      });

      const response = await getParameters(request);
      const data = await parseResponse(response);

      expect(Array.isArray(data.data.structuralSystems)).toBe(true);
      expect(Array.isArray(data.data.designRegulations)).toBe(true);
      expect(Array.isArray(data.data.soilTypes)).toBe(true);
      expect(data.data.structuralSystems.length).toBeGreaterThan(0);
    });

    it('should require platform authentication', async () => {
      const request = createNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/parameters',
      });

      const response = await getParameters(request);
      expect(response.status).toBe(401);
    });
  });
});
