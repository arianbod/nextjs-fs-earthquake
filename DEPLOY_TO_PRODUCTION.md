# Deploy QuakeWise API to Production - quakewise.com

## 🚀 Complete Deployment Guide for quakewise.com

Your API will be accessible at: **https://quakewise.com/api/v1**

---

## Step 1: Generate Production Tokens (2 minutes)

Run on your local machine:

```bash
npm run api:prod-tokens
```

This generates:
- ✅ `API_PLATFORM_SECRET` (256-bit)
- ✅ `JWT_SECRET` (256-bit)
- ✅ `ADMIN_SECRET` (256-bit)

**💾 Save the output!** You'll need these tokens in Step 2.

---

## Step 2: Configure Vercel Environment Variables (5 minutes)

### Go to Vercel Dashboard:
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `quakewise` project
3. Go to: **Settings → Environment Variables**

### Add These Variables:

#### **Domain Configuration**
```bash
NEXT_PUBLIC_APP_URL=https://quakewise.com
NEXT_PUBLIC_API_URL=https://quakewise.com/api/v1
```

#### **API Secrets** (from Step 1 output)
```bash
API_PLATFORM_SECRET=<paste-from-step-1>
JWT_SECRET=<paste-from-step-1>
JWT_EXPIRY=7d
JWT_ISSUER=quakewise-api
ADMIN_SECRET=<paste-from-step-1>
```

#### **Database**
```bash
API_DATABASE_PATH=/tmp/api_usage.db
LOG_DIR=/tmp/logs
NODE_ENV=production
```

#### **Your Existing API Keys**
```bash
ANTHROPIC_API_KEY=<your-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
CLERK_SECRET_KEY=<your-key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-key>
NEXT_PUBLIC_OPENWEATHER_API_KEY=<your-key>
```

#### **Rate Limits** (Optional)
```bash
RATE_LIMIT_FREE_TIER=100
RATE_LIMIT_PRO_TIER=1000
RATE_LIMIT_ENTERPRISE_TIER=10000
```

⚠️ **Important**: Set environment to **"Production"** for all variables!

---

## Step 3: Deploy to Vercel (3 minutes)

### Option A: Via Vercel Dashboard
1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Select branch: `underDev,RLS1.1`
4. Click **"Deploy"**

### Option B: Via Git Push (Automatic)
```bash
# Already done! Your code is on underDev,RLS1.1
# Vercel will auto-deploy from this branch
```

### Option C: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

**⏱️ Wait 2-3 minutes for deployment to complete**

---

## Step 4: Verify Deployment (1 minute)

### Test Health Endpoint:
```bash
curl https://quakewise.com/api/v1/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1.0.0",
    "services": {
      "database": "healthy",
      "ai": "configured",
      "geospatial": "configured",
      "authentication": "configured"
    }
  }
}
```

✅ If you see this, your API is live!

---

## Step 5: Register Your First Production App (2 minutes)

Use the admin endpoint to create your first platform app:

```bash
curl -X POST https://quakewise.com/api/admin/register-app \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET_FROM_STEP1" \
  -d '{
    "appId": "quakewise-web-app",
    "name": "QuakeWise Web Application",
    "tier": "enterprise"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appId": "quakewise-web-app",
    "name": "QuakeWise Web Application",
    "tier": "enterprise",
    "platformToken": "abc123...xyz789",
    "message": "App registered successfully. Save the platform token - it will not be shown again!"
  }
}
```

**⚠️ CRITICAL: Save the `platformToken` immediately!**

---

## Step 6: Test Complete API Flow (3 minutes)

### A. Issue User JWT Token
```bash
curl -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN_FROM_STEP5" \
  -d '{
    "userId": "test_user_001",
    "appId": "quakewise-web-app",
    "tier": "enterprise"
  }'
```

**Save the JWT token from response!**

### B. Perform Building Assessment
```bash
curl -X POST https://quakewise.com/api/v1/assessment/complete \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_FROM_STEP_A" \
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
      "typeOfSoil": "ZC",
      "typeOfEarthquake": "Zone 4"
    },
    "options": {
      "includeAiAnalysis": false,
      "includeLocationIntelligence": true,
      "includeWeatherRisk": true
    }
  }'
```

**Expected**: Safety assessment with scores and recommendations

