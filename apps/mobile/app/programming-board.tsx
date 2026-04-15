import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  SafeAreaView, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import { PERSONAS } from "../src/constants/personas";

const TIME_SLOTS = [
  { id: "early_morning", label: "Wake Up",       time: "5–8am",   emoji: "🌅", defaultMix: { news: 60, tech: 20, entertainment: 0, personal: 20, trending: 0 }, defaultPace: "steady" },
  { id: "morning",       label: "Morning News",  time: "8–11am",  emoji: "☀️", defaultMix: { news: 50, tech: 30, entertainment: 0, personal: 10, trending: 10 }, defaultPace: "steady" },
  { id: "midday",        label: "Lunch Break",   time: "11am–2pm",emoji: "🍕", defaultMix: { news: 20, tech: 20, entertainment: 30, personal: 10, trending: 20 }, defaultPace: "rapid" },
  { id: "afternoon",     label: "Afternoon",     time: "2–5pm",   emoji: "☕", defaultMix: { news: 30, tech: 30, entertainment: 10, personal: 20, trending: 10 }, defaultPace: "steady" },
  { id: "evening",       label: "Evening News",  time: "5–8pm",   emoji: "🌆", defaultMix: { news: 40, tech: 20, entertainment: 10, personal: 20, trending: 10 }, defaultPace: "steady" },
  { id: "prime_time",    label: "Prime Time",    time: "8–11pm",  emoji: "📺", defaultMix: { news: 10, tech: 10, entertainment: 40, personal: 10, trending: 30 }, defaultPace: "deep" },
  { id: "late_night",    label: "Late Night",    time: "11pm–5am",emoji: "🌙", defaultMix: { news: 0, tech: 10, entertainment: 50, personal: 0, trending: 40 }, defaultPace: "rapid" },
];

type MixKey = "news" | "tech" | "entertainment" | "personal" | "trending";
type Pace = "rapid" | "steady" | "deep";

const MIX_LABELS: Record<MixKey, { label: string; emoji: string; color: string }> = {
  news:          { label: "News & Updates",    emoji: "📰", color: "#ef4444" },
  tech:          { label: "Tech & AI",         emoji: "💻", color: "#3b82f6" },
  entertainment: { label: "Entertainment",     emoji: "🎭", color: "#f59e0b" },
  personal:      { label: "My Updates",        emoji: "📊", color: "#8b5cf6" },
  trending:      { label: "Trending",          emoji: "🔥", color: "#ec4899" },
};

const PACE_OPTIONS: Array<{ id: Pace; emoji: string; label: string; desc: string }> = [
  { id: "rapid",  emoji: "⚡", label: "Rapid",  desc: "Auto-advance, 6s per story" },
  { id: "steady", emoji: "🔄", label: "Steady", desc: "Manual scroll, presenter guides" },
  { id: "deep",   emoji: "🔭", label: "Deep",   desc: "Long-form, full context" },
];

const MOOD_OPTIONS = [
  { id: "focused",   emoji: "🎯", label: "Focused" },
  { id: "curious",   emoji: "🧠", label: "Curious" },
  { id: "chill",     emoji: "😌", label: "Chill" },
  { id: "energised", emoji: "⚡", label: "Energised" },
];

interface SlotConfig {
  mix: Record<MixKey, number>;
  pace: Pace;
  mood: string | null;
}

