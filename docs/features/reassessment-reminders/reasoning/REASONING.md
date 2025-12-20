# Problem Definition: reassessment-reminders

## Problem Statement
Building safety assessments become outdated as structures age, undergo modifications, or experience environmental stress. Users who complete assessments forget to reassess, leaving them with potentially inaccurate safety information. Without proactive reminders, users disengage from the platform after their initial assessment, reducing both their safety awareness and platform retention.

## User Impact
- **Who is affected:** All users with completed assessments (100% of active users)
- **How severely:** Medium - outdated info isn't immediately dangerous but reduces value
- **How frequently:** Continuous degradation over time; peaks at 6-12 months

## Business Impact
- **Revenue impact:** Improved retention = more engaged users = premium conversion potential
- **User retention impact:** 40%+ improvement in monthly active users expected
- **Competitive impact:** No competitors have this - unique retention mechanism

## Scope Boundaries

### Must Have (MVP)
- Daily cron job to check due assessments
- Push notification delivery
- User preference toggle (enable/disable)
- Frequency setting (30/90/365 days)
- Deep link to assessment from notification

### Should Have
- Dashboard badge showing "Due for reassessment"
- Last assessed X days ago indicator
- Dismiss with snooze option

### Won't Have (This Phase)
- Earthquake-triggered reminders
- Email/SMS delivery
- Automatic reassessment questionnaire
- Building change detection AI

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users perceive as spam | Medium | High | Default to annual, respect quiet hours |
| Low notification delivery | Low | Medium | Use existing proven infrastructure |
| Users disable all notifications | Low | Medium | Dashboard fallback indicator |
| Cron job failures | Low | Low | Monitoring and alerting |
