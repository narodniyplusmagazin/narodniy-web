# PWA Setup Guide for Narodniy+

This guide explains how to set up and customize the Progressive Web App (PWA) functionality.

## 📁 File Structure

```
public/
├── manifest.json          # PWA manifest configuration
├── sw.js                  # Service Worker for caching
└── icons/                 # App icons folder (create this)
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png (180x180)
    ├── qr-shortcut.png (96x96)
    └── subscription-shortcut.png (96x96)

src/
└── utils/
    └── registerServiceWorker.ts  # Service Worker registration logic
```

## 🎨 Creating Icons

### Option 1: Using an Online Tool (Recommended)

1. Create a square logo (512x512px minimum) with your brand
2. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
3. Upload your logo
4. Download the generated icon pack
5. Place all icons in `public/icons/` folder

### Option 2: Manual Creation

Use any image editor (Photoshop, Figma, Canva):

- Start with a 512x512px square design
- Ensure important elements are in the center (safe zone)
- Export in PNG format at these sizes:
  - 16x16, 32x32 (favicon)
  - 72x72, 96x96, 128x128, 144x144, 152x152 (Android)
  - 180x180 (Apple Touch Icon)
  - 192x192, 384x384, 512x512 (PWA standards)

### Quick Icon Generation with ImageMagick

If you have a 512x512 source image (`logo.png`):

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Generate all sizes
magick logo.png -resize 16x16 public/icons/icon-16x16.png
magick logo.png -resize 32x32 public/icons/icon-32x32.png
magick logo.png -resize 72x72 public/icons/icon-72x72.png
magick logo.png -resize 96x96 public/icons/icon-96x96.png
magick logo.png -resize 128x128 public/icons/icon-128x128.png
magick logo.png -resize 144x144 public/icons/icon-144x144.png
magick logo.png -resize 152x152 public/icons/icon-152x152.png
magick logo.png -resize 192x192 public/icons/icon-192x192.png
magick logo.png -resize 384x384 public/icons/icon-384x384.png
magick logo.png -resize 512x512 public/icons/icon-512x512.png
magick logo.png -resize 180x180 public/icons/apple-touch-icon.png
```

## ⚙️ Configuration

### 1. Manifest (public/manifest.json)

Already configured with:

- App name: "Narodniy+ Loyalty Program"
- Theme color: #4A90E2 (blue)
- Standalone display mode
- App shortcuts to QR and Subscription pages

**Customize:**

- Change `theme_color` to match your brand
- Update `background_color` if needed
- Modify `shortcuts` URLs if your routes differ

### 2. Service Worker (public/sw.js)

Caching strategies:

- **Static assets**: Cache-first (fast loading)
- **API calls**: Network-first with cache fallback (fresh data)

**Customize:**

- Update `CACHE_NAME` when deploying new versions
- Add/remove URLs from `PRECACHE_URLS`
- Adjust caching strategies in fetch handler

### 3. Theme Color

Current: `#4A90E2`

To change, update in 3 places:

1. `public/manifest.json` → `theme_color`
2. `index.html` → `<meta name="theme-color">`
3. Optionally in `src/shared/constants/theme.ts`

## 📱 Testing PWA

### Desktop (Chrome/Edge)

1. Run `npm run dev` or `npm run build && npm run preview`
2. Open DevTools → Application → Manifest
3. Click "Application" → "Service Workers" to verify registration
4. Look for install prompt or manually add via browser menu

### Mobile (Android Chrome)

1. Deploy to HTTPS server (required for PWA)
2. Visit site on mobile
3. Look for "Add to Home Screen" prompt
4. Or tap menu → "Install app" / "Add to Home Screen"

### iOS Safari

1. Visit site on iPhone/iPad
2. Tap Share button → "Add to Home Screen"
3. Icon and name from manifest will appear
4. Opens in standalone mode (no browser UI)

## 🚀 Deployment Checklist

- [ ] Create all icon files in `public/icons/`
- [ ] Verify icons display correctly (check DevTools → Application → Manifest)
- [ ] Test service worker registration (check console for `[SW]` logs)
- [ ] Deploy to HTTPS (PWA requires secure context)
- [ ] Test "Add to Home Screen" on mobile
- [ ] Verify app opens in standalone mode
- [ ] Test offline functionality (disable network in DevTools)

## 🔧 Advanced Features

### Install Prompt

Add a custom install button (optional):

```tsx
// src/components/InstallPrompt.tsx
import { useEffect, useState } from 'react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return <button onClick={handleInstall}>Install App</button>;
};
```

### Offline Page

Create a fallback page for when offline:

```tsx
// src/pages/offline/index.tsx
export const OfflinePage = () => (
  <div>
    <h1>You're offline</h1>
    <p>Please check your internet connection</p>
  </div>
);
```

Then in `sw.js`, add offline fallback:

```js
// Add to PRECACHE_URLS
'/offline.html'

  // In fetch handler catch block
  .catch(() => caches.match('/offline.html'));
```

### Push Notifications (Future)

To add push notifications:

1. Get VAPID keys from Firebase Cloud Messaging
2. Request notification permission
3. Subscribe user to push service
4. Handle push events in service worker

## 🐛 Troubleshooting

**Service Worker not registering:**

- Check browser console for errors
- Ensure you're on localhost or HTTPS
- Clear browser cache and hard reload

**Icons not showing:**

- Verify icon paths in manifest.json
- Check file names match exactly (case-sensitive)
- Icons must be in `public/icons/` folder

**"Add to Home Screen" not appearing:**

- PWA criteria: HTTPS, valid manifest, service worker, icons
- On iOS: manually use Share → Add to Home Screen
- On Android: may need 2+ visits to site

**Caching issues during development:**

- Unregister service worker in DevTools
- Or call `unregisterServiceWorker()` from utils
- Use "Update on reload" in DevTools → Application → Service Workers

## 📚 Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox (Google's SW library)](https://developers.google.com/web/tools/workbox)
