# Problem Definition - Turkish i18n

## Clear Problem Statement

**QuakeWise is an earthquake safety assessment platform targeting Turkey, but it only supports English, preventing Turkish-speaking users from fully understanding and acting on critical safety information.**

## User Impact

### Without This Feature:
- Turkish users cannot fully comprehend safety assessments
- Recommendations may be misunderstood or ignored
- Professional use cases (reports for authorities) are limited
- Platform adoption is restricted to English-speaking minority

### With This Feature:
- Full comprehension of all safety information
- Higher trust in recommendations
- Professional-grade Turkish documentation
- Market expansion to entire Turkish population

### Impact Metrics:
| Metric | Before | Expected After |
|--------|--------|---------------|
| Turkish user comprehension | 30% (estimate) | 100% |
| User retention (Turkey) | Moderate | High |
| Professional adoption | Limited | Enabled |
| Word-of-mouth referrals | Low | High |

## Business Impact

### Market Opportunity
- Turkey population: 85+ million
- High earthquake risk awareness (post-2023 earthquakes)
- Growing demand for building safety assessment
- Limited competition in Turkish language

### Revenue Implications
- Unlocks Turkish market fully
- Enables B2B sales to Turkish companies
- Professional reports can be premium feature
- Foundation for multi-language expansion (Arabic, etc.)

### Competitive Position
- First-mover advantage in Turkish earthquake safety apps
- Differentiator against English-only competitors
- Builds brand trust in local market

## Scope Boundaries

### In Scope:
- Complete Turkish translation of all UI text
- Language toggle in navigation
- Persistent language preference
- Turkish AI analysis output (via prompts)
- SEO for Turkish language pages
- RTL consideration (not needed for Turkish)

### Out of Scope:
- Other languages (Arabic, Kurdish, etc.) - future phases
- Machine translation - all translations human-quality
- User-generated content translation
- API response internationalization (internal APIs remain English)
- Database content translation (assessment data)

### Future Considerations:
- PDF reports in Turkish (separate feature)
- Multi-region deployment (Turkey-specific server)
- Currency/date formatting (Turkish format)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | High | Professional review of translations |
| Middleware conflict with Clerk | Low | High | Test thoroughly, check Clerk i18n docs |
| Route structure breaks | Medium | High | Incremental migration, extensive testing |
| Performance impact | Low | Medium | Lazy-load translations, optimize bundle |
| Missing translations | High | Low | Fallback to English, log missing keys |

## Decision Points

### Technical Decisions Made:
1. **Library:** next-intl (based on 2025 research)
2. **Routing:** `[locale]` segment with middleware
3. **Default language:** English
4. **Translation storage:** JSON files in `messages/`

### Design Decisions Made:
1. **Toggle location:** Navbar (near theme toggle)
2. **Toggle design:** Language name dropdown
3. **Persistence:** localStorage + cookie for SSR

## Success Definition

The feature is successful when:
1. A Turkish user can complete full assessment in Turkish
2. All UI elements display in Turkish when selected
3. Language preference persists across sessions
4. No performance degradation
5. No breaking changes to existing functionality
