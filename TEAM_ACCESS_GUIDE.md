# Team Access Guide: Sharing API Access with App Developers

**Version:** 1.0
**Last Updated:** 2025-11-14
**Audience:** QuakeWise Team Leads, DevOps, Project Managers

---

## Overview

This guide explains how to grant API access to your app development team. It covers:
- ✅ What tokens developers need
- ✅ How to share tokens securely
- ✅ How to grant API documentation access
- ✅ Team member onboarding process

---

## 🔑 Do App Developers Need Tokens?

**YES** - App developers need **service tokens** to authenticate API requests.

### Token Types

There are **two types** of tokens in the QuakeWise system:

1. **Service Tokens** (Platform Tokens)
   - **Who needs them:** App developers, backend engineers
   - **Purpose:** Identify which internal service is making the request
   - **Format:** 256-bit hex string (e.g., `15269f36a8ac09436d74134b8c21ade1...`)
   - **Used in:** `X-Platform-Token` header
   - **Examples:**
     - `SERVICE_TOKEN_WEB_APP` - For web application team
     - `SERVICE_TOKEN_MOBILE` - For mobile app team
     - `SERVICE_TOKEN_DEV` - For testing/development

2. **JWT User Tokens**
   - **Who needs them:** App users (automatically issued by the API)
   - **Purpose:** Identify the end user making the assessment
   - **Format:** JWT (JSON Web Token)
   - **Used in:** `Authorization: Bearer` header
   - **Note:** Developers don't store these - they're issued per-user session

---

## 📋 Step-by-Step: Granting API Access to Developers

### Step 1: Identify Which Service Token They Need

Determine which internal service the developer is working on:

| Team/Project | Service Token | Environment Variable | Rate Limit |
|--------------|---------------|---------------------|------------|
| Web Application Team | `SERVICE_TOKEN_WEB_APP` | Web frontend, Next.js app | 10,000/hour |
| Mobile App Team | `SERVICE_TOKEN_MOBILE` | iOS/Android apps | 10,000/hour |
| Backend/Batch Jobs | `SERVICE_TOKEN_BATCH` | Background processors | 1,000/hour |
| Analytics Team | `SERVICE_TOKEN_ANALYTICS` | Reporting services | 1,000/hour |
| QA/Testing Team | `SERVICE_TOKEN_DEV` | Development environments | 500/hour |

**Most Common:** Web developers need `SERVICE_TOKEN_WEB_APP`

---

### Step 2: Retrieve Token from Team Password Manager

1. Open your team password manager (1Password, LastPass, etc.)
2. Navigate to the vault: **"QuakeWise API Tokens"**
3. Find the entry for the specific service (e.g., "Web App Service Token")
4. Copy the token value

**Security Note:** Never send tokens via email or Slack. Use secure methods:
- ✅ Password manager sharing features
- ✅ Encrypted messaging (Signal, etc.)
- ✅ In-person handoff for critical tokens
- ❌ Email, Slack DMs, or unencrypted channels

---

### Step 3: Share Token Securely with Developer

**Option A: Password Manager Sharing (Recommended)**

1. In 1Password/LastPass, click "Share"
2. Add developer's email address
3. Set expiration if needed
4. Send invitation

**Option B: Secure Environment Variable Setup**

If developer has access to your deployment platform (Vercel, AWS, etc.):

1. Grant them access to the project in Vercel/AWS
2. They can view environment variables directly
3. No token needs to be transmitted

**Option C: Encrypted File Transfer**

1. Create a text file with the token
2. Encrypt with GPG or password-protected zip
3. Share password via separate channel

---

### Step 4: Developer Setup Instructions

Send the developer these instructions:

```markdown
# QuakeWise API Setup for Developers

## 1. Add Token to Your Local Environment

Create a `.env.local` file in your project root:

```bash
# Copy the service token you received
SERVICE_TOKEN_WEB_APP=your_token_here

# Other required env vars (get from team)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
ANTHROPIC_API_KEY=...
CLERK_SECRET_KEY=...
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Test API Connection

Run this test script to verify your token works:

```bash
curl -X POST https://quakewise.com/api/v1/auth/issue-token \
  -H "X-Platform-Token: YOUR_SERVICE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "appId": "quakewise-web-app",
    "tier": "WEB_APP"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

## 4. Access API Documentation

1. Go to: https://quakewise.com/api-docs
2. Sign in with your `@quakewise.com` email (Clerk)
3. Browse interactive API documentation
4. Test endpoints with the built-in API tester
```

---

## 📖 Granting API Documentation Access

### Who Can Access API Docs?

Only team members with `@quakewise.com` emails registered in the whitelist.

### How to Add a New Team Member to API Docs

1. **Edit the Team Email Whitelist**

   Open `config/team-members.js`:

   ```javascript
   export const TEAM_EMAILS = [
     'dev@quakewise.com',
     'engineering@quakewise.com',
     'backend@quakewise.com',
     'frontend@quakewise.com',
     'admin@quakewise.com',
     'cto@quakewise.com',
     'devops@quakewise.com',
     'ops@quakewise.com',
     // Add new team member:
     'newdev@quakewise.com',  // ← Add here
   ];
   ```

