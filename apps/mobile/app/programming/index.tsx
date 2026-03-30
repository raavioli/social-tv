import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useAppStore, ScheduledShow } from "../../src/store/useAppStore";
import { TV_FORMATS } from "@social-tv/shared";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(hour: number, minute: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, "0");
  const ampm = hour < 12 ? "am" : "pm";
  return `${h}:${m}${ampm}`;
}

export default function ProgrammingScreen() {
  const { scheduledShows, toggleScheduledShow, removeScheduledShow } = useAppStore();
  const [view, setView] = useState<"schedule" | "guide">("schedule");

  // Sort by time
  const sorted = [...scheduledShows].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📺 My Programming</Text>
          <TouchableOpacity onPress={() => router.push("/programming/add")}>
            <Text style={styles.addBtn}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* View toggle */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segment, view === "schedule" && styles.segmentActive]}
            onPress={() => setView("schedule")}
          >
            <Text style={[styles.segmentText, view === "schedule" && styles.segmentTextActive]}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, view === "guide" && styles.segmentActive]}
            onPress={() => setView("guide")}
          >
            <Text style={[styles.segmentText, view === "guide" && styles.segmentTextActive]}>TV Guide</Text>
          </TouchableOpacity>
        </View>

        {view === "schedule" ? (
          <ScrollView contentContainerStyle={styles.list}>
            {sorted.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>No shows scheduled yet</Text>
                <TouchableOpacity onPress={() => router.push("/programming/add")} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>+ Schedule a show</Text>
                </TouchableOpacity>
              </View>
            )}
            {sorted.map(show => {
              const fmt = TV_FORMATS.find(f => f.id === show.formatId);
              return (
                <BlurView key={show.id} intensity={20} tint="dark" style={[styles.card, !show.enabled && styles.cardDisabled]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardEmoji}>{fmt?.emoji ?? "📺"}</Text>
                      <View>
                        <Text style={styles.cardLabel}>{show.label}</Text>
                        <Text style={styles.cardFormat}>{fmt?.name}</Text>
                      </View>
                    </View>
                    <Switch
                      value={show.enabled}
                      onValueChange={() => toggleScheduledShow(show.id)}
                      trackColor={{ false: "rgba(255,255,255,0.1)", true: "#6c47ff" }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View style={styles.cardMeta}>
                    {/* Day pills */}
                    <View style={styles.dayRow}>
                      {DAYS.map((d, i) => (
                        <View key={i} style={[styles.dayPill, show.days.includes(i) && styles.dayPillActive]}>
                          <Text style={[styles.dayText, show.days.includes(i) && styles.dayTextActive]}>{d}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.timeText}>{formatTime(show.hour, show.minute)} · {show.maxMinutes}min</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => router.push({ pathname: "/programming/edit", params: { id: show.id } })}
                    >
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeScheduledShow(show.id)}
                    >
                      <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <TVGuideView shows={sorted} />
        )}
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
      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
        {DAY_LABELS.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.daySelectorBtn, i === selectedDay && styles.daySelectorBtnActive]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={[styles.daySelectorDay, i === selectedDay && styles.daySelectorDayActive]}>{d}</Text>
            {i === today && <View style={styles.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.guideList}>
        {dayShows.length === 0 && (
          <View style={styles.guideEmpty}>
            <Text style={styles.guideEmptyText}>Nothing scheduled for {DAY_LABELS[selectedDay]}</Text>
          </View>
        )}
        {dayShows.map(show => {
          const fmt = TV_FORMATS.find(f => f.id === show.formatId);
          const endHour = show.hour + Math.floor((show.minute + show.maxMinutes) / 60);
          const endMin = (show.minute + show.maxMinutes) % 60;
          return (
            <BlurView key={show.id} intensity={20} tint="dark" style={styles.guideCard}>
              <View style={styles.guideTime}>
                <Text style={styles.guideTimeText}>{formatTime(show.hour, show.minute)}</Text>
                <Text style={styles.guideTimeEnd}>{formatTime(endHour, endMin)}</Text>
              </View>
              <LinearGradient
                colors={["rgba(108,71,255,0.3)", "rgba(168,85,247,0.1)"]}
                style={styles.guideBlock}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.guideEmoji}>{fmt?.emoji}</Text>
                <View>
                  <Text style={styles.guideLabel}>{show.label}</Text>
                  <Text style={styles.guideSubLabel}>{fmt?.tvAnalogy} · {show.maxMinutes}min</Text>
                </View>
              </LinearGradient>
            </BlurView>
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
  segmentRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 12, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  segmentActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  segmentText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { borderRadius: 14, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  cardDisabled: { opacity: 0.4 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmoji: { fontSize: 28 },
  cardLabel: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cardFormat: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dayRow: { flexDirection: "row", gap: 4 },
  dayPill: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  dayPillActive: { backgroundColor: "#6c47ff" },
  dayText: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "700" },
  dayTextActive: { color: "#fff" },
  timeText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  editBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 16 },
  emptyBtn: { backgroundColor: "rgba(108,71,255,0.3)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  emptyBtnText: { color: "#a78bfa", fontSize: 14, fontWeight: "700" },
  // TV Guide
  daySelector: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  daySelectorBtn: { width: 48, height: 52, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  daySelectorBtnActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  daySelectorDay: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  daySelectorDayActive: { color: "#fff" },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#6c47ff", marginTop: 3 },
  guideList: { paddingHorizontal: 16, gap: 8 },
  guideEmpty: { paddingTop: 40, alignItems: "center" },
  guideEmptyText: { color: "rgba(255,255,255,0.3)", fontSize: 14 },
  guideCard: { borderRadius: 12, overflow: "hidden", flexDirection: "row", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  guideTime: { width: 64, padding: 12, alignItems: "center", justifyContent: "center", gap: 4 },
  guideTimeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  guideTimeEnd: { color: "rgba(255,255,255,0.3)", fontSize: 10 },
  guideBlock: { flex: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  guideEmoji: { fontSize: 24 },
  guideLabel: { color: "#fff", fontSize: 14, fontWeight: "800" },
  guideSubLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 },
});
