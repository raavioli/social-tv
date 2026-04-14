/**
 * 100 in 100 — 100 headlines in 100 seconds.
 * Auto-advancing at 1 headline/sec. Tap to save. Pure rapid-fire.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { impact } from "../../src/lib/haptics";
import { MoodId, BulletinStory } from "@social-tv/shared";
import { MOODS } from "../../src/constants/moods";
import { api } from "../../src/lib/api";
import { recordInteraction } from "../../src/lib/interestTracker";

const { width: W } = Dimensions.get("window");
const TICK_MS = 1000; // 1 second per headline

export default function HundredInHundred() {
  const { mood, minutes } = useLocalSearchParams<{ mood: MoodId; minutes: string }>();
  const moodObj = MOODS.find((m) => m.id === mood);

  const [stories, setStories] = useState<BulletinStory[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const tickProgress = useRef(new Animated.Value(0)).current;
  const totalProgress = useRef(new Animated.Value(0)).current;
  const tickAnim = useRef<Animated.CompositeAnimation | null>(null);
  const totalAnim = useRef<Animated.CompositeAnimation | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    try {
      const result = await api.getBulletin({
        mood: mood ?? "energised",
        availableMinutes: 2,
        formatId: "hundred_in_hundred",
        channelIds: ["twitter", "instagram", "youtube", "linkedin"],
      });
      setStories(result.stories.slice(0, 100));
    } catch {
      // Generate 100 mock headlines
      setStories(Array.from({ length: 100 }, (_, i) => ({
        ...MOCK_STORY_BASE,
        rank: i + 1,
        feedItemId: String(i),
        headline: MOCK_HEADLINES[i % MOCK_HEADLINES.length].replace("{N}", String(i + 1)),
        tags: ["Tech", "AI"][i % 2] === "Tech" ? ["Tech"] : ["AI"],
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && stories.length > 0 && !paused && !done) {
      startTick();
      startTotalProgress();
    }
    return () => { stopTick(); };
  }, [loading, current, paused]);

  const startTick = () => {
    tickProgress.setValue(0);
    tickAnim.current = Animated.timing(tickProgress, {
      toValue: 1,
      duration: TICK_MS,
      useNativeDriver: false,
    });
    tickAnim.current.start(({ finished }) => {
      if (finished) advance();
    });
  };

  const startTotalProgress = () => {
    totalAnim.current = Animated.timing(totalProgress, {
      toValue: 1,
      duration: stories.length * TICK_MS,
      useNativeDriver: false,
    });
    totalAnim.current.start();
  };

  const stopTick = () => {
    tickAnim.current?.stop();
    totalAnim.current?.stop();
  };

  const advance = () => {
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setDone(true);
    }
  };

  const handleSave = () => {
    impact("light");
    const story = stories[current];
    setSaved((s) => new Set(s).add(current));
    recordInteraction({ storyId: story.feedItemId, tags: story.tags, platform: story.platform, type: "save", timestamp: new Date().toISOString() });
  };

  const secondsLeft = Math.max(0, stories.length - current);

  if (loading) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.center}>
          <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", top: 16, right: 20, padding: 10 }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.bigNum}>100</Text>
          <Text style={styles.loadingText}>Gathering 100 headlines...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (done) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.bigNum}>✅</Text>
          <Text style={styles.loadingText}>100 headlines done!</Text>
          <Text style={styles.savedCount}>{saved.size} saved</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
            <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.doneBtnGrad}>
              <Text style={styles.doneBtnText}>Back to channels →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const story = stories[current];

  return (
    <LinearGradient colors={["#0a0a0f", "#080818"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Total progress bar */}
        <Animated.View style={[styles.totalBar, {
          width: totalProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          backgroundColor: moodObj?.accentColor ?? "#6c47ff",
        }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>100 in 100</Text>
          <Text style={styles.timer}>{secondsLeft}s left</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tick progress */}
        <View style={styles.tickTrack}>
          <Animated.View style={[styles.tickFill, {
            width: tickProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            backgroundColor: moodObj?.accentColor ?? "#6c47ff",
          }]} />
        </View>

        {/* Big rank number */}
        <View style={styles.rankArea}>
          <Text style={[styles.rankNumber, { color: (moodObj?.accentColor ?? "#6c47ff") + "33" }]}>
            {story.rank}
          </Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineArea}>
          <Text style={styles.platform}>{story.platform.toUpperCase()}</Text>
          <Text style={styles.headline}>{story.headline}</Text>
          {story.tags.map((t) => (
            <Text key={t} style={styles.tag}>#{t}</Text>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => { setPaused((p) => !p); if (paused) startTick(); else stopTick(); }}
            style={styles.pauseBtn}
          >
            <Text style={styles.pauseBtnText}>{paused ? "▶ Resume" : "⏸ Pause"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, saved.has(current) && styles.saveBtnActive]}
          >
            <LinearGradient
              colors={saved.has(current) ? ["#6c47ff", "#a855f7"] : ["#1a1a2e", "#1a1a2e"]}
              style={styles.saveBtnGrad}
            >
              <Text style={styles.saveBtnText}>
                {saved.has(current) ? "🔖 Saved" : "🔖 Save"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Tap save to bookmark · Tap pause to stop · Swipe up to skip
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const MOCK_STORY_BASE: BulletinStory = {
  rank: 1, feedItemId: "1", headline: "", oneliner: "", whyItMatters: "",
  readingTimeSec: 1, platform: "twitter", url: "#", tags: ["Tech"], relevanceScore: 8, moodFit: 8,
};

const MOCK_HEADLINES = [
  "OpenAI releases model that writes better code than 90% of engineers",
  "Apple announces spatial computing glasses at $999 — ships next month",
  "Bitcoin ETF sees record $3.2B inflow in single session",
  "Mars mission crew reports unexpected atmospheric discovery #{N}",
  "React 20 ships with built-in AI streaming primitives",
  "Tesla autonomous driving approved in 47 US states",
  "LinkedIn adds AI co-pilot that auto-responds to recruiters",
  "GitHub Copilot X now writes entire pull requests autonomously",
  "EU passes sweeping AI regulation affecting all frontier models",
  "SpaceX completes 200th successful orbital launch of the year",
];

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  bigNum: { color: "#fff", fontSize: 80, fontWeight: "900" },
  loadingText: { color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: "700" },
  savedCount: { color: "#a78bfa", fontSize: 16, fontWeight: "800" },
  doneBtn: { borderRadius: 14, overflow: "hidden", alignSelf: "stretch", margin: 24 },
  doneBtnGrad: { paddingVertical: 16, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  totalBar: { height: 3, position: "absolute", top: 0, left: 0 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingTop: 20, gap: 12 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900", flex: 1 },
  timer: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "700" },
  closeBtn: { color: "rgba(255,255,255,0.4)", fontSize: 18 },
  tickTrack: { height: 2, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 16, borderRadius: 1, overflow: "hidden" },
  tickFill: { height: "100%", borderRadius: 1 },
  rankArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  rankNumber: { fontSize: 180, fontWeight: "900", lineHeight: 200 },
  headlineArea: { padding: 24, gap: 8 },
  platform: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  headline: { color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 30, letterSpacing: -0.3 },
  tag: { color: "#a78bfa", fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  pauseBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  pauseBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "700" },
  saveBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  saveBtnActive: {},
  saveBtnGrad: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  footer: { color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", paddingBottom: 16 },
});
