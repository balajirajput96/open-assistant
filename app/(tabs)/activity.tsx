import { FlatList, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ActivityEntry, useAssistantStore } from "@/lib/assistant-store";

const toneColor = { neutral: "#2563EB", success: "#0F9F8F", warning: "#D97706" };

export default function ActivityScreen() {
  const { activities } = useAssistantStore();
  return (
    <ScreenContainer className="px-4" containerClassName="bg-background">
      <Text style={styles.title}>Activity</Text>
      <Text style={styles.subtitle}>A local audit trail for requests and action reviews.</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={activities.length ? styles.list : styles.emptyList}
        renderItem={({ item }: { item: ActivityEntry }) => (
          <View style={styles.card}>
            <View style={[styles.marker, { backgroundColor: toneColor[item.tone] }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDetail}>{item.detail}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing has left your device.</Text>
            <Text style={styles.emptyCopy}>Ask a question or review an action to create a local activity entry.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: "#0B1220", fontSize: 28, fontWeight: "800", paddingTop: 12, letterSpacing: -0.6 },
  subtitle: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 5, marginBottom: 16 },
  list: { gap: 10, paddingBottom: 18 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: "row", gap: 11 },
  marker: { width: 8, borderRadius: 5, alignSelf: "stretch" },
  cardContent: { flex: 1 },
  cardTitle: { color: "#0F172A", fontWeight: "800", fontSize: 15 },
  cardDetail: { color: "#475569", fontSize: 13, lineHeight: 18, marginTop: 3 },
  date: { color: "#94A3B8", fontSize: 11, marginTop: 8 },
  emptyCard: { backgroundColor: "#F0F5FF", borderWidth: 1, borderColor: "#CFE0FF", borderRadius: 20, padding: 20 },
  emptyTitle: { color: "#1E3A8A", fontSize: 16, fontWeight: "800" },
  emptyCopy: { color: "#475569", fontSize: 14, lineHeight: 20, marginTop: 5 },
});
