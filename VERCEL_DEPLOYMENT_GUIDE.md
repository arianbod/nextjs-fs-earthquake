# Vercel Deployment Guide: Internal API Setup

**Version:** 1.0
**Last Updated:** 2025-11-14
**Audience:** DevOps Team, System Administrators

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying the QuakeWise Internal API to Vercel and configuring the production database.

**What you'll do:**
1. ✅ Add service tokens to Vercel environment variables
2. ✅ Seed the production database with pre-registered services
3. ✅ Verify the deployment is working correctly
4. ✅ Test the API endpoints

**Prerequisites:**
- Vercel account with project access
- Service tokens generated (from `npm run generate:service-tokens`)
- Neon PostgreSQL database configured
- Vercel CLI installed (optional, for command-line deployment)

---

## 📋 Step 1: Add Service Tokens to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/
   - Sign in with your account
   - Navigate to your QuakeWise project

2. **Access Environment Variables**
   ```
   Project → Settings → Environment Variables
   ```

3. **Add Each Service Token**

   For each of the 5 service tokens, add a new environment variable:

   **Token 1: Web App Service**
   ```
   Key:   SERVICE_TOKEN_WEB_APP
   Value: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93
   Environments: ☑ Production  ☑ Preview  ☑ Development
   ```
   Click **Save**

   **Token 2: Mobile Service**
   ```
   Key:   SERVICE_TOKEN_MOBILE
   Value: 7a4f90d1a1fa52dac26cf52bac89a2d4492e344f7a5cc81bd1c4e79dc39d0422
   Environments: ☑ Production  ☑ Preview  ☑ Development
   ```
   Click **Save**

   **Token 3: Batch Processing Service**
   ```
   Key:   SERVICE_TOKEN_BATCH
   Value: 04f47ebb6cf55aa4dbf695fef74774af70e150dc42a29534ff6a212eb669e79d
   Environments: ☑ Production  ☑ Preview  ☑ Development
   ```
   Click **Save**

   **Token 4: Analytics Service**
   ```
   Key:   SERVICE_TOKEN_ANALYTICS
   Value: b31cf417b15db19e2ef709eb96c4fbd3b4181fc2738417d8ea04daea2ad872c4
   Environments: ☑ Production  ☑ Preview  ☑ Development
   ```
   Click **Save**

   **Token 5: Development/Testing Service**
   ```
   Key:   SERVICE_TOKEN_DEV
   Value: b63c20b7779474d82616d615516394d9e7521e2d29143e8eda66ea74e41a77ee
   Environments: ☑ Production  ☑ Preview  ☑ Development
   ```
   Click **Save**

4. **Verify All Tokens Are Added**

   You should now see 5 environment variables (plus any existing ones):
   - ✅ `SERVICE_TOKEN_WEB_APP`
   - ✅ `SERVICE_TOKEN_MOBILE`
   - ✅ `SERVICE_TOKEN_BATCH`
   - ✅ `SERVICE_TOKEN_ANALYTICS`
   - ✅ `SERVICE_TOKEN_DEV`

5. **Important: Redeploy to Apply Changes**

   Environment variable changes only apply to new deployments:

   ```
   Project → Deployments → (Latest Deployment) → ⋯ → Redeploy
   ```

   **OR** trigger a new deployment by pushing code:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push origin main
   ```

---

### Option B: Vercel CLI (Alternative)

If you prefer command-line deployment:

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Add Environment Variables**

   ```bash
   # Set for production
   vercel env add SERVICE_TOKEN_WEB_APP production
   # Paste token when prompted: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93

   vercel env add SERVICE_TOKEN_MOBILE production
   # Paste: 7a4f90d1a1fa52dac26cf52bac89a2d4492e344f7a5cc81bd1c4e79dc39d0422

   vercel env add SERVICE_TOKEN_BATCH production
   # Paste: 04f47ebb6cf55aa4dbf695fef74774af70e150dc42a29534ff6a212eb669e79d

   vercel env add SERVICE_TOKEN_ANALYTICS production
   # Paste: b31cf417b15db19e2ef709eb96c4fbd3b4181fc2738417d8ea04daea2ad872c4

   vercel env add SERVICE_TOKEN_DEV production
   # Paste: b63c20b7779474d82616d615516394d9e7521e2d29143e8eda66ea74e41a77ee
   ```

4. **Repeat for Preview and Development** (optional)

   ```bash
   vercel env add SERVICE_TOKEN_WEB_APP preview
   vercel env add SERVICE_TOKEN_WEB_APP development
   # ... repeat for all 5 tokens
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## 📋 Step 2: Verify Other Required Environment Variables

