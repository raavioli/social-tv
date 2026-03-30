import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import {
  PROGRAMMING_CLOCK,
  getSlotForHour,
  getRecommendedFormat,
  getTodaySchedule,
  TV_FORMATS,
} from "@social-tv/shared";
import { useAppStore } from "../../src/store/useAppStore";

// Format routes for direct navigation
const FORMAT_ROUTES: Record<string, string> = {
  breaking_news:    "/formats/breaking_news",
  previously_on:    "/formats/previously_on",
  live_feed:        "/formats/live_feed",
  late_night:       "/formats/late_night",
  documentary:      "/formats/documentary",
  highlight_reel:   "/formats/highlight_reel",
};

const MOODS = [
  { id: "focused",   emoji: "🎯", label: "Focused",   color: "#6c47ff" },
  { id: "curious",   emoji: "🔍", label: "Curious",   color: "#0891b2" },
  { id: "chill",     emoji: "😌", label: "Chill",     color: "#10b981" },
  { id: "stressed",  emoji: "😤", label: "Stressed",  color: "#ef4444" },
  { id: "energised", emoji: "⚡", label: "Energised", color: "#f59e0b" },
];

function launchFormat(formatId: string) {
  const route = FORMAT_ROUTES[formatId];
  if (route) {
    router.push(route as any);
  } else {
    router.push({ pathname: "/bulletin/[formatId]", params: { formatId } });
  }
}

