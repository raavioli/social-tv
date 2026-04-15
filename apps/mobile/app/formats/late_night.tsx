import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

const { width: W } = Dimensions.get("window");

const MOCK_VIRAL = [
  { id: "1", type: "meme", platform: "twitter", emoji: "🐦", color: "#1DA1F2", headline: "Thread: 'I asked AI to write my resignation letter...'", engagement: "47K likes", imageUrl: "https://picsum.photos/seed/ln1/400/300", vibe: "😂 Hilarious" },
  { id: "2", type: "reel", platform: "instagram", emoji: "📷", color: "#E1306C", headline: "This dog's reaction to the mailman is everything", engagement: "1.2M views", imageUrl: "https://picsum.photos/seed/ln2/400/300", vibe: "🥰 Wholesome" },
  { id: "3", type: "clip", platform: "youtube", emoji: "📺", color: "#FF0000", headline: "Hot Take: Tabs vs Spaces — the debate that never ends", engagement: "890K views", imageUrl: "https://picsum.photos/seed/ln3/400/300", vibe: "🔥 Spicy" },
  { id: "4", type: "post", platform: "linkedin", emoji: "💼", color: "#0A66C2", headline: "POV: Your manager's meeting could've been an email", engagement: "88K reactions", imageUrl: "https://picsum.photos/seed/ln4/400/300", vibe: "😅 Too real" },
];

const VIBE_COLORS: Record<string, string> = {
  "😂 Hilarious": "#f59e0b",
  "🥰 Wholesome": "#ec4899",
  "🔥 Spicy": "#ef4444",
  "😅 Too real": "#8b5cf6",
};

export default function LateNightScreen() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>🌙 Late Night</Text>
            <Text style={styles.subtitle}>What's making everyone laugh</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {MOCK_VIRAL.map(item => {
            const isSaved = saved.has(item.id);
            return (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={styles.cardOverlay}>
                  <View style={styles.cardBottom}>
                    {/* Vibe badge */}
                    <View style={[styles.vibeBadge, { backgroundColor: `${VIBE_COLORS[item.vibe] ?? "#666"}33` }]}>
                      <Text style={[styles.vibeText, { color: VIBE_COLORS[item.vibe] ?? "#fff" }]}>{item.vibe}</Text>
                    </View>

                    {/* Platform */}
                    <View style={styles.platformRow}>
                      <View style={[styles.platformDot, { backgroundColor: item.color }]}>
                        <Text style={styles.platformEmoji}>{item.emoji}</Text>
                      </View>
                      <Text style={styles.engagement}>{item.engagement}</Text>
                    </View>

                    <Text style={styles.headline}>{item.headline}</Text>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, isSaved && styles.actionBtnActive]}
                        onPress={() => setSaved(prev => {
                          const next = new Set(prev);
                          isSaved ? next.delete(item.id) : next.add(item.id);
                          return next;
                        })}
                      >
                        <Text style={styles.actionText}>{isSaved ? "✅ Saved" : "🔖 Save"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>↗ Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  back: { color: "#6c47ff", fontSize: 15 },
  headerCenter: { alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  card: { borderRadius: 16, overflow: "hidden", height: 260 },
  cardImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  cardOverlay: { flex: 1, justifyContent: "flex-end" },
  cardBottom: { padding: 16, gap: 8 },
  vibeBadge: { alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  vibeText: { fontSize: 12, fontWeight: "800" },
  platformRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  platformEmoji: { fontSize: 11 },
  engagement: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  headline: { color: "#fff", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  actionBtnActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
