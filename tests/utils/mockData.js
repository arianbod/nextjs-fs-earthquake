/**
 * Mock Data Factories
 * Generate realistic test data for API testing
 */

import { nanoid } from 'nanoid';

/**
 * Valid structural system codes
 */
export const STRUCTURAL_SYSTEMS = [
  'C1', 'C2', 'C3', 'C4',
  'S1', 'S2', 'S3', 'S4', 'S5',
  'PC1', 'PC2',
  'RM1', 'RM2',
  'URM', 'W1', 'W2',
  'MH',
];

/**
 * Valid design regulations
 */
export const DESIGN_REGULATIONS = [
  'Pre-1975',
  '1975-1997',
  '1998-2006',
  '2007-2018',
  '2018-Present',
];

/**
 * Valid soil types
 */
export const SOIL_TYPES = ['ZA', 'ZB', 'ZC', 'ZD', 'ZE', 'ZF'];

/**
 * Valid irregularity types
 */
export const IRREGULARITY_TYPES = ['none', 'minor', 'moderate', 'severe'];

/**
 * Valid quality levels
 */
export const QUALITY_LEVELS = ['poor', 'fair', 'good', 'excellent'];

/**
 * Sample locations (Istanbul, Turkey)
 */
export const SAMPLE_LOCATIONS = [
  { latitude: 41.0082, longitude: 28.9784, name: 'Istanbul City Center' },
  { latitude: 41.0091, longitude: 29.0114, name: 'Kadıköy' },
  { latitude: 41.0347, longitude: 28.9848, name: 'Beşiktaş' },
  { latitude: 40.9929, longitude: 29.0251, name: 'Üsküdar' },
  { latitude: 41.1053, longitude: 29.0074, name: 'Sarıyer' },
];

/**
 * Create a valid building object
 */
export function createMockBuilding(overrides = {}) {
  const defaults = {
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
  };

  return {
    ...defaults,
    ...overrides,
    soil: {
      ...defaults.soil,
      ...(overrides.soil || {}),
    },
  };
}

/**
 * Create a random valid building
 */
export function createRandomBuilding() {
  const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomBool = () => Math.random() > 0.5;

  return createMockBuilding({
    structuralSystem: randomElement(STRUCTURAL_SYSTEMS),
    numberOfStories: randomInt(1, 20),
    yearOfConstruction: randomInt(1950, 2024),
    designRegulation: randomElement(DESIGN_REGULATIONS),
    totalFloorArea: randomInt(500, 5000),
    softStory: randomBool(),
    planIrregularity: randomElement(IRREGULARITY_TYPES),
    verticalIrregularity: randomElement(IRREGULARITY_TYPES),
    apparentQuality: randomElement(QUALITY_LEVELS),
    maintenance: randomElement(QUALITY_LEVELS),
    soil: {
      type: randomElement(SOIL_TYPES),
      slope: randomInt(0, 30),
    },
  });
}

/**
 * Create a mock location
 */
export function createMockLocation(overrides = {}) {
  const randomLocation = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];

  return {
    latitude: randomLocation.latitude,
    longitude: randomLocation.longitude,
    ...overrides,
  };
}

/**
 * Create complete assessment data
 */
export function createMockAssessmentData(overrides = {}) {
  return {
    location: createMockLocation(overrides.location),
    building: createMockBuilding(overrides.building),
  };
}

/**
 * Create invalid building data (missing required fields)
 */
export function createInvalidBuilding(missingField) {
  const building = createMockBuilding();
  delete building[missingField];
  return building;
}

/**
 * Create building with invalid values
 */
export function createBuildingWithInvalidValues(invalidField, invalidValue) {
  const building = createMockBuilding();
  building[invalidField] = invalidValue;
  return building;
}

/**
 * Create mock user for authentication tests
 */
export function createMockUser(overrides = {}) {
  return {
    userId: `test_user_${nanoid(10)}`,
    appId: 'test-web-app',
    tier: 'WEB_APP',
    ...overrides,
  };
}

/**
 * Create mock API app/service
 */
export function createMockApiApp(overrides = {}) {
  return {
    id: `test_app_${nanoid(10)}`,
    name: 'Test Application',
    tier: 'WEB_APP',
    rateLimitPerHour: 10000,
    rateLimitPerDay: 100000,
    status: 'ACTIVE',
    ...overrides,
  };
}

/**
 * Create token issuance request body
 */
export function createTokenRequest(overrides = {}) {
  return {
    userId: `test_user_${nanoid(10)}`,
    appId: 'test-web-app',
    tier: 'WEB_APP',
    ...overrides,
  };
}

/**
 * Create invalid token request (missing fields)
 */
