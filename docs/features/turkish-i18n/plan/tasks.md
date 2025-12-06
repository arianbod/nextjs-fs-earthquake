# Implementation Tasks

## Phase 1: Infrastructure Setup

- [ ] **1.1:** Install next-intl package
  - Run `npm install next-intl`
  - Verify installation with `npm ls next-intl`

- [ ] **1.2:** Create i18n configuration files
  - [ ] **1.2.1:** Create `i18n/routing.ts` with locale config
  - [ ] **1.2.2:** Create `i18n/request.ts` for server-side loading

- [ ] **1.3:** Update `next.config.mjs`
  - Add next-intl plugin
  - Configure i18n settings

- [ ] **1.4:** Create translation files structure
  - [ ] **1.4.1:** Create `messages/en.json` with initial structure
  - [ ] **1.4.2:** Create `messages/tr.json` with initial structure

- [ ] **1.5:** Update `middleware.ts`
  - Integrate locale detection with Clerk auth
  - Handle locale routing
  - Exclude API routes

---

## Phase 2: Route Migration

- [ ] **2.1:** Create `[locale]` directory structure
  - Move `app/page.js` → `app/[locale]/page.js`
  - Move `app/layout.js` → `app/[locale]/layout.js`

- [ ] **2.2:** Migrate route groups
  - [ ] **2.2.1:** Move `app/(auth)` → `app/[locale]/(auth)`
  - [ ] **2.2.2:** Move `app/(pages)` → `app/[locale]/(pages)`

- [ ] **2.3:** Migrate other pages
  - [ ] **2.3.1:** Move `app/dashboard` → `app/[locale]/dashboard`
  - [ ] **2.3.2:** Move `app/api-docs` → `app/[locale]/api-docs`

- [ ] **2.4:** Update root layout with NextIntlClientProvider
  - Wrap children with provider
  - Pass messages and locale

- [ ] **2.5:** Verify all routes work
  - Test `/en/` routes
  - Test `/tr/` routes
  - Test API routes (should NOT be localized)

---

## Phase 3: Navigation Translations

- [ ] **3.1:** Extract navigation strings to translation files
  - [ ] **3.1.1:** Add `Navigation` namespace to `en.json`
  - [ ] **3.1.2:** Add `Navigation` namespace to `tr.json`

- [ ] **3.2:** Update `Navbar.jsx`
  - Import `useTranslations`
  - Replace hardcoded labels with `t()` calls
  - Update greeting function for locale

- [ ] **3.3:** Update mobile menu translations
  - All labels and buttons

- [ ] **3.4:** Create `LanguageToggle.jsx` component
  - Dropdown with language options
  - Handle locale switching via router

- [ ] **3.5:** Add LanguageToggle to Navbar
  - Desktop position
  - Mobile position

---

## Phase 4: Homepage Translations

- [ ] **4.1:** Add `Hero` namespace to translation files
  - Title, subtitle, CTA buttons
  - Trust indicators

- [ ] **4.2:** Update `GuestHero.jsx`
  - Replace all text with `t()` calls

- [ ] **4.3:** Update `AuthHero.jsx`
  - Replace all text with `t()` calls

- [ ] **4.4:** Update `HowItWorksSection.jsx`
  - Step descriptions
  - Section titles

- [ ] **4.5:** Update `LoggedInDashboard.jsx`
  - Stats labels
  - CTA text

---

## Phase 5: Assessment Steps Translations

- [ ] **5.1:** Add `Assessment` namespace structure
  - Common assessment text
  - Per-step text

- [ ] **5.2:** Update `LocationStep.jsx`
  - [ ] **5.2.1:** Extract strings
  - [ ] **5.2.2:** Add translations
  - [ ] **5.2.3:** Replace with `t()` calls

- [ ] **5.3:** Update `WeatherDataStep.jsx`
  - Same pattern as 5.2

- [ ] **5.4:** Update `BuildingPlanAnalysisStep.jsx`
  - Same pattern as 5.2

- [ ] **5.5:** Update `BuildingPhotoAnalysisStep.jsx`
  - Same pattern as 5.2

- [ ] **5.6:** Update `SmartBuildingReviewStep.jsx`
  - Same pattern as 5.2

- [ ] **5.7:** Update `FinalReviewStep.jsx`
  - Same pattern as 5.2

- [ ] **5.8:** Update remaining step components
  - IrregularityStep, ExtraLoadStep, etc.

---

## Phase 6: Results Translations

- [ ] **6.1:** Add `Results` namespace to translation files
  - Score labels
  - Risk levels
  - Recommendations

- [ ] **6.2:** Update `SafetyScoreHero.jsx`
  - Grade labels
  - Interpretation text

- [ ] **6.3:** Update `KeyFindings.jsx`
  - Finding labels
  - Categories

- [ ] **6.4:** Update `AIInsightsReveal.jsx`
  - Section headers
  - Common phrases

- [ ] **6.5:** Update other result components
  - ExpertDataPanels, WorstCaseScenario, etc.

---

## Phase 7: Dashboard Translations

- [ ] **7.1:** Add `Dashboard` namespace to translation files

- [ ] **7.2:** Update `DashboardStats.jsx`
  - Stat labels

- [ ] **7.3:** Update `AssessmentList.jsx`
  - List headers
  - Empty states

- [ ] **7.4:** Update `AssessmentCard.jsx`
  - Card labels
  - Actions

---

## Phase 8: AI Content Localization

- [ ] **8.1:** Update AI analysis API routes
  - [ ] **8.1.1:** Update `analyze-image/route.js`
  - [ ] **8.1.2:** Update `analyze-building-photos/route.js`
  - [ ] **8.1.3:** Update `analyze-building-plans/route.js`

- [ ] **8.2:** Add locale detection in API routes
  - Read locale from header or cookie
  - Add language instruction to prompts

---

## Phase 9: Common & Error Translations

- [ ] **9.1:** Add `Common` namespace
  - Buttons (Save, Cancel, Next, Back)
  - Loading states
  - Confirmations

- [ ] **9.2:** Add `Errors` namespace
  - Error messages
  - Validation messages

- [ ] **9.3:** Update form components
  - Labels and placeholders

---

## Phase 10: Polish & Testing

- [ ] **10.1:** Review all translations for quality
  - Native speaker review of Turkish
  - Consistency check

- [ ] **10.2:** Test all user flows in Turkish
  - Complete assessment
  - View results
  - Dashboard actions

- [ ] **10.3:** Test edge cases
  - Missing translations fallback
  - Long text handling
  - RTL check (not needed for Turkish)

- [ ] **10.4:** Performance testing
  - Bundle size check
  - Load time comparison

- [ ] **10.5:** Final commit and documentation
  - Update README if needed
  - Document translation process
