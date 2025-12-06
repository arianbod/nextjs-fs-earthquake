# Security Audit - Pre-Implementation

## Tech Stack Check

### Current project packages
From `package.json`:
- next: ^15.0.0
- @clerk/nextjs: ^6.18.0
- react: ^19.0.0

### Package to add
- next-intl: ^3.x (latest stable)

### Security status
- npm audit: Run before implementation
- next-intl: Well-maintained, no known vulnerabilities
- No deprecated packages involved

---

## Package Security

### next-intl Security Profile
| Aspect | Status |
|--------|--------|
| Maintainer | Active (Vercel-adjacent) |
| Last update | Within last month |
| Known CVEs | None |
| Dependencies | Minimal (uses native Intl APIs) |
| Bundle | ~5KB, no external runtime deps |

### Pre-install check
```bash
npm audit
npm install next-intl@latest
npm audit
```

---

## Auth Requirements

### Does this feature need authentication?
**No** - Language preference is not user-specific data requiring authentication.

### Auth considerations:
- Language toggle visible to all users (signed in and guests)
- No per-user language storage in database
- Clerk middleware must run AFTER locale middleware
- Order in middleware: Locale detection → Clerk auth

### Session handling:
- Language preference stored in:
  - Cookie (for SSR locale detection)
  - localStorage (for client-side persistence)
- NOT stored in user session/database

---

## Data Security

### Database changes needed?
**No** - Translation files are static JSON, no database storage.

### Migration strategy:
Not applicable - no schema changes.

### Rollback plan:
- Remove `[locale]` segment from routes
- Revert middleware changes
- Remove next-intl package
- All changes are code-only, no data migration

### Sensitive data handling:
- No PII involved in i18n
- No user data stored for language preference
- Translation files contain no secrets

---

## Key/Secret Exposure Prevention

### Environment variables needed:
**None** - next-intl uses no API keys or secrets.

### Checklist:
- [x] No hardcoded secrets in translation files
- [x] No API keys needed for i18n
- [x] .env.example: No changes needed

---

## API Security

### Input validation required:
- Locale parameter validation in middleware
- Only allow: `['en', 'tr']`
- Reject invalid locales, redirect to default

```javascript
// In middleware
const locales = ['en', 'tr'];
const locale = request.nextUrl.pathname.split('/')[1];
if (!locales.includes(locale)) {
  // Redirect to default locale
}
```

### Rate limiting needed:
**No** - Language switching is client-side navigation, no API calls.

### CORS considerations:
Not applicable - same-origin feature.

---

## URL Security

### Path traversal prevention:
- Locale is validated against whitelist
- No user input directly used in file paths
- Translation files loaded by key, not user input

### Safe locale handling:
```javascript
// BAD - Don't do this
const messages = require(`./messages/${userLocale}.json`);

// GOOD - Whitelist approach
const locales = { en: enMessages, tr: trMessages };
const messages = locales[validatedLocale] || locales['en'];
```

---

## XSS Prevention

### Translation content:
- All translations are developer-controlled
- No user-generated content in translations
- Use `{variable}` interpolation, not dangerouslySetInnerHTML

```jsx
// SAFE - next-intl handles escaping
{t('greeting', { name: userName })}

// AVOID - unless absolutely needed with sanitization
<div dangerouslySetInnerHTML={{ __html: translation }} />
```

### Rich text translations:
If needed in future, use next-intl's rich text support:
```jsx
{t.rich('message', {
  bold: (chunks) => <strong>{chunks}</strong>
})}
```

---

## Middleware Security

### Order of operations:
```
1. Locale detection (new)
2. Locale redirect (new)
3. Clerk authentication (existing)
4. Route handler
```

### Bypass prevention:
- API routes must be excluded from locale middleware
- Static assets must be excluded
- Clerk routes must work with locale prefix

```javascript
// Middleware config
export const config = {
  matcher: [
    // Skip API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Cookie Security

### Language preference cookie:
```javascript
// Set with security options
document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
```

### Cookie attributes:
| Attribute | Value | Reason |
|-----------|-------|--------|
| HttpOnly | No | Client-side reading needed |
| Secure | Auto | HTTPS in production |
| SameSite | Lax | CSRF protection |
| Path | / | Site-wide |
| Max-Age | 1 year | Persist preference |

---

## Summary

### Risk Level: LOW

| Category | Risk | Notes |
|----------|------|-------|
| Data security | None | No database changes |
| Authentication | None | Feature doesn't require auth |
| Input validation | Low | Validate locale whitelist |
| XSS | None | No user content in translations |
| CSRF | None | No state-changing operations |
| Secrets | None | No API keys needed |

### Pre-implementation checklist:
- [x] Run npm audit before/after install
- [x] Verify next-intl has no known vulnerabilities
- [x] Plan middleware integration with Clerk
- [x] Define locale whitelist validation
- [x] No database migrations needed
- [x] No environment variables needed