2. **Commit and Deploy**

   ```bash
   git add config/team-members.js
   git commit -m "Add newdev@quakewise.com to API docs whitelist"
   git push origin main
   ```

3. **Verify Deployment**

   - Vercel will auto-deploy the change
   - Wait 1-2 minutes for deployment to complete
   - New team member can now access https://quakewise.com/api-docs

4. **Notify Team Member**

   Send them this message:

   ```markdown
   Hi [Name],

   You now have access to QuakeWise Internal API documentation.

   **Access:**
   1. Go to: https://quakewise.com/api-docs
   2. Sign in with Clerk using your @quakewise.com email
   3. Browse the interactive API reference

   **Your Service Token:**
   Check the team password manager under "QuakeWise API Tokens"
   for SERVICE_TOKEN_WEB_APP (or whichever service you're working on).

   **Need help?** Check out the QUICK_START.md and API_README.md in the repo.
   ```

---

## 🚀 Quick Onboarding Checklist for New Developers

Use this checklist when onboarding a new developer:

- [ ] **Add email to team whitelist** (`config/team-members.js`)
- [ ] **Share service token** via password manager
- [ ] **Grant Clerk access** (invite to Clerk organization)
- [ ] **Grant repository access** (GitHub/GitLab)
- [ ] **Grant Vercel access** (optional - for viewing env vars)
- [ ] **Send setup instructions** (from Step 4 above)
- [ ] **Schedule 15-min API walkthrough** (optional but recommended)

---

## 🔒 Security Best Practices

### Token Management

1. **Never commit tokens to git**
   - Use `.env.local` (already in `.gitignore`)
   - Check with `git status` before committing

2. **Rotate tokens if compromised**
   - Run `npm run generate:service-tokens` to generate new tokens
   - Update Vercel environment variables
   - Re-seed database with new hashes
   - Notify all team members

3. **Use appropriate tokens per environment**
   - Development: `SERVICE_TOKEN_DEV` (500/hour limit)
   - Production: `SERVICE_TOKEN_WEB_APP` (10,000/hour limit)

4. **Monitor token usage**
   - Check Prisma Studio for API usage stats
   - Watch for unusual rate limit hits
   - Review `lastUsedAt` timestamps

### Email Whitelist Management

1. **Only use company emails**
   - All team members must have `@quakewise.com` emails
   - No personal emails (gmail, yahoo, etc.)

2. **Remove departing team members**
   - Update `config/team-members.js` immediately
   - Deploy changes to production
   - Rotate any tokens they had access to

3. **Admin access is restricted**
   - Only CTO, DevOps, and Admin roles in `ADMIN_EMAILS`
   - Regular developers in `TEAM_EMAILS` only

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Developer says token doesn't work"

**Solutions:**
1. Verify they're using the correct environment variable name
2. Check for trailing spaces in the token
3. Verify token is in Vercel environment variables (production)
4. Test token with `curl` command from Step 4

**Issue:** "Developer can't access API docs"

**Solutions:**
1. Verify their email is in `config/team-members.js`
2. Check if deployment completed successfully
3. Ask them to sign out and sign in again with Clerk
4. Verify they're using their `@quakewise.com` email (not personal)

**Issue:** "Rate limit errors in development"

**Solutions:**
1. Switch to `SERVICE_TOKEN_DEV` for testing
2. Check usage in Prisma Studio
3. Reset rate limits by deleting records in `ApiRateLimit` table

---

## 📊 Tracking API Usage by Developer/Team

To monitor which teams are using the API most:

1. **Open Prisma Studio**
   ```bash
   npm run db:studio
   ```

2. **View Service Usage**
   - Open `ApiApp` table
   - Check `lastUsedAt` column for activity
   - Sort by `rateLimitPerHour` to see active services

3. **View Rate Limit Records**
   - Open `ApiRateLimit` table
   - Filter by `appId` to see specific service usage
   - Check `requestCount` for usage stats

---

## 📚 Additional Resources

- **Full API Documentation:** [API_README.md](./API_README.md)
- **Quick Start Guide:** [QUICK_START.md](./QUICK_START.md)
- **Internal API Transformation:** [INTERNAL_API_TRANSFORMATION.md](./INTERNAL_API_TRANSFORMATION.md)
- **Live API Docs:** https://quakewise.com/api-docs
- **Team Slack:** #api-support channel

---

## Summary

**To grant API access to a developer:**

1. ✅ Add their `@quakewise.com` email to `config/team-members.js`
2. ✅ Share the appropriate service token from password manager
3. ✅ Send them setup instructions (Step 4)
4. ✅ Deploy changes to production
5. ✅ Verify they can access https://quakewise.com/api-docs

**Tokens they need:** Service token only (JWT tokens are auto-issued by API)

**Security:** Use password manager sharing, never send via email/Slack

---

**Questions?** Contact DevOps team or post in #api-support
