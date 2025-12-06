# Project Context - Turkish i18n

## Project Overview
- **Framework:** Next.js 15 with App Router
- **Architecture:** App router with route groups `(auth)`, `(pages)`
- **Key folders:** `app/`, `components/`, `lib/`, `utils/`, `services/`

## Relevant Project Areas

### Files That May Be Affected
| File/Folder | Likely Change | Confidence |
|-------------|---------------|------------|
| `next.config.mjs` | Add next-intl plugin | High |
| `middleware.ts` | Add locale routing | High |
| `app/layout.js` | Wrap with i18n provider | High |
| `app/[locale]/` | New locale segment structure | High |
| `messages/en.json` | English translations | High |
| `messages/tr.json` | Turkish translations | High |
| `components/navigation/Navbar.jsx` | Language toggle, translatable text | High |
| `components/homepage/*.jsx` | All hero/landing text | High |
| `components/steps/*.jsx` | Assessment step instructions | High |
| `components/results/*.jsx` | Result display text | High |
| `components/dashboard/*.jsx` | Dashboard labels | Medium |

## Existing Related Components

### UI with Text to Translate (92 components identified)
- **Navigation:** Navbar.jsx, Breadcrumb.jsx, LinksDropdown.jsx
- **Homepage:** GuestHero.jsx, AuthHero.jsx, HowItWorksSection.jsx, LoggedInDashboard.jsx
- **Assessment Steps:** 15+ step components with instructions, labels, buttons
- **Results:** SafetyScoreHero.jsx, KeyFindings.jsx, AIInsightsReveal.jsx, etc.
- **Dashboard:** DashboardStats.jsx, AssessmentList.jsx, AssessmentCard.jsx

### Text Patterns Found in Codebase
1. **Hardcoded strings in JSX:** `"Start Assessment"`, `"Continue"`, `"Home"`
2. **Dynamic greetings:** `getGreeting()` returns "Good morning/afternoon/evening"
3. **Nav labels:** Array of `{ href, label }` objects
4. **AI-generated content:** Claude analysis results (already has Turkish support via prompts)
5. **Error messages:** Various error strings in try/catch blocks
6. **Form labels:** Input placeholders and labels

## Impact Map

```
New Feature: turkish-i18n
      │
      ├──► Direct Changes
      │    ├── next.config.mjs (add next-intl plugin)
      │    ├── middleware.ts (locale routing)
      │    ├── app/layout.js → app/[locale]/layout.js
      │    └── messages/en.json, messages/tr.json
      │
      ├──► Component Updates (text → t())
      │    ├── components/navigation/Navbar.jsx
      │    ├── components/homepage/*.jsx
      │    ├── components/steps/*.jsx
      │    ├── components/results/*.jsx
      │    ├── components/dashboard/*.jsx
      │    └── components/ui/*.jsx (some)
      │
      ├──► New Components
      │    ├── components/LanguageToggle.jsx
      │    └── lib/i18n/routing.ts
      │
      └──► Dependencies
           └── next-intl (new package)
```

## Patterns to Follow

### API Style
- REST APIs in `app/api/` routes
- Server Actions in `lib/actions/`
- No changes to API routes needed (internal, locale-independent)

### Component Style
- Functional React components with hooks
- Client components marked with `'use client'`
- Server components for data fetching
- TailwindCSS for styling
- Framer Motion for animations

### State Management
- React Context (`UserInputContext` for assessment data)
- React Query for API state
- No external state library needed for i18n

### Database
- Prisma with PostgreSQL
- No schema changes needed for i18n

### Auth Pattern
- Clerk authentication (locale-independent)
- Protected routes via middleware

## Reusable Existing Code
- [x] `components/navigation/ThemeToggle.jsx` - Pattern for language toggle component
- [x] `middleware.ts` - Will be modified for locale routing
- [x] `next.config.mjs` - Will add i18n plugin configuration

## Potential Conflicts
1. **Middleware:** Existing Clerk auth middleware must work alongside locale middleware
2. **Route groups:** `(auth)` and `(pages)` need to work within `[locale]` segment
3. **Dynamic routes:** `[step]`, `[id]` must remain functional
4. **API routes:** Should NOT be localized (keep outside `[locale]`)

## Current Text Volume Estimate

| Area | Components | Estimated Strings |
|------|------------|------------------|
| Navigation | 3 | ~25 |
| Homepage | 4 | ~50 |
| Assessment Steps | 15 | ~200 |
| Results | 10 | ~75 |
| Dashboard | 5 | ~30 |
| UI Elements | 10 | ~20 |
| Error Messages | Various | ~30 |
| **Total** | ~50 | **~430 strings** |

## No i18n Exists Yet
- No `messages/` folder
- No `locales/` folder
- No `i18n` configuration in `next.config.mjs`
- No language toggle component
- All text is hardcoded English
