/**
 * Platform App Registration Script
 * Registers a new external application to use the QuakeWise API
 *
 * Usage: node scripts/register-app.js
 */

const { registerApp } = require('../lib/db/usageTracker');
const { generatePlatformToken } = require('../lib/auth/platformAuth');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 QuakeWise API - Platform App Registration\n');
  console.log('This script will register a new external application.\n');

  try {
    // Get app details
    const appId = await question('Enter App ID (e.g., my-mobile-app): ');
    if (!appId) {
      console.error('❌ App ID is required');
      process.exit(1);
    }

    const appName = await question('Enter App Name (e.g., My Mobile App): ');
    if (!appName) {
      console.error('❌ App Name is required');
      process.exit(1);
    }

    const tierInput = await question('Enter Tier (free/pro/enterprise) [default: free]: ');
    const tier = tierInput.toLowerCase() || 'free';

    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      console.error('❌ Invalid tier. Must be free, pro, or enterprise');
      process.exit(1);
    }

    console.log('\n⏳ Generating secure platform token...\n');

    // Generate platform token
    const platformToken = generatePlatformToken();

    // Register app
    const result = registerApp({
      appId: appId,
      name: appName,
      tier: tier,
      platformToken: platformToken
    });

    if (!result.success) {
      console.error('❌ Failed to register app:', result.error);
      process.exit(1);
    }

    // Display success message
    console.log('✅ App registered successfully!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 App Details:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  App ID:          ${appId}`);
    console.log(`  App Name:        ${appName}`);
    console.log(`  Tier:            ${tier}`);
    console.log('');
    console.log('🔑 Platform Token:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  ${platformToken}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - Save this token securely - it will not be shown again!');
    console.log('   - Add it to your application\'s environment variables');
    console.log('   - Never commit this token to version control');
    console.log('');
    console.log('📊 Rate Limits:');
    const limits = {
      free: '100 requests/hour, 1,000 requests/day',
      pro: '1,000 requests/hour, 10,000 requests/day',
      enterprise: '10,000 requests/hour, 100,000 requests/day'
    };
    console.log(`   ${limits[tier]}`);
    console.log('');
    console.log('📖 Next Steps:');
    console.log('   1. Add token to your app: X-Platform-Token: <token>');
    console.log('   2. Issue user JWT tokens: POST /api/v1/auth/issue-token');
    console.log('   3. Make assessment requests: POST /api/v1/assessment/complete');
    console.log('   4. View docs: http://localhost:3000/api-docs');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
