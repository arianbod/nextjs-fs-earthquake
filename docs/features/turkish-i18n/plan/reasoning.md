# Implementation Reasoning - Turkish i18n

## Build Order

### Recommended: Infrastructure → Routes → Components → Toggle

**Rationale:**
1. Infrastructure must work before components can use translations
2. Routes must be restructured before components are updated
3. Components can be updated incrementally after routes work
4. Language toggle is finishing touch once translations are in place

### Order:
1. **Infrastructure first** - next-intl setup, middleware, config
2. **Route migration second** - Move to `[locale]` structure
3. **Translation files third** - Create English base, then Turkish
4. **Components fourth** - Update to use `t()` function
5. **Language toggle last** - Add UI once everything works

---

## Deployment Strategy

### Incremental Deployment (Recommended)

**Phase 1: Foundation (No visible changes)**
- Install next-intl
- Configure routing and middleware
- Create empty translation files
- Test: All routes still work

**Phase 2: Route Migration**
- Move pages under `[locale]`
- Update layouts
- Test: All routes work with `/en/` prefix

**Phase 3: English Translations**
- Extract strings from navigation
- Extract strings from homepage
- Test: English works, no hardcoded strings

**Phase 4: Turkish Translations**
- Translate navigation
- Translate homepage
- Test: Turkish works

**Phase 5: Language Toggle**
- Add toggle component
- Add to navbar
- Test: Switching works

**Phase 6: Full Translation**
- Translate remaining components
- Translate AI prompts
- Final testing

### Why Not All At Once?
- Easier to debug issues
- Can deploy in stages
- Reduces risk of breaking changes
- Team can review incrementally

---

## Testing Strategy

### Unit Tests
Not required for i18n - mostly configuration.

### Integration Tests
```javascript
// Test locale routing
test('redirects to default locale', async () => {
  const response = await fetch('/');
  expect(response.redirected).toBe(true);
  expect(response.url).toContain('/en');
});

// Test locale switching
test('switches locale via URL', async () => {
  const en = await fetch('/en');
  const tr = await fetch('/tr');
  expect(en.status).toBe(200);
  expect(tr.status).toBe(200);
});
```

### Manual Testing Checklist
- [ ] Navigate to `/` → Redirects to `/en/`
- [ ] Navigate to `/tr/` → Works
- [ ] All pages load in both locales
- [ ] Language toggle changes URL
- [ ] Preference persists after page reload
- [ ] Assessment flow works in Turkish
- [ ] Results display in Turkish
- [ ] AI analysis returns Turkish when selected

### E2E Tests (Optional)
```javascript
// Playwright test
test('language toggle works', async ({ page }) => {
  await page.goto('/en');
  await page.click('[data-testid="language-toggle"]');
  await page.click('[data-testid="locale-tr"]');
  expect(page.url()).toContain('/tr');
  await expect(page.locator('h1')).toContainText('Deprem');
});
```

---

## Rollback Plan

### If Issues Occur:

1. **Quick Rollback (5 min):**
   - Revert middleware changes
   - App works in English only
   - Language toggle hidden

2. **Full Rollback (30 min):**
   - Remove `[locale]` segment
   - Revert all component changes
   - Remove next-intl package
   - Back to original state

### Rollback Steps:
```bash
# Quick rollback
git revert <middleware-commit>
git push

# Full rollback
git reset --hard <pre-i18n-commit>
git push --force  # If on feature branch only!
```

---

## Translation Workflow

### For Initial Development:
1. Developer extracts English strings
2. Developer creates translation keys
3. Developer (or translator) creates Turkish translations

### For Future Updates:
1. Add new key to `en.json`
2. Add Turkish translation to `tr.json`
3. Use key in component
4. Deploy

### Missing Translation Handling:
```javascript
// next-intl config
{
  onError: (error) => {
    if (error.code === 'MISSING_MESSAGE') {
      console.warn(`Missing translation: ${error.key}`);
    }
  },
  getMessageFallback: ({ key, namespace }) => {
    // Return key as fallback (or English value)
    return key;
  }
}
```

---

## Performance Considerations

### Bundle Impact
- next-intl: ~5KB gzipped
- Translation files: ~10-20KB per locale
- Total impact: <30KB (acceptable)

### Loading Strategy
- Default: Load all translations for current locale
- Future optimization: Split by namespace, lazy load

### SSR Performance
- Translations loaded server-side
- No flash of wrong language
- Cached per request

---

## Code Organization

### Translation Namespaces
Organize translations by feature area:

```json
{
  "Navigation": { ... },
  "Hero": { ... },
  "Assessment": {
    "step1": { ... },
    "step2": { ... }
  },
  "Results": { ... },
  "Dashboard": { ... },
  "Common": { ... },
  "Errors": { ... }
}
```

### Component Pattern
```jsx
// Import translations hook
import { useTranslations } from 'next-intl';

export function MyComponent() {
  // Get translations for namespace
  const t = useTranslations('Navigation');

  return <Button>{t('startAssessment')}</Button>;
}
```

### Server Component Pattern
```jsx
import { getTranslations } from 'next-intl/server';

export async function ServerComponent() {
  const t = await getTranslations('Hero');

  return <h1>{t('title')}</h1>;
}
```
