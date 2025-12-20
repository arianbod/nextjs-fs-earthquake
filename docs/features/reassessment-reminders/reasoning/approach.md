# Technical Approach: reassessment-reminders

## Summary
Extend the existing earthquake alert infrastructure to support reassessment reminders. Add new database fields for reminder preferences, create a daily cron job to check due assessments, and extend the UI for user configuration.

## Key Technical Decisions

### Decision 1: Database Schema Approach

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Extend UserAlertPreferences | Simple, uses existing model | Couples alert and reminder prefs |
| New ReassessmentPreferences model | Clean separation | More complexity |
| Store in Assessment model | Per-assessment control | Redundant for same user |

**Chosen:** Extend UserAlertPreferences
- Add `reassessmentRemindersEnabled` (Boolean, default true)
- Add `reassessmentFrequencyDays` (Int, default 365)
- Simple, leverages existing infrastructure

### Decision 2: Reminder Tracking

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Track in Assessment | Simple query | Modifies core model |
| New ReassessmentReminder table | Clean separation, status tracking | More joins |
| Compute on-the-fly | No storage | Expensive queries |

**Chosen:** Add fields to Assessment model
- Add `lastReminderSentAt` (DateTime?, nullable)
- Avoids duplicate notifications
- Simple single-table query for due assessments

### Decision 3: Cron Frequency

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Every minute (like earthquakes) | Fast delivery | Wasteful, expensive |
| Hourly | Good balance | Still frequent |
| Daily at 8 AM | Efficient, user-friendly time | 24-hour delay max |

**Chosen:** Daily at 8 AM local time (UTC as fallback)
- Schedule: `0 8 * * *`
- Most users receive at reasonable hour
- Efficient resource usage

## Architecture

```
[Vercel Cron]
    |
    v (daily 8 AM)
[/api/reminders/cron/check-due-assessments]
    |
    v
[reminderService.checkDueAssessments()]
    |
    +---> Query: Assessments where completedAt < (now - frequencyDays)
    |           AND lastReminderSentAt is NULL or < 30 days ago
    |           AND user.reassessmentRemindersEnabled = true
    |
    v
[For each due assessment]
    |
    v
[pushNotificationService.sendNotification()]
    |
    v
[Update assessment.lastReminderSentAt]
```

## Files to Create

| File | Purpose |
|------|---------|
| `lib/reminders/reminderService.js` | Core reminder logic |
| `app/api/reminders/cron/check-due-assessments/route.js` | Cron endpoint |
| `app/api/reminders/preferences/route.js` | User preferences API |

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add fields to UserAlertPreferences and Assessment |
| `components/alerts/AlertSettings.jsx` | Add reminder toggle and frequency |
| `components/dashboard/AssessmentCard.jsx` | Add "due for reassessment" badge |
| `vercel.json` | Add new cron job |
| `public/sw.js` | Handle reminder notification clicks |

## Security Approach
- **Cron endpoint:** Validate CRON_SECRET header
- **User preferences:** Clerk auth required
- **Data access:** Users can only access their own assessments
- **Rate limiting:** Max 1 reminder per assessment per 30 days

## Integration Points
- **pushNotificationService.js:** Reuse for notification delivery
- **UserAlertPreferences:** Extend for reminder settings
- **Assessment model:** Add reminder tracking field
- **AlertSettings component:** Extend UI
