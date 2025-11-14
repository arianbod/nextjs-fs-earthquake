# QuakeWise Internal API - Quick Start Guide

## 🚀 Internal Team Setup in 5 Minutes

This guide will help QuakeWise team members set up the internal API for local development and testing.

---

## Prerequisites

- Node.js >= 22.11.0
- npm installed
- Access to team password manager (1Password/Vault)
- Clerk account with @quakewise.com email
- Database access (Neon PostgreSQL credentials in team vault)

---

## Step 1: Install Dependencies (2 minutes)

```bash
# Install all required packages
npm install

# Key packages for internal API:
# - @prisma/client (database ORM)
# - jose (JWT token handling)
# - swagger-ui-react (API documentation)
# - zod (validation)
```

---

## Step 2: Configure Environment (2 minutes)

```bash
# Copy example environment file
cp .env.local.example .env.local

# Get credentials from team password manager:
# 1. Database URLs (Neon PostgreSQL)
# 2. Service tokens (or generate new ones)
# 3. External API keys (Anthropic, Google Maps)
# 4. Clerk authentication keys

# Add to .env.local:
# - DATABASE_URL=postgresql://...
# - DIRECT_URL=postgresql://...
# - SERVICE_TOKEN_WEB_APP=<from-vault>
# - SERVICE_TOKEN_MOBILE=<from-vault>
# - SERVICE_TOKEN_BATCH=<from-vault>
# - SERVICE_TOKEN_ANALYTICS=<from-vault>
# - SERVICE_TOKEN_DEV=<from-vault>
# - JWT_SECRET=<from-vault>
# - ANTHROPIC_API_KEY=<from-vault>
# - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<from-vault>
# - CLERK_SECRET_KEY=<from-vault>
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from-vault>
```

---

## Step 3: Generate Service Tokens (Optional - First Time Only)

```bash
# Only run if setting up for the first time or adding new services
npm run generate:service-tokens

# This generates tokens for all pre-registered services:
# - quakewise-web-app (WEB_APP tier)
# - quakewise-mobile-api (WEB_APP tier)
# - batch-assessment-processor (BATCH_JOB tier)
# - analytics-service (BATCH_JOB tier)
# - dev-testing-service (DEV_TESTING tier)

# ⚠️ IMPORTANT:
# 1. Save tokens to team password manager immediately
# 2. Add to Vercel production environment
# 3. Delete the generated file after storing tokens
```

---

## Step 4: Initialize Database (1 minute)

```bash
# Sync Prisma schema with database
npm run db:push

# Seed database with pre-registered services
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

---

## Step 5: Start the Server (30 seconds)

```bash
# Start development server
npm run dev

# Server will start on http://localhost:3000
```

---

## Step 6: View Internal Documentation (30 seconds)

Open your browser and visit:

```
http://localhost:3000/api-docs
```

**Authentication Required:** Sign in with your Clerk account using a @quakewise.com email (whitelisted in `config/team-members.js`)

You'll see:
- ✅ Interactive API documentation (Swagger UI)
- ✅ Built-in API tester
- ✅ Code examples for internal services
- ✅ Complete endpoint reference

---

## Test Internal API

### Option 1: Use the Built-in Tester (Recommended)

1. Go to http://localhost:3000/api-docs (sign in with Clerk)
2. Click on the "API Tester" tab
3. Enter a service token (e.g., DEV_TESTING token from .env.local)
4. Click "Send Request" on any endpoint

### Option 2: Use the CLI Test Script

```bash
# Test all endpoints using dev testing service
npm run api:test

# This uses SERVICE_TOKEN_DEV from your environment
```

### Option 3: Use curl

```bash
# Set service token as environment variable for convenience
export SERVICE_TOKEN=$SERVICE_TOKEN_DEV

# 1. Health check (no auth)
curl http://localhost:3000/api/v1/status

# 2. Get valid parameters (no auth)
curl http://localhost:3000/api/v1/parameters

# 3. Issue JWT token (using dev service token)
curl -X POST http://localhost:3000/api/v1/auth/issue-token \
  -H "X-Platform-Token: $SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"clerk_user_123","appId":"dev-testing-service","tier":"DEV_TESTING"}'

# Save the JWT token from response

# 4. Perform assessment (requires both tokens)
curl -X POST http://localhost:3000/api/v1/assessment/complete \
  -H "X-Platform-Token: $SERVICE_TOKEN" \
  -H "Authorization: Bearer <JWT_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
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

## Common Issues & Solutions

### Issue: "JWT_SECRET not configured"

**Solution:** Get the JWT_SECRET from team password manager and add to .env.local

### Issue: "Prisma Client not generated"

**Solution:** Generate the Prisma Client

```bash
npm run db:generate
```

### Issue: "Database connection error"

**Solution:** Check DATABASE_URL in .env.local. Get the correct Neon PostgreSQL connection string from team vault.

```bash
# Verify database connection
npx prisma db pull
```

### Issue: "Service token invalid"

