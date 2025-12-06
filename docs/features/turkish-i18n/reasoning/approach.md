# Technical Approach - Turkish i18n

## Summary from Initial Research

Based on 2025 research (see `research.md`):
- **next-intl** is the recommended library for Next.js 15 App Router
- Traditional `i18n` config in `next.config.js` doesn't work with App Router
- Must use `[locale]` dynamic segment with middleware
- Bundle size: ~5KB (vs 27KB for react-i18next)

## Chosen Approach

### Summary
Use **next-intl** with URL-based locale routing (`/en/...`, `/tr/...`) and middleware for locale detection and redirection.

### Why This Approach (backed by 2025 research)

| Reason | Source |
|--------|--------|
| Native App Router support | [next-intl docs](https://next-intl.dev/docs/getting-started/app-router) |
| Built-in server component support | [Intlayer comparison](https://intlayer.org/blog/next-i18next-vs-next-intl-vs-intlayer) |
| Minimal configuration vs react-i18next | [Medium: Why I Chose next-intl](https://medium.com/@isurusasanga1999/why-i-chose-next-intl-for-internationalization-in-my-next-js-66c9e49dd486) |
| Smallest bundle size (5KB) | [Library comparison](https://intlayer.org/blog/next-i18next-vs-next-intl-vs-intlayer) |
| TypeScript support | [next-intl docs](https://next-intl.dev/docs) |

## Key Technical Decisions

| Decision | Choice | Rationale | Source |
|----------|--------|-----------|--------|
| i18n Library | next-intl | Native App Router support, minimal config | Research |
| Routing Strategy | URL-based (`/en/`, `/tr/`) | SEO friendly, shareable links | Best practice |
| Default Locale | `en` | Current users, international fallback | Business requirement |
| Translation Format | JSON files | Simple, version-controlled, type-safe | next-intl standard |
| Middleware | Custom with Clerk integration | Must work with existing auth | Project requirement |

## Packages Selected

| Package | Version | Purpose | Why (2025 research) |
|---------|---------|---------|---------------------|
| next-intl | ^3.x | i18n core functionality | Recommended for App Router, 5KB bundle |

No other packages needed - next-intl includes:
- Translation loading
- Locale routing
- Client/server providers
- Date/number formatting

## Architecture

### File Structure

```
quakewise/
├── messages/
│   ├── en.json              # English translations
│   └── tr.json              # Turkish translations
├── src/                     # (if using src, otherwise root)
│   └── i18n/
│       ├── routing.ts       # Locale routing config
│       └── request.ts       # Server-side locale loading
├── app/
│   ├── [locale]/            # All routes under locale segment
│   │   ├── layout.js        # Locale-aware layout
│   │   ├── page.js          # Homepage
│   │   ├── (auth)/          # Auth routes (sign-in, sign-up)
│   │   ├── (pages)/         # Main pages (assessment, result, etc.)
│   │   ├── dashboard/
│   │   └── api-docs/
│   └── api/                  # API routes (NOT localized)
├── middleware.ts             # Locale + Clerk middleware
└── next.config.mjs          # next-intl plugin
```

### Middleware Flow

```
Request → Middleware
    ├── Check if API route → Skip locale handling
    ├── Check if has locale prefix → Proceed
    └── No locale prefix
        ├── Check cookie for preference
        ├── Check Accept-Language header
        └── Redirect to /en/ or /tr/

    ↓

Clerk middleware (auth check)

    ↓

Route handler
```

### Client Components

```jsx
// Before
<Button>Start Assessment</Button>

// After
import { useTranslations } from 'next-intl';

const t = useTranslations('Common');
<Button>{t('startAssessment')}</Button>
```

### Server Components

```jsx
// Before
<h1>Earthquake Safety</h1>

// After
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('Hero');
<h1>{t('title')}</h1>
```

## Translation File Structure

```json
// messages/en.json
{
  "Navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "about": "About",
    "startAssessment": "Start Assessment",
    "continueAssessment": "Continue Assessment"
  },
  "Hero": {
    "title": "Earthquake Safety",
    "subtitle": "Reimagined with AI",
    "cta": "Start AI Assessment"
  },
  "Common": {
    "next": "Next",
    "back": "Back",
    "loading": "Loading...",
    "error": "An error occurred"
  }
  // ... more namespaces
}
```

```json
// messages/tr.json
{
  "Navigation": {
    "home": "Ana Sayfa",
    "dashboard": "Kontrol Paneli",
    "about": "Hakkında",
    "startAssessment": "Değerlendirmeye Başla",
    "continueAssessment": "Değerlendirmeye Devam Et"
  },
  "Hero": {
    "title": "Deprem Güvenliği",
    "subtitle": "Yapay Zeka ile Yeniden Tasarlandı",
    "cta": "AI Değerlendirmesini Başlat"
  },
  "Common": {
    "next": "İleri",
    "back": "Geri",
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu"
  }
  // ... more namespaces
}
```

## AI Content Strategy

### Claude Analysis Prompts
Add locale parameter to AI analysis:

```javascript
// Before
const prompt = `Analyze this building image...`;

// After
const locale = await getLocale();
const langInstruction = locale === 'tr'
  ? 'Respond in Turkish (Türkçe).'
  : 'Respond in English.';
const prompt = `${langInstruction}\n\nAnalyze this building image...`;
```

## Security Approach

Based on research, minimal security concerns:
- Translation files are static JSON (no code execution)
- No user-provided translations
- Locale detection via URL/headers (safe)
- No database changes needed

## Rejected Alternatives

| Alternative | Why Rejected |
|-------------|--------------|
| react-i18next | Not ideal for App Router, higher bundle size (27KB vs 5KB), more complex setup |
| Custom solution | Reinventing the wheel, more maintenance |
| Server-only translations | Client components need translations too |
| URL-less locale (cookie only) | Not SEO friendly, can't share locale-specific links |

## Performance Considerations

1. **Bundle size:** next-intl is only 5KB
2. **Translation loading:** Lazy-load per-page translations
3. **SSR:** Translations loaded server-side, no flash
4. **Caching:** Translation files are static, can be cached

## Migration Strategy

1. **Phase 1:** Set up infrastructure (no visible changes)
   - Install next-intl
   - Configure routing/middleware
   - Create empty translation files

2. **Phase 2:** Migrate routes
   - Move routes under `[locale]`
   - Update layouts
   - Test all routes work

3. **Phase 3:** Translate components (incremental)
   - Start with navigation
   - Then homepage
   - Then assessment steps
   - Then results

4. **Phase 4:** Add language toggle
   - Create component
   - Add to navbar
   - Test switching
