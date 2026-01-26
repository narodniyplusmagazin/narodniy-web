# Narodniy Web - AI Coding Instructions

## Project Overview

React + TypeScript + Vite web application for a subscription-based QR code system (Narodniy+ loyalty program). Users authenticate, subscribe to plans, and receive dynamic QR codes for in-store use with usage tracking.

## Tech Stack

- **Framework**: React 19.2 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **State**: Zustand (minimal global state) + local React hooks
- **Styling**: SCSS modules (one `style.scss` per component folder)
- **HTTP**: Axios with interceptors
- **Storage**: IndexedDB via custom `SecureStorageService`
- **Icons**: Lucide React
- **QR**: `react-qr-code` library
- **Additional**: `date-fns` (date handling), `immer` (state immutability)

## Architecture Patterns

### Page Structure (Feature-Based)

Each page lives in `src/pages/<feature>/` with this structure:

```
pages/subscription/
  index.tsx              # Main component exports SubscriptionScreen
  style.scss             # Page-level styles
  components/            # Feature-specific components (each with style.scss)
    SubscriptionHeader/
      SubscriptionHeader.tsx
      style.scss
  hooks/
    useSubscriptionScreen.ts  # Business logic hook
```

**Critical Pattern**: Pages are _presentation layers only_. All business logic (API calls, state, side effects) belongs in `hooks/use<PageName>.ts`. Components receive data and callbacks via props.

### Custom Hooks Convention

Each screen has a corresponding hook (e.g., `useQRScreen`, `useSubscriptionScreen`) that:

- Manages local state with `useState`
- Handles API calls and side effects with `useEffect`
- Returns state + callback functions for UI
- Example from [src/pages/subscription/hooks/useSubscriptionScreen.ts](src/pages/subscription/hooks/useSubscriptionScreen.ts#L15-L30)

### API Layer (`src/api/`)

- **axios-instance.ts**: Configured axios with base URL, auth interceptors
- Request interceptor: Injects `Bearer` token from `SecureStorageService`
- Response interceptor: Currently handles errors silently (401 handling commented out)
- Service files (`auth-api.ts`, `qr-services.ts`, `subscription-api.ts`): Export typed API functions

**Important**: Change `API_BASE` in [src/api/axios-instance.ts](src/api/axios-instance.ts#L5) for local dev (currently `http://172.20.10.2:3000/`)

### Storage Strategy

Use `SecureStorageService` (IndexedDB wrapper) for all persistent data:

```typescript
// Keys defined in service
(AUTH_TOKEN, USER_ID, USER_DATA, SUBSCRIPTION_DATA, BIOMETRIC_ENABLED);

// Usage
await SecureStorageService.saveAuthToken(token);
const userData = await SecureStorageService.getUserData();
```

**Never** use localStorage - IndexedDB is asynchronous and more secure.

### Styling Convention

- Each component/page folder has its own `style.scss`
- Global theme colors in [src/shared/constants/theme.ts](src/shared/constants/theme.ts)
- No CSS-in-JS or inline styles
- Class naming: Use descriptive kebab-case (e.g., `qr-gradient-wrapper`, `subscription-screen`)

### Routing

Routes defined in [src/App.tsx](src/App.tsx#L10-L17):

```
/ → HomeScreen
/registration → RegistrationScreen
/login → LoginScreen
/profile → ProfileScreen (protected)
/subscription → SubscriptionScreen (protected)
/qr → QRScreen (protected)
```

**Protected Routes**: Use `<ProtectedRoute>` wrapper component that checks `SecureStorageService.getAuthToken()` and redirects to `/login` if not authenticated. Shows loading state during async auth check.

### State Management

- **Global**: Zustand store in `src/shared/stores/auth-store.ts` (only `isAuthenticated` flag - minimal usage)
- **Page-level**: Custom hooks (use\*Screen patterns) - primary state management approach
- **Component**: Local useState for UI-only state
- **Persistence**: IndexedDB via SecureStorageService (not Zustand)

## Development Workflow

### Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Adding a New Page

1. Create folder: `src/pages/<feature-name>/`
2. Add `index.tsx` (component), `style.scss`, `hooks/use<Feature>Screen.ts`
3. Create `components/` subfolder for feature-specific UI pieces
4. Register route in `App.tsx`
5. Add API service in `src/api/<feature>-api.ts` if needed

### QR Code Flow

See [src/pages/qr/hooks/useQRScreen.ts](src/pages/qr/hooks/useQRScreen.ts):

- Fetches subscription from API (`getMySubscriptions`) or IndexedDB fallback
- Generates QR via API (`generateQR`, `getTodayToken`) or local fallback
- QR data includes: `qrCode` (string), `generatedAt`, `expiresAt`, `subscriptionId`
- Display uses `<QRCode>` from `react-qr-code`

## Key Gotchas

1. **API Base URL**: Hardcoded for local network testing - update for deployment (`http://172.20.10.2:3000/` in axios-instance.ts)
2. **Error Handling**: Currently silent (alerts/toasts disabled) - check console logs. Response interceptor errors are rejected without user-facing messages.
3. **Auth Flow**: 401 handling is commented out in axios interceptor - no automatic logout on auth failures
4. **Type Safety**: Many `any` types remain (especially in subscription hooks) - gradual typing in progress
5. **Commented Code**: Login/registration screens have extensive commented logic - intended for future implementation
6. **Protected Routes**: Auth check is async (IndexedDB) - always shows loading state before redirect
7. **QR Screen Structure**: Uses `QrScreen.tsx` (not `index.tsx`) as entry point - deviates from standard page pattern

## Common Tasks

**Adding API endpoint**: Create typed function in `src/api/<service>-api.ts`, return `res.data`  
**New component**: Create folder with `ComponentName.tsx` + `style.scss`, use FC type  
**State in page**: Add to corresponding `use*Screen` hook, pass down as props  
**Persist data**: Use `SecureStorageService` methods (async) - available keys: `AUTH_TOKEN`, `USER_ID`, `USER_DATA`, `SUBSCRIPTION_DATA`, `BIOMETRIC_ENABLED`  
**Navigate**: Import `useNavigate` from `react-router-dom`  
**Protected route**: Wrap route element in `<ProtectedRoute>` component in App.tsx

## File Locations

- Components: `src/pages/<feature>/components/` (feature-specific) or `src/shared/components/` (reusable)
- Types: Defined inline in service files or hooks (no global types/ folder yet)
- Config: `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js`
- PWA: `public/manifest.json`, `public/sw.js`, `src/utils/registerServiceWorker.ts`

## PWA Setup

- **Manifest**: `public/manifest.json` defines app name, icons, theme color (#4A90E2)
- **Service Worker**: `public/sw.js` handles caching (cache-first for assets, network-first for API)
- **Registration**: Auto-registered in `main.tsx` via `registerServiceWorker()`
- **Icons**: Required sizes in `public/icons/` - use `icon-generator.html` for placeholders
- **Testing**: DevTools → Application tab to verify manifest and service worker
- See [PWA-SETUP.md](PWA-SETUP.md) for detailed setup guide
