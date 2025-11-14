# QuakeWise User Flow: How App Users Work

**Version:** 1.0
**Last Updated:** 2025-11-14
**Purpose:** Explain the complete user authentication and assessment flow

---

## 🎯 Quick Summary

**The Two-Token System:**

1. **Service Token** (Platform Token)
   - Identifies which QuakeWise service is making the request (web app, mobile app, etc.)
   - Set once by developers in environment variables
   - Used in every API call via `X-Platform-Token` header
   - Never exposed to end users

2. **JWT User Token**
   - Identifies the specific end user (e.g., John Doe using the app)
   - Issued by the API for each user session
   - Used in assessment requests via `Authorization: Bearer` header
   - Short-lived (24 hours)

**Why Two Tokens?**
- Service Token = "This request is from the official QuakeWise web app"
- User Token = "This specific user (John Doe) is making this assessment"

---

## 📊 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         END USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Signs In
┌──────────────┐
│  End User    │
│  (Browser)   │
└──────┬───────┘
       │ 1. Visits quakewise.com
       │ 2. Clicks "Sign In"
       ▼
┌──────────────┐
│    Clerk     │ ← Handles authentication
│  Auth System │    (Google, Email, etc.)
└──────┬───────┘
       │ 3. Returns Clerk User ID
       │    (e.g., "clerk_user_2abc123")
       ▼
┌──────────────┐
│  QuakeWise   │
│  Web App     │ ← User is now signed in
│  (Next.js)   │    Session stored in browser
└──────────────┘


Step 2: User Starts Assessment
┌──────────────┐
│  End User    │
│  (Browser)   │
└──────┬───────┘
       │ 1. Clicks "Start Assessment"
       │ 2. Enters location, takes photos, etc.
       │ 3. Reaches final step: "Calculate Safety Score"
       ▼
┌──────────────┐
│  QuakeWise   │
│  Web App     │ ← Prepares to call Internal API
│  (Next.js)   │
└──────┬───────┘
       │ 4. Web app needs to authenticate with API
       │    Problem: User is logged in to Clerk,
       │             but API requires its own JWT token
       │
       │ 5. Web app makes authentication request:
       │
       │    POST /api/v1/auth/issue-token
       │    Headers:
       │      X-Platform-Token: SERVICE_TOKEN_WEB_APP
       │    Body:
       │      {
       │        "userId": "clerk_user_2abc123",
       │        "appId": "quakewise-web-app",
       │        "tier": "WEB_APP"
       │      }
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    QuakeWise Internal API                         │
│                    (Next.js API Routes)                          │
└──────┬───────────────────────────────────────────────────────────┘
       │ 6. API validates service token:
       │    - Hashes SERVICE_TOKEN_WEB_APP
       │    - Looks up in database (ApiApp table)
       │    - Finds: "quakewise-web-app" service
       │    - Checks: status = ACTIVE ✓
       │    - Checks: tier = WEB_APP ✓
       │
       │ 7. API issues JWT token for user:
       │    - Creates JWT with userId = "clerk_user_2abc123"
       │    - Signs with JWT_SECRET
       │    - Sets expiration = 24 hours
       │
       │ 8. Returns JWT token to web app:
       │    {
       │      "success": true,
       │      "data": {
       │        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       │        "expiresIn": "24h"
       │      }
       │    }
       ▼
