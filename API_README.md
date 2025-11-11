# QuakeWise External API Documentation

## Overview

The QuakeWise External API is a comprehensive RESTful API that enables third-party applications to perform earthquake safety assessments for buildings. It combines AI-powered analysis, geospatial data, and structural engineering calculations to provide detailed vulnerability assessments.

## Features

- **Dual Authentication System**: Platform-level tokens + JWT tokens for end users
- **Tiered Rate Limiting**: 100 to 10,000 requests/hour based on subscription tier
- **AI Image Analysis**: Claude AI-powered building photo and plan analysis
- **Comprehensive Safety Scoring**: Turkish Building Earthquake Code (TBDY-2018) compliant calculations
- **Geospatial Integration**: Google Maps APIs for location intelligence and Street View
- **Weather Risk Assessment**: Soil saturation risk based on current weather conditions
- **Usage Analytics**: Detailed tracking and analytics for API consumption
- **Interactive Documentation**: Swagger UI with live testing capabilities

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Generate secure tokens
node -e "console.log('API_PLATFORM_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Add these to your .env.local file
```

### 2. Install Dependencies

```bash
# Install required npm packages
npm install jose better-sqlite3 zod

# Optional: Install Swagger UI for documentation
npm install swagger-ui-react
```

### 3. Initialize Database

```bash
# The database will be automatically created on first run
# Default location: ./data/api_usage.db
```

### 4. Register Your First App

Create a script to register your platform app:

```javascript
// scripts/register-app.js
const { registerApp } = require('./lib/db/usageTracker');
const { generatePlatformToken } = require('./lib/auth/platformAuth');

const platformToken = generatePlatformToken();

const result = registerApp({
  appId: 'my-app',
  name: 'My Application',
  tier: 'pro',
  platformToken: platformToken
});

console.log('App registered successfully!');
console.log('App ID:', result.appId);
console.log('Platform Token:', platformToken);
console.log('SAVE THIS TOKEN - it will not be shown again!');
```

### 5. Test the API

Visit `http://localhost:3000/api-docs` to access the interactive documentation and test the endpoints.

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

Platform authentication uses a static token that identifies your application:

```http
POST /api/v1/auth/issue-token
X-Platform-Token: your_platform_token_here
```

### User Authentication (JWT)

For end-user operations, issue JWT tokens:

**Request:**
```json
POST /api/v1/auth/issue-token
Headers:
  X-Platform-Token: your_platform_token

Body:
{
  "userId": "user_123",
  "appId": "my-app",
  "tier": "pro",
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

All authenticated endpoints are rate-limited based on your tier:

| Tier       | Requests/Hour | Requests/Day | Features                          |
|------------|---------------|--------------|-----------------------------------|
| Free       | 100           | 1,000        | Basic assessment                  |
| Pro        | 1,000         | 10,000       | + AI analysis + Location data     |
| Enterprise | 10,000        | 100,000      | + Priority support + Custom features |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 2025-09-15T11:00:00Z
X-RateLimit-Tier: pro
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

Track your API usage:

```bash
GET /api/v1/usage/my-app?days=7
X-Platform-Token: your_platform_token
```

Response includes:
- Daily request counts
- Success/error rates
- Average response times
- Endpoint breakdown

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
# Test platform authentication
curl -X POST http://localhost:3000/api/v1/auth/issue-token \
  -H "X-Platform-Token: your_token" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","appId":"test-app","tier":"pro"}'

# Test assessment endpoint
curl -X POST http://localhost:3000/api/v1/assessment/complete \
  -H "X-Platform-Token: your_platform_token" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d @test-assessment.json
```

### Database Management

```bash
# View database location
echo $API_DATABASE_PATH

# Inspect database
sqlite3 ./data/api_usage.db

# Common queries
SELECT * FROM api_apps;
SELECT * FROM api_usage ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM rate_limits WHERE app_id = 'my-app';
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
API_PLATFORM_SECRET=<secure-256-bit-token>
JWT_SECRET=<secure-256-bit-token>
JWT_EXPIRY=7d
API_DATABASE_PATH=/data/api_usage.db

# Existing services
ANTHROPIC_API_KEY=<your-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
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

## Support & Resources

- **Interactive Documentation**: https://quakewise.com/api-docs
- **OpenAPI Specification**: https://quakewise.com/api-docs/openapi.json
- **GitHub Issues**: Report bugs and request features
- **Email Support**: api@quakewise.com

## License

Proprietary - © 2025 QuakeWise. All rights reserved.

## Changelog

### Version 1.0.0 (2025-09-15)

Initial release:
- Platform and JWT authentication
- Complete building assessment endpoint
- Rate limiting and usage tracking
- Interactive API documentation
- AI-powered image analysis
- Geospatial and weather integration
- Comprehensive error handling
