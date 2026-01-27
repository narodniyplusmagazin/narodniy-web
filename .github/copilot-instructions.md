# Narodniy+ Web - AI Coding Guide

**Project**: React 19.2 + TypeScript + Vite PWA for subscription-based QR loyalty program  
**Domain**: Users authenticate, subscribe to plans, receive dynamic QR codes for in-store scanning with usage tracking

## Architecture Philosophy

**Strict Separation of Concerns**: Pages are pure presentation components. ALL business logic (API calls, state, effects) lives in custom hooks (`hooks/use<PageName>.ts`). Components receive data/callbacks via props only.

**Example**: [src/pages/subscription/index.tsx](src/pages/subscription/index.tsx) renders UI, [src/pages/subscription/hooks/useSubscriptionScreen.ts](src/pages/subscription/hooks/useSubscriptionScreen.ts) handles `loadData()`, `subscribe()`, all `useState`/`useEffect` logic.

## Critical Patterns

### Feature-Based Page Structure

```
pages/subscription/
  index.tsx              # Default export: SubscriptionScreen component
  style.scss             # Page styles
  components/            # Feature-scoped UI pieces (each with style.scss)
    ActiveSubscriptionCard/
  hooks/
    useSubscriptionScreen.ts  # ALL logic: API, state, effects
```

**Exception**: [src/pages/qr/QrScreen.tsx](src/pages/qr/QrScreen.tsx) uses `QrScreen.tsx` instead of `index.tsx` (legacy naming).

### Custom Hooks Pattern

Every screen hook returns:

- State: `loading`, `error`, `data`
- Callbacks: `handleAction()` functions
- Side effects: Managed internally with `useEffect`

```typescript
// From useSubscriptionScreen.ts
export const useSubscriptionScreen = () => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<SubscriptionType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const subscribe = async () => {
    /* API call */
  };

  return { loading, plan, subscribe };
};
```

### Storage: IndexedDB-Only

**CRITICAL**: Never use `localStorage`. Use `SecureStorageService` (async IndexedDB wrapper):

```typescript
// Available keys (from service)
(AUTH_TOKEN, USER_ID, USER_DATA, SUBSCRIPTION_DATA, BIOMETRIC_ENABLED);

// Usage (always await)
await SecureStorageService.saveAuthToken(token);
const userData = await SecureStorageService.getUserData();
await SecureStorageService.clearAll(); // Logout
```

Why: Larger capacity, async (non-blocking), better security, supports complex data structures.

### API Layer Structure

[src/api/axios-instance.ts](src/api/axios-instance.ts): Configured axios with:

- **Request interceptor**: Auto-injects `Bearer ${token}` from `SecureStorageService`
- **Response interceptor**: Silent error handling (no alerts), 401 handling commented out
- **Base URL**: `http://84.201.180.219:80/` (production), change for local dev

API service files (`auth-api.ts`, `qr-services.ts`, `subscription-api.ts`):

```typescript
// Pattern: Export typed async functions, return res.data
export const getMySubscriptions = async (userId: string) => {
  const res = await api.get(`/subscriptions/user/${userId}`);
  return res.data;
};
```

### Protected Routes

[src/shared/components/ProtectedRoute/ProtectedRoute.tsx](src/shared/components/ProtectedRoute/ProtectedRoute.tsx):

- Async auth check via `SecureStorageService.getAuthToken()`
- Shows "Загрузка..." during IndexedDB read
- Redirects to `/login` if unauthenticated
- Usage: `<Route element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />`

### Routing Structure ([src/App.tsx](src/App.tsx))

```
/ → HomeScreen (public)
/registration → RegistrationScreen (public)
/login → LoginScreen (public)
/profile → ProfileScreen (protected)
/subscription → SubscriptionScreen (protected)
/qr → QRScreen (protected)
```

## Key Technologies

- **State**: Zustand minimal (`auth-store.ts` has single `isAuthenticated` flag), primary state in page hooks
- **Styling**: SCSS modules (one `style.scss` per component/page), kebab-case classes, theme colors in [src/shared/constants/theme.ts](src/shared/constants/theme.ts)
- **Navigation**: `useNavigate` from `react-router-dom` (v7)
- **QR Generation**: `react-qr-code` library, data format: `{ qrCode: string, generatedAt, expiresAt, subscriptionId }`
- **Icons**: `lucide-react`
- **Dates**: `date-fns`

## Development Workflow

```bash
npm run dev       # Vite dev server (HMR enabled)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Test production build locally
```

### Adding a New Feature Page

