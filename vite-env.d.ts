/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNALING_URL?: string;
  readonly VITE_ROOM_ID?: string;
  readonly VITE_ENABLE_WEBCRTC?: string;
  readonly VITE_ENABLE_DICE?: string;
  readonly VITE_ENABLE_TRUTH_OR_DARE?: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
