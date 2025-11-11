# QuakeWise API - Production Deployment Guide

## 🚀 Deploy to Production

Your API is ready to deploy. Follow this guide for your production setup.

---

## Option 1: Deploy with Vercel (Recommended)

### Step 1: Connect Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `arianbod/nextjs-fs-earthquake`
4. **Important**: Select the branch `underDev,RLS1.1` for deployment

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### **Required API Variables:**
```bash
# Generate these first (see "Generate Production Tokens" section below)
API_PLATFORM_SECRET=<your-production-platform-secret>
JWT_SECRET=<your-production-jwt-secret>
JWT_EXPIRY=7d
JWT_ISSUER=quakewise-api
```

#### **Existing QuakeWise Variables:**
```bash
ANTHROPIC_API_KEY=<your-anthropic-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
CLERK_SECRET_KEY=<your-clerk-secret>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
```

#### **Optional Variables:**
```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=<your-weather-key>
API_DATABASE_PATH=/tmp/api_usage.db  # For Vercel
LOG_DIR=/tmp/logs  # For Vercel
```

### Step 3: Deploy

Click "Deploy" and wait for build to complete.

Your API will be available at: `https://your-app.vercel.app/api/v1`

---

## Generate Production Tokens

### On Your Local Machine:

```bash
# Generate API Platform Secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT Secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ Important:**
- Use **different tokens** for production than development
- Save these tokens in a secure password manager
- Never commit these tokens to version control
- Add them to Vercel environment variables

---

## Access Your Production API

After deployment, your API will be accessible at:

```
Base URL: https://your-app.vercel.app/api/v1
```

### Available Endpoints:

| Endpoint | URL |
|----------|-----|
| **API Docs** | `https://your-app.vercel.app/api-docs` |
| Health Check | `https://your-app.vercel.app/api/v1/status` |
| Parameters | `https://your-app.vercel.app/api/v1/parameters` |
| Issue Token | `https://your-app.vercel.app/api/v1/auth/issue-token` |
| Assessment | `https://your-app.vercel.app/api/v1/assessment/complete` |

---

## Register Production Apps

You have two options:

### Option A: Use Vercel CLI (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run the registration script in production
vercel env pull .env.production.local
node scripts/register-app.js
```

### Option B: Create Apps via API Call

```bash
# You'll need direct database access or create a secure admin endpoint
# See "Create Admin Endpoint" section below
```

### Option C: Manual Database Access

If you need to manually register apps in production:

1. **For Vercel**: Use Vercel Postgres or external database
2. **For other hosts**: SSH to server and run registration script

---

## Create Your First Production App Token

### Method 1: Run Script Locally with Production Variables

```bash
# 1. Download production environment variables
# (If using Vercel)
vercel env pull .env.production.local

# 2. Edit the script to use production database
# scripts/register-production-app.js (create this file)

# 3. Run registration
node scripts/register-production-app.js
```

### Method 2: Create Secure Admin Endpoint

Create `app/api/admin/register-app/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { registerApp } from '@/lib/db/usageTracker';
import { generatePlatformToken } from '@/lib/auth/platformAuth';

export async function POST(request) {
  // IMPORTANT: Add authentication here!
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId, name, tier } = await request.json();
  const platformToken = generatePlatformToken();

  const result = registerApp({
    appId,
    name,
    tier: tier || 'free',
    platformToken
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    appId,
    platformToken,
    tier
  });
}
```

Then call it:

```bash
curl -X POST https://your-app.vercel.app/api/admin/register-app \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{
    "appId": "my-production-app",
    "name": "My Production App",
    "tier": "pro"
  }'
```

**⚠️ Security**: Delete this endpoint after registering your apps!

---

## Quick Production Token Generation Script

Save this as `scripts/generate-production-token.js`:

```javascript
const crypto = require('crypto');

console.log('\n🔐 QuakeWise Production Token Generator\n');
console.log('═══════════════════════════════════════════════════════════\n');