┌──────────────┐
│  QuakeWise   │
│  Web App     │ ← Receives JWT token
│  (Next.js)   │    Stores in React state/context
└──────┬───────┘
       │ 9. Now has BOTH tokens:
       │    - Service Token: SERVICE_TOKEN_WEB_APP (from env)
       │    - User Token: JWT (from API response)
       │
       │ 10. Makes assessment request:
       │
       │     POST /api/v1/assessment/complete
       │     Headers:
       │       X-Platform-Token: SERVICE_TOKEN_WEB_APP
       │       Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       │     Body:
       │       {
       │         "location": { "latitude": 41.0082, "longitude": 28.9784 },
       │         "building": {
       │           "structuralSystem": "C2",
       │           "numberOfStories": 5,
       │           "yearOfConstruction": 2010,
       │           "designRegulation": "2007-2018"
       │         }
       │       }
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    QuakeWise Internal API                         │
│                    Dual Authentication Process                    │
└──────┬───────────────────────────────────────────────────────────┘
       │ 11. Platform Authentication Middleware:
       │     - Validates X-Platform-Token
       │     - Looks up service in database
       │     - Confirms: quakewise-web-app is ACTIVE ✓
       │     - Attaches service info to request
       │
       │ 12. JWT Authentication Middleware:
       │     - Validates Authorization header
       │     - Verifies JWT signature with JWT_SECRET
       │     - Checks expiration (not expired) ✓
       │     - Extracts userId: "clerk_user_2abc123"
       │     - Attaches user info to request
       │
       │ 13. Rate Limiting Middleware:
       │     - Uses service ID: quakewise-web-app
       │     - Checks hourly limit: 10,000/hour (WEB_APP tier)
       │     - Current count: 247 requests this hour
       │     - Allows request ✓
       │     - Increments counter
       │
       │ 14. Assessment Handler:
       │     - Performs safety calculations
       │     - Queries earthquake data
       │     - Analyzes building vulnerability
       │     - Generates safety score
       │
       │ 15. Usage Tracking:
       │     - Records API usage in database
       │     - Logs: userId, appId, endpoint, timestamp
       │
       │ 16. Returns assessment result:
       │     {
       │       "success": true,
       │       "data": {
       │         "safetyScore": {
       │           "overall": 72,
       │           "structural": 78,
       │           "seismic": 68,
       │           "environmental": 75
       │         },
       │         "riskLevel": "MODERATE",
       │         "recommendations": [...]
       │       }
       │     }
       ▼
┌──────────────┐
│  QuakeWise   │
│  Web App     │ ← Receives assessment results
│  (Next.js)   │    Displays to user
└──────┬───────┘
       │ 17. Renders results page:
       │     - Safety score visualization
       │     - Risk level indicators
       │     - Recommendations
       │     - Downloadable report
       ▼
┌──────────────┐
│  End User    │
│  (Browser)   │ ← Views safety assessment
└──────────────┘
    Sees: "Your building has a safety score of 72/100"
```

---

## 🔐 Authentication Flow in Detail

### Phase 1: User Signs In (Clerk)

```javascript
// In Next.js Web App

// User clicks "Sign In"
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <SignIn />;
}

// After successful sign-in, Clerk provides:
const { user } = useUser();
console.log(user.id); // "clerk_user_2abc123"

// This Clerk session is stored in browser cookies
// The web app knows who the user is
// BUT: The Internal API does NOT accept Clerk tokens directly
```

**Why doesn't the API accept Clerk tokens?**
- Clerk tokens are for the Next.js app
- Internal API uses its own JWT system for service-to-service auth
- This allows API to be used by mobile app, batch jobs, analytics, etc.

---

### Phase 2: Web App Requests User Token from API

```javascript
// In Next.js Web App (when user starts assessment)

import { useUser } from '@clerk/nextjs';

async function startAssessment() {
  const { user } = useUser();

  // Step 1: Get API JWT token for this user
  const response = await fetch('/api/v1/auth/issue-token', {
    method: 'POST',
    headers: {
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP, // From .env
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: user.id,          // Clerk user ID
      appId: 'quakewise-web-app',
      tier: 'WEB_APP'
    })
  });

  const { data } = await response.json();
  const apiToken = data.token; // JWT for API requests

  // Step 2: Store token for subsequent API calls
  setUserApiToken(apiToken); // React state or context
}
```

**What happens in the API:**

```javascript
// In /app/api/v1/auth/issue-token/route.js

import { validateServiceToken } from '@/lib/auth/platformAuth';
import { issueToken } from '@/lib/auth/jwtAuth';

