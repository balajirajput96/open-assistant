import { initExecutorch, isAvailable, Message, models, useLLM } from "react-native-executorch";
import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";

import { useAssistantStore } from "@/lib/assistant-store";
import { LocalInference, LocalInferenceMessage } from "./use-on-device-model.types";

initExecutorch({ resourceFetcher: ExpoResourceFetcher });

const localModel = models.llm.qwen3_0_6b({ quant: true });

export function useOnDeviceModel(): LocalInference {
  const { preferences } = useAssistantStore();
  const llm = useLLM({ model: localModel, preventLoad: !preferences.modelDownloadApproved });

  return {
    runtimeAvailable: isAvailable,
    platformMessage: isAvailable
      ? "Qwen3-0.6B runs entirely on this device after the model download."
      : "This device or build does not include the local AI runtime. Use an Android 13+ development or Play Store build.",
    isReady: llm.isReady,
    isLoading: preferences.modelDownloadApproved && !llm.isReady && !llm.error,
    isGenerating: llm.isGenerating,
    downloadProgress: llm.downloadProgress,
    response: llm.response,
    error: llm.error?.message ?? null,
    generate: (messages: LocalInferenceMessage[]) => llm.generate(messages as Message[]),
    interrupt: llm.interrupt,
  };
}
