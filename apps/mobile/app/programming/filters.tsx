import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";

export default function FiltersScreen() {
  const { mutedKeywords, pinnedSources, addMutedKeyword, removeMutedKeyword, addPinnedSource, removePinnedSource, toggleSourceBoost } = useAppStore();
  const [newKeyword, setNewKeyword] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newPlatform, setNewPlatform] = useState("twitter");
  const [tab, setTab] = useState<"mute" | "boost">("mute");

  const PLATFORMS = ["twitter", "instagram", "youtube", "linkedin"];

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎛️ Content Filters</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.tabRow}>
          {(["mute", "boost"] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "mute" ? "🔇 Mute" : "⭐ Boost"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "mute" ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.desc}>Stories containing these keywords will be hidden from all formats.</Text>

            {/* Add keyword */}
            <BlurView intensity={20} tint="dark" style={styles.addRow}>
              <TextInput
                value={newKeyword}
                onChangeText={setNewKeyword}
                style={styles.addInput}
                placeholder="Add keyword or phrase..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                onSubmitEditing={() => {
                  if (newKeyword.trim()) {
                    addMutedKeyword(newKeyword.trim());
                    setNewKeyword("");
                  }
                }}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  if (newKeyword.trim()) {
                    addMutedKeyword(newKeyword.trim());
                    setNewKeyword("");
                  }
                }}
              >
                <Text style={styles.addBtnText}>+ Mute</Text>
              </TouchableOpacity>
            </BlurView>

            {/* Keyword list */}
            {mutedKeywords.length === 0 && (
              <Text style={styles.emptyNote}>No muted keywords yet.</Text>
            )}
            <View style={styles.chipWrap}>
              {mutedKeywords.map(kw => (
                <TouchableOpacity
                  key={kw.id}
                  style={styles.chip}
                  onPress={() => removeMutedKeyword(kw.id)}
                >
                  <Text style={styles.chipText}>🔇 {kw.keyword}</Text>
                  <Text style={styles.chipRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick suggestions */}
            <Text style={styles.sectionLabel}>Quick mutes</Text>
            <View style={styles.chipWrap}>
              {["politics", "crypto", "ads", "sponsored", "drama"].map(kw => (
                <TouchableOpacity
                  key={kw}
                  style={styles.chipSuggest}
                  onPress={() => addMutedKeyword(kw)}
                  disabled={mutedKeywords.some(m => m.keyword === kw)}
                >
                  <Text style={styles.chipSuggestText}>+ {kw}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.desc}>Boost specific accounts to the top of your feed, or mute them entirely.</Text>

            {/* Add source */}
            <BlurView intensity={20} tint="dark" style={styles.addSourceCard}>
              <View style={styles.platformRow}>
                {PLATFORMS.map(p => (
                  <TouchableOpacity key={p} style={[styles.platformBtn, newPlatform === p && styles.platformBtnActive]} onPress={() => setNewPlatform(p)}>
                    <Text style={styles.platformBtnText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={newHandle}
                onChangeText={setNewHandle}
                style={styles.addInput}
                placeholder="@handle or name"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
              <View style={styles.addSourceActions}>
                <TouchableOpacity
                  style={styles.boostBtn}
                  onPress={() => {
                    if (newHandle.trim()) {
                      addPinnedSource({ platform: newPlatform, handle: newHandle.trim(), displayName: newHandle.trim(), boosted: true });
                      setNewHandle("");
                    }
                  }}
                >
                  <Text style={styles.boostBtnText}>⭐ Boost</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.muteSourceBtn}
                  onPress={() => {
                    if (newHandle.trim()) {
                      addPinnedSource({ platform: newPlatform, handle: newHandle.trim(), displayName: newHandle.trim(), boosted: false });
                      setNewHandle("");
                    }
                  }}
                >
                  <Text style={styles.muteSourceBtnText}>🔇 Mute source</Text>
                </TouchableOpacity>
              </View>
            </BlurView>

            {pinnedSources.length === 0 && (
              <Text style={styles.emptyNote}>No sources pinned yet.</Text>
            )}
            {pinnedSources.map(src => (
              <BlurView key={src.id} intensity={20} tint="dark" style={styles.sourceCard}>
                <View style={styles.sourceRow}>
                  <View style={[styles.boostDot, { backgroundColor: src.boosted ? "#10b981" : "#ef4444" }]} />
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceHandle}>{src.handle}</Text>
                    <Text style={styles.sourcePlatform}>{src.platform} · {src.boosted ? "Boosted" : "Muted"}</Text>
                  </View>
                  <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleSourceBoost(src.id)}>
                    <Text style={styles.toggleBtnText}>{src.boosted ? "→ Mute" : "→ Boost"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removePinnedSource(src.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            ))}
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
  back: { color: "#6c47ff", fontSize: 15, width: 60 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 12, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  tabText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  desc: { color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 18, marginBottom: 16 },
  sectionLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginTop: 20, marginBottom: 8 },
  addRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 16 },
  addInput: { flex: 1, color: "#fff", fontSize: 14, padding: 14 },
  addBtn: { backgroundColor: "rgba(108,71,255,0.5)", paddingHorizontal: 16, paddingVertical: 14 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyNote: { color: "rgba(255,255,255,0.2)", fontSize: 13, marginTop: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  chipText: { color: "#fca5a5", fontSize: 13, fontWeight: "700" },
  chipRemove: { color: "rgba(239,68,68,0.5)", fontSize: 12 },
  chipSuggest: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  chipSuggestText: { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  addSourceCard: { borderRadius: 14, overflow: "hidden", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 16, gap: 12 },
  platformRow: { flexDirection: "row", gap: 6 },
  platformBtn: { flex: 1, paddingVertical: 6, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
  platformBtnActive: { backgroundColor: "rgba(108,71,255,0.4)" },
  platformBtnText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" },
  addSourceActions: { flexDirection: "row", gap: 8 },
  boostBtn: { flex: 1, backgroundColor: "rgba(16,185,129,0.2)", borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(16,185,129,0.4)" },
  boostBtnText: { color: "#6ee7b7", fontSize: 13, fontWeight: "700" },
  muteSourceBtn: { flex: 1, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  muteSourceBtnText: { color: "#fca5a5", fontSize: 13, fontWeight: "700" },
  sourceCard: { borderRadius: 12, overflow: "hidden", marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 14 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  boostDot: { width: 8, height: 8, borderRadius: 4 },
  sourceInfo: { flex: 1 },
  sourceHandle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  sourcePlatform: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  toggleBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  toggleBtnText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" },
  removeText: { color: "rgba(255,255,255,0.2)", fontSize: 16, paddingLeft: 4 },
});
