# QuakeWise External API - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get your QuakeWise External API up and running quickly.

---

## Prerequisites

- Node.js >= 22.11.0
- npm or yarn
- Your existing QuakeWise environment variables (ANTHROPIC_API_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

---

## Step 1: Install Dependencies (2 minutes)

```bash
# Install required packages
npm install

# This will install:
# - jose (JWT token handling)
# - better-sqlite3 (database)
# - swagger-ui-react (API documentation)
# - zod (already installed - validation)
```

---

## Step 2: Configure Environment (1 minute)

```bash
# Generate secure tokens
node -e "console.log('API_PLATFORM_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Copy the example file
cp .env.local.example .env.local

# Add the generated tokens to .env.local
# Make sure your existing API keys are also in .env.local:
# - ANTHROPIC_API_KEY
# - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# - CLERK_SECRET_KEY (if using Clerk)
```

---

## Step 3: Register Your First App (1 minute)

```bash
# Run the registration script
npm run api:register

# Follow the prompts:
# - Enter App ID: my-first-app
# - Enter App Name: My First App
# - Enter Tier: pro

# ⚠️ SAVE THE PLATFORM TOKEN - you won't see it again!
```

---

## Step 4: Start the Server (30 seconds)

```bash
# Start development server
npm run dev

# Server will start on http://localhost:3000
```

---

## Step 5: View Documentation (30 seconds)

Open your browser and visit:

```
http://localhost:3000/api-docs
```

You'll see:
- ✅ Interactive API documentation (Swagger UI)
- ✅ Built-in API tester
- ✅ Code examples
- ✅ Complete endpoint reference

---

## Test Your API

### Option 1: Use the Built-in Tester

1. Go to http://localhost:3000/api-docs
2. Click on the "API Tester" tab
3. Enter your platform token
4. Click "Send Request" on any endpoint

### Option 2: Use the CLI Test Script

```bash
# Test all endpoints
npm run api:test <your-platform-token>

# Example:
npm run api:test a1b2c3d4e5f6g7h8i9j0...
```

### Option 3: Use curl

```bash
# 1. Health check (no auth)
curl http://localhost:3000/api/v1/status

# 2. Get valid parameters (no auth)
curl http://localhost:3000/api/v1/parameters

# 3. Issue JWT token (requires platform token)
curl -X POST http://localhost:3000/api/v1/auth/issue-token \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","appId":"my-first-app","tier":"pro"}'

# Save the JWT token from response

# 4. Perform assessment (requires both tokens)
curl -X POST http://localhost:3000/api/v1/assessment/complete \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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

**Solution:** Make sure you added the JWT_SECRET to your .env.local file

```bash
# Generate a new one
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: "Module 'jose' not found"

**Solution:** Install dependencies

```bash
npm install
```

### Issue: "Database error"

**Solution:** The database will be created automatically. Make sure the `data/` directory is writable:

```bash
mkdir -p data
```

### Issue: "Platform token invalid"

**Solution:** Double-check you're using the correct token from the registration step. If you lost it, register a new app.

---

## Next Steps

### 1. Read the Full Documentation

- **API_README.md** - Complete API documentation
- **API_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **/api-docs** - Interactive documentation

### 2. Integrate with Your App

Example JavaScript integration:

```javascript
const QuakeWiseAPI = {
  baseUrl: 'http://localhost:3000/api/v1',
  platformToken: 'your_platform_token',

  async getUserToken(userId) {
    const res = await fetch(`${this.baseUrl}/auth/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Token': this.platformToken
      },
      body: JSON.stringify({
        userId,
        appId: 'my-app',
        tier: 'pro'
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
        'X-Platform-Token': this.platformToken,
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(buildingData)
    });
    return await res.json();
  }
};

// Usage
const token = await QuakeWiseAPI.getUserToken('user_123');
const assessment = await QuakeWiseAPI.assessBuilding(token, {
  location: { latitude: 41.0082, longitude: 28.9784 },
  building: {
    structuralSystem: 'C2',
    numberOfStories: 5,
    yearOfConstruction: 2010,
    designRegulation: '2007-2018'
  }
});
console.log('Safety Score:', assessment.data.safetyScore.overall);
```

### 3. Monitor Usage

View usage statistics:

```bash
curl http://localhost:3000/api/v1/usage/my-first-app \
  -H "X-Platform-Token: YOUR_PLATFORM_TOKEN"
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
# Register new app
npm run api:register

# Test API
npm run api:test <platform-token>

# View API docs (in message)
npm run api:docs

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
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

### Rate Limits

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Pro | 1,000 | 10,000 |
| Enterprise | 10,000 | 100,000 |

---

## Support

- **Documentation**: http://localhost:3000/api-docs
- **Issues**: File an issue in the repository
- **Full Guide**: See API_README.md

---

## Success Checklist

- ✅ Dependencies installed (`npm install`)
- ✅ Environment configured (`.env.local` with tokens)
- ✅ First app registered (`npm run api:register`)
- ✅ Server running (`npm run dev`)
- ✅ Docs accessible (http://localhost:3000/api-docs)
- ✅ API tested (tester or `npm run api:test`)

**You're ready to build! 🎉**
