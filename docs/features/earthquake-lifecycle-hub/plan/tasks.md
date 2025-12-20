# Implementation Tasks: earthquake-lifecycle-hub

## Phase 1: Foundation

### 1.1 Create Page Structure
- Files:
  - `/app/[locale]/(pages)/safety-hub/page.jsx`
  - `/components/safety-hub/SafetyHubPage.jsx`
- Create main page with basic layout
- Add protected route to middleware.ts

### 1.2 Add Navigation Link
- Files:
  - `/components/navigation/Navbar.jsx`
- Add "Safety Hub" link to main navigation
- Add icon (Shield or similar)

### 1.3 Add i18n Keys
- Files:
  - `/messages/en.json`
  - `/messages/tr.json`
- Add SafetyHub section with all required translations
- Subsections: title, before, during, after

### 1.4 Build Tab Component
- Files:
  - `/components/safety-hub/SafetyHubPage.jsx`
- Implement Before/During/After tabs
- Handle tab state and routing (#before, #during, #after)

---

## Phase 2: Before Phase

### 2.1 Create BeforePhase Container
- Files:
  - `/components/safety-hub/BeforePhase.jsx`
- Layout for preparedness content
- Show user's building risk summary

### 2.2 Build Checklist Component
- Files:
  - `/components/safety-hub/PreparednessChecklist.jsx`
  - `/components/safety-hub/ChecklistItem.jsx`
  - `/lib/safety-hub/checklistData.js`
- Define checklist categories and items
- Interactive checkboxes
- Progress calculation

### 2.3 Implement LocalStorage Persistence
- Files:
  - `/hooks/useChecklistProgress.js`
- Save/load checklist state to LocalStorage
- Handle first-time users (empty state)

### 2.4 Create Emergency Kit Guide
- Files:
  - `/components/safety-hub/EmergencyKitGuide.jsx`
- List of essential items with quantities
- Adjustable for family size
- Visual cards layout

### 2.5 Connect to User Assessment
- Files:
  - `/components/safety-hub/BuildingRiskSummary.jsx`
- Fetch user's latest assessment
- Display risk level and address
- Link to full assessment result

---

## Phase 3: During Phase

### 3.1 Create DuringPhase Container
- Files:
  - `/components/safety-hub/DuringPhase.jsx`
- Full-screen layout for crisis mode
- Hide navigation on mobile

### 3.2 Build Safety Instructions
- Files:
  - `/components/safety-hub/SafetyInstructions.jsx`
  - `/lib/safety-hub/safetyContent.js`
- DROP-COVER-HOLD ON steps
- Illustrated with icons
- Large, accessible text

### 3.3 Add Step Navigation
- Files:
  - `/components/safety-hub/InstructionStep.jsx`
- Swipeable steps on mobile
- Arrow navigation on desktop
- Step indicator dots

### 3.4 Implement Audio Playback
- Files:
  - `/components/safety-hub/AudioPlayer.jsx`
  - `/public/audio/safety-instructions-en.mp3`
  - `/public/audio/safety-instructions-tr.mp3`
- Play/pause button
- Web Audio API
- Pre-load audio for offline

### 3.5 Ensure Offline Capability
- Files:
  - `/public/sw.js` (update)
- Cache During phase content
- Cache audio files
- Test offline functionality

---

## Phase 4: After Phase

### 4.1 Create AfterPhase Container
- Files:
  - `/components/safety-hub/AfterPhase.jsx`
- Layout for damage assessment flow
- Initial safety check prompt

### 4.2 Build Safety Check Component
- Files:
  - `/components/safety-hub/SafetyCheck.jsx`
- "Is everyone safe?" question
- Emergency call button (112)
- Proceed to damage assessment

### 4.3 Create Damage Assessment Flow
- Files:
  - `/components/safety-hub/DamageAssessmentFlow.jsx`
  - `/components/safety-hub/PhotoUploader.jsx`
- Photo upload UI (1-3 photos)
- Photo preview with remove option
- Tips on what to photograph

### 4.4 Add Damage Analysis to AI
- Files:
  - `/app/api/analyze-image/route.js` (update)
  - `/lib/ai/structuredOutputs.js` (update)
  - `/lib/schemas/damageAnalysisSchema.js` (create)
- Add `analysisType: 'damage_assessment'`
- Create damage-specific prompt
- Define output schema (severity, recommendations)

### 4.5 Build Damage Result Display
- Files:
  - `/components/safety-hub/DamageResult.jsx`
- Severity badge (Low/Moderate/High/Severe)
- AI-generated recommendations
- Legal disclaimer
- CTA: Start full reassessment

### 4.6 Create Recovery Resources
- Files:
  - `/components/safety-hub/RecoveryResources.jsx`
  - `/lib/safety-hub/recoveryData.js`
- Emergency numbers (AFAD, fire, ambulance)
- Link to reassessment flow
- External resources

---

## Phase 5: Polish

### 5.1 Mobile Testing
- Test on iOS Safari
- Test on Android Chrome
- Verify touch targets (48px)
- Test swipe gestures

### 5.2 Accessibility Audit
- [ ] Run Lighthouse accessibility
- [ ] Test with screen reader
- [ ] Verify keyboard navigation
- [ ] Check color contrast
- [ ] Test high contrast mode

### 5.3 i18n Verification
- [ ] All keys present in en.json
- [ ] All keys present in tr.json
- [ ] No missing translations
- [ ] Test language switching

### 5.4 Performance Optimization
- [ ] Lazy load phase content
- [ ] Optimize images
- [ ] Check bundle size
- [ ] Test loading states

### 5.5 Final Review
- [ ] Code review
- [ ] Security checklist
- [ ] UX review
- [ ] Content accuracy

---

## Task Dependencies

```
1.1 → 1.2 → 1.3 → 1.4
                  ↓
         ┌───────┼───────┐
         ↓       ↓       ↓
        2.1     3.1     4.1
         ↓       ↓       ↓
        2.2     3.2     4.2
         ↓       ↓       ↓
        2.3     3.3     4.3
         ↓       ↓       ↓
        2.4     3.4     4.4
         ↓       ↓       ↓
        2.5     3.5     4.5
                         ↓
                        4.6
                         ↓
                ┌────────┼────────┐
                ↓        ↓        ↓
               5.1      5.2      5.3
                         ↓
                        5.4
                         ↓
                        5.5
```

---

## Estimated Breakdown

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1: Foundation | 4 tasks | Low |
| Phase 2: Before | 5 tasks | Medium |
| Phase 3: During | 5 tasks | Medium |
| Phase 4: After | 6 tasks | High |
| Phase 5: Polish | 5 tasks | Medium |
| **Total** | **25 tasks** | **Medium-High** |

---

## MVP vs Post-MVP

### MVP (Include Now)
- [x] All Phase 1 tasks
- [x] Tasks 2.1-2.4 (checklist, no DB sync)
- [x] All Phase 3 tasks
- [x] Tasks 4.1-4.6
- [x] All Phase 5 tasks

### Post-MVP (Future)
- [ ] Task 2.5 extension: Sync checklist to database
- [ ] PDF export of checklist/kit
- [ ] Community damage map
- [ ] Full PWA with service worker
- [ ] Family communication plan builder
- [ ] Gamification (badges, streaks)
