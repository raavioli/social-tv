import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export interface QuickAction {
  id: string;
  label: string;
  emoji: string;
  formatId: string;
  highlight?: boolean;   // accent colour for breaking/live
}

const FORMAT_ROUTES: Record<string, string> = {
  breaking_news:      "/formats/breaking_news",
  previously_on:      "/formats/previously_on",
  live_feed:          "/formats/live_feed",
  late_night:         "/formats/late_night",
  documentary:        "/formats/documentary",
  highlight_reel:     "/formats/highlight_reel",
};

const UNIVERSAL_QUICK_ACTIONS: QuickAction[] = [
  { id: "daily",     label: "Daily",       emoji: "📋", formatId: "flash_briefing" },
  { id: "breaking",  label: "Breaking",    emoji: "🔴", formatId: "breaking_news",      highlight: true },
  { id: "top10",     label: "Top 10",      emoji: "🔢", formatId: "countdown" },
  { id: "100in100",  label: "100 in 100",  emoji: "🚀", formatId: "hundred_in_hundred" },
  { id: "speed",     label: "Speed Round", emoji: "💨", formatId: "speed_round" },
  { id: "catchup",   label: "Catch Up",    emoji: "⏮️", formatId: "previously_on" },
  { id: "live",      label: "Live",        emoji: "📡", formatId: "live_feed",           highlight: true },
  { id: "deep",      label: "Deep Dive",   emoji: "🔭", formatId: "documentary" },
  { id: "highlights", label: "Highlights", emoji: "🎬", formatId: "highlight_reel" },
];

interface Props {
  verticalId?: string;        // if set, pass as filter param to format screens
  verticalColor?: string;     // tint colour for the strip
  verticalEmoji?: string;
  verticalName?: string;
  compact?: boolean;          // shorter strip for embedding in channel header
}

export function ChannelQuickStrip({
  verticalId,
  verticalColor = "#6c47ff",
  verticalEmoji,
  verticalName,
  compact = false,
}: Props) {

  function launch(action: QuickAction) {
    const route = FORMAT_ROUTES[action.formatId] ?? `/bulletin/${action.formatId}`;
    // Pass verticalId as param so format screens can filter content
    router.push({ pathname: route as any, params: verticalId ? { verticalId } : {} });
  }

  return (
    <View style={styles.wrapper}>
      {/* Channel label */}
      {verticalName && (
        <View style={styles.channelLabel}>
          {verticalEmoji && <Text style={styles.channelEmoji}>{verticalEmoji}</Text>}
          <Text style={styles.channelName}>{verticalName}</Text>
          <View style={[styles.channelLine, { backgroundColor: verticalColor }]} />
        </View>
      )}

      {/* Horizontal action strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.strip, compact && styles.stripCompact]}
      >
        {UNIVERSAL_QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.pill,
              compact && styles.pillCompact,
              action.highlight && styles.pillHighlight,
            ]}
            onPress={() => launch(action)}
            activeOpacity={0.7}
          >
            {action.highlight ? (
              <LinearGradient
                colors={action.formatId === "breaking_news" ? ["#cc0000", "#ff2200"] : ["#1a1aff", "#6c47ff"]}
                style={styles.pillGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.pillEmoji}>{action.emoji}</Text>
                <Text style={styles.pillLabelBright}>{action.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.pillInner}>
                <Text style={styles.pillEmoji}>{action.emoji}</Text>
                <Text style={styles.pillLabel}>{action.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingBottom: 4 },
  channelLabel: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8, gap: 6 },
  channelEmoji: { fontSize: 14 },
  channelName: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  channelLine: { flex: 1, height: 1, opacity: 0.3 },
  strip: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  stripCompact: { paddingHorizontal: 12, gap: 6 },
  pill: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pillCompact: {},
  pillHighlight: { borderColor: "transparent" },
  pillGrad: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  pillInner: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.06)" },
  pillEmoji: { fontSize: 13 },
  pillLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },
  pillLabelBright: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
