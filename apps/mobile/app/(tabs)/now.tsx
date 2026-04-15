import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  ActivityIndicator, SafeAreaView, RefreshControl, Share,
  Animated, Dimensions, FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// BlurView removed for Android compatibility
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { StoryCard, PresenterNameplate, NewsTicker, ChannelIdent } from "../../src/components/broadcast";
import { PERSONAS } from "../../src/constants/personas";
import { api } from "../../src/lib/api";
import { FeedItem } from "@social-tv/shared";

const { width: W, height: H } = Dimensions.get("window");

// Topic-based TV channels
const TV_CHANNELS = [
  { id: "for_you",       label: "For You",        emoji: "⭐", color: "#6c47ff", colorEnd: "#a855f7" },
  { id: "trending",      label: "Trending",       emoji: "🔥", color: "#ef4444", colorEnd: "#f97316" },
  { id: "tech",          label: "Tech & AI",      emoji: "💻", color: "#3b82f6", colorEnd: "#6366f1" },
  { id: "entertainment", label: "Entertainment",  emoji: "🎭", color: "#f59e0b", colorEnd: "#eab308" },
  { id: "business",      label: "Business",       emoji: "💼", color: "#0ea5e9", colorEnd: "#0284c7" },
  { id: "sports",        label: "Sports",         emoji: "🏆", color: "#22c55e", colorEnd: "#16a34a" },
  { id: "lifestyle",     label: "Lifestyle",      emoji: "🌿", color: "#10b981", colorEnd: "#059669" },
  { id: "your_updates",  label: "Your Updates",   emoji: "👤", color: "#8b5cf6", colorEnd: "#7c3aed" },
];