Make sure these environment variables are also set in Vercel:

### Required for API Functionality

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/quakewise?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/quakewise?sslmode=require

# JWT Authentication
JWT_SECRET=your_jwt_secret_here_minimum_32_characters

# Clerk Authentication (for API docs access)
CLERK_SECRET_KEY=[your_clerk_secret_key_here]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[your_clerk_publishable_key_here]

# Google Maps (for assessment features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[your_google_maps_api_key_here]

# Anthropic Claude (for AI image analysis)
ANTHROPIC_API_KEY=[your_anthropic_api_key_here]
```

**To check:**
```
Vercel Dashboard → Settings → Environment Variables
```

Verify all the above are present for **Production** environment.

---

## 📋 Step 3: Seed Production Database

Now that environment variables are set, seed the production database with pre-registered services.

### Option A: Via Vercel Serverless Function (Recommended)

Since Vercel is serverless, we'll create a special API endpoint to trigger seeding:

1. **Temporarily Create Seed Endpoint**

   Create `app/api/admin/seed/route.js`:

   ```javascript
   import { PrismaClient } from '@prisma/client';
   import crypto from 'crypto';
   import { INTERNAL_SERVICES, SERVICE_TIERS } from '@/config/internal-services';

   const prisma = new PrismaClient();

   function hashToken(token) {
     return crypto.createHash('sha256').update(token).digest('hex');
   }

   function getServiceToken(serviceId) {
     const envVarMap = {
       'quakewise-web-app': process.env.SERVICE_TOKEN_WEB_APP,
       'quakewise-mobile-api': process.env.SERVICE_TOKEN_MOBILE,
       'batch-assessment-processor': process.env.SERVICE_TOKEN_BATCH,
       'analytics-service': process.env.SERVICE_TOKEN_ANALYTICS,
       'dev-testing-service': process.env.SERVICE_TOKEN_DEV,
     };
     return envVarMap[serviceId];
   }

   export async function GET(request) {
     // Security: Only allow from localhost or with admin secret
     const adminSecret = request.headers.get('x-admin-secret');
     if (adminSecret !== process.env.ADMIN_SECRET) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }

     try {
       const results = [];

       for (const [serviceId, serviceConfig] of Object.entries(INTERNAL_SERVICES)) {
         const serviceToken = getServiceToken(serviceId);

         if (!serviceToken) {
           results.push({
             service: serviceId,
             status: 'skipped',
             reason: 'No token in environment'
           });
           continue;
         }

         const tierConfig = SERVICE_TIERS[serviceConfig.tier];
         const tokenHash = hashToken(serviceToken);

         const service = await prisma.apiApp.upsert({
           where: { platformTokenHash: tokenHash },
           update: {
             name: serviceConfig.name,
             tier: serviceConfig.tier,
             rateLimitPerHour: tierConfig.rateLimitPerHour,
             rateLimitPerDay: tierConfig.rateLimitPerDay,
             status: 'ACTIVE',
             metadata: {
               owner: serviceConfig.owner,
               contact: serviceConfig.contact,
               description: serviceConfig.description
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
               description: serviceConfig.description
             }
           }
         });

         results.push({
           service: serviceId,
           status: 'success',
           name: service.name,
           tier: service.tier
         });
       }

       await prisma.$disconnect();

       return Response.json({
         success: true,
         message: 'Database seeded successfully',
         results
       });
     } catch (error) {
       await prisma.$disconnect();
       return Response.json({
         success: false,
         error: error.message
       }, { status: 500 });
     }
   }
   ```

2. **Add ADMIN_SECRET to Vercel**

   ```
   Vercel Dashboard → Environment Variables → Add New

   Key:   ADMIN_SECRET
   Value: [generate a random string, e.g., "seed_admin_2025_xyz123abc"]
   Environments: Production only
   ```

   Save and redeploy.

3. **Trigger Database Seeding**

   From your local terminal:

   ```bash
   curl -X GET https://quakewise.com/api/admin/seed \
     -H "x-admin-secret: seed_admin_2025_xyz123abc"
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Database seeded successfully",
     "results": [
       { "service": "quakewise-web-app", "status": "success", "name": "QuakeWise Web Application", "tier": "WEB_APP" },
       { "service": "quakewise-mobile-api", "status": "success", "name": "QuakeWise Mobile API", "tier": "WEB_APP" },
       { "service": "batch-assessment-processor", "status": "success", "name": "Batch Assessment Processor", "tier": "BATCH_JOB" },
       { "service": "analytics-service", "status": "success", "name": "Analytics & Reporting Service", "tier": "BATCH_JOB" },
       { "service": "dev-testing-service", "status": "success", "name": "Development Testing", "tier": "DEV_TESTING" }
     ]
   }
   ```

4. **Delete Seed Endpoint (Security)**

   After successful seeding, delete the seed endpoint:

   ```bash
   rm app/api/admin/seed/route.js
   git add app/api/admin/seed/route.js
   git commit -m "Remove admin seed endpoint after database seeding"
   git push origin main
   ```

   **OR** keep it but add strict IP whitelisting.

---

### Option B: Via Local Script with Production Database URL

If you prefer to run the seed script locally but against the production database:

1. **Temporarily Set Production DATABASE_URL Locally**

   Copy your production database URL from Vercel:
   ```
   Vercel → Environment Variables → DATABASE_URL → Copy
   ```

   In your terminal:
   ```bash
   export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/quakewise?sslmode=require"
   export SERVICE_TOKEN_WEB_APP="15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93"
   export SERVICE_TOKEN_MOBILE="7a4f90d1a1fa52dac26cf52bac89a2d4492e344f7a5cc81bd1c4e79dc39d0422"
   export SERVICE_TOKEN_BATCH="04f47ebb6cf55aa4dbf695fef74774af70e150dc42a29534ff6a212eb669e79d"
   export SERVICE_TOKEN_ANALYTICS="b31cf417b15db19e2ef709eb96c4fbd3b4181fc2738417d8ea04daea2ad872c4"
   export SERVICE_TOKEN_DEV="b63c20b7779474d82616d615516394d9e7521e2d29143e8eda66ea74e41a77ee"
   ```

2. **Run Seed Script**
   ```bash
   npm run db:seed
   ```

3. **Verify Output**
   ```
   🌱 Seeding production database...

   ✅ quakewise-web-app
      Name: QuakeWise Web Application
      Tier: WEB_APP (10,000 req/hour, 100,000 req/day)
      Status: ACTIVE

   ✅ quakewise-mobile-api
      Name: QuakeWise Mobile API
      Tier: WEB_APP (10,000 req/hour, 100,000 req/day)
      Status: ACTIVE

   ... (3 more services)

   🎉 Database seeding completed successfully!
   Total services seeded: 5
   ```

4. **Unset Environment Variables** (important!)
   ```bash
   unset DATABASE_URL
   unset SERVICE_TOKEN_WEB_APP
   unset SERVICE_TOKEN_MOBILE
   unset SERVICE_TOKEN_BATCH
   unset SERVICE_TOKEN_ANALYTICS
   unset SERVICE_TOKEN_DEV
   ```

---

## 📋 Step 4: Verify Database Seeding

1. **Open Neon Database Console**
   - Go to: https://console.neon.tech/
   - Navigate to your QuakeWise project
   - Click "SQL Editor"

2. **Run Verification Query**

   ```sql
   SELECT
     id,
     name,
     tier,
     "rateLimitPerHour" as rate_limit_hour,
     "rateLimitPerDay" as rate_limit_day,
     status,
     "createdAt" as created_at,
     "lastUsedAt" as last_used
   FROM "ApiApp"
   ORDER BY "createdAt" DESC;
   ```

   Expected results:
   ```
   id                          | name                              | tier        | rate_limit_hour | rate_limit_day | status | created_at           | last_used
   ---------------------------|-----------------------------------|-------------|-----------------|----------------|--------|----------------------|----------
   quakewise-web-app          | QuakeWise Web Application         | WEB_APP     | 10000           | 100000         | ACTIVE | 2025-11-14 16:20:00 | NULL
   quakewise-mobile-api       | QuakeWise Mobile API              | WEB_APP     | 10000           | 100000         | ACTIVE | 2025-11-14 16:20:00 | NULL
   batch-assessment-processor | Batch Assessment Processor        | BATCH_JOB   | 1000            | 50000          | ACTIVE | 2025-11-14 16:20:00 | NULL
   analytics-service          | Analytics & Reporting Service     | BATCH_JOB   | 1000            | 50000          | ACTIVE | 2025-11-14 16:20:00 | NULL
   dev-testing-service        | Development Testing               | DEV_TESTING | 500             | 5000           | ACTIVE | 2025-11-14 16:20:00 | NULL
   ```

3. **Verify Token Hashes**

   ```sql
   SELECT
     id,
     LEFT("platformTokenHash", 16) as token_hash_preview,
     LENGTH("platformTokenHash") as hash_length
   FROM "ApiApp";
   ```

   Expected:
   ```
   id                          | token_hash_preview | hash_length
   ---------------------------|-------------------|-------------
   quakewise-web-app          | a7f3d8e9b2c1...  | 64
   quakewise-mobile-api       | 3e4f5a6b7c8d...  | 64
   ... (all should have 64-character SHA-256 hashes)
   ```

---

## 📋 Step 5: Test API Endpoints

### Test 1: Health Check

```bash
curl https://quakewise.com/api/v1/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "timestamp": "2025-11-14T16:30:00.000Z",
    "version": "1.1.0"
  }
}
```

---

### Test 2: Issue JWT Token (Web App Service)

```bash
curl -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "X-Platform-Token: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_deployment_check",
    "appId": "quakewise-web-app",
    "tier": "WEB_APP"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfZGVwbG95bWVudF9jaGVjayIsImFwcElkIjoicXVha2V3aXNlLXdlYi1hcHAiLCJ0aWVyIjoiV0VCX0FQUCIsImlhdCI6MTY5OTkwMDgwMCwiZXhwIjoxNjk5OTg3MjAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "expiresIn": "24h"
  }
}
```

---

### Test 3: Complete Assessment (Full Flow)

```bash
# Step 1: Get JWT token
JWT_TOKEN=$(curl -s -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "X-Platform-Token: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","appId":"quakewise-web-app","tier":"WEB_APP"}' \
  | jq -r '.data.token')

