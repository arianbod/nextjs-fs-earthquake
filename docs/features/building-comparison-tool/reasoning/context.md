# Project Context - Building Comparison Tool

## Project Overview
- **Framework:** Next.js 15 with App Router
- **Architecture:** Locale-based routing `[locale]/`
- **Key folders:** `app/`, `components/`, `lib/`, `hooks/`

## Relevant Project Areas

### Files That May Be Affected
| File/Folder | Likely Change | Confidence |
|-------------|---------------|------------|
| `app/[locale]/compare/page.jsx` | New page | High |
| `components/compare/` | New components | High |
| `lib/actions/assessment.js` | Add comparison query | Medium |
| `messages/en.json` | Add translations | High |
| `messages/tr.json` | Add translations | High |
| `components/navigation/Navbar.jsx` | Add nav link | Low |

## Existing Related Components

### Can Reuse
- `AssessmentCard.jsx` → For selection cards
- `components/ui/card.jsx` → Card styling
- `Recharts` → Already installed for charts
- `Badge`, `Button` → UI components
- `getUserAssessments()` → Fetch user assessments
- `getAssessment()` → Fetch single assessment details

### Patterns to Follow
- **API Style:** Server Actions (lib/actions/)
- **Component Style:** Functional with hooks, shadcn/ui
- **State Management:** React Query for data fetching
- **Database:** Prisma with PostgreSQL
- **Auth Pattern:** Clerk with `auth()` server-side

## Impact Map

```
New Feature: building-comparison-tool
      │
      ├──► Direct Changes
      │    ├── app/[locale]/compare/page.jsx (NEW)
      │    ├── components/compare/ComparisonView.jsx (NEW)
      │    ├── components/compare/ComparisonChart.jsx (NEW)
      │    └── components/compare/AssessmentSelector.jsx (NEW)
      │
      ├──► Indirect Effects
      │    ├── Dashboard (add "Compare" action)
      │    └── Navigation (optional compare link)
      │
      └──► Dependencies (already installed)
           ├── recharts (charts)
           ├── @tanstack/react-query (data fetching)
           └── framer-motion (animations)
```

## Data Available for Comparison

From `SafetyResult` model:
- `overallScore` (0-100)
- `riskLevel` (Low/Moderate/High/Very High)
- `safetyRating` (A-E)
- `structuralScore`
- `foundationScore`
- `materialScore`
- `irregularityScore`
- `siteScore`
- `estimatedRetrofitCost`

From `BuildingInfo` model:
- `numberOfFloors`
- `buildingAge`
- `constructionYear`
- `structuralSystem`
- `materialCondition`

From `Location` model:
- `fullAddress`
- `city`
- `earthquakeZone`
