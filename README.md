# Interactive Content Creator Platform

A real-time interactive platform for content creators with video calling, dice games, and chat synchronization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.0-blue.svg)

---

## Features

- 🎮 **Real-time Dice Game** - Customizable dice with synchronized rolls across users ✅
- 📹 **Multi-camera Video Calling** - WebRTC-based P2P video calls with multiple participants
- 💬 **Live Chat** - Real-time messaging and emoji reactions
- 📋 **Content Boards** - Menu, media, and announcement management
- 🎲 **Theme System** - Dark theme with purple and pink accents
- 💖 **Custom Icons** - Hearts & Stars throughout the UI
- 🔥 **In Progress:** Truth or Dare with spicy twist (70% complete)

---

## Tech Stack

### Frontend
- **Framework:** React 19.1.0
- **Build:** Vite 7.0.4
- **State:** Zustand 5.0.8
- **Styling:** TailwindCSS 4.1.13
- **Routing:** React Router 7.9.3
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 18+
- **WebRTC Signaling:** Socket.IO 4.8.3
- **Server:** Express 4.19.2

### Deployment
- **Frontend:** AlterVista (Free Tier)
- **Backend:** Oracle Cloud Free Tier

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Interactive content creator website-Page not found error causes"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start signaling server**
   ```bash
   cd server
   npm install
   npm start
   # Server runs on http://localhost:3001
   ```

4. **Start frontend** (new terminal)
   ```bash
   npm run dev
   # App runs on http://localhost:3000
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create `.env.local` in project root:

```bash
# Signaling server URL
VITE_SIGNALING_URL=http://localhost:3001

# Room ID (optional)
VITE_ROOM_ID=default-room
```

---

## Project Structure

```
project-root/
├── src/                      # Frontend source
│   ├── components/            # React components
│   │   ├── app/             # App shell, navigation
│   │   ├── call/            # Video calling
│   │   ├── dice/            # Dice game
│   │   ├── game/            # Other games
│   │   ├── chat/            # Chat components
│   │   └── ui/              # Reusable UI primitives
│   ├── lib/                 # Utilities, types, WebRTC
│   ├── store/               # Zustand state management
│   ├── pages/               # Route pages
│   ├── hooks/               # Custom hooks
│   └── app.tsx             # Main app router
├── server/                  # Signaling server (Node.js)
│   ├── signaling-server.js
│   └── package.json
├── docs/                    # Documentation
├── CONTRIBUTING.md          # Coding standards
├── ARCHITECTURE.md         # Architecture decisions
├── ROADMAP.md              # Development roadmap
├── ISSUE_TRACKING.md       # Known issues
├── DEPLOYMENT.md           # Deployment guide
└── package.json
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Coding standards, guidelines for contributors |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture, design patterns, tech choices |
| [ROADMAP.md](ROADMAP.md) | Development phases, planned features |
| [ISSUE_TRACKING.md](ISSUE_TRACKING.md) | Known issues, bugs, conflicts |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guide for AlterVista + Oracle Cloud |

---

## Available Scripts

### Frontend

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Preview build
npm run preview
```

### Backend

```bash
cd server

# Start signaling server
npm start

# Development
npm run dev
```

---

## Development Workflow

### For Contributors

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for design patterns
3. Check [ROADMAP.md](ROADMAP.md) for current phase
4. Review [ISSUE_TRACKING.md](ISSUE_TRACKING.md) for known issues
5. Create feature branch
6. Implement changes
7. Run tests: `npm run typecheck` and `npm run lint`
8. Build: `npm run build`
9. Submit pull request

### Commit Message Format

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
- `style`: Code style
- `test`: Tests
- `chore`: Maintenance

**Example:**
```
feat(dice): synchronize dice rolls across users

- Add dice-roll event to WebRTCManager
- Broadcast roll results on rollDice() action
- Update store to handle incoming dice rolls

Closes #42
```

---

## Current Status

### Overall Progress: 65%

- ✅ Phase 1: Critical Fixes - Complete
  - Dependencies cleaned (28 packages removed)
  - Minification enabled (terser)
  - Theme updated (purple/pink/dark-gray)
  - Environment variables configured
- ✅ Phase 2: Dice Synchronization - Complete
  - Dice rolls synchronized across users
  - Dice configuration synchronized
  - WebRTC events implemented
- 🟡 Phase 3: Truth or Dare - In Progress (70%)
  - ✅ Game design document
  - ✅ Type definitions
  - ✅ Prompt database (120 prompts)
  - ⏳ UI components pending
  - ⏳ TypeScript errors pending (9 errors)
- ✅ Phase 4: Optimization - Complete
  - ✅ Code splitting (73% bundle reduction)
  - ✅ Tree shaking (minimal impact - code already optimized)
  - ✅ Image optimization (compression utilities added)
  - ⏳ Performance profiling (deferred to Phase 5)
  - ⏳ Component refactoring (deferred to Phase 5)
- ⏳ Phase 5: Polish & Testing - Pending
- ⏳ Phase 6: Future Enhancements - Pending

See [ROADMAP.md](ROADMAP.md) for details.

---

## Known Issues

### High Priority
- 🟠 Truth or Dare store TypeScript errors (9 errors in `useAppStore.ts`)
- 🟠 Phase 3 UI components not yet created

### Medium Priority
- 🟡 WebRTC connection timeout issues (15 seconds may be too short)
- 🟡 No error recovery for WebRTC failures
- 🟡 Media storage in memory only (no persistence)

### Low Priority
- 🔵 No persistent storage for content (Phase 6)
- 🔵 No unit tests (Phase 6)
- 🔵 Large component files (>300 lines) - to be addressed in Phase 4

See [ISSUE_TRACKING.md](ISSUE_TRACKING.md) for complete list.

---

## Deployment

### Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Infrastructure:**
- Frontend: AlterVista (Free)
- Backend: Oracle Cloud Free Tier

**Environment Variables (Production):**
```bash
VITE_SIGNALING_URL=https://your-signaling-server.oraclecloudapps.com
VITE_ROOM_ID=default-room
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards and guidelines.

### Areas for Contribution

1. **Dice Synchronization** - Implement real-time dice roll sync
2. **Truth or Dare Game** - Add new game with spicy twist
3. **Optimization** - Reduce bundle size, improve performance
4. **Testing** - Add unit and integration tests
5. **Documentation** - Improve docs and add examples

---

## License

MIT License - See LICENSE file for details

---

## Support

- 📖 [Documentation](#documentation)
- 🐛 [Issue Tracker](ISSUE_TRACKING.md)
- 🗺️ [Roadmap](ROADMAP.md)
- 💬 [Contributing Guide](CONTRIBUTING.md)

---

## Acknowledgments

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - Frontend framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Socket.IO](https://socket.io/) - Real-time communication
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

---

## Changelog

### v1.0.0 (In Development)
- Initial commit
- Dice game functionality
- WebRTC video calling
- Real-time chat
- Content boards
- Documentation setup

---

**Built with ❤️ for content creators**
