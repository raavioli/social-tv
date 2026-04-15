import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const PLATFORMS: Record<string, { emoji: string; color: string }> = {
  twitter:   { emoji: "🐦", color: "#1DA1F2" },
  instagram: { emoji: "📷", color: "#E1306C" },
  youtube:   { emoji: "📺", color: "#FF0000" },
  linkedin:  { emoji: "💼", color: "#0A66C2" },
};

function genMockItem(idx: number) {
  const platforms = ["twitter", "instagram", "youtube", "linkedin"];
  const p = platforms[idx % 4];
  const summaries = [
    "Just pushed a new feature to production 🚀",
    "Interesting take on remote work culture thread",
    "New video dropped — Building with AI in 2025",
    "5 connections viewed your profile today",
    "Your photo from last week is still getting saves",
    "Hot take: async is overrated. Change my mind.",
  ];
  return {
    id: `live-${Date.now()}-${idx}`,
    platform: p,
    summary: summaries[idx % summaries.length],
    ago: "just now",
  };
}

export default function LiveFeedScreen() {
  const [items, setItems] = useState(() => Array.from({ length: 8 }, (_, i) => genMockItem(i)));
  const [isLive, setIsLive] = useState(true);
  const dotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Simulate incoming posts
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setItems(prev => [genMockItem(Math.floor(Math.random() * 100)), ...prev.slice(0, 49)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLive(p => !p)} style={styles.pauseBtn}>
            <Text style={styles.pauseText}>{isLive ? "⏸ Pause" : "▶ Resume"}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const p = PLATFORMS[item.platform] ?? { emoji: "📱", color: "#666" };
            return (
              <View style={[styles.card, index === 0 && styles.cardNew, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
                <View style={styles.cardRow}>
                  <View style={[styles.dot, { backgroundColor: p.color }]}>
                    <Text style={styles.dotEmoji}>{p.emoji}</Text>
                  </View>
                  <Text style={styles.summary}>{item.summary}</Text>
                  <Text style={styles.ago}>{item.ago}</Text>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  back: { color: "#6c47ff", fontSize: 15 },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff2200" },
  liveText: { color: "#ff2200", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  pauseBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  pauseText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: 12, paddingBottom: 40 },
  card: { borderRadius: 10, overflow: "hidden", padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardNew: { borderColor: "rgba(108,71,255,0.4)" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dotEmoji: { fontSize: 12 },
  summary: { flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 18 },
  ago: { color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0 },
});
