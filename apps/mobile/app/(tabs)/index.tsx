import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Share,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { NewsCard } from "../../src/components/NewsCard";
import { PERSONAS } from "../../src/constants/personas";
import { PLATFORMS } from "../../src/constants/platforms";
import { api } from "../../src/lib/api";
import { FeedItem } from "@social-tv/shared";

const { width: W, height: H } = Dimensions.get("window");
const CARD_HEIGHT = H * 0.72 + 16;

export default function TodayScreen() {
  const {
    settings,
    connectedAccounts,
    activeChannelIndex,
    nextChannel,
    prevChannel,
    setActiveChannelIndex,
    retainItem,
  } = useAppStore();

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // TV tuning animation
  const tuneOpacity = useRef(new Animated.Value(1)).current;

  const activeAccount = connectedAccounts[activeChannelIndex];
  const persona = PERSONAS.find((p) => p.id === settings.selectedPersonaId)!;
  const platform = activeAccount ? PLATFORMS.find((p) => p.id === activeAccount.platform) : null;

  const playTuneAnimation = () => {
    Animated.sequence([
      Animated.timing(tuneOpacity, { toValue: 0.1, duration: 80, useNativeDriver: true }),
      Animated.timing(tuneOpacity, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(tuneOpacity, { toValue: 0.2, duration: 40, useNativeDriver: true }),
      Animated.timing(tuneOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const load = useCallback(async () => {
    if (!activeAccount) {
      setItems(MOCK_ITEMS);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const feed = await api.getFeed([activeAccount.platform]);
      setItems(feed);
    } catch {
      setItems(MOCK_ITEMS_BY_PLATFORM[activeAccount.platform] ?? MOCK_ITEMS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    setLoading(true);
    setActiveCardIndex(0);
    playTuneAnimation();
    load();
  }, [activeChannelIndex]);

  const handleChannelChange = (dir: "next" | "prev") => {
    if (dir === "next") nextChannel();
    else prevChannel();
  };

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 17 ? "Good afternoon" : "Good evening";

  if (connectedAccounts.length === 0) {
    return (
      <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📺</Text>
            <Text style={styles.emptyTitle}>No channels yet</Text>
            <Text style={styles.emptySub}>
              Connect your social accounts to start watching your personalised TV channel.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/connect")}
              style={styles.connectBtn}
            >
              <LinearGradient
                colors={["#6c47ff", "#a855f7"]}
                style={styles.connectBtnGrad}
              >
                <Text style={styles.connectBtnText}>Connect Accounts →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* TV Channel OSD (On-Screen Display) */}
        <View style={styles.osd}>
          {/* Left: greeting + host */}
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.hostLine}>
              {persona.avatarEmoji} {persona.name} · {items.length} stories
            </Text>
          </View>

          {/* Right: channel indicator */}
          {platform && activeAccount && (
            <BlurView intensity={30} tint="dark" style={styles.channelBadge}>
              <LinearGradient
                colors={[platform.color, platform.colorEnd]}
                style={styles.channelDot}
              />
              <Text style={styles.channelNum}>
                CH {activeChannelIndex + 1}
              </Text>
              <Text style={styles.channelPlatform}>{platform.emoji}</Text>
            </BlurView>
          )}
        </View>

        {/* Bulletin shortcut */}
        <TouchableOpacity
          style={styles.bulletinBtn}
          onPress={() => router.push("/bulletin")}
        >
          <LinearGradient colors={["#6c47ff", "#a855f7"]} style={styles.bulletinBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.bulletinBtnText}>📋 Daily Bulletin</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Channel switcher arrows */}
        <View style={styles.channelSwitcher}>
          <TouchableOpacity
            style={[styles.chBtn, activeChannelIndex === 0 && styles.chBtnDisabled]}
            onPress={() => handleChannelChange("prev")}
            disabled={activeChannelIndex === 0}
          >
            <Text style={styles.chBtnText}>◀ CH{activeChannelIndex}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chBtn, activeChannelIndex >= connectedAccounts.length - 1 && styles.chBtnDisabled]}
            onPress={() => handleChannelChange("next")}
            disabled={activeChannelIndex >= connectedAccounts.length - 1}
          >
            <Text style={styles.chBtnText}>CH{activeChannelIndex + 2} ▶</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[{ flex: 1 }, { opacity: tuneOpacity }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#6c47ff" size="large" />
              <Text style={styles.loadingText}>
                Tuning into {activeAccount?.displayName ?? "your channel"}...
              </Text>
            </View>
          ) : (
            <ScrollView
              snapToInterval={CARD_HEIGHT}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => { setRefreshing(true); load(); }}
                  tintColor="#6c47ff"
                />
              }
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT);
                setActiveCardIndex(idx);
              }}
              scrollEventThrottle={16}
            >
              {items.map((item, i) => (
                <View key={item.id} style={{ height: CARD_HEIGHT, justifyContent: "center", paddingHorizontal: 16 }}>
                  <NewsCard
                    item={item}
                    isActive={i === activeCardIndex}
                    onSave={() => retainItem(item, "remember")}
                    onFollowUp={() => retainItem(item, "follow_up")}
                    onShare={async () => Share.share({ title: item.title ?? item.summary, url: item.url })}
                  />
                </View>
              ))}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </Animated.View>

        {/* Story counter */}
        {!loading && items.length > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {activeCardIndex + 1} / {items.length}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// Mock data per platform for demo
const MOCK_ITEMS: FeedItem[] = [
  { id: "1", channelId: "demo", platform: "twitter", type: "post", summary: "Just shipped a massive update to the AI editor. The new context window is insane 🔥", author: "You", authorHandle: "@you", url: "https://x.com", publishedAt: new Date(Date.now() - 30 * 60000).toISOString(), engagementScore: 9, stats: { likes: 847, comments: 93, shares: 210 }, tags: ["AI", "Dev"], imageUrl: "https://picsum.photos/seed/tw1/800/600" },
  { id: "2", channelId: "demo", platform: "twitter", type: "post", summary: "Interesting thread on how foundation models are changing software architecture. Worth a read.", author: "Dev Friend", authorHandle: "@devfriend", url: "https://x.com", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), engagementScore: 8, stats: { likes: 2100, comments: 180 }, tags: ["AI"], imageUrl: "https://picsum.photos/seed/tw2/800/600" },
];

const MOCK_ITEMS_BY_PLATFORM: Record<string, FeedItem[]> = {
  twitter: MOCK_ITEMS,
  instagram: [
    { id: "ig1", channelId: "demo", platform: "instagram", type: "reel", title: "Morning walk 🌅", summary: "Golden hour hits different when you're up early. Grateful for another day.", author: "You", authorHandle: "@yourhandle", url: "https://instagram.com", publishedAt: new Date(Date.now() - 3600000).toISOString(), engagementScore: 9.5, stats: { likes: 1240, comments: 67 }, tags: ["Life"], imageUrl: "https://picsum.photos/seed/ig1/800/600" },
  ],
  youtube: [
    { id: "yt1", channelId: "demo", platform: "youtube", type: "video", title: "Building an AI app in 24 hours — Full Documentary", summary: "We attempted to ship a complete AI product in one day. Here's everything that went wrong and right.", author: "Favourite Creator", authorHandle: "FavChannel", url: "https://youtube.com", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), engagementScore: 9.8, stats: { views: 280000, likes: 18000 }, tags: ["AI", "Build"], imageUrl: "https://picsum.photos/seed/yt1/800/600" },
  ],
  linkedin: [
    { id: "li1", channelId: "demo", platform: "linkedin", type: "article", title: "Why I left a $400k job to build in public", summary: "After 8 years in big tech, I made the leap. Here's my honest reflection 3 months in.", author: "Connection", authorHandle: "connection", url: "https://linkedin.com", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), engagementScore: 9.2, stats: { likes: 4200, comments: 890 }, tags: ["Career"], imageUrl: "https://picsum.photos/seed/li1/800/600" },
  ],
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  osd: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  greeting: { color: "#fff", fontSize: 20, fontWeight: "800" },
  hostLine: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  channelBadge: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  channelDot: { width: 8, height: 8, borderRadius: 4 },
  channelNum: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  channelPlatform: { fontSize: 14 },
  channelSwitcher: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  chBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chBtnDisabled: { opacity: 0.2 },
  chBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  scrollContent: { paddingTop: 4 },
  bulletinBtn: { marginHorizontal: 20, borderRadius: 12, overflow: "hidden", marginBottom: 8 },
  bulletinBtnGrad: { paddingVertical: 10, alignItems: "center" },
  bulletinBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  counter: { position: "absolute", bottom: 90, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  counterText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center" },
  emptySub: { color: "rgba(255,255,255,0.45)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  connectBtn: { borderRadius: 16, overflow: "hidden", alignSelf: "stretch", marginTop: 8 },
  connectBtnGrad: { paddingVertical: 16, alignItems: "center" },
  connectBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
