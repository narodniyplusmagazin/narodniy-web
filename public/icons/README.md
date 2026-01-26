# 🚀 Quick Start - PWA Icons

## Immediate Actions Required

You need to create icons in the `public/icons/` folder. Here are your options:

### ⚡ Option 1: Quick Placeholder Icons (5 minutes)

1. Open `icon-generator.html` in your browser
2. Customize text (default: "N+") and colors
3. Click "Generate Icons"
4. Download all icons and place in `public/icons/` folder

### 🎨 Option 2: Professional Icons (Recommended)

1. Design a 512x512px square logo (Figma/Photoshop/Canva)
2. Go to https://realfavicongenerator.net/
3. Upload your logo and download the generated pack
4. Copy all icons to `public/icons/` folder

### 📦 Required Icon Files

Create these files in `public/icons/`:

```
icon-16x16.png           # Browser favicon
icon-32x32.png           # Browser favicon
icon-72x72.png           # Android
icon-96x96.png           # Android
icon-128x128.png         # Android
icon-144x144.png         # Android
icon-152x152.png         # Android
icon-192x192.png         # PWA standard (required)
icon-384x384.png         # PWA standard
icon-512x512.png         # PWA standard (required)
apple-touch-icon.png     # iOS (180x180)
qr-shortcut.png          # App shortcut (96x96)
subscription-shortcut.png # App shortcut (96x96)
```

## ✅ Testing Your PWA

### Desktop

1. Run: `npm run build && npm run preview`
2. Open: http://localhost:4173
3. DevTools → Application → Manifest (verify icons)
4. DevTools → Application → Service Workers (should see "activated")

### Mobile (requires HTTPS in production)

1. Deploy to HTTPS server
2. Visit on mobile device
3. Look for "Add to Home Screen" prompt
4. Or: Browser menu → "Install app"

## 🔍 Verification Checklist

- [ ] Icons folder created: `public/icons/`
- [ ] All 13 icon files present
- [ ] `npm run dev` works without errors
- [ ] Open DevTools → Application → Manifest shows all icons
- [ ] Console shows: `[SW] Service Worker registered successfully`
- [ ] No errors in console

## 🆘 Troubleshooting

**Icons not showing in DevTools:**

- Check file paths match exactly (case-sensitive)
- Verify files are in `public/icons/` not `src/icons/`
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Service Worker not registering:**

- Check console for errors
- Must be on localhost or HTTPS
- Clear cache: DevTools → Application → Clear storage

**"Add to Home Screen" not appearing:**

- Icons must exist (192x192 and 512x512 are required)
- Manifest must be valid (check Application tab)
- Service worker must be active
- On iOS: manually tap Share → Add to Home Screen

## 📱 What Users Will See

### Android Chrome

- Install prompt after 2+ visits
- "Add to Home Screen" in menu
- Icon appears on home screen
- Opens without browser UI

### iOS Safari

- No automatic prompt
- Manual: Share → Add to Home Screen
- Icon appears on home screen
- Opens in standalone mode

### Desktop Chrome/Edge

- Install button in address bar
- Or: Menu → Install Narodniy+
- Creates desktop shortcut
- Opens in app window

## 🎯 Next Steps

1. **Generate icons now** using one of the options above
2. **Test locally**: `npm run dev` and check DevTools
3. **Deploy to HTTPS** when ready for production testing
4. **Test on real devices** to verify install functionality

See full documentation in [PWA-SETUP.md](PWA-SETUP.md)
