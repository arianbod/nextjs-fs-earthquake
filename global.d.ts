// Type-safe translations for next-intl
// This provides autocomplete and type checking for all translation keys

import en from './messages/en.json';

type Messages = typeof en;

declare global {
  // Use type safe message keys with `auto-complete`
  interface IntlMessages extends Messages {}
}