export function createInvalidTokenRequest(missingField) {
  const request = createTokenRequest();
  delete request[missingField];
  return request;
}

/**
 * Edge case buildings for comprehensive testing
 */
export const EDGE_CASE_BUILDINGS = {
  veryOld: createMockBuilding({
    yearOfConstruction: 1950,
    designRegulation: 'Pre-1975',
    apparentQuality: 'poor',
    maintenance: 'poor',
  }),
  veryNew: createMockBuilding({
    yearOfConstruction: 2024,
    designRegulation: '2018-Present',
    apparentQuality: 'excellent',
    maintenance: 'excellent',
  }),
  veryTall: createMockBuilding({
    numberOfStories: 50,
    structuralSystem: 'S1',
    totalFloorArea: 10000,
  }),
  verySmall: createMockBuilding({
    numberOfStories: 1,
    structuralSystem: 'W1',
    totalFloorArea: 100,
  }),
  highSeismicRisk: createMockBuilding({
    soil: { type: 'ZE', slope: 25 },
    planIrregularity: 'severe',
    verticalIrregularity: 'severe',
    softStory: true,
    apparentQuality: 'poor',
  }),
  lowSeismicRisk: createMockBuilding({
    soil: { type: 'ZA', slope: 0 },
    planIrregularity: 'none',
    verticalIrregularity: 'none',
    softStory: false,
    apparentQuality: 'excellent',
    designRegulation: '2018-Present',
    yearOfConstruction: 2022,
  }),
};

/**
 * Invalid building data for validation testing
 */
export const INVALID_BUILDINGS = {
  missingStructuralSystem: createInvalidBuilding('structuralSystem'),
  missingStories: createInvalidBuilding('numberOfStories'),
  missingYear: createInvalidBuilding('yearOfConstruction'),
  missingRegulation: createInvalidBuilding('designRegulation'),
  invalidStructuralSystem: createBuildingWithInvalidValues('structuralSystem', 'INVALID'),
  negativeStories: createBuildingWithInvalidValues('numberOfStories', -5),
  futureYear: createBuildingWithInvalidValues('yearOfConstruction', 2050),
  invalidSoilType: createMockBuilding({ soil: { type: 'INVALID', slope: 0 } }),
  negativeSLope: createMockBuilding({ soil: { type: 'Z2', slope: -10 } }),
};

/**
 * Sample assessment responses (expected outputs)
 */
export const SAMPLE_ASSESSMENT_RESPONSES = {
  high_risk: {
    safetyScore: {
      overall: 35,
      structural: 30,
      seismic: 25,
      environmental: 50,
    },
    riskLevel: 'HIGH',
  },
  moderate_risk: {
    safetyScore: {
      overall: 65,
      structural: 70,
      seismic: 60,
      environmental: 65,
    },
    riskLevel: 'MODERATE',
  },
  low_risk: {
    safetyScore: {
      overall: 85,
      structural: 90,
      seismic: 80,
      environmental: 85,
    },
    riskLevel: 'LOW',
  },
};

/**
 * Test service tokens
 */
export const TEST_TOKENS = {
  valid: {
    webApp: 'test-web-app-token-123',
    mobile: 'test-mobile-token-456',
    dev: 'test-dev-token-789',
  },
  invalid: {
    wrong: 'wrong-token-that-does-not-exist',
    empty: '',
    malformed: 'not@a#valid$token',
    inactive: 'test-inactive-token-000',
  },
};

/**
 * Sample usage statistics response
 */
export function createMockUsageStats(appId = 'test-web-app') {
  return {
    appId,
    totalRequests: 1250,
    successfulRequests: 1200,
    failedRequests: 50,
    averageResponseTime: 342,
    rateLimitHits: 5,
    mostUsedEndpoints: [
      { endpoint: '/api/v1/assessment/complete', count: 800 },
      { endpoint: '/api/v1/auth/issue-token', count: 300 },
      { endpoint: '/api/v1/parameters', count: 150 },
    ],
  };
}

export default {
  STRUCTURAL_SYSTEMS,
  DESIGN_REGULATIONS,
  SOIL_TYPES,
  IRREGULARITY_TYPES,
  QUALITY_LEVELS,
  SAMPLE_LOCATIONS,
  EDGE_CASE_BUILDINGS,
  INVALID_BUILDINGS,
  SAMPLE_ASSESSMENT_RESPONSES,
  TEST_TOKENS,
  createMockBuilding,
  createRandomBuilding,
  createMockLocation,
  createMockAssessmentData,
  createMockUser,
  createMockApiApp,
  createTokenRequest,
  createInvalidTokenRequest,
  createMockUsageStats,
};