**Solution:** Verify you're using the correct service token from .env.local. Check token matches the one in team password manager.

### Issue: "API docs showing 401/403"

**Solution:** Make sure you're signed in with Clerk using a @quakewise.com email that's whitelisted in `config/team-members.js`

---

## Next Steps

### 1. Read the Full Documentation

- **API_README.md** - Complete API documentation
- **API_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **/api-docs** - Interactive documentation

### 2. Integrate Internal Services

Example internal service integration (for web app or mobile backend):

```javascript
// lib/api/quakewise-api-client.js
const QuakeWiseInternalAPI = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  serviceToken: process.env.SERVICE_TOKEN_WEB_APP,
  serviceTier: 'WEB_APP',

  async getUserToken(clerkUserId) {
    const res = await fetch(`${this.baseUrl}/auth/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': this.serviceToken
      },
      body: JSON.stringify({
        userId: clerkUserId,
        appId: 'quakewise-web-app',
        tier: this.serviceTier
      })
    });
    const data = await res.json();
    return data.data.token;
  },

  async assessBuilding(userToken, buildingData) {
    const res = await fetch(`${this.baseUrl}/assessment/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': this.serviceToken,
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(buildingData)
    });
    return await res.json();
  }
};

// Usage in Next.js API route
export async function POST(request) {
  const { userId } = await request.json();
  const token = await QuakeWiseInternalAPI.getUserToken(userId);
  const assessment = await QuakeWiseInternalAPI.assessBuilding(token, {
    location: { latitude: 41.0082, longitude: 28.9784 },
    building: {
      structuralSystem: 'C2',
      numberOfStories: 5,
      yearOfConstruction: 2010,
      designRegulation: '2007-2018'
    }
  });
  console.log('Safety Score:', assessment.data.safetyScore.overall);
}
```

### 3. Monitor Internal Service Usage

View usage statistics for any internal service:

```bash
# Monitor web app service usage
curl http://localhost:3000/api/v1/usage/quakewise-web-app \
  -H "X-Platform-Token: $SERVICE_TOKEN_WEB_APP"

# Monitor batch processing service usage
curl http://localhost:3000/api/v1/usage/batch-assessment-processor \
  -H "X-Platform-Token: $SERVICE_TOKEN_BATCH"

# Or use Prisma Studio to view analytics
npm run db:studio
```

### 4. Deploy to Production

See **API_README.md** section "Production Deployment" for:
- Environment variable configuration
- Security checklist
- Monitoring setup
- Rate limit tuning

---

## Quick Reference

### Helpful Commands

```bash
# Generate service tokens (first time setup)
npm run generate:service-tokens

# Test API
npm run api:test

# View API docs
npm run api:docs

# Database commands
npm run db:push          # Sync schema
npm run db:seed          # Seed with services
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/status` | GET | None | Health check |
| `/parameters` | GET | None | Valid parameters |
| `/auth/issue-token` | POST | Platform | Issue JWT token |
| `/auth/verify-token` | POST | Platform | Verify JWT token |
| `/assessment/complete` | POST | Both | Complete assessment |
| `/usage/:appId` | GET | Platform | Usage statistics |

### Service Tiers & Rate Limits

| Tier        | Requests/Hour | Requests/Day | Services |
|-------------|---------------|--------------|----------|
| WEB_APP     | 10,000        | 100,000      | Web app, Mobile API |
| BATCH_JOB   | 1,000         | 50,000       | Batch processor, Analytics |
| DEV_TESTING | 500           | 5,000        | Development & testing |

---

## Internal Team Support

- **Documentation**: http://localhost:3000/api-docs (requires Clerk auth)
- **Internal Slack**: #api-support channel
- **Team Resources**:
  - API_README.md - Complete API documentation
  - config/internal-services.js - Service registry
  - config/team-members.js - Access control
- **Team Vault**: 1Password "QuakeWise API Tokens"

---

## Success Checklist

- ✅ Dependencies installed (`npm install`)
- ✅ Environment configured (`.env.local` with DATABASE_URL and service tokens)
- ✅ Database seeded (`npm run db:seed`)
- ✅ Server running (`npm run dev`)
- ✅ Clerk authentication working (@quakewise.com email)
- ✅ Docs accessible (http://localhost:3000/api-docs)
- ✅ API tested (`npm run api:test` or built-in tester)

**You're ready to integrate internal services! 🎉**

---

## Pre-Registered Internal Services

| Service ID | Name | Tier | Rate Limit | Use Case |
|------------|------|------|------------|----------|
| `quakewise-web-app` | Web Application | WEB_APP | 10k/hr | Main user-facing web app |
| `quakewise-mobile-api` | Mobile API | WEB_APP | 10k/hr | Mobile backend service |
| `batch-assessment-processor` | Batch Processor | BATCH_JOB | 1k/hr | Background jobs |
| `analytics-service` | Analytics | BATCH_JOB | 1k/hr | Data analytics |
| `dev-testing-service` | Dev/Testing | DEV_TESTING | 500/hr | Development & testing |
