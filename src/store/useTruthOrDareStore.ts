import { create } from "zustand";
import { TruthOrDarePrompt, SpiceLevel, TwistType, TwistEvent } from "@/lib/types";
import { TRUTH_PROMPTS, DARE_PROMPTS } from "@/data/truth-or-dare-prompts";
import { uid } from "@/lib/webrtc";

export type TruthOrDareState = {
  currentPrompt: TruthOrDarePrompt | null;
  usedPrompts: string[];
  playerTurn: string | null;
  spiceMode: SpiceLevel;
  skipsRemaining: number;
  twistActive: boolean;
  currentTwist: TwistEvent | null;
};

function getRandomPrompt(type: 'truth' | 'dare', spice: SpiceLevel, excludeIds: string[]): TruthOrDarePrompt | null {
  const prompts = type === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
  const availablePrompts = prompts.filter(p => 
    p.spice === spice && !excludeIds.includes(p.id)
  );
  
  if (availablePrompts.length === 0) {
    return null;
  }
  
  return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
}

export const useTruthOrDareStore = create<TruthOrDareState>((set, get) => ({
  currentPrompt: null,
  usedPrompts: [],
  playerTurn: null,
  spiceMode: 'mild',
  skipsRemaining: 3,
  twistActive: false,
  currentTwist: null,
  
  setSpiceMode: (spice: SpiceLevel) => set({ spiceMode: spice }),
  
  skipTurn: () => set((state) => {
    const newSkips = Math.max(0, state.skipsRemaining - 1);
    set({ skipsRemaining: newSkips, playerTurn: null });
  }),
  
  forfeitTurn: () => set({ playerTurn: null }),
  
  completeTurn: () => set((state) => {
    const newUsed = [...state.usedPrompts];
    if (state.currentPrompt) {
      newUsed.push(state.currentPrompt.id);
    }
    set({ usedPrompts: newUsed, playerTurn: null });
  }),
  
  applyTwist: (twist: TwistEvent) => set({ twistActive: true, currentTwist: twist }),
  
  resetGame: () => set({
    currentPrompt: null,
    usedPrompts: [],
    playerTurn: null,
    spiceMode: 'mild',
    skipsRemaining: 3,
    twistActive: false,
    currentTwist: null,
  }),
  
  onTurnStart: (playerId: string) => set({ playerTurn: playerId }),
  
  onTurnEnd: () => set({ playerTurn: null }),
  
  selectPrompt: (prompt: TruthOrDarePrompt) => set({ currentPrompt: prompt }),
}));
