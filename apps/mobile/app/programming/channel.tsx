import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { CONTENT_VERTICALS, TV_FORMATS, FORMAT_VERTICAL_FIT, TVFormatId } from "@social-tv/shared";
import { ChannelQuickStrip } from "../../src/components/ChannelQuickStrip";

export default function ChannelConfigScreen() {
  const { verticalId } = useLocalSearchParams<{ verticalId: string }>();
  const vertical = CONTENT_VERTICALS.find(v => v.id === verticalId);

  const [selectedFormat, setSelectedFormat] = useState<TVFormatId>(
    (vertical?.defaultFormat as TVFormatId) ?? "flash_briefing"
  );
  const [enabled, setEnabled] = useState(true);

  if (!vertical) return null;

  // Formats that work well for this vertical
  const suitableFormats = TV_FORMATS.filter(f =>
    FORMAT_VERTICAL_FIT[f.id]?.includes(vertical.id as any) || f.id === vertical.defaultFormat
  );

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>

        {/* Channel hero */}
        <LinearGradient
          colors={[`${vertical.color}44`, `${vertical.colorEnd}11`]}
          style={styles.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={[styles.heroIcon, { backgroundColor: vertical.color }]}>
            <Text style={styles.heroEmoji}>{vertical.emoji}</Text>
          </View>
          <Text style={styles.heroName}>{vertical.name}</Text>
          <Text style={styles.heroAnalogy}>{vertical.tvAnalogy}</Text>
          <Text style={styles.heroDesc}>{vertical.description}</Text>
        </LinearGradient>

        {/* Quick-format strip for this channel */}
        <ChannelQuickStrip
          verticalId={vertical.id}
          verticalColor={vertical.color}
          verticalEmoji={vertical.emoji}
          verticalName={vertical.name}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Enable toggle */}
          <BlurView intensity={20} tint="dark" style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Include in my feed</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, enabled && styles.toggleBtnOn]}
              onPress={() => setEnabled(e => !e)}
            >
              <Text style={styles.toggleBtnText}>{enabled ? "✓ Enabled" : "Disabled"}</Text>
            </TouchableOpacity>
          </BlurView>

          {/* Format picker */}
          <Text style={styles.sectionLabel}>Presentation format</Text>
          <Text style={styles.sectionNote}>How this channel's content will be shown to you</Text>
          {suitableFormats.map(fmt => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <TouchableOpacity
                key={fmt.id}
                style={[styles.fmtCard, isSelected && styles.fmtCardSelected]}
                onPress={() => setSelectedFormat(fmt.id)}
              >
                <Text style={styles.fmtEmoji}>{fmt.emoji}</Text>
                <View style={styles.fmtInfo}>
                  <Text style={[styles.fmtName, isSelected && styles.fmtNameOn]}>{fmt.name}</Text>
                  <Text style={styles.fmtAnalogy}>{fmt.tvAnalogy}</Text>
                  <View style={styles.fmtMeta}>
                    <Text style={styles.fmtMetaText}>{fmt.pacing} pace</Text>
                    <Text style={styles.fmtMetaDot}>·</Text>
                    <Text style={styles.fmtMetaText}>{fmt.storyCount} stories</Text>
                    <Text style={styles.fmtMetaDot}>·</Text>
                    <Text style={styles.fmtMetaText}>{fmt.minMinutes}–{fmt.maxMinutes}min</Text>
                  </View>
                </View>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}

          {/* Keyword hints */}
          {vertical.classifyKeywords.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Auto-detected from</Text>
              <Text style={styles.sectionNote}>Posts matching these topics are automatically sorted into this channel</Text>
              <View style={styles.kwWrap}>
                {vertical.classifyKeywords.map(kw => (
                  <View key={kw} style={styles.kwChip}>
                    <Text style={styles.kwText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.addToScheduleBtn}
            onPress={() => router.push({ pathname: "/programming/add", params: { verticalId: vertical.id, formatId: selectedFormat } })}
          >
            <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.addToScheduleBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.addToScheduleBtnText}>📅 Add to Schedule</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 },
  back: { color: "#6c47ff", fontSize: 15, width: 60 },
  hero: { margin: 16, borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  heroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroEmoji: { fontSize: 28 },
  heroName: { color: "#fff", fontSize: 24, fontWeight: "900" },
  heroAnalogy: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  heroDesc: { color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "center", lineHeight: 18, marginTop: 4 },
  scroll: { paddingHorizontal: 16 },
  toggleCard: { borderRadius: 12, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  toggleLabel: { color: "#fff", fontSize: 15, fontWeight: "700" },
  toggleBtn: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  toggleBtnOn: { backgroundColor: "rgba(108,71,255,0.5)" },
  toggleBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  sectionLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginTop: 20, marginBottom: 4 },
  sectionNote: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 10 },
  fmtCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  fmtCardSelected: { borderColor: "#6c47ff", backgroundColor: "rgba(108,71,255,0.1)" },
  fmtEmoji: { fontSize: 22 },
  fmtInfo: { flex: 1 },
  fmtName: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "700" },
  fmtNameOn: { color: "#fff" },
  fmtAnalogy: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
  fmtMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  fmtMetaText: { color: "rgba(255,255,255,0.25)", fontSize: 11 },
  fmtMetaDot: { color: "rgba(255,255,255,0.15)", fontSize: 11 },
  checkmark: { color: "#6c47ff", fontSize: 16, fontWeight: "900" },
  kwWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kwChip: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  kwText: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  addToScheduleBtn: { borderRadius: 14, overflow: "hidden", marginTop: 24 },
  addToScheduleBtnGrad: { paddingVertical: 16, alignItems: "center" },
  addToScheduleBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
