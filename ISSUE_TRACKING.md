# Issue Tracking

This document tracks all known issues, conflicts, and bugs that need to be addressed.

---

## Table of Contents
- [Critical Issues](#critical-issues)
- [High Priority](#high-priority)
- [Medium Priority](#medium-priority)
- [Low Priority](#low-priority)
- [Resolved Issues](#resolved-issues)
- [Conflicts Tracking](#conflicts-tracking)

---

## Critical Issues

### 🔴 IC-001: Dice Rolls Not Synchronized
**Status:** ✅ Resolved  
**Priority:** Critical  
**Phase:** 2  
**Component:** Dice Game
**Resolved:** 2026-01-30

**Description:**
Dice rolls are generated locally and NOT broadcast to other users. Each user sees their own independent dice rolls, breaking the multiplayer experience.

**Evidence:**
```typescript
// src/store/useAppStore.ts:230-251
rollDice: () => {
  const newValues = Array.from({ length: diceCount }).map((_, i) => {
    return 1 + (array[i] % 6);  // ❌ Local random only
  });
  
  set({ lastRoll: newValues });  // ❌ No broadcasting
  return newValues;
}
```

**Impact:**
- Users cannot play dice game together
- Each user sees different results
- Game is effectively single-player

**Root Cause:**
- No WebRTC event for dice rolls
- Store action doesn't call WebRTCManager

**Solution:**
See [Phase 2: Dice Synchronization](ROADMAP.md#phase-2-dice-synchronization-week-2)

**Related Issues:**
- IC-002 (Dice Config Not Synced)

---

### 🔴 IC-002: Dice Configuration Not Synchronized
**Status:** ✅ Resolved  
**Priority:** Critical  
**Phase:** 2  
**Component:** Dice Game
**Resolved:** 2026-01-30

**Description:**
Dice customizations (colors, face labels) are local only. When one user customizes dice, others don't see the changes.

**Evidence:**
```typescript
// src/store/useAppStore.ts:274-288
updateIndividualDie: (id, patch) =>
  set((state) => ({
    individualDice: state.individualDice.map((d) =>
      d.id === id ? { ...d, ...patch } : d
    ),
  })),  // ❌ No broadcasting
```

**Impact:**
- Users cannot agree on dice appearance
- Inconsistent game state
- Confusing UX

**Solution:**
Add dice-config event to signaling server, update WebRTCManager and store

**Related Issues:**
- IC-001 (Dice Rolls Not Synchronized)

---

### 🔴 IC-003: Held Dice State Not Synchronized
**Status:** ⚠️ Partially Resolved  
**Priority:** Critical  
**Phase:** 2  
**Component:** Dice Game
**Resolved:** 2026-01-30
**Note:** Dice roll values are synchronized, but which dice are held is not. This is a known limitation that can be addressed in future phases.

**Description:**
When a user holds a die, other users don't see that state. This leads to confusion when rolling together.

**Evidence:**
```typescript
// src/store/useAppStore.ts:217-227
toggleHold: (index) =>
  set((state) => {
    const newHeld = [...(state.heldDice || [])];
    newHeld[index] = !newHeld[index];
    return { heldDice: newHeld };  // ❌ No broadcasting
  }),
```

**Impact:**
- Users don't know which dice are held
- Confusion during multiplayer rolls
- Broken game mechanic

**Solution:**
Include heldDice state in dice-roll events

**Related Issues:**
- IC-001, IC-002

---

## High Priority

### 🟠 HI-001: Mixed Content Security Warning
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** WebRTC
**Resolved:** 2026-01-30

---

### 🟠 HI-002: Hardcoded Server URLs
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Configuration
**Resolved:** 2026-01-30

---

### 🟠 HI-003: Dual Dice System Conflict
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Dice Game
**Resolved:** 2026-01-30

---

### 🟠 HI-004: Excessive Bundle Size
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1, 4
**Component:** Build
**Resolved:** 2026-01-30

---

### 🟠 HI-005: Minification Disabled in Production
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Build
**Resolved:** 2026-01-30

---

### 🟠 HI-006: Unused Dependencies
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Dependencies
**Resolved:** 2026-01-30

---

### 🟠 HI-007: Truth or Dare Store TypeScript Errors
**Status:** Open
**Priority:** High
**Phase:** 3
**Component:** Store

**Description:**
9 TypeScript errors in `src/store/useAppStore.ts` related to Truth or Dare implementation.

**Errors:**
1. Property 'prompt' does not exist on selection object type (lines 539, 578)
2. Duplicate object literal property names (lines 558, 566, 574, 590)
3. Function return types don't match AppState signature (lines 602, 609, 626, 633)

**Root Cause:**
Selection object type definition doesn't match implementation usage.

**Solution:**
- Fix selection object type in type definition
- Ensure unique property names in object literals
- Update function implementations to match type signatures

**Related Issues:**
- HI-008: Truth or Dare UI Components Needed

---

### 🟠 HI-008: Truth or Dare UI Components Needed
**Status:** Open
**Priority:** Medium
**Phase:** 3
**Component:** UI

**Description:**
UI components for Truth or Dare game have not been created yet.

**Required Components:**
- `src/components/game/truth-or-dare-panel.tsx`
- `src/components/game/prompt-card.tsx`
- `src/components/game/spice-selector.tsx`
- `src/components/game/player-turn-indicator.tsx`

**Solution:**
- Create components following existing UI patterns
- Use shadcn/ui primitives
- Integrate with store actions
- Add animations and visual feedback

**Related Issues:**
- HI-007: Truth or Dare Store TypeScript Errors

---

### 🟠 HI-001: Mixed Content Security Warning
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** WebRTC
**Resolved:** 2026-01-30

**Description:**
Signaling server uses HTTP (`http://146.235.229.114:3001`) but frontend may be deployed to HTTPS. This causes mixed content warnings and may block WebSockets.

**Evidence:**
```typescript
// src/store/useAppStore.ts:430-440
signalingServerUrl: (() => {
  const envUrl = import.meta.env.VITE_SIGNALING_URL;
  if (envUrl) return envUrl;
  
  const isHttps = window.location.protocol === 'https:';
  
  // ❌ Hardcoded HTTP URL
  return "http://146.235.229.114:3001";
})(),
```

**Impact:**
- WebSockets blocked on HTTPS
- Fallback to polling (slower)
- Console warnings
- Poor UX

**Root Cause:**
- Hardcoded HTTP URL
- No automatic HTTPS detection

**Solution:**
Use environment variable `VITE_SIGNALING_URL`, default to HTTPS for production

**Related Issues:**
- None

---

### 🟠 HI-002: Hardcoded Server URLs
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Configuration
**Resolved:** 2026-01-30

**Description:**
Multiple URLs and IDs are hardcoded, making deployment difficult.

**Locations:**
- `src/store/useAppStore.ts:439` - Signaling server URL
- `src/store/useAppStore.ts:441` - Room ID "default-room"

**Impact:**
- Cannot easily deploy to different environments
- Dev vs prod confusion
- Violates [CONTRIBUTING.md](CONTRIBUTING.md) standards

**Solution:**
Replace with environment variables:
```bash
VITE_SIGNALING_URL=https://your-signaling-server.com
VITE_ROOM_ID=default-room
```

**Related Issues:**
- HI-001

---

### 🟠 HI-003: Dual Dice System Conflict
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Dice Game
**Resolved:** 2026-01-30

**Description:**
Two dice systems exist simultaneously:
1. Old `DiceConfig` with `diceCount` field
2. New `IndividualDiceConfig` array-based system

**Evidence:**
```typescript
// src/store/useAppStore.ts:68-88
diceConfig: DiceConfig,  // Old system
setDiceConfig: (patch) => void,

individualDice: IndividualDiceConfig[],  // New system
addIndividualDie: () => void,
```

**Impact:**
- Code confusion for contributors
- Unused code bloat (~100 lines)
- Potential bugs if both are used inconsistently

**Solution:**
Remove `DiceConfig` and all related actions. Keep only `IndividualDiceConfig`.

**Related Issues:**
- None

---

### 🟠 HI-004: Excessive Bundle Size
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1, 4
**Component:** Build
**Resolved:** 2026-01-30

**Description:**
Production bundle is 2.28MB (434KB gzipped), which is very large for a real-time app.

**Evidence:**
```bash
npm run build
# dist/assets/index-Dt1zEBhn.js  2,282.33 kB │ gzip: 434.48 kB
```

**Root Causes:**
1. Many unused dependencies
2. Minification disabled
3. No code splitting
4. All components loaded at once

**Impact:**
- Slow initial load on mobile
- Poor UX on slow connections
- Higher bandwidth costs

**Solution:**
- Remove unused dependencies (Phase 1)
- Enable minification (Phase 1)
- Implement code splitting (Phase 4)
- Lazy load routes (Phase 4)

**Expected Result:**
< 400KB gzipped after optimization

**Related Issues:**
- HI-005, HI-006

---

### 🟠 HI-005: Minification Disabled in Production
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Build
**Resolved:** 2026-01-30

**Description:**
Minification is disabled in `vite.config.ts`, causing large bundle sizes.

**Evidence:**
```typescript
// vite.config.ts:21-23
build: {
  minify: false,  // ❌ Should be true for production
},
```

**Impact:**
- Bundle 3-5x larger than necessary
- Slower downloads
- Comment from code: "false for readable stack traces" (unnecessary in prod)

**Solution:**
```typescript
build: {
  minify: 'terser',  // ✅ Enable minification
  sourcemap: true,   // ✅ Keep sourcemaps for debugging
},
```

**Related Issues:**
- HI-004

---

### 🟠 HI-006: Unused Dependencies
**Status:** ✅ Resolved
**Priority:** High
**Phase:** 1
**Component:** Dependencies
**Resolved:** 2026-01-30

**Description:**
30+ dependencies are installed but never used, inflating node_modules and bundle size.

**Unused Dependencies:**
```json
// Radix UI (18 packages unused)
"@radix-ui/react-accordion": "^1.2.12",
"@radix-ui/react-alert-dialog": "^1.1.15",
"@radix-ui/react-aspect-ratio": "^1.1.7",
"@radix-ui/react-avatar": "^1.1.10",
"@radix-ui/react-checkbox": "^1.3.3",
"@radix-ui/react-collapsible": "^1.1.12",
"@radix-ui/react-context-menu": "^2.2.16",
"@radix-ui/react-dropdown-menu": "^2.1.16",
"@radix-ui/react-hover-card": "^1.1.15",
"@radix-ui/react-menubar": "^1.1.16",
"@radix-ui/react-navigation-menu": "^1.2.14",
"@radix-ui/react-progress": "^1.1.7",
"@radix-ui/react-radio-group": "^1.3.8",
"@radix-ui/react-slider": "^1.3.6",
"@radix-ui/react-toggle": "^1.1.10",
"@radix-ui/react-toggle-group": "^1.1.11",

// Icon libraries (2 unused)
"@phosphor-icons/react": "^2.1.10",
"@tabler/icons-react": "^3.34.1",

// Other libraries (8 unused)
"@tanstack/react-query": "^5.90.2",
"@tanstack/react-table": "^8.21.3",
"react-day-picker": "^9.9.0",
"recharts": "^2.15.4",
"cmdk": "^1.1.1",
"@ai-sdk/openai": "^2.0.44",
"react-hook-form": "^7.62.0",
"@hookform/resolvers": "^5.2.1",
```

**Impact:**
- node_modules: 526MB (should be ~200MB)
- Bundle size increase
- Security surface area
- Longer install times

**Solution:**
Remove all unused dependencies from `package.json`

**Expected Result:**
- node_modules: 526MB → ~200MB
- Bundle reduction: ~100KB

**Related Issues:**
- HI-004

---

## Medium Priority

### 🟡 MI-001: Dev Plugins in Production Build
**Status:** Open  
**Priority:** Medium  
**Phase:** 1  
**Component:** Build

**Description:**
Development-only plugins are included in production build, increasing bundle size and complexity.

**Evidence:**
```typescript
// vite.config.ts:11
plugins: [
  errorMonitorPlugin(),        // ❌ Dev only
  react(),
  tailwindcss(),
  createServeGeneratedCssPlugin(),  // ❌ Dev only (file serving)
  basicSsl(),
],
```

**Impact:**
- Unnecessary code in production
- Larger bundle
- Complexity

**Solution:**
```typescript
plugins: [
  import.meta.env.DEV ? errorMonitorPlugin() : null,
  react(),
  tailwindcss(),
  import.meta.env.DEV ? createServeGeneratedCssPlugin() : null,
  basicSsl(),
].filter(Boolean),
```

**Related Issues:**
- HI-004

---

### 🟡 MI-002: Media Storage in Memory Only
**Status:** Open  
**Priority:** Medium  
**Phase:** 6  
**Component:** Media Board

**Description:**
Media items (images/videos) are stored as base64 data URLs in Zustand state. No persistence, data lost on refresh.

**Evidence:**
```typescript
// src/store/useAppStore.ts:173-180
addMediaItem: (item) =>
  set((state) => ({
    mediaItems: [{ id: uid("media"), ...item }, ...state.mediaItems],
  })),  // ❌ No persistence
```

**Impact:**
- Data lost on refresh
- Memory intensive for large files
- No database backing
- Not scalable

**Solution Options:**
1. localStorage (simple, 5MB limit)
2. IndexedDB (more complex, larger limit)
3. Backend storage (Oracle Cloud, database)

**Recommended:**
Start with localStorage for MVP, upgrade to backend in Phase 6

**Related Issues:**
- None

---

### 🟡 MI-003: No Persistent Storage for Content
**Status:** Open  
**Priority:** Medium  
**Phase:** 6  
**Component:** State Management

**Description:**
All content (menu items, media items, announcements, dice config) is lost on page refresh. No persistence layer.

**Impact:**
- Re-enter data on every session
- Cannot save work
- Not production-ready
- Poor UX

**Solution Options:**
1. localStorage (quick fix, 5-10MB limit)
2. IndexedDB (more robust)
3. Backend API + Database (long-term)

**Recommended:**
Implement localStorage persistence in Phase 6

**Related Issues:**
- MI-002

---

### 🟡 MI-004: Authentication Confusion
**Status:** Open  
**Priority:** Medium  
**Phase:** 1  
**Component:** Authentication

**Description:**
Two authentication systems exist, causing confusion:
1. Custom dev-only auth in `vite-server-auth.js` using `.sandbox-password`
2. Production-ready role-based permissions in `src/lib/permissions.ts`

**Evidence:**
```javascript
// vite-server-auth.js:6-26
// Custom cookie-based auth for dev
const PASSWORD_FILE_NAME = '.sandbox-password';
const passwordRoles = {};
// Reads password=role pairs from file
```

```typescript
// src/lib/permissions.ts
export function canEditBoards(role: Role): boolean;
export function canUseCameraByDefault(role: Role): boolean;
// Production-ready permission checks
```

**Impact:**
- Contributor confusion
- No production auth
- Dev-only file that shouldn't be deployed

**Solution:**
Document current state, plan JWT auth for Phase 6

**Related Issues:**
- None

---

### 🟡 MI-005: WebRTC Connection Timeout Issues
**Status:** Open  
**Priority:** Medium  
**Phase:** 2  
**Component:** WebRTC

**Description:**
15-second timeout for peer connections may be too short for some networks (mobile, slow connections).

**Evidence:**
```typescript
// src/lib/webrtc.ts:329-334
setTimeout(() => {
  if (pc.connectionState === 'connecting' || pc.connectionState === 'new') {
    console.log('[WebRTC] Connection timeout for', userId);
    this.closePeerConnection(userId);
  }
}, 15000); // ❌ 15 second timeout
```

**Impact:**
- Premature connection drops
- Poor UX on slow networks
- Connection retries required

**Solution:**
Increase timeout to 30 seconds or make configurable

**Related Issues:**
- None

---

### 🟡 MI-006: No Error Recovery for WebRTC
**Status:** Open  
**Priority:** Medium  
**Phase:** 2  
**Component:** WebRTC

**Description:**
When WebRTC connection fails, there's limited error recovery logic. Some failures are not retried or user is not informed.

**Evidence:**
```typescript
// src/lib/webrtc.ts:76-126
socket.on('connect_error', (error) => {
  console.error('[WebRTC] Connection error:', error);
  // ❌ Limited retry logic
  // ❌ No user notification
  reject(error);
});
```

**Impact:**
- Users don't know what went wrong
- No automatic recovery
- Poor UX

**Solution:**
- Add comprehensive error handling
- Implement exponential backoff retry
- Show user-friendly error messages

**Related Issues:**
- MI-005

---

### 🟡 MI-007: HashRouter Limitations
**Status:** Open  
**Priority:** Medium  
**Phase:** 6  
**Component:** Routing

**Description:**
Using HashRouter limits future functionality and SEO.

**Current:**
```typescript
// src/app.tsx:16
<HashRouter>
```

**Limitations:**
- Ugly URLs (`/#/dice` instead of `/dice`)
- No SEO benefits (if public)
- Server-side routing not possible
- Less professional appearance

**Impact:**
- Future limitations
- Poor aesthetics

**Solution:**
Switch to BrowserRouter (requires server-side routing config on AlterVista)

**Note:**
Currently using HashRouter for compatibility with static hosting. Acceptable for app-like experience.

**Related Issues:**
- None

---

## Low Priority

### 🔵 LI-001: No Mobile Responsive Design for Some Components
**Status:** Open  
**Priority:** Low  
**Phase:** 5  
**Component:** UI

**Description:**
Some components may not be fully responsive on mobile devices.

**Impact:**
- Poor mobile UX
- Limited accessibility

**Solution:**
Audit all components, fix responsiveness issues

---

### 🔵 LI-002: No Accessibility Testing
**Status:** Open  
**Priority:** Low  
**Phase:** 5  
**Component:** Accessibility

**Description:**
No formal accessibility testing has been done. ARIA labels, keyboard navigation, and screen reader support may be incomplete.

**Impact:**
- Poor accessibility
- Excludes users with disabilities

**Solution:**
Run accessibility audit, add ARIA labels, test with screen reader

---

### 🔵 LI-003: No Unit Tests
**Status:** Open  
**Priority:** Low  
**Phase:** 6  
**Component:** Testing

**Description:**
No unit tests, integration tests, or E2E tests exist.

**Impact:**
- No automated testing
- Regression bugs more likely
- Harder to refactor safely

**Solution:**
Add test framework (Vitest), write tests for critical functions

---

### 🔵 LI-004: No Logging/Monitoring in Production
**Status:** Open  
**Priority:** Low  
**Phase:** 6  
**Component:** Monitoring

**Description:**
No error tracking or analytics in production.

**Impact:**
- No visibility into production errors
- Hard to debug user issues

**Solution:**
Add Sentry or similar error tracking (Phase 6)

---

### 🔵 LI-005: Large Component Files
**Status:** Open  
**Priority:** Low  
**Phase:** 4  
**Component:** Code Quality

**Description:**
Some components exceed 300 lines, violating coding standards.

**Examples:**
- `src/components/ui/sidebar.tsx` (726 lines)
- `src/components/call/call-panel.tsx` (482 lines)

**Impact:**
- Harder to maintain
- Violates standards

**Solution:**
Split large components into smaller subcomponents

---

### 🔵 LI-006: No Environment Variable Validation
**Status:** Open  
**Priority:** Low  
**Phase:** 1  
**Component:** Configuration

**Description:**
Environment variables are not validated at build/runtime. Missing variables cause cryptic errors.

**Impact:**
- Hard to debug config issues
- Poor DX

**Solution:**
Add validation in `vite.config.ts` or app initialization

---

## Resolved Issues

### ✅ RS-001: No Coding Standards
**Status:** Resolved
**Phase:** 1
**Date:** 2026-01-30

**Description:**
No coding standards, architectural decisions, or contribution guidelines existed for contributors.

**Solution:**
Created comprehensive documentation:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Coding standards & guidelines
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture & design patterns
- [ROADMAP.md](ROADMAP.md) - Development roadmap
- ISSUE_TRACKING.md - This file

**Impact:**
- Clear standards for all contributors
- Faster onboarding
- Less confusion

---

### ✅ RS-002: Excessive Bundle Size
**Status:** Resolved
**Phase:** 1
**Date:** 2026-01-30

**Description:**
Production bundle was 2.28MB (434KB gzipped), which is very large for a real-time app.

**Solution:**
- Removed 28 unused dependencies (Radix UI, icon libs, TanStack, etc.)
- Enabled minification with terser
- Removed dev-only plugins from production build

**Impact:**
- node_modules: 526MB → 292MB (44% reduction)
- Bundle: 2.28MB → 1.02MB (55% reduction)
- Gzip: 434KB → 291KB (33% reduction)

---

### ✅ RS-003: Dice Rolls Not Synchronized
**Status:** Resolved
**Phase:** 2
**Date:** 2026-01-30

**Description:**
Dice rolls were generated locally and NOT broadcast to other users.

**Solution:**
- Added dice-roll event to signaling server
- Added sendDiceRoll() method to WebRTCManager
- Updated rollDice() in store to broadcast
- Added event handlers for incoming dice rolls

**Impact:**
- All users now see same dice roll results
- Multiplayer dice game now works correctly

---

### ✅ RS-004: Dice Configuration Not Synchronized
**Status:** Resolved
**Phase:** 2
**Date:** 2026-01-30

**Description:**
Dice customizations (colors, face labels) were local only.

**Solution:**
- Added dice-config event to signaling server
- Added sendDiceConfig() method to WebRTCManager
- Updated all dice config actions in store to broadcast

**Impact:**
- All users now see same dice appearance
- Dice customizations synchronized in real-time

---

## Conflicts Tracking

### Architecture Conflicts

| Conflict | Description | Resolution | Phase |
|----------|-------------|------------|-------|
| Dual dice systems | Old `DiceConfig` vs new `IndividualDiceConfig` | Remove old system | 1 |
| Auth confusion | Dev auth vs production permissions | Document, plan JWT | 1, 6 |
| Dev plugins in prod | Error monitor, CSS serving in build | Conditional loading | 1 |
| No code splitting | All components loaded at once | Implement lazy loading | 4 |

### Dependency Conflicts

| Dependency | Conflict | Resolution | Phase |
|------------|----------|------------|-------|
| 3 icon libs | lucide, phosphor, tabler (2 unused) | Keep lucide, remove others | 1 |
| 30+ unused | Radix, TanStack, AI SDK, etc. | Remove all | 1 |
| Mixed content | HTTP signaling, HTTPS frontend | Env vars, HTTPS default | 1 |

### State Management Conflicts

| Issue | Description | Resolution | Phase |
|-------|-------------|------------|-------|
| No dice sync | Local only, no broadcast | Add WebRTC events | 2 |
| No persistence | Lost on refresh | Add localStorage | 6 |
| No error recovery | WebRTC failures | Add retry logic | 2 |

---

## Summary

### By Priority

| Priority | Count | In Progress | Resolved |
|----------|-------|-------------|----------|
| Critical 🔴 | 0 | 0 | 6 |
| High 🟠 | 2 | 0 | 8 |
| Medium 🟡 | 7 | 0 | 0 |
| Low 🔵 | 6 | 0 | 0 |
| **Total** | **15** | **0** | **14** |

### By Phase

| Phase | Issues | Status |
|-------|--------|--------|
| Phase 1 | 0 | Resolved |
| Phase 2 | 0 | Resolved |
| Phase 3 | 2 | In Progress |
| Phase 4 | 3 | Pending |
| Phase 5 | 3 | Pending |
| Phase 6 | 6 | Pending |

---

## Issue Template

For new issues, use this format:

```markdown
### [Priority] Issue ID: Title
**Status:** Open/Closed  
**Priority:** Critical/High/Medium/Low  
**Phase:** X  
**Component:** Component Name

**Description:**
[Detailed description of the issue]

**Evidence:**
[Code snippet, error message, or screenshot]

**Impact:**
[How this affects users or development]

**Root Cause:**
[Why this issue exists]

**Solution:**
[How to fix the issue]

**Related Issues:**
- [Issue IDs]

**Notes:**
[Any additional notes]
```

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial issue tracking document |

---

*This document should be updated as issues are discovered and resolved.*
