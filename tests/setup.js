/**
 * Vitest Global Setup
 * Runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Initialize Prisma for test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

// Make prisma available globally in tests
global.prisma = prisma;

// Test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-minimum-32-characters-long';
process.env.SERVICE_TOKEN_WEB_APP = process.env.SERVICE_TOKEN_WEB_APP || 'test-web-app-token-123';
process.env.SERVICE_TOKEN_MOBILE = process.env.SERVICE_TOKEN_MOBILE || 'test-mobile-token-456';
process.env.SERVICE_TOKEN_DEV = process.env.SERVICE_TOKEN_DEV || 'test-dev-token-789';

// Setup: Connect to database before all tests
beforeAll(async () => {
  console.log('\n🧪 Setting up test environment...');

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Seed test data
    await seedTestData();
    console.log('✅ Test data seeded');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
});

// Cleanup: Disconnect from database after all tests
afterAll(async () => {
  console.log('\n🧹 Cleaning up test environment...');

  try {
    await cleanupTestData();
    console.log('✅ Test data cleaned');

    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
});

// Reset rate limits before each test
beforeEach(async () => {
  // Clear rate limit records for consistent testing
  await prisma.apiRateLimit.deleteMany({
    where: {
      appId: {
        in: ['test-web-app', 'test-mobile-app', 'test-dev-service'],
      },
    },
  });
});

// Cleanup: Remove any test-created data after each test
afterEach(async () => {
  // Clean up any API usage logs from tests
  await prisma.apiUsage.deleteMany({
    where: {
      userId: {
        startsWith: 'test_',
      },
    },
  });
});

/**
 * Seed test data
 */
async function seedTestData() {
  const services = [
    {
      id: 'test-web-app',
      name: 'Test Web Application',
      platformTokenHash: hashToken('test-web-app-token-123'),
      tier: 'WEB_APP',
      rateLimitPerHour: 10000,
      rateLimitPerDay: 100000,
      status: 'ACTIVE',
    },
    {
      id: 'test-mobile-app',
      name: 'Test Mobile Application',
      platformTokenHash: hashToken('test-mobile-token-456'),
      tier: 'WEB_APP',
      rateLimitPerHour: 10000,
      rateLimitPerDay: 100000,
      status: 'ACTIVE',
    },
    {
      id: 'test-dev-service',
      name: 'Test Development Service',
      platformTokenHash: hashToken('test-dev-token-789'),
      tier: 'DEV_TESTING',
      rateLimitPerHour: 500,
      rateLimitPerDay: 5000,
      status: 'ACTIVE',
    },
    {
      id: 'test-inactive-service',
      name: 'Test Inactive Service',
      platformTokenHash: hashToken('test-inactive-token-000'),
      tier: 'DEV_TESTING',
      rateLimitPerHour: 500,
      rateLimitPerDay: 5000,
      status: 'INACTIVE',
    },
  ];

  for (const service of services) {
    await prisma.apiApp.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  // Delete test services
  await prisma.apiApp.deleteMany({
    where: {
      id: {
        startsWith: 'test-',
      },
    },
  });

  // Delete test rate limits
  await prisma.apiRateLimit.deleteMany({
    where: {
      appId: {
        startsWith: 'test-',
      },
    },
  });

  // Delete test usage logs
  await prisma.apiUsage.deleteMany({
    where: {
      userId: {
        startsWith: 'test_',
      },
    },
  });
}

/**
 * Hash token (same as production)
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Export utilities for tests
export { prisma, hashToken };
