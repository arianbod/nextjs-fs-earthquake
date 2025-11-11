#!/usr/bin/env node

/**
 * Production Token Generator
 * Generates secure tokens for production deployment
 */

const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('\n🔐 QuakeWise API - Production Token Generator');
console.log('═══════════════════════════════════════════════════════════\n');

const platformSecret = generateToken();
const jwtSecret = generateToken();
const adminSecret = generateToken();

console.log('📋 Environment Variables for Production:\n');
console.log('─────────────────────────────────────────────────────────────');
console.log('Copy these to your Vercel Dashboard → Settings → Environment Variables');
console.log('Or add to your .env.production.local file');
console.log('─────────────────────────────────────────────────────────────\n');

console.log('# API Authentication');
console.log(`API_PLATFORM_SECRET=${platformSecret}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('JWT_EXPIRY=7d');
console.log('JWT_ISSUER=quakewise-api\n');

console.log('# Admin Secret (for app registration)');
console.log(`ADMIN_SECRET=${adminSecret}\n`);

console.log('# Database (choose one)');
console.log('API_DATABASE_PATH=/tmp/api_usage.db  # For Vercel file-based');
console.log('# OR');
console.log('# POSTGRES_URL=<your-postgres-url>  # For PostgreSQL\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('\n⚠️  SECURITY IMPORTANT:\n');
console.log('   ✅ These tokens are cryptographically secure (256-bit)');
console.log('   ✅ Use DIFFERENT tokens for production than development');
console.log('   ✅ Store these in a secure password manager');
console.log('   ⚠️  NEVER commit these to version control');
console.log('   ⚠️  NEVER share these tokens publicly');
console.log('');

console.log('📝 Next Steps:\n');
console.log('   1. Add these variables to Vercel:');
console.log('      → Go to Vercel Dashboard');
console.log('      → Select your project');
console.log('      → Settings → Environment Variables');
console.log('      → Add each variable');
console.log('      → Select "Production" environment');
console.log('');
console.log('   2. Add your existing API keys:');
console.log('      → ANTHROPIC_API_KEY');
console.log('      → NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
console.log('      → CLERK_SECRET_KEY');
console.log('      → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
console.log('');
console.log('   3. Deploy your application:');
console.log('      → Push to branch: underDev,RLS1.1');
console.log('      → Or trigger manual deploy in Vercel');
console.log('');
console.log('   4. Register your first app:');
console.log('      → Use the admin endpoint (see PRODUCTION_DEPLOYMENT.md)');
console.log('      → Or run: node scripts/register-production-app.js');
console.log('');

console.log('═══════════════════════════════════════════════════════════\n');

// Save to file for reference (optional)
const fs = require('fs');
const filename = `.env.production.tokens.${Date.now()}.txt`;

const content = `# QuakeWise API - Production Tokens
# Generated: ${new Date().toISOString()}
# ⚠️  DELETE THIS FILE AFTER COPYING TO VERCEL

API_PLATFORM_SECRET=${platformSecret}
JWT_SECRET=${jwtSecret}
JWT_EXPIRY=7d
JWT_ISSUER=quakewise-api
ADMIN_SECRET=${adminSecret}
API_DATABASE_PATH=/tmp/api_usage.db

# Add your existing keys:
# ANTHROPIC_API_KEY=
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
# CLERK_SECRET_KEY=
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
`;

fs.writeFileSync(filename, content);
console.log(`💾 Tokens saved to: ${filename}`);
console.log('⚠️  Delete this file after copying to Vercel!\n');
