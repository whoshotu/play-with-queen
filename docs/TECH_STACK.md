# Tech Stack Documentation

Complete guide to technologies used in Interactive Content Creator Platform.

---

## Table of Contents
- [Frontend Stack](#frontend-stack)
- [Backend Stack](#backend-stack)
- [Development Tools](#development-tools)
- [Deployment](#deployment)
- [Key Libraries](#key-libraries)
- [Architecture Notes](#architecture-notes)

---

## Frontend Stack

### Core Framework
- **React 19.1.0** - UI framework with concurrent rendering
  - Why React? Largest ecosystem, excellent documentation, strong community
  - Version 19.x: Latest stable with concurrent features, automatic batching
  - Key features: Hooks, Suspense, Concurrent rendering, Error boundaries

- **Vite 7.0.4** - Build tool and dev server
  - Why Vite? Fast HMR, optimized production builds, modern ES modules
  - Features: Hot Module Replacement, CSS modules, Rollup bundler, TypeScript support
  - Dev server: http://localhost:3000
  - Build time: <15s for full production build

- **TypeScript 5.8.3** - Type safety and developer experience
  - Why TypeScript? Catch errors at build time, better IDE support, self-documenting code
  - Configuration: tsconfig.json with strict mode
  - Features: Type inference, generics, union types, interfaces

### State Management
- **Zustand 5.0.8** - Single source of truth for app state
  - Why Zustand? Predictable state updates, minimal boilerplate, no providers needed
  - Alternative considered: Redux (rejected - too complex), Context (rejected - prop drilling)
  - Store file: `src/store/useAppStore.ts`
  - Store sections:
    - User & Auth: user, setUser
    - Content (menuItems, mediaItems, announcements)
    - Dice Game: individualDice, lastRoll, heldDice, rollDice, etc.
    - Call (WebRTC, chat, participants)
    - Chat: chatMessages, addChatMessage
    - Truth or Dare (incomplete - see Phase 3)

  - Access pattern: `const { state, action } = useAppStore();`
  - DevTools: Available for debugging state changes

### Routing
- **React Router 7.9.3** - HashRouter for static hosting compatibility
  - Why HashRouter? Works on static hosting (AlterVista) without server-side routing
  - Alternative considered: BrowserRouter (rejected - needs server config on AlterVista)
  - Routes: `/` (hub), `/dice`, `/truth-or-dare`, `/admin`, `/call`
  - Navigation: `<NavLink to="/dice">` with active state styling
  - Lazy loading: Planned for Phase 4

### Styling
- **TailwindCSS 4.1.13** - Utility-first CSS framework
  - Why Tailwind? Fast development, small bundle, consistent design system
  - Version 4.x: New CSS variable-based theming (v3 was config-based)
  - Theme: Dark mode with CSS variables
  - Color system:
    - Primary: #A78BFA (light purple)
    - Secondary: #BE185D (dark pink/rose)
    - Background: #121212 (dark gray)
    - Card: #1C1C1E (slightly lighter)
  - Customization: CSS variables in `src/generated/theme.css`
  - Responsive: Mobile-first with breakpoints (sm, md, lg, xl)
  - Utilities: flex, grid, spacing, typography, colors, shadows

- **CSS Variables** - Runtime theming
  - Why CSS variables? No build step for theme changes, better browser support
  - Location: `src/generated/theme.css`
  - Variables: --primary, --secondary, --background, --card, etc.
  - Usage: Tailwind automatically reads CSS variables for colors

### UI Components
- **Radix UI** - Headless UI primitives (accessible, unstyled components)
  - Why Radix? Accessibility built-in, keyboard navigation, screen reader support
  - Used primitives:
    - Dialog - Modal dialogs
    - Popover - Popover menus
    - Label - Form labels
    - Scroll Area - Custom scrollbars
    - Select - Dropdown selects
    - Separator - Visual separators
    - Slot - Compound components
    - Switch - Toggle switches
    - Tabs - Tab navigation
    - Tooltip - Hover tooltips
  - Accessibility: ARIA attributes, keyboard navigation, focus management
  - Tree-shaking: Only used primitives included in bundle

- **shadcn/ui** - Pre-built component library based on Radix UI
  - Why shadcn? Copy-paste components, full control over styling, Tailwind integration
  - Components used:
    - Card - Card containers
    - Button - Interactive buttons
    - Input - Form inputs
    - Select - Dropdowns
    - Dialog - Modals
    - Sheet - Side sheets
    - Toast - Notifications (via sonner)
    - Label - Form labels
    - Switch - Toggles
    - Separator - Dividers
    - Sidebar - Navigation sidebar
  - Customization: Components copied to `src/components/ui/` and modified

### Animation
- **Framer Motion 12.23.22** - Production-ready motion library
  - Why Framer Motion? Declarative animations, physics-based gestures, smooth transitions
  - Usage:
    - Dice rolling animations (`IndividualDicePreview`)
    - Smooth page transitions (planned for Phase 4)
    - Modal open/close animations
    - Micro-interactions (hover, click, focus)
  - Features:
    - Motion components (`<motion.div>`)
    - Variants for animation states
    - Gesture handling (drag, resize for video boxes)
    - Layout animations for enter/exit

### Icons
- **Lucide React 0.542.0** - Consistent icon set
  - Why Lucide? Consistent design, tree-shakeable, SVG-based
  - Icons in use:
    - Navigation: Dice3, HelpCircle, LayoutDashboard, Video, MessageSquareText
    - Actions: LogOut, Send, Plus, Trash2, Copy
    - Media: Video, VideoOff, Monitor, MonitorOff
    - Social: Heart, Star (custom theme icons)
    - User: User, Crown, Shield
    - Misc: Smile, Users, Hand, Loader2
  - Removed icons (Phase 1 cleanup):
    - Utensils - Replaced with Hearts & Stars
    - PlaySquare - Replaced with Stars & Hearts
    - Megaphone - Replaced with Hearts & Stars
  - Icon props: `className` (Tailwind), `size` (px), `strokeWidth` (px)
  - Tree-shaking: Only used icons included in bundle

### Real-Time Communication

#### Socket.IO Client
- **Socket.IO Client 4.8.3** - WebSocket client for signaling
  - Why Socket.IO? Automatic reconnection, room support, fallback polling
  - Usage: WebRTC signaling, dice sync, chat messages
  - Configuration:
    - URL: `VITE_SIGNALING_URL` environment variable
    - Transports: WebSocket (primary), polling (fallback)
    - Auto-reconnect: Enabled
  - Events sent:
    - `join-room` - Join a room
    - `dice-roll` - Broadcast dice roll
    - `dice-config` - Broadcast dice configuration
    - `chat-message` - Send chat message
  - Events received:
    - `existing-participants` - Initial participant list
    - `user-joined` - New user joined
    - `user-left` - User left room
    - `dice-roll` - Receive dice roll
    - `dice-config` - Receive dice configuration
    - `chat-message` - Receive chat message
  - Manager class: `WebRTCManager` in `src/lib/webrtc.ts`

#### WebRTC API
- **WebRTC API** - P2P video/audio streaming (native browser API)
  - Why WebRTC? Direct peer-to-peer connection, no server cost, high quality
  - Features used:
    - `getUserMedia()` - Get camera/microphone stream
    - `RTCPeerConnection` - Direct peer connection
    - `RTCDataChannel` - Data channel for dice sync (fallback to Socket.IO)
    - `addTrack()` / `removeTrack()` - Manage media streams
  - Constraints: { video: true, audio: true }
  - STUN Servers: Free public STUN servers (Google, Mozilla)
  - Limitations:
    - P2P only (no SFU currently)
    - Max ~10 participants (quality degrades beyond)
    - Requires HTTPS (or localhost)
    - Requires user permission for camera/mic

### Date/Time
- **date-fns 4.1.0** - Lightweight date manipulation
  - Why date-fns? Tree-shakeable, no dependencies, modular
  - Usage:
    - Format chat timestamps: `format(new Date(), 'PPpp')`
    - Format announcement dates: `format(new Date(isoString), 'PPpp')`
  - Functions used:
    - `format()` - Format dates
    - `formatDistanceToNow()` - Relative time (planned)
  - Locale: English (default)
  - Tree-shaking: Only used functions included in bundle

---

## Backend Stack

### Runtime
- **Node.js 18+** - JavaScript runtime
  - Why Node.js? Largest ecosystem, async/await support, great performance
  - Version: 18.x LTS (Long Term Support)
  - Features: ES modules, async/await, Fetch API

- **Express 4.19.2** - Web framework for signaling server
  - Why Express? Minimal setup, middleware support, large ecosystem
  - Usage: HTTP server, WebSocket server (via Socket.IO)
  - Middleware: CORS (handled by Socket.IO)
  - Routes: Handled by Socket.IO, not Express routing

### Signaling Server
- **Socket.IO 4.8.3** - WebSocket server
  - Why Socket.IO? Automatic reconnection, room support, client library
  - Server file: `server/signaling-server.js`
  - Dependencies: express, socket.io, cors
  - Configuration:
    - Port: 3001 (hardcoded)
    - CORS: Allowed for all origins (development)
    - Transports: WebSocket, polling
  - Features:
    - **Room-based architecture** - Users join rooms, events broadcast to room
    - **Presence tracking** - Track who's in room
    - **WebRTC signaling** - Relay offers/answers between peers
  - Events handled (server side):
    - `connection` - New client connected
    - `join-room` - Client joins a room
    - `offer` - WebRTC offer from peer
    - `answer` - WebRTC answer to peer
    - `ice-candidate` - ICE candidate for WebRTC
    - `dice-roll` - Broadcast dice roll to room
    - `dice-config` - Broadcast dice config to room
    - `chat-message` - Broadcast chat to room
    - `disconnect` - Client disconnected

### Features
- **WebRTC Signaling** - Relays peer connection offers/answers
  - Flow:
    1. Peer A sends offer via Socket.IO
    2. Server relays offer to Peer B
    3. Peer B sends answer via Socket.IO
    4. Server relays answer to Peer A
    5. ICE candidates exchanged through server
    6. Direct P2P connection established

- **Dice Synchronization** - Broadcasts dice rolls to room
  - Event: `dice-roll` - { roomId, roll, userId, timestamp }
  - Broadcast: `socket.to(roomId).emit('dice-roll', { roll, userId })`
  - Conflict resolution: Timestamp-based (latest wins)

- **Chat Broadcasting** - Forwards chat messages to room
  - Event: `chat-message` - { roomId, message }
  - Message format: { userId, userName, text, timestamp }
  - Broadcast: `socket.to(roomId).emit('chat-message', message)`

- **Presence Tracking** - Tracks user joins/leaves
  - Join: `socket.broadcast.to(roomId).emit('user-joined', { userId, userName, socketId })`
  - Leave: `socket.broadcast.to(roomId).emit('user-left', { userId })`

---

## Development Tools

### Build & Bundle
- **Vite 7.0.4** - Fast HMR, optimized production builds
  - Configuration: `vite.config.ts`
  - Plugins:
    - `@vitejs/plugin-react` - React JSX support
    - `@vitejs/plugin-basic-ssl` - HTTPS for dev
    - `@tailwindcss/vite` - TailwindCSS integration
    - Custom `errorMonitorPlugin()` - Build error tracking (dev only)
    - Custom `createServeGeneratedCssPlugin()` - Serve theme CSS (dev only)
  - Build output: `dist/` directory
  - Assets: Hashed filenames (cache busting)

- **Terser 5.46.0** - JavaScript minifier
  - Why Terser? Fast, ES2015+ support, compresses dead code
  - Configuration: `minify: 'terser'` in vite.config.ts
  - Features: Dead code elimination, identifier mangling, whitespace removal

- **Rollup** - Bundler (built into Vite)
  - Role: Bundle optimization, code splitting, tree shaking
  - Configuration: `build.rollupOptions` in vite.config.ts
  - Manual chunking: Planned for Phase 4 (vendor-react, vendor-ui, etc.)

### Code Quality

- **TypeScript** - Static type checking
  - Configuration: `tsconfig.json` with strict mode
  - Strict mode enabled: True
  - Features: No implicit any, strict null checks, strict function types
  - Type checking command: `npm run typecheck`

- **ESLint 9.30.1** - Linting and code style
  - Configuration: `eslint.config.js` with TypeScript plugin
  - Rules: React-specific, TypeScript-specific, general best practices
  - Linting command: `npm run lint`

- **Git** - Version control
  - Branching: Feature branches, main for production
  - Commit format: Conventional Commits (type(scope): subject)
  - Documentation: Git commit messages, AGENTS.md for context

### Package Manager
- **npm** - Dependency management and scripts
  - Lock file: `package-lock.json`
  - Scripts: dev, build, typecheck, lint, preview
  - Registry: npm (default)

---

## Deployment

### Frontend (Static Files)
- **Platform:** AlterVista Free Tier
  - Why AlterVista? Free static hosting, PHP support (not used), FTP access
  - Type: Static file hosting (HTML, CSS, JS)
  - Build artifacts: dist/ directory
  - Deployment: Upload dist/ contents via FTP
  - URL: (configured in AlterVista account)

- **Limitations:**
  - Static only (no server-side rendering)
  - HashRouter required (no BrowserRouter support)
  - Limited bandwidth (free tier)

### Backend (Signaling Server)
- **Platform:** Oracle Cloud Free Tier
  - Why Oracle Cloud? Free tier with public IP, always-on VM
  - Runtime: Node.js 18+ on Oracle Linux
  - Port: 3001 (HTTP/WebSocket)
  - Protocol: WebSocket (via Socket.IO)
  - Deployment: SSH to server, run `npm start` with PM2/systemd
  - Process manager: PM2 (recommended) - Keeps server running on restart

### Environment Variables

**Development (.env.local):**
```bash
VITE_SIGNALING_URL=http://localhost:3001
VITE_ROOM_ID=default-room
VITE_ENABLE_WEBCRTC=true
VITE_ENABLE_DICE=true
VITE_ENABLE_TRUTH_OR_DARE=false
```

**Production (server environment):**
```bash
VITE_SIGNALING_URL=https://your-signaling-server.oraclecloudapps.com
VITE_ROOM_ID=default-room
```

**Access:**
- Frontend: Uses `VITE_SIGNALING_URL` from build-time environment
- Backend: Hardcoded port 3001 (can be changed in signaling-server.js)

---

## Key Libraries

### Radix UI Primitives
All Radix UI components used in the project:

#### Dialog
- **@radix-ui/react-dialog** v1.1.15
- Usage: Modals, alerts, confirmations
- Features: Trap focus, keyboard navigation, aria attributes

#### Label
- **@radix-ui/react-label** v2.1.7
- Usage: Form labels, input descriptions
- Features: Click-through to associated input

#### Popover
- **@radix-ui/react-popover** v1.1.15
- Usage: Dropdown menus, tooltips, popovers
- Features: Positioning, collision detection

#### Scroll Area
- **@radix-ui/react-scroll-area** v1.2.10
- Usage: Custom scrollbars in lists, panels
- Features: Smooth scrolling, customizable thumb

#### Select
- **@radix-ui/react-select** v2.2.6
- Usage: Dropdown selects (camera selection)
- Features: Keyboard navigation, virtualization (planned)

#### Separator
- **@radix-ui/react-separator** v1.1.7
- Usage: Visual dividers between sections
- Features: Horizontal and vertical orientations

#### Slot
- **@radix-ui/react-slot** v1.2.3
- Usage: Compound components (buttons, cards)
- Features: Child composition

#### Switch
- **@radix-ui/react-switch** v1.2.6
- Usage: Toggle switches (camera, microphone)
- Features: Accessible toggle with animation

#### Tabs
- **@radix-ui/react-tabs** v1.1.13
- Usage: Tab navigation (planned features)
- Features: Keyboard navigation, aria attributes

#### Tooltip
- **@radix-ui/react-tooltip** v1.2.8
- Usage: Hover tooltips, help text
- Features: Delay, positioning, collision detection

### Other UI Libraries

#### Class Variance Authority (CVA)
- **class-variance-authority** v0.7.1
- Usage: Button variants (default, outline, ghost, etc.)
- Features: Composable variant system, type-safe

#### Tailwind Merge
- **tailwind-merge** v3.3.1
- Usage: Merge Tailwind className strings
- Features: Prevents style conflicts, responsive merge

#### clsx
- **clsx** v2.1.1
- Usage: Conditional className strings
- Features: Type-safe, zero-config

#### Embla Carousel
- **embla-carousel-react** v8.6.0
- Usage: Carousel components (planned for media gallery)
- Features: Touch gestures, infinite scroll, snap

#### Input OTP
- **input-otp** v1.4.2
- Usage: OTP-style inputs (planned for auth codes)
- Features: Auto-focus, paste support, validation

#### React Resizable Panels
- **react-resizable-panels** v3.0.5
- Usage: Resizable layout (call video grid)
- Features: Drag resize, persist size, collapse panels

#### React RND
- **react-rnd** v10.5.2
- Usage: Resizable draggable video boxes
- Features: Drag and resize, bounds, grid snap

### Chat & Emojis

#### Emoji Picker React
- **emoji-picker-react** v4.17.2
- Usage: Emoji picker for chat
- Features:
  - Categories: Smilies, people, animals, food, activities, objects
  - Search: Search emojis by name
  - Recent: Recently used emojis
  - Skin tones: Multiple skin tone options
  - Custom: Can add custom emojis

### Form Validation

#### Zod
- **zod** v4.1.5
- Usage: Schema validation (planned for form inputs)
- Features:
  - Type inference from schemas
  - Composable schemas
  - Runtime validation
  - Error messages

#### React I18next
- **react-i18next** v16.0.0
- Usage: Internationalization (planned for multi-language support)
- Features:
  - Translations: JSON/PO files
  - Interpolation: Dynamic values in translations
  - Pluralization: Singular/plural forms
  - Namespaces: Organized translations by feature

---

## Architecture Notes

### State Management Pattern

#### Why Zustand?
- Single store with multiple sections
- Direct access via `useAppStore()` hook
- No Context API or providers (except sidebar)
- Predictable state updates with DevTools support

#### Store Structure
```typescript
interface AppState {
  // User & Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Content
  menuItems: MenuItem[];
  mediaItems: MediaItem[];
  announcements: Announcement[];
  addMenuItem: (item) => void;
  addMediaItem: (item) => void;
  addAnnouncement: (item) => void;

  // Dice Game
  individualDice: IndividualDiceConfig[];
  lastRoll: number[];
  heldDice: boolean[];
  rollDice: () => void;
  toggleHold: (index) => void;
  updateIndividualDie: (id, patch) => void;

  // Call (WebRTC, chat, participants)
  call: CallState;
  setCall: (patch) => void;
  remoteStreams: RemoteStream[];
  localStream: MediaStream | null;
  chatMessages: ChatMessage[];
  addChatMessage: (message) => void;

  // Truth or Dare (incomplete)
  // ... (see Phase 3)
}
```

#### Access Pattern
```typescript
// Direct selector (optimized for subscriptions)
const user = useAppStore((s) => s.user);
const rollDice = useAppStore((s) => s.rollDice);

// Multiple selectors (one subscription)
const { user, call, rollDice } = useAppStore((s) => ({
  user: s.user,
  call: s.call,
  rollDice: s.rollDice
}));
```

### WebRTC Architecture

#### Why P2P?
- Direct peer-to-peer connection
- No server processing of media streams
- Low latency, high quality
- No server cost for media

#### Connection Flow
1. User A calls `joinCall()` in store
2. WebRTCManager initialized with signaling server
3. Manager requests camera/microphone access
4. Manager emits `join-room` event via Socket.IO
5. Server notifies other users: `user-joined`
6. For each remote user:
   - Manager creates `RTCPeerConnection`
   - Manager creates offer (SDP)
   - Manager emits `offer` event via Socket.IO
7. Remote user's manager receives `offer`
8. Remote manager creates answer (SDP)
9. Remote manager emits `answer` event via Socket.IO
10. Local manager receives `answer`
11. Direct P2P connection established via ICE candidates
12. Media streams start flowing between peers

#### Limitations
- Max ~10 participants (quality degrades beyond)
- No SFU (Selective Forwarding Unit) - to be addressed in Phase 6
- Requires HTTPS (or localhost)
- Requires user permission for camera/microphone
- Firewall/NAT issues may block connections (STUN servers help)

### Real-Time Sync Pattern

#### Why Event-Based Sync?
- All users receive same event
- Server acts as relay only
- Conflict resolution by timestamp
- No server-side state management

#### Event Flow (Dice Roll)
1. User A clicks "Roll Dice"
2. Store calls `rollDice()`
3. Store updates `lastRoll` in state
4. Store calls `webrtcManager.sendDiceRoll(roll)`
5. Manager emits `dice-roll` event via Socket.IO
6. Server broadcasts to room: `socket.to(roomId).emit('dice-roll', { roll, userId })`
7. User B receives `dice-roll` event
8. User B's manager emits `onDiceRoll` callback
9. User B's store updates `lastRoll` from event
10. Both users see same dice roll

#### Conflict Resolution
```typescript
// Only accept rolls from other users
onDiceRoll: (event) => {
  const state = get();
  if (event.userId === state.user?.id) return; // Ignore own events
  set({ lastRoll: event.roll });
}
```

---

## Development Workflow

### Running Locally
```bash
# Terminal 1: Start signaling server
cd server
npm start
# Server runs on http://localhost:3001

# Terminal 2: Start frontend
npm run dev
# App runs on http://localhost:3000
# HMR enabled for fast development
```

### Building for Production
```bash
npm run build
# Output in dist/ directory
# Files:
# - index.html
# - assets/
#   - index-XXXXXX.js (bundled JS)
#   - index-XXXXXX.css (bundled CSS)
#   - generated/
#     - theme.css (CSS variables)
#     - font.css (font definitions)
```

### Type Checking
```bash
npm run typecheck
# TypeScript compilation only (no output)
# Checks for type errors across all files
# Should pass with 0 errors
```

### Linting
```bash
npm run lint
# ESLint checks
# Should pass with ≤8 warnings
```

---

## Performance Targets

### Bundle Size
- **Current:** 297KB (gzipped)
- **Target:** <400KB (gzipped) ✅ Already met
- **Phase 4 Goal:** Further optimization with code splitting
- **Goal:**
  - Initial load: ~150-200KB (gzipped)
  - Route chunks: On-demand loading
  - Vendor chunks: Better caching

### Load Time
- **Target:** <2s initial load on 3G
- **Current:** ~1.5-2s (estimated)
- **Phase 4 Goal:** ~1s initial load with code splitting

### Latency
- **Dice sync:** <200ms (target)
- **Video latency:** <500ms (acceptable for P2P)
- **Chat latency:** <100ms (nearly instant)

---

## Future Tech Considerations

### Potential Upgrades
- **SFU (Selective Forwarding Unit)** - Support >10 participants
  - Why: Current P2P degrades beyond ~10 users
  - Options: mediasoup, LiveKit, Jitsi Meet
  - Complexity: Significantly higher than P2P
  - Cost: Server processing cost (not free tier)

- **IndexedDB** - Client-side persistence
  - Why: Current state lost on refresh
  - Alternative: localStorage (simpler, 5MB limit)
  - Phase: 6

- **Service Workers** - Offline support
  - Why: Progressive Web App (PWA) capabilities
  - Features: Offline caching, push notifications
  - Phase: 6

- **React Server Components** - Next.js migration consideration
  - Why: Better SEO, server rendering, faster initial load
  - Challenges: Requires server-side rendering (not on AlterVista)
  - Phase: 6+ (future consideration)

- **Vitest** - Unit testing framework
  - Why: Fast, Vite-native, better than Jest
  - Current: No tests (Phase 5)
  - Phase: 6

---

## File Structure

### Frontend
```
src/
├── app.tsx                          # Main app router with lazy loading
├── index.css                         # Tailwind CSS with @theme inline
├── main.tsx                          # App entry point
├── components/                        # React components
│   ├── app/                          # App shell, navigation
│   │   ├── app-shell.tsx              # Main layout wrapper
│   │   ├── login-gate.tsx             # Login/authentication
│   │   └── board-card.tsx             # Reusable card component
│   ├── call/                         # Video calling
│   │   ├── call-panel.tsx              # Main call container (391 lines)
│   │   ├── stage-panel.tsx             # Stage management
│   │   ├── draggable-video-box.tsx     # Draggable video elements
│   │   └── emoji-reactions.tsx        # Emoji reaction system
│   ├── dice/                         # Dice game
│   │   ├── individual-dice-preview.tsx   # Dice display with animations
│   │   └── individual-dice-customizer.tsx # Dice customization UI
│   ├── game/                         # Other games
│   │   ├── truth-or-dare-panel.tsx    # Truth or Dare game (168 lines)
│   │   ├── prompt-card.tsx            # Prompt display
│   │   ├── spice-selector.tsx          # Spice level selection
│   │   └── player-turn-indicator.tsx   # Turn management
│   ├── chat/                         # Chat components
│   │   ├── chat-panel.tsx              # Chat container
│   │   ├── chat-message.tsx            # Individual message
│   │   ├── chat-input.tsx             # Message input
│   │   └── emoji-picker-button.tsx     # Emoji picker trigger
│   ├── ui/                           # Reusable UI primitives
│   │   ├── button.tsx                 # Button component
│   │   ├── card.tsx                   # Card component
│   │   ├── input.tsx                  # Input component
│   │   ├── select.tsx                  # Select component
│   │   ├── dialog.tsx                 # Modal dialog
│   │   ├── sheet.tsx                  # Side sheet
│   │   ├── sidebar.tsx                 # Sidebar (726 lines - needs refactor)
│   │   ├── sonner.tsx                 # Toast notifications
│   │   └── [20+ more UI components...]
│   └── loading/                      # Loading states
│       └── page-loader.tsx             # Page loading spinner
├── lib/                             # Utilities and helpers
│   ├── types.ts                        # TypeScript type definitions
│   ├── webrtc.ts                       # WebRTC manager class
│   ├── permissions.ts                  # Permission check functions
│   ├── utils.ts                        # Utility functions
│   └── [other utilities...]
├── store/                           # Zustand store
│   └── useAppStore.ts                # Global state (600+ lines)
├── hooks/                           # Custom React hooks
│   ├── use-mobile.ts                  # Mobile detection hook
│   └── useCameraStream.ts            # Camera stream hook
├── pages/                           # Route pages
│   ├── hub-page.tsx                  # Main hub with boards (285 lines)
│   ├── dice-page.tsx                 # Dice game page (85 lines)
│   ├── truth-or-dare-page.tsx         # Truth or Dare page
│   ├── admin-page.tsx                 # Admin panel (245 lines)
│   ├── call-page.tsx                  # Call view page
│   └── not-found.tsx                 # 404 page
├── data/                            # Static data
│   └── truth-or-dare-prompts.ts       # 120+ prompts
└── generated/                       # Auto-generated files
    ├── theme.css                     # CSS variables (theme)
    └── font.css                      # Font definitions
```

### Backend
```
server/
├── signaling-server.js               # Socket.IO server (main file)
├── package.json                     # Server dependencies
└── package-lock.json                # Server lock file
```

### Documentation
```
docs/
├── PHASE_2_COMPLETE.md             # Phase 2 completion notes
├── PHASE_3_PARTIAL.md             # Phase 3 progress notes
├── PHASE_3_UPDATE.md              # Phase 3 update notes
├── PHASE_4_PLAN.md                # Phase 4 detailed plan
├── SESSION_SUMMARY.md               # Development session notes
└── TRUTH_OR_DARE_DESIGN.md        # Game design document

[Root]
├── README.md                        # Project overview
├── CONTRIBUTING.md                  # Coding standards
├── ARCHITECTURE.md                  # Architecture decisions
├── ROADMAP.md                       # Development phases
├── ISSUE_TRACKING.md                # Known issues
├── DEPLOYMENT.md                    # Deployment guide
└── AGENTS.md                       # AI agent guidelines
```

---

*Last Updated: 2026-01-31*
*Maintained for: Current project status, tech stack documentation, developer onboarding*
