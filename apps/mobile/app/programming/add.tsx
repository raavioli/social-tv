import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore, ScheduledShow } from "../../src/store/useAppStore";
import { TV_FORMATS, FORMAT_GROUPS } from "@social-tv/shared";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINS = [0, 30];
const MAX_MINS = [5, 10, 15, 20, 30, 45, 60];

export default function AddShowScreen() {
  const { addScheduledShow, connectedAccounts } = useAppStore();
  const [step, setStep] = useState<"format" | "schedule">("format");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [maxMinutes, setMaxMinutes] = useState(15);
  const [platformIds, setPlatformIds] = useState<string[]>([]);

  const selectedFmt = TV_FORMATS.find(f => f.id === selectedFormat);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const save = () => {
    if (!selectedFormat) return;
    const show: ScheduledShow = {
      id: `show-${Date.now()}`,
      formatId: selectedFormat as any,
      label: label.trim() || selectedFmt?.name || "My Show",
      days,
      hour,
      minute,
      enabled: true,
      platformIds,
      maxMinutes,
      notifyBefore: 5,
    };
    addScheduledShow(show);
    router.back();
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === "schedule" ? setStep("format") : router.back()}>
            <Text style={styles.back}>{step === "schedule" ? "← Back" : "✕ Cancel"}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>+ Add Show</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Steps indicator */}
        <View style={styles.steps}>
          <View style={[styles.stepDot, step === "format" && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === "schedule" && styles.stepDotActive]} />
        </View>

        {step === "format" ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.sectionLabel}>Choose a format</Text>
            {FORMAT_GROUPS.map(group => (
              <View key={group.id} style={styles.group}>
                <Text style={styles.groupLabel}>{group.emoji} {group.label}</Text>
                {group.formats.map(fmtId => {
                  const fmt = TV_FORMATS.find(f => f.id === fmtId);
                  if (!fmt) return null;
                  const isSelected = selectedFormat === fmtId;
                  return (
                    <TouchableOpacity
                      key={fmtId}
                      style={[styles.fmtCard, isSelected && styles.fmtCardSelected]}
                      onPress={() => {
                        setSelectedFormat(fmtId);
                        setLabel(fmt.name);
                        setMaxMinutes(Math.min(fmt.maxMinutes, 30));
                      }}
                    >
                      <Text style={styles.fmtEmoji}>{fmt.emoji}</Text>
                      <View style={styles.fmtInfo}>
                        <Text style={[styles.fmtName, isSelected && styles.fmtNameSelected]}>{fmt.name}</Text>
                        <Text style={styles.fmtDesc} numberOfLines={1}>{fmt.tvAnalogy}</Text>
                      </View>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {selectedFormat && (
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep("schedule")}>
                <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.nextBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.nextBtnText}>Set Schedule →</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Show name */}
            <Text style={styles.sectionLabel}>Show name</Text>
            <View style={[styles.inputCard, { backgroundColor: "rgba(255,255,255,0.04)" }]}>
              <TextInput
                value={label}
                onChangeText={setLabel}
                style={styles.input}
                placeholderTextColor="rgba(255,255,255,0.2)"
                placeholder="My Morning Show"
              />
            </View>

            {/* Days */}
            <Text style={styles.sectionLabel}>Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayBtn, days.includes(i) && styles.dayBtnActive]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[styles.dayBtnText, days.includes(i) && styles.dayBtnTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time */}
            <Text style={styles.sectionLabel}>Start time</Text>
            <View style={styles.timeRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
                {HOURS.map(h => (
                  <TouchableOpacity key={h} style={[styles.timePill, hour === h && styles.timePillActive]} onPress={() => setHour(h)}>
                    <Text style={[styles.timePillText, hour === h && styles.timePillTextActive]}>
                      {h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Duration */}
            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.durationRow}>
              {MAX_MINS.map(m => (
                <TouchableOpacity key={m} style={[styles.durPill, maxMinutes === m && styles.durPillActive]} onPress={() => setMaxMinutes(m)}>
                  <Text style={[styles.durPillText, maxMinutes === m && styles.durPillTextActive]}>{m}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Platforms */}
            {connectedAccounts.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Sources (leave empty for all)</Text>
                <View style={styles.platformsRow}>
                  {connectedAccounts.map(acc => {
                    const isOn = platformIds.includes(acc.platform);
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        style={[styles.platformPill, isOn && styles.platformPillActive]}
                        onPress={() => setPlatformIds(prev => isOn ? prev.filter(p => p !== acc.platform) : [...prev, acc.platform])}
                      >
                        <Text style={styles.platformPillText}>{acc.platform}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveBtnText}>📺 Add to Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#6c47ff", fontSize: 15, width: 70 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  steps: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 16 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.15)" },
  stepDotActive: { backgroundColor: "#6c47ff", width: 24, borderRadius: 5 },
  stepLine: { width: 40, height: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: 20 },
  sectionLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 20 },
  group: { marginBottom: 8 },
  groupLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6, marginTop: 12 },
  fmtCard: { flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12 },
  fmtCardSelected: { borderColor: "#6c47ff", backgroundColor: "rgba(108,71,255,0.1)" },
  fmtEmoji: { fontSize: 22 },
  fmtInfo: { flex: 1 },
  fmtName: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "700" },
  fmtNameSelected: { color: "#fff" },
  fmtDesc: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
  checkmark: { color: "#6c47ff", fontSize: 16, fontWeight: "900" },
  nextBtn: { borderRadius: 14, overflow: "hidden", marginTop: 20 },
  nextBtnGrad: { paddingVertical: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  inputCard: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  input: { color: "#fff", fontSize: 16, fontWeight: "700", padding: 14 },
  daysRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  dayBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  dayBtnActive: { backgroundColor: "rgba(108,71,255,0.4)", borderColor: "#6c47ff" },
  dayBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  dayBtnTextActive: { color: "#fff" },
  timeRow: { marginHorizontal: -20 },
  pickerRow: { paddingHorizontal: 20, gap: 6 },
  timePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)" },
  timePillActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  timePillText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  timePillTextActive: { color: "#fff" },
  durationRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  durPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)" },
  durPillActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  durPillText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  durPillTextActive: { color: "#fff" },
  platformsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  platformPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  platformPillActive: { backgroundColor: "rgba(108,71,255,0.3)", borderColor: "#6c47ff" },
  platformPillText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },
  saveBtn: { borderRadius: 14, overflow: "hidden", marginTop: 24 },
  saveBtnGrad: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
