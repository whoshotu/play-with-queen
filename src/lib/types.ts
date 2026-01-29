export type Role = "guest" | "visitor" | "mod" | "creator" | "admin";

export type User = {
  id: string;
  name: string;
  role: Role;
};

export type MenuItem = {
  id: string;
  title: string;
  description?: string;
};

export type MediaItem = {
  id: string;
  title: string;
  url?: string;
  mediaType?: "link" | "image" | "video";
  fileName?: string;
  notes?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAtIso: string;
};

export type DiceConfig = {
  diceCount: number;
  diceColor: string;
  faceTextColor: string;
  faceLabels: [string, string, string, string, string, string];
};

// Individual dice configuration for per-die customization
export type IndividualDiceConfig = {
  id: string;
  diceColor: string;
  faceTextColor: string;
  faceLabels: [string, string, string, string, string, string];
};

// Chat message type
export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string; // ISO string
  type: "user" | "system" | "emoji";
};

// Enhanced participant with video stream and position
export type Participant = {
  id: string;
  name: string;
  role: Role;
  streamId?: string; // Reference to media stream
  cameraEnabled: boolean;
  micEnabled: boolean;
  canSpeak: boolean; // Permission from admin
  canShowCamera: boolean; // Permission from admin
  position: { x: number; y: number };
  size: { width: number; height: number };
};

export type CallState = {
  joined: boolean;
  showDiceOverlay: boolean;
  participants: Participant[];
  chatMessages: ChatMessage[];
};
