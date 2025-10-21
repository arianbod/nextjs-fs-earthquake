# Testing Documentation

This document provides comprehensive information about the testing setup and practices for the Next.js Earthquake Safety Assessment application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Vitest** as the testing framework, providing comprehensive test coverage for:

- **Unit Tests**: Individual functions, utilities, and calculations
- **Integration Tests**: API routes and service integrations
- **Component Tests**: React components with user interactions
- **API Mocking**: External API calls (OpenAI, SendGrid, Seismic API)

### Test Coverage Areas

1. **OpenAI API Integration** (`utils/action.js`)
   - Chat completions
   - Error handling
   - Token counting
   - Rate limiting scenarios

2. **Earthquake Calculations** (`config/earthquakeParameters.js`)
   - Building safety scores
   - Performance level determination
   - Richter scale calculations
   - Age and story categorization

3. **Seismic Data Service** (`services/turkeySeismicAPI.js`)
   - Location-based seismic data
   - Batch processing
   - Mock data fallback
   - Coordinate validation

4. **Safety Calculator** (`components/SafetyCalculator.jsx`)
   - Building assessment logic
   - Score calculations with various parameters
   - Irregularity penalties
   - Interpretation generation

5. **Email Service** (`server/services/emailService.js`)
   - Verification email sending
   - Template rendering
   - Error handling

6. **API Routes** (`app/api/analyze-image/route.js`)
   - Image analysis endpoint
   - Request/response handling
   - Error scenarios

---

## Testing Stack

### Core Testing Tools

- **Vitest** (v3.2.4): Fast unit test framework
- **@testing-library/react** (v16.3.0): React component testing utilities
- **@testing-library/jest-dom** (v6.9.1): Custom DOM matchers
- **@testing-library/user-event** (v14.6.1): User interaction simulation

### API Mocking

- **MSW (Mock Service Worker)** (v2.11.6): API request interception
- **node-mocks-http** (v1.17.2): HTTP request/response mocking

### DOM Environment

- **jsdom** (v27.0.1): DOM implementation for testing
- **happy-dom** (v20.0.7): Alternative lightweight DOM

### Additional Tools

- **whatwg-fetch** (v3.6.20): Fetch API polyfill
- **@vitejs/plugin-react** (v5.0.4): React support for Vitest

---

## Project Structure

```
nextjs-fs-earthquake/
├── test/                           # Test configuration and utilities
│   ├── setup.js                    # Global test setup
│   ├── mocks/
│   │   ├── handlers.js            # MSW request handlers
│   │   └── server.js              # MSW server setup
│   └── utils/
│       ├── test-helpers.js        # Custom testing utilities
│       └── mock-data.js           # Mock data for tests
│
├── vitest.config.js                # Vitest configuration
│
├── **/__tests__/                   # Test files (co-located with source)
│   ├── *.test.js
│   ├── *.test.jsx
│   └── *.spec.js
│
└── TESTING.md                      # This file
```

### Test File Naming Convention

- `*.test.js` or `*.test.jsx` - Unit and integration tests
- `*.spec.js` or `*.spec.jsx` - Specification tests
- Place test files in `__tests__` directories next to source files

---

## Running Tests

### Available Test Commands

```bash
# Run all tests in watch mode (development)
npm test

# Run all tests once (CI/CD)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run unit tests with verbose output
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Watch Mode

The default `npm test` command runs Vitest in watch mode, which:
- Automatically reruns tests when files change
- Provides an interactive CLI for filtering tests
- Shows only failed tests after the first run

### Coverage Reports

Running `npm run test:coverage` generates coverage reports in multiple formats:

- **Terminal**: Summary in console
- **HTML**: Interactive report in `coverage/index.html`
- **LCOV**: For CI/CD integration
- **JSON**: Machine-readable format

**Coverage Thresholds** (configured in `vitest.config.js`):
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

---

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '../module';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    const result = functionToTest();
    expect(result).toBe(expectedValue);
  });
});
```

### Testing React Components

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import MyComponent from '../MyComponent';

it('should handle user interaction', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);

  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### Testing with Providers

Use the `renderWithProviders` helper for components that need context:

```javascript
import { renderWithProviders } from '@/test/utils/test-helpers';
import { expect, it } from 'vitest';
import ComponentWithQuery from '../ComponentWithQuery';

it('should render with React Query', () => {
  const { container } = renderWithProviders(<ComponentWithQuery />);
  expect(container).toBeInTheDocument();
});
```

### Mocking External APIs

Tests use MSW (Mock Service Worker) to intercept HTTP requests:

```javascript
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

it('should handle API errors', async () => {
  // Override default handler for this test
  server.use(
    http.post('https://api.openai.com/v1/chat/completions', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // Test error handling
  const result = await generateChatResponse([]);
  expect(result).toBeNull();
});
```

### Mocking Modules

