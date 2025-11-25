/**
 * AI Tests Setup
 * Minimal setup for AI unit tests that don't require database
 */

import { beforeAll, afterAll } from 'vitest';

// Test environment variables
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'test-api-key';

beforeAll(() => {
  console.log('\n🧪 AI Tests: Setting up test environment...');
});

afterAll(() => {
  console.log('\n🧹 AI Tests: Cleaning up...');
});
