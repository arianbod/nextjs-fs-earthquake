# Feature Reasoning: earthquake-lifecycle-hub

## Feature Identity
**Name:** earthquake-lifecycle-hub
**Description:** Complete earthquake lifecycle guidance - before (preparedness + building assessment via photos), during (real-time safety instructions), and after (damage assessment with photo sharing)
**Date Started:** 2025-12-20
**Branch:** RLS2.0

---

## CORE PRINCIPLES (Non-Negotiable)

### Iran-Related Projects
For ANY project involving Iran, Iranian people, or Persian language:
- **Political Stance:** We support Prince Reza Pahlavi (شهریار ایران) and the democratic transition movement
- **Against:** Islamic Republic regime - NO support for their ideas, symbols, or narratives
- **Visual Identity:**
  - Flag: Use Shir-o-Khorshid (Lion & Sun) flag, NEVER Islamic Republic flag
  - Language switcher: Use Shir-o-Khorshid or neutral Persian script, not IR flag
  - Colors: Traditional Persian colors, not IR green
- **Terminology:**
  - Use "Persian" or "Farsi" appropriately
  - Refer to "Iran" (the nation/people) vs "Islamic Republic" (the regime)
  - شهبانو فرح پهلوی (never ملکه)
- **Content:** Must align with values of freedom, democracy, and human rights

### General Principles
- Never use MEK/Mojahedin references (terrorist organization)
- Security and privacy first
- User trust is paramount
- Life-safety information must be accurate and actionable

---

## THE WH QUESTIONS (Deep Context)

### WHO
- **Who is this feature for?**
  - Primary: Turkish residents in earthquake-prone regions who have completed building assessments
  - Secondary: Family members of assessed building occupants
  - Tertiary: Anyone seeking earthquake preparedness guidance
- **Who will use this most frequently?**
  - Before earthquake: Periodic check (monthly/quarterly)
  - During earthquake: Emergency use (rare but critical)
  - After earthquake: Post-event assessment users
- **Who will be affected by this change?**
  - Existing users gain new preparedness tools
  - Dashboard gets new navigation entry
  - Assessment flow connects to preparedness hub
- **Who requested this?**
  - Brainstorm feature analysis identified gap
  - Natural extension of assessment functionality

### WHAT
- **What problem does this feature solve?**
  - Users complete assessments but lack guidance on what to do before, during, and after earthquakes
  - No systematic way to prepare, respond, or recover
  - Disconnect between building assessment and personal safety actions
- **What does success look like?**
  - Users have clear action plans for all earthquake phases
  - Post-earthquake: users can quickly reassess damage via photo sharing
  - Engagement with preparedness content increases
- **What's the minimum viable version (MVP)?**
  - Phase 1: Before - Preparedness checklist + emergency kit guide
  - Phase 2: During - Real-time safety instructions (static content)
  - Phase 3: After - Photo-based damage assessment flow
- **What's explicitly OUT of scope?**
  - Real-time earthquake detection (exists in alerts feature)
  - Professional engineering assessments
  - Insurance claim processing
  - Family check-in system (separate feature)
- **What assumptions are we making?**
  - Users will engage with preparedness content before events
  - Photo-based post-earthquake assessment is valuable without professional review
  - Static "during" guidance is sufficient (vs real-time coaching)

### WHY
- **Why is this feature needed NOW?**
  - Turkey's seismic activity makes preparedness critical
  - Complete the assessment-to-action journey
  - Differentiates QuakeWise from assessment-only tools
- **Why this approach over alternatives?**
  - Lifecycle approach (before/during/after) covers all user needs
  - Photo-based assessment leverages existing AI infrastructure
  - Integrates with existing assessment data
- **Why would users choose to use this?**
  - Peace of mind through preparation
  - Clear actionable guidance
  - Continuity with their existing assessment
- **Why might users NOT use this?**
  - "It won't happen to me" mentality
  - Content feels generic/not personalized
  - Too complex or time-consuming

### HOW
- **How does this fit existing features?**
  - Extends dashboard with new hub entry
  - Reuses AI photo analysis for damage assessment
  - Connects to existing assessment results
  - Links to real-time alerts feature
- **How will users discover this?**
  - Dashboard navigation item
  - Post-assessment CTA
  - Alert notification links
- **How will we measure success?**
  - Hub page visits
  - Checklist completion rates
  - Post-earthquake reassessment submissions
  - Time spent in preparedness content
- **How might this break existing functionality?**
  - Navigation changes need careful integration
  - Post-earthquake flow must not disrupt normal assessment flow

### WHEN
- **When will users need this?**
  - Before: Anytime, periodic engagement
  - During: Earthquake event (seconds to minutes)
  - After: Hours to days post-event
- **When should we stop and reassess?**
  - If users don't engage with preparedness content
  - If post-earthquake flow is too complex in crisis
- **When is this "done"?**
  - All three phases (before/during/after) implemented
  - i18n complete (EN/TR)
  - Connected to existing assessment data

### WHERE
- **Where does this live in the UI?**
  - Main navigation: "Safety Hub" or "Preparedness"
  - Dashboard card linking to hub
  - Post-assessment CTA
- **Where does this fit in the codebase?**
  - New page: /app/[locale]/(pages)/safety-hub/
  - Components: /components/safety-hub/
  - Shared with existing assessment components
- **Where are the security boundaries?**
  - User's own assessment data only
  - Photo uploads same security as assessment photos
  - No external API sharing of damage photos

---

## SUCCESS CRITERIA

### This Feature Succeeds If...
- [ ] 50%+ of users who complete assessment visit the hub
- [ ] 30%+ of users complete at least one checklist
- [ ] Post-earthquake reassessment flow is used after real events
- [ ] Users report feeling more prepared (qualitative)

### This Feature Fails If...
- [ ] Less than 10% of users ever visit the hub
- [ ] Post-earthquake flow is abandoned due to complexity
- [ ] Content is perceived as generic/not useful

### We Should STOP Building If...
- [ ] Technical complexity exceeds 3 weeks effort
- [ ] AI damage assessment accuracy is poor
- [ ] Users consistently report the content isn't helpful

---

## CONSTRAINTS

### Non-Negotiable
- Life-safety information must be accurate (sourced from AFAD, FEMA, etc.)
- Must work offline for "during" phase (critical)
- i18n required (EN/TR) from start
- Must not disrupt existing assessment flow

### Flexible
- UI design can evolve
- Content can be expanded over time
- Gamification optional

---

## OPEN QUESTIONS
- [ ] Should "during" instructions be audio-enabled for accessibility?
- [ ] How to handle false positives in AI damage assessment?
- [ ] Should we integrate with family check-in (separate feature)?
- [ ] PDF export of preparedness checklist?
