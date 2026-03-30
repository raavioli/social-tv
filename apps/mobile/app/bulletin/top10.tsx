/**
 * Top 10 / Top 100 — ranked digest.
 * Same screen, different storyCount based on format.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { MoodId, BulletinStory } from "@social-tv/shared";
import { MOODS, BULLETIN_FORMATS } from "../../src/constants/moods";
import { api } from "../../src/lib/api";
import { recordInteraction } from "../../src/lib/interestTracker";
import { useAppStore } from "../../src/store/useAppStore";

export default function TopN() {
  const { mood, minutes, format } = useLocalSearchParams<{ mood: MoodId; minutes: string; format?: string }>();
  const formatId = (format as any) ?? "top10";
  const moodObj = MOODS.find((m) => m.id === mood);
  const fmt = BULLETIN_FORMATS.find((f) => f.id === formatId);
  const { connectedAccounts, retainItem } = useAppStore();

  const [stories, setStories] = useState<BulletinStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const platformIds = connectedAccounts.map((a) => a.platform);
      const result = await api.getBulletin({
        mood: mood ?? "curious",
        availableMinutes: Number(minutes) || 10,
        formatId: formatId as any,
        channelIds: platformIds.length ? platformIds : ["twitter"],
      });
      setStories(result.stories);
    } catch {
      const count = formatId === "top100" ? 100 : 10;
      setStories(Array.from({ length: count }, (_, i) => ({
        rank: i + 1,
        feedItemId: String(i),
        headline: `Story #${i + 1}: ${MOCK_TOPICS[i % MOCK_TOPICS.length]}`,
        oneliner: "A significant development that affects how you work and live.",
        whyItMatters: "Based on your interests and recent activity.",
        readingTimeSec: 15,
        platform: ["twitter", "linkedin", "youtube", "instagram"][i % 4],
        imageUrl: `https://picsum.photos/seed/top${i}/400/250`,
        url: "#",
        tags: [MOCK_TOPICS[i % MOCK_TOPICS.length]],
        relevanceScore: Math.max(5, 10 - i * 0.05),
        moodFit: Math.max(5, 9 - i * 0.03),
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (story: BulletinStory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaved((s) => new Set(s).add(story.feedItemId));
    recordInteraction({ storyId: story.feedItemId, tags: story.tags, platform: story.platform, type: "save", timestamp: new Date().toISOString() });
  };

  const handleSkip = (story: BulletinStory) => {
    recordInteraction({ storyId: story.feedItemId, tags: story.tags, platform: story.platform, type: "skip", timestamp: new Date().toISOString() });
  };

  const PLATFORM_COLORS: Record<string, string> = {
    twitter: "#000", instagram: "#833ab4", youtube: "#ff0000", linkedin: "#0077b5",
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.heading}>{fmt?.emoji} {fmt?.name}</Text>
            <Text style={styles.subheading}>
              {moodObj?.emoji} {moodObj?.label} · {stories.length} stories personalised for you
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>
              Ranking your {fmt?.name ?? "Top 10"}...
            </Text>
          </View>
        ) : (
          <FlatList
            data={stories}
            keyExtractor={(item) => item.feedItemId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: story }) => {
              const isSaved = saved.has(story.feedItemId);
              const platformColor = PLATFORM_COLORS[story.platform] ?? "#6c47ff";
              const relevancePct = Math.round(story.relevanceScore * 10);

              return (
                <View style={styles.card}>
                  {/* Rank badge */}
                  <View style={styles.rankCol}>
                    <Text style={styles.rankNum}>{story.rank}</Text>
                    <View style={[styles.platformDot, { backgroundColor: platformColor }]} />
                  </View>

                  <View style={styles.cardBody}>
                    {/* Image */}
                    {story.imageUrl && (
                      <Image source={{ uri: story.imageUrl }} style={styles.thumb} />
                    )}

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardHeadline} numberOfLines={3}>
                        {story.headline}
                      </Text>
                      <Text style={styles.cardOneliner} numberOfLines={2}>
                        {story.oneliner}
                      </Text>

                      {/* Why it matters */}
                      <Text style={styles.whyText} numberOfLines={2}>
                        💡 {story.whyItMatters}
                      </Text>

                      {/* Meta row */}
                      <View style={styles.metaRow}>
                        <Text style={styles.metaPlatform}>{story.platform}</Text>
                        <View style={[styles.matchBadge, { backgroundColor: relevancePct > 80 ? "#6c47ff22" : "#33333322" }]}>
                          <Text style={[styles.matchText, { color: relevancePct > 80 ? "#a78bfa" : "rgba(255,255,255,0.3)" }]}>
                            {relevancePct}% match
                          </Text>
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          onPress={() => handleSave(story)}
                          style={[styles.cardBtn, isSaved && styles.cardBtnSaved]}
                        >
                          <Text style={[styles.cardBtnText, isSaved && styles.cardBtnTextSaved]}>
                            {isSaved ? "🔖 Saved" : "🔖 Save"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(story.url)}
                          style={styles.cardBtn}
                        >
                          <Text style={styles.cardBtnText}>Read →</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleSkip(story)}
                          style={styles.cardBtn}
                        >
                          <Text style={styles.cardBtnText}>Not for me</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  You've seen all {stories.length} stories · {saved.size} saved
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const MOCK_TOPICS = ["AI", "Tech", "Finance", "Space", "Dev", "Crypto", "Science", "Startup", "Design", "Career"];

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  back: { color: "rgba(255,255,255,0.5)", fontSize: 20, padding: 4 },
  headerCenter: { flex: 1, gap: 2 },
  heading: { color: "#fff", fontSize: 22, fontWeight: "900" },
  subheading: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "rgba(255,255,255,0.5)", fontSize: 16 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 0,
  },
  rankCol: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    gap: 8,
  },
  rankNum: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "900" },
  platformDot: { width: 6, height: 6, borderRadius: 3 },
  cardBody: { flex: 1 },
  thumb: { width: "100%", height: 120, resizeMode: "cover" },
  cardContent: { padding: 12, gap: 6 },
  cardHeadline: { color: "#fff", fontSize: 15, fontWeight: "800", lineHeight: 21 },
  cardOneliner: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 17 },
  whyText: { color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 16, fontStyle: "italic" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaPlatform: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  matchBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  matchText: { fontSize: 10, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 6, marginTop: 4 },
  cardBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, paddingVertical: 7, alignItems: "center" },
  cardBtnSaved: { backgroundColor: "rgba(108,71,255,0.2)" },
  cardBtnText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700" },
  cardBtnTextSaved: { color: "#a78bfa" },
  footer: { alignItems: "center", paddingVertical: 24 },
  footerText: { color: "rgba(255,255,255,0.2)", fontSize: 13 },
});
