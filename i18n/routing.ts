import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  // List of all supported locales
  locales,

  // Default locale when no locale is detected
  defaultLocale: 'en',

  // Locale prefix strategy: 'always' | 'as-needed' | 'never'
  // 'always' means /en/... and /tr/... always have prefix
  localePrefix: 'always'
});
