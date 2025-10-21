import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TurkeySeismicService, SeismicUtils } from '../turkeySeismicAPI';

// Mock the utils module
vi.mock('@/utils/turkeySeismicData', () => ({
  TURKEY_SEISMIC_ZONES: {
    cities: {
      Istanbul: {
        zone: 'Zone 4',
        riskLevel: 'Very High',
        coordinates: { latitude: 41.0082, longitude: 28.9784 },
        pga: 0.5,
        description: 'Major city in high seismic zone',
      },
      Ankara: {
        zone: 'Zone 2',
        riskLevel: 'Moderate',
        coordinates: { latitude: 39.9334, longitude: 32.8597 },
        pga: 0.25,
        description: 'Capital city',
      },
      Izmir: {
        zone: 'Zone 4',
        riskLevel: 'Very High',
        coordinates: { latitude: 38.4192, longitude: 27.1287 },
        pga: 0.45,
        description: 'Coastal city in high seismic zone',
      },
    },
    zoneDefinitions: {
      'Zone 1': { description: 'Low seismic activity', pga: 0.1 },
      'Zone 2': { description: 'Moderate seismic activity', pga: 0.25 },
      'Zone 3': { description: 'High seismic activity', pga: 0.35 },
      'Zone 4': { description: 'Very high seismic activity', pga: 0.5 },
    },
    majorFaults: [
      { name: 'North Anatolian Fault', type: 'strike-slip', length: 1500 },
      { name: 'East Anatolian Fault', type: 'strike-slip', length: 650 },
    ],
  },
  getZoneByCoordinates: vi.fn((lat, lng) => ({
    zone: 'Zone 4',
    riskLevel: 'Very High',
    pga: 0.5,
    soilType: 'ZC',
    nearestFaultDistance: 15,
    name: 'Istanbul',
    isEstimated: false,
  })),
}));

