import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  SafeAreaView, Animated, Dimensions, Image, Alert, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { PERSONAS } from "../../src/constants/personas";
import { TIME_SLOTS, getActiveSlot, type TimeSlotId } from "@social-tv/shared";

const { width: W } = Dimensions.get("window");

// Mood chips
const MOODS = [
  { id: "focused",   emoji: "🎯", label: "Focused",   color: "#3b82f6" },
  { id: "curious",   emoji: "🧠", label: "Curious",   color: "#8b5cf6" },
  { id: "chill",     emoji: "😌", label: "Chill",     color: "#10b981" },
  { id: "energised", emoji: "⚡", label: "Energised", color: "#f59e0b" },
  { id: "stressed",  emoji: "🫠", label: "Stressed",  color: "#ef4444" },
];

// Placeholder story data for channels
const CHANNEL_STORIES: Record<string, { stories: number; topStory: string }> = {
  "ch-foryou": { stories: 12, topStory: "Your AI post is going viral — 2.4K likes" },
  "ch-tech": { stories: 15, topStory: "React Native 0.78 ships new architecture" },
  "ch-trending": { stories: 8, topStory: "OpenAI announces GPT-5" },
  "ch-entertainment": { stories: 10, topStory: "New music video just dropped" },
  "ch-business": { stories: 7, topStory: "Markets surge as Fed signals rate pause" },
  "ch-myupdates": { stories: 5, topStory: "15 profile views this week" },
};
const DEFAULT_STORY = { stories: 3, topStory: "New stories incoming..." };