const platformSecret = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 Add these to Vercel Environment Variables:\n');
console.log('API_PLATFORM_SECRET=');
console.log(platformSecret);
console.log('\nJWT_SECRET=');
console.log(jwtSecret);
console.log('\n═══════════════════════════════════════════════════════════');
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Add these to Vercel Dashboard → Settings → Environment Variables');
console.log('   2. Set as "Production" environment');
console.log('   3. Redeploy your application');
console.log('   4. DO NOT commit these values to git\n');
```

Run it:
```bash
node scripts/generate-production-token.js
```

---

## Testing Production API

### 1. Check Health

```bash
curl https://your-app.vercel.app/api/v1/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1.0.0",
    "services": {...}
  }
}
```

### 2. Get Parameters

```bash
curl https://your-app.vercel.app/api/v1/parameters
```

### 3. Issue Token (After Registration)

```bash
curl -X POST https://your-app.vercel.app/api/v1/auth/issue-token \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PRODUCTION_PLATFORM_TOKEN" \
  -d '{
    "userId": "test_user_001",
    "appId": "my-production-app",
    "tier": "pro"
  }'
```

### 4. Perform Assessment

```bash
curl -X POST https://your-app.vercel.app/api/v1/assessment/complete \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "location": {"latitude": 41.0082, "longitude": 28.9784},
    "building": {
      "structuralSystem": "C2",
      "numberOfStories": 5,
      "yearOfConstruction": 2010,
      "designRegulation": "2007-2018"
    }
  }'
```

---

## Production Database Setup

### Vercel Recommended: Vercel Postgres

1. Add Vercel Postgres in your project dashboard
2. Update environment variable:
   ```bash
   POSTGRES_URL=<provided-by-vercel>
   ```
3. Update `lib/db/usageTracker.js` to use Postgres instead of SQLite

### Alternative: External Database

Use any PostgreSQL, MySQL, or MongoDB service:
- **Neon** (PostgreSQL)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **MongoDB Atlas**

---

## Monitoring Production

### Vercel Dashboard

Monitor in Vercel Dashboard:
- Function logs
- Error rates
- Response times
- Bandwidth usage

### Custom Monitoring

View logs:
```bash
vercel logs --follow
```

### Usage Analytics

Check API usage:
```bash
curl https://your-app.vercel.app/api/v1/usage/YOUR_APP_ID?days=7 \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN"
```

---

## Production Checklist

Before going live:

- [ ] Environment variables configured in Vercel
- [ ] Production tokens generated (different from dev)
- [ ] Database configured (Postgres or external)
- [ ] First app registered
- [ ] Platform tokens saved securely
- [ ] Health check endpoint tested
- [ ] Rate limiting verified
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] API documentation accessible
- [ ] Monitoring configured
- [ ] Backup strategy for database

---

## Security Best Practices

1. **Rotate Tokens Regularly**
   - Change platform secrets every 90 days
   - Update JWT secrets every 180 days

2. **Monitor for Abuse**
   - Check rate limit hits
   - Review error logs
   - Monitor authentication failures

3. **Use Different Credentials**
   - Never use dev tokens in production
   - Separate database for production
   - Different API keys for production services

4. **Implement Backups**
   - Regular database backups
   - Export usage data monthly
   - Store platform tokens in vault

---

## Troubleshooting

### Issue: "JWT_SECRET not configured"
**Solution**: Add JWT_SECRET to Vercel environment variables and redeploy

### Issue: "Database connection failed"
**Solution**:
- Check DATABASE_URL in environment variables
- For Vercel, use `/tmp` directory for file-based databases
- Consider using Vercel Postgres for production

### Issue: "Module not found: 'jose'"
**Solution**: Ensure `package.json` includes all dependencies and redeploy

### Issue: Rate limits not working
**Solution**: Check cache configuration and database connectivity

---

## API Endpoints Reference

All endpoints are prefixed with `/api/v1`:

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/status` | GET | None | ❌ | Health check |
| `/parameters` | GET | None | ❌ | Valid parameters |
| `/auth/issue-token` | POST | Platform | ✅ | Issue JWT |
| `/auth/verify-token` | POST | Platform | ✅ | Verify JWT |
| `/assessment/complete` | POST | Both | ✅ | Assessment |
| `/usage/:appId` | GET | Platform | ✅ | Usage stats |

---

## Support

- **Documentation**: https://your-app.vercel.app/api-docs
- **Status Page**: https://your-app.vercel.app/api/v1/status
- **Issues**: GitHub Issues

---

## Summary: Your Production URLs

After deployment:

```
🌐 API Documentation: https://your-app.vercel.app/api-docs
🔍 API Base URL: https://your-app.vercel.app/api/v1
❤️ Health Check: https://your-app.vercel.app/api/v1/status
📖 OpenAPI Spec: https://your-app.vercel.app/api-docs/openapi.json
```

Replace `your-app` with your actual Vercel domain!
