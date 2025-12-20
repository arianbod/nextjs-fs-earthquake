# Core Idea: reassessment-reminders

## The Idea
Smart reminders that notify users when their building assessments are due for reassessment, based on time elapsed and configurable user preferences.

## Problem It Solves
Building conditions change over time through renovations, aging, weather damage, and seismic events. Old assessments become outdated, giving users a false sense of security or unnecessary concern. Users forget to reassess and lose the benefit of having current safety information.

## Value Proposition
- **For users:** Always have up-to-date safety information without having to remember; peace of mind that building assessments reflect current conditions
- **For business:** Increased user retention and engagement; users return regularly to the platform

## Alignment Check
- [x] Aligns with WHO - building owners/tenants with completed assessments
- [x] Solves WHAT - outdated assessments, forgotten reassessments
- [x] Fits WHY - retention is critical as user base grows
- [x] Works with HOW - extends existing notification infrastructure

## Scope

### In Scope (MVP)
- Time-based reminders (configurable frequency: 30/60/90/365 days)
- Push notification delivery
- User preference for enable/disable
- Dismiss/snooze functionality
- Dashboard indicator for due assessments

### Out of Scope (Future)
- Earthquake-triggered reminders
- Email reminder delivery
- SMS reminder delivery
- Automatic reassessment questionnaire
- Building change detection

### MVP Version
1. Daily cron job checks for assessments due for reassessment
2. Creates push notifications for eligible users
3. Users can dismiss or click to start reassessment
4. Settings UI to configure frequency and enable/disable
