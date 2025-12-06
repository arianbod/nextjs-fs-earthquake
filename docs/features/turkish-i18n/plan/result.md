# Turkish i18n - Planning Result

## Implementation Guide Summary

### Overview
Complete Turkish language support for QuakeWise using next-intl library with URL-based locale routing.

### Technology
- **Library:** next-intl v3.x
- **Routing:** `[locale]` dynamic segment (`/en/...`, `/tr/...`)
- **Translation format:** JSON files in `messages/`

---

## Phase Summary

| Phase | Description | Tasks | Estimated Hours |
|-------|-------------|-------|-----------------|
| 1 | Infrastructure Setup | 5 | 2-3 |
| 2 | Route Migration | 5 | 2-3 |
| 3 | Navigation Translations | 5 | 2 |
| 4 | Homepage Translations | 5 | 2 |
| 5 | Assessment Steps | 8 | 4-6 |
| 6 | Results Translations | 5 | 2-3 |
| 7 | Dashboard Translations | 4 | 1-2 |
| 8 | AI Content Localization | 2 | 1-2 |
| 9 | Common & Errors | 3 | 1-2 |
| 10 | Polish & Testing | 5 | 2-3 |
| **Total** | | **47 tasks** | **17-26 hours** |

---

## Key Implementation Decisions

### 1. Folder Structure
```
app/
├── [locale]/           # All routes under locale
│   ├── layout.js       # Locale-aware layout
│   ├── page.js
│   ├── (auth)/
│   ├── (pages)/
│   └── dashboard/
├── api/                # API routes (NOT localized)
messages/
├── en.json
├── tr.json
i18n/
├── routing.ts
├── request.ts
```

### 2. Middleware Order
```
Request → Locale Detection → Locale Routing → Clerk Auth → Route
```

### 3. Translation Namespaces
- Navigation
- Hero
- Assessment (with sub-namespaces per step)
- Results
- Dashboard
- Common
- Errors

### 4. Language Toggle
- Location: Navbar, near theme toggle
- Design: Globe icon + language code dropdown
- Behavior: Instant switch, no page reload

---

## Security Summary

**Risk Level: LOW**
- No database changes
- No API keys required
- No user data stored
- Static translation files only

---

## Ready for Action Phase

### Prerequisites Complete:
- [x] Research completed (next-intl selected)
- [x] Architecture designed
- [x] UI designed
- [x] Security audited
- [x] Tasks broken down

### Next Steps:
1. Start with Task 1.1: Install next-intl
2. Follow task order strictly
3. Test after each phase
4. Update steering.md as you progress

---

## Files Created

```
docs/features/turkish-i18n/
├── reasoning/
│   ├── context.md      ✅
│   ├── research.md     ✅
│   ├── idea.md         ✅
│   ├── ux.md           ✅
│   ├── reasoning.md    ✅
│   ├── approach.md     ✅
│   └── result.md       ✅
└── plan/
    ├── ui.md           ✅
    ├── security.md     ✅
    ├── reasoning.md    ✅
    ├── tasks.md        ✅
    └── result.md       ✅ (this file)
```

---

## Command to Start Implementation

Begin Phase 3 (Action) by implementing Task 1.1:

```bash
npm install next-intl
```

Then follow the tasks in `tasks.md` sequentially.