# Step 2: Make assessment request
curl -X POST https://quakewise.com/api/v1/assessment/complete \
  -H "X-Platform-Token: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "latitude": 41.0082,
      "longitude": 28.9784
    },
    "building": {
      "structuralSystem": "C2",
      "numberOfStories": 5,
      "yearOfConstruction": 2010,
      "designRegulation": "2007-2018",
      "totalFloorArea": 1000,
      "softStory": false,
      "planIrregularity": "none",
      "verticalIrregularity": "none",
      "apparentQuality": "good",
      "maintenance": "good",
      "soil": {
        "type": "Z2",
        "slope": 0
      }
    }
  }'
```

Expected response (truncated):
```json
{
  "success": true,
  "data": {
    "safetyScore": {
      "overall": 72,
      "structural": 78,
      "seismic": 68,
      "environmental": 75
    },
    "riskLevel": "MODERATE",
    "recommendations": [...]
  }
}
```

---

### Test 4: Verify API Documentation Access

1. **Visit API Docs:** https://quakewise.com/api-docs

2. **Sign In with Clerk**
   - Use your `@quakewise.com` email

3. **Verify Access:**
   - If email is in whitelist: See full API documentation
   - If email is NOT in whitelist: See "Access Denied" message

4. **Test Interactive API Tester:**
   - Go to "API Tester" tab
   - Enter service token
   - Test endpoints directly from browser

---

## 📋 Step 6: Monitor Deployment

### Check Vercel Deployment Logs

```
Vercel Dashboard → Deployments → (Latest) → View Function Logs
```

Look for:
- ✅ No errors during build
- ✅ Environment variables loaded correctly
- ✅ Prisma client generated successfully
- ✅ API routes responding

---

### Check Database Activity

In Neon Console:

```sql
-- Check API usage
SELECT
  "appId",
  COUNT(*) as total_requests,
  MAX("timestamp") as last_request
