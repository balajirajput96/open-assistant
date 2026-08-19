import * as Speech from "expo-speech";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useOnDeviceModel } from "@/hooks/use-on-device-model";
import { LocalInferenceMessage } from "@/hooks/use-on-device-model.types";
import { useVoiceTranscription } from "@/hooks/use-voice-transcription";
import { AssistantMessage, useAssistantStore } from "@/lib/assistant-store";
import { trimConversation } from "@/lib/assistant-utils";

const quickPrompts = ["Plan my day", "Explain a topic", "Draft a message"];

export default function AssistantScreen() {
  const { messages, preferences, appendMessage, addActivity, proposeActionForPrompt, updatePreferences } = useAssistantStore();
  const model = useOnDeviceModel();
  const voice = useVoiceTranscription();
  const [draft, setDraft] = useState("");
  const [voiceNoteStatus, setVoiceNoteStatus] = useState<string | null>(null);
  const listRef = useRef<FlatList<AssistantMessage>>(null);

  const generationMessages = useMemo(
    () =>
      trimConversation(messages, 12)
        .filter((message) => message.role !== "system")
        .map<LocalInferenceMessage>((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content })),
    [messages],
  );

  const scrollToEnd = () => requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

  const sendPrompt = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? draft).trim();
    if (!prompt || model.isGenerating) return;
    setDraft("");
    appendMessage("user", prompt);
    addActivity("Local request added", "Your prompt remains on this device while local inference is used.");
    proposeActionForPrompt(prompt);
    scrollToEnd();

    if (!model.runtimeAvailable) {
      appendMessage("system", model.platformMessage);
      return;
    }

    if (!preferences.modelDownloadApproved) {
      appendMessage("system", "Choose Download local model to prepare private, on-device replies. The model is not downloaded until you approve it.");
      return;
    }

    if (!model.isReady) {
      appendMessage("system", "The local model is preparing. Keep this screen open until its download and setup finish.");
      return;
    }

    try {
      const response = await model.generate([
        {
          role: "system",
          content:
            "You are Open Assistant. Be concise, useful, and privacy-conscious. Never claim to send, post, buy, or modify an external account. Propose an action for user review instead.",
        },
        ...generationMessages,
        { role: "user", content: prompt },
      ]);
      appendMessage("assistant", response.trim() || "I could not generate a response. Please try a shorter request.");
      addActivity("Local response generated", "The response was produced by the on-device model.", "success");
      if (preferences.autoSpeak && response.trim()) {
        await Speech.stop();
        Speech.speak(response.trim(), { language: preferences.preferredLanguage === "hi" ? "hi-IN" : "en-US", rate: 0.95 });
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown local inference error";
      appendMessage("system", `Local model error: ${detail}`);
      addActivity("Local model needs attention", detail, "warning");
    } finally {
      scrollToEnd();
    }
  };

  const toggleVoiceCapture = async () => {
    if (voice.isListening) {
      const text = voice.stop();
      if (text) {
        setDraft(text);
        setVoiceNoteStatus("Transcript placed in the message box. Review it, then tap Send.");
        addActivity("Voice transcribed locally", "The transcript was produced on-device.", "success");
      } else {
        setVoiceNoteStatus("No speech was detected. Try again in a quieter environment.");
      }
      return;
    }
    if (!voice.runtimeAvailable) {
      setVoiceNoteStatus(voice.statusMessage);
      return;
    }
    if (!preferences.voiceModelDownloadApproved) {
      updatePreferences({ voiceModelDownloadApproved: true });
      setVoiceNoteStatus("Preparing the private voice model. Tap Mic again when the download is complete.");
      return;
    }
    if (!voice.isReady) {
      setVoiceNoteStatus(voice.error ?? `Preparing voice model ${Math.round(voice.downloadProgress * 100)}%. Keep this screen open.`);
      return;
    }
    await voice.start();
    setVoiceNoteStatus("Listening locally. Tap the microphone again to stop.");
  };

  const renderMessage = ({ item }: { item: AssistantMessage }) => {
    const isUser = item.role === "user";
    const isSystem = item.role === "system";
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="px-4" containerClassName="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.select({ ios: "padding", default: undefined })}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PRIVATE BY DEFAULT</Text>
            <Text style={styles.title}>Open Assistant</Text>
          </View>
          <View style={[styles.statusPill, model.isReady ? styles.readyPill : styles.idlePill]}>
            <View style={[styles.statusDot, model.isReady ? styles.readyDot : styles.idleDot]} />
            <Text style={styles.statusText}>{model.isReady ? "Local model ready" : "Local mode"}</Text>
          </View>
        </View>

        <View style={styles.modelCard}>
          <Text style={styles.modelTitle}>On-device AI</Text>
          <Text style={styles.modelCopy}>{model.error ?? model.platformMessage}</Text>
          {model.isLoading ? (
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.progressText}>Preparing model {Math.round(model.downloadProgress * 100)}%</Text>
            </View>
          ) : !model.isReady && model.runtimeAvailable ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={preferences.modelDownloadApproved ? "Resume local model setup" : "Download local model"}
              onPress={() => updatePreferences({ modelDownloadApproved: true })}
              style={({ pressed }) => [styles.modelButton, pressed && styles.pressed]}
            >
              <Text style={styles.modelButtonText}>{preferences.modelDownloadApproved ? "Resume model setup" : "Download local model"}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.voiceCard}>
          <Text style={styles.modelTitle}>Private voice input</Text>
          <Text style={styles.modelCopy}>{voice.error ?? voice.statusMessage}</Text>
          {voice.isLoading ? <Text style={styles.progressText}>Preparing voice model {Math.round(voice.downloadProgress * 100)}%</Text> : null}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.promptRow}>
              {quickPrompts.map((prompt) => (
                <Pressable key={prompt} accessibilityRole="button" accessibilityLabel={`Use starter prompt: ${prompt}`} onPress={() => setDraft(prompt)} style={({ pressed }) => [styles.promptChip, pressed && styles.pressed]}>
                  <Text style={styles.promptText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          }
        />

        {voiceNoteStatus ? <Text style={styles.voiceStatus}>{voiceNoteStatus}</Text> : null}

        <View style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel={voice.isListening ? "Stop private voice transcription" : "Start private voice transcription"} onPress={() => void toggleVoiceCapture()} style={({ pressed }) => [styles.micButton, voice.isListening && styles.recordingButton, pressed && styles.pressed]}>
            <Text style={styles.micText}>{voice.isListening ? "Stop" : "Mic"}</Text>
          </Pressable>
          <TextInput
            accessibilityLabel="Message Open Assistant"
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask privately on this device"
            placeholderTextColor="#64748B"
            multiline
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={() => void sendPrompt()}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={model.isGenerating ? "Stop generating" : "Send message"}
            onPress={() => (model.isGenerating ? model.interrupt() : void sendPrompt())}
            style={({ pressed }) => [styles.sendButton, (!draft.trim() && !model.isGenerating) && styles.disabledButton, pressed && styles.pressed]}
            disabled={!draft.trim() && !model.isGenerating}
          >
            <Text style={styles.sendText}>{model.isGenerating ? "Stop" : "Send"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 10, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#2563EB", fontSize: 11, letterSpacing: 1.15, fontWeight: "800" },
  title: { color: "#0B1220", fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.6 },
  statusPill: { minHeight: 34, paddingHorizontal: 10, borderRadius: 17, flexDirection: "row", alignItems: "center", gap: 7 },
  idlePill: { backgroundColor: "#E0EAFF" },
  readyPill: { backgroundColor: "#D7FAF4" },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  idleDot: { backgroundColor: "#2563EB" },
  readyDot: { backgroundColor: "#0F9F8F" },
  statusText: { color: "#0B1220", fontSize: 11, fontWeight: "700" },
  modelCard: { backgroundColor: "#F0F5FF", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#CFE0FF", marginBottom: 8 },
  voiceCard: { backgroundColor: "#F0FDFA", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#B6F0E8", marginBottom: 8 },
  modelTitle: { color: "#0B1220", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  modelCopy: { color: "#475569", fontSize: 12, lineHeight: 17 },
  modelButton: { alignSelf: "flex-start", marginTop: 11, minHeight: 38, justifyContent: "center", paddingHorizontal: 13, borderRadius: 12, backgroundColor: "#2563EB" },
  modelButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  progressText: { color: "#1E40AF", fontSize: 12, fontWeight: "700" },
  chatContent: { paddingTop: 4, paddingBottom: 12, flexGrow: 1 },
  promptRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 10 },
  promptChip: { backgroundColor: "#FFFFFF", borderColor: "#DCE4EF", borderWidth: 1, borderRadius: 15, paddingHorizontal: 11, minHeight: 32, justifyContent: "center" },
  promptText: { color: "#334155", fontSize: 12, fontWeight: "700" },
  messageRow: { width: "100%", marginVertical: 4, flexDirection: "row" },
  userRow: { justifyContent: "flex-end" },
  assistantRow: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "84%", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  userBubble: { backgroundColor: "#2563EB", borderBottomRightRadius: 5 },
  assistantBubble: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1, borderBottomLeftRadius: 5 },
  systemBubble: { backgroundColor: "#FFF7E8", borderColor: "#F8D28C", borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 21 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: "#1E293B" },
  voiceStatus: { color: "#475569", fontSize: 12, lineHeight: 16, paddingHorizontal: 4, paddingBottom: 6 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  micButton: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#E6FFFA", alignItems: "center", justifyContent: "center" },
  recordingButton: { backgroundColor: "#FCE6E6" },
  micText: { color: "#0F766E", fontWeight: "800", fontSize: 12 },
  input: { flex: 1, minHeight: 48, maxHeight: 100, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11, color: "#0F172A", fontSize: 15, lineHeight: 20 },
  sendButton: { minHeight: 48, paddingHorizontal: 15, borderRadius: 15, backgroundColor: "#0B1220", alignItems: "center", justifyContent: "center" },
  disabledButton: { backgroundColor: "#94A3B8" },
  sendText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
