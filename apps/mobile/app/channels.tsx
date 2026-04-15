import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";

const CHANNEL_STORIES: Record<string, { stories: number; topStory: string }> = {
  "ch-foryou":        { stories: 12, topStory: "Your AI post is going viral — 2.4K likes" },
  "ch-tech":          { stories: 15, topStory: "React Native 0.78 ships new architecture" },
  "ch-trending":      { stories: 8,  topStory: "OpenAI announces GPT-5" },
  "ch-entertainment": { stories: 10, topStory: "New music video just dropped" },
  "ch-business":      { stories: 7,  topStory: "Markets surge as Fed signals rate pause" },
  "ch-myupdates":     { stories: 5,  topStory: "15 profile views this week" },
};
const DEFAULT_STORY = { stories: 3, topStory: "New stories incoming..." };

export default function ChannelsScreen() {
  const { customChannels } = useAppStore();
  const channels = customChannels.filter(c => c.enabled).sort((a, b) => a.position - b.position);

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Channels</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {channels.map((ch, idx) => {
            const story = CHANNEL_STORIES[ch.id] ?? DEFAULT_STORY;
            return (
              <Pressable
                key={ch.id}
                style={styles.row}
                onPress={() => router.push({ pathname: "/(tabs)/now", params: { channel: ch.id } } as any)}
              >
                <Text style={styles.chNum}>CH{idx + 1}</Text>
                <LinearGradient colors={[ch.color, ch.color + "88"]} style={styles.icon}>
                  <Text style={styles.iconEmoji}>{ch.emoji}</Text>
                </LinearGradient>
                <View style={styles.info}>
                  <Text style={styles.name}>{ch.name}</Text>
                  <Text style={styles.preview} numberOfLines={1}>{story.topStory}</Text>
                </View>
                <View style={styles.meta}>
                  <Text style={[styles.count, { color: ch.color }]}>{story.stories}</Text>
                  <View style={[styles.dotWrap, { backgroundColor: ch.color + "20" }]}>
                    <View style={[styles.dot, { backgroundColor: ch.color }]} />
                  </View>
                </View>
              </Pressable>
            );
          })}

          <Pressable style={styles.newBtn} onPress={() => router.push("/channel-creator" as any)}>
            <LinearGradient colors={["rgba(108,71,255,0.15)", "rgba(108,71,255,0.05)"]} style={styles.newBtnGrad}>
              <Text style={styles.newPlus}>+</Text>
              <Text style={styles.newText}>Create New Channel</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#fff", fontSize: 30, fontWeight: "300", width: 24 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 6, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  chNum: { color: "rgba(255,255,255,0.15)", fontSize: 10, fontWeight: "900", width: 28, textAlign: "center" },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 16 },
  info: { flex: 1, gap: 2 },
  name: { color: "#fff", fontSize: 13, fontWeight: "800" },
  preview: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  meta: { alignItems: "center", gap: 4 },
  count: { fontSize: 16, fontWeight: "900" },
  dotWrap: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  newBtn: { marginTop: 6, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(108,71,255,0.2)", borderStyle: "dashed" },
  newBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  newPlus: { color: "#6c47ff", fontSize: 20, fontWeight: "700" },
  newText: { color: "#6c47ff", fontSize: 13, fontWeight: "800" },
});
