import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore } from "@/lib/assistant-store";

export default function AutomationsScreen() {
  const { actions, updateAction, addActivity } = useAssistantStore();

  const reviewAction = (id: string) => {
    const action = actions.find((item) => item.id === id);
    if (!action) return;
    Alert.alert("Review action", action.description, [
      { text: "Decline", style: "cancel", onPress: () => updateAction(id, "declined") },
      {
        text: action.kind === "open-link" ? "Open link" : "Save draft",
        onPress: () => {
          updateAction(id, "completed");
          addActivity(action.kind === "open-link" ? "Link opened by approval" : "Local draft saved", action.description, "success");
          if (action.kind === "open-link" && action.href) void Linking.openURL(action.href);
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="px-4" containerClassName="bg-background">
      <Text style={styles.title}>Automations</Text>
      <Text style={styles.subtitle}>Every outward action starts as a review. No silent sending, posting, purchasing, or account changes.</Text>

      <View style={styles.guardrail}>
        <Text style={styles.guardrailTitle}>Approval is required</Text>
        <Text style={styles.guardrailCopy}>Open Assistant can create a draft or open a link only after you explicitly choose the final action.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proposed actions</Text>
        {actions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No action is waiting.</Text>
            <Text style={styles.emptyCopy}>Ask the assistant to draft a message or open a link to see a review card here.</Text>
          </View>
        ) : (
          actions.map((action) => (
            <View key={action.id} style={styles.actionCard}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionCopy}>{action.description}</Text>
              <View style={styles.actionFooter}>
                <Text style={[styles.status, action.status === "awaiting-review" ? styles.pending : styles.complete]}>{action.status.replace("-", " ")}</Text>
                {action.status === "awaiting-review" ? (
                  <Pressable onPress={() => reviewAction(action.id)} style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}>
                    <Text style={styles.reviewText}>Review</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: "#0B1220", fontSize: 28, fontWeight: "800", paddingTop: 12, letterSpacing: -0.6 },
  subtitle: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 5 },
  guardrail: { backgroundColor: "#E6FFFA", borderColor: "#B6F0E8", borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 18 },
  guardrailTitle: { color: "#0F766E", fontSize: 14, fontWeight: "800" },
  guardrailCopy: { color: "#285E61", fontSize: 13, lineHeight: 18, marginTop: 4 },
  section: { marginTop: 22, gap: 10 },
  sectionTitle: { color: "#334155", fontSize: 13, fontWeight: "800", letterSpacing: 0.2, textTransform: "uppercase" },
  emptyCard: { padding: 18, borderRadius: 18, backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderWidth: 1 },
  emptyTitle: { color: "#334155", fontSize: 15, fontWeight: "800" },
  emptyCopy: { color: "#64748B", fontSize: 13, lineHeight: 18, marginTop: 4 },
  actionCard: { padding: 16, borderRadius: 18, backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1 },
  actionTitle: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
  actionCopy: { color: "#475569", fontSize: 13, lineHeight: 18, marginTop: 5 },
  actionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  status: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  pending: { color: "#B45309" },
  complete: { color: "#0F766E" },
  reviewButton: { minHeight: 38, paddingHorizontal: 14, justifyContent: "center", borderRadius: 12, backgroundColor: "#0B1220" },
  reviewText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
