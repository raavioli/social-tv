import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, SafeAreaView, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// BlurView replaced with View for Android compatibility
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

// ─── Quick Programmes (user can toggle on/off, reorder) ─────────────────────
const DEFAULT_PROGRAMMES = [
  { id: "top10",          emoji: "🔢", label: "Top 10 Stories",      sub: "1 min · All platforms",  route: "/formats/top10_quick",    color: "#6c47ff", enabled: true },
  { id: "breaking",       emoji: "🔴", label: "Breaking Now",        sub: "Live updates",           route: "/formats/breaking_news",  color: "#ef4444", enabled: true },
  { id: "close_friends",  emoji: "👥", label: "Close Friends",       sub: "People you care about",  route: "/formats/previously_on",  color: "#10b981", enabled: true },
  { id: "your_updates",   emoji: "📊", label: "Your Updates",        sub: "How your content is doing", route: "/formats/previously_on", color: "#8b5cf6", enabled: true },
  { id: "flash",          emoji: "⚡", label: "Flash Briefing",      sub: "2 min catch-up",         route: "/bulletin/flash",         color: "#f59e0b", enabled: true },
  { id: "100in100",       emoji: "🚀", label: "100 in 100",          sub: "100 headlines, 100 sec", route: "/bulletin/hundred_in_hundred", color: "#ec4899", enabled: false },
  { id: "deep_dive",      emoji: "🔭", label: "Deep Dive",           sub: "Long-form analysis",     route: "/formats/previously_on",  color: "#0ea5e9", enabled: false },
  { id: "late_night",     emoji: "🌙", label: "Late Night",          sub: "Viral & funny",          route: "/formats/live_feed",      color: "#a855f7", enabled: false },
];

// ─── Topic Channels (user can toggle, reorder, assign presenter) ────────────
const DEFAULT_CHANNELS = [
  { id: "tech",          emoji: "💻", label: "Tech & AI",      stories: 15, color: "#3b82f6", enabled: true,  priority: 1 },
  { id: "entertainment", emoji: "🎭", label: "Entertainment",  stories: 10, color: "#f59e0b", enabled: true,  priority: 2 },
  { id: "business",      emoji: "💼", label: "Business",       stories: 7,  color: "#0ea5e9", enabled: true,  priority: 3 },
  { id: "sports",        emoji: "🏆", label: "Sports",         stories: 6,  color: "#22c55e", enabled: false, priority: 4 },
  { id: "lifestyle",     emoji: "🌿", label: "Lifestyle",      stories: 9,  color: "#10b981", enabled: true,  priority: 5 },
  { id: "trending",      emoji: "🔥", label: "Trending",       stories: 8,  color: "#ef4444", enabled: true,  priority: 6 },
  { id: "science",       emoji: "🔬", label: "Science",        stories: 4,  color: "#6366f1", enabled: false, priority: 7 },
  { id: "gaming",        emoji: "🎮", label: "Gaming",         stories: 5,  color: "#14b8a6", enabled: false, priority: 8 },
  { id: "politics",      emoji: "🏛️", label: "Politics",       stories: 3,  color: "#64748b", enabled: false, priority: 9 },
  { id: "food",          emoji: "🍕", label: "Food & Drink",   stories: 6,  color: "#f97316", enabled: false, priority: 10 },
];

