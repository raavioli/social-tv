import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";

const OPTIONS = [
  { m: 1,  label: "1 min",  emoji: "⚡", sub: "Just headlines" },
  { m: 5,  label: "5 min",  emoji: "☕", sub: "Quick catch-up" },
  { m: 15, label: "15 min", emoji: "📺", sub: "A proper bulletin" },
  { m: 30, label: "30 min", emoji: "🛋️", sub: "Sit-down session" },
  { m: 0,  label: "Full",   emoji: "🎬", sub: "No limit — I'll self-regulate" },
];

export default function TimeBudgetScreen() {
  const setBudget = useAppStore(s => s.setTimeBudget);

  const pick = (m: number) => {
    setBudget(m);
    router.replace("/(tabs)" as any);
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>How much time do you have?</Text>
          <Text style={styles.sub}>We'll nudge you when it's up.</Text>
        </View>

        <View style={styles.list}>
          {OPTIONS.map(o => (
            <Pressable key={o.m} style={styles.row} onPress={() => pick(o.m)}>
              <Text style={styles.emoji}>{o.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.rowSub}>{o.sub}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, justifyContent: "center", padding: 24, gap: 24 },
  header: { gap: 8 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  list: { gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 18, paddingVertical: 16, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  emoji: { fontSize: 28 },
  label: { color: "#fff", fontSize: 16, fontWeight: "800" },
  rowSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  arrow: { color: "rgba(255,255,255,0.3)", fontSize: 28, fontWeight: "300" },
});
