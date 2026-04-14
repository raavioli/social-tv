import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { PERSONAS } from "../../src/constants/personas";
import { Presenter } from "../../src/components/Presenter";

// ─── Time-of-day programming ────────────────────────────────────────────────
function getTimeSlot() {
  const h = new Date().getHours();
  if (h < 6)  return { id: "late_night", label: "Late Night",     emoji: "🌙", greeting: "Can't sleep?" };
  if (h < 9)  return { id: "morning",    label: "Morning Show",   emoji: "☀️", greeting: "Good morning" };
  if (h < 12) return { id: "mid_morning",label: "Mid-Morning",    emoji: "🌤️", greeting: "Good morning" };
  if (h < 14) return { id: "lunch",      label: "Lunch Break",    emoji: "🍕", greeting: "Lunch break" };
  if (h < 17) return { id: "afternoon",  label: "Afternoon",      emoji: "☕", greeting: "Good afternoon" };
  if (h < 20) return { id: "evening",    label: "Evening News",   emoji: "🌆", greeting: "Good evening" };
  if (h < 23) return { id: "prime_time", label: "Prime Time",     emoji: "📺", greeting: "Good evening" };
  return { id: "late_night", label: "Late Night", emoji: "🌙", greeting: "Still up?" };
}

// ─── Moods ──────────────────────────────────────────────────────────────────
const MOODS = [
  { id: "focused",   emoji: "🎯", label: "Focused",   color: "#3b82f6" },
  { id: "curious",   emoji: "🧠", label: "Curious",   color: "#8b5cf6" },
  { id: "chill",     emoji: "😌", label: "Chill",     color: "#10b981" },
  { id: "energised", emoji: "⚡", label: "Energised", color: "#f59e0b" },
  { id: "stressed",  emoji: "🫠", label: "Stressed",  color: "#ef4444" },
];

// ─── Quick Programmes ───────────────────────────────────────────────────────
const QUICK_PROGRAMMES = [
  { id: "top10",          emoji: "🔢", label: "Top 10 Stories",      sub: "1 min · All platforms",  route: "/formats/top10_quick",    color: "#6c47ff" },
  { id: "breaking",       emoji: "🔴", label: "Breaking Now",        sub: "Live updates",           route: "/formats/breaking_news",  color: "#ef4444" },
  { id: "close_friends",  emoji: "👥", label: "Close Friends",       sub: "People you care about",  route: "/formats/previously_on",  color: "#10b981" },
  { id: "your_updates",   emoji: "📊", label: "Your Updates",        sub: "How your content is doing", route: "/formats/previously_on", color: "#8b5cf6" },
  { id: "flash",          emoji: "⚡", label: "Flash Briefing",      sub: "2 min catch-up",         route: "/bulletin/flash",         color: "#f59e0b" },
  { id: "100in100",       emoji: "🚀", label: "100 in 100",          sub: "100 headlines, 100 sec", route: "/bulletin/hundred_in_hundred", color: "#ec4899" },
];

// ─── Topic Channels ─────────────────────────────────────────────────────────
const TOPIC_CHANNELS = [
  { id: "tech",          emoji: "💻", label: "Tech & AI",      stories: 15, color: "#3b82f6" },
  { id: "entertainment", emoji: "🎭", label: "Entertainment",  stories: 10, color: "#f59e0b" },
  { id: "business",      emoji: "💼", label: "Business",       stories: 7,  color: "#0ea5e9" },
  { id: "sports",        emoji: "🏆", label: "Sports",         stories: 6,  color: "#22c55e" },
  { id: "lifestyle",     emoji: "🌿", label: "Lifestyle",      stories: 9,  color: "#10b981" },
  { id: "trending",      emoji: "🔥", label: "Trending",       stories: 8,  color: "#ef4444" },
];

