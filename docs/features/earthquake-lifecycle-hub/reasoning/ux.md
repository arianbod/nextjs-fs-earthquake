# UX Research: earthquake-lifecycle-hub

## User Personas

| Persona | Primary Need | Usage Frequency | Context |
|---------|--------------|-----------------|---------|
| **Prepared Parent** | Protect family, feel ready | Weekly check-ins | At home, planning |
| **Anxious Renter** | Know if building is safe | After earthquakes | Mobile, stressed |
| **Proactive Professional** | Workplace safety | Quarterly review | Desktop, methodical |
| **Crisis User** | Immediate guidance | During/after event | Mobile, panic mode |

---

## Current State (Without Feature)

### How Users Currently Solve This
- Google "what to do during earthquake"
- Search for AFAD/FEMA guidelines
- No personalized connection to their building
- No systematic preparation tracking
- Post-earthquake: guess if building is safe

### Pain Points
- Generic advice, not connected to their assessment
- No progress tracking for preparedness
- During earthquake: can't find info fast enough
- After earthquake: don't know how to assess damage
- No single source of truth

### Time/Effort Wasted
- Researching same info repeatedly
- No checklist = items forgotten
- Post-earthquake assessment requires professional ($$$)

---

## Desired User Journey

### Before Phase Journey
```
Dashboard → "Safety Hub" card
     ↓
Safety Hub landing → Select "Before" tab
     ↓
See personalized risk summary → "Your building is High Risk"
     ↓
Interactive checklist → Complete items, save progress
     ↓
Emergency kit guide → Shopping list export
     ↓
Family plan template → Download/print
     ↓
Completion badge → "You're 80% prepared!"
```

### During Phase Journey
```
Earthquake happens → Phone notification or user opens app
     ↓
Safety Hub → During tab auto-selected
     ↓
FULL SCREEN: "DROP - COVER - HOLD ON" (huge text)
     ↓
Step-by-step illustrated guidance
     ↓
Audio option → Listen while taking cover
     ↓
"Shaking stopped?" → Link to After phase
```

### After Phase Journey
```
After shaking → Open app or follow notification link
     ↓
Safety Hub → After tab selected
     ↓
"Is everyone safe?" → Quick status check
     ↓
"Assess building damage" → Start photo flow
     ↓
Take 1-3 photos of visible damage
     ↓
AI analyzes → "Moderate damage detected"
     ↓
Recommendations → "Avoid upper floors until inspection"
     ↓
Option: "Start full reassessment" → Links to assessment flow
     ↓
Recovery resources → AFAD contacts, utilities, shelters
```

---

## UX Patterns from Research

### Crisis-Specific Design (from 2025 research)
1. **Minimal cognitive load** - Users in crisis can't process complex UI
2. **Large touch targets** - Minimum 48px, hands may be shaking
3. **High contrast** - 7:1 ratio for critical information
4. **Audio backup** - Visual impairment or can't look at screen
5. **Offline-first** - Network may be down

### Successful App Patterns (MyShake, NERV)
- Full-screen mode for during-earthquake
- Pre-loaded content for offline use
- Community confirmation ("X others felt shaking")
- Countdown/timer for aftershock warnings
- Clear source attribution ("Based on AFAD guidelines")

---

## Platform Considerations

### Mobile (Priority)
- Primary device during crisis
- One-thumb operation
- Large buttons (48px minimum)
- Swipe between phases
- Camera access for damage photos
- Offline storage

### Desktop
- Preparedness planning (before phase)
- PDF export
- Printable checklists
- Family plan creation

### RTL Support (Persian future)
- Currently EN/TR only
- Layout must be RTL-ready
- Icons don't flip

---

## Phase-Specific UX

### Before Phase UX

**Checklist Design:**
- Visual progress bar (0-100%)
- Category groupings (Supplies, Home Safety, Communication, Documents)
- Estimated time per category
- Checkmark animations (satisfying feedback)
- "Skip" option with reminder to return

**Emergency Kit Builder:**
- Visual cards with quantities
- +/- adjusters for family size
- "Where to buy" links (future: affiliate)
- Export to shopping list

**Family Plan:**
- Template with fillable fields
- Meeting point selection on map
- Out-of-area contact fields
- Print/PDF export

### During Phase UX

**Full-Screen Mode:**
- Maximum font size
- Icon + text combination
- Auto-hide all navigation
- Audio play button prominent
- Swipe for next step
- "Shaking stopped?" exit button

**Steps:**
1. DROP (illustrated)
2. COVER (illustrated)
3. HOLD ON (illustrated)
4. Stay until shaking stops
5. Check for injuries
6. Exit carefully

**Accessibility:**
- Voice narration option
- High contrast enforced
- No animations (motion sensitivity)
- Screen reader optimized

### After Phase UX

**Damage Assessment Flow:**
- Simple photo capture (1-3 photos)
- Guidance on what to photograph
- AI processing indicator
- Clear severity result (Low/Moderate/High/Severe)
- Actionable recommendations
- "Start full reassessment" CTA

**Recovery Resources:**
- Emergency numbers (prominent)
- AFAD/local authority links
- Utility company contacts
- Temporary shelter locations (future: map)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Hub visit rate | 50% of assessment completers | Analytics |
| Checklist completion | 30% complete 1+ checklist | Database |
| During phase loads | Track during actual events | Analytics |
| Damage assessment use | 10% after significant events | Database |
| Time in Before phase | 5+ minutes average | Analytics |
| PDF downloads | 20% of visitors | Analytics |
| Return visits | 30% monthly | Analytics |

---

## Wireframe Concepts

### Safety Hub Landing
```
┌─────────────────────────────────┐
│  [Icon] Safety Hub              │
│  Your earthquake readiness: 45% │
├─────────────────────────────────┤
│  [Before] [During] [After]      │  ← Tab navigation
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Your Building Risk: HIGH  │  │  ← Connected to assessment
│  │ Based on assessment from  │  │
│  │ Nov 15, 2025             │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Preparedness Checklist         │
│  ████████░░░░░░░░░░ 45%        │
│  [Continue Checklist]           │
├─────────────────────────────────┤
│  Emergency Kit Guide            │
│  Family Communication Plan      │
│  Important Documents            │
└─────────────────────────────────┘
```

### During Phase (Full Screen)
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         🛡️                      │
│                                 │
│        DROP                     │
│                                 │
│   Get on your hands and knees   │
│                                 │
│   [🔊 Listen]                   │
│                                 │
│         ← Swipe for next →      │
│                                 │
│   [Shaking stopped? Tap here]   │
└─────────────────────────────────┘
```

### After Phase - Damage Assessment
```
┌─────────────────────────────────┐
│  ← Back    Damage Assessment    │
├─────────────────────────────────┤
│                                 │
│  Take photos of any visible     │
│  damage to your building        │
│                                 │
│  ┌─────────┐ ┌─────────┐       │
│  │ + Add   │ │ [photo] │       │
│  │ Photo   │ │         │       │
│  └─────────┘ └─────────┘       │
│                                 │
│  Tip: Focus on cracks, tilting, │
│  broken windows, structural     │
│  damage                         │
│                                 │
│  [Analyze Damage]               │
│                                 │
└─────────────────────────────────┘
```
