# Implementation Tasks: reassessment-reminders

## Phase 1: Database & Schema

- [ ] **1.1:** Update Prisma schema - 15 min
  - Add to UserAlertPreferences:
    - `reassessmentRemindersEnabled Boolean @default(true)`
    - `reassessmentFrequencyDays Int @default(365)`
  - Add to Assessment:
    - `lastReminderSentAt DateTime?`
  - Files: `prisma/schema.prisma`

- [ ] **1.2:** Generate and apply migration - 5 min
  - Run `npx prisma migrate dev --name add-reassessment-reminders`
  - Files: `prisma/migrations/`

## Phase 2: Core Logic

- [ ] **2.1:** Create reminder service - 30 min
  - Query for due assessments
  - Check user preferences
  - Respect quiet hours
  - Create notification payload
  - Files: `lib/reminders/reminderService.js`

- [ ] **2.2:** Create cron endpoint - 20 min
  - GET /api/reminders/cron/check-due-assessments
  - Validate CRON_SECRET
  - Call reminderService
  - Return metrics
  - Files: `app/api/reminders/cron/check-due-assessments/route.js`

- [ ] **2.3:** Add cron to vercel.json - 5 min
  - Schedule: `0 8 * * *` (daily 8 AM UTC)
  - Files: `vercel.json`

## Phase 3: API Endpoints

- [ ] **3.1:** Create preferences API - 20 min
  - GET/PUT /api/reminders/preferences
  - Clerk auth required
  - Input validation with Zod
  - Files: `app/api/reminders/preferences/route.js`

## Phase 4: UI Components

- [ ] **4.1:** Extend AlertSettings component - 30 min
  - Add reassessment section
  - Toggle for enable/disable
  - Frequency selector (30/90/180/365 days)
  - Files: `components/alerts/AlertSettings.jsx`

- [ ] **4.2:** Add "due" badge to AssessmentCard - 20 min
  - Calculate days since completion
  - Compare with user's frequency setting
  - Show amber badge if due
  - Files: `components/dashboard/AssessmentCard.jsx`

- [ ] **4.3:** Update useAlerts hook - 15 min
  - Add reassessment preferences to hook
  - Add update function
  - Files: `hooks/useAlerts.js`

## Phase 5: i18n

- [ ] **5.1:** Add English translations - 10 min
  - Files: `messages/en.json`

- [ ] **5.2:** Add Turkish translations - 10 min
  - Files: `messages/tr.json`

## Phase 6: Service Worker

- [ ] **6.1:** Handle reassessment notification clicks - 15 min
  - Deep link to /result/[id]?reassess=true
  - Files: `public/sw.js`

## Phase 7: Testing

- [ ] **7.1:** Manual testing - 30 min
  - [ ] Settings toggle works
  - [ ] Frequency selector saves
  - [ ] Badge appears on old assessments
  - [ ] Cron endpoint returns correct data

## Task Dependencies
```
1.1 --> 1.2 --> 2.1 --> 2.2 --> 2.3
                 |
                 v
              3.1 --> 4.1 --> 4.2 --> 4.3
                              |
                              v
                           5.1 --> 5.2 --> 6.1 --> 7.1
```

## Estimated Total
- Tasks: 13
- Estimated time: ~3.5 hours
- Complexity: Low-Medium