export default function ControlCenterScreen() {
  const { settings } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const timeSlot = getTimeSlot();
  const persona = PERSONAS.find(p => p.id === settings.selectedPersonaId) ?? PERSONAS[0];

  const presenterLine = selectedMood
    ? `${MOODS.find(m => m.id === selectedMood)?.emoji} ${selectedMood} mood — I'll tune your feed accordingly.`
    : `It's ${timeSlot.label} time. What are we watching?`;

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{timeSlot.greeting}</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeEmoji}>{timeSlot.emoji}</Text>
                <Text style={styles.timeLabel}>{timeSlot.label}</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/programming" as any)} style={styles.settingsBtn}>
              <Text style={styles.settingsBtnText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Presenter */}
          <Presenter
            emoji={persona.avatarEmoji}
            name={persona.name}
            line={presenterLine}
            accentColor={selectedMood ? MOODS.find(m => m.id === selectedMood)?.color : "#6c47ff"}
          />

          {/* Mood selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HOW ARE YOU FEELING?</Text>
            <View style={styles.moodRow}>
              {MOODS.map(mood => {
                const isActive = selectedMood === mood.id;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[styles.moodPill, isActive && { backgroundColor: mood.color + "30", borderColor: mood.color }]}
                    onPress={() => setSelectedMood(isActive ? null : mood.id)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, isActive && { color: mood.color }]}>{mood.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quick Programmes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK PROGRAMMES</Text>
            <View style={styles.quickGrid}>
              {QUICK_PROGRAMMES.map(prog => (
                <TouchableOpacity
                  key={prog.id}
                  style={styles.quickCard}
                  onPress={() => router.push(prog.route as any)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[prog.color + "25", prog.color + "08"]}
                    style={styles.quickCardGrad}
                  >
                    <Text style={styles.quickEmoji}>{prog.emoji}</Text>
                    <Text style={styles.quickLabel}>{prog.label}</Text>
                    <Text style={styles.quickSub}>{prog.sub}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Topic Channels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHANNELS</Text>
            {TOPIC_CHANNELS.map(ch => (
              <TouchableOpacity
                key={ch.id}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/(tabs)/now", params: { channel: ch.id } } as any)}
                style={styles.channelCard}
              >
                <BlurView intensity={12} tint="dark" style={styles.channelCardInner}>
                  <LinearGradient colors={[ch.color, ch.color + "88"]} style={styles.chBadge}>
                    <Text style={styles.chEmoji}>{ch.emoji}</Text>
                  </LinearGradient>
                  <View style={styles.chInfo}>
                    <Text style={styles.chLabel}>{ch.label}</Text>
                    <View style={styles.chMeta}>
                      <View style={[styles.chDot, { backgroundColor: ch.color }]} />
                      <Text style={styles.chStories}>{ch.stories} stories ready</Text>
                    </View>
                  </View>
                  <Text style={styles.chArrow}>▶</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Schedule */}
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={() => router.push("/programming" as any)}
          >
            <BlurView intensity={12} tint="dark" style={styles.scheduleBtnInner}>
              <Text style={styles.scheduleBtnEmoji}>📋</Text>
              <View>
                <Text style={styles.scheduleBtnTitle}>My Schedule</Text>
                <Text style={styles.scheduleBtnSub}>Customise your daily programming</Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "900" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  timeEmoji: { fontSize: 16 },
  timeLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#ef4444" },
  liveText: { color: "#ef4444", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  settingsBtn: { padding: 8 },
  settingsBtnText: { fontSize: 22 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  moodRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  moodEmoji: { fontSize: 16 },
  moodLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: { width: "47%", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  quickCardGrad: { padding: 16, minHeight: 100, justifyContent: "flex-end", gap: 4 },
  quickEmoji: { fontSize: 24, marginBottom: 4 },
  quickLabel: { color: "#fff", fontSize: 14, fontWeight: "800" },
  quickSub: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
  channelCard: { marginBottom: 8, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  channelCardInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  chBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chEmoji: { fontSize: 20 },
  chInfo: { flex: 1, gap: 3 },
  chLabel: { color: "#fff", fontSize: 15, fontWeight: "800" },
  chMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  chDot: { width: 5, height: 5, borderRadius: 3 },
  chStories: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  chArrow: { color: "rgba(255,255,255,0.2)", fontSize: 14 },
  scheduleBtn: { marginTop: 16, marginHorizontal: 16, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  scheduleBtnInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  scheduleBtnEmoji: { fontSize: 28 },
  scheduleBtnTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  scheduleBtnSub: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
});
