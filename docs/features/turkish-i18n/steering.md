# Steering - Turkish i18n

## Current State
<!-- AUTO-UPDATED BY AI - Do not manually edit unless AI loses track -->
**Active Task:** None (Planning complete, ready for Action)
**Task Name:** -
**Current Approach:** Original
**Started:** 2025-11-30

---

## Original Feature Direction
<!-- IMMUTABLE - Copied from reasoning/result.md when created -->
<!-- This is your rollback point - NEVER EDIT -->

**Date:** 2025-11-30

Add complete Turkish language support to QuakeWise using next-intl library, with URL-based locale routing (`/en/`, `/tr/`) and a language toggle in the navigation.

**Key Decisions:**
- Library: next-intl (5KB, native App Router support)
- Routing: URL-based with `[locale]` segment
- Default locale: English (`en`)
- Supported locales: English (`en`), Turkish (`tr`)
- Translation storage: JSON files in `messages/`
- Toggle location: Navbar, near theme toggle

---

## Global Steering
<!-- Feature-wide direction changes - affects ALL tasks -->
<!-- Use sparingly - only for major pivots or pauses -->

- Original: Proceeding with planned implementation

---

## Task Steering
<!-- Per-task direction changes -->
<!-- AI automatically adds entries here when you give steering -->
<!-- Latest line per task = active approach for that task -->

### Phase 1: Infrastructure

#### Task 1.1: Install next-intl
**Status:** Not Started
- Original: npm install next-intl

#### Task 1.2: Create i18n configuration files
**Status:** Not Started
- Original: Create routing.ts and request.ts

#### Task 1.3: Update next.config.mjs
**Status:** Not Started
- Original: Add next-intl plugin

#### Task 1.4: Create translation files
**Status:** Not Started
- Original: Create en.json and tr.json with initial structure

#### Task 1.5: Update middleware.ts
**Status:** Not Started
- Original: Integrate locale detection with Clerk auth

### Phase 2: Route Migration

#### Task 2.1: Create [locale] directory structure
**Status:** Not Started
- Original: Move app routes under [locale]

#### Task 2.2: Migrate route groups
**Status:** Not Started
- Original: Move (auth) and (pages) under [locale]

#### Task 2.3: Migrate other pages
**Status:** Not Started
- Original: Move dashboard and api-docs

#### Task 2.4: Update root layout
**Status:** Not Started
- Original: Add NextIntlClientProvider

#### Task 2.5: Verify all routes work
**Status:** Not Started
- Original: Test /en/ and /tr/ routes

### Phase 3: Navigation Translations

#### Task 3.1: Extract navigation strings
**Status:** Not Started
- Original: Add Navigation namespace

#### Task 3.2: Update Navbar.jsx
**Status:** Not Started
- Original: Replace hardcoded labels with t() calls

#### Task 3.3: Update mobile menu
**Status:** Not Started
- Original: Translate all labels and buttons

#### Task 3.4: Create LanguageToggle.jsx
**Status:** Not Started
- Original: Create dropdown component

#### Task 3.5: Add to Navbar
**Status:** Not Started
- Original: Add toggle to desktop and mobile

### Phase 4-10: (See tasks.md for full list)

---

## Session Recovery
<!-- AUTO-UPDATED BY AI when session ends or user interrupts -->

**Last Session:** 2025-11-30
**Was Working On:** Planning phase completion
**File:** docs/features/turkish-i18n/plan/result.md
**Progress:** All planning documents created
**Paused Because:** Planning complete, ready for action
**Resume With:** Start Task 1.1 - npm install next-intl
