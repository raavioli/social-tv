import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore, ScheduledShow } from "../../src/store/useAppStore";
import { TV_FORMATS, CONTENT_VERTICALS, MOOD_VERTICAL_AFFINITY } from "@social-tv/shared";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(hour: number, minute: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m}${hour < 12 ? "am" : "pm"}`;
}

const MOODS = [
  { id: "focused", emoji: "🎯", label: "Focused" },
  { id: "curious", emoji: "🔍", label: "Curious" },
  { id: "chill", emoji: "😌", label: "Chill" },
  { id: "stressed", emoji: "😤", label: "Stressed" },
  { id: "energised", emoji: "⚡", label: "Energised" },
];

export default function ProgrammingScreen() {
  const { scheduledShows, toggleScheduledShow, removeScheduledShow } = useAppStore();
  const [view, setView] = useState<"channels" | "schedule" | "guide">("channels");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const sorted = [...scheduledShows].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  // Which verticals are relevant for selected mood
  const moodVerticals = selectedMood
    ? (MOOD_VERTICAL_AFFINITY[selectedMood] ?? [])
    : CONTENT_VERTICALS.map(v => v.id);

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📺 My Programming</Text>
          <TouchableOpacity onPress={() => router.push("/programming/add")}>
            <Text style={styles.addBtn}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* View tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {(["channels", "schedule", "guide"] as const).map(v => (
            <TouchableOpacity key={v} style={[styles.tab, view === v && styles.tabActive]} onPress={() => setView(v)}>
              <Text style={[styles.tabText, view === v && styles.tabTextActive]}>
                {v === "channels" ? "📡 Channels" : v === "schedule" ? "🗓 Schedule" : "📋 TV Guide"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {view === "channels" && (
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Mood filter */}
            <Text style={styles.sectionLabel}>Filter by mood</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.moodBtn, selectedMood === m.id && styles.moodBtnActive]}
                  onPress={() => setSelectedMood(prev => prev === m.id ? null : m.id)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedMood === m.id && styles.moodLabelActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>
              {selectedMood ? `Channels for ${MOODS.find(m => m.id === selectedMood)?.label} mood` : "All channels"}
            </Text>

            {CONTENT_VERTICALS.filter(v => moodVerticals.includes(v.id)).map(vertical => {
              const defaultFmt = TV_FORMATS.find(f => f.id === vertical.defaultFormat);
              return (
                <TouchableOpacity
                  key={vertical.id}
                  style={styles.channelCard}
                  onPress={() => router.push({ pathname: "/programming/channel", params: { verticalId: vertical.id } })}
                >
                  <LinearGradient
                    colors={[`${vertical.color}33`, `${vertical.colorEnd}11`]}
                    style={styles.channelCardGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <View style={[styles.channelIcon, { backgroundColor: vertical.color }]}>
                      <Text style={styles.channelEmoji}>{vertical.emoji}</Text>
                    </View>
                    <View style={styles.channelInfo}>
                      <Text style={styles.channelName}>{vertical.name}</Text>
                      <Text style={styles.channelAnalogy}>{vertical.tvAnalogy}</Text>
                      <Text style={styles.channelDesc} numberOfLines={1}>{vertical.description}</Text>
                    </View>
                    <View style={styles.channelRight}>
                      {defaultFmt && <Text style={styles.defaultFormat}>{defaultFmt.emoji}</Text>}
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {view === "schedule" && (
          <ScrollView contentContainerStyle={styles.scroll}>
            {sorted.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>No shows scheduled</Text>
                <TouchableOpacity onPress={() => router.push("/programming/add")} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>+ Schedule a show</Text>
                </TouchableOpacity>
              </View>
            ) : sorted.map(show => {
              const fmt = TV_FORMATS.find(f => f.id === show.formatId);
              return (
                <View key={show.id} style={[styles.showCard, !show.enabled && styles.showCardOff, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
                  <View style={styles.showTop}>
                    <View style={styles.showLeft}>
                      <Text style={styles.showEmoji}>{fmt?.emoji ?? "📺"}</Text>
                      <View>
                        <Text style={styles.showLabel}>{show.label}</Text>
                        <Text style={styles.showFormat}>{fmt?.tvAnalogy}</Text>
                      </View>
                    </View>
                    <Switch
                      value={show.enabled}
                      onValueChange={() => toggleScheduledShow(show.id)}
                      trackColor={{ false: "rgba(255,255,255,0.1)", true: "#6c47ff" }}
                      thumbColor="#fff"
                    />
                  </View>
                  <View style={styles.showMeta}>
                    <View style={styles.dayRow}>
                      {DAYS.map((d, i) => (
                        <View key={i} style={[styles.dayPill, show.days.includes(i) && styles.dayPillOn]}>
                          <Text style={[styles.dayText, show.days.includes(i) && styles.dayTextOn]}>{d}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.showTime}>{formatTime(show.hour, show.minute)} · {show.maxMinutes}min</Text>
                  </View>
                  <View style={styles.showActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: "/programming/edit", params: { id: show.id } })}>
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeScheduledShow(show.id)}>
                      <Text style={styles.deleteText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {view === "guide" && <TVGuideView shows={sorted} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

function TVGuideView({ shows }: { shows: ScheduledShow[] }) {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);
  const dayShows = shows.filter(s => s.days.includes(selectedDay) && s.enabled);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
        {DAY_LABELS.map((d, i) => (
          <TouchableOpacity key={i} style={[styles.daySelectorBtn, i === selectedDay && styles.daySelectorActive]} onPress={() => setSelectedDay(i)}>
            <Text style={[styles.daySelectorText, i === selectedDay && styles.daySelectorTextActive]}>{d}</Text>
            {i === today && <View style={styles.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.guideScroll}>
        {dayShows.length === 0 ? (
          <View style={styles.guideEmpty}>
            <Text style={styles.guideEmptyText}>Nothing scheduled for {DAY_LABELS[selectedDay]}</Text>
          </View>
        ) : dayShows.map(show => {
          const fmt = TV_FORMATS.find(f => f.id === show.formatId);
          const endMin = show.minute + show.maxMinutes;
          return (
            <View key={show.id} style={[styles.guideRow, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
              <View style={styles.guideTimeCol}>
                <Text style={styles.guideTimeText}>{formatTime(show.hour, show.minute)}</Text>
                <Text style={styles.guideTimeEnd}>{formatTime(show.hour + Math.floor(endMin / 60), endMin % 60)}</Text>
              </View>
              <LinearGradient colors={["rgba(108,71,255,0.25)", "rgba(168,85,247,0.1)"]} style={styles.guideBlock} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.guideBlockEmoji}>{fmt?.emoji}</Text>
                <View>
                  <Text style={styles.guideBlockTitle}>{show.label}</Text>
                  <Text style={styles.guideBlockSub}>{fmt?.tvAnalogy} · {show.maxMinutes}min</Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#6c47ff", fontSize: 15, width: 60 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  addBtn: { color: "#6c47ff", fontSize: 15, fontWeight: "700", width: 60, textAlign: "right" },
  tabRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)" },
  tabActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  tabText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  scroll: { paddingHorizontal: 16 },
  sectionLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 12 },
  moodRow: { paddingBottom: 8, gap: 8 },
  moodBtn: { alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", gap: 2 },
  moodBtnActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  moodEmoji: { fontSize: 18 },
  moodLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700" },
  moodLabelActive: { color: "#fff" },
  channelCard: { borderRadius: 14, overflow: "hidden", marginBottom: 8 },
  channelCardGrad: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 14 },
  channelIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  channelEmoji: { fontSize: 20 },
  channelInfo: { flex: 1 },
  channelName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  channelAnalogy: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 1 },
  channelDesc: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 3 },
  channelRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  defaultFormat: { fontSize: 16 },
  chevron: { color: "rgba(255,255,255,0.3)", fontSize: 20 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 16 },
  emptyBtn: { backgroundColor: "rgba(108,71,255,0.3)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: "#a78bfa", fontSize: 14, fontWeight: "700" },
  showCard: { borderRadius: 14, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 10 },
  showCardOff: { opacity: 0.4 },
  showTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  showLeft: { flexDirection: "row", gap: 12, alignItems: "center" },
  showEmoji: { fontSize: 28 },
  showLabel: { color: "#fff", fontSize: 16, fontWeight: "800" },
  showFormat: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  showMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dayRow: { flexDirection: "row", gap: 4 },
  dayPill: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  dayPillOn: { backgroundColor: "#6c47ff" },
  dayText: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "700" },
  dayTextOn: { color: "#fff" },
  showTime: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  showActions: { flexDirection: "row", justifyContent: "space-between" },
  editBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  deleteText: { fontSize: 20, padding: 4 },
  daySelector: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  daySelectorBtn: { width: 48, height: 52, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  daySelectorActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  daySelectorText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  daySelectorTextActive: { color: "#fff" },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#6c47ff", marginTop: 3 },
  guideScroll: { paddingHorizontal: 16 },
  guideEmpty: { paddingTop: 40, alignItems: "center" },
  guideEmptyText: { color: "rgba(255,255,255,0.3)", fontSize: 14 },
  guideRow: { flexDirection: "row", borderRadius: 12, overflow: "hidden", marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  guideTimeCol: { width: 64, alignItems: "center", justifyContent: "center", padding: 10, gap: 4 },
  guideTimeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  guideTimeEnd: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
  guideBlock: { flex: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  guideBlockEmoji: { fontSize: 24 },
  guideBlockTitle: { color: "#fff", fontSize: 14, fontWeight: "800" },
  guideBlockSub: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 },
});
