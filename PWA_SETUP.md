# PWA Setup Guide

Your Next.js Earthquake Safety app is now configured as a Progressive Web App (PWA)! Users can install it on their devices for quick access.

## 🎯 What's Included

### ✅ Completed Setup

1. **PWA Configuration**
   - `next-pwa` package installed and configured
   - Service worker auto-generated on build
   - Offline caching strategies for assets, APIs, and pages

2. **Web App Manifest** (`/public/manifest.json`)
   - App name, icons, and colors configured
   - Shortcuts to assessment and dashboard
   - Installable on Android, iOS, and Desktop

3. **Install Prompt Component** (`/components/PWAInstallPrompt.jsx`)
   - Smart detection for iOS and Android/Desktop
   - Auto-shows after 3 seconds
   - Dismissable with 7-day cooldown
   - Beautiful animated UI with benefits list

4. **PWA Meta Tags** (in `app/layout.js`)
   - Theme colors for light/dark mode
   - Apple touch icons
   - iOS splash screens
   - SEO and social media tags

5. **Caching Strategies**
   - **Google Fonts**: Cache-first (1 year)
   - **Images**: Cache-first (30 days)
   - **Static assets**: Stale-while-revalidate (24 hours)
   - **API calls**: Network-first (5 min cache)
   - **Pages**: Network-first (24 hour cache)

## 📋 Required: Add App Icons

You need to create PWA icons for your app. Here's how:

### Option 1: Use PWA Asset Generator (Recommended)

1. Install the tool:
   ```bash
   npm install -g pwa-asset-generator
   ```

2. Create a source icon (1024x1024px PNG with your app logo)
   Save it as `public/logo.png`

3. Generate all icons and splash screens:
   ```bash
   pwa-asset-generator public/logo.png public/icons \
     --icon-only \
     --favicon \
     --type png \
     --quality 100 \
     --padding "10%" \
     --background "#3b82f6"

   pwa-asset-generator public/logo.png public/splash \
     --splash-only \
     --type png \
     --quality 100 \
     --background "#3b82f6"
   ```

### Option 2: Use Online Tools