FROM "ApiUsage"
GROUP BY "appId"
ORDER BY total_requests DESC;
```

---

### Check Rate Limits

```sql
-- Check rate limit records
SELECT
  "appId",
  "requestCount",
  "resetAt"
FROM "ApiRateLimit"
WHERE "resetAt" > NOW()
ORDER BY "requestCount" DESC;
```

---

## 🔧 Troubleshooting

### Issue: "Invalid service token" Error

**Possible Causes:**
1. Service token not added to Vercel environment variables
2. Token value has extra spaces or characters
3. Database not seeded with token hash

**Solution:**
```bash
# 1. Verify token in Vercel
Vercel Dashboard → Environment Variables → SERVICE_TOKEN_WEB_APP

# 2. Check token value matches exactly (no quotes, no spaces)
# Correct:   15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93
# Incorrect: "15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93"
# Incorrect: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93

# 3. Re-seed database if needed
```

---

### Issue: Database Connection Failed

**Error:** `PrismaClientInitializationError: Can't reach database`

**Solution:**
1. Verify `DATABASE_URL` in Vercel matches Neon connection string
2. Check Neon database is not suspended (free tier)
3. Verify SSL mode: `?sslmode=require`
4. Check IP allowlist in Neon (should allow all for Vercel)

---

### Issue: JWT Token Verification Failed

