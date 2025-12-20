# UI Design - earthquake-lifecycle-hub

## Theming Strategy (90% Rule)

**Use theme tokens over hardcoded values 90% of the time.**

### Project Tailwind Version
- Current: TailwindCSS 3.x (from package.json)
- Using: tailwind.config.js theme.extend

### Theme Tokens to Use
- Colors: `bg-primary`, `text-primary`, `bg-destructive`, `bg-muted`
- Safety colors: `bg-green-500` (safe), `bg-yellow-500` (caution), `bg-red-500` (danger)
- Spacing: Standard Tailwind scale (4, 6, 8, etc.)
- Typography: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

### Dark/Light Mode Support
- [x] Support dark mode: Yes (existing next-themes)
- [x] Theme switching: Existing ThemeToggle component

---

## Component Structure

### Main Page Layout
```
/safety-hub
├── SafetyHubPage.jsx (container)
│   ├── HubHeader (title, user risk summary)
│   ├── PhaseTabs (Before | During | After)
│   └── PhaseContent (dynamic based on tab)
│       ├── BeforePhase
│       ├── DuringPhase
│       └── AfterPhase
```

### Existing Components (Reuse)

| Component | Location | Modifications |
|-----------|----------|---------------|
| Card | `@/components/ui/card` | None |
| Button | `@/components/ui/button` | None |
| Badge | `@/components/ui/badge` | None |
| Tabs | `@/components/ui/tabs` | None |
| Progress | `@/components/ui/progress` | None |
| Checkbox | `@/components/ui/checkbox` | None |
| Alert | `@/components/ui/alert` | None |

### New Components (Create)

| Component | Type | Complexity | Description |
|-----------|------|------------|-------------|
| SafetyHubPage | Page | Medium | Main container with tabs |
| BeforePhase | Display | Medium | Preparedness content |
| DuringPhase | Display | Low | Safety instructions (static) |
| AfterPhase | Display | High | Damage assessment flow |
| PreparednessChecklist | Interactive | Medium | Checklist with persistence |
| ChecklistItem | Interactive | Low | Single checklist item |
| EmergencyKitGuide | Display | Low | Kit list with quantities |
| DamageAssessmentFlow | Interactive | High | Photo upload + AI |
| DamageResult | Display | Medium | AI analysis result |
| SafetyInstructions | Display | Low | DROP-COVER-HOLD content |
| RecoveryResources | Display | Low | Links and contacts |

---

## Layout & Responsive

### Container
- Max width: `max-w-4xl mx-auto`
- Padding: `px-4 md:px-6`
- Full width on mobile

### Breakpoints

| Breakpoint | Before | During | After |
|------------|--------|--------|-------|
| Mobile (<640px) | Stacked cards | Full screen | Single column |
| Tablet (640-1024px) | 2-column grid | Full screen | Two column |
| Desktop (>1024px) | 3-column grid | Centered large | Two column |

### During Phase (Special)
- Full viewport height on mobile
- Centered content
- Maximum readability
- No navigation distraction

### RTL Support
- [x] Layout must be RTL-ready
- Use `flex-row-reverse` for RTL
- Icons don't flip (directional okay)

---

## States to Design

### Before Phase
- [ ] Default: Checklist at 0%
- [ ] In Progress: Partial completion
- [ ] Complete: 100% with celebration
- [ ] Loading: Skeleton cards

### During Phase
- [ ] Default: Instructions visible
- [ ] Audio playing: Play button highlighted
- [ ] Step navigation: Swipe indicators

### After Phase
- [ ] Default: Photo upload prompt
- [ ] Uploading: Progress indicator
- [ ] Analyzing: AI processing animation
- [ ] Results: Severity display
- [ ] Error: Retry option

---

## Accessibility

### Requirements (WCAG AA minimum)
- [x] ARIA labels on all interactive elements
- [x] Keyboard navigation for all actions
- [x] Focus management (trap in modals)
- [x] Color contrast: 4.5:1 minimum (7:1 for During phase)
- [x] Touch targets: 44px minimum (48px for During phase)

### During Phase (Critical Accessibility)
- [x] Audio alternative for visual instructions
- [x] High contrast enforced
- [x] Large fonts (24px+ headings)
- [x] No animations (motion sensitivity)
- [x] Screen reader optimized text

---

## Wireframes

