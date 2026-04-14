import React from "react";
import { View, Text, StyleSheet, Image, Dimensions, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FeedItem } from "@social-tv/shared";

const { width: W } = Dimensions.get("window");

interface StoryCardProps {
  item: FeedItem;
  rank?: number;
  onSave?: () => void;
  onSkip?: () => void;
  channelColor?: string;
}

export function StoryCard({ item, rank, onSave, onSkip, channelColor = "#6c47ff" }: StoryCardProps) {
  const sourceLabel = ((item as any).source ?? item.platform ?? "").toUpperCase();
  const stats = item.stats ?? {};
  const engagement = [
    stats.likes ? `${formatNum(stats.likes)} likes` : null,
    stats.comments ? `${formatNum(stats.comments)} comments` : null,
    stats.views ? `${formatNum(stats.views)} views` : null,
    stats.shares ? `${formatNum(stats.shares)} shares` : null,
  ].filter(Boolean).join(" \u00b7 ");

  return (
    <View style={styles.card}>
      {/* Background image */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.bgImage} />
      ) : (
        <View style={[styles.bgImage, { backgroundColor: "#1a1a2e" }]} />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.92)"]}
        style={styles.gradient}
        locations={[0.2, 0.5, 1]}
      />

      {/* Top bar: source + rank */}
      <View style={styles.topBar}>
        <View style={[styles.sourceBadge, { backgroundColor: channelColor + "25" }]}>
          <View style={[styles.sourceDot, { backgroundColor: channelColor }]} />
          <Text style={[styles.sourceText, { color: channelColor }]}>{sourceLabel}</Text>
        </View>
        {rank && (
          <LinearGradient colors={[channelColor, channelColor + "88"]} style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </LinearGradient>
        )}
      </View>

      {/* Bottom: headline + lower third */}
      <View style={styles.bottom}>
        {/* Tags */}
        {(item.tags ?? []).length > 0 && (
          <View style={styles.tags}>
            {(item.tags ?? []).slice(0, 3).map(tag => (
              <Text key={tag} style={[styles.tag, { color: channelColor }]}>#{tag}</Text>
            ))}
          </View>
        )}

        {/* Headline */}
        <Text style={styles.headline} numberOfLines={3}>{item.title ?? item.summary}</Text>

        {/* Summary */}
        {item.title && item.summary && (
          <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        )}

        {/* Lower third: author + engagement */}
        <View style={styles.lowerThird}>
          <View style={[styles.ltAccent, { backgroundColor: channelColor }]} />
          <View style={styles.ltContent}>
            <Text style={styles.ltAuthor}>{item.author ?? "Unknown"}</Text>
            {engagement && <Text style={styles.ltEngagement}>{engagement}</Text>}
          </View>
          <Text style={styles.ltTime}>{getTimeAgo(item.publishedAt)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={onSave}>
            <Text style={styles.actionText}>Save</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={onSkip}>
            <Text style={styles.actionText}>Next</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const styles = StyleSheet.create({
  card: { width: W - 32, height: 420, borderRadius: 20, overflow: "hidden", backgroundColor: "#111", alignSelf: "center" },
  bgImage: { ...StyleSheet.absoluteFillObject, resizeMode: "cover" as any },
  gradient: { ...StyleSheet.absoluteFillObject },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 14 },
  sourceBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  sourceDot: { width: 5, height: 5, borderRadius: 3 },
  sourceText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rankText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, gap: 8 },
  tags: { flexDirection: "row", gap: 8 },
  tag: { fontSize: 12, fontWeight: "700" },
  headline: { color: "#fff", fontSize: 20, fontWeight: "800", lineHeight: 26 },
  summary: { color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 18 },
  lowerThird: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10,10,20,0.85)", borderRadius: 8, overflow: "hidden", marginTop: 4 },
  ltAccent: { width: 3, alignSelf: "stretch" },
  ltContent: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  ltAuthor: { color: "#fff", fontSize: 12, fontWeight: "800" },
  ltEngagement: { color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 1 },
  ltTime: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", paddingRight: 10 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  actionText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
});
