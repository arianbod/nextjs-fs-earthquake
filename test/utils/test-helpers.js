import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(ui, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock OpenAI chat message
 */
export function createMockChatMessage(role = 'user', content = 'Test message') {
  return {
    role,
    content,
    timestamp: Date.now(),
  };
}

/**
 * Create a mock building data object for testing
 */
export function createMockBuildingData(overrides = {}) {
  return {
    buildingType: 'residential',
    floors: 5,
    constructionYear: 2010,
    structuralSystem: 'reinforced_concrete',
    soilType: 'Z2',
    latitude: 41.0082,
    longitude: 28.9784,
    zone: 1,
    ...overrides,
  };
}

/**
 * Create mock seismic data
 */
export function createMockSeismicData(overrides = {}) {
  return {
    latitude: 41.0082,
    longitude: 28.9784,
    zone: 1,
    soilType: 'Z2',
    pga: 0.4,
    availableData: true,
    nearestFault: {
      name: 'North Anatolian Fault',
      distance: 15,
    },
    ...overrides,
  };
}

/**
 * Wait for a specific condition to be true
 */
export async function waitForCondition(condition, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Condition not met within timeout');
}

/**
 * Mock fetch response helper
 */
export function createMockResponse(data, options = {}) {
  return {
    ok: options.ok !== false,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    headers: new Headers(options.headers || {}),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
  };
}

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(name = 'test.jpg', type = 'image/jpeg', size = 1024) {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/**
 * Suppress console errors during a test
 */
export function suppressConsoleError(callback) {
  const originalError = console.error;
  console.error = vi.fn();
  try {
    callback();
  } finally {
    console.error = originalError;
  }
}

/**
 * Create mock assessment step data
 */
export function createMockAssessmentData(step = 'building-info', overrides = {}) {
  const baseData = {
    'building-info': {
      buildingType: 'residential',
      floors: 5,
      constructionYear: 2010,
    },
    'structural-system': {
      structuralSystem: 'reinforced_concrete',
      foundationType: 'shallow',
    },
    location: {
      latitude: 41.0082,
      longitude: 28.9784,
      city: 'Istanbul',
    },
  };

  return {
    ...baseData[step],
    ...overrides,
  };
}
