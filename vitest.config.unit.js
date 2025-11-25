import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest configuration for unit tests
 * These tests don't require database connections
 */
export default defineConfig({
  test: {
    name: 'QuakeWise Unit Tests',
    environment: 'happy-dom',
    setupFiles: ['./tests/ai/setup.js'],
    globals: true,
    include: ['tests/ai/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        '.next/',
        'coverage/',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
