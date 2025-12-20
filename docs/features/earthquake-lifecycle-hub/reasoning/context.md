# Project Context - Earthquake Lifecycle Hub

## Project Overview

**QuakeWise** is an AI-powered earthquake safety assessment platform built with Next.js 15 that combines AI image analysis, geospatial data, and engineering calculations to evaluate building vulnerability. The platform is specifically designed for Turkish earthquake-prone regions with i18n support for English and Turkish.

### Key Technical Stack
- **Frontend**: Next.js 16.1.0 with App Router, React 19, TypeScript (strict mode disabled)
- **Styling**: TailwindCSS with custom themes, shadcn/ui components, Framer Motion animations
- **Authentication**: Clerk (OAuth-based)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude Sonnet 4 for image analysis
- **Mapping**: Leaflet/React-Leaflet, Google Maps APIs
- **Data**: React Query for caching and state management
- **i18n**: next-intl for English/Turkish support
- **Notifications**: Web Push + Sonner toasts

---

## Relevant Project Areas

### Files That May Be Affected

| File/Folder | Likely Change | Confidence |
|-------------|---------------|------------|
| `/app/[locale]/(pages)/safety-hub/` | New page (create) | High |
| `/components/safety-hub/` | New components (create) | High |
| `/components/navigation/Navbar.jsx` | Add SafetyHub link | High |
| `/messages/en.json`, `/messages/tr.json` | Add i18n keys | High |
| `/app/api/safety-hub/` | New API routes | Medium |
| `/prisma/schema.prisma` | New models (optional) | Medium |
| `/public/sw.js` | Offline support | Medium |

### Existing Related Components

| Component | Location | Reuse Potential |
|-----------|----------|-----------------|
| AI Photo Analysis | `components/steps/AIPhotoStep.jsx` | High - damage photos |
| Alert System | `components/alerts/` | Medium - during phase |
| Results Display | `components/results/` | Medium - UI patterns |
| Dashboard Cards | `components/dashboard/` | High - checklist UI |
| Historical Map | `components/results/HistoricalEarthquakeMap.jsx` | Medium - safe zones |

---

## Impact Map

```
New Feature: earthquake-lifecycle-hub
      │
      ├──► Direct Changes (New)
      │    ├── /app/[locale]/(pages)/safety-hub/page.jsx
      │    ├── /components/safety-hub/BeforePhase.jsx
      │    ├── /components/safety-hub/DuringPhase.jsx
      │    ├── /components/safety-hub/AfterPhase.jsx
      │    ├── /components/safety-hub/PreparednessChecklist.jsx
      │    └── /components/safety-hub/DamageAssessmentFlow.jsx
      │
      ├──► Modified Files
      │    ├── /components/navigation/Navbar.jsx (add link)
      │    ├── /messages/en.json (add SafetyHub section)
      │    ├── /messages/tr.json (add SafetyHub section)
      │    └── /middleware.ts (add protected route)
      │
      ├──► Reused Code
      │    ├── /lib/imageAnalysis.js (damage photo AI)
      │    ├── /hooks/useAlerts.js (earthquake data)
      │    └── UI components (Card, Button, Badge)
      │
      └──► Optional Future
           ├── /prisma/schema.prisma (DamageAssessment model)
           └── /public/sw.js (offline caching)
```

---

## Patterns to Follow

### Component Pattern
```jsx
'use client';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SafetyHubSection() {
  const t = useTranslations('SafetyHub.section');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>{t('content')}</CardContent>
    </Card>
  );
}
```

### API Route Pattern
```js
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  // Process...
  return NextResponse.json({ success: true, data: result });
}
```

### i18n Pattern
```json
{
  "SafetyHub": {
    "title": "Safety Hub",
    "before": { "title": "Before Earthquake", ... },
    "during": { "title": "During Earthquake", ... },
    "after": { "title": "After Earthquake", ... }
  }
}
```

---

## Reusable Existing Code

### Services
- `lib/imageAnalysis.js::analyzeImagesWithAI()` - For damage photo analysis
- `hooks/useAlerts.js` - For earthquake data in "during" phase

### Components
- shadcn/ui: Card, Button, Badge, Tabs, Alert, Progress, Checkbox
- Lucide icons (consistent library)
- Framer Motion for animations

### Patterns
- Dashboard stats cards → Checklist progress
- Results key findings → Safety recommendations
- Assessment step flow → Damage assessment flow

---

## Potential Conflicts

| Risk | Mitigation |
|------|------------|
| Navigation crowding | Use dropdown on mobile, test all breakpoints |
| Route conflicts | Use `/(pages)/safety-hub` grouping |
| AI API costs | Rate limit damage assessments per user/day |
| i18n gaps | Define all keys upfront, test both languages |
| Offline complexity | Start with static content, add PWA incrementally |
