export type LocalInferenceMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LocalInference = {
  runtimeAvailable: boolean;
  platformMessage: string;
  isReady: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  downloadProgress: number;
  response: string;
  error: string | null;
  generate: (messages: LocalInferenceMessage[]) => Promise<string>;
  interrupt: () => void;
};