describe('TurkeySeismicService', () => {
  let service;

  beforeEach(() => {
    service = new TurkeySeismicService(true); // Use mock data
    vi.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default mock data mode', () => {
      const defaultService = new TurkeySeismicService();
      expect(defaultService.useMockData).toBe(true);
    });

    it('should initialize with custom configuration', () => {
      const customService = new TurkeySeismicService(false);
      expect(customService.useMockData).toBe(false);
      expect(customService.retryAttempts).toBe(3);
      expect(customService.timeoutMs).toBe(5000);
    });

    it('should allow updating API configuration', () => {
      service.setAPIConfig({
        endpoint: 'https://new-api.com',
        apiKey: 'new-key',
        timeout: 10000,
        useMockData: false,
      });

      expect(service.apiEndpoint).toBe('https://new-api.com');
      expect(service.apiKey).toBe('new-key');
      expect(service.timeoutMs).toBe(10000);
      expect(service.useMockData).toBe(false);
    });
  });

  describe('getSeismicData', () => {
    it('should return seismic data for valid coordinates', async () => {
      const result = await service.getSeismicData(41.0082, 28.9784);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.location).toBeDefined();
      expect(result.data.seismic).toBeDefined();
      expect(result.data.metadata).toBeDefined();
    });

    it('should include correct location data', async () => {
      const lat = 41.0082;
      const lng = 28.9784;
      const result = await service.getSeismicData(lat, lng);

      expect(result.data.location.latitude).toBe(lat);
      expect(result.data.location.longitude).toBe(lng);
      expect(result.data.location.accuracy).toBe('high');
    });

    it('should include seismic zone information', async () => {
      const result = await service.getSeismicData(41.0082, 28.9784);

      expect(result.data.seismic.zone).toBeDefined();
      expect(result.data.seismic.riskLevel).toBeDefined();
      expect(result.data.seismic.pga).toBeDefined();
      expect(result.data.seismic.soilClass).toBeDefined();
    });

    it('should include metadata with timestamp', async () => {
      const result = await service.getSeismicData(41.0082, 28.9784);

      expect(result.data.metadata.source).toBe('turkey_seismic_zones_mock');
      expect(result.data.metadata.timestamp).toBeDefined();
      expect(result.data.metadata.nearestCity).toBeDefined();
    });

    it('should throw error for invalid operation', async () => {
      // Force an error by mocking getZoneByCoordinates to throw
      const { getZoneByCoordinates } = await import('@/utils/turkeySeismicData');
      getZoneByCoordinates.mockImplementation(() => {
        throw new Error('Invalid coordinates');
      });

      // The error should be caught and re-thrown with a wrapped message
      await expect(service.getSeismicData(999, 999)).rejects.toThrow();
    });
  });

  describe('getAvailableCities', () => {
    it('should return list of cities with seismic data', async () => {
      const result = await service.getAvailableCities();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should include all required city properties', async () => {
      const result = await service.getAvailableCities();
      const city = result.data[0];

      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('zone');
      expect(city).toHaveProperty('riskLevel');
      expect(city).toHaveProperty('coordinates');
      expect(city).toHaveProperty('pga');
    });

    it('should include Istanbul in the cities list', async () => {
      const result = await service.getAvailableCities();
      const istanbul = result.data.find(city => city.name === 'Istanbul');

      expect(istanbul).toBeDefined();
      expect(istanbul.zone).toBe('Zone 4');
      expect(istanbul.riskLevel).toBe('Very High');
    });
  });

  describe('getZoneDefinitions', () => {
    it('should return zone definitions', async () => {
      const result = await service.getZoneDefinitions();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data['Zone 1']).toBeDefined();
      expect(result.data['Zone 4']).toBeDefined();
    });

    it('should include zone descriptions and PGA values', async () => {
      const result = await service.getZoneDefinitions();

      expect(result.data['Zone 1'].description).toBeDefined();
      expect(result.data['Zone 1'].pga).toBeDefined();
      expect(result.data['Zone 4'].description).toContain('Very high');
    });
  });

  describe('getMajorFaults', () => {
    it('should return major fault information', async () => {
      const result = await service.getMajorFaults();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should include North Anatolian Fault', async () => {
      const result = await service.getMajorFaults();
      const naf = result.data.find(fault => fault.name === 'North Anatolian Fault');

      expect(naf).toBeDefined();
      expect(naf.type).toBe('strike-slip');
      expect(naf.length).toBe(1500);
    });
  });

  describe('batchGetSeismicData', () => {
    it('should process multiple locations', async () => {
      const locations = [
        { latitude: 41.0082, longitude: 28.9784 }, // Istanbul
        { latitude: 39.9334, longitude: 32.8597 }, // Ankara
        { latitude: 38.4192, longitude: 27.1287 }, // Izmir
      ];

      const results = await service.batchGetSeismicData(locations);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(3);
    });

    it('should return success status for each location', async () => {
      const locations = [
        { latitude: 41.0082, longitude: 28.9784 },
        { latitude: 39.9334, longitude: 32.8597 },
      ];

      const results = await service.batchGetSeismicData(locations);

      results.forEach(result => {
        expect(result).toHaveProperty('location');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('data');
      });
    });

    it('should handle failures gracefully in batch processing', async () => {
      const { getZoneByCoordinates } = await import('@/utils/turkeySeismicData');

      // Make the second call fail
      let callCount = 0;
      getZoneByCoordinates.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Failed to get zone');
        }
        return {
          zone: 'Zone 4',
          riskLevel: 'Very High',
          pga: 0.5,
          soilType: 'ZC',
          nearestFaultDistance: 15,
          name: 'Test City',
          isEstimated: false,
        };
      });

      const locations = [
        { latitude: 41.0082, longitude: 28.9784 },
        { latitude: 39.9334, longitude: 32.8597 },
      ];

      const results = await service.batchGetSeismicData(locations);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  describe('checkServiceHealth', () => {
    it('should return healthy status', async () => {
      const result = await service.checkServiceHealth();

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('healthy');
      expect(result.data.responseTime).toBeDefined();
      expect(result.data.usingMockData).toBe(true);
    });

    it('should include response time in health check', async () => {
      const result = await service.checkServiceHealth();

      expect(result.data.responseTime).toMatch(/\d+ms/);
    });

    it('should return unhealthy status on error', async () => {
      const { getZoneByCoordinates } = await import('@/utils/turkeySeismicData');
      getZoneByCoordinates.mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      const result = await service.checkServiceHealth();

      expect(result.success).toBe(false);
      expect(result.data.status).toBe('unhealthy');
      expect(result.data.error).toBeDefined();
    });
  });

  describe('Helper Methods', () => {
    it('should estimate max magnitude based on zone', () => {
      expect(service._estimateMaxMagnitude('Zone 1')).toBe(6.0);
      expect(service._estimateMaxMagnitude('Zone 2')).toBe(6.5);
      expect(service._estimateMaxMagnitude('Zone 3')).toBe(7.0);
      expect(service._estimateMaxMagnitude('Zone 4')).toBe(7.5);
      expect(service._estimateMaxMagnitude('Unknown')).toBe(6.5);
    });

    it('should get correct return period for zones', () => {
      expect(service._getReturnPeriod('Zone 1')).toBe('> 500 years');
      expect(service._getReturnPeriod('Zone 2')).toBe('200-500 years');
      expect(service._getReturnPeriod('Zone 3')).toBe('100-200 years');
      expect(service._getReturnPeriod('Zone 4')).toBe('< 100 years');
    });
  });
});

