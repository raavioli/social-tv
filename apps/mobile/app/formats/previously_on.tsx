import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const MOCK_MISSED = [
  { id: "1", platform: "twitter", emoji: "🐦", platformColor: "#1DA1F2", headline: "Thread went viral about your open source project", detail: "847 likes · 3 hours ago", category: "Your Activity" },
  { id: "2", platform: "youtube", emoji: "📺", platformColor: "#FF0000", headline: "New upload from your favourite creator", detail: "280K views · 5 hours ago", category: "Subscriptions" },
  { id: "3", platform: "linkedin", emoji: "💼", platformColor: "#0A66C2", headline: "15 new profile views after your post", detail: "15 views · 6 hours ago", category: "Your Activity" },
  { id: "4", platform: "instagram", emoji: "📷", platformColor: "#E1306C", headline: "Your reel reached 5,000 plays", detail: "5,000 plays · 8 hours ago", category: "Your Activity" },
  { id: "5", platform: "twitter", emoji: "🐦", platformColor: "#1DA1F2", headline: "AI coding tools thread is trending in your network", detail: "2.1K retweets · 12 hours ago", category: "Trending" },
];

export default function PreviouslyOnScreen() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = MOCK_MISSED.filter(i => !dismissed.has(i.id));

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>⏮️ Previously On...</Text>
            <Text style={styles.subtitle}>While you were away</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{visible.length} things you missed</Text>
        </View>

        <FlatList
          data={visible}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
              <View style={styles.cardRow}>
                <View style={[styles.platformDot, { backgroundColor: item.platformColor }]}>
                  <Text style={styles.platformEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.headline}>{item.headline}</Text>
                  <Text style={styles.detail}>{item.detail}</Text>
                </View>
                <TouchableOpacity onPress={() => setDismissed(prev => new Set([...prev, item.id]))}>
                  <Text style={styles.dismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => (
            <View style={styles.allClear}>
              <Text style={styles.allClearEmoji}>✅</Text>
              <Text style={styles.allClearText}>All caught up!</Text>
            </View>
          )}
        />

        {visible.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={() => setDismissed(new Set(MOCK_MISSED.map(i => i.id)))}
          >
            <Text style={styles.clearAllText}>Mark all as seen</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#6c47ff", fontSize: 15 },
  headerTitle: { alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  countBadge: { marginHorizontal: 20, marginBottom: 12, backgroundColor: "rgba(108,71,255,0.2)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start" },
  countText: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { borderRadius: 12, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  platformDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  platformEmoji: { fontSize: 16 },
  cardContent: { flex: 1 },
  category: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  headline: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  detail: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 },
  dismiss: { color: "rgba(255,255,255,0.2)", fontSize: 18, paddingLeft: 8 },
  allClear: { alignItems: "center", paddingTop: 60, gap: 12 },
  allClearEmoji: { fontSize: 48 },
  allClearText: { color: "rgba(255,255,255,0.5)", fontSize: 16 },
  clearAllBtn: { marginHorizontal: 20, marginBottom: 20, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  clearAllText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "700" },
});
