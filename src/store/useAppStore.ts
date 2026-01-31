/// <reference types="vite/client" />

import { create } from "zustand";

import type {
  Announcement,
  CallState,
  ChatMessage,
  DiceConfig,
  IndividualDiceConfig,
  MediaItem,
  MenuItem,
  Participant,
  Role,
  SpiceLevel,
  TruthOrDarePrompt,
  TwistEvent,
  TwistType,
  User,
} from "@/lib/types";
import { WebRTCManager } from "@/lib/webrtc";
import { TRUTH_PROMPTS, DARE_PROMPTS } from "@/data/truth-or-dare-prompts";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const defaultDiceConfig: DiceConfig = {
  diceCount: 2,
  diceColor: "#111827",
  faceTextColor: "#ffffff",
  faceLabels: ["1", "2", "3", "4", "5", "6"],
};

// Default individual dice (start with 2 dice)
const createDefaultIndividualDice = (): IndividualDiceConfig[] => [
  {
    id: uid("die"),
    diceColor: "#111827",
    faceTextColor: "#ffffff",
    faceLabels: ["1", "2", "3", "4", "5", "6"],
  },
  {
    id: uid("die"),
    diceColor: "#111827",
    faceTextColor: "#ffffff",
    faceLabels: ["1", "2", "3", "4", "5", "6"],
  },
];