// Quick programme formats
const QUICK_PROGRAMMES = [
  { id: "top10",     emoji: "🔢", label: "Top 10",         sub: "1 min",    route: "/formats/top10_quick",          color: "#6c47ff" },
  { id: "breaking",  emoji: "🔴", label: "Breaking",       sub: "Live",     route: "/formats/breaking_news",        color: "#ef4444" },
  { id: "flash",     emoji: "⚡", label: "Flash Brief",    sub: "2 min",    route: "/bulletin/flash",               color: "#f59e0b" },
  { id: "friends",   emoji: "👥", label: "Friends",        sub: "Updates",  route: "/formats/previously_on",        color: "#10b981" },
  { id: "100in100",  emoji: "🚀", label: "100 in 100",     sub: "100 sec",  route: "/bulletin/hundred_in_hundred",  color: "#ec4899" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: "Late Night", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "☕" };
  if (h < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Late Night", emoji: "🌙" };
}

export default function DirectorsDeskScreen() {
  const { settings, customChannels, reorderCustomChannels } = useAppStore();
  const channels = customChannels.filter(c => c.enabled).sort((a, b) => a.position - b.position);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [timeBudget, setTimeBudget] = useState<number | null>(null); // minutes
  const [budgetStartedAt, setBudgetStartedAt] = useState<number | null>(null);

  const notifyTimeUp = (minutes: number) => {
    const msg = `That's your ${minutes} min — ${minutes < 5 ? "quick check done." : "wrapping up?"}`;
    if (Platform.OS === "web") {
      // Native Alert is unstyled on web; use a confirm() for the extend prompt.
      const extend = globalThis.confirm?.(msg + "\n\nExtend by 5 min?");
      if (extend) {
        setTimeBudget(5);
        setBudgetStartedAt(Date.now());
      } else {
        setTimeBudget(null);
        setBudgetStartedAt(null);
      }
      return;
    }
    Alert.alert("Time's up", msg, [
      { text: "Extend 5 min", onPress: () => { setTimeBudget(5); setBudgetStartedAt(Date.now()); } },
      { text: "Done", style: "cancel", onPress: () => { setTimeBudget(null); setBudgetStartedAt(null); } },
    ]);
  };

  useEffect(() => {
    if (!timeBudget || timeBudget <= 0 || !budgetStartedAt) return;
    const ms = timeBudget * 60 * 1000;
    const id = setTimeout(() => notifyTimeUp(timeBudget), ms);
    return () => clearTimeout(id);
  }, [timeBudget, budgetStartedAt]);

  const pickBudget = (m: number) => {
    const isActive = timeBudget === m;
    if (isActive) {
      setTimeBudget(null);
      setBudgetStartedAt(null);
    } else {
      setTimeBudget(m);
      setBudgetStartedAt(m > 0 ? Date.now() : null);
    }
  };

  // Time-slot filter — initializes to the currently-live slot and re-syncs every minute.
  const [activeSlotId, setActiveSlotId] = useState<TimeSlotId>(() => getActiveSlot().id);
  useEffect(() => {
    const id = setInterval(() => setActiveSlotId(getActiveSlot().id), 60_000);
    return () => clearInterval(id);
  }, []);
  const activeSlot = TIME_SLOTS.find(s => s.id === activeSlotId) ?? TIME_SLOTS[0];
  const liveSlotId = getActiveSlot().id;

  const persona = PERSONAS.find(p => p.id === settings.selectedPersonaId) ?? PERSONAS[0];
  const greeting = getGreeting();
  const activeChannel = channels[activeChannelIdx] ?? channels[0];
  const activeStory = activeChannel ? (CHANNEL_STORIES[activeChannel.id] ?? DEFAULT_STORY) : DEFAULT_STORY;

  // Presenter
  const floatAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef(Array.from({length: 12}, () => new Animated.Value(4))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const anims = waveAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 4 + Math.random() * 14, duration: 300 + i * 50, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 4, duration: 300 + i * 50, useNativeDriver: false }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  const presenterLine = selectedMood
    ? `${MOODS.find(m => m.id === selectedMood)?.emoji} Tuning your station for a ${selectedMood} vibe.`
    : `Your station is ready. What are we watching?`;

  const moveChannel = (idx: number, dir: "up" | "down") => {
    const sorted = [...channels];
    if (dir === "up" && idx > 0) {
      [sorted[idx], sorted[idx - 1]] = [sorted[idx - 1], sorted[idx]];
      if (activeChannelIdx === idx) setActiveChannelIdx(idx - 1);
    } else if (dir === "down" && idx < sorted.length - 1) {
      [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
      if (activeChannelIdx === idx) setActiveChannelIdx(idx + 1);
    } else {
      return;
    }
    const reordered = sorted.map((ch, i) => ({ ...ch, position: i }));
    reorderCustomChannels(reordered);
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting.emoji} {greeting.text}</Text>
              <Text style={styles.subGreeting}>Your station, your rules</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable onPress={() => router.push("/programming-board" as any)} hitSlop={8}>
                <Text style={styles.headerIcon}>🎛️</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/channels" as any)} hitSlop={8}>
                <Text style={styles.headerIcon}>📺</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const keys = [null, ...MOODS.map(m => m.id)];
                  const next = keys[(keys.indexOf(selectedMood) + 1) % keys.length];
                  setSelectedMood(next);
                }}
                hitSlop={8}
              >
                <Text style={styles.headerIcon}>
                  {selectedMood ? MOODS.find(m => m.id === selectedMood)?.emoji : "🎭"}
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push("/onboarding" as any)}>
                <Text style={styles.presenterChip}>{persona.avatarEmoji}</Text>
              </Pressable>
            </View>
          </View>

          {/* ── TIME BUDGET ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HOW MUCH TIME DO YOU HAVE?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.budgetRow}>
              {[
                { m: 1,  label: "1 min",  emoji: "⚡" },
                { m: 5,  label: "5 min",  emoji: "☕" },
                { m: 15, label: "15 min", emoji: "📺" },
                { m: 30, label: "30 min", emoji: "🛋️" },
                { m: 0,  label: "Full",   emoji: "🎬" },
              ].map(b => {
                const isActive = timeBudget === b.m;
                return (
                  <Pressable
                    key={b.m}
                    onPress={() => pickBudget(b.m)}
                    style={[styles.budgetChip, isActive && styles.budgetChipActive]}
                  >
                    <Text style={styles.budgetEmoji}>{b.emoji}</Text>
                    <Text style={[styles.budgetLabel, isActive && { color: "#fff" }]}>{b.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── TILES (iPhone-style grid) ── */}
          <View style={styles.tileGrid}>
            {QUICK_PROGRAMMES.map(prog => (
              <Pressable key={prog.id} style={styles.tileWrap} onPress={() => router.push(prog.route as any)}>
                <LinearGradient colors={[prog.color + "30", prog.color + "10"]} style={styles.tile}>
                  <Text style={styles.tileEmoji}>{prog.emoji}</Text>
                  <Text style={styles.tileLabel}>{prog.label}</Text>
                  <Text style={styles.tileSub}>{prog.sub}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          {/* dock rendered globally via _layout.tsx → BottomDock */}
          <View style={{ height: 180 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 12 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "900" },
  subGreeting: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  editBtnActive: { backgroundColor: "rgba(108,71,255,0.3)", borderColor: "#6c47ff" },
  editBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  presenterChip: { fontSize: 28 },

  // Presenter
  presenterSection: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  presenterRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  presenterAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  presenterAvatarEmoji: { fontSize: 30 },
  presenterInfo: { flex: 1 },
  presenterName: { color: "#fff", fontSize: 14, fontWeight: "800" },
  presenterLine: { color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 18, marginTop: 2 },
  waveRow: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 18, marginTop: 10, paddingHorizontal: 4 },
  waveBar: { width: 3, borderRadius: 2, minHeight: 4 },

  // Live Preview
  livePreview: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  livePreviewGrad: { padding: 20, gap: 10 },
  liveHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveChannelBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveLabel: { color: "#ef4444", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  liveChannelName: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },
  liveHeadline: { color: "#fff", fontSize: 20, fontWeight: "800", lineHeight: 26 },
  liveStoryCount: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  goLiveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  goLiveText: { color: "#fff", fontSize: 15, fontWeight: "900", letterSpacing: 1 },

  // Channel switcher
  switcherStrip: { paddingHorizontal: 16, gap: 8, paddingVertical: 14 },
  switcherBtn: { alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)", minWidth: 70 },
  switcherEmoji: { fontSize: 20 },
  switcherLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "700" },
  switcherDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  // Sections
  section: { marginTop: 8, paddingHorizontal: 16 },
  sectionTitle: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },

  // Mood
  moodRow: { gap: 8, paddingRight: 16 },
  moodChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  moodEmoji: { fontSize: 16 },
  moodLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },

  // Time budget
  budgetRow: { gap: 8, paddingRight: 16 },
  budgetChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  budgetChipActive: { backgroundColor: "rgba(108,71,255,0.2)", borderColor: "#6c47ff" },
  budgetEmoji: { fontSize: 15 },
  budgetLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },

  // Quick programmes (legacy — still used by channel list)
  progHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconRow: { flexDirection: "row", gap: 14 },
  headerIcon: { fontSize: 18, opacity: 0.7 },
  progRow: { gap: 10, paddingRight: 16 },
  progCard: { width: 100, padding: 14, borderRadius: 14, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  progEmoji: { fontSize: 22 },
  progLabel: { color: "#fff", fontSize: 12, fontWeight: "800" },
  progSub: { color: "rgba(255,255,255,0.3)", fontSize: 10 },

  // Tile grid (iPhone-style home)
  tileGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginTop: 16, gap: 12, justifyContent: "center" },
  tileWrap: { width: "30%", aspectRatio: 1, maxWidth: 120 },
  tile: { flex: 1, padding: 14, borderRadius: 20, gap: 6, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  tileEmoji: { fontSize: 32 },
  tileLabel: { color: "#fff", fontSize: 14, fontWeight: "800" },
  tileSub: { color: "rgba(255,255,255,0.4)", fontSize: 11 },

  // Channel lineup
  channelRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 6, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  chNum: { color: "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: "900", width: 28, textAlign: "center" },
  chIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chIconEmoji: { fontSize: 16 },
  chInfo: { flex: 1, gap: 2 },
  chName: { color: "#fff", fontSize: 13, fontWeight: "800" },
  chPreview: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  chMeta: { alignItems: "center", gap: 4 },
  chCount: { fontSize: 16, fontWeight: "900" },
  chLive: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  chLiveDot: { width: 5, height: 5, borderRadius: 3 },
  reorderBtns: { flexDirection: "row", gap: 6 },
  reorderBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  reorderText: { color: "rgba(255,255,255,0.4)", fontSize: 12 },

  // New channel button
  newChannelBtn: { marginTop: 6, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(108,71,255,0.2)", borderStyle: "dashed" },
  newChannelBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  newChannelPlus: { color: "#6c47ff", fontSize: 20, fontWeight: "700" },
  newChannelText: { color: "#6c47ff", fontSize: 13, fontWeight: "800" },

  // Time slots
  slotHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  slotNow: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" },
  slotRow: { gap: 8, paddingRight: 16 },
  slotCard: { minWidth: 100, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "flex-start", gap: 4, position: "relative" },
  slotCardActive: { borderColor: "#6c47ff", backgroundColor: "rgba(108,71,255,0.12)" },
  slotCardLive: { borderColor: "#10b981" },
  slotLiveDot: { position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
  slotEmoji: { fontSize: 20 },
  slotLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "800" },
  slotTime: { color: "rgba(255,255,255,0.35)", fontSize: 10 },

  // Bottom shortcuts
  shortcuts: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 20, paddingHorizontal: 16 },
  shortcutBtn: { alignItems: "center", gap: 6, padding: 12 },
  shortcutEmoji: { fontSize: 22 },
  shortcutLabel: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "700" },
});
