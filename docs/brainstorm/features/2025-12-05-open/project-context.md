# QuakeWise Project Context

## Project Overview

- **Framework:** Next.js 15 with App Router
- **Type:** Web Application - Earthquake Safety Assessment Platform
- **Language:** JavaScript/JSX (TypeScript compatible)
- **Database:** PostgreSQL via Prisma ORM
- **Auth System:** Clerk Authentication

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TailwindCSS, Framer Motion |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL (Prisma 7.0) |
| AI | Anthropic Claude Sonnet 4 |
| Maps | Google Maps APIs, Leaflet |
| Auth | Clerk |
| i18n | next-intl (English, Turkish) |
| State | React Query (TanStack Query) |
| PDF | @react-pdf/renderer |
| Charts | Recharts |

## Existing Features

### Core Assessment Flow (11 Steps)
- [x] Location Detection - GPS + Google Street View collection
- [x] Weather Analysis - Environmental data + surprise reveal
- [x] AI Photo Analysis - Upload photos, Claude AI analyzes
- [x] Building Info - Auto-populated form from AI + Google
- [x] Structural System - Framework definition
- [x] Irregularity Assessment - Structural irregularities
- [x] Plan Definition - Building plan details
- [x] Manipulation Review - Check modifications
- [x] Specific Conditions - Special conditions
- [x] Extra Load - Additional load factors
- [x] Neighbor Buildings - Adjacent building assessment

### Results & Output
- [x] Safety Score (0-100) with grade (A-F)
- [x] Risk Level Assessment
- [x] Performance Charts
- [x] Cost-Benefit Analysis
- [x] Retrofit Cost Calculator
- [x] PDF Report Export
- [x] Email Report Sharing
- [x] QR Code Sharing
- [x] Social Sharing

### Historical Data
- [x] Historical Earthquake Map (USGS integration)
- [x] Assessment History Dashboard

### Real-Time Features (NEW)
- [x] Real-Time Earthquake Alerts (AFAD, EMSC, USGS)
- [x] Push Notifications (Web Push)
- [x] User Alert Preferences
- [x] Quiet Hours Support
- [x] Alert Notification List

### API & Integration
- [x] External API with JWT authentication
- [x] Swagger/OpenAPI documentation
- [x] Rate limiting (tier-based)
- [x] Usage analytics

### Internationalization
- [x] English (en)
- [x] Turkish (tr)

## Project Structure

```
app/
├── [locale]/
│   ├── (auth)/          # Sign-in/Sign-up
│   ├── (pages)/         # Protected routes
│   │   ├── assessment/  # 11-step assessment
│   │   ├── result/      # Results display
│   │   ├── history/     # User history
│   │   ├── about/       # About page
│   │   └── welcome/     # Welcome page
│   ├── alerts/          # Alert settings
│   ├── dashboard/       # Main dashboard
│   └── api-docs/        # API documentation
├── api/
│   ├── alerts/          # Alert system endpoints
│   ├── v1/              # External API
│   └── ...              # Other endpoints
components/
├── alerts/              # Alert UI components
├── dashboard/           # Dashboard components
├── results/             # Results display
├── steps/               # Assessment steps
└── ui/                  # shadcn/ui components
lib/
├── alerts/              # Alert system logic
│   ├── sources/         # AFAD, EMSC, USGS clients
│   └── ...              # Deduplication, processing
└── actions/             # Server actions
```

## Technical Constraints

1. **TypeScript Errors Ignored** - Build ignores TS errors
2. **Production Port 3005** - Not default 3000
3. **Image Optimization** - Sharp required
4. **Vercel Deployment** - Cron job limitations on Hobby plan

## API Dependencies

| Service | Purpose |
|---------|---------|
| Anthropic Claude | AI image analysis |
| Google Maps Platform | Places, Street View, Static Maps |
| AFAD API | Turkey earthquake data |
| EMSC FDSN | European earthquake data |
| USGS API | Global earthquake data |
| OpenWeatherMap | Weather data |
| Clerk | Authentication |

## Current Capabilities

### What Users Can Do
1. Assess building earthquake safety with AI
2. Get detailed safety scores and reports
3. Export PDF reports
4. Share results via email, QR, links
5. View historical earthquakes near location
6. Receive real-time earthquake alerts
7. Configure notification preferences

### What's Missing (Opportunities)
- Mobile native app (PWA exists partially)
- Offline capability
- Community features
- Insurance integration
- Professional verification
- Multi-building management
- Comparison tools
