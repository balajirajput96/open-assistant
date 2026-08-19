import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore } from "@/lib/assistant-store";

export default function SettingsScreen() {
  const { preferences, updatePreferences, clearLocalData, addActivity } = useAssistantStore();

  const confirmDelete = () => {
    Alert.alert("Delete local history?", "This removes conversations, action reviews, and settings stored on this device. Downloaded model files are managed separately by the device runtime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete local data",
        style: "destructive",
        onPress: () => {
          void clearLocalData().then(() => addActivity("Local data deleted", "Conversation history and activity were removed from this device.", "success"));
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="px-4" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Control what is stored, spoken, and downloaded on your device.</Text>

        <Text style={styles.sectionTitle}>LOCAL AI</Text>
        <View style={styles.group}>
          <SettingRow
            title="Allow model download"
            detail="Downloads the Qwen3-0.6B model for on-device replies. It may use substantial device storage."
            value={preferences.modelDownloadApproved}
            onValueChange={(value) => updatePreferences({ modelDownloadApproved: value })}
          />
          <SettingRow
            title="Allow voice model download"
            detail="Downloads Whisper Tiny to transcribe microphone audio privately on the device."
            value={preferences.voiceModelDownloadApproved}
            onValueChange={(value) => updatePreferences({ voiceModelDownloadApproved: value })}
          />
          <SettingRow
            title="Speak assistant replies"
            detail="Uses the device text-to-speech service after a local reply is generated."
            value={preferences.autoSpeak}
            onValueChange={(value) => updatePreferences({ autoSpeak: value })}
          />
        </View>

        <Text style={styles.sectionTitle}>LANGUAGE</Text>
        <View style={styles.group}>
          <Pressable
            onPress={() => updatePreferences({ preferredLanguage: preferences.preferredLanguage === "en" ? "hi" : "en" })}
            style={({ pressed }) => [styles.languageRow, pressed && styles.pressed]}
          >
            <View>
              <Text style={styles.rowTitle}>Response voice</Text>
              <Text style={styles.rowDetail}>Tap to switch between English and Hindi speech.</Text>
            </View>
            <Text style={styles.languageValue}>{preferences.preferredLanguage === "en" ? "English" : "Hindi"}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>PRIVACY</Text>
        <View style={styles.group}>
          <View style={styles.privacyCopy}>
            <Text style={styles.rowTitle}>Local-first storage</Text>
            <Text style={styles.rowDetail}>Conversations and action history are stored locally. The app does not silently send prompts or voice notes to a cloud AI service.</Text>
          </View>
          <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
            <Text style={styles.deleteText}>Delete local history</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({ title, detail, value, onValueChange }: { title: string; detail: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#CBD5E1", true: "#93C5FD" }} thumbColor={value ? "#2563EB" : "#F8FAFC"} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 32 },
  title: { color: "#0B1220", fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  subtitle: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 5 },
  sectionTitle: { color: "#64748B", fontSize: 11, fontWeight: "800", letterSpacing: 0.9, marginTop: 23, marginBottom: 8 },
  group: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, overflow: "hidden" },
  settingRow: { padding: 15, flexDirection: "row", gap: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEF2F7" },
  settingCopy: { flex: 1, paddingRight: 4 },
  rowTitle: { color: "#0F172A", fontSize: 15, fontWeight: "800" },
  rowDetail: { color: "#64748B", fontSize: 12, lineHeight: 17, marginTop: 4 },
  languageRow: { minHeight: 72, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  languageValue: { color: "#2563EB", fontSize: 13, fontWeight: "800" },
  privacyCopy: { padding: 15 },
  deleteButton: { margin: 15, marginTop: 0, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 13, backgroundColor: "#FFF1F1", borderWidth: 1, borderColor: "#F9C7C7" },
  deleteText: { color: "#C24141", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
