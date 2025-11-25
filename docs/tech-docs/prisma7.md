# Prisma 7 Upgrade Guide for QuakeWise

## Overview

Prisma 7 is a major release that removes Rust dependencies and rebuilds the client entirely in TypeScript. This document outlines all changes relevant to our QuakeWise project.

**Current Version:** 6.19.0
**Target Version:** 7.x
**Database:** PostgreSQL (Neon)

---

## Key Changes Relevant to Our Project

### 1. Rust-Free Client Architecture

The most significant change - Prisma Client has been rebuilt in TypeScript.

**Benefits for QuakeWise:**
- 90% smaller bundle output (faster Vercel deployments)
- 3x faster query execution
- Lower CPU and memory utilization
- Better Edge Runtime support (Vercel Edge Functions)

### 2. Minimum Version Requirements

| Requirement | Current (QuakeWise) | Prisma 7 Minimum | Status |
|-------------|---------------------|------------------|--------|
| Node.js | >=22.11.0 | 20.19.0 | ✅ Compatible |
| TypeScript | ^5.8.0 | 5.4.0 | ✅ Compatible |
| ESM | "type": "module" | Required | ✅ Already ESM |

### 3. Schema Generator Change

**Before (Current - schema.prisma):**
```prisma
generator client {
  provider = "prisma-client-js"
}
```

**After (Prisma 7):**
```prisma
generator client {
  provider = "prisma-client"
}
```

### 4. Driver Adapter Requirement (BREAKING CHANGE)

Prisma 7 **requires explicit driver adapters** for all databases.

**Before (Current):**
```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

**After (Prisma 7 with PostgreSQL):**
```javascript
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})
const prisma = new PrismaClient({ adapter })
```

**Required New Package:**
```bash
npm install @prisma/adapter-pg
```

### 5. Generated Client Location Change

**Before:** Generated inside `node_modules/@prisma/client`
**After:** Generated in project source code (e.g., `./generated/prisma/client`)

This means we need to update all imports across the codebase.

### 6. Environment Variable Loading (BREAKING CHANGE)

Prisma 7 **removes automatic .env file loading**.

**Before:** Prisma automatically loaded `.env` files
**After:** Must explicitly load environment variables

**QuakeWise Status:** ✅ Already using `dotenv` package (^17.2.3)

We need to ensure `dotenv/config` is imported before Prisma in all entry points.

### 7. New Prisma Config File

Create `prisma.config.ts` at project root:

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### 8. Removed Features

| Feature | Status | Migration Path |
|---------|--------|----------------|
| Metrics Extension | Removed | Use driver adapter or client extensions |
| Client Middleware (`$use()`) | Removed | Use client extensions |
| Auto .env loading | Removed | Use `dotenv` package |
| Various engine env vars | Removed | Not needed with new architecture |

---

## Migration Steps for QuakeWise

### Step 1: Update Dependencies

```bash
npm install @prisma/client@7 @prisma/adapter-pg
npm install -D prisma@7
```

### Step 2: Update Schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 3: Create Prisma Config File

Create `prisma.config.ts`:

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### Step 4: Update Prisma Client Instantiation

Create/update `lib/db/prisma.js`:

```javascript
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Step 5: Update All Imports

Find and replace all occurrences:
- `from '@prisma/client'` → `from '@/generated/prisma/client'`
- Add `import 'dotenv/config'` where needed

### Step 6: Regenerate Client

```bash
npx prisma generate
npx prisma db push  # Or migrate if using migrations
```

---

## Files That Need Updates

Based on our codebase analysis:

1. **`prisma/schema.prisma`** - Generator provider change
2. **`lib/db/*.js`** - Client instantiation with adapter
3. **`app/api/**/*.js`** - Any files importing PrismaClient
4. **`prisma/seed.js`** - Update imports
5. **`scripts/*.js`** - API scripts that use Prisma

---

## New Features We Can Use

### 1. Mapped Enums

Now supported in Prisma 7:

```prisma
enum Tier {
  WEB_APP       @map("web_app")
  BATCH_JOB     @map("batch_job")
  DEV_TESTING   @map("dev_testing")
}
```

### 2. Improved Type Performance

- ~98% fewer types needed for schema evaluation
- ~45% fewer types for query evaluation
- 70% faster full type checks

### 3. Better Edge Support

With Rust removed, better support for:
- Vercel Edge Functions
- Cloudflare Workers
- Deno Deploy

---

## Potential Issues for QuakeWise

### 1. Neon Database Compatibility

Our setup uses Neon with `directUrl` for migrations. Need to verify:
- Adapter compatibility with Neon pooled connections
- Direct URL still works for migrations

### 2. Import Path Changes

All files importing from `@prisma/client` need updating. This is a significant change across the codebase.

### 3. Testing

Our Vitest tests may need updates for the new client initialization pattern.

---

## Estimated Migration Effort

| Task | Complexity |
|------|------------|
| Schema update | Low |
| Add adapter package | Low |
| Update client instantiation | Medium |
| Update all imports | Medium (find/replace) |
| Test all API routes | Medium |
| Verify Neon compatibility | Low |

**Overall: Medium complexity, 2-4 hours of work**

---

## Resources

- [Official Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma 7 Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Driver Adapters Documentation](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Prisma Changelog](https://www.prisma.io/changelog)
