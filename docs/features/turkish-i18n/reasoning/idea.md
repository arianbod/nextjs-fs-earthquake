# Core Idea - Turkish i18n

## What is the core idea?
Add complete Turkish language support to QuakeWise with a language toggle, enabling users to switch between English and Turkish throughout the entire application.

## Why does this feature need to exist?

### Market Necessity
- QuakeWise primarily targets Turkey, where TBDY-2018 building codes apply
- Many Turkish users are not fluent in English
- Earthquake safety information is critical - users must fully understand their results
- Current English-only interface limits adoption and comprehension

### Competitive Advantage
- Most earthquake assessment tools are English-only
- Being Turkish-native differentiates QuakeWise in the Turkey market
- First mover advantage in Turkish earthquake safety apps

### User Trust
- Native language increases trust in safety recommendations
- Turkish-speaking users more likely to follow safety guidance they understand
- Professional reports in Turkish are more valuable for local use cases

## What value does it bring to users?

### For Turkish-Speaking Users:
1. **Full comprehension** - Understand every assessment step and result
2. **Actionable guidance** - Follow safety recommendations correctly
3. **Professional documentation** - Export Turkish reports for local authorities
4. **Trust** - Native language feels more authoritative for safety information
5. **Accessibility** - Removes language barrier for non-English speakers

### For the Platform:
1. **Market expansion** - Access to entire Turkish-speaking population
2. **User retention** - Users stay when they understand the interface
3. **Word-of-mouth** - Turkish users recommend to Turkish-speaking contacts
4. **Professional use** - Enables B2B adoption in Turkey
5. **Foundation** - i18n infrastructure enables future language additions

## Target Languages

| Language | Code | Priority | Reason |
|----------|------|----------|--------|
| English | `en` | Default | Current language, international users |
| Turkish | `tr` | Primary | Target market (Turkey) |

## Success Metrics

- 100% of UI text translatable
- Language toggle accessible from any page
- User language preference persisted across sessions
- No page refresh required for language switch
- All assessment steps available in Turkish
- All results and recommendations in Turkish
- AI analysis returns Turkish content when Turkish is selected
