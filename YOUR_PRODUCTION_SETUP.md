# 🚀 Your QuakeWise API - Production Setup for quakewise.com

## ✅ Everything is Ready!

Your code is deployed to branch `underDev,RLS1.1` and ready for production at **quakewise.com**.

---

## 📋 Step 1: Copy Your Production Tokens

I've generated secure production tokens for you. Here they are:

### **Add These to Vercel Environment Variables:**

```bash
# Domain Configuration
NEXT_PUBLIC_APP_URL=https://quakewise.com
NEXT_PUBLIC_API_URL=https://quakewise.com/api/v1

# API Secrets (Generated Tokens)
API_PLATFORM_SECRET=3df4667196f8d52dee0b0eaa799b2ae14f4af0472d35b3fada232bf54454237d
JWT_SECRET=56b7a35fee902e9c516d1846705a8dbb04bb2e2117be94cac324e1ce27a6725b
JWT_EXPIRY=7d
JWT_ISSUER=quakewise-api
ADMIN_SECRET=870ba52f8ac8c0b5d4c05277733e3ad9b1ddc76b25885171b0f977ff15b8ccab

# Database
API_DATABASE_PATH=/tmp/api_usage.db
LOG_DIR=/tmp/logs
NODE_ENV=production

# Rate Limits (Optional)
RATE_LIMIT_FREE_TIER=100
RATE_LIMIT_PRO_TIER=1000
RATE_LIMIT_ENTERPRISE_TIER=10000
```

**⚠️ IMPORTANT**: Also add your existing API keys:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## 🌐 Step 2: Deploy to Vercel

### Go to Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Select your QuakeWise project
3. Go to: **Settings → Environment Variables**
4. Add all variables from Step 1 above
5. Set environment to: **Production**
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Deploy** (select branch: `underDev,RLS1.1`)

**⏱️ Wait 2-3 minutes for deployment**

---

## 🎯 Step 3: Your API is Live!

After deployment, your API will be accessible at:

```
🌐 Base URL:          https://quakewise.com/api/v1
📖 Documentation:     https://quakewise.com/api-docs
❤️ Health Check:      https://quakewise.com/api/v1/status
📋 Parameters:        https://quakewise.com/api/v1/parameters
```

---

## 🔑 Step 4: Create Your First Platform Token

Use the admin endpoint to register your first app:

```bash
curl -X POST https://quakewise.com/api/admin/register-app \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: 870ba52f8ac8c0b5d4c05277733e3ad9b1ddc76b25885171b0f977ff15b8ccab" \
  -d '{
    "appId": "quakewise-web",
    "name": "QuakeWise Web Application",
    "tier": "enterprise"
  }'
```

**Response will include your PLATFORM_TOKEN - save it securely!**

Example response:
```json
{
  "success": true,
  "data": {
    "appId": "quakewise-web",
    "platformToken": "abc123def456...",
    "tier": "enterprise",
    "message": "App registered successfully. Save the platform token - it will not be shown again!"
  }
}
```

---

## 🧪 Step 5: Test Your Production API

### Test 1: Health Check (No Auth)
```bash
curl https://quakewise.com/api/v1/status
```

### Test 2: Issue User Token
```bash
curl -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN_FROM_STEP4" \
  -d '{
    "userId": "user_001",
    "appId": "quakewise-web",
    "tier": "enterprise"
  }'
```

**Save the JWT token from response!**

### Test 3: Building Assessment
```bash
curl -X POST https://quakewise.com/api/v1/assessment/complete \
  -H "Content-Type: application/json" \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "location": {
      "latitude": 41.0082,
      "longitude": 28.9784
    },
    "building": {
      "structuralSystem": "C2",
      "numberOfStories": 5,
      "yearOfConstruction": 2010,
      "designRegulation": "2007-2018"
    }
  }'
```

---

## 📊 How to Create Additional Platform Tokens

### Method 1: Via Admin Endpoint (Recommended)

Use the same command as Step 4 with different app details:

```bash
curl -X POST https://quakewise.com/api/admin/register-app \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: 870ba52f8ac8c0b5d4c05277733e3ad9b1ddc76b25885171b0f977ff15b8ccab" \
  -d '{
    "appId": "mobile-app",
    "name": "QuakeWise Mobile App",
    "tier": "pro"
  }'
```

Each app gets its own unique platform token.

### Method 2: Via Script (If You Have Database Access)

```bash
# SSH to your server or use Vercel CLI
node scripts/register-app.js
```

---

## 🔐 Security Recommendations

### After Setup:

1. **Disable Admin Endpoint** (Recommended)
   - Delete `app/api/admin/register-app/route.js`
   - Commit and redeploy

2. **Save Tokens Securely**
   - Store in password manager (1Password, LastPass, etc.)
   - Never commit tokens to git
   - Never share publicly

3. **Monitor Usage**
   ```bash
   curl https://quakewise.com/api/v1/usage/quakewise-web?days=7 \
     -H "X-Platform-Token: YOUR_PLATFORM_TOKEN"
   ```

4. **Rotate Tokens Quarterly**
   - Generate new tokens every 90 days
   - Update in Vercel
   - Update in client apps

---

## 📚 Complete Documentation

All guides are available:

| Document | Purpose |
|----------|---------|
| **DEPLOY_TO_PRODUCTION.md** | Complete deployment guide |
| **API_QUICK_REFERENCE.md** | Quick reference with all URLs |
| **API_README.md** | Full API documentation |
| **QUICK_START.md** | Local development setup |

---

## 🎯 Quick Reference

### Your Production URLs
```
📖 https://quakewise.com/api-docs
🔗 https://quakewise.com/api/v1/status
🔑 https://quakewise.com/api/v1/auth/issue-token
🏢 https://quakewise.com/api/v1/assessment/complete
📊 https://quakewise.com/api/v1/usage/{appId}
```

### Your Tokens (Keep Secure!)
```
Admin Secret:    870ba52f8ac8c0b5d4c05277733e3ad9b1ddc76b25885171b0f977ff15b8ccab
Platform Secret: 3df4667196f8d52dee0b0eaa799b2ae14f4af0472d35b3fada232bf54454237d
JWT Secret:      56b7a35fee902e9c516d1846705a8dbb04bb2e2117be94cac324e1ce27a6725b
```

### Authentication Flow
```
1. Register App → Get PLATFORM_TOKEN
2. Issue User Token → Get JWT_TOKEN
3. Use Both Tokens → Access API
```

---

## ✅ Deployment Checklist

- [ ] Add environment variables to Vercel
- [ ] Deploy from `underDev,RLS1.1` branch
- [ ] Test health endpoint
- [ ] Register first app
- [ ] Save platform token
- [ ] Test JWT token issuance
- [ ] Test assessment endpoint
- [ ] View API documentation
- [ ] Set up monitoring
- [ ] Disable admin endpoint (optional)

---

## 🆘 Need Help?

1. **Check API Documentation**: https://quakewise.com/api-docs
2. **View Health Status**: https://quakewise.com/api/v1/status
3. **Check Vercel Logs**: Vercel Dashboard → Logs
4. **Read Guides**: See documentation files in repository

---

## 🎉 You're All Set!

Your QuakeWise External API is production-ready at **quakewise.com**!

**Next Steps:**
1. Deploy to Vercel (add environment variables)
2. Register your apps via admin endpoint
3. Start using the API
4. Share documentation with your developers

**All code is on branch**: `underDev,RLS1.1`

🚀 **Happy Building!**
