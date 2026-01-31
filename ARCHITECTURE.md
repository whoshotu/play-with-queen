# Architecture Documentation

This document explains the architectural decisions, design patterns, and technical choices for the Interactive Content Creator Platform.

---

## Table of Contents
- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [WebRTC & Real-time](#webrtc--real-time)
- [State Management](#state-management)
- [Game Synchronization](#game-synchronization)
- [Security Considerations](#security-considerations)
- [Scalability](#scalability)
- [Technology Choices](#technology-choices)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React App  │  │  WebRTC P2P  │  │  Socket.IO   │         │
│  │   (Vite)     │  │  (Video)     │  │  (Signaling) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                   │                  │
│         └─────────────────┴───────────────────┘                  │
│                          │                                       │
│                          ▼                                       │
│                  ┌──────────────┐                               │
│                  │  Zustand     │                               │
│                  │  (State)     │                               │
│                  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/HTTP
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌─────────────────┐
│  AlterVista     │                  │  Oracle Cloud    │
│  (Static)       │                  │  (Signaling)     │
│  • HTML/CSS/JS  │                  │  • Socket.IO     │
│  • Assets       │                  │  • Relay server   │
│  • Free Tier    │                  │  • Free Tier     │
└─────────────────┘                  └─────────────────┘
```

### Data Flow Diagram

```
┌─────────────┐
│   User A    │
│   (Browser) │
└──────┬──────┘
       │ 1. Join Call
       ▼
┌─────────────────────────────────────────────────────────────┐
│  React App (Client A)                                        │
│  ├─ Request camera/mic                                      │
│  ├─ Create WebRTCManager                                    │
│  ├─ Connect to signaling server                              │
│  └─ Join room "default-room"                                │
└────────────────────────┬────────────────────────────────────┘
                       │ Socket.IO
                       ▼
              ┌─────────────────┐
              │ Signaling       │
              │ Server          │
              │ (Oracle Cloud)  │
              └────────┬────────┘
                       │ Broadcast "user-joined"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  React App (Client B)                                        │
│  ├─ Receive "user-joined"                                    │
│  ├─ Create peer connection to Client A                        │
│  └─ Exchange WebRTC offers/answers                           │
└────────────────────────┬────────────────────────────────────┘
                       │ WebRTC P2P
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Direct P2P Connection                                       │
│  ├─ Video streams (A ↔ B)                                    │
│  ├─ Audio streams (A ↔ B)                                    │
│  ├─ Data channels (game state sync)                          │
│  └─ ICE candidates (NAT traversal)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App (HashRouter)
├── LoginGate (Auth)
├── AppShell (Layout)
│   ├── Header/Navigation
│   ├── Sidebar (Collapsible)
│   └── Main Content Area
├── Routes
│   ├── HubPage (/)
│   │   ├── MenuBoard (CRUD)
│   │   ├── MediaBoard (CRUD)
│   │   ├── AnnouncementBoard (CRUD)
│   │   └── CallPanel (Preview)
│   ├── DicePage (/dice)
│   │   ├── DiceCustomizer
│   │   ├── DicePreview
│   │   ├── ChatPanel
│   │   └── CallPanel (Preview)
│   ├── CallPage (/call)
│   │   ├── StagePanel (Video grid)
│   │   ├── ChatPanel
│   │   └── DraggableVideoBox
│   └── AdminPage (/admin)
│       └── Role/Permission Management
└── Toaster (Notifications)
```

### Design Patterns

#### 1. Single Source of Truth
**Pattern:** Zustand store as the only state container

**Benefits:**
- Predictable state updates
- Easy debugging (DevTools)
- No prop drilling
- Centralized business logic

**Example:**
```typescript
// State is only modified through store actions
const { rollDice, lastRoll } = useAppStore();

// Any component accessing lastRoll sees the same value
```

#### 2. Feature-Based Components
**Pattern:** Components organized by domain feature, not type

**Directory Structure:**
```
components/
├── call/          # Video calling feature
├── dice/          # Dice game feature
├── game/          # Other games
├── chat/          # Chat feature
└── ui/            # Reusable primitives
```

#### 3. Composition Over Inheritance
**Pattern:** Build complex UIs from simple components

**Example:**
```typescript
// Complex component built from simple ones
<BoardCard>
  <BoardCard.Header />
  <BoardCard.Content>
    {items.map(item => <BoardCardItem key={item.id} {...item} />)}
  </BoardCard.Content>
</BoardCard>
```

#### 4. Custom Hooks for Business Logic
**Pattern:** Extract complex logic into reusable hooks

**Example:**
```typescript
// useCameraStream.ts
export function useCameraStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const start = async (deviceId?: string) => {
    // Camera logic
  };
  
  const stop = () => {
    // Stop logic
  };
  
  return { stream, error, start, stop };
}
```

---

## Backend Architecture

### Signaling Server Design

**File:** `server/signaling-server.js`

**Purpose:** Coordinate WebRTC peer connections, relay signaling messages

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                Signaling Server                          │
│  (Node.js + Express + Socket.IO)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  HTTP Server │  │  Socket.IO   │  │  Room Manager │  │
│  │  (Express)   │  │  (WebSocket) │  │  (Map)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                   │          │
│         └─────────────────┴───────────────────┘          │
│                          │                               │
│                          ▼                               │
│              ┌──────────────────────┐                   │
│              │  Event Handlers      │                   │
│              │  • join-room         │                   │
│              │  • offer/answer       │                   │
│              │  • ice-candidate     │                   │
│              │  • chat-message      │                   │
│              │  • user-joined/left  │                   │
│              └──────────────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Server State Management

```javascript
// Room structure
rooms = Map<string, Map<string, Participant>>

// Participant structure
Participant {
  userId: string
  userName: string
  socketId: string
  joinedAt: string (ISO)
}
```

### Event Flow

```javascript
// Client joins
socket.on('join-room', ({ roomId, userId, userName }) => {
  // 1. Add participant to room
  // 2. Send existing participants to new user
  // 3. Broadcast new user to existing participants
})

// WebRTC signaling (relay only - no processing)
socket.on('offer', ({ to, from, offer }) => {
  io.to(to).emit('offer', { from, offer })
})

socket.on('answer', ({ to, from, answer }) => {
  io.to(to).emit('answer', { from, answer })
})

socket.on('ice-candidate', ({ to, from, candidate }) => {
  io.to(to).emit('ice-candidate', { from, candidate })
})

// Cleanup
socket.on('disconnect', () => {
  // 1. Remove participant from room
  // 2. Broadcast user-left
  // 3. Delete empty rooms
})
```

---

## WebRTC & Real-time

### WebRTC Connection Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│  1. INITIALIZATION                                              │
├─────────────────────────────────────────────────────────────────┤
│  • User joins call                                              │
│  • Request camera/mic permissions                              │
│  • Create WebRTCManager instance                                │
│  • Connect to signaling server via Socket.IO                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. ROOM JOINING                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Client → Server: join-room                                     │
│  Server → Client: existing-participants                         │
│  Server → Others: user-joined                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. PEER CONNECTION ESTABLISHMENT                              │
├─────────────────────────────────────────────────────────────────┤
│  • Create RTCPeerConnection for each participant                │
│  • Add local stream tracks                                       │
│  • ICE candidate gathering (NAT traversal)                       │
│  • SDP offer/answer exchange via signaling                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. MEDIA STREAMING                                             │
├─────────────────────────────────────────────────────────────────┤
│  • Direct P2P video/audio streams                                │
│  • No server involvement (after signaling)                      │
│  • Automatic adaptation to network conditions                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. CLEANUP                                                      │
├─────────────────────────────────────────────────────────────────┤
│  • User leaves or disconnects                                   │
│  • Stop all tracks                                               │
│  • Close peer connections                                        │
│  • Disconnect signaling socket                                  │
└─────────────────────────────────────────────────────────────────┘
```

### STUN/TURN Configuration

**Current:** Public STUN servers (Google)

```javascript
ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]
```

**Future (if needed):** Add TURN server for symmetric NAT

### Mixed Content Handling

**Problem:** HTTPS frontend + HTTP signaling = blocked WebSocket

**Solution:** Progressive transport fallback

```javascript
// 1. Try WebSocket first (if HTTPS)
socket = io(url, { transports: ['websocket', 'polling'] })

// 2. Fallback to polling-only (if mixed content blocked)
socket = io(url, { 
  transports: ['polling'],
  upgrade: false 
})
```

---

## State Management

### Zustand Store Architecture

**File:** `src/store/useAppStore.ts`

**Design Principles:**

1. **Single Store:** All state in one store
2. **Action-Based:** State changes through actions only
3. **Selectors:** Computed values via selectors
4. **Immutability:** Always return new state objects

### State Sections

#### 1. User & Auth
```typescript
user: User | null
setUser(user: User | null)
setRole(role: Role)
```

#### 2. Content Management
```typescript
menuItems: MenuItem[]
mediaItems: MediaItem[]
announcements: Announcement[]
// CRUD operations for each
```

#### 3. Dice Game
```typescript
individualDice: IndividualDiceConfig[]
lastRoll: number[]
heldDice: boolean[]
rollDice(): number[]
toggleHold(index: number)
// Customization actions
```

#### 4. Call / WebRTC
```typescript
call: CallState {
  joined: boolean
  participants: Participant[]
  chatMessages: ChatMessage[]
}
webrtcManager: WebRTCManager | null
localStream: MediaStream | null
remoteStreams: Map<string, MediaStream>
// WebRTC actions
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Component                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  const state = useAppStore(selector)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Read
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  state = {                                         │   │
│  │    user, dice, call, ...                           │   │
│  │  }                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Update
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Component                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  const action = useAppStore.action                  │   │
│  │  action()                                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Game Synchronization

### Current Problem

**Issue:** Dice rolls are NOT synchronized across users

**Evidence:**
```typescript
// src/store/useAppStore.ts:230-251
rollDice: () => {
  const newValues = Array.from({ length: diceCount }).map((_, i) => {
    return 1 + (array[i] % 6);  // Local random generation
  });
  
  set({ lastRoll: newValues });  // Only updates local state
  return newValues;  // ❌ No broadcasting
}
```

### Required Solution

**Pattern:** Broadcast game state via WebRTC data channel or signaling

#### Implementation Design

```typescript
// Option 1: Use WebRTC data channel (recommended)
class WebRTCManager {
  private dataChannel: RTCDataChannel | null;
  
  broadcastDiceRoll(roll: number[]) {
    // Send via data channel to all peers
    this.peerConnections.forEach((pc, userId) => {
      const channel = pc.connection.createDataChannel('game-state');
      channel.send(JSON.stringify({
        type: 'dice-roll',
        data: roll,
        timestamp: Date.now(),
      }));
    });
  }
}

// Option 2: Use signaling server (simpler, more reliable)
socket.emit('dice-roll', { roomId, roll: number[] });

// Server relays to all clients
socket.to(roomId).emit('dice-roll', { roll });
```

### Synchronization Protocol

```typescript
// Events that MUST be synchronized
interface GameEvent {
  type: 'dice-roll' | 'dice-config' | 'truth-or-dare-select';
  userId: string;
  timestamp: number;
  data: unknown;
}

// Example: Dice roll
{
  type: 'dice-roll',
  userId: 'user_123',
  timestamp: 1701234567890,
  data: {
    roll: [3, 5, 2, 6],
    heldDice: [false, true, false, false],
  }
}
```

### Conflict Resolution

**Strategy:** Last-write-wins with timestamp

```typescript
function handleDiceRoll(event: GameEvent) {
  const existingRoll = lastRolls.get(event.userId);
  
  // Accept if newer than existing
  if (!existingRoll || event.timestamp > existingRoll.timestamp) {
    updateStore(event.data);
  }
}
```

---

## Security Considerations

### Authentication

**Current:** Cookie-based authentication (dev-only)

**Production Recommendation:** JWT-based auth

```typescript
// Future implementation
interface AuthState {
  token: string | null;
  user: User | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}
```

### Authorization

**Current:** Role-based permissions

```typescript
// src/lib/permissions.ts
export function canEditBoards(role: Role): boolean {
  return ['admin', 'creator', 'mod'].includes(role);
}

export function canUseCameraByDefault(role: Role): boolean {
  return ['admin', 'creator', 'mod'].includes(role);
}
```

### WebRTC Security

**Considerations:**
1. **Authentication required** before joining calls
2. **Room access control** (private rooms)
3. **Signaling server** validates room membership
4. **TURN server** (if used) should require auth

### Data Privacy

**Sensitive Data:**
- ❌ Don't log video/audio streams
- ❌ Don't store video/audio on server
- ✅ Only store metadata (chat logs, game results)
- ✅ Use HTTPS for all connections

---

## Scalability

### Current Limitations

| Component | Limitation | Solution |
|-----------|------------|----------|
| Signaling Server | Single instance | Horizontal scaling with Redis adapter |
| WebRTC | Max ~100 peers per room | SFU (Selective Forwarding Unit) |
| Zustand Store | In-memory only | Persist to localStorage/backend |

### Future Scaling Options

#### 1. Signaling Server Scaling

```javascript
// Current: Single server
const io = new Server(httpServer);

// Future: Redis adapter for horizontal scaling
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  adapter: createAdapter(pubClient, subClient)
});
```

#### 2. WebRTC SFU

**Purpose:** Relay media streams for large groups

**Tools:**
- Mediasoup
- LiveKit
- Jitsi (self-hosted)

---

## Technology Choices

### Why Vite?

**Chosen over:**
- ❌ Webpack (complex configuration)
- ❌ Create React App (ejected, outdated)
- ❌ Parcel (less control)

**Benefits:**
- ⚡ Fast HMR (Hot Module Replacement)
- 📦 Optimized production builds
- 🎯 ESM-first, TypeScript support
- 🔧 Simple configuration

### Why Zustand?

**Chosen over:**
- ❌ Redux (too much boilerplate)
- ❌ Context API (performance issues with frequent updates)
- ❌ Jotai (less popular, smaller community)

**Benefits:**
- 📦 Simple API
- ⚡ No providers needed
- 🎯 Built-in DevTools
- 🔧 TypeScript support

### Why HashRouter?

**Chosen over:**
- ❌ BrowserRouter (requires server-side routing config)

**Benefits:**
- ✅ Works with static hosting (AlterVista)
- ✅ No server configuration needed
- ✅ Back button still works

**Trade-off:**
- ❌ SEO not friendly (acceptable for app-like experience)

### Why Socket.IO?

**Chosen over:**
- ❌ Raw WebSockets (no fallback, no rooms)
- ❌ Firebase (vendor lock-in, cost)
- ❌ Pusher (paid service)

**Benefits:**
- 🔄 Automatic reconnection
- 📦 Built-in rooms
- 🌐 Transport fallback (polling → WebSocket)
- ✅ Free tier available

### Why WebRTC?

**Chosen over:**
- ❌ Server-side streaming (high cost, latency)
- ❌ Third-party video SDK (vendor lock-in, cost)

**Benefits:**
- 🆓 P2P (no server costs for media)
- ⚡ Low latency (direct connection)
- 🔒 End-to-end encryption
- 🎯 Browser native API

---

## Deployment Architecture

### Frontend (AlterVista)

```
User
  │
  ▼ HTTPS
┌─────────────────┐
│  AlterVista     │
│  • Static files │
│  • Free tier    │
│  • No backend   │
└────────┬────────┘
         │
         │ Load: index.html
         │       assets/
         │       generated/
         ▼
   Browser Cache
```

### Backend (Oracle Cloud)

```
User
  │
  ▼ HTTPS/HTTP
┌─────────────────┐
│  Oracle Cloud   │
│  Compute Free   │
│  - Node.js      │
│  - Socket.IO    │
│  - Port 3001    │
└─────────────────┘
  │
  │ Relay (signaling only)
  ▼
Other Users
```

---

## Version History

| Date | Version | Changes |
|------|--------|---------|
| 2026-01-30 | 1.0.0 | Initial architecture document |

---

*This document should be updated when architectural decisions change or new patterns are introduced.*
