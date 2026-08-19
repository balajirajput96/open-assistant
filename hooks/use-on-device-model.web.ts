import { LocalInference, LocalInferenceMessage } from "./use-on-device-model.types";

export function useOnDeviceModel(): LocalInference {
  return {
    runtimeAvailable: false,
    platformMessage: "Local inference is available in the Android build, not in the web preview.",
    isReady: false,
    isLoading: false,
    isGenerating: false,
    downloadProgress: 0,
    response: "",
    error: null,
    generate: async (_messages: LocalInferenceMessage[]) => {
      throw new Error("Local inference requires an Android development or production build.");
    },
    interrupt: () => undefined,
  };
}
