# Reassessment Reminders - Reasoning Result

## Original Direction (CHECKPOINT - DO NOT EDIT AFTER CREATION)
**Date:** 2025-12-20
**Feature:** reassessment-reminders

### The Feature
Smart reminders that notify users when their building assessments are due for reassessment, based on configurable time intervals (default: 1 year).

### The Problem
Building assessments become outdated as structures age and conditions change. Users forget to reassess, leaving them with stale safety information and reducing platform engagement.

### The Users
- Homeowners wanting current family safety info
- Landlords maintaining property records
- Tenants checking ongoing building safety
- Property investors monitoring portfolio risk

### The Approach
1. Extend existing database models (UserAlertPreferences, Assessment)
2. Create daily cron job to check due assessments
3. Reuse pushNotificationService for delivery
4. Extend AlertSettings UI for user preferences
5. Add dashboard badges for visual indication

## Key Decisions Made
1. **Database:** Extend existing models (not new tables)
2. **Cron frequency:** Daily at 8 AM (not per-minute)
3. **Default frequency:** 365 days (annual)
4. **Delivery:** Push notifications only (email in Phase 2)

## Success Criteria
- [ ] 20%+ reminder-to-reassessment conversion rate
- [ ] <30% user opt-out rate
- [ ] >90% notification delivery rate

## Risks Identified
- Spam perception (mitigated by annual default, quiet hours)
- Low engagement (mitigated by dashboard fallback)

## Ready for Planning?
- [x] Problem clearly defined
- [x] Users identified
- [x] Technical approach chosen
- [x] Security considered
- [x] Scope bounded

**Status:** READY FOR PHASE 2 (PLANNING)