type AppState = {
  user: User | null;
  setUser: (user: User | null) => void;
  setRole: (role: Role) => void;

  menuItems: MenuItem[];
  mediaItems: MediaItem[];
  announcements: Announcement[];

  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, patch: Partial<Omit<MenuItem, "id">>) => void;
  removeMenuItem: (id: string) => void;

  addMediaItem: (item: Omit<MediaItem, "id">) => void;
  updateMediaItem: (id: string, patch: Partial<Omit<MediaItem, "id">>) => void;
  removeMediaItem: (id: string) => void;

  addAnnouncement: (a: Omit<Announcement, "id" | "createdAtIso">) => void;
  updateAnnouncement: (
    id: string,
    patch: Partial<Omit<Announcement, "id" | "createdAtIso">>
  ) => void;
  removeAnnouncement: (id: string) => void;

  diceConfig: DiceConfig;
  setDiceConfig: (patch: Partial<DiceConfig>) => void;
  setDiceFaceLabel: (index: 0 | 1 | 2 | 3 | 4 | 5, value: string) => void;

  // Individual dice system
  individualDice: IndividualDiceConfig[];
  addIndividualDie: () => void;
  removeIndividualDie: (id: string) => void;
  updateIndividualDie: (id: string, patch: Partial<Omit<IndividualDiceConfig, "id">>) => void;
  setIndividualDiceFaceLabel: (id: string, index: 0 | 1 | 2 | 3 | 4 | 5, value: string) => void;

  heldDice: boolean[];
  toggleHold: (index: number) => void;
  lastRoll: number[];
  rollDice: () => number[];
  
  // Individual dice
  individualDice: IndividualDiceConfig[];
  addIndividualDie: () => void;
  removeIndividualDie: (id: string) => void;
  updateIndividualDie: (id: string, patch: Partial<Omit<IndividualDiceConfig, "id">>) => void;
  setIndividualDiceFaceLabel: (id: string, index: 0 | 1 | 2 | 3 | 4 | 5, value: string) => void;
  
  call: CallState;
  setCall: (patch: Partial<CallState>) => void;
  addParticipant: (name: string, id?: string) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, patch: Partial<Omit<Participant, "id">>) => void;
  
  // Chat actions
  addChatMessage: (content: string, type?: "user" | "emoji", incomingMessage?: ChatMessage) => void;
  addSystemMessage: (content: string) => void;
  clearChat: () => void;
  
  selectedCameraId: string | null;
  setSelectedCameraId: (id: string | null) => void;
  
  // Truth or Dare game
  truthOrDare: {
    currentPrompt: TruthOrDarePrompt | null;
    usedPrompts: string[];
    playerTurn: string | null;
    spiceMode: SpiceLevel;
    skipsRemaining: number;
    twistActive: boolean;
    currentTwist: TwistEvent | null;
  };
  
  onTruthOrDareReveal: (prompt, playerId) => void,
  onTruthOrDareTwist: (twist) => void,
  selectTruthOrDare: (prompt: TruthOrDarePrompt) => void,
  
  onTruthOrDareTurnStart: (playerId: string) => void,
  onTruthOrDareTurnEnd: (playerId: string, completed: boolean) => void,
  
  setSpiceMode: (spice: SpiceLevel) => void,
  skipTurn: () => void,
  forfeitTurn: () => void,
  completeTurn: () => void,
  applyTwist: (twist: TwistEvent) => void,
  resetTruthOrDareGame: () => void;
  
  // Truth or Dare game
  truthOrDare: {
    currentPrompt: TruthOrDarePrompt | null;
    usedPrompts: string[];
  playerTurn: string | null;
  spiceMode: SpiceLevel;
  skipsRemaining: number;
  twistActive: boolean;
  currentTwist: TwistEvent | null;
};
  selectTruthOrDare: (prompt: TruthOrDarePrompt) => void;
  setSpiceMode: (spice: SpiceLevel) => void;
  skipTurn: () => void;
  forfeitTurn: () => void;
  completeTurn: () => void;
  applyTwist: (twist: TwistEvent) => void;
  resetTruthOrDareGame: () => void;
  onTruthOrDareTurnStart: (playerId: string) => void;
  onTruthOrDareTurnEnd: (playerId: string, completed: boolean) => void;
  onTruthOrDareReveal: (prompt: TruthOrDarePrompt, playerId: string) => void;
  onTruthOrDareTwist: (twist: TwistEvent) => void;
  
  // Dice synchronization
  onDiceRoll: (roll: number[], userId: string, timestamp: number) => void;
  onDiceConfig: (config: any[], userId: string, timestamp: number) => void;
  
  // WebRTC state
  webrtcManager: WebRTCManager | null;
  signalingServerUrl: string;
  roomId: string;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  webrtcConnected: boolean;
  screenSharing: boolean;
  setWebRTCManager: (manager: WebRTCManager | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (userId: string, stream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  setWebRTCConnected: (connected: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setRoomId: (roomId: string) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    id: uid("guest"),
    name: "Guest",
    role: "guest",
  },
  setUser: (user) => set({ user }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : state.user,
    })),

  menuItems: [
    {
      id: uid("menu"),
      title: "Creator schedule",
      description: "Tonight 8pm: live Q&A, then collab stream.",
    },
    {
      id: uid("menu"),
      title: "Requests",
      description: "Drop ideas for topics, guests, or challenges.",
    },
  ],
  mediaItems: [
    {
      id: uid("media"),
      title: "Latest highlight",
      notes: "Replace with your YouTube/TikTok link.",
      url: "",
      mediaType: "link",
    },
    {
      id: uid("media"),
      title: "Sponsor spotlight",
      notes: "Add a link and description.",
      url: "",
      mediaType: "link",
    },
  ],
  announcements: [
    {
      id: uid("ann"),
      title: "Welcome!",
      body: "Type your name to join, check the boards, and roll the custom dice.",
      createdAtIso: new Date().toISOString(),
    },
  ],

  addMenuItem: (item) =>
    set((state) => ({ menuItems: [{ id: uid("menu"), ...item }, ...state.menuItems] })),
  updateMenuItem: (id, patch) =>
    set((state) => ({
      menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMenuItem: (id) =>
    set((state) => ({ menuItems: state.menuItems.filter((m) => m.id !== id) })),

  addMediaItem: (item) =>
    set((state) => ({ mediaItems: [{ id: uid("media"), ...item }, ...state.mediaItems] })),
  updateMediaItem: (id, patch) =>
    set((state) => ({
      mediaItems: state.mediaItems.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMediaItem: (id) =>
    set((state) => ({ mediaItems: state.mediaItems.filter((m) => m.id !== id) })),

  addAnnouncement: (a) =>
    set((state) => ({
      announcements: [
        { id: uid("ann"), createdAtIso: new Date().toISOString(), ...a },
        ...state.announcements,
      ],
    })),
  updateAnnouncement: (id, patch) =>
    set((state) => ({
      announcements: state.announcements.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    })),
  removeAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),

  diceConfig: defaultDiceConfig,
  setDiceConfig: (patch) =>
    set((state) => {
      const newConfig = { ...state.diceConfig, ...patch };
      // Reset held dice if count changes
      if (patch.diceCount !== undefined && patch.diceCount !== state.diceConfig.diceCount) {
        return { diceConfig: newConfig, heldDice: [] };
      }
      return { diceConfig: newConfig };
    }),
  setDiceFaceLabel: (index, value) =>
    set((state) => {
      const next = [...state.diceConfig.faceLabels] as DiceConfig["faceLabels"];
      next[index] = value;
      return { diceConfig: { ...state.diceConfig, faceLabels: next } };
    }),

  heldDice: [],
  toggleHold: (index) =>
    set((state) => {
      const newHeld = [...(state.heldDice || [])];
      // Ensure array is long enough
      const count = state.individualDice.length;
      while (newHeld.length < count) newHeld.push(false);

      newHeld[index] = !newHeld[index];
      return { heldDice: newHeld };
    }),

  lastRoll: [1, 1],
  rollDice: () => {
    const state = get();
    const diceCount = state.individualDice.length;
    const currentHeld = state.heldDice || [];
    const currentRoll = state.lastRoll || [];
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(diceCount);
    crypto.getRandomValues(array);

    const newValues = Array.from({ length: diceCount }).map((_, i) => {
      // If held, keep existing value (default to 1 if missing)
      if (currentHeld[i] && currentRoll[i]) {
        return currentRoll[i];
      }
      // Map 32-bit int to 1-6
      return 1 + (array[i] % 6);
    });

    set({ lastRoll: newValues });
    
    // Broadcast to other users
    if (state.webrtcManager) {
      state.webrtcManager.sendDiceRoll(newValues);
    }
    
    return newValues;
  },

  // Individual dice
  individualDice: createDefaultIndividualDice(),
  addIndividualDie: () =>
    set((state) => {
      if (state.individualDice.length >= 6) return {};
      const newDice = [
        ...state.individualDice,
        {
          id: uid("die"),
          diceColor: "#111827",
          faceTextColor: "#ffffff",
          faceLabels: ["1", "2", "3", "4", "5", "6"] as ["1", "2", "3", "4", "5", "6"],
        },
      ];
      if (state.webrtcManager) {
        state.webrtcManager.sendDiceConfig(newDice);
      }
      return { individualDice: newDice };
    }),
  removeIndividualDie: (id) =>
    set((state) => {
      const newDice = state.individualDice.filter((d) => d.id !== id);
      if (state.webrtcManager) {
        state.webrtcManager.sendDiceConfig(newDice);
      }
      return { individualDice: newDice };
    }),
  updateIndividualDie: (id, patch) =>
    set((state) => {
      const newDice = state.individualDice.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      );
      if (state.webrtcManager) {
        state.webrtcManager.sendDiceConfig(newDice);
      }
      return { individualDice: newDice };
    }),
  setIndividualDiceFaceLabel: (id, index, value) =>
    set((state) => {
      const newDice = state.individualDice.map((d) => {
        if (d.id !== id) return d;
        const next = [...d.faceLabels] as IndividualDiceConfig["faceLabels"];
        next[index] = value;
        return { ...d, faceLabels: next };
      });
      if (state.webrtcManager) {
        state.webrtcManager.sendDiceConfig(newDice);
      }
      return { individualDice: newDice };
    }),

  call: {
    joined: false,
    showDiceOverlay: true,
    participants: [],
    chatMessages: [],
  },

  selectedCameraId: null,
  setSelectedCameraId: (id) => set({ selectedCameraId: id }),

  setCall: (patch) => set((state) => ({ call: { ...state.call, ...patch } })),

  addParticipant: (name, id) =>
    set((state) => {
      const newParticipant: Participant = {
        id: id || uid("p"),
        name,
        role: "guest", // Default role for new participants
        cameraEnabled: false, // Default to false - requires admin approval
        micEnabled: false, // Default to false - requires admin approval
        canSpeak: false, // Requires admin approval
        canShowCamera: false, // Requires admin approval
        position: {
          x: 20 + (state.call.participants.length * 30),
          y: 20 + (state.call.participants.length * 30),
        },
        size: { width: 240, height: 180 },
      };

      // Add system message
      const systemMessage: ChatMessage = {
        id: uid("msg"),
        senderId: "system",
        senderName: "System",
        content: `${name} joined the call`,
        timestamp: new Date().toISOString(),
        type: "system",
      };

      return {
        call: {
          ...state.call,
          participants: [...state.call.participants, newParticipant],
          chatMessages: [...state.call.chatMessages, systemMessage],
        },
      };
    }),

  removeParticipant: (id) =>
    set((state) => {
      const participant = state.call.participants.find((p) => p.id === id);
      const systemMessage: ChatMessage | null = participant
        ? {
          id: uid("msg"),
          senderId: "system",
          senderName: "System",
          content: `${participant.name} left the call`,
          timestamp: new Date().toISOString(),
          type: "system",
        }
        : null;

      return {
        call: {
          ...state.call,
          participants: state.call.participants.filter((p) => p.id !== id),
          chatMessages: systemMessage
            ? [...state.call.chatMessages, systemMessage]
            : state.call.chatMessages,
        },
      };
    }),

  updateParticipant: (id, patch) =>
    set((state) => ({
      call: {
        ...state.call,
        participants: state.call.participants.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      },
    })),

  // Chat actions
  addChatMessage: (content, type = "user", incomingMessage) => {
    const state = get();
    const user = state.user;
    if (!user && !incomingMessage) return;

    const message: ChatMessage = incomingMessage || {
      id: uid("msg"),
      senderId: user!.id,
      senderName: user!.name,
      content,
      timestamp: new Date().toISOString(),
      type,
    };

    // Broadcast if it's a local message
    if (!incomingMessage && state.webrtcManager) {
      state.webrtcManager.sendMessage(message);
    }

    set((state) => ({
      call: {
        ...state.call,
        chatMessages: [...state.call.chatMessages, message],
      },
    }));
  },

  addSystemMessage: (content) =>
    set((state) => {
      const message: ChatMessage = {
        id: uid("msg"),
        senderId: "system",
        senderName: "System",
        content,
        timestamp: new Date().toISOString(),
        type: "system",
      };

      return {
        call: {
          ...state.call,
          chatMessages: [...state.call.chatMessages, message],
        },
      };
    }),

  clearChat: () =>
    set((state) => ({
      call: {
        ...state.call,
        chatMessages: [],
      },
    })),

  // WebRTC state
  webrtcManager: null,
  signalingServerUrl: (() => {
    const envUrl = (import.meta.env as any).VITE_SIGNALING_URL;
    if (envUrl) return envUrl;
    
    const isHttps = window.location.protocol === 'https:';
    
    // For now, we'll need to handle the mixed content issue differently
    // The signaling server at 146.235.229.114:3001 only supports HTTP
    // We'll use HTTP and handle the mixed content warning
    return "http://146.235.229.114:3001";
  })(),
  roomId: ((import.meta.env as any).VITE_ROOM_ID as string) || "default-room",
  localStream: null,
  remoteStreams: new Map(),
  webrtcConnected: false,
  screenSharing: false,
  
  onDiceRoll: (roll, userId, timestamp) => {
    set({ lastRoll: roll });
  },
  
  onDiceConfig: (config, userId, timestamp) => {
    set({ individualDice: config });
  },
  
  // Truth or Dare game
  truthOrDare: {
    currentPrompt: null,
    usedPrompts: [],
    playerTurn: null,
    spiceMode: 'mild',
    skipsRemaining: 3,
    twistActive: false,
    currentTwist: null,
  },
  onTruthOrDareTurnStart: (playerId) => {
    const state = get();
    if (state.user?.id !== playerId) {
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, playerTurn: playerId },
      }));
    }
  },
  onTruthOrDareTurnEnd: (playerId, completed) => {
    const state = get();
    if (state.user?.id !== playerId) {
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, playerTurn: null },
      }));
    }
  },
  onTruthOrDareSelect: (selection) => {
    const state = get();
    if (state.user?.id !== selection.playerId) {
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, currentPrompt: selection.prompt },
      }));
    }
  },
  
  onTruthOrDareTurnStart: (playerId) => {
    const state = get();
    if (state.user?.id !== playerId) {
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, playerTurn: playerId },
      }));
    }
  },
  onTruthOrDareTurnEnd: (playerId, completed) => {
    const state = get();
    if (state.user?.id !== playerId) {
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, playerTurn: null },
      }));
    }
    },
  onTruthOrDareSelect: (selection) => {
      const state = get();
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, currentPrompt: selection.prompt },
      }));
      
      if (state.webrtcManager) {
        state.webrtcManager.sendMessage({
          id: uid('msg'),
          senderId: state.user?.id || '',
          senderName: state.user?.name || '',
          content: `selected ${selection.type} (${state.truthOrDare.spiceMode})`,
          timestamp: new Date().toISOString(),
          type: 'system',
        } as any);
      }
    },
    onTruthOrDareSelect: (selection) => {
      const state = get();
      set((storeState) => ({
        truthOrDare: { ...storeState.truthOrDare, currentPrompt: selection.prompt },
      }));
      
      if (state.webrtcManager) {
        state.webrtcManager.sendMessage({
          id: uid('msg'),
          senderId: state.user?.id || '',
          senderName: state.user?.name || '',
          content: `selected ${selection.type} (${state.truthOrDare.spiceMode})`,
          timestamp: new Date().toISOString(),
          type: 'system',
        } as any);
      }
    },
  onTruthOrDareTwist: (twist) => {
    const state = get();
    set((storeState) => ({
      truthOrDare: { ...storeState.truthOrDare, twistActive: true, currentTwist: twist },
    }));
  },
  selectTruthOrDare: (prompt) => {
    set((state) => ({
      truthOrDare: { ...state.truthOrDare, currentPrompt: prompt },
    }));
  },
  setSpiceMode: (spice) => set((state) => ({ truthOrDare: { ...state.truthOrDare, spiceMode: spice } })),
  skipTurn: () => set((state) => {
    const newSkips = Math.max(0, state.truthOrDare.skipsRemaining - 1);
    set({ truthOrDare: { ...state.truthOrDare, skipsRemaining: newSkips, playerTurn: null } });
  }),
  forfeitTurn: () => set((state) => ({
    truthOrDare: { ...state.truthOrDare, playerTurn: null },
  })),
  completeTurn: () => set((state) => {
    const newUsed = [...state.truthOrDare.usedPrompts];
    if (state.truthOrDare.currentPrompt) {
      newUsed.push(state.truthOrDare.currentPrompt.id);
    }
    set({ truthOrDare: { ...state.truthOrDare, usedPrompts: newUsed, playerTurn: null } });
  }),
  applyTwist: (twist) => set((state) => ({
    truthOrDare: { ...state.truthOrDare, twistActive: true, currentTwist: twist },
  })),
  resetTruthOrDareGame: () => set((state) => ({
    truthOrDare: {
      currentPrompt: null,
      usedPrompts: [],
      playerTurn: null,
      spiceMode: 'mild',
      skipsRemaining: 3,
      twistActive: false,
      currentTwist: null,
    },
  })),
  
  onDiceRoll: (roll, userId, timestamp) => {
    set({ lastRoll: roll });
  },
  
  onDiceConfig: (config, userId, timestamp) => {
    set({ individualDice: config });
  },
  
  setWebRTCManager: (manager) => {
    if (manager) {
      manager.onMessageReceived((msg) => {
        get().addChatMessage(msg.content, msg.type as "user" | "emoji", msg);
      });
      
      manager.onDiceRollReceived((event) => {
        const state = get();
        if (event.userId !== state.user?.id) {
          get().onDiceRoll(event.roll, event.userId, event.timestamp);
        }
      });
      
      manager.onDiceConfigReceived((event) => {
        const state = get();
        if (event.userId !== state.user?.id) {
          get().onDiceConfig(event.config, event.userId, event.timestamp);
        }
      });
    }
    set({ webrtcManager: manager });
  },
  setLocalStream: (stream) => set({ localStream: stream }),
  addRemoteStream: (userId, stream) =>
    set((state) => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.set(userId, stream);
      return { remoteStreams: newStreams };
    }),
  removeRemoteStream: (userId) =>
    set((state) => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.delete(userId);
      return { remoteStreams: newStreams };
    }),
  setWebRTCConnected: (connected) => set({ webrtcConnected: connected }),
  setScreenSharing: (sharing) => set({ screenSharing: sharing }),
  setRoomId: (roomId) => set({ roomId }),
}));