export async function POST(request) {
  // 1. Validate service token
  const platformToken = request.headers.get('X-Platform-Token');
  const auth = await validateServiceToken(platformToken);

  if (!auth.valid) {
    return Response.json({ error: 'Invalid service token' }, { status: 401 });
  }

  // 2. Extract user info from request
  const { userId, appId, tier } = await request.json();

  // 3. Issue JWT token for this user
  const jwtToken = issueToken({
    userId,    // clerk_user_2abc123
    appId,     // quakewise-web-app
    tier,      // WEB_APP
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  // 4. Return JWT to web app
  return Response.json({
    success: true,
    data: {
      token: jwtToken,
      expiresIn: '24h'
    }
  });
}
```

---

### Phase 3: Web App Makes Assessment Request with Both Tokens

```javascript
// In Next.js Web App

async function submitAssessment(buildingData) {
  const response = await fetch('/api/v1/assessment/complete', {
    method: 'POST',
    headers: {
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP, // Service token
      'Authorization': `Bearer ${userApiToken}`,              // User JWT token
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location: { latitude: 41.0082, longitude: 28.9784 },
      building: {
        structuralSystem: 'C2',
        numberOfStories: 5,
        yearOfConstruction: 2010,
        designRegulation: '2007-2018'
      }
    })
  });

  const result = await response.json();
  return result.data.safetyScore;
}
```

**What happens in the API:**

```javascript
// In /app/api/v1/assessment/complete/route.js

import { withPlatformAuth } from '@/middleware/platformAuthMiddleware';
import { withJwtAuth } from '@/middleware/jwtAuthMiddleware';
import { withRateLimit } from '@/middleware/rateLimitMiddleware';

export const POST = withPlatformAuth(
  withJwtAuth(
    withRateLimit(async (request) => {
      // At this point:
      // - request.service = { id: 'quakewise-web-app', tier: 'WEB_APP', ... }
      // - request.user = { userId: 'clerk_user_2abc123', appId: 'quakewise-web-app', ... }

      // Perform assessment calculations
      const { location, building } = await request.json();
      const safetyScore = calculateSafetyScore(location, building);

      // Track usage
      await trackApiUsage({
        userId: request.user.userId,
        appId: request.service.id,
        endpoint: '/api/v1/assessment/complete'
      });

      // Return results
      return Response.json({
        success: true,
        data: { safetyScore }
      });
    })
  )
);
```

---

## 🔄 Token Lifecycle

### Service Token (Platform Token)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Token Lifecycle                      │
└─────────────────────────────────────────────────────────────────┘

1. GENERATION (Once, by DevOps)
   │
   ├─ Run: npm run generate:service-tokens
   ├─ Output: .env.service-tokens.txt
   ├─ Token: 15269f36a8ac09436d74134b8c21ade12436d03225e197e36e8a4d5e55207a93
   │
2. STORAGE (Multiple Locations)
   │
   ├─ Team Password Manager (1Password/Vault)
   │  └─ Entry: "SERVICE_TOKEN_WEB_APP"
   │
   ├─ Developer Local Environment
   │  └─ File: .env.local
   │     SERVICE_TOKEN_WEB_APP=15269f36a8ac09436d74134b8c21ade1...
   │
   ├─ Vercel Production Environment
   │  └─ Dashboard → Environment Variables
   │     SERVICE_TOKEN_WEB_APP = 15269f36a8ac09436d74134b8c21ade1...
   │
   └─ Database (Hashed)
      └─ ApiApp table
         platformTokenHash: a7f3d8e9... (SHA-256 hash of token)
   │
3. USAGE (Every API Request)
   │
   ├─ Web app reads from process.env.SERVICE_TOKEN_WEB_APP
   ├─ Includes in request header: X-Platform-Token
   ├─ API hashes token and looks up in database
   └─ Returns service info if valid
   │
4. ROTATION (If Compromised)
   │
   ├─ Generate new token
   ├─ Update Vercel environment variables
   ├─ Re-seed database with new hash
   └─ Notify all developers
```

**Lifespan:** Permanent (until rotated)
**Scope:** Per service (web app, mobile app, etc.)
**Visibility:** Developers have access, end users never see it

---

### JWT User Token

```
┌─────────────────────────────────────────────────────────────────┐
│                      User JWT Token Lifecycle                    │
└─────────────────────────────────────────────────────────────────┘

1. ISSUANCE (Per User Session)
   │
   ├─ User signs in to QuakeWise web app (via Clerk)
   ├─ Web app calls /api/v1/auth/issue-token
   ├─ API creates JWT:
   │  {
   │    "userId": "clerk_user_2abc123",
   │    "appId": "quakewise-web-app",
   │    "tier": "WEB_APP",
   │    "iat": 1699900800,  // Issued at
   │    "exp": 1699987200   // Expires in 24h
   │  }
   └─ Signed with JWT_SECRET
   │
2. STORAGE (Browser Only)
   │
   ├─ Stored in React state/context
   ├─ OR localStorage (if persist across page refreshes)
   └─ Never sent to backend except in Authorization header
   │
3. USAGE (For Assessment Requests)
   │
   ├─ Included in header: Authorization: Bearer eyJhbGci...
   ├─ API verifies signature
   ├─ API checks expiration
   └─ API extracts userId for usage tracking
   │
4. EXPIRATION (After 24 Hours)
   │
   ├─ Token becomes invalid
   ├─ API returns 401 Unauthorized
   ├─ Web app detects expiration
   └─ Automatically requests new token
```

**Lifespan:** 24 hours
**Scope:** Per user session
**Visibility:** Web app has access, stored in browser, never exposed to user

---

## 🏗️ Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐              ┌──────────────────┐              │
│  │   Web Browser    │              │   Mobile App     │              │
│  │   (Next.js)      │              │   (React Native) │              │
│  └────────┬─────────┘              └────────┬─────────┘              │
│           │                                  │                         │
│           │ Clerk Authentication             │ Clerk Authentication    │
│           ▼                                  ▼                         │
│  ┌──────────────────┐              ┌──────────────────┐              │
│  │  Clerk Session   │              │  Clerk Session   │              │
│  │  clerk_user_123  │              │  clerk_user_456  │              │
│  └────────┬─────────┘              └────────┬─────────┘              │
│           │                                  │                         │
│           │ Has SERVICE_TOKEN_WEB_APP        │ Has SERVICE_TOKEN_MOBILE│
│           │ (from .env.local)                │ (from .env)            │
│           │                                  │                         │
└───────────┼──────────────────────────────────┼─────────────────────────┘
            │                                  │
            │ 1. Request JWT token             │ 1. Request JWT token
            │ POST /api/v1/auth/issue-token    │ POST /api/v1/auth/issue-token
            │ X-Platform-Token: SERVICE_TOKEN  │ X-Platform-Token: SERVICE_TOKEN
            ▼                                  ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION LAYER                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                  ┌─────────────────────────────┐                      │
│                  │  Platform Auth Middleware    │                      │
│                  │  Validates SERVICE_TOKEN     │                      │
│                  │  Returns service info        │                      │
│                  └─────────────┬───────────────┘                      │
│                                │                                       │
│                                ▼                                       │
│                  ┌─────────────────────────────┐                      │
│                  │   JWT Token Issuer          │                      │
│                  │   Creates user JWT          │                      │
│                  │   Signs with JWT_SECRET     │                      │
│                  └─────────────┬───────────────┘                      │
│                                │                                       │
│                                │ 2. Returns JWT token                 │
│                                │ { token: "eyJhbGci...", ...}         │
│                                ▼                                       │
└───────────────────────────────────────────────────────────────────────┘
            ▲                                  ▲
            │ 3. Make assessment request       │ 3. Make assessment request
            │ POST /api/v1/assessment/complete │ POST /api/v1/assessment/complete
            │ X-Platform-Token: SERVICE_TOKEN  │ X-Platform-Token: SERVICE_TOKEN
            │ Authorization: Bearer <JWT>      │ Authorization: Bearer <JWT>
            ▼                                  ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        API MIDDLEWARE STACK                            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. ┌──────────────────────────────────────────────────────────┐     │
│     │  Platform Authentication (withPlatformAuth)               │     │
│     │  - Validates X-Platform-Token                            │     │
│     │  - Looks up service in database                          │     │
│     │  - Attaches request.service = { id, name, tier, ... }    │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                ▼                                       │
│  2. ┌──────────────────────────────────────────────────────────┐     │
│     │  JWT Authentication (withJwtAuth)                         │     │
│     │  - Validates Authorization: Bearer header                │     │
│     │  - Verifies JWT signature                                │     │
│     │  - Checks expiration                                     │     │
│     │  - Attaches request.user = { userId, appId, ... }        │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                ▼                                       │
│  3. ┌──────────────────────────────────────────────────────────┐     │
│     │  Rate Limiting (withRateLimit)                           │     │
│     │  - Uses service.id and service.tier                      │     │
│     │  - Checks hourly/daily limits                            │     │
│     │  - Increments counter                                    │     │
│     │  - Blocks if limit exceeded                              │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                ▼                                       │
│  4. ┌──────────────────────────────────────────────────────────┐     │
│     │  Request Handler                                          │     │
│     │  - Performs business logic                               │     │
│     │  - Calculates safety score                               │     │
│     │  - Returns results                                       │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                ▼                                       │
│  5. ┌──────────────────────────────────────────────────────────┐     │
│     │  Usage Tracking                                           │     │
│     │  - Records API call in database                          │     │
│     │  - Logs: userId, appId, endpoint, timestamp              │     │
│     └──────────────────────────────────────────────────────────┘     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                    │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Neon PostgreSQL Database (via Prisma)                      │     │
│  │                                                              │     │
│  │  Tables:                                                     │     │
│  │  - ApiApp (services: quakewise-web-app, quakewise-mobile...)│     │
│  │  - ApiRateLimit (rate limit counters)                       │     │
│  │  - ApiUsage (usage tracking logs)                           │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Concepts

### 1. Dual Authentication

**Why two tokens?**

| Token Type | Purpose | Who Issues | Who Uses | Lifespan |
|-----------|---------|-----------|----------|----------|
| Service Token | Identify service making request | DevOps (npm run generate:service-tokens) | Developers (in code) | Permanent |
| JWT User Token | Identify end user making request | API (/api/v1/auth/issue-token) | Web/mobile app (per session) | 24 hours |

**Analogy:**
- Service Token = "Building access key card" (identifies which department/service)
- JWT User Token = "Employee badge" (identifies specific person)

Both are required to enter the building (make API requests).

---

### 2. Service Tiers and Rate Limiting

**How rate limits work:**

1. **Service registers with tier** (during database seeding)
   - quakewise-web-app → WEB_APP tier → 10,000/hour
   - quakewise-mobile-api → WEB_APP tier → 10,000/hour
   - batch-assessment-processor → BATCH_JOB tier → 1,000/hour

2. **API checks rate limit on each request**
   ```javascript
   // In rate limit middleware
   const service = request.service; // { id: 'quakewise-web-app', tier: 'WEB_APP', rateLimitPerHour: 10000 }
   const currentCount = await getRateLimitCount(service.id, 'hour');

   if (currentCount >= service.rateLimitPerHour) {
     return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
   }

   await incrementRateLimitCount(service.id);
   ```

3. **Rate limits are per service, not per user**
   - All users of the web app share the same 10,000/hour limit
   - If 1,000 users each make 10 requests, that's 10,000 requests total
   - This is intentional: rate limits protect the API infrastructure

---

### 3. Usage Tracking

**What gets tracked:**

```javascript
// After successful API call
await prisma.apiUsage.create({
  data: {
    userId: 'clerk_user_2abc123',     // From JWT token
    appId: 'quakewise-web-app',        // From service info
    endpoint: '/api/v1/assessment/complete',
    method: 'POST',
    statusCode: 200,
    responseTime: 342,                 // milliseconds
    timestamp: new Date()
  }
});
```

**What this enables:**
- Monitor which services are using the API most
- Identify slow endpoints
- Track per-user usage patterns
- Generate analytics and reports

---

## 🚀 Complete Example: User Assessment Journey

Let's follow a real user through the entire flow:

### User: Sarah Johnson
**Email:** sarah@gmail.com
**Using:** QuakeWise web app (quakewise.com)
**Action:** Assessing her apartment building in Istanbul

---

**Step 1: Sarah visits quakewise.com**

```javascript
// Next.js automatically checks Clerk session
const { isSignedIn } = useAuth();

if (!isSignedIn) {
  // Redirect to /sign-in
}
```

**Step 2: Sarah signs in with Google**

```javascript
// Clerk handles Google OAuth
// Returns: user.id = "clerk_user_sarah_johnson_123"

// Next.js stores Clerk session in cookies
// Sarah is now authenticated in the web app
```

**Step 3: Sarah starts assessment**

```javascript
// She enters location, takes photos, fills forms
// Reaches final step: "Calculate Safety Score"

// Button click triggers:
async function calculateSafety() {
  // First, get API token for Sarah
  const apiToken = await getApiTokenForUser(user.id);

  // Then, submit assessment
  const results = await submitAssessment(buildingData, apiToken);

  // Display results
  showResults(results);
}
```

**Step 4: Web app gets API token for Sarah**

```javascript
async function getApiTokenForUser(clerkUserId) {
  const response = await fetch('/api/v1/auth/issue-token', {
    method: 'POST',
    headers: {
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: clerkUserId,           // "clerk_user_sarah_johnson_123"
      appId: 'quakewise-web-app',
      tier: 'WEB_APP'
    })
  });

  const { data } = await response.json();
  return data.token; // JWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 5: API validates service token and issues JWT**

```javascript
// In /api/v1/auth/issue-token

// 1. Validate SERVICE_TOKEN_WEB_APP
const tokenHash = crypto.createHash('sha256')
  .update(platformToken)
  .digest('hex');

const service = await prisma.apiApp.findUnique({
  where: { platformTokenHash: tokenHash }
});
// Found: { id: 'quakewise-web-app', tier: 'WEB_APP', status: 'ACTIVE' }

// 2. Create JWT for Sarah
const jwt = jsonwebtoken.sign(
  {
    userId: 'clerk_user_sarah_johnson_123',
    appId: 'quakewise-web-app',
    tier: 'WEB_APP'
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// 3. Return JWT to web app
return { token: jwt, expiresIn: '24h' };
```

**Step 6: Web app submits assessment with both tokens**

```javascript
async function submitAssessment(buildingData, userToken) {
  const response = await fetch('/api/v1/assessment/complete', {
    method: 'POST',
    headers: {
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP, // Service token
      'Authorization': `Bearer ${userToken}`,                // Sarah's JWT
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location: { latitude: 41.0082, longitude: 28.9784 },
      building: {
        structuralSystem: 'C2',
        numberOfStories: 8,
        yearOfConstruction: 1995,
        designRegulation: '1975-1997'
      }
    })
  });

  return await response.json();
}
```

**Step 7: API processes request through middleware stack**

```javascript
// Middleware 1: Platform Auth
const platformToken = request.headers.get('X-Platform-Token');
const serviceAuth = await validateServiceToken(platformToken);
// Result: request.service = { id: 'quakewise-web-app', tier: 'WEB_APP', ... }

// Middleware 2: JWT Auth
const authHeader = request.headers.get('Authorization');
const jwtToken = authHeader.replace('Bearer ', '');
const decoded = jsonwebtoken.verify(jwtToken, process.env.JWT_SECRET);
// Result: request.user = { userId: 'clerk_user_sarah_johnson_123', ... }

// Middleware 3: Rate Limit
const count = await getRateLimitCount('quakewise-web-app', 'hour');
// Current: 3,247 / 10,000 limit
// Allowed ✓
await incrementRateLimitCount('quakewise-web-app');

// Handler: Calculate safety score
const safetyScore = calculateSafetyScore(location, building);
// Result: { overall: 58, structural: 62, seismic: 54, environmental: 60 }

// Track usage
await trackApiUsage({
  userId: 'clerk_user_sarah_johnson_123',
  appId: 'quakewise-web-app',
  endpoint: '/api/v1/assessment/complete',
  responseTime: 412
});

// Return results
return Response.json({
  success: true,
  data: {
    safetyScore: { overall: 58, structural: 62, seismic: 54, environmental: 60 },
    riskLevel: 'HIGH',
    recommendations: [...]
  }
});
```

**Step 8: Sarah sees her results**

```javascript
// Web app receives API response
// Renders results page with:
// - Safety score: 58/100
// - Risk level: HIGH
// - Recommendations to strengthen building
// - Option to download PDF report
```

---

## 📊 Summary Table

| Aspect | Details |
|--------|---------|
| **User Authentication** | Clerk (Google, Email, etc.) → Clerk User ID |
| **API Authentication** | Dual token system (Service + JWT) |
| **Service Token** | Identifies which QuakeWise service (web/mobile/batch) |
| **JWT User Token** | Identifies specific end user within that service |
| **Token Issuance** | API issues JWT when web app provides Clerk User ID |
| **Token Lifespan** | Service: Permanent, JWT: 24 hours |
| **Rate Limiting** | Per service tier (10k/hr for web app) |
| **Usage Tracking** | Records userId, appId, endpoint, timestamp |
| **Security** | Service tokens hashed in DB, JWTs signed with secret |

---

## 🔗 Related Documents

- **Team Access Guide:** [TEAM_ACCESS_GUIDE.md](./TEAM_ACCESS_GUIDE.md)
- **Vercel Deployment:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **API Documentation:** [API_README.md](./API_README.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)

---

**Questions?** Contact DevOps team or post in #api-support