export default function NowShowingScreen() {
  const [now, setNow] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { settings } = useAppStore();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const currentSlot = getSlotForHour(hour);
  const recommendedFormatId = getRecommendedFormat(hour, selectedMood ?? undefined);
  const recommendedFormat = TV_FORMATS.find(f => f.id === recommendedFormatId);
  const todaySchedule = getTodaySchedule(selectedMood ?? undefined);

  const greeting =
    hour < 6 ? "Still up?" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  const mood = MOODS.find(m => m.id === selectedMood);

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.slotLabel}>{currentSlot.emoji} {currentSlot.label} · {currentSlot.tvAnalogy}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/programming")} style={styles.programmeBtn}>
              <Text style={styles.programmeBtnText}>📋 Programme</Text>
            </TouchableOpacity>
          </View>

          {/* Mood selector */}
          <Text style={styles.sectionLabel}>How are you feeling?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.moodBtn, selectedMood === m.id && { backgroundColor: `${m.color}33`, borderColor: m.color }]}
                onPress={() => setSelectedMood(prev => prev === m.id ? null : m.id)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === m.id && { color: "#fff" }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* NOW SHOWING — big CTA */}
          <Text style={styles.sectionLabel}>On now</Text>
          {recommendedFormat && (
            <TouchableOpacity onPress={() => launchFormat(recommendedFormatId)} activeOpacity={0.85}>
              <LinearGradient
                colors={["rgba(108,71,255,0.5)", "rgba(168,85,247,0.2)"]}
                style={styles.nowCard}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={styles.nowTop}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>NOW SHOWING</Text>
                  </View>
                  {mood && (
                    <View style={[styles.moodTag, { backgroundColor: `${mood.color}33` }]}>
                      <Text style={[styles.moodTagText, { color: mood.color }]}>{mood.emoji} {mood.label}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.nowEmoji}>{recommendedFormat.emoji}</Text>
                <Text style={styles.nowName}>{recommendedFormat.name}</Text>
                <Text style={styles.nowAnalogy}>{recommendedFormat.tvAnalogy}</Text>
                <Text style={styles.nowTone}>{currentSlot.tone}</Text>
                <View style={styles.nowMeta}>
                  <Text style={styles.nowMetaText}>{recommendedFormat.minMinutes}–{recommendedFormat.maxMinutes} min</Text>
                  <Text style={styles.nowMetaDot}>·</Text>
                  <Text style={styles.nowMetaText}>{recommendedFormat.storyCount} stories</Text>
                  <Text style={styles.nowMetaDot}>·</Text>
                  <Text style={styles.nowMetaText}>{recommendedFormat.pacing} pace</Text>
                </View>
                <View style={styles.watchBtn}>
                  <Text style={styles.watchBtnText}>▶ Watch Now</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Today's schedule — TV Guide style */}
          <Text style={styles.sectionLabel}>Today's schedule</Text>
          {todaySchedule.map(slot => {
            const fmt = TV_FORMATS.find(f => f.id === slot.recommendedFormat);
            const isCurrent = slot.id === currentSlot.id;
            const startHour = slot.hours[0];
            const isUpcoming = startHour > hour;
            const isPast = slot.hours[1] < hour;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[styles.slotRow, isCurrent && styles.slotRowCurrent, isPast && styles.slotRowPast]}
                onPress={() => launchFormat(slot.recommendedFormat)}
                activeOpacity={0.7}
              >
                {/* Time column */}
                <View style={styles.slotTime}>
                  <Text style={[styles.slotTimeText, isCurrent && styles.slotTimeTextCurrent]}>
                    {startHour === 0 ? "12am" : startHour < 12 ? `${startHour}am` : startHour === 12 ? "12pm" : `${startHour - 12}pm`}
                  </Text>
                </View>

                {/* Content */}
                <BlurView intensity={isCurrent ? 30 : 15} tint="dark" style={[styles.slotCard, isCurrent && styles.slotCardCurrent]}>
                  <View style={styles.slotCardInner}>
                    <View style={styles.slotLeft}>
                      <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                      <View>
                        <Text style={[styles.slotName, isPast && styles.slotNamePast]}>{slot.label}</Text>
                        <Text style={styles.slotFmt}>{fmt?.emoji} {fmt?.name}</Text>
                      </View>
                    </View>
                    <View style={styles.slotRight}>
                      <Text style={styles.slotDuration}>{slot.durationMinutes}m</Text>
                      {isCurrent && <View style={styles.onAirDot} />}
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}

          {/* Quick access formats */}
          <Text style={styles.sectionLabel}>Quick access</Text>
          <View style={styles.quickGrid}>
            {[
              { id: "flash_briefing",   emoji: "⚡", label: "Flash" },
              { id: "hundred_in_hundred", emoji: "🚀", label: "100 in 100" },
              { id: "speed_round",      emoji: "💨", label: "Speed Round" },
              { id: "breaking_news",    emoji: "🔴", label: "Breaking" },
              { id: "previously_on",    emoji: "⏮️", label: "Catch Up" },
              { id: "live_feed",        emoji: "📡", label: "Live" },
            ].map(item => (
              <TouchableOpacity key={item.id} style={styles.quickBtn} onPress={() => launchFormat(item.id)}>
                <Text style={styles.quickEmoji}>{item.emoji}</Text>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 12, paddingBottom: 4 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "900" },
  slotLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  programmeBtn: { backgroundColor: "rgba(108,71,255,0.25)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(108,71,255,0.4)" },
  programmeBtnText: { color: "#a78bfa", fontSize: 12, fontWeight: "700" },
  sectionLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginTop: 20, marginBottom: 8 },
  moodRow: { gap: 8, paddingBottom: 4 },
  moodBtn: { alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "transparent", gap: 3 },
  moodEmoji: { fontSize: 20 },
  moodLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  nowCard: { borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(108,71,255,0.3)", gap: 8 },
  nowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6c47ff" },
  liveText: { color: "#a78bfa", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  moodTag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  moodTagText: { fontSize: 11, fontWeight: "800" },
  nowEmoji: { fontSize: 40 },
  nowName: { color: "#fff", fontSize: 26, fontWeight: "900" },
  nowAnalogy: { color: "rgba(255,255,255,0.45)", fontSize: 13 },
  nowTone: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  nowMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  nowMetaText: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
  nowMetaDot: { color: "rgba(255,255,255,0.2)" },
  watchBtn: { backgroundColor: "#6c47ff", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  watchBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  slotRowCurrent: {},
  slotRowPast: { opacity: 0.35 },
  slotTime: { width: 44, alignItems: "flex-end" },
  slotTimeText: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "700" },
  slotTimeTextCurrent: { color: "#6c47ff" },
  slotCard: { flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  slotCardCurrent: { borderColor: "rgba(108,71,255,0.4)" },
  slotCardInner: { padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  slotLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  slotEmoji: { fontSize: 18 },
  slotName: { color: "#fff", fontSize: 13, fontWeight: "700" },
  slotNamePast: { color: "rgba(255,255,255,0.4)" },
  slotFmt: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 1 },
  slotRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  slotDuration: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  onAirDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6c47ff" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickBtn: { width: "30%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  quickEmoji: { fontSize: 22 },
  quickLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textAlign: "center" },
});
