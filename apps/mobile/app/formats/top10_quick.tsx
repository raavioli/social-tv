import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { api } from "../../src/lib/api";

interface QuickStory {
  rank: number;
  headline: string;
  source: string;
  presenterLine: string;
  score: number;
}

const MOCK_STORIES: QuickStory[] = [
  { rank: 1, headline: "Your AI post went viral — 2,400 likes in the last hour", source: "Twitter", presenterLine: "Number 1 — your own content is blowing up!", score: 9.8 },
  { rank: 2, headline: "OpenAI announces GPT-5 with real-time video understanding", source: "Twitter", presenterLine: "At number 2, big news from OpenAI.", score: 9.5 },
  { rank: 3, headline: "Your reel from last week just hit 10K plays", source: "Instagram", presenterLine: "Number 3 — congratulations, your content is still performing.", score: 9.2 },
  { rank: 4, headline: "React Native 0.78 ships with the new architecture by default", source: "Twitter", presenterLine: "Spot 4 goes to the React Native team.", score: 8.9 },
  { rank: 5, headline: "5 connections viewed your profile after your latest post", source: "LinkedIn", presenterLine: "At number 5, your LinkedIn presence is growing.", score: 8.6 },
  { rank: 6, headline: "Favourite creator dropped a new 45-min documentary", source: "YouTube", presenterLine: "Number 6 — a new long-form piece from a creator you follow.", score: 8.3 },
  { rank: 7, headline: "Thread on why most AI startups will fail in 2026", source: "Twitter", presenterLine: "At 7, a sobering thread that's getting a lot of traction.", score: 8.0 },
  { rank: 8, headline: "Your friend just posted from their trip to Japan", source: "Instagram", presenterLine: "Number 8 — travel content from your circle.", score: 7.7 },
  { rank: 9, headline: "Tech layoffs continue — 3 companies announced cuts today", source: "LinkedIn", presenterLine: "At number 9, market news from LinkedIn.", score: 7.4 },
  { rank: 10, headline: "New music video from your favourite artist just dropped", source: "YouTube", presenterLine: "And rounding out our top 10 — new music!", score: 7.1 },
];

export default function Top10QuickScreen() {
  const [stories, setStories] = useState<QuickStory[]>(MOCK_STORIES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const DURATION = 6000; // 6 seconds per story

  useEffect(() => {
    if (paused || current >= stories.length) return;

    progress.setValue(0);
    fadeAnim.setValue(0);

    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // Progress bar
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && !paused) {
        // Fade out then advance
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          setCurrent(c => c + 1);
        });
      }
    });

    return () => anim.stop();
  }, [current, paused]);

  const story = stories[current];
  const isComplete = current >= stories.length;

  if (isComplete) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.doneView}>
            <Text style={styles.doneEmoji}>✅</Text>
            <Text style={styles.doneTitle}>All caught up!</Text>
            <Text style={styles.doneSub}>You just covered your top 10 in under a minute.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>← Back to TV</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚡ 10 in 1 min</Text>
          <TouchableOpacity onPress={() => setPaused(p => !p)}>
            <Text style={styles.pauseBtn}>{paused ? "▶" : "⏸"}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {stories.map((_, i) => (
            <View key={i} style={[styles.dot, i < current && styles.dotDone, i === current && styles.dotActive]}>
              {i === current && (
                <Animated.View style={[styles.dotFill, { flex: 1, transform: [{ scaleX: progress }] }]} />
              )}
            </View>
          ))}
        </View>

        {/* Story card */}
        <Animated.View style={[styles.storyContainer, { opacity: fadeAnim }]}>
          {/* Big rank number */}
          <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.rankCircle}>
            <Text style={styles.rankNumber}>{story.rank}</Text>
          </LinearGradient>

          {/* Presenter line */}
          <View style={styles.presenterRow}>
            <Text style={styles.presenterEmoji}>🎙️</Text>
            <Text style={styles.presenterLine}>{story.presenterLine}</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{story.headline}</Text>

          {/* Source badge */}
          <View style={styles.metaRow}>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>{story.source}</Text>
            </View>
            <Text style={styles.scoreText}>{story.score} relevance</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { /* save */ }}>
              <Text style={styles.actionText}>🔖 Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { /* skip */ setCurrent(c => c + 1); }}>
              <Text style={styles.actionText}>⏭ Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { /* deep dive */ }}>
              <Text style={styles.actionText}>🔭 More</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom counter */}
        <View style={styles.bottomCounter}>
          <Text style={styles.counterText}>{current + 1} of {stories.length}</Text>
          <Text style={styles.timerText}>{Math.ceil((stories.length - current) * 6)}s remaining</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  close: { color: "rgba(255,255,255,0.4)", fontSize: 20 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  pauseBtn: { color: "rgba(255,255,255,0.6)", fontSize: 18, padding: 4 },
  dotsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 3, marginBottom: 20 },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  dotDone: { backgroundColor: "#6c47ff" },
  dotActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  dotFill: { backgroundColor: "#6c47ff", height: "100%" },
  storyContainer: { flex: 1, paddingHorizontal: 24, justifyContent: "center", gap: 20 },
  rankCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  rankNumber: { color: "#fff", fontSize: 32, fontWeight: "900" },
  presenterRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12 },
  presenterEmoji: { fontSize: 18, marginTop: 2 },
  presenterLine: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontStyle: "italic", lineHeight: 20, flex: 1 },
  headline: { color: "#fff", fontSize: 24, fontWeight: "800", lineHeight: 32, textAlign: "center" },
  metaRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  sourceBadge: { backgroundColor: "rgba(108,71,255,0.2)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  sourceText: { color: "#a78bfa", fontSize: 12, fontWeight: "700" },
  scoreText: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  actionsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  actionBtn: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  actionText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },
  bottomCounter: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between" },
  counterText: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "700" },
  timerText: { color: "rgba(255,255,255,0.2)", fontSize: 12 },
  doneView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  doneEmoji: { fontSize: 48 },
  doneTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  doneSub: { color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" },
  doneBtn: { marginTop: 12, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  doneBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "700" },
});
