# Auth.js v5 & Better Auth Migration Guide for QuakeWise

## BREAKING NEWS: Auth.js Joins Better Auth (November 2025)

**Auth.js (formerly NextAuth.js) is now maintained by the Better Auth team.**

- Auth.js remains supported for security patches and critical issues
- **New projects should start with Better Auth** (official recommendation)
- Better Auth is the clear successor to Auth.js
- Better Auth raised $5M in funding (some community concern about commercialization)

## Overview

This document evaluates migration from Clerk to either Auth.js v5 or Better Auth.

**Current Setup:** Clerk (`@clerk/nextjs: ^6.18.0`)
**Recommended Target:** Better Auth (for new implementations)
**Alternative Target:** Auth.js v5 (next-auth@beta) - still maintained

---

## Auth.js v5 Status (November 2025)

| Aspect | Status |
|--------|--------|
| Official Label | Still "beta" |
| Production Usage | Widely used in production |
| Critical Issues | No known blocking issues |
| Stable Release | No confirmed date |

**Verdict:** Functionally production-ready, but still labeled beta. Use with caution for critical applications.

---

## Key Features of Auth.js v5

### 1. Universal `auth()` Function

Replaces multiple v4 methods with a single function:

| Old Method | New Method |
|------------|------------|
| `getServerSession()` | `auth()` |
| `getSession()` | `auth()` |
| `withAuth()` | `auth()` |
| `getToken()` | `auth()` |
| `useSession()` | `useSession()` (client) |

### 2. App Router First Design

- Designed for Next.js App Router
- Server Components as first-class citizens
- Pages Router still supported

### 3. Edge Runtime Compatibility

- Built on Web APIs
- Works with Vercel Edge Functions
- Cloudflare Workers compatible
- May require split config for database adapters

### 4. Simplified Configuration

Root-level `auth.ts` replaces API route config:

```typescript
// auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
})
```

### 5. Environment Variable Auto-Detection

Variables prefixed with `AUTH_` are auto-detected:
- `AUTH_GITHUB_ID` → GitHub clientId
- `AUTH_GITHUB_SECRET` → GitHub clientSecret
- `AUTH_SECRET` → Required secret

---

## Breaking Changes from v4

### 1. Import Changes

| Old Import | New Import |
|------------|------------|
| `next-auth/next` | N/A (use `auth()`) |
| `next-auth/middleware` | N/A (use exported `auth`) |
| `@next-auth/prisma-adapter` | `@auth/prisma-adapter` |

### 2. Cookie Prefix Change

- **Old:** `next-auth.session-token`
- **New:** `authjs.session-token`

**Warning:** This will log out all existing users unless migration strategy is applied.

### 3. Minimum Requirements

- Next.js 14.0+ required
- OAuth 1.0 support deprecated

### 4. Configuration File

- `NextAuthOptions` → `NextAuthConfig`
- Config moved from API routes to root `auth.ts`

---

## Installation

```bash
# Install Auth.js v5 (beta)
npm install next-auth@beta

# For Prisma adapter
npm install @auth/prisma-adapter
```

---

## Basic Setup for Next.js 15

### 1. Create `auth.ts`

```typescript
// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
```

### 2. Create API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### 3. Create Middleware

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/assessment/:path*",
    "/dashboard/:path*",
    "/result/:path*",
  ],
}
```

### 4. Server Component Usage

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return <div>Welcome {session.user?.name}</div>
}
```

### 5. Client Component Usage

```typescript
"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>

  if (session) {
    return (
      <button onClick={() => signOut()}>
        Sign out {session.user?.name}
      </button>
    )
  }

  return <button onClick={() => signIn()}>Sign in</button>
}
```

---

## Prisma Schema for Auth.js

Auth.js requires specific tables:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  accounts      Account[]
  sessions      Session[]

  // Add your custom fields
  assessments   Assessment[]

  @@map("users")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String  @map("user_id")
  type               String
  provider           String
  providerAccountId  String  @map("provider_account_id")
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## Comparison: Clerk vs Auth.js v5

| Feature | Clerk | Auth.js v5 |
|---------|-------|------------|
| **Pricing** | Free tier + paid | Free (open source) |
| **Hosting** | Managed service | Self-hosted |
| **Setup Complexity** | Very low | Medium |
| **UI Components** | Built-in (SignIn, UserButton) | Need custom UI |
| **User Management** | Dashboard included | Build yourself |
| **Email/SMS** | Built-in | Configure providers |
| **Multi-factor Auth** | Built-in | Plugin required |
| **Session Management** | Automatic | Configure yourself |
| **Webhooks** | Built-in | Configure yourself |
| **Edge Support** | Full | Partial (adapter dependent) |
| **Database** | Managed by Clerk | Your database |
| **Customization** | Limited | Full control |

---

## Migration Considerations for QuakeWise

### What We Lose from Clerk

1. **Pre-built UI Components**
   - `<SignIn />`, `<SignUp />`, `<UserButton />`
   - Must build custom UI

2. **User Management Dashboard**
   - No admin interface out of the box
   - Must build or use third-party tools

3. **Multi-factor Authentication**
   - Not built-in with Auth.js
   - Requires additional implementation

4. **Organization/Team Features**
   - Clerk has built-in organization support
   - Must implement yourself with Auth.js

5. **Managed User Database**
   - User data stored in Clerk's infrastructure
   - Must migrate user data

### What We Gain

1. **Full Control**
   - Own user data
   - Custom session management
   - No vendor lock-in

2. **Cost Savings**
   - No monthly fees for users
   - Only database hosting costs

3. **Privacy**
   - User data stays in your database
   - GDPR compliance easier

4. **Customization**
   - Full control over auth flow
   - Custom providers
   - Custom callbacks

---

## Data Migration Requirements

