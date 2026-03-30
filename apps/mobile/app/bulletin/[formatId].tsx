import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { TV_FORMATS, CONTENT_VERTICALS } from "@social-tv/shared";
import { ChannelQuickStrip } from "../../src/components/ChannelQuickStrip";

// Mock stories for demo
const MOCK_STORIES = [
  { id: "1", rank: 1, headline: "Your top story for this format", source: "Twitter · Tech", ago: "5m ago", score: 9.8 },
  { id: "2", rank: 2, headline: "Second most important update from your feeds", source: "LinkedIn · You", ago: "22m ago", score: 9.1 },
  { id: "3", rank: 3, headline: "Trending in your network right now", source: "Instagram · Trending", ago: "1h ago", score: 8.7 },
  { id: "4", rank: 4, headline: "What your connections are talking about", source: "YouTube · Subscriptions", ago: "2h ago", score: 8.2 },
  { id: "5", rank: 5, headline: "Key update from a source you follow", source: "Twitter · Following", ago: "3h ago", score: 7.9 },
];

export default function FormatScreen() {
  const { formatId, verticalId } = useLocalSearchParams<{ formatId: string; verticalId?: string }>();

  const format = TV_FORMATS.find(f => f.id === formatId);
  const vertical = verticalId ? CONTENT_VERTICALS.find(v => v.id === verticalId) : null;

  const stories = vertical
    ? MOCK_STORIES.map(s => ({ ...s, source: `${vertical.emoji} ${vertical.name} · ${s.source.split("·")[1]?.trim()}` }))
    : MOCK_STORIES;

  if (!format) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.center}>
            <Text style={styles.errorText}>Format not found: {formatId}</Text>
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
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.formatEmoji}>{format.emoji}</Text>
            <Text style={styles.formatName}>{format.name}</Text>
            {vertical && (
              <View style={[styles.verticalBadge, { backgroundColor: `${vertical.color}33` }]}>
                <Text style={[styles.verticalBadgeText, { color: vertical.color }]}>{vertical.emoji} {vertical.name}</Text>
              </View>
            )}
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Format meta */}
        <BlurView intensity={20} tint="dark" style={styles.metaCard}>
          <Text style={styles.metaAnalogy}>{format.tvAnalogy}</Text>
          <Text style={styles.metaDesc}>{format.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>{format.pacing} pace</Text>
            <Text style={styles.metaChip}>{format.storyCount} stories</Text>
            <Text style={styles.metaChip}>{format.minMinutes}–{format.maxMinutes}min</Text>
            {format.voiced && <Text style={styles.metaChip}>🎙 Voiced</Text>}
          </View>
        </BlurView>

        {/* Quick strip — switch format within same vertical */}
        {vertical && (
          <ChannelQuickStrip
            verticalId={vertical.id}
            verticalColor={vertical.color}
            verticalEmoji={vertical.emoji}
            verticalName={`${vertical.name} channel`}
            compact
          />
        )}

        {/* Stories */}
        <ScrollView contentContainerStyle={styles.list}>
          {stories.map((story, i) => (
            <BlurView key={story.id} intensity={15} tint="dark" style={styles.storyCard}>
              <View style={styles.storyRow}>
                <LinearGradient
                  colors={["#6c47ff", "#a855f7"]}
                  style={styles.rankBadge}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.rankText}>{story.rank}</Text>
                </LinearGradient>
                <View style={styles.storyContent}>
                  <Text style={styles.storyHeadline}>{story.headline}</Text>
                  <View style={styles.storyMeta}>
                    <Text style={styles.storySource}>{story.source}</Text>
                    <Text style={styles.storyAgo}>{story.ago}</Text>
                  </View>
                </View>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreVal}>{story.score}</Text>
                  <Text style={styles.scoreLabel}>score</Text>
                </View>
              </View>
            </BlurView>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  backBtn: { padding: 20 },
  backText: { color: "#6c47ff", fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#6c47ff", fontSize: 15, width: 60 },
  headerCenter: { alignItems: "center", gap: 2 },
  formatEmoji: { fontSize: 28 },
  formatName: { color: "#fff", fontSize: 18, fontWeight: "900" },
  verticalBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  verticalBadgeText: { fontSize: 11, fontWeight: "800" },
  metaCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", gap: 6 },
  metaAnalogy: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontStyle: "italic" },
  metaDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  list: { paddingHorizontal: 16, gap: 8 },
  storyCard: { borderRadius: 12, overflow: "hidden", padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  storyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rankText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  storyContent: { flex: 1 },
  storyHeadline: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  storyMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  storySource: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
  storyAgo: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  scoreCol: { alignItems: "center" },
  scoreVal: { color: "#a78bfa", fontSize: 16, fontWeight: "900" },
  scoreLabel: { color: "rgba(255,255,255,0.2)", fontSize: 9, textTransform: "uppercase" },
});
