/**
 * Generate Service Tokens Script
 * 🔒 For QuakeWise DevOps/Admin Team Only
 *
 * Generates secure 256-bit tokens for all pre-registered internal services.
 * Run this once during initial setup or when adding new services.
 *
 * Usage:
 *   node scripts/generate-service-tokens.js
 *
 * Output:
 *   - Displays tokens in terminal
 *   - Saves to .env.service-tokens.txt
 *   - Provides Vercel environment variable format
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { INTERNAL_SERVICES } from '../config/internal-services.js';

/**
 * Generate a secure 256-bit token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Main function
 */
function generateServiceTokens() {
  console.log('\n🔐 QuakeWise Internal Service Token Generator');
  console.log('=' .repeat(60));
  console.log('\n⚠️  SECURITY WARNING:');
  console.log('- These tokens provide full API access');
  console.log('- Store in team password manager (1Password/Vault)');
  console.log('- Add to Vercel environment variables');
  console.log('- Never commit to git');
  console.log('- Rotate tokens if compromised\n');

  const tokens = {};
  const envFileLines = [];
  const vercelLines = [];

  console.log('Generating tokens for internal services...\n');

  // Generate token for each service
  for (const [serviceId, service] of Object.entries(INTERNAL_SERVICES)) {
    const token = generateToken();
    tokens[serviceId] = {
      token,
      envVar: service.tokenEnvVar,
      name: service.name
    };

    console.log(`✅ ${service.name}`);
    console.log(`   Service ID: ${serviceId}`);
    console.log(`   Env Var:    ${service.tokenEnvVar}`);
    console.log(`   Token:      ${token}`);
    console.log(`   Tier:       ${service.tier}\n`);

    // Prepare .env format
    envFileLines.push(`# ${service.name} (${serviceId})`);
    envFileLines.push(`${service.tokenEnvVar}="${token}"`);
    envFileLines.push('');

    // Prepare Vercel format
    vercelLines.push(`${service.tokenEnvVar}=${token}`);
  }

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `.env.service-tokens.${timestamp}.txt`;
  const filepath = path.join(process.cwd(), filename);

  const fileContent = `# QuakeWise Internal Service Tokens
# Generated: ${new Date().toISOString()}
# 🔒 CONFIDENTIAL - Store in team password manager
#
# DO NOT COMMIT THIS FILE TO GIT!
#
# ==============================================================================

${envFileLines.join('\n')}

# ==============================================================================
# VERCEL ENVIRONMENT VARIABLES
# Copy these to Vercel Dashboard → Settings → Environment Variables
# ==============================================================================

${vercelLines.join('\n')}

# ==============================================================================
# NEXT STEPS
# ==============================================================================
# 1. Copy tokens to team password manager
# 2. Add to local .env file for development
# 3. Add to Vercel environment variables for production
# 4. Run: npm run db:seed (to register services in database)
# 5. Delete this file after storing tokens securely
# ==============================================================================
`;

  fs.writeFileSync(filepath, fileContent);

  console.log('=' .repeat(60));
  console.log(`\n✅ Tokens generated and saved to: ${filename}\n`);

  console.log('📋 NEXT STEPS:\n');
  console.log('1. Open the generated file and copy tokens');
  console.log('2. Store in team password manager under "QuakeWise API Tokens"');
  console.log('3. Add to your local .env file:');
  console.log(`   cp ${filename} .env.local`);
  console.log('4. Add to Vercel environment variables (copy Vercel section from file)');
  console.log('5. Run database seed: npm run db:seed');
  console.log('6. DELETE the generated file: rm ' + filename);
  console.log('\n⚠️  Remember: These tokens grant full API access!\n');

  // Also output summary
  console.log('=' .repeat(60));
  console.log('SERVICE TOKEN SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total services: ${Object.keys(tokens).length}`);
  console.log('\nServices by tier:');

  const tierCounts = {};
  for (const service of Object.values(INTERNAL_SERVICES)) {
    tierCounts[service.tier] = (tierCounts[service.tier] || 0) + 1;
  }

  for (const [tier, count] of Object.entries(tierCounts)) {
    console.log(`  ${tier}: ${count} service(s)`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateServiceTokens();
}

export { generateServiceTokens, generateToken };
