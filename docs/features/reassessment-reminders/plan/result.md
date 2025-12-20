# Reassessment Reminders - Planning Result

## Implementation Guide

### Overview
- Feature: reassessment-reminders
- Total tasks: 13
- Estimated time: ~3.5 hours
- Complexity: Low-Medium
- Build order: Database -> Logic -> API -> UI -> i18n -> SW -> Test

### UI Summary
- New components: 1 (ReassessmentBadge - inline in AssessmentCard)
- Extended components: 2 (AlertSettings, AssessmentCard)
- Theming: Uses existing Tailwind tokens (amber-500 for warning)

### Security Summary
- Risk level: Low
- npm audit: PASS (0 vulnerabilities)
- Key mitigations:
  - CRON_SECRET for cron endpoint
  - Clerk auth for user endpoints
  - Zod validation for input
  - Rate limit: 1 reminder per assessment per 30 days

### Database Changes
- UserAlertPreferences: +2 fields
- Assessment: +1 field
- No new tables
- Migration is backward compatible

### First Milestone
**Task 1.1:** Update Prisma schema
- What: Add 3 new fields to existing models
- Files: prisma/schema.prisma
- Done when: Schema compiles, migration ready

### Files to Create
1. `lib/reminders/reminderService.js`
2. `app/api/reminders/cron/check-due-assessments/route.js`
3. `app/api/reminders/preferences/route.js`

### Files to Modify
1. `prisma/schema.prisma`
2. `vercel.json`
3. `components/alerts/AlertSettings.jsx`
4. `components/dashboard/AssessmentCard.jsx`
5. `hooks/useAlerts.js`
6. `messages/en.json`
7. `messages/tr.json`
8. `public/sw.js`

### Ready to Build Checklist
- [x] Reasoning phase complete
- [x] UI design approved (uses existing patterns)
- [x] Security audit passed (0 vulnerabilities)
- [x] Tasks defined (13 tasks)
- [x] Dependencies identified (existing push infrastructure)
- [x] Build order confirmed
