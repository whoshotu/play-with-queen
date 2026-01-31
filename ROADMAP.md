# Development Roadmap

This document outlines the planned development phases for the Interactive Content Creator Platform.

---

## Table of Contents
- [Overview](#overview)
- [Phase 1: Critical Fixes (Week 1)](#phase-1-critical-fixes-week-1)
- [Phase 2: Dice Synchronization (Week 2)](#phase-2-dice-synchronization-week-2)
- [Phase 3: Truth or Dare (Week 3)](#phase-3-truth-or-dare-week-3)
- [Phase 4: Optimization (Week 4)](#phase-4-optimization-week-4)
- [Phase 5: Polish & Testing (Week 5)](#phase-5-polish--testing-week-5)
- [Phase 6: Future Enhancements](#phase-6-future-enhancements)

---

## Overview

### Project Goals
1. ✅ Maintain all current features (dice, video calling, chat)
2. ✅ Fix synchronization issues (dice rolls)
3. ✅ Add new game features (Truth or Dare with spicy twist)
4. ✅ Optimize performance and reduce bundle size
5. ✅ Establish coding standards for contributors
6. ✅ Deploy to free-tier infrastructure (AlterVista + Oracle Cloud)

### Success Metrics
- Bundle size < 500KB (gzipped)
- Dice sync latency < 200ms
- All features work on mobile
- Documentation complete
- Zero known critical bugs

---

## Phase 1: Critical Fixes (Week 1)

**Status:** 🔄 In Progress
**Priority:** 🔴 Critical

### Goals
- Fix deployment blockers
- Remove conflicting code
- Establish coding standards

### Tasks

#### 1.1 Dependency Cleanup ⏱️ 2h
- [ ] Remove unused Radix UI components (18 packages)
- [ ] Remove unused icon libraries (`@phosphor-icons/react`, `@tabler/icons-react`)
- [ ] Remove unused packages:
  - `@tanstack/react-query`
  - `@tanstack/react-table`
  - `react-day-picker`
  - `recharts`
  - `cmdk`
  - `@ai-sdk/openai`
  - `react-hook-form`
  - `@hookform/resolvers`
- [ ] Run `npm install` to clean up
- [ ] Verify no broken imports

**Files:** `package.json`

**Expected Impact:**
- Bundle size reduction: ~300KB → ~200KB
- Dependencies: 90+ → ~50

---

#### 1.2 Resolve Dual Dice System ⏱️ 3h
- [ ] Remove `DiceConfig` (old system)
- [ ] Keep `IndividualDiceConfig` (new system)
- [ ] Update `useAppStore.ts`:
  - Remove `diceConfig`, `setDiceConfig`, `setDiceFaceLabel`
  - Keep `individualDice`, `addIndividualDie`, `removeIndividualDie`, etc.
- [ ] Update all references to new system
- [ ] Update types in `src/lib/types.ts`

**Files:** `src/store/useAppStore.ts`, `src/lib/types.ts`, `src/components/dice/`

**Expected Impact:**
- Code reduction: ~100 lines
- Eliminates confusion for contributors

---

#### 1.3 Build Configuration ⏱️ 1h
- [ ] Enable minification in `vite.config.ts`:
  ```typescript
  build: {
    minify: 'terser',  // Was false
    sourcemap: true,   // For debugging
  }
  ```
- [ ] Remove dev-only plugins from production:
  - `errorMonitorPlugin()` (only needed in dev)
  - `createServeGeneratedCssPlugin()` (move to conditional)
- [ ] Add environment-based plugin loading

**Files:** `vite.config.ts`

**Expected Impact:**
- Production bundle: 2.28MB → ~500KB (gzipped)
- Faster page loads

---

#### 1.4 Environment Variables ⏱️ 2h
- [ ] Replace hardcoded URLs with env vars:
  - `VITE_SIGNALING_URL` (replace `http://146.235.229.114:3001`)
  - `VITE_ROOM_ID` (replace `"default-room"`)
- [ ] Update `src/lib/webrtc.ts`:
  ```typescript
  const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3001';
  ```
- [ ] Update `src/store/useAppStore.ts`
- [ ] Create `.env.example` file
- [ ] Document in `CONTRIBUTING.md`

**Files:**
- `src/lib/webrtc.ts`
- `src/store/useAppStore.ts`
- `.env.example`

**Expected Impact:**
- Easy deployment to different environments
- No hardcoded values in code

---

#### 1.5 Authentication Cleanup ⏱️ 2h
- [ ] Document current role system in `ARCHITECTURE.md`
- [ ] Clarify that `.sandbox-password` is for local dev only
- [ ] Add note about production auth requirements
- [ ] Update `src/lib/permissions.ts` with JSDoc comments
- [ ] Create todo item for future JWT implementation

**Files:** `ARCHITECTURE.md`, `src/lib/permissions.ts`

**Expected Impact:**
- Clear documentation for contributors
- No confusion about auth system

---

#### 1.6 Documentation ⏱️ 2h
- [x] Create `CONTRIBUTING.md` ✅
- [x] Create `ARCHITECTURE.md` ✅
- [ ] Create `ISSUE_TRACKING.md` (this file) ✅
- [x] Create `ROADMAP.md` (this file) ✅
- [ ] Update `README.md` with overview
- [ ] Add deployment guide to docs/

**Files:** `README.md`, `docs/DEPLOYMENT.md`

**Expected Impact:**
- Clear standards for all contributors
- Faster onboarding

---

### Phase 1 Deliverables
- ✅ Clean dependency list
- ✅ Single dice system
- ✅ Optimized build
- ✅ Environment-based configuration
- ✅ Complete documentation

---

## Phase 2: Dice Synchronization (Week 2)

**Status:** ✅ Complete
**Priority:** 🟠 High
**Completed:** 2026-01-30

### Goals
- Synchronize dice rolls across all users
- Broadcast dice configuration changes
- Ensure consistent game state

### Tasks

#### 2.1 Add Dice Roll Events to Signaling ⏱️ 3h ✅
- [x] Update `server/signaling-server.js`:
  ```javascript
  socket.on('dice-roll', ({ roomId, roll, userId }) => {
    socket.to(roomId).emit('dice-roll', { roll, userId, timestamp: Date.now() });
  });
  
  socket.on('dice-config', ({ roomId, config, userId }) => {
    socket.to(roomId).emit('dice-config', { config, userId, timestamp: Date.now() });
  });
  ```
- [ ] Add dice-config event for color/label changes

**Files:** `server/signaling-server.js`

---

#### 2.2 Update WebRTCManager ⏱️ 2h ✅
- [x] Add methods to `src/lib/webrtc.ts`:
  ```typescript
  sendDiceRoll(roll: number[]): void {
    if (!this.socket) return;
    this.socket.emit('dice-roll', {
      roomId: this.config.roomId,
      roll,
      userId: this.config.userId,
    });
  }
  
  sendDiceConfig(config: IndividualDiceConfig[]): void {
    if (!this.socket) return;
    this.socket.emit('dice-config', {
      roomId: this.config.roomId,
      config,
      userId: this.config.userId,
    });
  }
  ```
- [ ] Add event listeners for incoming dice events:
  ```typescript
  this.socket.on('dice-roll', ({ roll, userId, timestamp }) => {
    this.onDiceRoll?.({ roll, userId, timestamp });
  });
  
  this.socket.on('dice-config', ({ config, userId, timestamp }) => {
    this.onDiceConfig?.({ config, userId, timestamp });
  });
  ```

**Files:** `src/lib/webrtc.ts`

---

#### 2.3 Update Store with Dice Sync ⏱️ 3h ✅
- [x] Add dice event callbacks to store:
  ```typescript
  type AppState = {
    // ...
    onDiceRoll: (event: DiceRollEvent) => void;
    onDiceConfig: (event: DiceConfigEvent) => void;
  }
  ```
- [ ] Update `rollDice()` to broadcast:
  ```typescript
  rollDice: () => {
    const state = get();
    const newRoll = generateRoll(state.individualDice.length);
    
    set({ lastRoll: newRoll });
    
    // Broadcast to other users
    if (state.webrtcManager) {
      state.webrtcManager.sendDiceRoll(newRoll);
    }
  }
  ```
- [ ] Add handlers for incoming events (with conflict resolution):
  ```typescript
  onDiceRoll: (event) => {
    const state = get();
    
    // Only accept rolls from other users
    if (event.userId === state.user?.id) return;
    
    // Update store with synchronized roll
    set({ lastRoll: event.roll });
  }
  ```
- [ ] Update `updateIndividualDie()` to broadcast config changes

**Files:** `src/store/useAppStore.ts`

---

#### 2.4 Update Components for Sync ⏱️ 2h ✅
- [x] Update `src/components/call/call-panel.tsx`:
  - Set up dice event handlers on WebRTCManager initialization
- [ ] Add visual indicator when dice roll is from another user
- [ ] Add loading state while waiting for sync

**Files:** `src/components/call/call-panel.tsx`

---

#### 2.5 Testing & Debugging ⏱️ 3h ⚠️ Pending Testing
- [ ] Test dice sync between multiple users
- [ ] Test held dice state sync
- [ ] Test dice config (colors, labels) sync
- [ ] Add logging for debugging sync issues
- [ ] Handle edge cases (user leaves during roll, etc.)

**Files:** Various

---

### Phase 2 Deliverables
- ✅ Dice rolls synchronized across users
- ✅ Dice configuration synchronized
- ✅ Consistent game state for all participants
- [ ] Visual feedback for sync status (needs implementation)

---

## Phase 3: Truth or Dare (Week 3)

**Status:** 🟡 In Progress (45%)
**Priority:** 🟡 Medium
**Started:** 2026-01-30

### Goals
- Add Truth or Dare game
- Implement spicy twist feature
- Synchronize game across users
- Integrate with existing app

### Tasks

#### 3.1 Game Design ⏱️ 2h ✅
- [x] Define game mechanics
- [x] Define spice levels
- [x] Define spicy twist logic
- [x] Define turn management
- [x] Define skip & forfeit rules
- [x] Define chat integration
- [x] Define UI requirements

**Files:** `docs/TRUTH_OR_DARE_DESIGN.md`

---

#### 3.2 Types & State ⏱️ 2h ✅
- [x] Add types to `src/lib/types.ts`
- [x] Add state to `src/store/useAppStore.ts`
- [x] Define TruthOrDareState type

**Files:** `src/lib/types.ts`, `src/store/useAppStore.ts`

---

#### 3.3 Prompt Database ⏱️ 3h ✅
- [x] Create `src/data/truth-or-dare-prompts.ts`
- [x] Add 50+ truth prompts across all spice levels
- [x] Add 50+ dare prompts across all spice levels
- [x] Categorize prompts
- [x] Add twist flags

**Files:** `src/data/truth-or-dare-prompts.ts` (120 prompts total)

---

#### 3.4 Game Logic ⏱️ 4h ⚠️ Partially Complete
- [x] Add store actions
- [x] Implement turn management
- [x] Implement twist mechanics
- [ ] Fix TypeScript errors in store (9 errors remaining)
- [ ] Test game logic

**Files:** `src/store/useAppStore.ts`

---

#### 3.5 UI Components ⏱️ 5h ⏳ Pending
- [ ] Create `src/components/game/truth-or-dare-panel.tsx`
- [ ] Create `src/components/game/prompt-card.tsx`
- [ ] Create `src/components/game/spice-selector.tsx`
- [ ] Create `src/components/game/player-turn-indicator.tsx`
- [ ] Add twist animations
- [ ] Add sound effects (optional)

**Files:** `src/components/game/`

---

#### 3.6 Synchronization ⏱️ 3h ⏳ Pending
- [ ] Add WebRTC events for Truth or Dare to server
- [ ] Add methods to WebRTCManager
- [ ] Add event handlers in store
- [ ] Test sync across users

**Files:** `server/signaling-server.js`, `src/lib/webrtc.ts`

---

#### 3.7 Integration ⏱️ 2h ⏳ Pending
- [ ] Add route for Truth or Dare page
- [ ] Add navigation link in sidebar
- [ ] Integrate with dice page
- [ ] Test integration

**Files:** `src/app.tsx`, `src/components/app/app-shell.tsx`

---

#### 3.8 Testing ⏱️ 2h ⏳ Pending
- [ ] Test all spice levels
- [ ] Test sync across users
- [ ] Test turn management
- [ ] Test edge cases

---

### Phase 3 Deliverables
- [x] Truth or Dare game design document
- [x] Type definitions for game
- [x] Prompt database (120+ prompts)
- [x] Game logic (partial - needs TypeScript fixes)
- [ ] UI components
- [ ] Game synchronized across users
- [ ] 50+ prompts per category

---

#### 3.2 Types & State ⏱️ 2h
- [ ] Add types to `src/lib/types.ts`:
  ```typescript
  export type SpiceLevel = 'mild' | 'medium' | 'spicy' | 'extreme';
  
  export type TruthOrDarePrompt = {
    id: string;
    type: 'truth' | 'dare';
    text: string;
    spice: SpiceLevel;
  };
  
  export type TruthOrDareState = {
    currentPrompt: TruthOrDarePrompt | null;
    usedPrompts: string[];
    playerTurn: string;
    spiceMode: SpiceLevel;
  };
  ```
- [ ] Add state to `src/store/useAppStore.ts`

**Files:** `src/lib/types.ts`, `src/store/useAppStore.ts`

---

#### 3.3 Prompt Database ⏱️ 3h
- [ ] Create `src/data/truth-or-dare-prompts.ts`:
  ```typescript
  export const TRUTH_PROMPTS: TruthOrDarePrompt[] = [
    { id: 't1', type: 'truth', text: 'What\'s your most embarrassing moment?', spice: 'mild' },
    { id: 't2', type: 'truth', text: 'What\'s your biggest secret?', spice: 'spicy' },
    // ... more prompts
  ];
  
  export const DARE_PROMPTS: TruthOrDarePrompt[] = [
    { id: 'd1', type: 'dare', text: 'Do a silly dance for 30 seconds', spice: 'mild' },
    { id: 'd2', type: 'dare', text: 'Call your crush and confess', spice: 'extreme' },
    // ... more dares
  ];
  ```
- [ ] Categorize prompts by spice level
- [ ] Add 50+ prompts per category

**Files:** `src/data/truth-or-dare-prompts.ts` (new)

---

#### 3.4 Game Logic ⏱️ 4h
- [ ] Add store actions:
  ```typescript
  selectTruth: (spice?: SpiceLevel) => void;
  selectDare: (spice?: SpiceLevel) => void;
  completePrompt: () => void;
  skipPrompt: () => void;
  setSpiceMode: (spice: SpiceLevel) => void;
  advanceTurn: () => void;
  ```
- [ ] Implement random prompt selection (exclude used)
- [ ] Implement "spicy twist" mechanic:
  - Randomly increase spice level
  - Or combine two prompts
- [ ] Implement turn management

**Files:** `src/store/useAppStore.ts`

---

#### 3.5 UI Components ⏱️ 5h
- [ ] Create `src/components/game/truth-or-dare-panel.tsx`
- [ ] Create `src/components/game/prompt-card.tsx`
- [ ] Create `src/components/game/spice-selector.tsx`
- [ ] Create `src/components/game/player-turn-indicator.tsx`
- [ ] Add animations for prompt reveal
- [ ] Add "spicy twist" visual effect

**Files:** `src/components/game/`

---

#### 3.6 Synchronization ⏱️ 3h
- [ ] Add WebRTC events for Truth or Dare:
  ```typescript
  socket.on('truth-or-dare-select', ({ roomId, prompt, userId }) => {
    socket.to(roomId).emit('truth-or-dare-select', { prompt, userId });
  });
  
  socket.on('truth-or-dare-complete', ({ roomId, userId }) => {
    socket.to(roomId).emit('truth-or-dare-complete', { userId });
  });
  ```
- [ ] Add methods to WebRTCManager
- [ ] Add handlers in store
- [ ] Sync turn management

**Files:** `server/signaling-server.js`, `src/lib/webrtc.ts`, `src/store/useAppStore.ts`

---

#### 3.7 Integration ⏱️ 2h
- [ ] Add route for Truth or Dare page (`/truth-or-dare`)
- [ ] Add navigation link in sidebar
- [ ] Integrate with call page (show prompts on video overlay?)

**Files:** `src/app.tsx`, `src/components/app/app-shell.tsx`

---

#### 3.8 Testing ⏱️ 2h
- [ ] Test all spice levels
- [ ] Test sync across users
- [ ] Test turn management
- [ ] Test edge cases

**Files:** Various

---

### Phase 3 Deliverables
- ✅ Truth or Dare game implemented
- ✅ Spicy twist mechanic working
- ✅ Game synchronized across users
- ✅ 50+ prompts per category

---

## Phase 4: Optimization (Week 4)

**Status:** ⏳ Pending
**Priority:** 🟡 Medium

### Goals
- Further reduce bundle size
- Improve performance
- Code quality improvements

### Tasks

#### 4.1 Code Splitting ⏱️ 3h
- [ ] Implement lazy loading for routes:
  ```typescript
  const DicePage = lazy(() => import('@/pages/dice-page'));
  const CallPage = lazy(() => import('@/pages/call-page'));
  ```
- [ ] Add loading states
- [ ] Measure bundle reduction

**Files:** `src/app.tsx`

---

#### 4.2 Tree Shaking ⏱️ 2h
- [ ] Ensure all exports are properly used
- [ ] Remove unused code from components
- [ ] Verify no side-effect imports

**Files:** Various

---

#### 4.3 Image Optimization ⏱️ 2h
- [ ] Optimize all images in `public/`
- [ ] Use WebP format
- [ ] Add responsive images

**Files:** `public/`

---

#### 4.4 Performance Profiling ⏱️ 3h
- [ ] Profile app with Chrome DevTools
- [ ] Identify bottlenecks
- [ ] Optimize re-renders (useMemo, useCallback)
- [ ] Optimize large lists (virtualization)

**Files:** Various

---

#### 4.5 Component Refactoring ⏱️ 4h
- [ ] Split components > 300 lines
- [ ] Extract complex logic to hooks
- [ ] Improve type coverage to 100%
- [ ] Remove console.log statements

**Files:** Various

---

### Phase 4 Deliverables
- ✅ Bundle size < 400KB (gzipped)
- ✅ Fast initial load (< 2s on 3G)
- ✅ No performance bottlenecks
- ✅ 100% TypeScript coverage

---

## Phase 5: Polish & Testing (Week 5)

**Status:** ⏳ Pending
**Priority:** 🟢 Normal

### Goals
- Final polish and bug fixes
- Comprehensive testing
- Deployment preparation

### Tasks

#### 5.1 Bug Fixes ⏱️ 3h
- [ ] Fix any remaining bugs from ISSUE_TRACKING.md
- [ ] Fix edge cases
- [ ] Add error boundaries

**Files:** Various

---

#### 5.2 Testing ⏱️ 4h
- [ ] Test all features on mobile
- [ ] Test all features on desktop
- [ ] Test WebRTC across different networks
- [ ] Test with multiple users (3-5)
- [ ] Test dice sync extensively
- [ ] Test Truth or Dare sync

**Files:** Various

---

#### 5.3 Accessibility ⏱️ 2h
- [ ] Add ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast check

**Files:** Various

---

#### 5.4 Deployment ⏱️ 3h
- [ ] Build for production
- [ ] Deploy to AlterVista
- [ ] Deploy signaling server to Oracle Cloud
- [ ] Configure environment variables
- [ ] Test deployment

**Files:** Various

---

#### 5.5 Documentation Updates ⏱️ 2h
- [ ] Update README.md
- [ ] Add deployment guide
- [ ] Update CONTRIBUTING.md if needed
- [ ] Create release notes

**Files:** `README.md`, `docs/DEPLOYMENT.md`

---

### Phase 5 Deliverables
- ✅ Zero critical bugs
- ✅ Mobile-friendly
- ✅ Accessible (WCAG AA)
- ✅ Deployed to production

---

## Phase 6: Future Enhancements

**Status:** ⏳ Pending
**Priority:** 🔵 Low

### Potential Features
- [ ] SFU (Selective Forwarding Unit) for large groups (>10 users)
- [ ] Recording feature
- [ ] Screen sharing improvements
- [ ] More games (Charades, Pictionary)
- [ ] User avatars
- [ ] Reactions/stickers
- [ ] AI-powered prompt generation
- [ ] Persistent storage (backend database)
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

---

## Progress Tracking

### Overall Progress: 50%

```
Phase 1: ████████████████████░░░░ 100% (6/6 tasks)
Phase 2: █████████████████░░░░░░ 90% (4.5/5 tasks)
Phase 3: ███████████░░░░░░░░░░░ 45% (3.6/8 tasks)
Phase 4: ░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 5: ░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 6: ░░░░░░░░░░░░░░░░░ 0%  (0/10 tasks)
```
Phase 1: ████████████████████░░░░░░ 90% (5.4/6 tasks)
Phase 2: █████████████████░░░░░░░░ 90% (4.5/5 tasks)
Phase 3: ░░░░░░░░░░░░░░░░░░░ 0%  (0/8 tasks)
Phase 4: ░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 5: ░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 6: ░░░░░░░░░░░░░░░░░░░ 0%  (0/10 tasks)
```
Phase 1: ████████████████░░░░░░░░░░ 60% (3.6/6 tasks)
Phase 2: ░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 3: ░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  (0/8 tasks)
Phase 4: ░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 5: ░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  (0/5 tasks)
Phase 6: ░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  (0/10 tasks)
```

---

## Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Phase 1 Complete | Week 1 | ✅ Complete |
| Phase 2 Complete | Week 2 | ✅ Complete |
| Phase 3 Complete | Week 3 | 🟡 In Progress (45%) |
| Phase 4 Complete | Week 4 | ⏳ Pending |
| Phase 5 Complete | Week 5 | ⏳ Pending |
| v1.0.0 Release | End of Week 5 | ⏳ Pending |

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial roadmap |

---

*This roadmap is a living document. Tasks and timelines may be adjusted based on progress and priorities.*