**Error:** `JsonWebTokenError: invalid signature`

**Solution:**
1. Verify `JWT_SECRET` is set in Vercel
2. Must be minimum 32 characters
3. Must match between token issuance and verification
4. Check for environment variable naming (JWT_SECRET vs JWT_SECRET_KEY)

---

### Issue: Rate Limit Not Working

**Symptoms:** Requests exceed limits without being blocked

**Solution:**
1. Check service is seeded in database with correct tier
2. Verify `rateLimitPerHour` values in `ApiApp` table
3. Check rate limit middleware is applied to routes
4. Clear rate limit records in database:
   ```sql
   DELETE FROM "ApiRateLimit";
   ```

---

### Issue: API Docs Show "Access Denied"

**Cause:** Email not in team whitelist

**Solution:**
1. Add email to `config/team-members.js`
2. Commit and push changes
3. Wait for Vercel deployment to complete
4. User signs out and back in with Clerk

---

## 📊 Post-Deployment Checklist

- [ ] All 5 service tokens added to Vercel environment variables
- [ ] All required environment variables present (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Code redeployed after adding environment variables
- [ ] Production database seeded with 5 services
- [ ] Health check endpoint returns 200 OK
- [ ] Token issuance endpoint works (returns JWT)
- [ ] Complete assessment endpoint works (returns safety score)
- [ ] API documentation accessible at https://quakewise.com/api-docs
- [ ] Team members can sign in with Clerk and view docs
- [ ] Unauthorized emails see "Access Denied" message
- [ ] Rate limiting is functioning (check after multiple requests)
- [ ] Usage tracking records appear in database

---

## 🔄 Updating Service Tokens (Token Rotation)

If tokens are compromised, rotate them:

1. **Generate New Tokens**
   ```bash
   npm run generate:service-tokens
   ```

2. **Update Vercel Environment Variables**
   - Replace old token values with new ones
   - Redeploy application

3. **Re-Seed Database**
   - Run seed script with new tokens
   - Database will update token hashes via `upsert`

4. **Update Password Manager**
   - Replace old tokens in team vault
   - Notify all team members

5. **Verify Old Tokens No Longer Work**
   ```bash
   # Test with old token (should fail)
   curl -X POST https://quakewise.com/api/v1/auth/issue-token \
     -H "X-Platform-Token: OLD_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"userId":"test","appId":"quakewise-web-app","tier":"WEB_APP"}'

   # Expected: { "error": "Invalid service token" }
   ```

---

## 📚 Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Neon PostgreSQL:** https://neon.tech/docs
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **Team Access Guide:** [TEAM_ACCESS_GUIDE.md](./TEAM_ACCESS_GUIDE.md)
- **User Flow Diagram:** [USER_FLOW_DIAGRAM.md](./USER_FLOW_DIAGRAM.md)
- **API Documentation:** [API_README.md](./API_README.md)

---

## 🎉 Deployment Complete!

Your QuakeWise Internal API is now live on Vercel with:

✅ All service tokens configured
✅ Production database seeded
✅ Internal services authenticated
✅ Team documentation access secured
✅ Rate limiting active
✅ Usage tracking enabled

**Next Steps:**
1. Share service tokens with app developers (see [TEAM_ACCESS_GUIDE.md](./TEAM_ACCESS_GUIDE.md))
2. Monitor API usage in Neon console
3. Update team email whitelist as new members join
4. Review API logs regularly for errors

**Questions?** Contact DevOps team or post in #api-support
