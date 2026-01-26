# 🚀 PWA Quick Reference Card

## ⚡ 3-Step Setup

### 1️⃣ Generate Icons (5 minutes)

```bash
# Open in browser:
icon-generator.html

# Download all 13 icons → place in public/icons/
```

### 2️⃣ Test Locally

```bash
npm run dev
# Open: http://localhost:5173
# DevTools → Application → Verify manifest & service worker
```

### 3️⃣ Deploy to Production

```bash
npm run build
# Deploy to HTTPS server (required for PWA)
```

---

## 📁 File Structure Created

```
✅ public/manifest.json          # PWA config
✅ public/sw.js                  # Service Worker
✅ src/utils/registerServiceWorker.ts
✅ index.html                    # PWA meta tags
✅ src/main.tsx                  # SW registration
⚠️ public/icons/                 # CREATE THESE!
   ├── icon-16x16.png
   ├── icon-32x32.png
   ├── icon-72x72.png
   ├── icon-96x96.png
   ├── icon-128x128.png
   ├── icon-144x144.png
   ├── icon-152x152.png
   ├── icon-192x192.png          # REQUIRED
   ├── icon-384x384.png
   ├── icon-512x512.png          # REQUIRED
   ├── apple-touch-icon.png
   ├── qr-shortcut.png
   └── subscription-shortcut.png
```

---

## 🧪 Testing Checklist

- [ ] Icons created (all 13 files)
- [ ] `npm run dev` runs without errors
- [ ] DevTools → Application → Manifest shows icons
- [ ] Console: `[SW] Service Worker registered successfully`
- [ ] Desktop: Install button appears in address bar
- [ ] Mobile: "Add to Home Screen" works (HTTPS only)

---

## 🎯 What Users Get

✅ **Home Screen Icon** - Tap to launch instantly  
✅ **Fullscreen Mode** - No browser UI  
✅ **Offline Support** - Works without internet  
✅ **Fast Loading** - Cached assets load instantly  
✅ **Native Feel** - Like a real app

---

## 🔧 Key Configuration

### Theme Color (3 places)

```json
// public/manifest.json
"theme_color": "#4A90E2"
```

```html
<!-- index.html -->
<meta name="theme-color" content="#4A90E2" />
```

### App Name

```json
// public/manifest.json
"name": "Narodniy+ Loyalty Program",
"short_name": "Narodniy+"
```

### Cache Version (update on deploy)

```js
// public/sw.js
const CACHE_NAME = 'narodniy-v1'; // Change to v2, v3...
```

---

## 🐛 Troubleshooting

| Issue              | Solution                                 |
| ------------------ | ---------------------------------------- |
| SW not registering | Must be localhost or HTTPS               |
| Icons not showing  | Check paths, hard refresh (Ctrl+Shift+R) |
| No install prompt  | Need 192x192 + 512x512 icons             |
| Caching issues     | DevTools → Application → Clear storage   |
| iOS not working    | Manual: Share → Add to Home Screen       |

---

## 📚 Documentation

- **Full Guide**: [PWA-SETUP.md](PWA-SETUP.md) - Complete setup instructions
- **Quick Start**: [public/icons/README.md](public/icons/README.md) - Icon generation
- **Summary**: [PWA-IMPLEMENTATION.md](PWA-IMPLEMENTATION.md) - What was created
- **Icon Tool**: `icon-generator.html` - Generate placeholder icons

---

## 🎨 Icon Generation Tools

**Quick Placeholders:**

- Open `icon-generator.html` → Generate → Download

**Professional:**

- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Figma/Canva (export 512x512)

---

## ⚡ Commands

```bash
npm run dev       # Development with hot reload
npm run build     # Production build
npm run preview   # Test production build locally
npm run lint      # Check code quality
```

---

## 🚨 IMPORTANT

⚠️ **Icons Required**: App won't install without 192x192 and 512x512 icons  
🔒 **HTTPS Required**: PWA features only work on localhost or HTTPS  
📱 **iOS Manual**: iPhone users must manually add via Share button  
🔄 **Cache Updates**: Change `CACHE_NAME` in sw.js when deploying updates

---

**Ready?** Run `npm run dev` and open DevTools → Application tab!