### Safety Hub Landing
```
┌─────────────────────────────────────────┐
│  [← Back]  Safety Hub                   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │ 🏠 Your Building: [Address]         ││
│  │ Risk Level: ████████░░ HIGH         ││
│  │ Last assessed: Nov 15, 2025         ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  [ Before ]  [ During ]  [ After ]      │
├─────────────────────────────────────────┤
│                                         │
│  [Phase content here]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Before Phase Content
```
┌─────────────────────────────────────────┐
│  Preparedness Progress                  │
│  ████████░░░░░░░░░░░░ 40% Complete     │
├─────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐│
│  │ ☐ Emergency     │ │ ☑ Family Plan  ││
│  │   Supplies      │ │   ✓ Complete   ││
│  │   0/12 items    │ │   3/3 items    ││
│  │   [Start →]     │ │   [Review →]   ││
│  └─────────────────┘ └─────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐│
│  │ ☐ Home Safety   │ │ ☐ Documents    ││
│  │   0/8 items     │ │   0/5 items    ││
│  │   [Start →]     │ │   [Start →]    ││
│  └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────┤
│  📥 Download Emergency Kit Guide        │
│  📄 Print Family Communication Plan     │
└─────────────────────────────────────────┘
```

### During Phase (Full Screen Mobile)
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              🛡️                         │
│                                         │
│            DROP                         │
│                                         │
│    Get on your hands and knees          │
│                                         │
│    This protects you from falling       │
│    and lets you move if needed          │
│                                         │
│            [🔊 Listen]                  │
│                                         │
│         ← Swipe for next →              │
│                                         │
│  ─────────────────────────────────────  │
│  [Shaking stopped? Tap here]            │
└─────────────────────────────────────────┘
```

### After Phase - Damage Assessment
```
┌─────────────────────────────────────────┐
│  Damage Assessment                      │
├─────────────────────────────────────────┤
│                                         │
│  Is everyone in your household safe?    │
│  [Yes, everyone is safe]                │
│  [Someone needs help - Call 112]        │
│                                         │
├─────────────────────────────────────────┤
│  Assess Building Damage                 │
│                                         │
│  Take photos of any visible damage      │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ + Add   │ │ [img1]  │ │ [img2]  │   │
│  │ Photo   │ │    ×    │ │    ×    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  💡 Focus on: cracks, tilting,          │
│     broken windows, structural issues   │
│                                         │
│  [Analyze Damage]                       │
│                                         │
└─────────────────────────────────────────┘
```

### Damage Result Display
```
┌─────────────────────────────────────────┐
│  Damage Assessment Result               │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │ ⚠️ MODERATE DAMAGE DETECTED        ││
│  │                                     ││
│  │ Based on AI analysis of your photos ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Recommendations:                       │
│  • Do not enter upper floors            │
│  • Check for gas leaks                  │
│  • Request professional inspection      │
│                                         │
│  ⚠️ This is a preliminary assessment.  │
│  Always consult a professional.         │
├─────────────────────────────────────────┤
│  [🔄 Start Full Reassessment]          │
│  [📞 Find Professional Engineer]        │
├─────────────────────────────────────────┤
│  Recovery Resources                     │
│  📞 AFAD: 122                           │
│  🚒 Fire: 110                           │
│  🚑 Ambulance: 112                      │
└─────────────────────────────────────────┘
```

---

## Color Scheme for Phases

### Before Phase
- Primary background: `bg-background`
- Progress bar: `bg-primary`
- Completed items: `bg-green-100 border-green-500`
- Incomplete items: `bg-muted`

### During Phase
- Background: `bg-primary` or `bg-blue-600`
- Text: `text-white`
- Buttons: `bg-white text-primary`
- High contrast mode enforced

### After Phase - Severity Colors
| Severity | Background | Border | Icon |
|----------|------------|--------|------|
| Low | `bg-green-50` | `border-green-500` | ✅ |
| Moderate | `bg-yellow-50` | `border-yellow-500` | ⚠️ |
| High | `bg-orange-50` | `border-orange-500` | ⚠️ |
| Severe | `bg-red-50` | `border-red-500` | 🚨 |

---

## Animations

### Use Sparingly
- Tab switching: `fade-in` (100ms)
- Checklist item complete: `scale-pop` (150ms)
- Progress bar: `width transition` (300ms)
- Photo upload: `fade-in` (200ms)

### Disabled During Crisis
- During phase: No animations
- Motion sensitivity: Respect `prefers-reduced-motion`
