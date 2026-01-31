# Truth or Dare Game Design

## Game Overview
A multiplayer "Truth or Dare" game with a "spicy twist" mechanic that randomly intensifies prompts.

## Core Mechanics

### 1. Turn-Based System
- One player's turn at a time
- Player chooses Truth or Dare
- Prompt is displayed to all users
- Player completes prompt
- Turn passes to next player

### 2. Spice Levels

| Level | Description | Example |
|--------|-------------|----------|
| **Mild** | Safe, fun, appropriate for all audiences | "What's your favorite food?" |
| **Medium** | Slightly embarrassing, requires some thought | "What's your most embarrassing memory?" |
| **Spicy** | Personal, potentially embarrassing | "What's your biggest secret?" |
| **Extreme** | Very personal, boundary-pushing | "Text your ex 'I still love you'" |

### 3. Spicy Twist Mechanic

#### Twist Logic
When a player selects a prompt, there's a 25% chance the game applies a "spicy twist" that intensifies the prompt.

#### Twist Types

1. **Double or Nothing** (40% chance)
   - Player must do 2 prompts or skip
   - "Complete dare OR do two extra dares of the spiciest level"

2. **Public Vote** (30% chance)
   - Other players vote to increase spice level
   - "Others voted to upgrade this to SPICY"

3. **Random Upgrade** (20% chance)
   - Spice level increased by 1-2 levels
   - "UPGRADE: This is now SPICY instead of MILD"

4. **Mystery Challenge** (10% chance)
   - Random additional constraint added
   - "Do this while singing 'Happy Birthday'"

### 4. Turn Management

#### Turn Order
1. Random starting player
2. Sequential rotation through participants
3. Skip players who left or declined
4. Continue until manual stop

#### Turn Flow
```
1. Game starts
   ↓
2. Current player selected
   ↓
3. Player chooses "Truth" or "Dare"
   ↓
4. Prompt selected based on current spice level
   ↓
5. 25% chance: Spicy twist applied
   ↓
6. Prompt revealed to all users
   ↓
7. Player completes or skips
   ↓
8. Other players can react/encourage
   ↓
9. Turn advances to next player
```

### 5. Skip & Forfeit Rules

#### Skip Rules
- Each player gets 3 skips per session
- Skipping ends turn (no penalty)
- Skips are visible to all players

#### Forfeit Rules
- Player can forfeit their turn
- Forfeit = automatic truth question about themselves
- "Since you forfeited: What's your most embarrassing moment?"

### 6. Chat Integration

#### Reactions During Turns
- Emoji reactions allowed
- "Encourage" reactions for support
- "Roast" reactions for banter (can be toggled)
- System messages for turn changes

### 7. UI Requirements

#### Main Components

1. **TruthOrDarePanel** - Main game container
   - Current turn indicator
   - Spice level selector
   - Truth/Dare buttons
   - Prompt display card
   - Skip/Forfeit buttons

2. **PromptCard** - Displays current prompt
   - Animation for reveal
   - Spice level badge
   - Twist indicator
   - Timer (optional)

3. **SpiceSelector** - Choose difficulty
   - Visual selector with 4 levels
   - Group voting on spice (optional)

4. **PlayerTurnIndicator** - Shows whose turn
   - Player name and avatar
   - Countdown timer
   - "It's your turn!" notification

5. **TwistAnimation** - Visual effect when twist applied
   - Confetti or particle effect
   - Color change
   - Sound effect (optional)

#### Dice Page Integration

- Add Truth or Dare tab to dice page
- Can play both games simultaneously
- Shared chat and video calling
- Separate state management

## Database Structure

### Prompts Format
```typescript
export type TruthOrDarePrompt = {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  spice: 'mild' | 'medium' | 'spicy' | 'extreme';
  category?: string;
  isTwistable?: boolean; // Can this be twisted?
};
```

### Categories
- Childhood Memories
- Relationships
- Embarrassing Moments
- Personal Secrets
- Fun Challenges
- Physical Dares
- Social Media Related
- Work/School Related

## Content Requirements

### Minimum Prompts
- **50+ Truth prompts** across all spice levels
- **50+ Dare prompts** across all spice levels
- **Twist variations** for 50% of prompts

### Example Prompts

#### Truth - Mild
- "What's your favorite childhood memory?"
- "What's your favorite food?"
- "What's your dream job?"
- "What's the last movie you watched?"

#### Truth - Spicy
- "What's your biggest regret?"
- "What's a secret you've never told anyone?"
- "What's your most embarrassing dating story?"
- "What's the worst thing you've done for money?"

#### Dare - Mild
- "Do 10 jumping jacks"
- "Sing the chorus of your favorite song"
- "Do your best dance move"
- "Tell a joke"

#### Dare - Spicy
- "Call a random contact and sing 'Happy Birthday'"
- "Post a childhood photo on social media"
- "Do an impression of someone in the room"
- "Let the group send a text from your phone"

#### Extreme Examples
- Truth: "What's the worst thing you've ever said about someone behind their back?"
- Dare: "Text your ex 'I was wrong, you were right about everything'"

## Synchronization Requirements

### Events to Broadcast
```typescript
// Turn management
'truth-or-dare-turn-start'  // { playerTurn: string }
'truth-or-dare-turn-end'    // { playerId: string, completed: boolean }
'truth-or-dare-skip'        // { playerId: string }
'truth-or-dare-forfeit'     // { playerId: string }

// Prompt selection
'truth-or-dare-select'     // { type: 'truth'|'dare', spice: SpiceLevel }
'truth-or-dare-reveal'      // { prompt: TruthOrDarePrompt }

// Twist mechanics
'truth-or-dare-twist'       // { twistType: TwistType, newPrompt?: TruthOrDarePrompt }

// Spice voting (optional)
'truth-or-dare-vote-spice' // { vote: SpiceLevel, voterId: string }
```

## Edge Cases

### Player Leaves During Turn
- Turn passes to next player
- Current prompt discarded
- Notification: "Player X left, turn passed to Player Y"

### All Players Skip
- Game can continue with reduced spice
- Or end game
- System message: "Everyone has skipped! Game over or lower difficulty?"

### New Player Joins
- Joins in "spectator" mode
- Can watch but not participate in current round
- Joins next round
- Notification: "Player Z joined! They'll join the next round."

### Network Issues
- Turn timer (60 seconds max per turn)
- Auto-skip if no response
- Reconnect resumes game state

## Future Enhancements

### Phase 6 Ideas
- **Custom Prompts** - Users can add their own prompts
- **Prompt Ratings** - Community votes on best prompts
- **Game Modes**
  - "Spicy Mode" - All prompts spicy+
  - "Chaos Mode" - Random twists on every turn
  - "Vote Mode" - Group votes on truth vs dare
- **Achievements** - Track "completed 10 dares", "never skipped", etc.
- **Leaderboard** - Most prompts completed, least skips

---

*Design finalized: 2026-01-30*
