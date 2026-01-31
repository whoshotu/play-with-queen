import { create } from "zustand";
import { TruthOrDarePrompt, SpiceLevel, TwistEvent } from "@/lib/types";
import { TRUTH_PROMPTS, DARE_PROMPTS } from "@/data/truth-or-dare-prompts";

export type TruthOrDareState = {
  currentPrompt: TruthOrDarePrompt | null;
  usedPrompts: string[];
  playerTurn: string | null;
  spiceMode: SpiceLevel;
  skipsRemaining: number;
  twistActive: boolean;
  currentTwist: TwistEvent | null;
  
  // Actions
  setSpiceMode: (spice: SpiceLevel) => void;
  skipTurn: () => void;
  forfeitTurn: () => void;
  completeTurn: () => void;
  applyTwist: (twist: TwistEvent) => void;
  resetGame: () => void;
  onTurnStart: (playerId: string) => void;
  onTurnEnd: () => void;
  selectPrompt: (prompt: TruthOrDarePrompt) => void;
};

export const useTruthOrDareStore = create<TruthOrDareState>((set) => ({
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
    return { skipsRemaining: newSkips, playerTurn: null };
  }),
  
  forfeitTurn: () => set({ playerTurn: null }),
  
  completeTurn: () => set((state) => {
    const newUsed = [...state.usedPrompts];
    if (state.currentPrompt) {
      newUsed.push(state.currentPrompt.id);
    }
    return { usedPrompts: newUsed, playerTurn: null };
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
