# Interactive Content Creator Platform - Standards & Guidelines

This document establishes coding standards, architectural patterns, and contribution guidelines for all contributors (AI agents and humans).

---

## Table of Contents
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [State Management](#state-management)
- [Component Guidelines](#component-guidelines)
- [API & Communication](#api--communication)
- [Deployment Standards](#deployment-standards)
- [Git Workflow](#git-workflow)

---

## Technology Stack

### Core Stack (Fixed - Do Not Change Without Approval)
- **Frontend Framework:** React 19.1.0
- **Build Tool:** Vite 7.0.4
- **State Management:** Zustand 5.0.8 (Single store architecture)
- **Routing:** react-router-dom 7.9.3 (HashRouter - for compatibility)
- **Styling:** TailwindCSS 4.1.13
- **TypeScript:** 5.8.3
- **Icons:** lucide-react ONLY (remove other icon libs)
- **UI Components:** shadcn/ui (Radix UI primitives + custom wrappers)

### Communication & Real-time
- **WebRTC:** Native browser WebRTC API
- **Signaling:** Socket.IO 4.8.3
- **Real-time Events:** Broadcast via WebRTC data channel

### Deployment
- **Frontend:** AlterVista (Static hosting)
- **Backend/Signaling:** Oracle Cloud Free Tier (Node.js)

---

## Project Structure

```
project-root/
├── src/
│   ├── components/         # React components organized by feature
│   │   ├── app/           # App-shell, navigation, layout
│   │   ├── call/          # WebRTC video calling components
│   │   ├── dice/          # Dice game components
│   │   ├── game/          # Truth or Dare, other games
│   │   ├── chat/          # Chat components
│   │   └── ui/            # Reusable UI primitives (shadcn/ui)
│   ├── lib/               # Utility libraries, type definitions
│   ├── store/             # Zustand state management
│   ├── pages/             # Route pages
│   ├── hooks/             # Custom React hooks
│   ├── generated/         # Auto-generated CSS (theme, fonts)
│   ├── app.tsx            # Main app router
│   └── main.tsx           # Entry point
├── server/                # Signaling server (Node.js)
│   ├── signaling-server.js
│   └── package.json
├── public/                # Static assets
├── docs/                  # Documentation (this directory)
├── CONTRIBUTING.md        # This file
├── ARCHITECTURE.md        # Architectural decisions
├── ROADMAP.md             # Development roadmap
├── ISSUE_TRACKING.md      # Known issues & conflicts
└── package.json
```

---

## Coding Standards

### File Naming
- **Components:** PascalCase (e.g., `DiceCustomizer.tsx`)
- **Utilities:** camelCase (e.g., `permissions.ts`)
- **Types:** camelCase (e.g., `types.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `use-mobile.ts`)

### TypeScript Standards
- **Strict mode enabled** in `tsconfig.json`
- **Always define return types** for exported functions
- **Use interfaces** for object shapes, **type** for unions/primitives
- **No `any` types** - use `unknown` or proper typing
- **Export types** used across modules

```typescript
// ✅ Good
export interface User {
  id: string;
  name: string;
  role: Role;
}

export function createUser(name: string): User {
  return {
    id: generateId(),
    name,
    role: 'guest',
  };
}

// ❌ Bad
export const createUser = (name) => {
  return {
    id: generateId(),
    name,
    role: 'guest',
  };
};
```

### React Standards
- **Functional components only** (no class components)
- **Use React hooks** for state and effects
- **Component composition** over prop drilling
- **Destructure props** in function signature
- **Use useCallback/useMemo** for expensive operations

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Bad
export function Button(props) {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </button>
  );
}
```

### Styling Standards
- **Tailwind utility-first** approach
- **Responsive design:** mobile-first with `md:`, `lg:` breakpoints
- **Use shadcn/ui patterns** for consistent design
- **Custom CSS** only in `src/generated/` or `src/index.css`

```typescript
// ✅ Good
<div className="p-4 rounded-lg border bg-background hover:bg-muted transition">
  Content
</div>

// ❌ Bad
<div style={{ padding: '16px', borderRadius: '8px', border: '1px solid' }}>
  Content
</div>
```

### Import Organization
```typescript
// 1. External libraries
import React from 'react';
import { useState } from 'react';

// 2. Internal imports (absolute with @ alias)
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

// 3. Relative imports (rare, avoid)
import './styles.css';
```

---

## State Management

### Single Store Pattern
**Rule:** Use Zustand for ALL application state. No Context API, no Redux, no other stores.

### Store Structure
State is organized into logical sections:

```typescript
// src/store/useAppStore.ts
type AppState = {
  // User & Auth
  user: User | null;
  
  // Content (boards, media, announcements)
  menuItems: MenuItem[];
  mediaItems: MediaItem[];
  announcements: Announcement[];
  
  // Dice Game
  individualDice: IndividualDiceConfig[];
  lastRoll: number[];
  heldDice: boolean[];
  
  // Games (Truth or Dare, etc.)
  // [Future: Add game-specific state here]
  
  // Call / WebRTC
  call: CallState;
  webrtcManager: WebRTCManager | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  
  // Chat
  call: {
    chatMessages: ChatMessage[];
  };
};
```

### State Synchronization Rules

**✅ MUST be synchronized (broadcast via WebRTC):**
- Chat messages (all types)
- Emoji reactions
- User join/leave events
- Dice roll results (FIX NEEDED: currently not synced)
- Game state (Truth or Dare - future)
- Participant permissions updates

**❌ MUST remain local (never broadcast):**
- UI toggle states (show/hide panels)
- Draft forms
- Local camera/mic selections
- Local user preferences

### Action Patterns

```typescript
// ✅ Good: Clear action name, proper typing
const rollDice = () => {
  const state = get();
  const newRoll = generateRoll(state.individualDice.length);
  
  // Broadcast to other users
  if (state.webrtcManager) {
    state.webrtcManager.broadcastDiceRoll(newRoll);
  }
  
  set({ lastRoll: newRoll });
};

// ❌ Bad: Unclear, no broadcasting
const roll = () => {
  set({ lastRoll: Math.random() });
};
```

---

## Component Guidelines

### Component Organization
- **Feature-based:** Group by feature (`call/`, `dice/`, `game/`)
- **Separation of concerns:** Logic in hooks/lib, UI in components
- **Reusable:** Extract common patterns to `components/ui/`

### Props Interface
Always define props interface at top of file:

```typescript
interface DiceCardProps {
  value: number;
  isHeld: boolean;
  onToggle: () => void;
  color: string;
}

export function DiceCard({ value, isHeld, onToggle, color }: DiceCardProps) {
  // Implementation
}
```

### Component Size Guidelines
- **Maximum 300 lines** per component file
- **Split into subcomponents** if exceeded
- **Extract complex logic** to custom hooks

---

## API & Communication

### WebRTC Signaling Protocol

**Client → Server Events:**
```typescript
// Join room
socket.emit('join-room', { roomId, userId, userName });

// WebRTC signaling
socket.emit('offer', { to: socketId, from: userId, offer: RTCSessionDescription });
socket.emit('answer', { to: socketId, from: userId, answer: RTCSessionDescription });
socket.emit('ice-candidate', { to: socketId, from: userId, candidate: RTCIceCandidate });

// Chat
socket.emit('chat-message', { roomId, message: ChatMessage });

// Game events (future)
socket.emit('dice-roll', { roomId, roll: number[] });
socket.emit('truth-or-dare-select', { roomId, selection: string });
```

**Server → Client Events:**
```typescript
// Room management
socket.emit('existing-participants', participants);
socket.emit('user-joined', { userId, userName, socketId });
socket.emit('user-left', { userId });

// WebRTC signaling
socket.emit('offer', { from, offer: RTCSessionDescription });
socket.emit('answer', { from, answer: RTCSessionDescription });
socket.emit('ice-candidate', { from, candidate: RTCIceCandidate });

// Chat
socket.emit('chat-message', message: ChatMessage);
```

### Environment Variables
All external URLs and configuration must use environment variables:

```typescript
// ✅ Good
const signalingUrl = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3001';

// ❌ Bad
const signalingUrl = 'http://146.235.229.114:3001';
```

### Required Environment Variables
Create `.env.local` for local development:

```bash
# Signaling server URL
VITE_SIGNALING_URL=http://localhost:3001

# Room ID (optional - defaults to 'default-room')
VITE_ROOM_ID=default-room

# Enable/disable features
VITE_ENABLE_WEBCRTC=true
VITE_ENABLE_DICE=true
VITE_ENABLE_TRUTH_OR_DARE=false
```

---

## Deployment Standards

### Frontend (AlterVista)
- **Build command:** `npm run build`
- **Output:** `dist/` directory
- **Deploy:** Upload all contents of `dist/` to AlterVista
- **Environment:** Set `VITE_SIGNALING_URL` to Oracle Cloud server URL

### Backend (Oracle Cloud)
- **Directory:** `server/`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Port:** 3001 (or use `PORT` env var)
- **Health check:** `GET /health` returns `{ status: 'healthy' }`

### Deployment Checklist
- [ ] Update environment variables for production
- [ ] Enable minification in `vite.config.ts`
- [ ] Remove dev-only plugins
- [ ] Test health endpoints
- [ ] Verify WebRTC connection across HTTPS

---

## Git Workflow

### Branch Naming
- **feature:** `feature/dice-synchronization`
- **fix:** `fix/mixed-content-websocket`
- **refactor:** `refactor/remove-unused-dependencies`
- **docs:** `docs/add-contributing-guide`

### Commit Messages
```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style (formatting)
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(dice): synchronize dice rolls across WebRTC

- Add dice-roll event to WebRTCManager
- Broadcast roll results on rollDice() action
- Update store to handle incoming dice rolls

Closes #42
```

```
fix(websocket): resolve mixed content issues

- Update signaling URL to use HTTPS when available
- Add fallback to polling for mixed content scenarios
- Document environment variable requirements
```

---

## Testing & Quality

### Required Commands (Run Before Commit)
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

### Code Review Checklist
- [ ] All linting passes
- [ ] TypeScript types are correct
- [ ] No `any` types
- [ ] Component size under 300 lines
- [ ] Props are properly typed
- [ ] State updates are correct
- [ ] No console.log statements in production code
- [ ] Environment variables used for external URLs
- [ ] Documentation updated if needed

---

## Adding New Features

### Template for New Features

1. **Create issue in ISSUE_TRACKING.md**
2. **Update ROADMAP.md** if roadmap change needed
3. **Create feature branch**
4. **Implementation steps:**
   - Define types in `src/lib/types.ts`
   - Add state to `src/store/useAppStore.ts`
   - Create components in `src/components/feature-name/`
   - Add routing in `src/app.tsx`
   - Add WebRTC events if real-time needed
5. **Testing**
6. **Documentation**
7. **Pull request**

### Example: Adding Truth or Dare Game

```typescript
// 1. Types (src/lib/types.ts)
export type TruthOrDarePrompt = {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  spice: 'mild' | 'medium' | 'spicy';
};

export type TruthOrDareState = {
  currentPrompt: TruthOrDarePrompt | null;
  usedPrompts: string[];
  playerTurn: string;
};

// 2. Store (src/store/useAppStore.ts)
truthOrDare: TruthOrDareState;
setTruthOrDarePrompt: (prompt: TruthOrDarePrompt) => void;
advanceTurn: () => void;

// 3. Component (src/components/game/truth-or-dare-panel.tsx)
export function TruthOrDarePanel() {
  // Implementation
}

// 4. WebRTC (src/lib/webrtc.ts)
sendTruthOrDareSelection(selection: string) {
  this.socket.emit('truth-or-dare-select', {
    roomId: this.config.roomId,
    selection,
  });
}
```

---

## Common Pitfalls & Anti-Patterns

### ❌ DON'T
- Add multiple state management solutions
- Use inline styles
- Hardcode URLs or API keys
- Ignore TypeScript errors
- Commit without running lint/typecheck
- Create components over 300 lines
- Use `any` type
- Skip WebRTC broadcasting for game state

### ✅ DO
- Keep single store architecture
- Use Tailwind utilities
- Use environment variables
- Fix all TypeScript errors
- Run checks before commit
- Split large components
- Use proper types
- Broadcast game state changes

---

## Questions & Support

- **Architecture decisions:** See `ARCHITECTURE.md`
- **Current progress:** See `ROADMAP.md`
- **Known issues:** See `ISSUE_TRACKING.md`

**For questions not covered here:** Check existing documentation or create an issue.

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial standards document |

---

*This document should be updated when architectural decisions change. All contributors must follow these standards.*
