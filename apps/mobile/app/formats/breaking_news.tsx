import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";

const MOCK_BREAKING = [
  { id: "1", headline: "Markets surge as Fed signals rate pause", source: "LinkedIn · Finance", ago: "2m ago", urgency: 10 },
  { id: "2", headline: "New AI model beats GPT-4 on coding benchmarks", source: "Twitter · Tech", ago: "8m ago", urgency: 9 },
  { id: "3", headline: "Your post is going viral — 2,400 likes in the last hour", source: "Instagram · You", ago: "12m ago", urgency: 8 },
];

export default function BreakingNewsScreen() {
  const flashAnim = useRef(new Animated.Value(1)).current;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Red banner flash
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <LinearGradient colors={["#0a0000", "#1a0000"]} style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#cc0000" />
      <SafeAreaView style={styles.safe}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ color: "#ff6600", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        {/* Breaking banner */}
        <Animated.View style={[styles.banner, { opacity: flashAnim }]}>
          <LinearGradient colors={["#cc0000", "#ff2200"]} style={styles.bannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.bannerText}>🔴 BREAKING NEWS</Text>
            <Text style={styles.bannerSub}>LIVE UPDATES</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stories */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {MOCK_BREAKING.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, i === activeIdx && styles.cardActive]}
              onPress={() => setActiveIdx(i)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardBlur, { backgroundColor: "rgba(30,0,0,0.7)" }]}>
                <View style={styles.cardRow}>
                  <View style={[styles.urgencyDot, { backgroundColor: item.urgency >= 9 ? "#ff2200" : item.urgency >= 7 ? "#ff6600" : "#ffaa00" }]} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardHeadline}>{item.headline}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardSource}>{item.source}</Text>
                      <Text style={styles.cardAgo}>{item.ago}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ticker at bottom */}
        <View style={styles.ticker}>
          <LinearGradient colors={["#cc0000", "#990000"]} style={styles.tickerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.tickerText} numberOfLines={1}>
              BREAKING: {MOCK_BREAKING[activeIdx]?.headline}
            </Text>
          </LinearGradient>
        </View>

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  banner: { marginHorizontal: 16, marginTop: 12, borderRadius: 8, overflow: "hidden" },
  bannerGrad: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  bannerText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 2 },
  bannerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  scroll: { flex: 1, marginTop: 12 },
  scrollContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  card: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,34,0,0.2)" },
  cardActive: { borderColor: "rgba(255,34,0,0.7)" },
  cardBlur: { padding: 16 },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  urgencyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  cardContent: { flex: 1 },
  cardHeadline: { color: "#fff", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  cardSource: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  cardAgo: { color: "#ff6600", fontSize: 12, fontWeight: "700" },
  ticker: { marginHorizontal: 16, marginBottom: 8, borderRadius: 6, overflow: "hidden" },
  tickerGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  tickerText: { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  closeBtn: { alignSelf: "center", paddingHorizontal: 24, paddingVertical: 10, marginBottom: 8 },
  closeBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
});