✅ **Success!** Your API is fully functional!

---

## 🌐 Your Production API URLs

### Public Endpoints (No Authentication)
```
📖 API Documentation: https://quakewise.com/api-docs
❤️ Health Check: https://quakewise.com/api/v1/status
📋 Parameters: https://quakewise.com/api/v1/parameters
📄 OpenAPI Spec: https://quakewise.com/api-docs/openapi.json
```

### Authenticated Endpoints
```
🔑 Issue Token: https://quakewise.com/api/v1/auth/issue-token
✅ Verify Token: https://quakewise.com/api/v1/auth/verify-token
🏢 Assessment: https://quakewise.com/api/v1/assessment/complete
📊 Usage Stats: https://quakewise.com/api/v1/usage/{appId}
```

### Admin Endpoint (Disable After Setup)
```
⚙️ Register App: https://quakewise.com/api/admin/register-app
```

---

## 📊 Monitoring & Analytics

### View Usage Statistics
```bash
curl https://quakewise.com/api/v1/usage/quakewise-web-app?days=7 \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN"
```

### View Vercel Logs
```bash
vercel logs --follow
```

### Monitor in Vercel Dashboard
- **Analytics** tab: Traffic, performance, errors
- **Logs** tab: Real-time API logs
- **Deployments** tab: Deployment history

---

## 🔐 Security Checklist

After deployment:

- [x] Production tokens generated
- [x] Environment variables configured in Vercel
- [x] Custom domain configured (quakewise.com)
- [x] HTTPS enabled (automatic)
- [x] Rate limiting active
- [x] First app registered
- [x] Platform token saved securely
- [ ] **TODO**: Test all endpoints
- [ ] **TODO**: Delete local token file
- [ ] **TODO**: Disable admin endpoint after setup
- [ ] **TODO**: Set up monitoring alerts
- [ ] **TODO**: Configure backup for database

---

## 🛠️ Post-Deployment Tasks

### 1. Disable Admin Endpoint (Recommended)

After registering all your apps, remove or protect the admin endpoint:

**Option A: Remove from code**
```bash
# Delete: app/api/admin/register-app/route.js
# Commit and redeploy
```

**Option B: Add IP whitelist**
```javascript
// In app/api/admin/register-app/route.js
const allowedIPs = ['YOUR_IP_ADDRESS'];
const clientIP = request.headers.get('x-forwarded-for');
if (!allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 2. Set Up Database Backups

For production, consider:
- **Vercel Postgres**: Automatic backups
- **Neon**: Built-in backups
- **Supabase**: Point-in-time recovery

### 3. Configure Monitoring

Set up alerts for:
- API errors (500 errors)
- Rate limit hits
- Authentication failures
- Slow response times

### 4. Document for Your Team

Share with developers:
```
API Base URL: https://quakewise.com/api/v1
Documentation: https://quakewise.com/api-docs
Platform Token: <provide-securely>
Rate Limits: Enterprise (10,000/hour)
```

---

## 🚨 Troubleshooting

### Issue: "Module not found: jose"
**Solution**:
```bash
# Ensure package.json includes jose
# Redeploy to Vercel
```

### Issue: "JWT_SECRET not configured"
**Solution**:
- Check Vercel environment variables
- Ensure set to "Production" environment
- Redeploy

### Issue: "Database connection failed"
**Solution**:
- For file-based: Use `/tmp/api_usage.db` (Vercel ephemeral)
- For persistent: Use external Postgres database

### Issue: 404 on API endpoints
**Solution**:
- Ensure deploying from `underDev,RLS1.1` branch
- Check deployment logs in Vercel

---

## 📞 Support Resources

- **API Documentation**: https://quakewise.com/api-docs
- **Repository**: github.com/arianbod/nextjs-fs-earthquake
- **Branch**: underDev,RLS1.1
- **Deployment Logs**: Vercel Dashboard → Deployments → View Logs

---

## ✅ Deployment Complete!

Your QuakeWise External API is now live at:

```
🌐 https://quakewise.com/api/v1
📚 https://quakewise.com/api-docs
```

**Next Steps:**
1. Test all endpoints
2. Register additional apps as needed
3. Share API documentation with developers
4. Monitor usage and performance
5. Set up automated backups

**🎉 Congratulations! Your API is production-ready!**
