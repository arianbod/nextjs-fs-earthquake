# Prisma + Neon PostgreSQL Setup Guide

QuakeWise External API uses Prisma ORM with Neon PostgreSQL for production-grade database management.

## Why Prisma + Neon?

- **Prisma**: Type-safe database client with excellent DX
- **Neon**: Serverless PostgreSQL with instant branching and autoscaling
- **Perfect for Vercel**: Seamless deployment and connection pooling

## Quick Setup

### 1. Create Neon Database

1. Sign up at [console.neon.tech](https://console.neon.tech)
2. Create a new project (Free tier includes 0.5 GB storage)
3. Copy both connection strings:
   - **Pooled connection** (for application queries)
   - **Direct connection** (for migrations)

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Neon PostgreSQL - Pooled connection
DATABASE_URL=postgresql://user:pass@endpoint.neon.tech/db?sslmode=require

# Neon PostgreSQL - Direct connection (for migrations)
DIRECT_URL=postgresql://user:pass@endpoint.neon.tech/db?sslmode=require
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# View your database
npm run db:studio
```

## Available Scripts

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema changes (dev only)
npm run db:migrate     # Create and run migrations
npm run db:studio      # Open Prisma Studio (DB GUI)
npm run db:seed        # Seed database with test data
```

## Database Schema

The schema includes 5 main tables:

1. **api_apps** - Platform app registry
2. **api_usage** - Request tracking and analytics
3. **rate_limits** - Rate limiting per time window
4. **api_tokens** - JWT token management
5. **api_errors** - Error logging and debugging

View full schema: `prisma/schema.prisma`

## Production Deployment (Vercel)

### 1. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=<neon-pooled-connection-string>
DIRECT_URL=<neon-direct-connection-string>
```

### 2. Run Migrations

Migrations run automatically during build, but you can also run manually:

```bash
npx prisma migrate deploy
```

### 3. Connection Pooling

Neon automatically provides connection pooling through the pooled connection string. No additional configuration needed!

## Common Tasks

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

### Create New Migration

```bash
npm run db:migrate
# Enter migration name when prompted
```

### Reset Database (Dev Only)

```bash
npx prisma migrate reset
```

⚠️ Warning: Deletes all data!

### Seed Database

```bash
npm run db:seed
```

## Troubleshooting

### "Can't reach database server"

- Check DATABASE_URL is correct
- Ensure Neon project is active (not paused)
- Verify SSL mode is set: `?sslmode=require`

### "Migration failed"

- Use DIRECT_URL for migrations (not pooled connection)
- Check database permissions
- Ensure no conflicting migrations

### "Prisma Client not generated"

```bash
npm run db:generate
```

## Migration from SQLite

If you had the old SQLite setup:

1. Old database was at `data/api_usage.db` (now removed)
2. Schema converted from SQL to Prisma format
3. All functions in `lib/db/usageTracker.js` updated
4. No data migration needed (fresh start)

## Prisma Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma + Neon Guide](https://neon.tech/docs/guides/prisma)
- [Vercel + Prisma](https://vercel.com/guides/prisma)

## Database Models Overview

### ApiApp
```prisma
model ApiApp {
  id                  String        @id @default(cuid())
  name                String
  platformTokenHash   String        @unique
  tier                Tier          @default(FREE)
  rateLimitPerHour    Int
  rateLimitPerDay     Int
  status              AppStatus     @default(ACTIVE)
}
```

### ApiUsage
```prisma
model ApiUsage {
  id                  Int           @id @default(autoincrement())
  appId               String
  userId              String?
  endpoint            String
  method              String
  statusCode          Int
  responseTimeMs      Int?
  timestamp           DateTime      @default(now())
}
```

See `prisma/schema.prisma` for complete models.

## Next Steps

1. ✅ Set up Neon account
2. ✅ Configure environment variables
3. ✅ Run migrations
4. ✅ Register first API app
5. ✅ Test API endpoints
6. ✅ Deploy to production

Need help? Check the main [API_README.md](./API_README.md) for complete API documentation.
