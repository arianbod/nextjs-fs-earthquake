# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server (runs on port 3005)
- `npm run lint` - Run ESLint

### Important Notes
- **TypeScript errors are ignored during build** (`typescript: { ignoreBuildErrors: true }`)
- **ESLint errors are ignored during build** (`eslint: { ignoreDuringBuilds: true }`)
- Production server runs on port 3005 (not default 3000)
- Node.js version requirement: >=22.11.0

## Project Architecture

### Core Application Structure
QuakeWise is an earthquake safety assessment platform built with Next.js 15 that combines AI analysis, geospatial data, and engineering calculations to evaluate building vulnerability.

#### Key Technologies
- **Next.js 15** with App Router
- **React 19** with React Server Components
- **TypeScript** (with relaxed error handling)
- **TailwindCSS** with custom design system
- **Clerk** for authentication
- **Anthropic Claude Sonnet 4** for AI image analysis
- **Google Maps APIs** (Places, Street View, Static Maps)
- **React Query** for data fetching and caching

### Application Flow

#### Assessment Process (11-Step Flow)
1. **Location Step** (`/assessment/1`) - GPS location + hidden Google data collection
2. **Weather Data Step** (`/assessment/2`) - Weather + surprise Street View reveal
3. **AI Photo Step** (`/assessment/3`) - User photo upload + AI analysis
4. **Building Info Step** (`/assessment/4`) - Auto-populated form from all data sources
5. **Structural System Step** (`/assessment/5`) - Framework definition
6. **Irregularity Step** (`/assessment/6`) - Structural irregularities
7. **Plan Definition Step** (`/assessment/7`) - Building plan details
8. **Manipulation Review Step** (`/assessment/8`) - Check modifications
9. **Specific Condition Step** (`/assessment/9`) - Special conditions
10. **Extra Load Step** (`/assessment/10`) - Additional load factors
11. **Neighbor Buildings Step** (`/assessment/11`) - Adjacent building assessment

### Directory Structure

#### `/app`
- Uses Next.js App Router
- Route groups: `(auth)`, `(pages)`
- API routes in `/app/api/`
- Authentication middleware configured

#### `/components`
- Modular React components organized by feature
- `/steps/` - Assessment step components
- `/ui/` - Reusable UI components (shadcn/ui based)
- `/assistant/` - AI chat assistant components
- `/results/` - Result display components

### Critical Components

#### Assessment Steps (`/components/steps/`)
- Each step is a self-contained component
- State management via URL parameters and React state
- Progressive disclosure pattern with "wow moments"
- Auto-populated forms using AI + Google data

#### AI Integration
- **Image Analysis**: `/app/api/analyze-image/route.js` - Claude Sonnet 4 integration
- **Building Photos**: `/app/api/analyze-building-photos/route.js`
- **Building Plans**: `/app/api/analyze-building-plans/route.js`

#### Google Services Integration
- Street View collection (multiple angles)
- Places API for building data
- Static Maps for satellite imagery
- Elevation API for terrain analysis

### Safety Calculation Engine

Located in `/components/safetyScoreCalculator.jsx` and `/components/femaSeismicSafetyCalculator.js`:

- **Turkish Building Earthquake Code (TBDY-2018)** compliance
- Seismic zone classification (Zones 1-4)
- Structural vulnerability assessment
- Site-specific conditions (slope, liquefaction risk)
- Material condition and building age factors
- Irregularity detection and amplification

### Authentication & Routing

- **Clerk authentication** configured in `middleware.ts`
- Protected routes: `/assessment/*`, `/dashboard`, `/result/*`
- Public routes: `/`, `/sign-in`, `/sign-up`, `/about`, `/welcome`

### Styling & UI

- **TailwindCSS** with custom design system
- Color palette includes custom `woi` and `silver` themes
- **shadcn/ui** components for consistent UI
- **Framer Motion** for animations
- Dark mode support via `next-themes`

### Data Management

- **React Query** for API state management
- Local storage for assessment progress
- No database - results are generated and displayed real-time

### Important Configuration Notes

- TypeScript strict mode is **disabled** (`"strict": false`)
- Build errors are **ignored** for both TypeScript and ESLint
- Path alias `@/*` maps to project root
- Custom Vercel deployment configuration in `vercel.json`

### API Dependencies

Requires these environment variables:
- `ANTHROPIC_API_KEY` - Claude AI API access
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps Platform
- `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Authentication

### Testing & Verification

- `node test-flow.js` - Verify assessment flow components
- No formal test suite configured
- Manual testing via development server

### Documentation Files

- `TECHNICAL_ARCHITECTURE.md` - Detailed engineering documentation
- `FLOW_DOCUMENTATION.md` - Complete assessment flow explanation
- Both contain extensive technical details about the safety calculation algorithms and AI analysis processes