export default function ControlCenterScreen() {
  const { settings } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState(DEFAULT_PROGRAMMES);
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [editMode, setEditMode] = useState(false);

  const timeSlot = getTimeSlot();
  const persona = PERSONAS.find(p => p.id === settings.selectedPersonaId) ?? PERSONAS[0];

  const enabledChannels = channels.filter(c => c.enabled).sort((a, b) => a.priority - b.priority);
  const disabledChannels = channels.filter(c => !c.enabled);
  const enabledProgrammes = programmes.filter(p => p.enabled);
  const disabledProgrammes = programmes.filter(p => !p.enabled);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleProgramme = (id: string) => {
    setProgrammes(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const moveChannel = (id: string, dir: "up" | "down") => {
    setChannels(prev => {
      const enabled = prev.filter(c => c.enabled).sort((a, b) => a.priority - b.priority);
      const idx = enabled.findIndex(c => c.id === id);
      if (dir === "up" && idx > 0) {
        const temp = enabled[idx].priority;
        enabled[idx].priority = enabled[idx - 1].priority;
        enabled[idx - 1].priority = temp;
      } else if (dir === "down" && idx < enabled.length - 1) {
        const temp = enabled[idx].priority;
        enabled[idx].priority = enabled[idx + 1].priority;
        enabled[idx + 1].priority = temp;
      }
      return prev.map(c => {
        const updated = enabled.find(e => e.id === c.id);
        return updated ? { ...c, priority: updated.priority } : c;
      });
    });
  };

  const presenterLine = selectedMood
    ? `${MOODS.find(m => m.id === selectedMood)?.emoji} Got it — tuning your lineup for a ${selectedMood} vibe.`
    : editMode
    ? "You're the director. Set up your station however you like."
    : `It's ${timeSlot.label} time. Your lineup is ready — tap to go live.`;

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
            <TouchableOpacity
              onPress={() => setEditMode(!editMode)}
              style={[styles.editBtn, editMode && styles.editBtnActive]}
            >
              <Text style={styles.editBtnText}>{editMode ? "✓ Done" : "✏️ Edit"}</Text>
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
            <Text style={styles.sectionTitle}>YOUR MOOD RIGHT NOW</Text>
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

          {/* Quick Programmes — GO LIVE buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR PROGRAMMES</Text>
            <View style={styles.quickGrid}>
              {enabledProgrammes.map(prog => (
                <Pressable
                  key={prog.id}
                  style={styles.quickCard}
                  onPress={() => editMode ? toggleProgramme(prog.id) : router.push(prog.route as any)}
                >
                  <LinearGradient
                    colors={[prog.color + "25", prog.color + "08"]}
                    style={styles.quickCardGrad}
                  >
                    {editMode && (
                      <View style={[styles.removeBadge, { backgroundColor: "#ef4444" }]}>
                        <Text style={styles.removeBadgeText}>−</Text>
                      </View>
                    )}
                    <Text style={styles.quickEmoji}>{prog.emoji}</Text>
                    <Text style={styles.quickLabel}>{prog.label}</Text>
                    <Text style={styles.quickSub}>{prog.sub}</Text>
                    {!editMode && (
                      <View style={[styles.goLivePill, { backgroundColor: prog.color + "30" }]}>
                        <Text style={[styles.goLiveText, { color: prog.color }]}>GO LIVE ▶</Text>
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            {/* Add more programmes (edit mode) */}
            {editMode && disabledProgrammes.length > 0 && (
              <View style={styles.addSection}>
                <Text style={styles.addLabel}>ADD PROGRAMMES</Text>
                <View style={styles.quickGrid}>
                  {disabledProgrammes.map(prog => (
                    <TouchableOpacity
                      key={prog.id}
                      style={[styles.quickCard, { opacity: 0.5 }]}
                      onPress={() => toggleProgramme(prog.id)}
                    >
                      <View style={styles.quickCardGrad}>
                        <View style={[styles.addBadge, { backgroundColor: "#22c55e" }]}>
                          <Text style={styles.addBadgeText}>+</Text>
                        </View>
                        <Text style={styles.quickEmoji}>{prog.emoji}</Text>
                        <Text style={styles.quickLabel}>{prog.label}</Text>
                        <Text style={styles.quickSub}>{prog.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Topic Channels — the user's lineup */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR CHANNELS</Text>
            {enabledChannels.map((ch, idx) => (
              <Pressable
                key={ch.id}
                onPress={() => !editMode && router.push({ pathname: "/(tabs)/now", params: { channel: ch.id } } as any)}
                style={styles.channelCard}
              >
                <View style={[styles.channelCardInner, { backgroundColor: "rgba(20,20,35,0.9)" }]}>
                  {/* Channel number */}
                  <Text style={styles.chNumber}>CH{idx + 1}</Text>

                  <LinearGradient colors={[ch.color, ch.color + "88"]} style={styles.chBadge}>
                    <Text style={styles.chEmoji}>{ch.emoji}</Text>
                  </LinearGradient>

                  <View style={styles.chInfo}>
                    <Text style={styles.chLabel}>{ch.label}</Text>
                    <Text style={styles.chStories}>{ch.stories} stories ready</Text>
                  </View>

                  {editMode ? (
                    <View style={styles.editControls}>
                      <TouchableOpacity onPress={() => moveChannel(ch.id, "up")} style={styles.moveBtn}>
                        <Text style={styles.moveBtnText}>▲</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveChannel(ch.id, "down")} style={styles.moveBtn}>
                        <Text style={styles.moveBtnText}>▼</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleChannel(ch.id)} style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.liveIndicator, { backgroundColor: ch.color + "20" }]}>
                      <View style={[styles.liveDotSmall, { backgroundColor: ch.color }]} />
                      <Text style={[styles.liveSmallText, { color: ch.color }]}>LIVE</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}

            {/* Add more channels (edit mode) */}
            {editMode && disabledChannels.length > 0 && (
              <View style={styles.addSection}>
                <Text style={styles.addLabel}>ADD CHANNELS</Text>
                {disabledChannels.map(ch => (
                  <Pressable
                    key={ch.id}
                    style={[styles.channelCard, { opacity: 0.4 }]}
                    onPress={() => toggleChannel(ch.id)}
                  >
                    <View style={[styles.channelCardInner, { backgroundColor: "rgba(20,20,35,0.7)" }]}>
                      <View style={[styles.addBadgeSmall, { backgroundColor: "#22c55e" }]}>
                        <Text style={styles.addBadgeText}>+</Text>
                      </View>
                      <LinearGradient colors={[ch.color, ch.color + "88"]} style={styles.chBadge}>
                        <Text style={styles.chEmoji}>{ch.emoji}</Text>
                      </LinearGradient>
                      <View style={styles.chInfo}>
                        <Text style={styles.chLabel}>{ch.label}</Text>
                        <Text style={styles.chStories}>{ch.stories} stories</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Presenter picker shortcut */}
          <Pressable
            style={styles.presenterPicker}
            onPress={() => router.push("/onboarding" as any)}
          >
            <View style={[styles.presenterPickerInner, { backgroundColor: "rgba(20,20,35,0.9)" }]}>
              <Text style={styles.presenterPickerEmoji}>{persona.avatarEmoji}</Text>
              <View style={styles.presenterPickerInfo}>
                <Text style={styles.presenterPickerTitle}>Your presenter: {persona.name}</Text>
                <Text style={styles.presenterPickerSub}>Tap to change who delivers your news</Text>
              </View>
              <Text style={styles.presenterPickerArrow}>→</Text>
            </View>
          </Pressable>

          {/* Schedule shortcut */}
          <Pressable
            style={styles.scheduleBtn}
            onPress={() => router.push("/programming" as any)}
          >
            <View style={[styles.scheduleBtnInner, { backgroundColor: "rgba(20,20,35,0.9)" }]}>
              <Text style={styles.scheduleBtnEmoji}>📋</Text>
              <View>
                <Text style={styles.scheduleBtnTitle}>My Schedule</Text>
                <Text style={styles.scheduleBtnSub}>Set up daily auto-programming</Text>
              </View>
            </View>
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
  scroll: { paddingBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "900" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  timeEmoji: { fontSize: 16 },
  timeLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#ef4444" },
  liveText: { color: "#ef4444", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  editBtnActive: { backgroundColor: "rgba(108,71,255,0.3)", borderColor: "#6c47ff" },
  editBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700" },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  moodRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  moodEmoji: { fontSize: 16 },
  moodLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: { width: "47%", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  quickCardGrad: { padding: 16, minHeight: 110, justifyContent: "flex-end", gap: 4 },
  quickEmoji: { fontSize: 24, marginBottom: 4 },
  quickLabel: { color: "#fff", fontSize: 14, fontWeight: "800" },
  quickSub: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
  goLivePill: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  goLiveText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  removeBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  removeBadgeText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  addBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  addBadgeText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  addSection: { marginTop: 16 },
  addLabel: { color: "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  channelCard: { marginBottom: 8, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  channelCardInner: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  chNumber: { color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: "900", letterSpacing: 1, width: 28 },
  chBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chEmoji: { fontSize: 18 },
  chInfo: { flex: 1, gap: 2 },
  chLabel: { color: "#fff", fontSize: 14, fontWeight: "800" },
  chStories: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  liveDotSmall: { width: 4, height: 4, borderRadius: 2 },
  liveSmallText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  editControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  moveBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  moveBtnText: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center" },
  removeBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "800" },
  addBadgeSmall: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  presenterPicker: { marginTop: 16, marginHorizontal: 16, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  presenterPickerInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  presenterPickerEmoji: { fontSize: 28 },
  presenterPickerInfo: { flex: 1 },
  presenterPickerTitle: { color: "#fff", fontSize: 14, fontWeight: "800" },
  presenterPickerSub: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
  presenterPickerArrow: { color: "rgba(255,255,255,0.2)", fontSize: 18 },
  scheduleBtn: { marginTop: 10, marginHorizontal: 16, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  scheduleBtnInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  scheduleBtnEmoji: { fontSize: 28 },
  scheduleBtnTitle: { color: "#fff", fontSize: 14, fontWeight: "800" },
  scheduleBtnSub: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
});
