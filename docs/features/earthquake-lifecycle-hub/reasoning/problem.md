# Problem Definition: earthquake-lifecycle-hub

## Problem Statement

QuakeWise users complete building assessments but receive no guidance on earthquake preparedness, real-time safety actions, or post-earthquake damage evaluation. This creates a dangerous gap between knowing their building's risk level and knowing what to actually DO before, during, and after an earthquake. Users are left to search for generic online resources that aren't connected to their specific situation.

---

## User Impact

### Who is Affected
- **Primary:** Users who completed building assessments in Turkey
- **Secondary:** Family members of assessed building occupants
- **Tertiary:** Anyone in earthquake-prone regions seeking guidance

### How Severely
- **Before:** Medium - missed preparation leads to preventable harm
- **During:** Critical - wrong actions during shaking cause injuries
- **After:** High - incorrect damage assessment leads to unsafe re-occupation

### How Frequently
- **Before Phase:** Ongoing need (should check quarterly)
- **During Phase:** Rare but critical (actual earthquakes)
- **After Phase:** Moderate (significant events in Turkey occur several times/year)

---

## Business Impact

### Revenue Impact
- **Direct:** None initially (feature included in free tier)
- **Future:** Premium preparedness content, emergency kit affiliates
- **Indirect:** Higher retention = more users = more viral sharing

### User Retention Impact
- **High impact** - Currently users complete assessment and leave
- Safety Hub creates recurring engagement touchpoint
- Estimated: 30% increase in monthly active users

### Competitive Impact
- **Strong differentiator** - No competitor offers full lifecycle
- Positions QuakeWise as comprehensive safety platform
- Creates switching cost (users invested in their preparedness data)

---

## Scope Boundaries

### Must Have (MVP)
- [x] Before: Interactive preparedness checklist
- [x] Before: Emergency kit guide
- [x] Before: Connection to user's building assessment
- [x] During: Full-screen safety instructions (offline)
- [x] During: Audio playback option
- [x] After: Photo-based damage assessment
- [x] After: AI damage analysis
- [x] After: Recovery resources (Turkey-specific)
- [x] i18n: English and Turkish translations
- [x] Mobile-first responsive design

### Should Have (Post-MVP)
- [ ] Before: Family communication plan template
- [ ] Before: PDF export of all content
- [ ] During: Haptic feedback for hearing impaired
- [ ] After: Link to professional engineer network
- [ ] After: Community damage aggregation map
- [ ] PWA: Full offline mode with service worker

### Won't Have (Out of Scope)
- [ ] Real-time earthquake detection (exists in Alerts)
- [ ] Family check-in system (separate feature)
- [ ] Insurance claim processing
- [ ] Multi-hazard support (tsunami, fire)
- [ ] Professional verification workflow

---

## Assumptions

| Assumption | Needs Validation |
|------------|------------------|
| Users will engage with preparedness content before events | Yes - A/B test engagement |
| Photo-based damage assessment is valuable without professional review | Yes - user feedback |
| Static "during" guidance is sufficient (vs real-time coaching) | No - industry standard |
| Users have camera access during/after earthquakes | No - standard capability |
| 3 photos sufficient for AI damage assessment | Yes - test accuracy |
| Turkey AFAD guidelines are applicable | No - official source |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users ignore preparedness until after earthquake | High | Medium | Gamification, reminders, post-assessment CTA |
| AI damage assessment gives false confidence | Medium | High | Clear disclaimers, recommend professional inspection |
| Offline mode too complex for MVP | Medium | Medium | Start with static content, add PWA incrementally |
| Content becomes outdated | Low | Medium | Annual review cycle, source official guidelines |
| Liability for safety advice | Medium | High | Source all content from FEMA/AFAD, add disclaimers |
| Mobile camera fails during crisis | Low | Low | Text fallback, manual damage description |

---

## Success Definition

### Quantitative
- 50% of assessment completers visit Safety Hub within 30 days
- 30% complete at least one preparedness checklist item
- 20% download/print emergency resources
- Post-earthquake damage assessments used during real events

### Qualitative
- Users report feeling more prepared
- Positive feedback on "During" phase clarity
- Users trust AI damage assessment as first step
- Feature mentioned in user referrals
