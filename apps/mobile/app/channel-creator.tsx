import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Pressable, SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore, CustomChannel } from "../src/store/useAppStore";

const TOPIC_OPTIONS = [
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "ai", label: "AI", emoji: "🤖" },
  { id: "programming", label: "Dev", emoji: "👨‍💻" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "finance", label: "Finance", emoji: "📈" },
  { id: "career", label: "Career", emoji: "🧑‍💼" },
  { id: "sports", label: "Sports", emoji: "🏆" },
  { id: "entertainment", label: "Entertainment", emoji: "🎭" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🌿" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "trending", label: "Trending", emoji: "🔥" },
  { id: "politics", label: "Politics", emoji: "🏛️" },
];

const EMOJI_OPTIONS = ["⭐", "💻", "🔥", "🎭", "💼", "🏆", "🌿", "🎵", "🔬", "🎮", "🍕", "✈️", "📊", "👥", "🎯", "🌙", "☀️", "🚀", "💡", "🎨"];

const COLOR_OPTIONS = ["#6c47ff", "#3b82f6", "#ef4444", "#f59e0b", "#0ea5e9", "#22c55e", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#14b8a6"];

const PLATFORM_OPTIONS = ["twitter", "instagram", "youtube", "linkedin"];

const MOOD_OPTIONS = [
  { id: "focused", label: "Focused", emoji: "🎯" },
  { id: "curious", label: "Curious", emoji: "🧠" },
  { id: "chill", label: "Chill", emoji: "😌" },
  { id: "energised", label: "Energised", emoji: "⚡" },
  { id: "stressed", label: "Stressed", emoji: "🫠" },
];

const SORT_OPTIONS: Array<{ id: CustomChannel["sortBy"]; label: string }> = [
  { id: "relevance", label: "Relevance" },
  { id: "recent", label: "Most Recent" },
  { id: "engagement", label: "Top Engagement" },
];

export default function ChannelCreatorScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { customChannels, addCustomChannel, updateCustomChannel } = useAppStore();

  const existing = editId ? customChannels.find(c => c.id === editId) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [emoji, setEmoji] = useState(existing?.emoji ?? "⭐");
  const [color, setColor] = useState(existing?.color ?? "#6c47ff");
  const [topics, setTopics] = useState<string[]>(existing?.topics ?? []);
  const [keywords, setKeywords] = useState<string[]>(existing?.keywords ?? []);
  const [muteKeywords, setMuteKeywords] = useState<string[]>(existing?.muteKeywords ?? []);
  const [people, setPeople] = useState<string[]>(existing?.people ?? []);
  const [platforms, setPlatforms] = useState<string[]>(existing?.platforms ?? []);
  const [mood, setMood] = useState<string | null>(existing?.mood ?? null);
  const [sortBy, setSortBy] = useState<CustomChannel["sortBy"]>(existing?.sortBy ?? "relevance");

  const [kwInput, setKwInput] = useState("");
  const [muteInput, setMuteInput] = useState("");
  const [personInput, setPersonInput] = useState("");

  const toggleTopic = (id: string) => setTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const togglePlatform = (id: string) => setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const addKeyword = () => { if (kwInput.trim()) { setKeywords(prev => [...prev, kwInput.trim()]); setKwInput(""); } };
  const addMuteKw = () => { if (muteInput.trim()) { setMuteKeywords(prev => [...prev, muteInput.trim()]); setMuteInput(""); } };
  const addPerson = () => {
    if (personInput.trim()) {
      const handle = personInput.trim().startsWith("@") ? personInput.trim() : "@" + personInput.trim();
      setPeople(prev => [...prev, handle]);
      setPersonInput("");
    }
  };

  const save = () => {
    if (!name.trim()) return;
    const channel: CustomChannel = {
      id: existing?.id ?? `ch-${Date.now()}`,
      name: name.trim(),
      emoji, color, topics, keywords, muteKeywords, people, platforms,
      mood, sortBy,
      enabled: true,
      position: existing?.position ?? customChannels.length,
    };
    if (existing) {
      updateCustomChannel(channel.id, channel);
    } else {
      addCustomChannel(channel);
    }
    router.canGoBack() ? router.back() : router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{existing ? "Edit Channel" : "New Channel"}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Name + Emoji */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHANNEL NAME</Text>
            <View style={styles.nameRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                <View style={styles.emojiRow}>
                  {EMOJI_OPTIONS.map(e => (
                    <TouchableOpacity key={e} onPress={() => setEmoji(e)} style={[styles.emojiBtn, emoji === e && { backgroundColor: color + "30", borderColor: color }]}>
                      <Text style={styles.emojiBtnText}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Channel name..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.nameInput}
              />
            </View>
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COLOR</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorBtnActive]} />
              ))}
            </View>
          </View>

          {/* Topics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOPICS</Text>
            <View style={styles.pillWrap}>
              {TOPIC_OPTIONS.map(t => {
                const active = topics.includes(t.id);
                return (
                  <TouchableOpacity key={t.id} onPress={() => toggleTopic(t.id)} style={[styles.pill, active && { backgroundColor: color + "25", borderColor: color }]}>
                    <Text style={styles.pillEmoji}>{t.emoji}</Text>
                    <Text style={[styles.pillLabel, active && { color }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* People */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PEOPLE</Text>
            <View style={styles.inputRow}>
              <TextInput value={personInput} onChangeText={setPersonInput} placeholder="@handle" placeholderTextColor="rgba(255,255,255,0.2)" style={styles.chipInput} onSubmitEditing={addPerson} />
              <TouchableOpacity onPress={addPerson} style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
            </View>
            <View style={styles.chipWrap}>
              {people.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setPeople(prev => prev.filter((_, j) => j !== i))} style={[styles.chip, { borderColor: color }]}>
                  <Text style={[styles.chipText, { color }]}>{p}</Text>
                  <Text style={styles.chipRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Keywords */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KEYWORDS (INCLUDE)</Text>
            <View style={styles.inputRow}>
              <TextInput value={kwInput} onChangeText={setKwInput} placeholder="Add keyword..." placeholderTextColor="rgba(255,255,255,0.2)" style={styles.chipInput} onSubmitEditing={addKeyword} />
              <TouchableOpacity onPress={addKeyword} style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
            </View>
            <View style={styles.chipWrap}>
              {keywords.map((k, i) => (
                <TouchableOpacity key={i} onPress={() => setKeywords(prev => prev.filter((_, j) => j !== i))} style={[styles.chip, { borderColor: "#22c55e" }]}>
                  <Text style={[styles.chipText, { color: "#22c55e" }]}>{k}</Text>
                  <Text style={styles.chipRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mute keywords */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MUTE KEYWORDS (EXCLUDE)</Text>
            <View style={styles.inputRow}>
              <TextInput value={muteInput} onChangeText={setMuteInput} placeholder="Mute keyword..." placeholderTextColor="rgba(255,255,255,0.2)" style={styles.chipInput} onSubmitEditing={addMuteKw} />
              <TouchableOpacity onPress={addMuteKw} style={[styles.addBtn, { backgroundColor: "rgba(239,68,68,0.2)" }]}><Text style={[styles.addBtnText, { color: "#ef4444" }]}>+</Text></TouchableOpacity>
            </View>
            <View style={styles.chipWrap}>
              {muteKeywords.map((k, i) => (
                <TouchableOpacity key={i} onPress={() => setMuteKeywords(prev => prev.filter((_, j) => j !== i))} style={[styles.chip, { borderColor: "#ef4444" }]}>
                  <Text style={[styles.chipText, { color: "#ef4444" }]}>🔇 {k}</Text>
                  <Text style={styles.chipRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Platforms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SOURCES (EMPTY = ALL)</Text>
            <View style={styles.pillWrap}>
              {PLATFORM_OPTIONS.map(p => {
                const active = platforms.includes(p);
                return (
                  <TouchableOpacity key={p} onPress={() => togglePlatform(p)} style={[styles.pill, active && { backgroundColor: color + "25", borderColor: color }]}>
                    <Text style={[styles.pillLabel, active && { color }]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Mood */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOOD FILTER (OPTIONAL)</Text>
            <View style={styles.pillWrap}>
              {MOOD_OPTIONS.map(m => {
                const active = mood === m.id;
                return (
                  <TouchableOpacity key={m.id} onPress={() => setMood(active ? null : m.id)} style={[styles.pill, active && { backgroundColor: color + "25", borderColor: color }]}>
                    <Text style={styles.pillEmoji}>{m.emoji}</Text>
                    <Text style={[styles.pillLabel, active && { color }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sort */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SORT BY</Text>
            <View style={styles.pillWrap}>
              {SORT_OPTIONS.map(s => {
                const active = sortBy === s.id;
                return (
                  <TouchableOpacity key={s.id} onPress={() => setSortBy(s.id)} style={[styles.pill, active && { backgroundColor: color + "25", borderColor: color }]}>
                    <Text style={[styles.pillLabel, active && { color }]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREVIEW</Text>
            <View style={[styles.previewCard, { borderColor: color + "40" }]}>
              <LinearGradient colors={[color, color + "88"]} style={styles.previewIcon}>
                <Text style={styles.previewEmoji}>{emoji}</Text>
              </LinearGradient>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{name || "Untitled Channel"}</Text>
                <Text style={styles.previewDetails}>
                  {topics.length > 0 ? topics.length + " topics" : "All topics"}
                  {people.length > 0 ? " · " + people.length + " people" : ""}
                  {keywords.length > 0 ? " · " + keywords.length + " keywords" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Save */}
          <Pressable style={styles.saveBtn} onPress={save}>
            <LinearGradient colors={[color, color + "cc"]} style={styles.saveBtnGrad}>
              <Text style={styles.saveBtnText}>{existing ? "💾 Save Changes" : "📺 Create Channel"}</Text>
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
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  nameRow: { gap: 10 },
  emojiScroll: { maxHeight: 44 },
  emojiRow: { flexDirection: "row", gap: 6 },
  emojiBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  emojiBtnText: { fontSize: 20 },
  nameInput: { color: "#fff", fontSize: 18, fontWeight: "800", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "transparent" },
  colorBtnActive: { borderColor: "#fff", transform: [{ scale: 1.2 }] },
  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pillEmoji: { fontSize: 14 },
  pillLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chipInput: { flex: 1, color: "#fff", fontSize: 14, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  addBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(108,71,255,0.2)", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#6c47ff", fontSize: 20, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "700" },
  chipRemove: { color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 2 },
  previewCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1 },
  previewIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  previewEmoji: { fontSize: 20 },
  previewInfo: { flex: 1 },
  previewName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  previewDetails: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
  saveBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  saveBtnGrad: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
