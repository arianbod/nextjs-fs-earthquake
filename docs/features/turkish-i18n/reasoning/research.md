# Online Research - Initial Discovery

**Feature:** Turkish i18n (Complete Turkish Localization)
**Date:** 2025-11-30
**Purpose:** Discover latest approaches for Next.js 15 App Router internationalization

---

## 1. Modern Implementation Approaches

### Searches performed:
- "Next.js 15 app router i18n internationalization best practices 2025"
- "next-intl vs react-i18next Next.js 15 2025 comparison"

### Key Findings:

**App Router requires different approach than Pages Router:**
- Next.js 15's App Router does NOT support the traditional `i18n` config from `next.config.js`
- Must use middleware + dynamic `[locale]` route segment
- Source: [Next.js Official Docs](https://nextjs.org/docs/pages/guides/internationalization)

**Recommended project structure:**
```
├── messages/
│   ├── en.json
│   └── tr.json
├── src/
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   └── app/
│       └── [locale]/
│           ├── layout.tsx
│           └── page.tsx
```
Source: [next-intl documentation](https://next-intl.dev/docs/getting-started/app-router)

---

## 2. Recommended Packages/Libraries (2025)

### next-intl (RECOMMENDED)

| Aspect | Details |
|--------|---------|
| **Version** | 3.x (latest) |
| **Bundle Size** | ~5KB minified + gzipped |
| **Downloads** | 1M+ weekly |
| **Last Updated** | Active development |
| **Recommendation** | USE - best for App Router |

**Why next-intl:**
- Native App Router support (first-class)
- Built-in server component support
- Minimal configuration
- Designed specifically for Next.js
- TypeScript support
- Source: [Medium - Why I Chose next-intl](https://medium.com/@isurusasanga1999/why-i-chose-next-intl-for-internationalization-in-my-next-js-66c9e49dd486)

### react-i18next / next-i18next

| Aspect | Details |
|--------|---------|
| **Bundle Size** | ~27KB (i18next + react-i18next + next-i18next) |
| **Downloads** | Very high (mature) |
| **Last Updated** | Active |
| **Recommendation** | AVOID for App Router |

**Why NOT react-i18next:**
- "Forcing something old into new structure" with App Router
- Multiple layers of abstraction
- Higher setup complexity
- Not ideal for server components
- Source: [Intlayer Comparison](https://intlayer.org/blog/next-i18next-vs-next-intl-vs-intlayer)

### Comparison Summary

| Feature | next-intl | react-i18next |
|---------|-----------|---------------|
| App Router Support | Native | Requires setup |
| Server Components | Built-in | Less ideal |
| Configuration | Minimal | Complex |
| Bundle Size | 5KB | 27KB |
| Plugin Ecosystem | Limited | Extensive |

---

## 3. Security Considerations (2025)

**No major security concerns for i18n implementation:**
- Translation files are static JSON (no code execution risk)
- No user-provided translations (admin-controlled)
- No database storage of translations needed
- Locale detection via headers/URL (safe)

**Best practices:**
- Sanitize any dynamic content in translations
- Use `{value}` interpolation, not raw HTML injection
- Keep translation files in version control
- Source: General i18n security guidelines

---

## 4. UX/UI Trends (2025)

### Language Toggle Best Practices:
- **Location:** Header/navbar (top right preferred)
- **Design:** Dropdown or toggle button
- **Flags:** Controversial - prefer language names or codes
- **Persistence:** Save preference in localStorage/cookies
- **No page reload:** Use client-side routing

### User Expectations:
- Instant language switch (no page refresh)
- Persistent language preference
- Browser language detection on first visit
- Clear visual indicator of current language
- Source: [Greasy Guide - next-intl 2025](https://www.greasyguide.com/development/next-intl-guide-nextjs-internationalization-2025/)

---

## 5. Implementation Approach

### Step-by-step based on research:

1. **Install next-intl:**
   ```bash
   npm install next-intl
   ```

2. **Configure routing** (`i18n/routing.ts`):
   ```typescript
   import {defineRouting} from 'next-intl/routing';

   export const routing = defineRouting({
     locales: ['en', 'tr'],
     defaultLocale: 'en'
   });
   ```

3. **Set up middleware** (`middleware.ts`):
   - Must integrate with existing Clerk middleware
   - Handle locale detection and routing

4. **Configure Next.js plugin** (`next.config.mjs`):
   ```javascript
   import createNextIntlPlugin from 'next-intl/plugin';
   const withNextIntl = createNextIntlPlugin();
   ```

5. **Restructure app directory:**
   - Move routes under `app/[locale]/`
   - Keep API routes outside `[locale]`

6. **Create translation files:**
   - `messages/en.json`
   - `messages/tr.json`

7. **Wrap with provider:**
   - `NextIntlClientProvider` in root layout

---

## Summary for This Feature

### Recommended approach based on 2025 research:
Use **next-intl** library with `[locale]` dynamic segment routing. It's the standard for Next.js 15 App Router internationalization with minimal configuration and excellent server component support.

### Package to use:
- **next-intl** - Native App Router support, minimal bundle size, TypeScript

### Implementation priorities:
1. Set up routing infrastructure first
2. Add language toggle to navbar
3. Extract and translate critical user-facing text (homepage, navigation)
4. Progressively translate assessment steps
5. Translate results and dashboard last

### Static rendering note:
next-intl currently opts into dynamic rendering when `useTranslations` is used in Server Components. For SSG pages, use the static rendering workaround if needed.

---

## Sources

- [next-intl Official Documentation](https://next-intl.dev/docs/getting-started/app-router)
- [Next.js Internationalization Guide](https://nextjs.org/docs/pages/guides/internationalization)
- [Medium: Next.js 15 App Router i18n](https://medium.com/@thomasaugot/next-js-15-app-router-internationalization-with-url-based-routing-7e49413dc7c1)
- [Ali Dev: i18n in Next.js 15](https://www.ali-dev.com/blog/implementing-internationalization-i18n-in-next-js-15-with-the-app-router)
- [Intlayer: next-intl Guide 2025](https://intlayer.org/doc/next-intl)
- [Greasy Guide: Next.js i18n 2025](https://www.greasyguide.com/development/next-intl-guide-nextjs-internationalization-2025/)
- [Intlayer: Library Comparison](https://intlayer.org/blog/next-i18next-vs-next-intl-vs-intlayer)
- [Medium: Why I Chose next-intl](https://medium.com/@isurusasanga1999/why-i-chose-next-intl-for-internationalization-in-my-next-js-66c9e49dd486)
