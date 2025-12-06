# UI Design - Turkish i18n

## Language Toggle Component

### Location
- **Desktop:** Navbar, right side, between theme toggle and user button
- **Mobile:** In mobile sheet menu, near top

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│ Logo   Home  Dashboard  About  [Start Assessment]   🌙  [EN ▼]  👤 │
└─────────────────────────────────────────────────────────────┘
                                                       ↑
                                                Language Toggle
```

### Component States

**Closed State:**
```jsx
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100">
  <Globe className="w-4 h-4" />
  <span className="text-sm font-medium">EN</span>
  <ChevronDown className="w-3 h-3" />
</button>
```

**Open State (Dropdown):**
```
┌─────────────────┐
│  🌐 English  ✓  │
├─────────────────┤
│  🌐 Türkçe      │
└─────────────────┘
```

### Component Code Structure

```jsx
// components/navigation/LanguageToggle.jsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale) => {
    // Replace current locale in pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const currentLanguage = languages.find(l => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium uppercase">{locale}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between"
          >
            <span>{lang.nativeName}</span>
            {locale === lang.code && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Navbar Integration

### Desktop Layout

```jsx
// In Navbar.jsx
<div className="flex items-center space-x-2">
  <ThemeToggle />
  <LanguageToggle />
  {isSignedIn && user && (
    <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200">
      <span className="text-xs text-muted-foreground">{getGreeting()}</span>
      <UserButton afterSignOutUrl="/" />
    </div>
  )}
</div>
```

### Mobile Layout

In mobile sheet menu, add language toggle section:

```jsx
// In mobile sheet content
<div className="p-4 border-t border-gray-200">
  <LanguageToggle variant="mobile" />
</div>
```

Mobile variant shows full language names:
```
┌─────────────────────────────────┐
│  🌐 Language                    │
│  ┌─────────────────────────┐    │
│  │ ○ English               │    │
│  │ ● Türkçe                │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

## Translation Display Examples

### Before/After Comparison

**Homepage Hero (English):**
```
Earthquake Safety
Reimagined with AI

Upload photos. Get instant analysis.
Receive your safety score in minutes.

[Start AI Assessment]
```

**Homepage Hero (Turkish):**
```
Deprem Güvenliği
Yapay Zeka ile Yeniden Tasarlandı

Fotoğraf yükleyin. Anında analiz alın.
Dakikalar içinde güvenlik puanınızı öğrenin.

[AI Değerlendirmesini Başlat]
```

### Navigation (English → Turkish)

| English | Turkish |
|---------|---------|
| Home | Ana Sayfa |
| Dashboard | Kontrol Paneli |
| Assessments | Değerlendirmeler |
| About | Hakkında |
| Start Assessment | Değerlendirmeye Başla |
| Continue | Devam Et |
| Sign In | Giriş Yap |

### Assessment Steps (English → Turkish)

| Step | English | Turkish |
|------|---------|---------|
| 1 | Location Detection | Konum Tespiti |
| 2 | Environmental Analysis | Çevresel Analiz |
| 3 | AI Plan Analysis | AI Plan Analizi |
| 4 | AI Photo Analysis | AI Fotoğraf Analizi |
| 5 | Building Review | Bina İncelemesi |
| 6 | Final Review | Son İnceleme |

### Results Page Elements

| English | Turkish |
|---------|---------|
| Safety Score | Güvenlik Puanı |
| Key Findings | Önemli Bulgular |
| Recommendations | Öneriler |
| Risk Level | Risk Seviyesi |
| Low | Düşük |
| Moderate | Orta |
| High | Yüksek |
| Very High | Çok Yüksek |

## Responsive Considerations

### Breakpoints
- **Mobile (< 768px):** Language toggle in mobile menu
- **Tablet (768px - 1024px):** Compact toggle in navbar
- **Desktop (> 1024px):** Full toggle with label

### Text Length Considerations
Turkish text is often longer than English:
- "Start" → "Başla" (shorter)
- "Assessment" → "Değerlendirme" (longer)
- "Continue" → "Devam Et" (similar)

Ensure buttons have flexible width or truncation:
```jsx
<Button className="min-w-[120px] whitespace-nowrap">
  {t('startAssessment')}
</Button>
```

## Accessibility

### ARIA Labels
```jsx
<Button
  aria-label={t('changeLanguage')}
  aria-expanded={isOpen}
>
```

### Keyboard Navigation
- Tab to focus toggle
- Enter/Space to open dropdown
- Arrow keys to navigate options
- Enter to select
- Escape to close

### Screen Reader Announcements
```jsx
// After language change
<div role="status" aria-live="polite" className="sr-only">
  {t('languageChangedTo', { language: newLanguage })}
</div>
```

## Animation

### Dropdown Animation
Use existing Radix UI animation from DropdownMenu:
```css
/* Already configured in dropdown-menu.jsx */
animation: slideDown 0.2s ease-out;
```

### Language Switch
No page reload - React re-renders with new translations instantly.

Optional: Brief fade transition on content:
```jsx
<motion.div
  key={locale}
  initial={{ opacity: 0.8 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.15 }}
>
  {children}
</motion.div>
```
