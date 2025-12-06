# Project Analysis

## Project Overview
- **Framework:** Next.js 15 with App Router
- **Type:** Web Application (Earthquake Safety Assessment Platform)
- **Tech Stack:** React 19, TypeScript, TailwindCSS, Prisma, PostgreSQL
- **Database:** PostgreSQL with Prisma ORM
- **Auth System:** Clerk Authentication
- **AI Integration:** Anthropic Claude (Sonnet 4) for image analysis

## Existing Features

### Core Assessment System (6-Step Flow)
1. **Location Detection** - GPS coordinates, seismic zone detection, Google Street View/satellite capture
2. **Environmental Analysis** - Weather data, environmental risks, image gallery
3. **AI Plan Analysis** - Upload architectural plans for AI structural analysis
4. **AI Photo Analysis** - Upload building photos for visual assessment
5. **Smart Building Review** - AI-detected characteristics with user confirmation
6. **Final Review** - Data validation and confirmation before results

### Results & Reporting
- Safety score calculation (0-100) with letter grades (A-F)
- FEMA/TBDY-2018 seismic safety calculations
- Risk level assessment (Low, Moderate, High, Very High)
- Vulnerability index and component scores
- Cost estimates for retrofitting
- AI-generated recommendations (immediate, short-term, long-term actions)

### Dashboard Features
- Assessment history list
- Dashboard statistics (total assessments, average scores, risk distribution)
- Assessment card with quick actions

### External API System
- Dual authentication (Platform tokens + JWT)
- Rate limiting (tiered: 500-10k requests/hour)
- Complete building safety assessment endpoint
- Usage tracking and analytics
- Interactive Swagger UI documentation

## Project Structure

```
app/
├── (auth)/          # Sign-in/Sign-up pages (Clerk)
├── (pages)/         # Protected pages (assessment, result, history, about)
├── api/             # API routes
│   ├── v1/          # External API endpoints
│   └── internal/    # Internal endpoints (weather, image analysis)
├── api-docs/        # Swagger UI documentation
└── dashboard/       # User dashboard

components/
├── steps/           # Assessment step components (11 total)
├── results/         # Result display components
├── dashboard/       # Dashboard components
├── assistant/       # AI chat assistant
├── ui/              # shadcn/ui components
└── navigation/      # Navbar, breadcrumb, etc.

lib/
├── actions/         # Server actions (assessment CRUD)
├── auth/            # Authentication utilities
├── api/             # API helpers
└── db/              # Database utilities
```

## Current Capabilities

### API Endpoints
- `POST /api/v1/assessment/complete` - Full safety assessment
- `POST /api/v1/auth/issue-token` - JWT token issuance
- `POST /api/v1/auth/verify-token` - Token verification
- `GET /api/v1/status` - Health check
- `GET /api/v1/parameters` - Valid parameter values
- `GET /api/v1/usage/:appId` - Usage statistics
- Internal: `analyze-image`, `analyze-building-photos`, `analyze-building-plans`, `weather`

### UI Components
- Full shadcn/ui component library
- Framer Motion animations
- Recharts for data visualization
- Dark/Light mode support
- Responsive design

### Integrations
- Google Maps APIs (Places, Street View, Static Maps, Elevation)
- OpenWeatherMap API
- Anthropic Claude AI
- Clerk Authentication

## Technical Constraints
- TypeScript errors ignored during build (strict mode disabled)
- ESLint errors ignored during build
- Production runs on port 3005
- Node.js >= 22.11.0 required
- PostgreSQL required for full functionality
- Results are generated real-time (no historical result caching)

## What's NOT Built Yet
- Mobile app
- Push notifications
- Email notifications/reports
- PDF export of reports
- Social sharing
- Community features
- Comparison between assessments
- Historical earthquake data visualization
- Real-time seismic alerts
- Multi-language support
- Payment/monetization
- User profiles beyond Clerk defaults