// Cross-platform mock data classified by topic
const MOCK_BY_CHANNEL: Record<string, FeedItem[]> = {
  for_you: [
    { id: "fy1", channelId: "for_you", platform: "twitter", type: "post", title: "Your AI post is going viral", summary: "2,400 likes in the last hour. Your thread on building with Claude is resonating.", author: "You", authorHandle: "@you", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 30*60000).toISOString(), engagementScore: 9.8, stats: { likes: 2400, comments: 180 }, tags: ["AI", "Viral"], imageUrl: "https://picsum.photos/seed/fy1/800/600" },
    { id: "fy2", channelId: "for_you", platform: "youtube", type: "video", title: "New documentary from your favourite creator", summary: "Building an AI app in 24 hours — everything that went wrong and right.", author: "Fav Creator", authorHandle: "@favcreator", source: "YouTube", url: "", publishedAt: new Date(Date.now() - 2*3600000).toISOString(), engagementScore: 9.5, stats: { views: 280000, likes: 18000 }, tags: ["AI", "Documentary"], imageUrl: "https://picsum.photos/seed/fy2/800/600" },
    { id: "fy3", channelId: "for_you", platform: "linkedin", type: "article", title: "15 people viewed your profile this week", summary: "Your recent post about open source is driving professional interest.", author: "LinkedIn", authorHandle: "@linkedin", source: "LinkedIn", url: "", publishedAt: new Date(Date.now() - 4*3600000).toISOString(), engagementScore: 8.5, stats: { likes: 42 }, tags: ["Career"], imageUrl: "https://picsum.photos/seed/fy3/800/600" },
  ],
  trending: [
    { id: "tr1", channelId: "trending", platform: "twitter", type: "post", title: "OpenAI announces GPT-5", summary: "Real-time video understanding, 1M token context, and native tool use. Available next week.", author: "OpenAI", authorHandle: "@openai", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 45*60000).toISOString(), engagementScore: 10, stats: { likes: 94000, comments: 12000, shares: 31000 }, tags: ["AI", "Breaking"], imageUrl: "https://picsum.photos/seed/tr1/800/600" },
    { id: "tr2", channelId: "trending", platform: "instagram", type: "reel", title: "This street food reel has 50M views", summary: "A chef in Tokyo making the perfect omelette. The internet can't stop watching.", author: "FoodVibes", authorHandle: "@foodvibes", source: "Instagram", url: "", publishedAt: new Date(Date.now() - 3*3600000).toISOString(), engagementScore: 9.7, stats: { views: 50000000, likes: 4200000 }, tags: ["Food", "Viral"], imageUrl: "https://picsum.photos/seed/tr2/800/600" },
  ],
  tech: [
    { id: "te1", channelId: "tech", platform: "twitter", type: "post", title: "React Native 0.78 ships new architecture by default", summary: "Fabric renderer and TurboModules are now the default. Massive performance gains.", author: "React Native", authorHandle: "@reactnative", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 2*3600000).toISOString(), engagementScore: 9.2, stats: { likes: 5600, comments: 430 }, tags: ["React", "Dev"], imageUrl: "https://picsum.photos/seed/te1/800/600" },
    { id: "te2", channelId: "tech", platform: "youtube", type: "video", title: "Why most AI startups will fail in 2026", summary: "A deep analysis of the AI market bubble and what separates winners from losers.", author: "TechAnalyst", authorHandle: "@techanalyst", source: "YouTube", url: "", publishedAt: new Date(Date.now() - 5*3600000).toISOString(), engagementScore: 8.8, stats: { views: 120000 }, tags: ["AI", "Startups"], imageUrl: "https://picsum.photos/seed/te2/800/600" },
    { id: "te3", channelId: "tech", platform: "linkedin", type: "article", title: "The future of coding is conversational", summary: "How AI pair programming is changing the way teams ship software.", author: "TechLead", authorHandle: "@techlead", source: "LinkedIn", url: "", publishedAt: new Date(Date.now() - 8*3600000).toISOString(), engagementScore: 8.2, stats: { likes: 1200, comments: 89 }, tags: ["AI", "Dev"], imageUrl: "https://picsum.photos/seed/te3/800/600" },
  ],
  entertainment: [
    { id: "en1", channelId: "entertainment", platform: "instagram", type: "reel", title: "Your reel just hit 10K plays", summary: "The one from last weekend is still getting saves and shares.", author: "You", authorHandle: "@you", source: "Instagram", url: "", publishedAt: new Date(Date.now() - 6*3600000).toISOString(), engagementScore: 9, stats: { views: 10000, likes: 890 }, tags: ["Content"], imageUrl: "https://picsum.photos/seed/en1/800/600" },
    { id: "en2", channelId: "entertainment", platform: "youtube", type: "video", title: "New music video just dropped", summary: "Your favourite artist released the visuals for their latest single.", author: "MusicChannel", authorHandle: "@musicchannel", source: "YouTube", url: "", publishedAt: new Date(Date.now() - 3*3600000).toISOString(), engagementScore: 8.7, stats: { views: 2500000, likes: 180000 }, tags: ["Music"], imageUrl: "https://picsum.photos/seed/en2/800/600" },
  ],
  business: [
    { id: "bu1", channelId: "business", platform: "linkedin", type: "article", title: "Why I left a $400K job to build in public", summary: "After 8 years in big tech, I made the leap. 3 months in — here's my honest take.", author: "Founder Friend", authorHandle: "@founderfriend", source: "LinkedIn", url: "", publishedAt: new Date(Date.now() - 4*3600000).toISOString(), engagementScore: 9.2, stats: { likes: 4200, comments: 890 }, tags: ["Career", "Startup"], imageUrl: "https://picsum.photos/seed/bu1/800/600" },
    { id: "bu2", channelId: "business", platform: "twitter", type: "post", title: "Markets surge as Fed signals rate pause", summary: "S&P 500 up 2.3%. Tech stocks leading the rally.", author: "Markets", authorHandle: "@markets", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 1*3600000).toISOString(), engagementScore: 8.5, stats: { likes: 1800 }, tags: ["Finance"], imageUrl: "https://picsum.photos/seed/bu2/800/600" },
  ],
  sports: [
    { id: "sp1", channelId: "sports", platform: "twitter", type: "post", title: "Champions League semi-final results", summary: "Two incredible matches decided by stoppage-time goals. Full highlights inside.", author: "ESPN", authorHandle: "@espn", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 2*3600000).toISOString(), engagementScore: 9.4, stats: { likes: 23000, shares: 8900 }, tags: ["Football"], imageUrl: "https://picsum.photos/seed/sp1/800/600" },
  ],
  lifestyle: [
    { id: "li1", channelId: "lifestyle", platform: "instagram", type: "reel", title: "Morning routine that changed everything", summary: "5am club, cold plunge, 20 min meditation — 30 days in and the results are real.", author: "WellnessGuru", authorHandle: "@wellnessguru", source: "Instagram", url: "", publishedAt: new Date(Date.now() - 7*3600000).toISOString(), engagementScore: 8.3, stats: { likes: 12000 }, tags: ["Wellness"], imageUrl: "https://picsum.photos/seed/li1/800/600" },
  ],
  your_updates: [
    { id: "yu1", channelId: "your_updates", platform: "twitter", type: "post", title: "Your AI thread: 2,400 likes and climbing", summary: "People are sharing it with their teams. 93 replies — some great discussions happening.", author: "You", authorHandle: "@you", source: "Twitter", url: "", publishedAt: new Date(Date.now() - 30*60000).toISOString(), engagementScore: 9.8, stats: { likes: 2400, comments: 93, shares: 210 }, tags: ["AI", "Viral"], imageUrl: "https://picsum.photos/seed/yu1/800/600" },
    { id: "yu2", channelId: "your_updates", platform: "instagram", type: "reel", title: "Your reel: 10K plays", summary: "Still getting saves. Instagram pushed it to Explore.", author: "You", authorHandle: "@you", source: "Instagram", url: "", publishedAt: new Date(Date.now() - 6*3600000).toISOString(), engagementScore: 9, stats: { views: 10000, likes: 890 }, tags: ["Content"], imageUrl: "https://picsum.photos/seed/yu2/800/600" },
    { id: "yu3", channelId: "your_updates", platform: "linkedin", type: "article", title: "15 profile views this week", summary: "Your open source post is driving professional interest.", author: "You", authorHandle: "@you", source: "LinkedIn", url: "", publishedAt: new Date(Date.now() - 4*3600000).toISOString(), engagementScore: 8.5, stats: { likes: 42 }, tags: ["Career"], imageUrl: "https://picsum.photos/seed/yu3/800/600" },
  ],
};

