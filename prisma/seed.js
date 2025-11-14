/**
 * Database Seed Script
 * Seeds the database with pre-registered internal QuakeWise services
 *
 * Usage: npm run db:seed
 *
 * This script:
 * 1. Reads service definitions from config/internal-services.js
 * 2. Gets service tokens from environment variables
 * 3. Creates/updates service records in the database
 * 4. Sets appropriate tier and rate limits for each service
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { INTERNAL_SERVICES, SERVICE_TIERS, getServiceToken } from '../config/internal-services.js';

const prisma = new PrismaClient();

/**
 * Hash platform token for secure storage
 * Uses SHA-256 for consistency with authentication
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Seed database with all pre-registered services
 */
async function main() {
  console.log('\n🌱 Seeding database with internal services...\n');
  console.log('=' .repeat(60));

  const results = {
    created: [],
    updated: [],
    skipped: [],
    errors: []
  };

  for (const [serviceId, serviceConfig] of Object.entries(INTERNAL_SERVICES)) {
    try {
      // Get service token from environment
      const serviceToken = getServiceToken(serviceId);

      if (!serviceToken) {
        console.log(`⚠️  Skipping ${serviceId}: No token in environment (${serviceConfig.tokenEnvVar})`);
        results.skipped.push({ serviceId, reason: 'No token in environment' });
        continue;
      }

      // Get tier configuration
      const tierConfig = SERVICE_TIERS[serviceConfig.tier];
      if (!tierConfig) {
        console.log(`❌ Error ${serviceId}: Invalid tier ${serviceConfig.tier}`);
        results.errors.push({ serviceId, error: 'Invalid tier configuration' });
        continue;
      }

      // Hash the token for secure storage
      const tokenHash = hashToken(serviceToken);

      // Upsert service (create or update)
      const service = await prisma.apiApp.upsert({
        where: {
          platformTokenHash: tokenHash
        },
        update: {
          name: serviceConfig.name,
          tier: serviceConfig.tier,
          rateLimitPerHour: tierConfig.rateLimitPerHour,
          rateLimitPerDay: tierConfig.rateLimitPerDay,
          status: 'ACTIVE',
          metadata: {
            owner: serviceConfig.owner,
            contact: serviceConfig.contact,
            description: serviceConfig.description,
            tokenEnvVar: serviceConfig.tokenEnvVar,
            lastSeeded: new Date().toISOString()
          }
        },
        create: {
          id: serviceId,
          name: serviceConfig.name,
          platformTokenHash: tokenHash,
          tier: serviceConfig.tier,
          rateLimitPerHour: tierConfig.rateLimitPerHour,
          rateLimitPerDay: tierConfig.rateLimitPerDay,
          status: 'ACTIVE',
          metadata: {
            owner: serviceConfig.owner,
            contact: serviceConfig.contact,
            description: serviceConfig.description,
            tokenEnvVar: serviceConfig.tokenEnvVar,
            createdBy: 'seed-script',
            createdAt: new Date().toISOString()
          }
        }
      });

      const isNewRecord = !service.lastUsedAt;

      if (isNewRecord) {
        console.log(`✅ Created: ${serviceConfig.name}`);
        console.log(`   ID: ${serviceId}`);
        console.log(`   Tier: ${serviceConfig.tier} (${tierConfig.rateLimitPerHour}/hr, ${tierConfig.rateLimitPerDay}/day)`);
        console.log(`   Owner: ${serviceConfig.owner}`);
        results.created.push(serviceId);
      } else {
        console.log(`🔄 Updated: ${serviceConfig.name}`);
        console.log(`   ID: ${serviceId}`);
        results.updated.push(serviceId);
      }
      console.log('');

    } catch (error) {
      console.log(`❌ Error seeding ${serviceId}:`, error.message);
      results.errors.push({ serviceId, error: error.message });
    }
  }

  // Print summary
  console.log('=' .repeat(60));
  console.log('\n📊 Seeding Summary:\n');
  console.log(`✅ Created: ${results.created.length} services`);
  if (results.created.length > 0) {
    results.created.forEach(id => console.log(`   - ${id}`));
  }

  console.log(`\n🔄 Updated: ${results.updated.length} services`);
  if (results.updated.length > 0) {
    results.updated.forEach(id => console.log(`   - ${id}`));
  }

  console.log(`\n⚠️  Skipped: ${results.skipped.length} services`);
  if (results.skipped.length > 0) {
    results.skipped.forEach(({ serviceId, reason }) =>
      console.log(`   - ${serviceId}: ${reason}`)
    );
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(({ serviceId, error }) =>
      console.log(`   - ${serviceId}: ${error}`)
    );
  }

  console.log('\n' + '='.repeat(60));

  if (results.skipped.length > 0) {
    console.log('\n⚠️  IMPORTANT: Some services were skipped');
    console.log('Make sure all service tokens are set in your .env file:');
    results.skipped.forEach(({ serviceId }) => {
      const config = INTERNAL_SERVICES[serviceId];
      console.log(`   ${config.tokenEnvVar}=<your-token>`);
    });
    console.log('\nGenerate tokens with: npm run generate:service-tokens\n');
  } else {
    console.log('\n✨ All services seeded successfully!\n');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
