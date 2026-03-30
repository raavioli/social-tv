/**
 * Flash Briefing — voiced catch-up, one sentence per story.
 * Auto-advances with progress bar. Works like a podcast reel.
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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../../src/store/useAppStore";
import { MOODS } from "../../src/constants/moods";
import { api } from "../../src/lib/api";
import { BulletinStory, MoodId } from "@social-tv/shared";
import { recordInteraction } from "../../src/lib/interestTracker";

const { width: W, height: H } = Dimensions.get("window");
const STORY_DURATION_MS = 6000; // 6 sec per story in auto mode

export default function FlashBriefing() {
  const { mood, minutes } = useLocalSearchParams<{ mood: MoodId; minutes: string }>();
  const { connectedAccounts, retainItem } = useAppStore();
  const moodObj = MOODS.find((m) => m.id === mood);

  const [stories, setStories] = useState<BulletinStory[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);
  const dwellStart = useRef(Date.now());

  const storyCount = Math.max(3, Math.min(10, Math.floor(Number(minutes) * 1.2)));

  useEffect(() => { loadBulletin(); }, []);

  const loadBulletin = async () => {
    try {
      const platformIds = connectedAccounts.map((a) => a.platform);
      const result = await api.getBulletin({
        mood: mood ?? "curious",
        availableMinutes: Number(minutes) || 5,
        formatId: "flash",
        channelIds: platformIds.length ? platformIds : ["twitter"],
      });
      setStories(result.stories.slice(0, storyCount));
    } catch {
      setStories(MOCK_FLASH_STORIES.slice(0, storyCount));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && stories.length > 0 && !paused && !done) {
      startProgress();
    }
    return () => { progressAnim.current?.stop(); };
  }, [loading, current, paused]);

  const startProgress = () => {
    progress.setValue(0);
    progressAnim.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });
    progressAnim.current.start(({ finished }) => {
      if (finished) advance();
    });
  };

  const advance = () => {
    trackDwell();
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
      dwellStart.current = Date.now();
    } else {
      setDone(true);
    }
  };

  const goBack = () => {
    trackDwell();
    if (current > 0) {
      setCurrent((c) => c - 1);
      dwellStart.current = Date.now();
      progress.setValue(0);
    }
  };

  const trackDwell = () => {
    const story = stories[current];
    if (!story) return;
    recordInteraction({
      storyId: story.feedItemId,
      tags: story.tags,
      platform: story.platform,
      type: "dwell",
      dwellMs: Date.now() - dwellStart.current,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const story = stories[current];
    recordInteraction({ storyId: story.feedItemId, tags: story.tags, platform: story.platform, type: "save", timestamp: new Date().toISOString() });
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    const story = stories[current];
    recordInteraction({ storyId: story.feedItemId, tags: story.tags, platform: story.platform, type: "skip", timestamp: new Date().toISOString() });
    advance();
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.loadingEmoji}>⚡</Text>
          <Text style={styles.loadingText}>
            Building your {minutes}min flash briefing...
          </Text>
          <Text style={styles.loadingSubtext}>
            {moodObj?.emoji} {moodObj?.label} mode · Personalising to your interests
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (done) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.center}>
          <Text style={styles.loadingEmoji}>✅</Text>
          <Text style={styles.loadingText}>You're all caught up!</Text>
          <Text style={styles.loadingSubtext}>
            {stories.length} stories in ~{minutes} minutes
          </Text>
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
    <View style={styles.bg}>
      {/* Background image */}
      {story.imageUrl && (
        <Image source={{ uri: story.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      )}
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.97)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safe}>
        {/* Progress bars */}
        <View style={styles.progressRow}>
          {stories.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              {i < current ? (
                <View style={[styles.progressFill, { width: "100%", backgroundColor: moodObj?.accentColor ?? "#6c47ff" }]} />
              ) : i === current ? (
                <Animated.View
                  style={[styles.progressFill, {
                    width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                    backgroundColor: moodObj?.accentColor ?? "#6c47ff",
                  }]}
                />
              ) : null}
            </View>
          ))}
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <BlurView intensity={20} tint="dark" style={styles.modePill}>
            <Text style={styles.modeText}>
              {moodObj?.emoji} Flash · {minutes}min
            </Text>
          </BlurView>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hit areas for prev/next */}
        <View style={styles.hitAreas}>
          <TouchableOpacity style={styles.hitLeft} onPress={goBack} />
          <TouchableOpacity style={styles.hitRight} onPress={advance} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Rank + relevance */}
          <View style={styles.metaRow}>
            <BlurView intensity={25} tint="dark" style={styles.rankPill}>
              <Text style={styles.rankText}>#{story.rank}</Text>
            </BlurView>
            <BlurView intensity={25} tint="dark" style={styles.rankPill}>
              <Text style={styles.rankText}>
                {Math.round(story.relevanceScore * 10)}% match
              </Text>
            </BlurView>
            <BlurView intensity={25} tint="dark" style={styles.rankPill}>
              <Text style={styles.rankText}>{story.platform}</Text>
            </BlurView>
          </View>

          <Text style={styles.headline}>{story.headline}</Text>
          <Text style={styles.oneliner}>{story.oneliner}</Text>

          {/* Why it matters */}
          <BlurView intensity={20} tint="dark" style={styles.whyBox}>
            <Text style={styles.whyLabel}>Why it matters to you</Text>
            <Text style={styles.whyText}>{story.whyItMatters}</Text>
          </BlurView>

          {/* Actions */}
          <View style={styles.actions}>
            <ActionBtn emoji="⏭️" label="Skip" onPress={handleSkip} />
            <ActionBtn emoji="🔖" label="Save" onPress={handleSave} color={moodObj?.accentColor} />
            <ActionBtn emoji="⏸️" label={paused ? "Play" : "Pause"} onPress={() => {
              if (paused) { setPaused(false); }
              else { progressAnim.current?.stop(); setPaused(true); }
            }} />
          </View>

          {/* Story counter */}
          <Text style={styles.counter}>
            {current + 1} / {stories.length}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const ActionBtn = ({ emoji, label, onPress, color }: { emoji: string; label: string; onPress: () => void; color?: string }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionBtn}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={[styles.actionLabel, color ? { color } : {}]}>{label}</Text>
  </TouchableOpacity>
);

