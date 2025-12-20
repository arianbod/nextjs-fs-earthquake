# Earthquake Lifecycle Hub - Planning Result

## Implementation Guide

### Overview
- **Feature:** earthquake-lifecycle-hub
- **Total tasks:** 25 tasks across 5 phases
- **Estimated complexity:** Medium-High
- **Build order:** Foundation → Before/During/After (parallel possible) → Polish

---

## UI Summary

### New Components: 15
| Component | Complexity |
|-----------|------------|
| SafetyHubPage | Medium |
| BeforePhase | Medium |
| DuringPhase | Low |
| AfterPhase | High |
| PreparednessChecklist | Medium |
| ChecklistItem | Low |
| EmergencyKitGuide | Low |
| BuildingRiskSummary | Low |
| SafetyInstructions | Low |
| InstructionStep | Low |
| AudioPlayer | Medium |
| SafetyCheck | Low |
| DamageAssessmentFlow | High |
| DamageResult | Medium |
| RecoveryResources | Low |

### Reused Components: 7
- Card, Button, Badge, Tabs, Progress, Checkbox, Alert (shadcn/ui)

### Theming Approach
- Use existing theme tokens (90% rule)
- Special high-contrast mode for During phase
- Severity colors for damage assessment

---

## Security Summary

### Risk Level: LOW-MEDIUM

### Key Mitigations
1. Clerk auth on all Safety Hub routes
2. Input validation with Zod schemas
3. Rate limiting on damage assessment
4. Clear disclaimers for liability
5. Content sourced from AFAD/FEMA

### npm audit Status: PASS (existing)

---

## First Milestone

**Task 1.1:** Create Page Structure
- **What:** Create `/safety-hub` page with basic layout
- **Files:**
  - `/app/[locale]/(pages)/safety-hub/page.jsx`
  - `/components/safety-hub/SafetyHubPage.jsx`
- **Done when:** Page renders with placeholder content at `/safety-hub`

---

## Phase Breakdown

### Phase 1: Foundation (4 tasks)
1. Create page structure
2. Add navigation link
3. Add i18n keys
4. Build tab component

### Phase 2: Before Phase (5 tasks)
1. Create container
2. Build checklist
3. LocalStorage persistence
4. Emergency kit guide
5. Connect to assessment

### Phase 3: During Phase (5 tasks)
1. Create container
2. Safety instructions
3. Step navigation
4. Audio playback
5. Offline capability

### Phase 4: After Phase (6 tasks)
1. Create container
2. Safety check
3. Damage assessment flow
4. Add AI damage analysis
5. Result display
6. Recovery resources

### Phase 5: Polish (5 tasks)
1. Mobile testing
2. Accessibility audit
3. i18n verification
4. Performance optimization
5. Final review

---

## Ready to Build Checklist

- [x] Reasoning phase complete
- [x] UI design documented
- [x] Security audit passed
- [x] Tasks defined (25 tasks)
- [x] Dependencies identified
- [x] Build order confirmed
- [x] MVP scope clear
- [x] i18n requirements documented
- [x] Accessibility requirements documented

---

## Key Files to Create

### Pages
- `/app/[locale]/(pages)/safety-hub/page.jsx`

### Components (15 new)
- `/components/safety-hub/*.jsx`

### Hooks
- `/hooks/useChecklistProgress.js`

### Data Files
- `/lib/safety-hub/checklistData.js`
- `/lib/safety-hub/safetyContent.js`
- `/lib/safety-hub/recoveryData.js`

### API Updates
- `/app/api/analyze-image/route.js` (add damage analysis type)
- `/lib/schemas/damageAnalysisSchema.js`

### i18n
- `/messages/en.json` (add SafetyHub section)
- `/messages/tr.json` (add SafetyHub section)

### Audio Assets
- `/public/audio/safety-instructions-en.mp3`
- `/public/audio/safety-instructions-tr.mp3`

---

## Integration Checklist

- [ ] Add `/safety-hub` to Navbar
- [ ] Add `/safety-hub` to protected routes in middleware.ts
- [ ] Update service worker for offline caching
- [ ] Add damage analysis type to AI endpoint
- [ ] Link from Dashboard (post-assessment CTA)

---

## Success Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Hub visits | 50% of assessment users | Analytics |
| Checklist completion | 30%+ complete 1 item | LocalStorage/DB |
| During phase loads | Track during events | Analytics |
| Damage assessments | 10% after events | API logs |

---

## Notes

1. **No new packages required** - leverage existing infrastructure
2. **Offline priority** - During phase must work without network
3. **Mobile-first** - Crisis scenarios are mobile-centric
4. **Accessibility critical** - High-stress users need maximum clarity
5. **Content accuracy** - All safety content from official sources