export default function TodayScreen() {
  const { settings, connectedAccounts, retainItem } = useAppStore();
  const [activeChannel, setActiveChannel] = useState("for_you");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const tuneAnim = useRef(new Animated.Value(1)).current;
  const channelListRef = useRef<FlatList>(null);
  const [showIdent, setShowIdent] = useState(false);

  const persona = PERSONAS.find(p => p.id === settings.selectedPersonaId) ?? PERSONAS[0];
  const channel = TV_CHANNELS.find(c => c.id === activeChannel)!;

  const CARD_HEIGHT = H * 0.55 + 16;

  // Presenter lines per channel
  const presenterGreetings: Record<string, string> = {
    for_you: `Here's what matters to you right now.`,
    trending: `These stories are blowing up across your feeds.`,
    tech: `The latest from the world of tech and AI.`,
    entertainment: `Time to unwind — here's what's entertaining.`,
    business: `Let's talk business and career moves.`,
    sports: `Here are the highlights you need to see.`,
    lifestyle: `Good vibes and inspiration coming up.`,
    your_updates: `Let's check how your content is performing.`,
  };

  const playTune = () => {
    Animated.sequence([
      Animated.timing(tuneAnim, { toValue: 0.1, duration: 60, useNativeDriver: true }),
      Animated.timing(tuneAnim, { toValue: 0.7, duration: 40, useNativeDriver: true }),
      Animated.timing(tuneAnim, { toValue: 0.15, duration: 30, useNativeDriver: true }),
      Animated.timing(tuneAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const switchChannel = (channelId: string) => {
    setActiveChannel(channelId);
    setActiveCardIndex(0);
    setLoading(true);
    setShowIdent(true);
    playTune();
  };

  useEffect(() => {
    // Load stories for active channel
    const channelStories = MOCK_BY_CHANNEL[activeChannel] ?? [];
    // Simulate API delay
    const timer = setTimeout(() => {
      setItems(channelStories);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeChannel]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Back to Director's Desk */}
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ color: "#6c47ff", fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.showInfo}>📺 SocialTV · {items.length} stories</Text>
          </View>
          <Pressable onPress={() => router.push("/bulletin")} style={styles.bulletinChip}>
            <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.bulletinChipGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.bulletinChipText}>📋 Bulletin</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Channel strip — horizontal TV channel bar */}
        <FlatList
          ref={channelListRef}
          data={TV_CHANNELS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.channelStrip}
          renderItem={({ item: ch }) => {
            const isActive = ch.id === activeChannel;
            return (
              <Pressable onPress={() => switchChannel(ch.id)}>
                {isActive ? (
                  <LinearGradient colors={[ch.color, ch.colorEnd]} style={[styles.channelPill, styles.channelPillActive]}>
                    <Text style={styles.channelEmoji}>{ch.emoji}</Text>
                    <Text style={styles.channelLabelActive}>{ch.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.channelPill}>
                    <Text style={styles.channelEmoji}>{ch.emoji}</Text>
                    <Text style={styles.channelLabel}>{ch.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />

        {/* Now showing banner */}
        <View style={styles.nowShowing}>
          <LinearGradient colors={[channel.color + "20", "transparent"]} style={styles.nowShowingGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={[styles.nowDot, { backgroundColor: channel.color }]} />
            <Text style={styles.nowText}>NOW SHOWING</Text>
            <Text style={styles.nowChannel}>{channel.emoji} {channel.label}</Text>
          </LinearGradient>
        </View>

        {/* Presenter */}
        <PresenterNameplate
          emoji={persona.avatarEmoji}
          name={persona.name}
          role="Presenter"
          line={presenterGreetings[activeChannel] ?? "Here's what's new."}
          accentColor={channel.color}
        />

        {/* Stories */}
        <Animated.View style={[{ flex: 1 }, { opacity: tuneAnim }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={channel.color} size="large" />
              <Text style={styles.loadingText}>Tuning to {channel.label}...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyChannelEmoji}>{channel.emoji}</Text>
              <Text style={styles.emptyChannelText}>No stories on this channel yet</Text>
            </View>
          ) : (
            <ScrollView
              snapToInterval={CARD_HEIGHT}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT);
                setActiveCardIndex(idx);
              }}
              scrollEventThrottle={16}
            >
              {items.map((item, i) => (
                <View key={item.id} style={{ height: CARD_HEIGHT, justifyContent: "center", paddingHorizontal: 16 }}>
                  <StoryCard
                    item={item}
                    rank={i + 1}
                    channelColor={channel.color}
                    onSave={() => retainItem(item, "remember")}
                    onSkip={() => {}}
                  />
                </View>
              ))}
              <View style={{ height: 80 }} />
            </ScrollView>
          )}
        </Animated.View>

        {/* Story counter */}
        {!loading && items.length > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>{activeCardIndex + 1} / {items.length}</Text>
          </View>
        )}
        {/* News ticker at bottom */}
        <NewsTicker
          headlines={items.map(i => i.title ?? i.summary)}
          accentColor={channel.color}
          label={channel.label.toUpperCase()}
        />

        {/* Channel ident overlay */}
        <ChannelIdent
          channelName={channel.label}
          channelEmoji={channel.emoji}
          color={channel.color}
          storyCount={(MOCK_BY_CHANNEL[activeChannel] ?? []).length}
          visible={showIdent}
          onComplete={() => setShowIdent(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  greeting: { color: "#fff", fontSize: 18, fontWeight: "800" },
  showInfo: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 },
  bulletinChip: { borderRadius: 20, overflow: "hidden" },
  bulletinChipGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  bulletinChipText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  channelStrip: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  channelPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  channelPillActive: { borderColor: "transparent" },
  channelEmoji: { fontSize: 14 },
  channelLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  channelLabelActive: { color: "#fff", fontSize: 12, fontWeight: "800" },
  nowShowing: { marginHorizontal: 16, marginBottom: 4, borderRadius: 8, overflow: "hidden" },
  nowShowingGrad: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 6 },
  nowDot: { width: 6, height: 6, borderRadius: 3 },
  nowText: { color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  nowChannel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  emptyChannelEmoji: { fontSize: 48, opacity: 0.5 },
  emptyChannelText: { color: "rgba(255,255,255,0.3)", fontSize: 14 },
  scrollContent: { paddingTop: 4 },
  counter: { position: "absolute", bottom: 90, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  counterText: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center" },
  emptySub: { color: "rgba(255,255,255,0.45)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  connectBtn: { borderRadius: 16, overflow: "hidden", alignSelf: "stretch", marginTop: 8 },
  connectBtnGrad: { paddingVertical: 16, alignItems: "center" },
  connectBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
