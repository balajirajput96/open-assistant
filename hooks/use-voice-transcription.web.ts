import { VoiceTranscription } from "./use-voice-transcription.types";

export function useVoiceTranscription(): VoiceTranscription {
  return {
    runtimeAvailable: false,
    statusMessage: "Private voice transcription is available in the Android build, not in the web preview.",
    isReady: false,
    isLoading: false,
    isListening: false,
    downloadProgress: 0,
    transcript: "",
    error: null,
    start: async () => undefined,
    stop: () => "",
  };
}