export default function ProgrammingBoardScreen() {
  const { settings } = useAppStore();
  const persona = PERSONAS.find(p => p.id === settings.selectedPersonaId) ?? PERSONAS[0];

  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [configs, setConfigs] = useState<Record<string, SlotConfig>>(() => {
    const initial: Record<string, SlotConfig> = {};
    TIME_SLOTS.forEach(slot => {
      initial[slot.id] = { mix: { ...slot.defaultMix }, pace: slot.defaultPace as Pace, mood: null };
    });
    return initial;
  });

  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -4, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const activeSlot = TIME_SLOTS[activeSlotIdx];
  const config = configs[activeSlot.id];

  const updateMix = (key: MixKey, delta: number) => {
    setConfigs(prev => {
      const slot = { ...prev[activeSlot.id] };
      const newVal = Math.max(0, Math.min(100, slot.mix[key] + delta));
      slot.mix = { ...slot.mix, [key]: newVal };
      return { ...prev, [activeSlot.id]: slot };
    });
  };

  const setPace = (pace: Pace) => {
    setConfigs(prev => ({
      ...prev,
      [activeSlot.id]: { ...prev[activeSlot.id], pace },
    }));
  };

  const setMood = (moodId: string | null) => {
    setConfigs(prev => ({
      ...prev,
      [activeSlot.id]: { ...prev[activeSlot.id], mood: moodId },
    }));
  };

  // Generate presenter preview line
  const topMix = Object.entries(config.mix).sort((a, b) => b[1] - a[1]).filter(([,v]) => v > 0);
  const topLabel = topMix[0] ? MIX_LABELS[topMix[0][0] as MixKey].label : "nothing";
  const paceLabel = PACE_OPTIONS.find(p => p.id === config.pace)?.label ?? "steady";
  const previewLine = `Your ${activeSlot.label.toLowerCase()}: mostly ${topLabel.toLowerCase()}, ${paceLabel.toLowerCase()} pace. ${
    config.mood ? `Tuned for a ${config.mood} vibe.` : "I'll keep it balanced."
  }`;

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎛️ Programming Board</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── TIME SLOTS ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotStrip}>
            {TIME_SLOTS.map((slot, idx) => {
              const isActive = idx === activeSlotIdx;
              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => setActiveSlotIdx(idx)}
                  style={[styles.slotBtn, isActive && styles.slotBtnActive]}
                >
                  <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                  <Text style={[styles.slotLabel, isActive && styles.slotLabelActive]}>{slot.label}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── CONTENT MIX DIALS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTENT MIX</Text>
            {(Object.keys(MIX_LABELS) as MixKey[]).map(key => {
              const info = MIX_LABELS[key];
              const value = config.mix[key];
              return (
                <View key={key} style={styles.dialRow}>
                  <Text style={styles.dialEmoji}>{info.emoji}</Text>
                  <View style={styles.dialInfo}>
                    <Text style={styles.dialLabel}>{info.label}</Text>
                    {/* Track */}
                    <View style={styles.dialTrack}>
                      <View style={[styles.dialFill, { width: `${value}%`, backgroundColor: info.color }]} />
                    </View>
                  </View>
                  <View style={styles.dialControls}>
                    <TouchableOpacity onPress={() => updateMix(key, -10)} style={styles.dialBtn}>
                      <Text style={styles.dialBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dialValue, { color: info.color }]}>{value}%</Text>
                    <TouchableOpacity onPress={() => updateMix(key, 10)} style={styles.dialBtn}>
                      <Text style={styles.dialBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── PACE ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PACE</Text>
            <View style={styles.paceRow}>
              {PACE_OPTIONS.map(p => {
                const isActive = config.pace === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPace(p.id)}
                    style={[styles.paceBtn, isActive && styles.paceBtnActive]}
                  >
                    <Text style={styles.paceEmoji}>{p.emoji}</Text>
                    <Text style={[styles.paceLabel, isActive && styles.paceLabelActive]}>{p.label}</Text>
                    <Text style={styles.paceDesc}>{p.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── MOOD ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOOD OVERRIDE</Text>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map(m => {
                const isActive = config.mood === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setMood(isActive ? null : m.id)}
                    style={[styles.moodBtn, isActive && styles.moodBtnActive]}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, isActive && styles.moodLabelActive]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── PRESENTER PREVIEW ── */}
          <View style={styles.previewSection}>
            <Animated.View style={[styles.previewAvatar, { backgroundColor: persona.accentColor + "20", transform: [{ translateY: floatAnim }] }]}>
              <Text style={styles.previewAvatarEmoji}>{persona.avatarEmoji}</Text>
            </Animated.View>
            <View style={styles.previewBubble}>
              <Text style={styles.previewName}>{persona.name}</Text>
              <Text style={styles.previewLine}>{previewLine}</Text>
            </View>
          </View>

          {/* ── SAVE ── */}
          <Pressable style={styles.saveBtn} onPress={() => router.back()}>
            <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.saveBtnGrad}>
              <Text style={styles.saveBtnText}>💾 Save Programming</Text>
            </LinearGradient>
          </Pressable>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { color: "#6c47ff", fontSize: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },

  // Time slots
  slotStrip: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  slotBtn: { alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", minWidth: 90 },
  slotBtnActive: { backgroundColor: "rgba(108,71,255,0.15)", borderColor: "#6c47ff" },
  slotEmoji: { fontSize: 22 },
  slotLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  slotLabelActive: { color: "#fff" },
  slotTime: { color: "rgba(255,255,255,0.2)", fontSize: 9 },

  // Sections
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 },

  // Content mix dials
  dialRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  dialEmoji: { fontSize: 18, width: 28, textAlign: "center" },
  dialInfo: { flex: 1, gap: 4 },
  dialLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },
  dialTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" },
  dialFill: { height: "100%", borderRadius: 3 },
  dialControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  dialBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  dialBtnText: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "700" },
  dialValue: { fontSize: 14, fontWeight: "900", width: 36, textAlign: "center" },

  // Pace
  paceRow: { flexDirection: "row", gap: 8 },
  paceBtn: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  paceBtnActive: { backgroundColor: "rgba(108,71,255,0.15)", borderColor: "#6c47ff" },
  paceEmoji: { fontSize: 20 },
  paceLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700" },
  paceLabelActive: { color: "#fff" },
  paceDesc: { color: "rgba(255,255,255,0.2)", fontSize: 9, textAlign: "center", paddingHorizontal: 4 },

  // Mood
  moodRow: { flexDirection: "row", gap: 8 },
  moodBtn: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  moodBtnActive: { backgroundColor: "rgba(108,71,255,0.15)", borderColor: "#6c47ff" },
  moodEmoji: { fontSize: 18 },
  moodLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  moodLabelActive: { color: "#fff" },

  // Preview
  previewSection: { marginHorizontal: 16, marginTop: 20, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  previewAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  previewAvatarEmoji: { fontSize: 26 },
  previewBubble: { flex: 1 },
  previewName: { color: "#fff", fontSize: 13, fontWeight: "800" },
  previewLine: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18, marginTop: 2 },

  // Save
  saveBtn: { marginHorizontal: 16, marginTop: 20, borderRadius: 16, overflow: "hidden" },
  saveBtnGrad: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
