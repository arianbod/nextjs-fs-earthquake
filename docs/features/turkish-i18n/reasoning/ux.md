# UX Research - Turkish i18n

## Primary Users

### User Persona 1: Turkish Homeowner
- **Name:** Ahmet, 45
- **Location:** Istanbul
- **English Level:** Basic (can read simple words)
- **Goal:** Assess earthquake safety of apartment
- **Pain Point:** Can't understand detailed safety recommendations in English
- **Need:** Complete Turkish interface to make informed decisions

### User Persona 2: Turkish Building Manager
- **Name:** Fatma, 38
- **Location:** Ankara
- **English Level:** Intermediate
- **Goal:** Generate reports for multiple buildings
- **Pain Point:** Need official Turkish documentation for local authorities
- **Need:** Turkish PDF reports for professional use

### User Persona 3: International User
- **Name:** Sarah, 32
- **Location:** Los Angeles
- **English Level:** Native
- **Goal:** Quick earthquake assessment of California property
- **Pain Point:** None related to language
- **Need:** English interface (default)

## Current User Flow (English Only)

```
User lands on homepage (English)
    ↓
User navigates to assessment (English instructions)
    ↓
User follows 6 steps (English labels, AI responses in English)
    ↓
User receives results (English explanations)
    ↓
User reads recommendations (English, may not fully understand)
```

## Desired User Flow (With Language Toggle)

```
User lands on homepage
    ↓
System detects browser language (or previous preference)
    ↓
If Turkish browser → Auto-switch to Turkish
    ↓
User sees language toggle in navbar
    ↓
User can switch language at any time
    ↓
All content updates instantly (no page reload)
    ↓
User preference saved for next visit
```

## Language Toggle Design

### Location
- **Desktop:** Top-right of navbar, near theme toggle
- **Mobile:** In mobile menu drawer

### Design Options

**Option A: Flag + Code**
```
[🇹🇷 TR ▼]
```
- Pro: Visual, compact
- Con: Flags can be controversial (language ≠ country)

**Option B: Language Name**
```
[English ▼] / [Türkçe ▼]
```
- Pro: Clear, inclusive
- Con: Takes more space

**Option C: Globe Icon + Code**
```
[🌐 EN ▼]
```
- Pro: Neutral, compact
- Con: Less discoverable

### Recommendation
**Use Option B (Language Name)** - Clearest for users, avoids flag controversy. Display current language name in that language ("English" or "Türkçe").

### Toggle Behavior
1. Click opens dropdown with language options
2. Selecting language updates instantly
3. No page refresh required
4. Preference saved to localStorage
5. Toast notification confirms: "Dil değiştirildi" / "Language changed"

## Content Priority for Translation

### Phase 1: Critical (Must Have)
- Navigation labels (Home, Dashboard, About, etc.)
- Hero section text
- Assessment step instructions
- Button labels (Continue, Back, Start, etc.)
- Error messages

### Phase 2: Important (Should Have)
- Results page explanations
- Safety recommendations
- Dashboard labels
- Form labels and placeholders

### Phase 3: Nice to Have
- About page content
- Footer text
- Tooltips
- Help documentation

## AI Content Considerations

### Claude AI Analysis
- AI prompts should request Turkish output when Turkish is selected
- Example: "Respond in Turkish (Türkçe)" added to prompts
- AI-generated recommendations should be in Turkish

### Pre-defined Content
- Safety ratings (A-F grades) - universal, no translation needed
- Numerical scores - universal
- Building types - keep technical terms, add Turkish labels

## Accessibility Considerations

- `lang` attribute must update on `<html>` element
- Right-to-left (RTL) support not needed (Turkish is LTR)
- Screen readers should announce language change
- Keyboard navigation for language toggle

## Error States

### Language-Specific Errors
- "Konum bulunamadı" / "Location not found"
- "Fotoğraf yüklenemedi" / "Photo upload failed"
- "Bir hata oluştu" / "An error occurred"

### Fallback Behavior
- If translation missing → Show English text
- Log missing translation keys for monitoring

## Success Criteria for UX

1. **Discoverability:** Users can find language toggle within 5 seconds
2. **Instant Switch:** Language changes in < 200ms (no page reload)
3. **Persistence:** Preference remembered across sessions
4. **Consistency:** All UI elements translate together
5. **Clarity:** Turkish text is native-quality, not machine-translated
