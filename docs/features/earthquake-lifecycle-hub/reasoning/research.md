# Online Research - Initial Discovery

**Feature:** Earthquake Lifecycle Hub
**Date:** 2025-12-20
**Purpose:** Discover latest approaches for earthquake preparedness apps

---

## 1. Modern Implementation Approaches

### Successful Apps & Patterns (2025)

| App | Key Features | Downloads |
|-----|--------------|-----------|
| **MyShake** (California) | Early warning, community damage reporting, crowdsourced network | 4M+ |
| **NERV** (Japan) | Multi-hazard, predicted countdown, barrier-free design | Popular |
| **Info BMKG** (Indonesia) | Live maps, real-time user reports, push notifications | Regional |
| **Binamod** | AI-powered seismic scores, post-earthquake damage prediction | Commercial |

### Key Pattern: Three-Phase Lifecycle
All successful apps follow **before-during-after** structure:
- **Before:** Preparedness checklists, emergency kits, family plans
- **During:** Real-time safety instructions, alerts breaking Do Not Disturb
- **After:** Damage reporting, community assessment, recovery resources

**Sources:**
- [California MyShake 4M Downloads](https://www.gov.ca.gov/2025/04/25/california-exceeds-4-million-myshake-app-downloads/)
- [NERV Disaster Prevention](https://nerv.app/en/)
- [Best Earthquake Apps 2025](https://myworldtoday.com/best-earthquake-apps-2025/)

---

## 2. Recommended Packages/Libraries (2025)

### Offline-First Architecture

| Package | Purpose | Recommendation |
|---------|---------|----------------|
| **Workbox** | Service Worker, caching | Use - Next.js compatible |
| **PouchDB** | Bi-directional sync | Consider - complex sync |
| **IndexedDB** | Native browser storage | Use - simple offline |
| **InstantDB** | Real-time with offline | Consider - modern alt |

### PWA Market Growth
PWA market: $2.08B (2024) → $21.24B by 2033 (29.9% CAGR)

### Critical for Emergency Apps
- Background Sync (Workbox)
- Offline map tiles
- Web Audio API (alerts)
- Vibration API (haptic)

**Sources:**
- [Offline App Architecture 2025](https://www.aalpha.net/blog/offline-app-architecture-building-offline-first-apps/)
- [PWA with Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)

---

## 3. Security Considerations (2025)

### Critical Issues Found in Health/Safety Apps
- 22 apps trusted all TLS certificates (vulnerable)
- 42 apps allowed unencrypted HTTP
- Average 44 critical vulnerabilities per app

### Required Security Measures

| Area | Requirement |
|------|-------------|
| **Data in Transit** | TLS 1.2+, certificate pinning |
| **Data at Rest** | Encrypt IndexedDB, device Keychain |
| **Photos** | Encrypt immediately, strip EXIF |
| **Auth** | Token-based with offline queue |
| **Consent** | Explicit opt-in for photo sharing |

### Compliance
- GDPR-compliant even outside EU
- No third-party tracking of sensitive data
- Clear data retention limits (90 days for photos)

**Sources:**
- [Mobile Healthcare Apps Security Problems 2025](https://www.helpnetsecurity.com/2025/10/15/mobile-healthcare-apps-security-and-privacy-problems/)
- [Offline-First Security](https://medium.com/offline-camp/offline-first-security-59bf4800e82a)

---

## 4. UX/UI Trends (2025)

### Crisis-Specific UX Principles

1. **Cognitive Load Reduction**
   - High-stress users have reduced capacity
   - Minimize decision points
   - Most urgent information largest/first

2. **Accessibility as Default**
   - Color-blind friendly (avoid red/green alone)
   - Large fonts (16px+ body, 14px minimum)
   - WCAG AAA (7:1 contrast for critical text)
   - Audio alternatives
   - Haptic feedback

3. **Multi-Modal Alerts**
   - Force through Do Not Disturb
   - Distinctive audio tones
   - Haptic patterns (3 short = immediate action)
   - Large, high-contrast visuals

4. **Trust Building**
   - "Sourced from AFAD & FEMA"
   - Last updated timestamps
   - Community confirmations
   - Accuracy disclaimers

**Sources:**
- [Emergency Service UX Design](https://www.uxmatters.com/mt/archives/2012/02/designing-the-emergency-service-experience.php)
- [Creating Trust in UX](https://besedo.com/blog/creating-trust-and-safety-in-ux-design/)

---

## 5. Official Guidelines

### FEMA Earthquake Preparedness

**Before:**
- Family emergency communications plan
- Out-of-state contact person
- Safe spot in home (next to sturdy furniture)
- 2-week water supply (1 gallon/person/day)
- Secure heavy furniture to walls
- Practice drills regularly

**During:**
- DROP to hands and knees
- COVER head and neck
- HOLD ON to sturdy object
- Stay indoors, away from windows
- If outside: open area away from buildings

**After:**
- Check for injuries, provide first aid
- Look for hazards: gas leaks, power lines
- Do NOT enter damaged buildings
- Expect aftershocks
- Use texts instead of calls

**Source:** [Ready.gov Earthquakes](https://www.ready.gov/earthquakes)

### Turkey AFAD Guidelines

**Key Points:**
- Keep phone charged (rescue coordination)
- Know building earthquake certificate status
- Check AFAD Earthquake Regions Map
- Establish meeting point (elevated, not low-lying)
- Send SMS instead of calling (lower bandwidth)

**Building Assessment:**
- Check via e-Devlet (e-Government)
- Current map shows PGA values (not zones)
- TBDY-2018 is one of world's most stringent codes

**Source:** [AFAD Turkey](https://en.afad.gov.tr/turkeys-new-earthquake-hazard-map-is-published)

---

## 6. Summary for This Feature

### Recommended Approach

**Architecture:**
- Next.js 16 with offline-first PWA
- IndexedDB + Workbox Service Workers
- Reuse existing Claude Sonnet AI for damage photos

**MVP Priorities:**

| Phase | Priority Features |
|-------|-------------------|
| **Before** | Interactive checklist, emergency kit guide, PDF export |
| **During** | Full-screen safety instructions (offline), audio playback |
| **After** | Photo damage assessment, AI analysis, share with authorities |

### Packages to Consider

| Package | Purpose |
|---------|---------|
| Workbox | Service Worker caching |
| next-pwa | PWA wrapper for Next.js |
| @react-pdf/renderer | PDF export (existing) |
| Web Audio API | Audio alerts (native) |

### Security Must-Haves

1. HTTPS enforcement
2. Certificate pinning for API
3. Encrypted local storage for photos
4. Explicit consent for photo sharing
5. No unencrypted HTTP

### Accessibility Requirements

- [ ] WCAG AAA (7:1 contrast)
- [ ] Color-blind friendly
- [ ] 16px+ body font
- [ ] Audio alternatives
- [ ] Keyboard navigation
- [ ] Haptic feedback

---

## Sources

- [California MyShake](https://myshake.berkeley.edu/)
- [NERV App](https://nerv.app/en/)
- [Ready.gov Earthquakes](https://www.ready.gov/earthquakes)
- [AFAD Turkey](https://en.afad.gov.tr/)
- [FEMA Earthquake Risk](https://www.fema.gov/emergency-managers/risk-management/earthquake)
- [PWA Guide 2025](https://www.mobiloud.com/blog/progressive-web-apps)
- [AI Building Damage Assessment](https://flypix.ai/blog/building-damage-assessment/)
- [Offline-First Architecture](https://www.aalpha.net/blog/offline-app-architecture-building-offline-first-apps/)
