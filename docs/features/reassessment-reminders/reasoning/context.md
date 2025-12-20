# Project Context - Reassessment Reminders

## Project Overview
- Framework: Next.js 16.1 with App Router
- Architecture: App Router with API routes
- Key folders: app/, components/, lib/, services/, prisma/

## Relevant Project Areas

### Existing Infrastructure to Leverage

| Component | Location | Can Reuse |
|-----------|----------|-----------|
| Push Notification Service | `services/pushNotificationService.js` | Full reuse |
| Cron Job Pattern | `app/api/alerts/cron/poll-earthquakes/` | Template for new cron |
| Alert Preferences | `app/api/alerts/preferences/` | Extend for reminders |
| Service Worker | `public/sw.js` | Add reminder click handler |
| Alert Settings UI | `components/alerts/AlertSettings.jsx` | Extend UI |
| Dashboard | `components/dashboard/` | Add badges/status |

### Database Models

**Assessment Model** (existing):
- `id`, `userId`, `createdAt`, `completedAt`, `status`
- Has `Location`, `BuildingInfo`, `SafetyResult` relations

**UserAlertPreferences Model** (existing):
- `minMagnitude`, `maxDistanceKm`, `quietHoursStart/End`
- **Extend with:** `reassessmentRemindersEnabled`, `reassessmentFrequencyDays`

**New Models Needed**:
- `ReassessmentReminder` - Track scheduled reminders per assessment

### Files That Will Be Affected

| File/Folder | Change Type | Confidence |
|-------------|-------------|------------|
| `prisma/schema.prisma` | Extend models | High |
| `app/api/reminders/` | New endpoints | High |
| `lib/reminders/` | New logic | High |
| `components/alerts/AlertSettings.jsx` | Extend UI | High |
| `components/dashboard/AssessmentCard.jsx` | Add badge | Medium |
| `vercel.json` | Add cron job | High |
| `public/sw.js` | Handle clicks | Medium |

## Impact Map
```
New Feature: reassessment-reminders
      |
      +---> Direct Changes
      |     +-- prisma/schema.prisma (extend models)
      |     +-- app/api/reminders/ (new routes)
      |     +-- lib/reminders/ (new logic)
      |     +-- vercel.json (new cron)
      |
      +---> UI Extensions
      |     +-- components/alerts/AlertSettings.jsx
      |     +-- components/dashboard/AssessmentCard.jsx
      |
      +---> Shared Infrastructure (reuse)
            +-- services/pushNotificationService.js
            +-- public/sw.js
            +-- app/api/alerts/preferences/
```

## Patterns to Follow
- **API Style:** REST with Next.js App Router route handlers
- **Auth Pattern:** Clerk with `auth()` and `currentUser()`
- **Database:** Prisma with PostgreSQL
- **Cron Security:** CRON_SECRET header validation
- **Push Notifications:** VAPID-based web push

## Reusable Existing Code
- [x] `pushNotificationService.js` - Full reuse for delivery
- [x] `eventProcessor.js` - Pattern for processing logic
- [x] `AlertSettings.jsx` - Extend for reminder preferences
- [x] Cron route pattern - Template for daily reminder check
- [x] `AssessmentCard.jsx` - Add reassessment status
