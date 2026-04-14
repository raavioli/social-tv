import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../../src/store/useAppStore";
import { RetainedItem } from "@social-tv/shared";

const TYPE_CONFIG = {
  remember: { emoji: "🔖", label: "Saved", color: "#6c47ff" },
  follow_up: { emoji: "🔔", label: "Follow Up", color: "#f59e0b" },
  task: { emoji: "✅", label: "Task", color: "#10b981" },
};

export default function SavedScreen() {
  const { retainedItems, resolveItem } = useAppStore();
  const active = retainedItems.filter((r) => !r.isResolved);
  const done = retainedItems.filter((r) => r.isResolved);

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Saved 🔖</Text>
          <Text style={styles.sub}>{active.length} items to catch up on</Text>

          {active.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>
                Nothing saved yet.{"\n"}Tap Save or Follow Up on any story.
              </Text>
            </View>
          )}

          {active.map((item) => (
            <SavedCard key={item.id} item={item} onResolve={() => resolveItem(item.id)} />
          ))}

          {done.length > 0 && (
            <>
              <Text style={[styles.sub, { marginTop: 24 }]}>
                Done ({done.length})
              </Text>
              {done.map((item) => (
                <SavedCard key={item.id} item={item} done />
              ))}
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SavedCard = ({
  item,
  onResolve,
  done,
}: {
  item: RetainedItem;
  onResolve?: () => void;
  done?: boolean;
}) => {
  const config = TYPE_CONFIG[item.type];
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.cardHeader}>
        <View style={[styles.typePill, { backgroundColor: config.color + "22" }]}>
          <Text style={styles.typeEmoji}>{config.emoji}</Text>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.cardTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.cardTitle, done && styles.cardTitleDone]} numberOfLines={2}>
        {item.feedItem.title}
      </Text>
      <Text style={styles.cardSummary} numberOfLines={2}>
        {item.feedItem.summary}
      </Text>
      {!done && onResolve && (
        <TouchableOpacity onPress={onResolve} style={styles.resolveBtn}>
          <Text style={styles.resolveBtnText}>Mark done ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24 },
  heading: { color: "#fff", fontSize: 30, fontWeight: "900", marginBottom: 4 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 16 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 8,
  },
  cardDone: { opacity: 0.45 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  typeEmoji: { fontSize: 12 },
  typeLabel: { fontSize: 11, fontWeight: "700" },
  cardTime: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "700", lineHeight: 21 },
  cardTitleDone: { textDecorationLine: "line-through", color: "rgba(255,255,255,0.4)" },
  cardSummary: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18 },
  resolveBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16,185,129,0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  resolveBtnText: { color: "#10b981", fontSize: 12, fontWeight: "700" },
});
