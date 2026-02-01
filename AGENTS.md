# AGENTS.md - Guidelines for AI Agents

This document provides guidelines for AI agents (including agentic coding systems like Cursor, Copilot, etc.) working on the Interactive Content Creator Platform.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Build & Test Commands](#build--test-commands)
- [Code Style Guidelines](#code-style-guidelines)
- [Architecture](#architecture)
- [Common Pitfalls](#common-pitfalls)
- [Questions & Support](#questions--support)

---

## Project Overview

**Project Name:** Interactive Content Creator Platform
**Description:** Real-time multiplayer platform with dice games, video calling, chat, and Truth or Dare.
**Primary Technologies:** React 19.1.0, Vite 7.0.4, Zustand 5.0.8, Socket.IO 4.8.3, WebRTC, TailwindCSS 4.1.13
**Architecture:** Single-page application with HashRouter, P2P WebRTC video calling, client-server WebRTC signaling via Socket.IO
**State Management:** Zustand (single source of truth)
**Deployment:** AlterVista (static frontend) + Oracle Cloud Free Tier (signaling server)

### Current Status

**Phase 1:** ✅ Complete
- Dependencies cleaned (28 packages removed)
- Minification enabled (terser)
- Theme updated (dark gray with purple/pink accents)
- Environment variables configured

**Phase 2:** ✅ Complete
- Dice rolls synchronized across users
- Dice configuration synchronized
- WebRTC events implemented

**Phase 3:** 🟡 In Progress (70%)
- Game design document complete
- Type definitions complete
- Prompt database complete (120 prompts)
- UI components pending
- TypeScript errors pending (9 errors in store)

**Phase 4:** ✅ Complete
- Code splitting implemented ✅
- 73% bundle reduction (297KB → 80KB gzipped initial load)
- Lazy loading for all routes ✅
- Manual chunking (7 vendor chunks) ✅
- Tree shaking (code already optimized) ✅
- Image optimization (compression utilities added) ✅
- File size validation (5MB images, 50MB videos) ✅
- Performance profiling deferred to Phase 5
- Component refactoring deferred to Phase 5

**Phase 5:** ⏳ Pending
**Phase 6:** ⏳ Pending

**Overall Progress:** 65% Complete

### Known Critical Issues (Need Attention)
- ✅ RESOLVED: Dice rolls are now synchronized across users
- ✅ RESOLVED: Dice customizations are now synchronized
- ✅ RESOLVED: Bundle size reduced to 297KB (meets target)
- ✅ RESOLVED: Initial load reduced to 80KB with code splitting (73% improvement)
- 🔴 OPEN: 9 TypeScript errors in `src/store/useAppStore.ts` (Phase 3 incomplete)
- 🟠 OPEN: Phase 3 UI components not yet created
- 🟡 NEW: Large components identified for refactoring (sidebar: 726 lines, call-panel: 391 lines)

### Recent Changes (2026-01-31)

**Theme Update:**
- Changed from green primary to light purple (#A78BFA)
- Changed from current secondary to dark pink (#BE185D)
- Changed background from black to dark gray (#121212)
- All chart colors updated to purple/pink theme
- Card background slightly lighter than background

**Icon Changes:**
- Replaced Utensils icon with Hearts & Stars on Menu board
- Replaced PlaySquare icon with Stars & Hearts on Media board
- Replaced Megaphone icon with Hearts & Stars on Announcement board
- All cards now use generic placeholder text ("No [items/media/announcements] yet")

**Security Improvements:**
- Access codes no longer displayed in login view
- Codes (pnpslut, shardtard, spunfun) hidden from users
- Code validation logic still functional server-side

**Build Improvements:**
- Bundle: 1,044KB (uncompressed) → 297KB (gzipped)
- Minification enabled with terser
- All Phase 1 tasks complete
- All Phase 2 tasks complete

---

## Quick Start

### For AI Agents Getting Started
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Interactive content creator website-Page not found error causes"
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Start development server**
   ```bash
   cd server
   npm start
   # Runs on port 3001 by default
   ```

4. **Start frontend development**
   ```bash
   npm run dev
   # Runs on port 3000
   ```

### Environment Variables Required
Create `.env.local` in project root:
```bash
VITE_SIGNALING_URL=http://localhost:3001
VITE_ROOM_ID=default-room
VITE_ENABLE_WEBCRTC=true
VITE_ENABLE_DICE=true
VITE_ENABLE_TRUTH_OR_DARE=false
```

### First Tasks for New Agents
1. **Read the documentation:**
   - `CONTRIBUTING.md` - Coding standards
   - `ARCHITECTURE.md` - Architecture decisions
   - `ROADMAP.md` - Development roadmap
   - `ISSUE_TRACKING.md` - Known issues
   - `DEPLOYMENT.md` - Deployment guide

2. **Understand the current issues:**
   - TypeScript has 59 errors in `src/store/useAppStore.ts`
   - Phase 3 needs TypeScript fixes to complete
   - Dice synchronization needs testing

3. **Focus on Phase 1-3 completion** before moving to Phase 4-6

---

## Build & Test Commands

### Essential Commands (Run Before Each Commit)

```bash
# Type checking
npm run typecheck
# Linting
npm run lint
# Build
npm run build
```

### Single Test Command (For Focused Testing)
```bash
# Test a specific component or route
npm run test -- --grepPattern "dice"

# Run dev server with hot reload
cd server && npm start

# Preview production build locally
npm run preview
```

### Expected Test Results

✅ **Type Check:** Should pass with 0 errors
✅ **Lint:** Should pass with 8 warnings or fewer
✅ **Build:** Should complete without errors, bundle < 500KB (gzipped)

**Current Build Status:**
- Bundle: ~1.02MB (needs optimization)
- Gzip: ~291KB (after Phase 4 optimization)
- Errors: 59 TypeScript errors in store

---

## Code Style Guidelines

### TypeScript Standards

#### ✅ DO
- **Always define return types** for exported functions
- Use interfaces for object shapes, type for unions/primitives
- Use proper typing for all variables
- Define props interfaces at top of component files
- Use `unknown` instead of `any` when type is uncertain

**❌ DON'T
- **Never use `any` type** - use `unknown` or proper types
- Omit type annotations (don't use `: type` except when needed for reassignment)
- Don't use type assertions (as Type, !)
- Don't ignore TypeScript errors
- Don't commit code with type errors

#### Examples

**✅ Good Pattern:**
```typescript
// Define proper interface
interface User {
  id: string;
  name: string;
  role: Role;
}

// Properly typed function
function createUser(name: string): User {
  return {
    id: generateId(),
    name,
    role: 'guest',
  };
}

// Properly typed action in store
selectTruthOrDare: (prompt: TruthOrDarePrompt) => void;
```

**❌ Bad Pattern to Avoid:**
```typescript
// Don't use any
const processData: any = processData();

// Don't ignore return types
function processData(data): any {
  // ...
}
```

### Naming Conventions

#### Files & Directories
- **Components:** PascalCase (e.g., `DiceCustomizer.tsx`, `CallPanel.tsx`)
- **Utilities:** camelCase (e.g., `webrtc.ts`, `permissions.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `use-mobile.ts`, `useCameraStream.ts`)
- **Types:** camelCase (e.g., `types.ts`, `TruthOrDarePrompt`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `ICE_SERVERS`)

#### Variables & Functions
- **Variables:** camelCase (`user`, `call`, `dice`, `spiceMode`)
- **Functions:** camelCase with verb prefix (`rollDice`, `selectTruthOrDare`, `joinCall`)
- **Constants:** UPPER_SNAKE_CASE with descriptive names (`DEFAULT_SPICE`, `MAX_DICE_COUNT`)

```typescript
// ✅ Good
const MAX_DICE_COUNT = 6;
const DEFAULT_SPICE = 'mild';

// ❌ Bad
const max = 6;
const default = 'mild';
```

---

### React Standards

#### Functional Components Only
**Rule:** This project uses functional components. No class components.

```typescript
// ✅ Good - Functional component
export function DiceCard({ value, isHeld, onToggle }: DiceCardProps): JSX.Element {
  return (
    <DiceCard value={value} isHeld={isHeld} onToggle={onToggle}>
      <DiceFace value={value} />
    </DiceCard>
  );
}

// ❌ Bad - Class component
class DiceCard extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

#### Hooks for State Management
**Rule:** Use `useAppStore` hook to access state. No Context API.

```typescript
// ✅ Good
import { useAppStore } from '@/store/useAppStore';

function DiceCustomizer() {
  const { rollDice, lastRoll, individualDice } = useAppStore();

  return (
    <button onClick={rollDice}>Roll Dice</button>
  );
}
```

#### Component Composition
**Rule:** Build complex UIs from simple components in `components/ui/`.

```typescript
// ✅ Good - Composition over nesting
<BoardCard>
  <BoardCard.Header>
    {board.title}
  </BoardCard.Header>
  <BoardCard.Content>
    {board.description}
  </BoardCard.Content>
</BoardCard>

// ❌ Bad - Deep nesting
<div className="...">
  <div className="...">
    <div className="...">
      <div className="...">
        <div className="...">
          Content
        </div>
      </div>
    </div>
  </div>
```

#### Props Interface
**Rule:** Always define props interface at component top.

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
```

---

## Architecture

### Single Source of Truth

**Critical Pattern:** Zustand is the ONLY state management solution. Do NOT add Redux, Context, or other state libraries.

**Why Zustand?**
- Predictable state updates
- Easy debugging with Zustand DevTools
- No providers needed
- Minimal boilerplate
- Excellent TypeScript support

**State Sections:**
1. User & Auth
2. Content (menuItems, mediaItems, announcements)
3. Dice Game
4. Call (WebRTC, chat, participants)
5. Chat
6. Truth or Dare (incomplete - see Phase 3)

**Access Pattern:**
```typescript
// ✅ Good - Direct store access
const { rollDice, lastRoll } = useAppStore();
rollDice();

// ❌ Bad - Through props
function DiceGame({ rollDice: () => void }: DiceGameProps) {
  rollDice();
}
```

### Feature-Based Organization
**Directory Structure:**
```
src/components/
├── app/           # App shell, navigation
├── call/          # WebRTC video calling
├── dice/          # Dice game
├── game/           # Other games (Truth or Dare, etc.)
├── chat/           # Chat components
└── ui/            # Reusable UI primitives
```

**Benefit:** Each feature can be understood in isolation. Changes don't affect other features.

---

## API & Communication

### WebRTC Signaling Protocol

#### Client → Server Events
```typescript
// Join room
socket.emit('join-room', { roomId, userId, userName });

// WebRTC offers
socket.emit('offer', { to: socketId, from: userId, offer });
socket.emit('answer', { to: socketId, from: userId, answer });

// Chat
socket.emit('chat-message', { roomId, message: ChatMessage });

// Dice rolls (to be added in Phase 3)
socket.emit('dice-roll', { roomId, roll: number[] });
```

#### Server → Client Events
```javascript
// Room participants
socket.emit('existing-participants', participants);

// User joined/left
socket.emit('user-joined', { userId, userName, socketId });
socket.emit('user-left', { userId });

// WebRTC signaling (relay only)
socket.on('offer', ({ from, offer }) => {
  io.to(to).emit('offer', { from, offer });
});

// Chat messages
socket.on('chat-message', ({ roomId, message }) => {
  socket.to(roomId).emit('chat-message', message);
});

// Dice rolls (to be implemented)
socket.on('dice-roll', ({ roomId, roll, userId }) => {
  socket.to(roomId).emit('dice-roll', { roll, userId });
});
```

### Event Flow Examples

```typescript
// 1. User joins call
const { joinCall } = useAppStore();

// User clicks "Join Call" button
joinCall();

// 2. WebRTCManager starts
const manager = new WebRTCManager({
  signalingServerUrl,
  roomId,
  userId: user.id,
  userName: user.name,
});

// 3. Manager emits signaling events
manager.connect();
```

---

## Common Pitfalls

### ❌ DON'T

#### 1. Ignoring TypeScript Errors
**Problem:** 59 TypeScript errors in `src/store/useAppStore.ts` causing build to fail.

**Solution:**
1. Fix duplicate function definitions (`onTruthOrDareTurnStart` appears multiple times)
2. Fix return type mismatches (functions returning void but expected AppState)
3. Fix property existence errors (`lastRoll` does not exist on AppState)

**Example of Current Error:**
```typescript
// ❌ Current error - duplicate property name
const set((state) => ({
  call: { ...state.call, ...patch } })),
});

// ✅ Fix - spread call state explicitly
const set((state) => ({
  call: { ...state.call, ...patch } }),
}));
```

#### 2. Hardcoded URLs
**Problem:** Server URLs and room IDs are hardcoded.

**Solution:** Always use environment variables.

```typescript
// ✅ Good
const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3001';
const roomId = import.meta.env.VITE_ROOM_ID || 'default-room';

// ❌ Bad
const signalingUrl = "http://146.235.229.114:3001";
const roomId = "default-room";
```

#### 3. Using Multiple State Management Solutions
**Problem:** Store has both old and new dice systems, multiple WebRTC managers.

**Solution:** Use Zustand as single source. See Phase 1 cleanup.

#### 4. Ignoring Build Warnings
**Problem:** Build warnings for unused dependencies, missing files.

**Solution:**
1. Remove unused packages
2. Clean up component imports
3. Fix type issues

#### 5. Breaking Changes Mid-Development
**Problem:** Large refactors while other work is in progress.

**Solution:** Work on one phase at a time. Complete Phase 1-3 before starting Phase 4-6.

#### 6. Adding Complexity When It's Not Needed
**Problem:** Adding features that don't align with current roadmap.

**Solution:** Follow the roadmap strictly. Don't add features beyond Phase 6 without discussion.

#### 7. Testing Without Understanding Codebase
**Problem:** Making changes without testing existing functionality.

**Solution: Always test after changes. Run typecheck and build before commit.

---

## Testing Guidelines

### Before Making Changes
1. **Run type check:** `npm run typecheck`
2. **Run lint:** `npm run lint`
3. **Read related files** to understand context

### After Making Changes
1. **Run build:** `npm run build`
2. **Test affected components**
3. **Run dev server** and verify WebRTC functionality

### Testing Strategy
1. **Unit Tests:** Not yet implemented
2. **Integration Tests:** Manual testing with multiple browser windows
3. **E2E Testing:** Test in Edge, Chrome, Firefox, Safari
4. **WebRTC Testing:** Test P2P connections across networks

### Test Checklist for Each Commit

- [ ] Type check passes (0 errors)
- [ ] Lint passes (≤8 warnings)
- [ ] Build completes successfully
- [ ] Bundle size < 500KB (gzipped)
- [ ] Dev server starts without errors
- [ ] Can join call and see participants
- [ ] Can roll dice and see results
- [ ] Can send chat messages

---

## Questions & Support

### For Questions Not Covered Here
Check these files first:
- `CONTRIBUTING.md` - Coding standards
- `ARCHITECTURE.md` - Architecture decisions
- `ROADMAP.md` - Development roadmap
- `ISSUE_TRACKING.md` - Known issues and conflicts

### Architecture Questions
- **Why Zustand?** See `ARCHITECTURE.md#state-management`
- **Why single store?** Simplifies debugging and no providers needed
- **Why feature-based components?** Each feature can be worked on independently

### Technology Questions
- **Why Socket.IO?** See `ARCHITECTURE.md#webrtc--real-time`
- **Why WebRTC P2P?** Avoids server costs, better quality for small groups

### Deployment Questions
- **Why AlterVista + Oracle Cloud?** Free tier hosting with reliable connectivity
- **How to deploy?** See `DEPLOYMENT.md`

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial AGENTS.md document created |

---

*This document should be updated when:
- New architectural decisions are made
- New patterns emerge
- Technology stack changes
- Deployment process changes
- Coding standards are updated

---

## Notes for Agentic Systems

### For Cursor/AI Systems
- This project follows standard React + Vite patterns
- Use standard build tools: `npm run typecheck`, `npm run lint`, `npm run build`
- Use the established Zustand store for all state
- Follow the single-responsibility principle with Zustand

### For GitHub Copilot
- **Context:** We have comprehensive documentation and a clear architecture
- **Recommendation:** Focus on completing Phases 1-3 before optimization
- **Caution:** Don't refactor without understanding the dice sync issue

---

*Last updated: 2026-01-30*