### Current Data Using Clerk

Our `Assessment` model references Clerk user IDs:

```prisma
model Assessment {
  userId String @map("user_id") // Clerk user ID
}
```

### Migration Steps

1. **Export Clerk Users**
   - Use Clerk API to export user data
   - Map Clerk IDs to new Auth.js user IDs

2. **Create Auth.js User Table**
   - Add User, Account, Session tables
   - Migrate user data

3. **Update Assessment References**
   - Create mapping table: `clerk_id → auth_user_id`
   - Update all `userId` references

4. **Handle Sessions**
   - Users will need to re-authenticate
   - Or implement session migration

---

## Estimated Migration Effort

### Code Changes

| Task | Effort | Hours |
|------|--------|-------|
| Install & configure Auth.js | Low | 2 |
| Create auth configuration | Medium | 3 |
| Build sign-in/sign-up UI | High | 8-12 |
| Update middleware | Low | 1 |
| Update all auth imports | Medium | 2-3 |
| Create user management | High | 8-12 |
| Database schema changes | Medium | 2 |
| Data migration scripts | High | 4-6 |
| Testing | High | 8 |

**Total Estimated: 38-50 hours**

### Risk Assessment

| Risk | Likelihood | Impact |
|------|------------|--------|
| User data loss | Low (with backup) | Critical |
| Session disruption | High | Medium |
| Feature regression | Medium | Medium |
| Security vulnerabilities | Low | Critical |
| Timeline overrun | Medium | Low |

---

## Recommendation

### Should You Migrate?

**Migrate IF:**
- Cost reduction is critical
- You need full data ownership
- You want maximum customization
- You're okay investing 40+ hours
- Privacy/compliance requirements

**Stay with Clerk IF:**
- Development speed matters
- You need built-in UI components
- User management dashboard is valuable
- Team/organization features needed
- Current costs are acceptable
- "Just works" is more important than control

---

---

# Better Auth (Recommended for New Projects)

## Why Better Auth?

| Feature | Better Auth | Auth.js v5 |
|---------|-------------|------------|
| Active Development | Yes | Maintenance only |
| MFA Built-in | Yes | No (requires plugin) |
| TypeScript Support | First-class | Good |
| Documentation | Excellent | Challenging |
| Setup Complexity | Easy | Medium |
| Discord Community | 8,200+ members | Less active |
| Edge Support | Full | Partial |

## Community Opinions (November 2025)

### Positive Feedback
- "Setup was a breeze. Way easier and better" - Developer who switched from Auth.js
- "The docs are clear, the setup is quick, and everything is type-safe"
- "I set it up once and it just works"
- "Rate limiting, password policies, MFA, all built in"
- CEO of Vercel called it a "great project & maintainer"

### Concerns
- VC-funded ($5M) - some worry about future monetization
- Schema control delegated to plugins (vs Auth.js adapters)
- Newer project (September 2024) - still maturing
- Recent v1.4.0 has some reported bugs

## Better Auth Setup for Next.js

### Installation

```bash
npm install better-auth
```

### Server Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // Built-in MFA
  twoFactor: {
    enabled: true,
  },
})
```

### Client Configuration

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()
```

### API Route

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### Usage in Components

```typescript
// Server Component
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect("/sign-in")

  return <div>Welcome {session.user.name}</div>
}

// Client Component
"use client"
import { authClient } from "@/lib/auth-client"

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <div>Loading...</div>

  if (session) {
    return (
      <button onClick={() => authClient.signOut()}>
        Sign out {session.user.name}
      </button>
    )
  }

  return (
    <button onClick={() => authClient.signIn.social({ provider: "google" })}>
      Sign in
    </button>
  )
}
```

## Better Auth Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  sessions      Session[]
  accounts      Account[]

  // Your custom relations
  assessments   Assessment[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                    String    @id @default(cuid())
  userId                String    @map("user_id")
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token") @db.Text
  refreshToken          String?   @map("refresh_token") @db.Text
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token") @db.Text
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}
```

---

## Final Comparison: Clerk vs Auth.js vs Better Auth

| Aspect | Clerk | Auth.js v5 | Better Auth |
|--------|-------|------------|-------------|
| **Cost** | Freemium ($0-$$$) | Free | Free |
| **Setup Time** | 10 minutes | 1-2 hours | 30 minutes |
| **UI Components** | Built-in | Build yourself | Build yourself |
| **User Dashboard** | Built-in | Build yourself | Build yourself |
| **MFA** | Built-in | Plugin needed | Built-in |
| **Documentation** | Excellent | Challenging | Excellent |
| **Active Development** | Yes | Maintenance only | Yes |
| **Edge Runtime** | Full | Partial | Full |
| **Database Control** | None (Clerk manages) | Full | Full |
| **Vendor Lock-in** | High | None | None |
| **Community** | Strong | Declining | Growing |
| **Future Stability** | Stable (funded) | Uncertain | Funded ($5M) |

---

## Resources

- [Auth.js Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Auth.js + Next.js Setup](https://authjs.dev/reference/nextjs)
- [Prisma Adapter Docs](https://authjs.dev/reference/adapter/prisma)
- [GitHub Discussion: v5 Status](https://github.com/nextauthjs/next-auth/discussions/9511)
- [Next.js 15 + Auth.js Setup](https://codevoweb.com/how-to-set-up-next-js-15-with-nextauth-v5/)
- [Better Auth Official Site](https://www.better-auth.com/)
- [Better Auth Migration Guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [Auth.js Joins Better Auth Announcement](https://www.better-auth.com/blog/authjs-joins-better-auth)
- [Better Auth vs Auth.js Comparison](https://avishka.dev/blog/better-auth-vs-auth-js)
- [Hacker News Discussion](https://news.ycombinator.com/item?id=45389293)
