# Phase 3: Truth or Dare - Partial Implementation

**Status:** ⚠️ In Progress
**Date:** 2026-01-30

## Completed Work

### 1. Game Design ✅
- ✅ Created comprehensive game design document: `docs/TRUTH_OR_DARE_DESIGN.md`
- ✅ Defined turn-based system
- ✅ Designed 4 spice levels (mild, medium, spicy, extreme)
- ✅ Created spicy twist mechanic (25% chance, 4 twist types)
- ✅ Defined skip/forfeit rules
- ✅ Outlined UI requirements
- ✅ Specified edge cases

### 2. Types ✅
- ✅ Added `SpiceLevel` type to `src/lib/types.ts`
- ✅ Added `TruthOrDarePrompt` type to `src/lib/types.ts`
- ✅ Added `TwistType` type to `src/lib/types.ts`
- ✅ Added `TwistEvent` type to `src/lib/types.ts`
- ✅ Added `TruthOrDareState` type to `src/lib/types.ts`

### 3. Prompt Database ✅
- ✅ Created `src/data/truth-or-dare-prompts.ts` with 120 prompts
  - 60 Truth prompts (15 mild, 15 medium, 15 spicy, 15 extreme)
  - 60 Dare prompts (15 mild, 15 medium, 15 spicy, 15 extreme)
- ✅ All prompts categorized
- ✅ All prompts have `isTwistable` flags
- ✅ Content balanced across spice levels

### 4. Partial Store Integration ⚠️
- ✅ Added prompt database imports to `src/store/useAppStore.ts`
- ✅ Added Truth or Dare state to `AppState` type
- ✅ Added action type definitions (11 new actions)
- ⚠️ Implementation incomplete - TypeScript errors need fixing

## Remaining Work

### Store Implementation (Priority: High)
The following TypeScript errors need to be resolved:

1. **Selection object structure** - Currently using `.prompt` property which doesn't exist
   - Fix: Match selection object to type definition

2. **Duplicate property errors** - Multiple object literals with same property names
   - Fix: Ensure unique property names in all objects

3. **Function return types** - Functions not matching expected void return types
   - Fix: Ensure all action functions return `void`

**Functions needing fixes:**
- `onTruthOrDareSelect` (line ~539)
- `onTruthOrDareReveal` (line ~547)
- `onTruthOrDareTwist` (line ~554)
- `skipTurn` (line ~590)
- `forfeitTurn` (line ~609)
- `completeTurn` (line ~626)

### UI Components (Priority: Medium)
Create the following components in `src/components/game/`:

1. **TruthOrDarePanel.tsx** - Main game container
   - Spice level selector
   - Truth/Dare buttons
   - Current prompt display
   - Skip/Forfeit buttons
   - Player turn indicator

2. **PromptCard.tsx** - Display selected prompt
   - Animation for reveal
   - Spice level badge
   - Twist indicator

3. **SpiceSelector.tsx** - Choose difficulty
   - Visual 4-level selector
   - Group voting (optional)

4. **PlayerTurnIndicator.tsx** - Show whose turn
   - Player name and avatar
   - Countdown timer

### WebRTC Synchronization (Priority: High)

Add to `server/signaling-server.js`:
```javascript
// Truth or Dare events
socket.on('truth-or-dare-turn-start', ({ roomId, playerTurn }) => {
  socket.to(roomId).emit('truth-or-dare-turn-start', { playerTurn });
});

socket.on('truth-or-dare-turn-end', ({ roomId, playerId, completed }) => {
  socket.to(roomId).emit('truth-or-dare-turn-end', { playerId, completed });
});

socket.on('truth-or-dare-select', ({ roomId, selection }) => {
  socket.to(roomId).emit('truth-or-dare-select', selection);
});

socket.on('truth-or-dare-reveal', ({ roomId, prompt, playerId }) => {
  socket.to(roomId).emit('truth-or-dare-reveal', { prompt, playerId });
});

socket.on('truth-or-dare-twist', ({ roomId, twist }) => {
  socket.to(roomId).emit('truth-or-dare-twist', twist);
});
```

Add to `src/lib/webrtc.ts`:
- `sendTruthOrDareTurnStart(playerId: string)`
- `sendTruthOrDareTurnEnd(playerId: string, completed: boolean)`
- `sendTruthOrDareSelect(selection: object)`
- `sendTruthOrDareReveal(prompt: TruthOrDarePrompt, playerId: string)`
- `sendTruthOrDareTwist(twist: TwistEvent)`

Add event listeners in `src/lib/webrtc.ts`:
- `onTruthOrDareTurnStart(callback)`
- `onTruthOrDareTurnEnd(callback)`
- `onTruthOrDareSelect(callback)`
- `onTruthOrDareReveal(callback)`
- `onTruthOrDareTwist(callback)`

### Route Integration (Priority: Low)

Add to `src/app.tsx`:
```typescript
import TruthOrDarePage from '@/pages/truth-or-dare-page';

// Add route
<Route path="/truth-or-dare" element={<TruthOrDarePage />} />
```

## Summary

### Progress
- **Game Design:** 100% ✅
- **Types:** 100% ✅
- **Prompt Database:** 100% ✅
- **Store Integration:** 30% ⚠️ (TypeScript errors need fixing)
- **UI Components:** 0% ❌
- **WebRTC Sync:** 0% ❌
- **Route Integration:** 0% ❌

**Overall Phase 3 Progress:** 45%

### Next Steps

1. Fix TypeScript errors in store (9 errors)
2. Create UI components (4 components)
3. Add WebRTC synchronization (server + client)
4. Add route integration
5. Testing with multiple users

### Technical Debt

1. Need to properly type the selection object for `onTruthOrDareSelect`
2. Need to fix duplicate property name issues
3. Need to ensure all action functions return `void`
4. Need to add proper event handling in WebRTCManager

---

*Last updated: 2026-01-30*
