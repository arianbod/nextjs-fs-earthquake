# UX Research: reassessment-reminders

## User Personas

| Persona | Primary Need | Usage Frequency |
|---------|--------------|-----------------|
| Homeowner | Keep family safety info current | Annual reassessment |
| Landlord | Maintain property safety records | Annual per property |
| Tenant | Know if building is still safe | When reminded |
| Property Investor | Portfolio risk monitoring | Annual per building |

## Current State (Without Feature)

- **How users currently solve this:** They don't - assessments age and become outdated
- **Pain points:**
  - No reminder that assessment is old
  - No visual indicator of assessment age
  - Users forget about QuakeWise after initial assessment
- **Time/effort wasted:** Users continue with false sense of security/concern

## Desired User Journey

```
Entry Point --> Dashboard shows "Due for Reassessment" badge
     |
     v
Discovery --> Push notification: "Your building assessment is 1 year old"
     |
     v
First Use --> Click notification, lands on assessment page
     |
     v
Core Flow --> "Start Reassessment" or "Dismiss for now"
     |
     v
Success --> Updated assessment with current data
```

## UX Patterns

### Push Notification
- **Title:** "Reassessment Reminder"
- **Body:** "Your assessment for [Address] is 1 year old. Reassess to keep safety info current."
- **Actions:** "Reassess Now" | "Dismiss"
- **Click:** Deep link to `/result/[id]` with reassessment prompt

### Dashboard Badge
- **Style:** Warning badge on AssessmentCard
- **Text:** "Due for reassessment" or "Last assessed: 14 months ago"
- **Color:** Orange/amber for attention

### Settings UI
- **Location:** Alert Settings page
- **Controls:**
  - Toggle: "Reassessment Reminders" (default: ON)
  - Slider/Select: "Remind me every: 30 days / 90 days / 1 year"

## Platform Considerations
- **Desktop:** Full notification with actions
- **Mobile:** Push notification with deep link
- **RTL:** Supported through existing i18n

## Success Metrics

| Metric | Target |
|--------|--------|
| Reminder-to-reassessment rate | >20% |
| Opt-out rate | <30% |
| Notification delivery rate | >90% |
| User complaints about spam | <1% |