1. Create `src/pages/<feature>/index.tsx` (component), `style.scss`, `hooks/use<Feature>Screen.ts`
2. Add `components/` subfolder for feature-specific UI
3. Register route in [src/App.tsx](src/App.tsx): `<Route path="/feature" element={<FeatureScreen />} />`
4. Create API service in `src/api/<feature>-api.ts` if backend integration needed
5. Use `<ProtectedRoute>` wrapper if authentication required

### Adding API Endpoint

1. Open relevant `src/api/<service>-api.ts` file
2. Add typed async function:
   ```typescript
   export const myEndpoint = async (param: string) => {
     const res = await api.post('/endpoint', { param });
     return res.data; // Extract data from response
   };
   ```
3. Import/call from page hook (`use*Screen.ts`)

## Current State & Gotchas

1. **Error Handling**: Silent mode active. Check console logs. Response interceptor rejects errors without user-facing messages. 401 auto-logout commented out in [src/api/axios-instance.ts](src/api/axios-instance.ts#L33-L42).

2. **Type Safety**: Progressive typing in progress. Many `any` types remain (especially [src/pages/subscription/hooks/useSubscriptionScreen.ts](src/pages/subscription/hooks/useSubscriptionScreen.ts#L21)). Replace with proper interfaces when editing.

3. **Commented Code**: Login/registration screens have extensive disabled logic. Represents future features, not dead code.

4. **API Base URL**: Currently `http://84.201.180.219:80/` in production. Update in [src/api/axios-instance.ts](src/api/axios-instance.ts#L4) for local testing.

5. **PWA Icons Missing (CRITICAL)**: [public/manifest.json](public/manifest.json) references `/icons/icon-*.png` but `public/icons/` directory does NOT exist, causing 404 errors in production. **Fix immediately**:
   - Open `icon-generator.html` in browser
   - Click "Generate All Sizes" 
   - Create `public/icons/` directory
   - Save all generated icons to `public/icons/`
   - Redeploy to fix manifest errors

## QR Code Implementation

See [src/pages/qr/hooks/useQRScreen.ts](src/pages/qr/hooks/useQRScreen.ts):

- **Flow**: `getMySubscriptions(userId)` → `generateQR(subscriptionId, userId)` or `getTodayToken(subscriptionId, userId)`
- **Fallback**: IndexedDB cache if API fails
- **Data Structure**: `{ qrCode: string, generatedAt: string, expiresAt: string, subscriptionId: string }`
- **Display**: `<QRCode value={qrData.qrCode} size={256} />` from `react-qr-code`
- **Countdown**: 10-second auto-hide timer with manual toggle

## PWA Configuration

- **Manifest**: [public/manifest.json](public/manifest.json) - name: "Narodniy+ Loyalty Program", theme: #4A90E2
- **Service Worker**: `public/sw.js` - cache-first for assets, network-first for API
- **Registration**: Auto-invoked in [src/main.tsx](src/main.tsx) via `registerServiceWorker()`
- **Install Prompt**: [src/shared/components/InstallPrompt/InstallPrompt.tsx](src/shared/components/InstallPrompt/InstallPrompt.tsx) detects iOS (manual instructions) vs Android (native)
- **Testing**: Chrome DevTools → Application tab → Manifest/Service Workers
- **Docs**: [PWA-SETUP.md](PWA-SETUP.md), [PWA-QUICKSTART.md](PWA-QUICKSTART.md), [PWA-IMPLEMENTATION.md](PWA-IMPLEMENTATION.md)

## File Organization

- **Feature Components**: `src/pages/<feature>/components/<Component>/Component.tsx` + `style.scss`
- **Shared Components**: `src/shared/components/<Component>/Component.tsx` + `index.ts` (re-export)
- **Types**: Inline in service files/hooks (no global `types/` folder yet)
- **Hooks**: `src/pages/<feature>/hooks/use<Feature>Screen.ts` (page-level), `src/shared/hooks/` (reusable)
- **Config**: Root-level `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`

## Quick Reference

- **Navigate programmatically**: `const navigate = useNavigate(); navigate('/path');`
- **Access auth token**: `await SecureStorageService.getAuthToken()`
- **Check subscription active**: Compare `new Date()` with `subscription.startDate`/`endDate`
- **Component naming**: PascalCase files/exports, kebab-case CSS classes
- **State debugging**: Console logs in hooks (no error UI yet)
- **Mobile detection**: Commented out in [src/App.tsx](src/App.tsx#L14-L25), `MobileOnlyMessage` component available