```javascript
import { vi } from 'vitest';

// Mock an entire module
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

// Mock specific functions
const mockFunction = vi.fn();
mockFunction.mockResolvedValue({ data: 'test' });
```

### Testing Async Code

```javascript
it('should handle async operations', async () => {
  const promise = asyncFunction();

  // Wait for promise to resolve
  const result = await promise;
  expect(result).toBeDefined();

  // Or use resolves/rejects matchers
  await expect(asyncFunction()).resolves.toBe('success');
  await expect(failingFunction()).rejects.toThrow('Error message');
});
```

---

## Test Coverage

### Current Coverage

Run `npm run test:coverage` to see detailed coverage reports.

### Critical Areas with Tests

✅ **OpenAI API Integration**
- Chat completion requests
- Error handling (rate limits, auth errors, timeouts)
- Token usage tracking
- Message formatting

✅ **Earthquake Calculations**
- Building type scoring
- Soil type modifiers
- Seismic zone factors
- Age and story categorization
- Performance level determination
- Richter scale calculations

✅ **Seismic Data Service**
- Location-based data retrieval
- City listings
- Zone definitions
- Batch processing
- Coordinate validation and formatting
- Distance calculations
- Health checks

✅ **Safety Calculator**
- Overall safety score calculation
- Irregularity penalties
- Score breakdown transparency
- Boundary enforcement (0-100)
- Interpretation generation
- Richter performance data

✅ **Email Service**
- Verification email sending
- Template rendering (text + HTML)
- Environment variable validation
- SendGrid integration
- Error handling

✅ **API Routes**
- Image analysis endpoint
- Request parsing
- Error responses

### Areas for Future Testing

- UI Components (step forms, results display)
- Context providers (AssistantContext, UserInputContext)
- User authentication flows
- E2E user journeys

---

## Best Practices

### 1. Test Organization

- **Co-locate tests**: Place test files in `__tests__` folders next to source code
- **Descriptive names**: Use clear, descriptive test names that explain what is being tested
- **Group related tests**: Use `describe` blocks to organize related tests

### 2. Test Independence

- **Isolated tests**: Each test should be independent and not rely on others
- **Clean state**: Use `beforeEach` to reset state before each test
- **No shared mutable state**: Avoid sharing variables between tests

### 3. Assertions

- **One concept per test**: Each test should verify one specific behavior
- **Clear expectations**: Use descriptive assertion messages
- **Avoid over-mocking**: Mock only what's necessary, prefer testing real behavior

### 4. Async Testing

- **Always await**: Use `async/await` for asynchronous operations
- **Handle rejections**: Test both success and error cases
- **Set timeouts**: Use appropriate timeouts for long-running operations

### 5. Mocking Strategy

- **Mock external dependencies**: API calls, databases, third-party services
- **Don't mock what you own**: Test your own code with real implementations when possible
- **Reset mocks**: Clear mock history between tests

### 6. Code Coverage

- **Aim for 70%+**: Maintain at least 70% coverage for critical code
- **Quality over quantity**: Focus on meaningful tests, not just coverage numbers
- **Test edge cases**: Include boundary conditions and error scenarios

---

## Troubleshooting

### Common Issues

#### Tests Timing Out

```javascript
// Increase timeout for specific test
it('slow operation', async () => {
  // ... test code
}, { timeout: 10000 }); // 10 seconds

// Or in vitest.config.js
test: {
  testTimeout: 10000,
}
```

#### Mock Not Working

```javascript
// Ensure mocks are cleared between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Check mock call history
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith(expectedArg);
```

#### DOM Cleanup Issues

```javascript
// Automatic cleanup is configured in test/setup.js
// But you can manually cleanup if needed
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

#### Environment Variables

Environment variables are mocked in `test/setup.js`. To override:

```javascript
beforeEach(() => {
  process.env.CUSTOM_VAR = 'test-value';
});

afterEach(() => {
  delete process.env.CUSTOM_VAR;
});
```

#### MSW Network Errors

If you see "MSW request not found" warnings:

1. Check that handlers are defined in `test/mocks/handlers.js`
2. Verify the URL matches exactly (including protocol, host, path)
3. Ensure MSW server is started in `test/setup.js`

### Debugging Tests

```bash
# Run specific test file
npm test -- SafetyCalculator.test

# Run tests matching pattern
npm test -- --grep "OpenAI"

# Run with verbose output
npm run test:unit

# Debug in browser with UI
npm run test:ui
```

### Getting Help

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **MSW Docs**: https://mswjs.io/

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run test:run
```

---

## Additional Resources

- [Vitest Configuration](./vitest.config.js)
- [Test Setup](./test/setup.js)
- [Mock Handlers](./test/mocks/handlers.js)
- [Test Helpers](./test/utils/test-helpers.js)

---

**Last Updated**: 2025-10-21

For questions or issues with testing, please open an issue in the project repository.