1. Visit [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Upload your 512x512px app logo
3. Download the generated zip file
4. Extract icons to `public/icons/` and splash screens to `public/splash/`

### Option 3: Manual Creation

Create PNG files with these exact names and sizes in `public/icons/`:

- `icon-16x16.png` (16×16)
- `icon-32x32.png` (32×32)
- `icon-72x72.png` (72×72)
- `icon-96x96.png` (96×96)
- `icon-128x128.png` (128×128)
- `icon-144x144.png` (144×144)
- `icon-152x152.png` (152×152)
- `icon-167x167.png` (167×167)
- `icon-180x180.png` (180×180)
- `icon-192x192.png` (192×192)
- `icon-384x384.png` (384×384)
- `icon-512x512.png` (512×512)
- `favicon.ico` (32×32, in `public/`)

### Icon Design Tips

- Use a simple, recognizable icon
- Earthquake/building theme (e.g., building with checkmark, shield with waves)
- Ensure icon works at small sizes
- Use consistent branding colors (#3b82f6 blue recommended)
- Add 10% padding around the icon for safety

## 📱 Testing Your PWA

### On Desktop (Chrome/Edge)

1. Run `npm run build && npm run start`
2. Open `http://localhost:3005` in Chrome
3. Look for install icon in address bar (⊕)
4. Click to install
5. App opens in standalone window

### On Android

1. Deploy to production or use ngrok for local testing
2. Open site in Chrome on Android
3. Banner appears: "Add Earthquake Safety to Home screen"
4. Tap "Install"
5. App appears on home screen

### On iOS (iPhone/iPad)

1. Open site in Safari
2. Look for automatic banner (bottom of screen)
3. Or tap Share button → "Add to Home Screen"
4. Enter name and tap "Add"
5. App appears on home screen

## 🧪 PWA Audit

Test your PWA with Lighthouse:

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

Target: **90+ PWA score**

## 🚀 Deployment Checklist

Before deploying, ensure:

- [ ] Icons generated and placed in `public/icons/`
- [ ] Splash screens in `public/splash/` (iOS)
- [ ] Screenshots in `public/screenshots/` (optional but recommended)
- [ ] `manifest.json` has correct URLs
- [ ] HTTPS enabled (required for PWA)
- [ ] Service worker registered successfully

## 🔧 Customization

### Change Theme Colors

Edit `public/manifest.json`:
```json
{
  "theme_color": "#3b82f6",  // Your brand color
  "background_color": "#ffffff"  // Background color
}
```

Also update in `app/layout.js`:
```jsx
<meta name="theme-color" content="#3b82f6" />
```

### Modify Install Prompt Timing

Edit `components/PWAInstallPrompt.jsx`:
```javascript
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // Change from 3000ms (3 seconds) to your preference
```

### Adjust Cache Duration

Edit `next.config.mjs`:
```javascript
expiration: {
  maxAgeSeconds: 24 * 60 * 60, // Change as needed
}
```

### Disable PWA in Development

PWA is already disabled in development mode. To enable:

Edit `next.config.mjs`:
```javascript
disable: false, // Changed from: disable: process.env.NODE_ENV === 'development'
```

## 📊 Service Worker Caching

Your app caches:

1. **Static Resources** (JS, CSS)
   - Stale-while-revalidate
   - Shows cached version instantly, updates in background

2. **Images** (JPG, PNG, WebP)
   - Cache-first
   - Offline-ready images

3. **Pages**
   - Network-first
   - Falls back to cache if offline

4. **API Calls** (OpenAI, etc.)
   - Network-first with 5-minute cache
   - Reduces API costs

## 🐛 Troubleshooting

### Install Button Not Showing

- Check browser console for errors
- Ensure HTTPS (localhost is OK)
- Must have 192x192 and 512x512 icons
- Clear browser cache and reload

### Service Worker Not Registering

```bash
# Clear Next.js cache
rm -rf .next
npm run build
npm run start
```

### Icons Not Loading

- Check file names match exactly
- Ensure files are in `public/icons/`
- Clear browser cache
- Check DevTools Network tab

### iOS Not Showing Banner

- iOS requires manual "Add to Home Screen"
- Or use the custom prompt component (shows instructions)

## 📝 Files Created

```
/public/
  ├── manifest.json         # PWA manifest
  ├── icons/               # App icons (you need to add these)
  ├── splash/              # iOS splash screens (you need to add these)
  └── screenshots/         # App screenshots (optional)

/components/
  └── PWAInstallPrompt.jsx # Install prompt component

/app/
  └── layout.js            # Updated with PWA meta tags

next.config.mjs            # PWA configuration
```

## 🎨 Icon Recommendations

For the earthquake safety app, consider:

- **Building with shield**: Represents safety/protection
- **Checkmark on building**: Indicates assessment/approval
- **Seismic waves with building**: Shows earthquake theme
- **Warning triangle with building**: Safety focus

Use flat design with 2-3 colors maximum for best results.

## 🌐 Production Deployment

After adding icons:

```bash
# Build production version
npm run build

# Service worker will be generated automatically
# Files created: public/sw.js, public/workbox-*.js

# Start production server
npm run start

# Or deploy to Vercel/Netlify
git push
```

## 📱 Features After Installation

Users get:

- ✅ **Home screen icon** - One tap to launch
- ✅ **Standalone mode** - Looks like native app
- ✅ **Offline access** - Works without internet
- ✅ **Fast loading** - Cached assets
- ✅ **Push notifications** - (can be added later)
- ✅ **Background sync** - (can be added later)

## 🎉 Success!

Your earthquake safety app is now a fully-featured PWA! Users can install it on their phones and access it anytime, even offline.

---

**Next Steps:**
1. Add app icons using one of the methods above
2. Test on mobile devices
3. Deploy to production with HTTPS
4. Share the install link with users!
