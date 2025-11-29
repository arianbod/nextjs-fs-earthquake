# Auth-Based Experience - Technical Plan

> **Document Type:** HOW Document
> **Purpose:** Define the technical approach to implement auth-based experience
> **Created:** November 2025
> **Completed:** November 2025
> **Decision:** Option B - Hero + key sections with quick-resume, recent assessments, stats
> **Status:** IMPLEMENTED

---

## Approach

### Architecture Decision

**Single route with conditional rendering** (`/` serves both experiences)

Reasons:
- Simpler routing
- Better SEO (single canonical URL)
- Easier to maintain
- Uses existing Clerk hooks

### Component Structure

```
app/page.js (Homepage)
├── HeroSection
│   ├── GuestHero (marketing focus)
│   └── AuthHero (personalized, quick actions)
├── LoggedInDashboard (only for auth users)
│   ├── QuickResumeCard
│   ├── RecentAssessments
│   └── StatsOverview
├── FeaturesSection (shared, slightly different CTA)
├── AssessmentFlow (shared)
├── StatsSection (shared)
└── FinalCTA
    ├── GuestCTA (sign up focus)
    └── AuthCTA (start new/view dashboard)
```

### Data Flow

1. Check auth state with `useUser()` from Clerk
2. If authenticated, fetch user data:
   - `getDashboardStats()` - for stats
   - `getLastDraftAssessment()` - for quick resume
   - `getUserAssessments({ limit: 3 })` - for recent list
3. Render appropriate components based on auth state

---

## Implementation Tasks

### Phase 1: Refactor Homepage Structure

1. Create separate hero components:
   - `components/homepage/GuestHero.jsx`
   - `components/homepage/AuthHero.jsx`

2. Create logged-in dashboard section:
   - `components/homepage/LoggedInDashboard.jsx`
   - Reuse existing dashboard components where possible

3. Update `app/page.js` to conditionally render

### Phase 2: Data Integration

1. Add data fetching for logged-in state
2. Handle loading states gracefully
3. Error boundaries for failed fetches

### Phase 3: Polish

1. Smooth transitions between states
2. Loading skeletons
3. Animation consistency with existing Framer Motion usage

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/page.js` | Modify | Add auth check, conditional rendering |
| `components/homepage/GuestHero.jsx` | Create | Extract current hero for guests |
| `components/homepage/AuthHero.jsx` | Create | New personalized hero |
| `components/homepage/LoggedInDashboard.jsx` | Create | Quick resume + recent + stats |

---

## Success Criteria

- [x] Guest sees current marketing homepage (unchanged UX)
- [x] Logged-in user sees personalized hero with greeting
- [x] Quick resume card visible if draft exists
- [x] Last 3 assessments shown with quick actions
- [x] Stats (completed, in-progress, avg score) visible
- [x] Smooth loading states, no layout shift
