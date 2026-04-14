import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { impact, selection } from "../lib/haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { FeedItem } from "@social-tv/shared";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface NewsCardProps {
  item: FeedItem;
  onSave: () => void;
  onFollowUp: () => void;
  onShare: () => void;
  isActive: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onSave,
  onFollowUp,
  onShare,
  isActive,
}) => {
  const scale = useSharedValue(isActive ? 1 : 0.92);
  const opacity = useSharedValue(isActive ? 1 : 0.5);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.92, { damping: 15 });
    opacity.value = withSpring(isActive ? 1 : 0.5);
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleSave = () => {
    impact("medium");
    onSave();
  };

  const sourceLabel = (item.source ?? item.platform ?? "").toUpperCase();
  const timeAgo = getTimeAgo(item.publishedAt);

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Background Image */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.bgImage} />
      ) : (
        <View style={[styles.bgImage, styles.bgPlaceholder]} />
      )}

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.95)"]}
        style={styles.gradient}
        locations={[0.2, 0.5, 1]}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <BlurView intensity={30} tint="dark" style={styles.sourcePill}>
          <Text style={styles.sourceText}>{sourceLabel}</Text>
        </BlurView>
        <BlurView intensity={30} tint="dark" style={styles.sourcePill}>
          <Text style={styles.sourceText}>{timeAgo}</Text>
        </BlurView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {(item.tags ?? []).length > 0 && (
          <View style={styles.tags}>
            {(item.tags ?? []).slice(0, 3).map((tag) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.title} numberOfLines={3}>
          {item.title}
        </Text>
        <Text style={styles.summary} numberOfLines={4}>
          {item.summary}
        </Text>

        {/* Actions */}
        <BlurView intensity={25} tint="dark" style={styles.actions}>
          <ActionBtn emoji="🔖" label="Save" onPress={handleSave} />
          <ActionBtn
            emoji="🔔"
            label="Follow Up"
            onPress={() => {
              impact("light");
              onFollowUp();
            }}
          />
          <ActionBtn
            emoji="↗️"
            label="Share"
            onPress={() => {
              selection();
              onShare();
            }}
          />
        </BlurView>
      </View>
    </Animated.View>
  );
};

const ActionBtn = ({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_W - 32,
    height: SCREEN_H * 0.72,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111",
    alignSelf: "center",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  bgPlaceholder: {
    backgroundColor: "#1a1a2e",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
  },
  sourcePill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
  },
  sourceText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  summary: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    padding: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 4,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
});
