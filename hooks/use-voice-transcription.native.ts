import { useEffect, useRef, useState } from "react";
import { AudioManager, AudioRecorder } from "react-native-audio-api";
import { isAvailable, useSpeechToText, WHISPER_TINY } from "react-native-executorch";

import { useAssistantStore } from "@/lib/assistant-store";
import { VoiceTranscription } from "./use-voice-transcription.types";

export function useVoiceTranscription(): VoiceTranscription {
  const { preferences } = useAssistantStore();
  const speechToText = useSpeechToText({ model: WHISPER_TINY, preventLoad: !preferences.voiceModelDownloadApproved });
  const recorderRef = useRef(new AudioRecorder({ sampleRate: 16000, bufferLengthInSamples: 1600 }));
  const listeningRef = useRef(false);
  const transcriptRef = useRef("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    AudioManager.setAudioSessionOptions({
      iosCategory: "playAndRecord",
      iosMode: "spokenAudio",
      iosOptions: ["allowBluetooth", "defaultToSpeaker"],
    });
  }, []);

  const start = async () => {
    if (!isAvailable || isListening || speechToText.isGenerating) return;
    if (!preferences.voiceModelDownloadApproved || !speechToText.isReady) return;
    const permission = await AudioManager.requestRecordingPermissions();
    if (permission !== "Granted") {
      setRuntimeError("Microphone permission was denied. Enable it in system settings to transcribe speech locally.");
      return;
    }

    setRuntimeError(null);
    transcriptRef.current = "";
    setTranscript("");
    listeningRef.current = true;
    setIsListening(true);

    recorderRef.current.onAudioReady(({ buffer }) => {
      if (listeningRef.current) speechToText.streamInsert(buffer.getChannelData(0));
    });

    try {
      const active = await AudioManager.setAudioSessionActivity(true);
      if (!active) throw new Error("The microphone audio session could not be started.");
      recorderRef.current.start();

      let committedText = "";
      for await (const { committed, nonCommitted } of speechToText.stream({
        language: preferences.preferredLanguage,
        timeout: 200,
      })) {
        if (!listeningRef.current) break;
        if (committed.text) committedText += committed.text;
        const nextTranscript = `${committedText}${nonCommitted.text}`.trim();
        transcriptRef.current = nextTranscript;
        setTranscript(nextTranscript);
      }
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : "Local speech transcription failed.");
    } finally {
      listeningRef.current = false;
      setIsListening(false);
      void AudioManager.setAudioSessionActivity(false);
    }
  };

  const stop = () => {
    listeningRef.current = false;
    recorderRef.current.stop();
    speechToText.streamStop();
    return transcriptRef.current;
  };

  return {
    runtimeAvailable: isAvailable,
    statusMessage: isAvailable
      ? "Whisper Tiny transcribes microphone audio locally after its download."
      : "This device or build does not include the local voice runtime.",
    isReady: speechToText.isReady,
    isLoading: preferences.voiceModelDownloadApproved && !speechToText.isReady && !speechToText.error,
    isListening,
    downloadProgress: speechToText.downloadProgress,
    transcript,
    error: runtimeError ?? speechToText.error?.message ?? null,
    start,
    stop,
  };
}
