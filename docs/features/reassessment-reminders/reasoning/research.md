# Online Research - Initial Discovery

**Feature:** Reassessment Reminders
**Date:** 2025-12-20
**Purpose:** Discover latest approaches before deep planning

## 1. Modern Implementation Approaches

**From Brainstorm Session (Dec 5, 2025):**
- Smart reminders based on building age, earthquake activity, time since assessment
- Visual timeline of all assessments
- Leverages existing cron jobs and push notifications

**Best Practices:**
- Time-based triggers (annual, semi-annual)
- Event-based triggers (after nearby earthquake)
- User preference for frequency
- Non-intrusive notification patterns

## 2. Existing Infrastructure (Already Built)

| Component | Status | Notes |
|-----------|--------|-------|
| Web Push (VAPID) | Ready | Full implementation exists |
| Cron Jobs | Ready | Daily earthquake polling pattern |
| Service Worker | Ready | Handles push display and clicks |
| User Preferences | Ready | Quiet hours, thresholds exist |
| Assessment History | Ready | Full schema with dates |

## 3. Security Considerations

**Already Implemented:**
- CRON_SECRET for securing cron endpoints
- Clerk auth for user context
- VAPID protocol for push security

**For This Feature:**
- Ensure users can only access their own reminders
- Rate limit reminder frequency to prevent spam
- Validate assessment ownership before sending

## 4. UX Best Practices

**Push Notification Best Practices:**
- Clear, actionable message
- Deep link to specific assessment
- Dismiss/snooze options
- Respect quiet hours

**User Expectations:**
- Opt-out capability
- Customizable frequency
- Not too frequent (annually is reasonable default)

## Summary for This Feature

**Recommended approach based on existing infrastructure:**
- Add `reassessmentRemindersEnabled` and `reassessmentFrequencyDays` to UserAlertPreferences
- Create new cron job: `/api/reminders/cron/check-due-assessments` (runs daily)
- Extend AlertSettings UI with reminder toggle and frequency slider
- Reuse existing pushNotificationService for delivery

**Packages needed:**
- None - all infrastructure exists

**Security must-haves:**
- CRON_SECRET validation on cron endpoint
- User ownership validation before reminder creation
- Rate limiting (max 1 reminder per assessment per 30 days)
