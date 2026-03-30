import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

const TOPIC = {
  title: "The AI Coding Revolution",
  summary: "How AI pair programming tools changed the way developers work — and what comes next.",
  imageUrl: "https://picsum.photos/seed/doc1/800/450",
  duration: "~18 min read",
  sources: 24,
};

const CHAPTERS = [
  { id: "1", title: "What triggered the shift", preview: "When GitHub Copilot launched in 2021, most developers dismissed it as autocomplete. Two years later...", platform: "twitter", emoji: "🐦", color: "#1DA1F2", read: false },
  { id: "2", title: "The numbers don't lie", preview: "Productivity studies showed 55% faster code completion. But velocity isn't the whole story...", platform: "linkedin", emoji: "💼", color: "#0A66C2", read: false },
  { id: "3", title: "The backlash begins", preview: "Senior engineers raised concerns: 'We're training developers who can't think without AI...'", platform: "twitter", emoji: "🐦", color: "#1DA1F2", read: true },
  { id: "4", title: "New workflows emerge", preview: "Teams are rethinking code review, pair programming, and what 'writing code' even means...", platform: "youtube", emoji: "📺", color: "#FF0000", read: false },
  { id: "5", title: "What's next: agentic coding", preview: "Claude and GPT-4o can now write entire features autonomously. Are human devs still needed?", platform: "linkedin", emoji: "💼", color: "#0A66C2", read: false },
];

export default function DocumentaryScreen() {
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set(["3"]));
  const progress = readChapters.size / CHAPTERS.length;

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.formatLabel}>🔭 DOCUMENTARY</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <View style={styles.hero}>
            <Image source={{ uri: TOPIC.imageUrl }} style={styles.heroImage} />
            <LinearGradient colors={["transparent", "rgba(10,10,15,0.98)"]} style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{TOPIC.sources} sources</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{TOPIC.duration}</Text>
                </View>
                <Text style={styles.heroTitle}>{TOPIC.title}</Text>
                <Text style={styles.heroSummary}>{TOPIC.summary}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Progress */}
          <BlurView intensity={20} tint="dark" style={styles.progressCard}>
            <Text style={styles.progressLabel}>Your progress</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#6c47ff", "#a855f7"]}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>{readChapters.size} of {CHAPTERS.length} chapters</Text>
          </BlurView>

          {/* Chapters */}
          <Text style={styles.chaptersLabel}>Chapters</Text>
          {CHAPTERS.map((ch, i) => {
            const isRead = readChapters.has(ch.id);
            return (
              <TouchableOpacity
                key={ch.id}
                style={[styles.chapterCard, isRead && styles.chapterCardRead]}
                onPress={() => setReadChapters(prev => { const n = new Set(prev); n.add(ch.id); return n; })}
              >
                <View style={styles.chapterNum}>
                  <Text style={styles.chapterNumText}>{isRead ? "✓" : i + 1}</Text>
                </View>
                <View style={styles.chapterContent}>
                  <View style={styles.chapterMeta}>
                    <View style={[styles.platformDot, { backgroundColor: ch.color }]}>
                      <Text style={styles.platformEmoji}>{ch.emoji}</Text>
                    </View>
                    <Text style={[styles.chapterTitle, isRead && styles.chapterTitleRead]}>{ch.title}</Text>
                  </View>
                  <Text style={styles.chapterPreview} numberOfLines={2}>{ch.preview}</Text>
                </View>
              </TouchableOpacity>
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
  formatLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  scroll: { paddingBottom: 40 },
  hero: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  heroContent: { padding: 20 },
  metaRow: { flexDirection: "row", gap: 6, alignItems: "center", marginBottom: 8 },
  metaText: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  metaDot: { color: "rgba(255,255,255,0.3)" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 28, marginBottom: 8 },
  heroSummary: { color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 20 },
  progressCard: { marginHorizontal: 16, marginVertical: 12, borderRadius: 12, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  progressLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  chaptersLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 20, marginBottom: 8 },
  chapterCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  chapterCardRead: { opacity: 0.5 },
  chapterNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(108,71,255,0.3)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  chapterNumText: { color: "#a78bfa", fontSize: 13, fontWeight: "900" },
  chapterContent: { flex: 1 },
  chapterMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  platformDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  platformEmoji: { fontSize: 10 },
  chapterTitle: { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1 },
  chapterTitleRead: { color: "rgba(255,255,255,0.4)" },
  chapterPreview: { color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 18 },
});