describe('SeismicUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Distance between Istanbul and Ankara (approximately 350-400 km)
      const distance = SeismicUtils.calculateDistance(
        41.0082, 28.9784, // Istanbul
        39.9334, 32.8597  // Ankara
      );

      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(500);
    });

    it('should return 0 for same coordinates', () => {
      const distance = SeismicUtils.calculateDistance(
        41.0082, 28.9784,
        41.0082, 28.9784
      );

      expect(distance).toBeCloseTo(0, 1);
    });

    it('should calculate short distances accurately', () => {
      const distance = SeismicUtils.calculateDistance(
        41.0082, 28.9784,
        41.0182, 28.9884 // ~1-2 km away
      );

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5);
    });
  });

  describe('formatCoordinates', () => {
    it('should format positive coordinates correctly', () => {
      const formatted = SeismicUtils.formatCoordinates(41.0082, 28.9784);

      expect(formatted).toContain('N');
      expect(formatted).toContain('E');
      expect(formatted).toContain('41.008200');
      expect(formatted).toContain('28.978400');
    });

    it('should format negative coordinates correctly', () => {
      const formatted = SeismicUtils.formatCoordinates(-41.0082, -28.9784);

      expect(formatted).toContain('S');
      expect(formatted).toContain('W');
    });

    it('should format coordinates with 6 decimal places', () => {
      const formatted = SeismicUtils.formatCoordinates(41.123456789, 28.987654321);

      expect(formatted).toMatch(/41\.123457°N/);
      expect(formatted).toMatch(/28\.987654°E/);
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(SeismicUtils.validateCoordinates(41.0082, 28.9784)).toBe(true);
      expect(SeismicUtils.validateCoordinates(0, 0)).toBe(true);
      expect(SeismicUtils.validateCoordinates(90, 180)).toBe(true);
      expect(SeismicUtils.validateCoordinates(-90, -180)).toBe(true);
    });

    it('should reject invalid latitudes', () => {
      expect(SeismicUtils.validateCoordinates(91, 28.9784)).toBe(false);
      expect(SeismicUtils.validateCoordinates(-91, 28.9784)).toBe(false);
      expect(SeismicUtils.validateCoordinates(100, 0)).toBe(false);
    });

    it('should reject invalid longitudes', () => {
      expect(SeismicUtils.validateCoordinates(41.0082, 181)).toBe(false);
      expect(SeismicUtils.validateCoordinates(41.0082, -181)).toBe(false);
      expect(SeismicUtils.validateCoordinates(0, 200)).toBe(false);
    });

    it('should reject both invalid latitude and longitude', () => {
      expect(SeismicUtils.validateCoordinates(100, 200)).toBe(false);
      expect(SeismicUtils.validateCoordinates(-100, -200)).toBe(false);
    });
  });
});
