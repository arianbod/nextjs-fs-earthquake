# QuakeWise Internal API Documentation

## Overview

The QuakeWise Internal API is a comprehensive RESTful API that enables our internal services and microservices to perform earthquake safety assessments for buildings. It combines AI-powered analysis, geospatial data, and structural engineering calculations to provide detailed vulnerability assessments.

## Features

- **Dual Authentication System**: Platform-level tokens + JWT tokens for end users
- **Tiered Rate Limiting**: 500 to 10,000 requests/hour based on service tier
- **AI Image Analysis**: Claude AI-powered building photo and plan analysis
- **Comprehensive Safety Scoring**: Turkish Building Earthquake Code (TBDY-2018) compliant calculations
- **Geospatial Integration**: Google Maps APIs for location intelligence and Street View
- **Weather Risk Assessment**: Soil saturation risk based on current weather conditions
- **Usage Analytics**: Detailed tracking and analytics for API consumption
- **Interactive Documentation**: Swagger UI with live testing capabilities

## Quick Start for Internal Teams

### 1. Generate Service Tokens

All internal services are pre-registered in `config/internal-services.js`. Generate tokens for these services:

```bash
# Generate secure tokens for all pre-registered services
npm run generate:service-tokens

# This creates a timestamped file with all tokens
# Store these tokens in our team password manager (1Password/Vault)
```

Available pre-registered services:
- `quakewise-web-app` - Main web application (WEB_APP tier)
- `quakewise-mobile-api` - Mobile backend service (WEB_APP tier)
- `batch-assessment-processor` - Background job processor (BATCH_JOB tier)
- `analytics-service` - Data analytics service (BATCH_JOB tier)
- `dev-testing-service` - Development and testing (DEV_TESTING tier)

### 2. Add Tokens to Environment

```bash
# Add service tokens to .env.local for development
# Format: SERVICE_TOKEN_WEB_APP=<your-token-here>

# For production, add to Vercel environment variables
# See the generated file for Vercel-ready format
```

### 3. Seed Database

```bash
# Initialize database with pre-registered services
npm run db:seed

# This creates all service records in the database
```

### 4. Access Internal Documentation

Visit `http://localhost:3000/api-docs` (requires Clerk authentication with team email)

## Architecture

### Directory Structure

```
quakewise/
├── app/
│   └── api/
│       └── v1/
│           ├── auth/
│           │   ├── issue-token/route.js
│           │   └── verify-token/route.js
│           ├── assessment/
│           │   └── complete/route.js
│           ├── status/route.js
│           ├── usage/[appId]/route.js
│           └── parameters/route.js
├── lib/
│   ├── auth/
│   │   ├── platformAuth.js
│   │   └── jwtService.js
│   ├── api/
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── db/
│   │   ├── schema.sql
│   │   └── usageTracker.js
│   ├── cache/
│   │   └── rateLimitCache.js
│   └── logging/
│       └── apiLogger.js
├── middleware/
│   ├── platformAuthMiddleware.js
│   ├── jwtAuthMiddleware.js
│   └── rateLimitMiddleware.js
├── components/
│   └── api-docs/
│       ├── SwaggerUI.jsx
│       └── ApiTester.jsx
└── public/
    └── api-docs/
        └── openapi.json
```

## Authentication

### Platform Authentication

Platform authentication uses pre-registered service tokens from our internal registry:

```http
POST /api/v1/auth/issue-token
X-Platform-Token: <service-token-from-env>
```

Each internal service has a dedicated token stored in environment variables:
- `SERVICE_TOKEN_WEB_APP` - Web application service
- `SERVICE_TOKEN_MOBILE` - Mobile API service
- `SERVICE_TOKEN_BATCH` - Batch processing service
- `SERVICE_TOKEN_ANALYTICS` - Analytics service
- `SERVICE_TOKEN_DEV` - Development/testing service

### User Authentication (JWT)

For end-user operations, our services issue JWT tokens:

