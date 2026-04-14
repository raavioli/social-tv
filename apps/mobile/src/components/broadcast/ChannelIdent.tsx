import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: W, height: H } = Dimensions.get("window");

interface ChannelIdentProps {
  channelName: string;
  channelEmoji: string;
  color: string;
  storyCount?: number;
  visible?: boolean;
  onComplete?: () => void;
}

export function ChannelIdent({ channelName, channelEmoji, color, storyCount, visible = false, onComplete }: ChannelIdentProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        // Fade in
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        ]),
        // Hold
        Animated.delay(1500),
        // Fade out
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => onComplete?.());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <LinearGradient colors={[color + "40", "rgba(10,10,20,0.95)"]} style={styles.bg}>
        <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>{channelEmoji}</Text>
          <Text style={styles.name}>{channelName}</Text>
          {storyCount !== undefined && (
            <View style={[styles.countBadge, { backgroundColor: color + "30" }]}>
              <Text style={[styles.countText, { color }]}>{storyCount} stories ready</Text>
            </View>
          )}
          <View style={[styles.line, { backgroundColor: color }]} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, justifyContent: "center", alignItems: "center" },
  bg: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", gap: 12 },
  emoji: { fontSize: 64 },
  name: { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  countBadge: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 },
  countText: { fontSize: 13, fontWeight: "700" },
  line: { width: 60, height: 3, borderRadius: 2, marginTop: 8 },
});
