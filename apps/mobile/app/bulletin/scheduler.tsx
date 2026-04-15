/**
 * Bulletin Scheduler — user programs their own TV schedule.
 * Rules: When (day + time) + How long you have + Mood + Format = auto bulletin.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { selection } from "../../src/lib/haptics";
import { BulletinRule, BulletinSchedule, DayOfWeek, MoodId, BulletinFormatId } from "@social-tv/shared";
import { MOODS, BULLETIN_FORMATS, TIME_SLOTS, AVAILABLE_MINUTES } from "../../src/constants/moods";

const DAYS: { id: DayOfWeek; short: string }[] = [
  { id: "mon", short: "M" }, { id: "tue", short: "T" }, { id: "wed", short: "W" },
  { id: "thu", short: "T" }, { id: "fri", short: "F" }, { id: "sat", short: "S" }, { id: "sun", short: "S" },
];

const DEFAULT_RULES: BulletinRule[] = [
  { id: "morning-weekday", name: "Weekday morning", enabled: true, days: ["mon", "tue", "wed", "thu", "fri"], timeSlot: "morning", availableMinutes: 5, moods: ["focused", "energised"], formatId: "flash", channelIds: [], sendNotification: true, notificationMessage: "Your morning briefing is ready ⚡" },
  { id: "lunch-everyday", name: "Lunch catch-up", enabled: false, days: ["mon", "tue", "wed", "thu", "fri"], timeSlot: "lunch", availableMinutes: 10, moods: ["chill", "curious"], formatId: "top10", channelIds: [], sendNotification: true, notificationMessage: "Lunchtime Top 10 🍽️" },
  { id: "weekend-deep", name: "Weekend deep dive", enabled: false, days: ["sat", "sun"], timeSlot: "morning", availableMinutes: 30, moods: ["curious", "energised"], formatId: "top100", channelIds: [], sendNotification: false },
];

export default function BulletinScheduler() {
  const [rules, setRules] = useState<BulletinRule[]>(DEFAULT_RULES);
  const [editing, setEditing] = useState<BulletinRule | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("bulletin_schedule").then((raw) => {
      if (raw) {
        const s: BulletinSchedule = JSON.parse(raw);
        setRules(s.rules);
      }
    });
  }, []);

  const save = (updated: BulletinRule[]) => {
    const schedule: BulletinSchedule = { userId: "local", rules: updated, updatedAt: new Date().toISOString() };
    AsyncStorage.setItem("bulletin_schedule", JSON.stringify(schedule));
    setRules(updated);
  };

  const toggleRule = (id: string) => {
    selection();
    save(rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRule = (updated: BulletinRule) => {
    save(rules.map((r) => r.id === updated.id ? updated : r));
    setEditing(null);
  };

  const addRule = () => {
    const newRule: BulletinRule = {
      id: `rule-${Date.now()}`, name: "New rule", enabled: true,
      days: ["mon", "tue", "wed", "thu", "fri"], timeSlot: "morning",
      availableMinutes: 5, moods: ["focused"], formatId: "flash",
      channelIds: [], sendNotification: true,
    };
    const updated = [...rules, newRule];
    save(updated);
    setEditing(newRule);
  };

  const deleteRule = (id: string) => {
    save(rules.filter((r) => r.id !== id));
  };

  if (editing) {
    return <RuleEditor rule={editing} onSave={updateRule} onCancel={() => setEditing(null)} onDelete={() => { deleteRule(editing.id); setEditing(null); }} />;
  }

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.heading}>My Schedule 📅</Text>
              <Text style={styles.sub}>Program your own bulletin rules</Text>
            </View>
          </View>

          <SectionLabel label="ACTIVE RULES" />

          {rules.map((rule) => {
            const fmt = BULLETIN_FORMATS.find((f) => f.id === rule.formatId);
            const moodLabels = rule.moods.map((m) => MOODS.find((mo) => mo.id === m)?.emoji).join("");
            const slot = TIME_SLOTS.find((t) => t.id === rule.timeSlot);
            const dayLabels = rule.days.map((d) => d.slice(0, 1).toUpperCase()).join(" ");

            return (
              <View key={rule.id} style={[styles.ruleCard, !rule.enabled && styles.ruleCardDisabled]}>
                <View style={styles.ruleTop}>
                  <View style={styles.ruleLeft}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleMeta}>
                      {slot?.emoji} {slot?.label} · {rule.availableMinutes}min · {fmt?.emoji} {fmt?.name}
                    </Text>
                    <Text style={styles.ruleDetails}>
                      {dayLabels} · Moods: {moodLabels}
                    </Text>
                  </View>
                  <Switch
                    value={rule.enabled}
                    onValueChange={() => toggleRule(rule.id)}
                    trackColor={{ false: "#333", true: "#6c47ff" }}
                    thumbColor="#fff"
                  />
                </View>
                <TouchableOpacity onPress={() => setEditing(rule)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit rule →</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity onPress={addRule} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add new rule</Text>
          </TouchableOpacity>

          <View style={styles.tip}>
            <Text style={styles.tipTitle}>How rules work</Text>
            <Text style={styles.tipText}>
              At the scheduled time, if your current mood matches the rule, SocialTV generates a bulletin
              and sends a notification. Tap it to watch your personalised catch-up instantly.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Rule Editor ──────────────────────────────────────────────────────────────

function RuleEditor({ rule, onSave, onCancel, onDelete }: {
  rule: BulletinRule;
  onSave: (r: BulletinRule) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<BulletinRule>({ ...rule });

  const toggleDay = (day: DayOfWeek) => {
    const days = draft.days.includes(day) ? draft.days.filter((d) => d !== day) : [...draft.days, day];
    setDraft({ ...draft, days });
  };

  const toggleMood = (mood: MoodId) => {
    const moods = draft.moods.includes(mood) ? draft.moods.filter((m) => m !== mood) : [...draft.moods, mood];
    setDraft({ ...draft, moods });
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}><Text style={styles.back}>←</Text></TouchableOpacity>
            <Text style={styles.heading}>Edit Rule</Text>
          </View>

          <SectionLabel label="DAYS" />
          <View style={styles.daysRow}>
            {DAYS.map(({ id, short }) => (
              <TouchableOpacity key={id} onPress={() => toggleDay(id)} style={[styles.dayChip, draft.days.includes(id) && styles.dayChipActive]}>
                <Text style={[styles.dayText, draft.days.includes(id) && styles.dayTextActive]}>{short}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="TIME SLOT" />
          <View style={styles.pillRow}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity key={slot.id} onPress={() => setDraft({ ...draft, timeSlot: slot.id as any })} style={[styles.pill, draft.timeSlot === slot.id && styles.pillActive]}>
                <Text style={styles.pillText}>{slot.emoji} {slot.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="TIME AVAILABLE" />
          <View style={styles.pillRow}>
            {AVAILABLE_MINUTES.map((m) => (
              <TouchableOpacity key={m} onPress={() => setDraft({ ...draft, availableMinutes: m })} style={[styles.pill, draft.availableMinutes === m && styles.pillActive]}>
                <Text style={styles.pillText}>{m < 60 ? `${m}m` : "1h"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="MOODS THAT TRIGGER THIS RULE" />
          <View style={styles.moodRow}>
            {MOODS.map((mood) => (
              <TouchableOpacity key={mood.id} onPress={() => toggleMood(mood.id)} style={[styles.moodChip, draft.moods.includes(mood.id) && { borderColor: mood.accentColor, backgroundColor: mood.accentColor + "22" }]}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, draft.moods.includes(mood.id) && { color: mood.accentColor }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="BULLETIN FORMAT" />
          {BULLETIN_FORMATS.map((fmt) => (
            <TouchableOpacity key={fmt.id} onPress={() => setDraft({ ...draft, formatId: fmt.id })} style={[styles.fmtRow, draft.formatId === fmt.id && styles.fmtRowActive]}>
              <Text style={styles.fmtEmoji}>{fmt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fmtName}>{fmt.name}</Text>
                <Text style={styles.fmtDesc}>{fmt.description}</Text>
              </View>
              {draft.formatId === fmt.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          <View style={styles.saveRow}>
            <TouchableOpacity onPress={() => onSave(draft)} style={styles.saveBtn}>
              <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.saveBtnGrad}>
                <Text style={styles.saveBtnText}>Save rule</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SectionLabel = ({ label }: { label: string }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24, gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  back: { color: "rgba(255,255,255,0.4)", fontSize: 20 },
  heading: { color: "#fff", fontSize: 26, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  sectionLabel: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 8 },
  ruleCard: { backgroundColor: "#1a1a2e", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  ruleCardDisabled: { opacity: 0.5 },
  ruleTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  ruleLeft: { flex: 1, gap: 3 },
  ruleName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  ruleMeta: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  ruleDetails: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  editBtn: { alignSelf: "flex-start" },
  editBtnText: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },
  addBtn: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(108,71,255,0.4)", paddingVertical: 14, alignItems: "center" },
  addBtnText: { color: "#a78bfa", fontSize: 15, fontWeight: "800" },
  tip: { backgroundColor: "rgba(108,71,255,0.08)", borderRadius: 12, padding: 16, gap: 6, borderWidth: 1, borderColor: "rgba(108,71,255,0.2)" },
  tipTitle: { color: "#a78bfa", fontSize: 13, fontWeight: "800" },
  tipText: { color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 18 },
  daysRow: { flexDirection: "row", gap: 8 },
  dayChip: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  dayChipActive: { backgroundColor: "#6c47ff22", borderColor: "#6c47ff" },
  dayText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "800" },
  dayTextActive: { color: "#a78bfa" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pillActive: { backgroundColor: "#6c47ff22", borderColor: "#6c47ff" },
  pillText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodChip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  moodEmoji: { fontSize: 16 },
  moodLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },
  fmtRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1a1a2e", borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  fmtRowActive: { borderColor: "#6c47ff", backgroundColor: "#6c47ff11" },
  fmtEmoji: { fontSize: 22 },
  fmtName: { color: "#fff", fontSize: 14, fontWeight: "800" },
  fmtDesc: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 },
  checkmark: { color: "#6c47ff", fontSize: 18, fontWeight: "900" },
  saveRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  saveBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  saveBtnGrad: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  deleteBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  deleteBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
});
