import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image, Dimensions, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const { width: W, height: H } = Dimensions.get("window");
const CARD_H = H * 0.65;

const HIGHLIGHTS = [
  { id: "1", platform: "instagram", emoji: "📷", color: "#E1306C", type: "Your Best Post", headline: "Your hiking photo from Saturday", stats: "1,240 likes · 67 comments", imageUrl: "https://picsum.photos/seed/hl1/600/800", score: 9.8 },
  { id: "2", platform: "twitter", emoji: "🐦", color: "#1DA1F2", type: "Viral Thread", headline: "The AI productivity thread everyone shared", stats: "847 likes · 210 retweets", imageUrl: "https://picsum.photos/seed/hl2/600/800", score: 9.5 },
  { id: "3", platform: "youtube", emoji: "📺", color: "#FF0000", type: "Top Video", headline: "Building an AI app in 24 hours — Full Doc", stats: "280K views · 18K likes", imageUrl: "https://picsum.photos/seed/hl3/600/800", score: 9.2 },
  { id: "4", platform: "linkedin", emoji: "💼", color: "#0A66C2", type: "Career Moment", headline: "Why I left a $400k job to build in public", stats: "4.2K reactions · 890 comments", imageUrl: "https://picsum.photos/seed/hl4/600/800", score: 8.9 },
];

export default function HighlightReelScreen() {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>🎬 Highlight Reel</Text>
            <Text style={styles.subtitle}>Your best moments this week</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {HIGHLIGHTS.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIdx && styles.dotActive]} />
          ))}
        </View>

        {/* Cards */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / W);
            setActiveIdx(idx);
          }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {HIGHLIGHTS.map((item) => (
            <View key={item.id} style={styles.slide}>
              <View style={[styles.card, { height: CARD_H }]}>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.97)"]} style={styles.cardOverlay}>
                  <View style={styles.cardBottom}>
                    <View style={styles.typeRow}>
                      <View style={[styles.platformBadge, { backgroundColor: item.color }]}>
                        <Text style={styles.platformEmoji}>{item.emoji}</Text>
                      </View>
                      <Text style={styles.typeLabel}>{item.type}</Text>
                    </View>
                    <Text style={styles.cardHeadline}>{item.headline}</Text>
                    <Text style={styles.cardStats}>{item.stats}</Text>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Engagement score</Text>
                      <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.scoreBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={styles.scoreValue}>{item.score}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIdx + 1} / {HIGHLIGHTS.length}</Text>
        </View>
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
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { backgroundColor: "#6c47ff", width: 18 },
  scrollContent: { paddingHorizontal: 0 },
  slide: { width: W, paddingHorizontal: 16 },
  card: { borderRadius: 20, overflow: "hidden" },
  cardImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  cardOverlay: { flex: 1, justifyContent: "flex-end" },
  cardBottom: { padding: 20, gap: 10 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  platformEmoji: { fontSize: 13 },
  typeLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardHeadline: { color: "#fff", fontSize: 20, fontWeight: "900", lineHeight: 26 },
  cardStats: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  scoreLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  scoreBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  scoreValue: { color: "#fff", fontSize: 14, fontWeight: "900" },
  counter: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  counterText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
});