const MOCK_FLASH_STORIES: BulletinStory[] = [
  { rank: 1, feedItemId: "1", headline: "OpenAI ships GPT-5 with 10x reasoning", oneliner: "The new model outperforms humans on 90% of standardised benchmarks.", whyItMatters: "You follow AI closely — this changes the tools you use daily.", readingTimeSec: 6, platform: "twitter", imageUrl: "https://picsum.photos/seed/f1/800/1200", url: "#", tags: ["AI", "Tech"], relevanceScore: 9.8, moodFit: 9 },
  { rank: 2, feedItemId: "2", headline: "Bitcoin hits $130k as ETF inflows surge", oneliner: "Institutional demand reached a record $2.1B in a single day.", whyItMatters: "Your finance channel has been tracking this rally for 3 weeks.", readingTimeSec: 6, platform: "linkedin", imageUrl: "https://picsum.photos/seed/f2/800/1200", url: "#", tags: ["Crypto", "Finance"], relevanceScore: 8.5, moodFit: 7 },
  { rank: 3, feedItemId: "3", headline: "SpaceX Starship completes first Mars flyby", oneliner: "Six astronauts captured stunning close-range imagery of Mars.", whyItMatters: "You've saved 4 SpaceX stories this week — this is the big one.", readingTimeSec: 6, platform: "youtube", imageUrl: "https://picsum.photos/seed/f3/800/1200", url: "#", tags: ["Space", "SpaceX"], relevanceScore: 9.9, moodFit: 10 },
  { rank: 4, feedItemId: "4", headline: "React 20 ships with native AI component tree", oneliner: "The new AI primitives let developers add streaming UI in 3 lines.", whyItMatters: "You saved a React 19 article last month — this is the sequel.", readingTimeSec: 6, platform: "twitter", imageUrl: "https://picsum.photos/seed/f4/800/1200", url: "#", tags: ["React", "Dev", "AI"], relevanceScore: 9.2, moodFit: 9 },
  { rank: 5, feedItemId: "5", headline: "Your LinkedIn post crossed 10,000 views", oneliner: "The article you published Tuesday is trending in your network.", whyItMatters: "It's your post — your audience is responding.", readingTimeSec: 5, platform: "linkedin", imageUrl: "https://picsum.photos/seed/f5/800/1200", url: "#", tags: ["LinkedIn", "Personal"], relevanceScore: 10, moodFit: 10 },
];

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#000" },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  loadingEmoji: { fontSize: 56 },
  loadingText: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" },
  loadingSubtext: { color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center" },
  doneBtn: { borderRadius: 14, overflow: "hidden", alignSelf: "stretch", marginTop: 16 },
  doneBtnGrad: { paddingVertical: 16, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  progressRow: { flexDirection: "row", gap: 4, paddingHorizontal: 16, paddingTop: 12 },
  progressTrack: { flex: 1, height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10 },
  modePill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, overflow: "hidden" },
  modeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  closeBtn: { color: "rgba(255,255,255,0.6)", fontSize: 18, padding: 4 },
  hitAreas: { ...StyleSheet.absoluteFillObject, flexDirection: "row", top: 80 },
  hitLeft: { flex: 1 },
  hitRight: { flex: 1 },
  content: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, gap: 12 },
  metaRow: { flexDirection: "row", gap: 8 },
  rankPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, overflow: "hidden" },
  rankText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  headline: { color: "#fff", fontSize: 26, fontWeight: "900", lineHeight: 32, letterSpacing: -0.5 },
  oneliner: { color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 22 },
  whyBox: { borderRadius: 14, padding: 14, overflow: "hidden", gap: 4 },
  whyLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  whyText: { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: "row", gap: 12, justifyContent: "center" },
  actionBtn: { flex: 1, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, paddingVertical: 12, gap: 4 },
  actionEmoji: { fontSize: 20 },
  actionLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "700" },
  counter: { color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", paddingBottom: 8 },
});
