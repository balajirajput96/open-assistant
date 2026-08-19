export type VoiceTranscription = {
  runtimeAvailable: boolean;
  statusMessage: string;
  isReady: boolean;
  isLoading: boolean;
  isListening: boolean;
  downloadProgress: number;
  transcript: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => string;
};