**Request:**
```json
POST /api/v1/auth/issue-token
Headers:
  X-Platform-Token: <SERVICE_TOKEN_WEB_APP>

Body:
{
  "userId": "clerk_user_123",
  "appId": "quakewise-web-app",
  "tier": "WEB_APP",
  "expiresIn": "7d"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-09-22T10:30:00Z",
    "expiresIn": 604800
  }
}
```

## API Endpoints

### Core Endpoints

#### POST /api/v1/assessment/complete

Performs comprehensive building safety assessment.

**Authentication:** Platform Token + JWT Token

**Request Body:**
```json
{
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
    "typeOfEarthquake": "Zone 4",
    "verticalIrregularityHigh": false,
    "planIrregularity": false
  },
  "images": {
    "buildingPhotos": ["base64-encoded-image"],
    "floorPlans": ["base64-encoded-plan"]
  },
  "options": {
    "includeAiAnalysis": true,
    "includeLocationIntelligence": true,
    "includeWeatherRisk": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "asm_abc123",
    "safetyScore": {
      "overall": "72",
      "normalizedScore": "72",
      "interpretation": "Moderate safety level",
      "maxSafeRichter": "6.2"
    },
    "seismicData": {
      "zone": "Zone 4",
      "riskLevel": "Very High",
      "pga": 0.40
    },
    "recommendations": [...]
  },
  "metadata": {
    "processingTime": 2450,
    "version": "v1.0.0",
    "timestamp": "2025-09-15T10:30:00Z"
  }
}
```

### System Endpoints

#### GET /api/v1/status

Health check endpoint (public, no authentication required).

#### GET /api/v1/parameters

Returns valid parameter values for assessments (public).

#### GET /api/v1/usage/:appId

Returns usage statistics for an app (requires platform token).

## Rate Limiting

All authenticated endpoints are rate-limited based on service tier:

| Tier        | Requests/Hour | Requests/Day | Use Case                          |
|-------------|---------------|--------------|-----------------------------------|
| WEB_APP     | 10,000        | 100,000      | High-traffic user-facing services (web & mobile apps) |
| BATCH_JOB   | 1,000         | 50,000       | Background jobs and bulk processing |
| DEV_TESTING | 500           | 5,000        | Development environments and automated testing |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9987
X-RateLimit-Reset: 2025-09-15T11:00:00Z
X-RateLimit-Tier: WEB_APP
```

## Error Handling

All errors follow a standardized format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Limit: 1000 requests per hour.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2025-09-15T11:00:00Z"
    },
    "timestamp": "2025-09-15T10:30:00Z",
    "requestId": "req_abc123_xyz789"
  }
}
```

### Common Error Codes

- `INVALID_PLATFORM_TOKEN` - Platform authentication failed
- `INVALID_JWT_TOKEN` - User JWT invalid or missing
- `JWT_TOKEN_EXPIRED` - JWT token has expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Request validation failed
- `SERVICE_ERROR` - Internal service error

## Building Structural Systems

Valid building type codes:

| Code | Description | Category |
|------|-------------|----------|
| C1   | Concrete Moment Frame | Concrete |
| C2   | Concrete Shear Walls | Concrete |
| S1   | Steel Moment Frame | Steel |
| S2   | Steel Braced Frame | Steel |
| W1   | Wood Light Frame | Wood |
| RM1  | Reinforced Masonry | Masonry |
| URM  | Unreinforced Masonry | Masonry |

For complete list, call `GET /api/v1/parameters`

## Usage Analytics

Track internal service usage:

```bash
GET /api/v1/usage/quakewise-web-app?days=7
X-Platform-Token: $SERVICE_TOKEN_WEB_APP
```

Response includes:
- Daily request counts
- Success/error rates
- Average response times
- Endpoint breakdown

Available service IDs:
- `quakewise-web-app`
- `quakewise-mobile-api`
- `batch-assessment-processor`
- `analytics-service`
- `dev-testing-service`

## Development

### Running Locally

