# Technical Approach: earthquake-lifecycle-hub

## Summary

Build a three-phase Safety Hub using Next.js App Router with:
1. **Before Phase:** Interactive checklists with progress persistence
2. **During Phase:** Static offline-capable content with audio
3. **After Phase:** Photo upload with existing AI analysis pipeline

Leverage existing infrastructure (AI, i18n, components) while adding minimal new complexity.

---

## Key Technical Decisions

### Decision 1: Page Structure

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Single page with tabs | Simple, less navigation | All content loads at once |
| Separate pages per phase | Clean URLs, lazy loading | More navigation complexity |
| Tabbed single page (chosen) | Best UX, easy to switch phases | Moderate complexity |

**Chosen:** Single page with Tab component
- URL: `/safety-hub` with hash anchors `#before`, `#during`, `#after`
- Lazy load phase content on tab switch
- Maintains context while switching phases

### Decision 2: Checklist Storage

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| LocalStorage only | Simple, no API | Lost on device change |
| Database via API | Persistent, synced | API calls, complexity |
| Hybrid (chosen) | Best of both | Moderate complexity |

**Chosen:** Hybrid approach
- Store in LocalStorage for immediate UX
- Optionally sync to database for logged-in users
- Use existing Prisma setup if adding model

### Decision 3: AI Damage Assessment

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| New AI endpoint | Optimized prompts | Duplicate code |
| Reuse existing (chosen) | Less code, proven | May need prompt tweaks |
| Third-party service | Specialized | Cost, dependency |

**Chosen:** Reuse `/api/analyze-image` with new `analysisType`
- Add `analysisType: 'damage_assessment'` parameter
- Create damage-specific prompt in `lib/ai/structuredOutputs.js`
- Return severity classification + recommendations

### Decision 4: Offline Support

**Options considered:**

| Option | Pros | Cons |
|--------|------|------|
| Full PWA (Workbox) | Complete offline | Complex, longer timeline |
| Static content only (chosen) | Simple, MVP-ready | Limited offline features |
| No offline | Simplest | Fails in crisis |

**Chosen:** Static content for During phase (MVP)
- Pre-render During phase content
- No API calls required during crisis
- Add full PWA post-MVP

---

## Architecture

```
/app/[locale]/(pages)/safety-hub/
├── page.jsx                    # Main hub page with tabs
├── layout.jsx                  # Hub-specific layout (optional)
└── components/
    # or use /components/safety-hub/

/components/safety-hub/
├── SafetyHubPage.jsx          # Main container with tabs
├── BeforePhase.jsx            # Preparedness content
├── DuringPhase.jsx            # Safety instructions
├── AfterPhase.jsx             # Damage assessment
├── PreparednessChecklist.jsx  # Interactive checklist
├── EmergencyKitGuide.jsx      # Kit builder
├── DamageAssessmentFlow.jsx   # Photo upload + AI
├── RecoveryResources.jsx      # Post-earthquake resources
└── SafetyInstructions.jsx     # DROP-COVER-HOLD content
```

---

## Data Flow

### Before Phase (Checklist)
```
User checks item
     ↓
Update local state
     ↓
Save to LocalStorage (immediate)
     ↓
If logged in: Sync to API (background)
     ↓
Show progress update
```

### After Phase (Damage Assessment)
```
User takes photo(s)
     ↓
Preview + confirm
     ↓
POST /api/analyze-image (analysisType: damage_assessment)
     ↓
AI analyzes with damage prompt
     ↓
Return severity + recommendations
     ↓
Display results + next steps
```

---

## Packages Selected

| Package | Version | Purpose | Already Installed |
|---------|---------|---------|-------------------|
| next | 16.1.0 | Framework | Yes |
| react | 19.x | UI | Yes |
| @tanstack/react-query | 5.x | Data fetching | Yes |
| next-intl | 3.x | i18n | Yes |
| sonner | 2.x | Toasts | Yes |
| lucide-react | latest | Icons | Yes |
| framer-motion | 11.x | Animations | Yes |

**No new packages required for MVP.**

---

## Security Approach

### Authentication
- Safety Hub accessible to logged-in users only
- Add `/safety-hub` to protected routes in middleware.ts
- Checklist data tied to userId

### Authorization
- Users can only access their own checklist data
- Damage photos stored with userId association

### Data Protection
- Damage photos processed in memory, not stored permanently
- Checklist progress is non-sensitive
- No PII beyond existing user data

### Content Safety
- All safety guidance sourced from AFAD/FEMA
- Disclaimers on AI damage assessment
- "Consult professional" recommendations

---

## Integration Points

### Existing Code to Modify
1. `/components/navigation/Navbar.jsx` - Add Safety Hub link
2. `/middleware.ts` - Add `/safety-hub` to protected routes
3. `/messages/en.json` - Add SafetyHub translations
4. `/messages/tr.json` - Add SafetyHub translations
5. `/app/api/analyze-image/route.js` - Add damage analysis type

### New Code to Create
1. `/app/[locale]/(pages)/safety-hub/page.jsx` - Main page
2. `/components/safety-hub/*.jsx` - All hub components
3. Checklist data in LocalStorage (no new API initially)

### APIs to Use
- `/api/analyze-image` - Damage photo analysis
- `/api/assessment/history` - Get user's assessments for context

---

## Rejected Alternatives

| Alternative | Why Rejected |
|-------------|--------------|
| Separate app/microsite | Unnecessary complexity, breaks UX flow |
| React Native for mobile | Existing web app is mobile-responsive |
| Third-party content CMS | Adds dependency, content is relatively static |
| Real-time coaching during earthquake | Over-engineered, static content is proven |
| Full PWA for MVP | Timeline too long, add incrementally |

---

## Implementation Order

1. **Phase 1: Foundation**
   - Create page structure and navigation
   - Add i18n keys
   - Build tab UI

2. **Phase 2: Before Phase**
   - Build checklist component
   - Add LocalStorage persistence
   - Create emergency kit guide
   - Connect to user assessment

3. **Phase 3: During Phase**
   - Build full-screen instructions
   - Add audio playback
   - Ensure offline capability (static)

4. **Phase 4: After Phase**
   - Build damage assessment flow
   - Add damage analysis to AI endpoint
   - Create results display
   - Add recovery resources

5. **Phase 5: Polish**
   - Accessibility audit
   - Mobile testing
   - i18n verification
   - Performance optimization
