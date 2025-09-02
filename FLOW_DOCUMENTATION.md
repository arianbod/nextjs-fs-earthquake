# QuakeWise Assessment Flow Documentation

## 🎯 Overview
QuakeWise uses a progressive disclosure pattern with "wow moments" to delight users while gathering comprehensive building data for earthquake safety assessment.

## 📱 Complete Flow (11 Steps)

### Step 1: Location Step (`/assessment/1`)
**Purpose**: Gather user's location and secretly collect enhanced data

**What happens:**
- User grants location permission
- System gets GPS coordinates
- **Behind the scenes** (not shown to user):
  - Google Places API fetches building information
  - Street View Service captures multiple building angles
  - Satellite imagery is generated
  - Basic seismic zone analysis begins

**Data collected:**
- `latitude`, `longitude`
- `city`, `country`, `address`
- `earthquakeZone` (auto-detected)
- `soilType` (if available)
- `streetViewUrl`, `satelliteViewUrl` (saved but not shown)
- `streetViewImages[]` (multiple angles)

**User sees:** Simple map with location pin
**User doesn't see:** All the Google imagery being collected

---

### Step 2: Weather Data Step (`/assessment/2`) 
**Purpose**: Show environmental data with a "WOW" surprise reveal

**What happens:**
- Displays weather and climate data
- Shows seismic zone information
- **SURPRISE REVEAL**: Shows the Street View and Satellite images collected in Step 1

**Features:**
- 🎉 "Surprise! We Found Your Building!" with WOW badge
- Animated weather icons
- Multiple Street View angles displayed
- Satellite aerial view
- Progressive reveal animations (`fade-in-up`)

**Data shown:**
- Current weather conditions
- Historical climate data
- Seismic zone classification
- Street View images (multiple angles)
- Satellite imagery

---

### Step 3: AI Photo Analysis Step (`/assessment/3`)
**Purpose**: User uploads building photos for AI analysis

**What happens:**
- User uploads their building photos
- System combines user photos with Google Street View images
- Claude AI analyzes all images together
- Extracts structural characteristics

**AI Analysis includes:**
- Building dimensions
- Number of stories
- Structural system type
- Construction period
- Material condition
- Structural irregularities
- Risk factors (soft story, overhangs, etc.)

**Data collected:**
- User uploaded photos
- AI analysis results
- Building characteristics
- Risk assessments

---

### Step 4: Building Information Step (`/assessment/4`)
**Purpose**: Show pre-filled building details from all sources

**What happens:**
- **AUTO-POPULATED** form with data from:
  - 📍 Location-based data (from Step 1)
  - 🤖 AI-detected features (from Step 3)
  - 🗺️ Google Maps data (from Step 1)
- User can modify any auto-filled values
- Shows data source badges for transparency

**Fields auto-filled:**
- Number of stories
- Building type
- Construction year
- Soil type
- Design regulations
- Structural notes

---

### Step 5-11: Detailed Assessment Steps
5. **Structural System Step** - Define structural framework
6. **Irregularity Step** - Identify structural irregularities
7. **Plan Definition Step** - Building plan details
8. **Manipulation Review Step** - Check for modifications
9. **Specific Condition Step** - Special conditions
10. **Extra Load Step** - Additional load factors
11. **Neighbor Buildings Step** - Adjacent building assessment

---

## 🔌 Technical Implementation

### APIs and Services Used:
1. **Google Places API** - Building information
2. **Google Street View Static API** - Multiple angle photos
3. **Google Maps Static API** - Satellite imagery
4. **Claude 3.5 Sonnet API** - AI image analysis
5. **Weather APIs** - Climate and environmental data

### Data Flow:
```
Step 1 (Location) 
  ↓ [Collects: coordinates, street view, satellite]
Step 2 (Weather)
  ↓ [Reveals: street view images + weather]
Step 3 (AI Photo)
  ↓ [Combines: user photos + Google images → AI]
Step 4 (Building Info)
  ↓ [Shows: all collected data pre-filled]
Steps 5-11
  ↓ [User refines details]
Result Page
```

### Key Files:
- `/components/steps/LocationStep.jsx` - Location & secret data collection
- `/components/steps/WeatherDataStep.jsx` - Weather & surprise reveal
- `/components/steps/AIPhotoStep.jsx` - Photo upload & AI analysis
- `/components/steps/BuildingInfoStep.jsx` - Auto-populated forms
- `/app/api/analyze-image/route.js` - Claude API integration
- `/services/googlePlacesService.js` - Google Places integration
- `/services/streetViewService.js` - Street View integration

### Authentication:
- Steps require Clerk authentication (configured in `middleware.ts`)
- Public routes: `/`, `/sign-in`, `/sign-up`
- Protected routes: `/assessment/*`, `/dashboard`, `/result/*`

## ✨ WOW Moments

1. **Step 2 Surprise**: "We found your building!" - Reveals Street View
2. **Step 3 Intelligence**: AI combines multiple data sources
3. **Step 4 Magic**: Forms are already filled out!

## 🎨 UI/UX Features

- **Progressive Disclosure**: Information revealed gradually
- **Animations**: `fade-in-up`, `pulse`, `bounce` effects
- **Visual Feedback**: Progress bars, loading states, badges
- **Data Transparency**: Shows data sources with badges
- **Error Handling**: Graceful fallbacks for missing images

## 🚀 Deployment

- **Platform**: Vercel
- **Node Version**: 22.x (configured in `vercel.json`)
- **Environment Variables Required**:
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

## 📊 Testing

Run `node test-flow.js` to verify:
- All step components exist
- API endpoints are configured
- Key features are implemented
- Data flow is correct

---

*Last Updated: September 2025*
*Version: 1.1.0*