```bash
# Start development server
npm run dev

# View API documentation
open http://localhost:3000/api-docs

# Check API status
curl http://localhost:3000/api/v1/status
```

### Testing

```bash
# Test platform authentication with web app service token
curl -X POST http://localhost:3000/api/v1/auth/issue-token \
  -H "X-Platform-Token: $SERVICE_TOKEN_WEB_APP" \
  -H "Content-Type: application/json" \
  -d '{"userId":"clerk_user_123","appId":"quakewise-web-app","tier":"WEB_APP"}'

# Test assessment endpoint
curl -X POST http://localhost:3000/api/v1/assessment/complete \
  -H "X-Platform-Token: $SERVICE_TOKEN_WEB_APP" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d @test-assessment.json

# Or use the provided test script
npm run api:test
```

### Database Management

```bash
# Using Prisma Studio (recommended)
npm run db:studio

# View Neon PostgreSQL database
# Connection details in DATABASE_URL environment variable

# Common Prisma queries
npx prisma db seed  # Seed database with pre-registered services
npx prisma migrate dev  # Run migrations
npx prisma generate  # Regenerate Prisma Client
```

## Production Deployment

### Environment Variables

Set these in Vercel production environment:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Service Tokens (from npm run generate:service-tokens)
SERVICE_TOKEN_WEB_APP=<secure-256-bit-token>
SERVICE_TOKEN_MOBILE=<secure-256-bit-token>
SERVICE_TOKEN_BATCH=<secure-256-bit-token>
SERVICE_TOKEN_ANALYTICS=<secure-256-bit-token>
SERVICE_TOKEN_DEV=<secure-256-bit-token>

# JWT Configuration
JWT_SECRET=<secure-256-bit-token>
JWT_EXPIRY=7d

# External Services
ANTHROPIC_API_KEY=<claude-api-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-key>

# Clerk Authentication
CLERK_SECRET_KEY=<clerk-secret>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-publishable>
```

### Security Considerations

1. **Use HTTPS** - Always use HTTPS in production
2. **Rotate Tokens** - Periodically rotate platform and JWT secrets
3. **Rate Limiting** - Enforce strict rate limits
4. **Input Validation** - All inputs are validated with Zod schemas
5. **SQL Injection Protection** - Using prepared statements
6. **XSS Prevention** - Input sanitization
7. **Logging** - Comprehensive logging for audit trails

### Monitoring

Monitor these metrics:

- Request rate and latency
- Error rates by endpoint
- Authentication failures
- Rate limit hits
- Database performance

Logs are written to `./logs/api-YYYY-MM-DD.log`

## Internal Resources

- **Interactive Documentation**: http://localhost:3000/api-docs (dev) or https://quakewise.com/api-docs (prod, requires Clerk auth)
- **OpenAPI Specification**: `/public/api-docs/openapi.json`
- **Service Registry**: `config/internal-services.js` - Pre-registered services and tier configuration
- **Team Access Control**: `config/team-members.js` - API docs email whitelist
- **Internal Slack**: #api-support channel for questions
- **Team Password Manager**: 1Password vault "QuakeWise API Tokens"

## License

Proprietary - © 2025 QuakeWise. All rights reserved.

## Changelog

### Version 1.1.0 (2025-09-15)

**Internal API Transformation:**
- Converted from external/public API to internal-only services architecture
- Pre-registered service system (no dynamic app registration)
- Updated tier system: WEB_APP, BATCH_JOB, DEV_TESTING (replaced FREE/PRO/ENTERPRISE)
- Clerk authentication for API documentation access
- Team email whitelist for internal access control
- Automated service token generation script
- Migrated to Neon PostgreSQL (from SQLite)
- Prisma ORM integration

### Version 1.0.0 (2025-09-15)

Initial release:
- Platform and JWT authentication
- Complete building assessment endpoint
- Rate limiting and usage tracking
- Interactive API documentation
- AI-powered image analysis
- Geospatial and weather integration
- Comprehensive error handling
