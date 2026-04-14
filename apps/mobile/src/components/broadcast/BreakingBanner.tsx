import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BreakingBannerProps {
  headline: string;
  source?: string;
  onDismiss?: () => void;
  visible?: boolean;
  urgency?: "breaking" | "alert" | "update";
}

const COLORS = {
  breaking: { bg: ["#cc0000", "#ff2200"], text: "BREAKING NEWS" },
  alert: { bg: ["#f59e0b", "#ef4444"], text: "ALERT" },
  update: { bg: ["#3b82f6", "#6366f1"], text: "UPDATE" },
};

export function BreakingBanner({ headline, source, onDismiss, visible = true, urgency = "breaking" }: BreakingBannerProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = COLORS[urgency];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
      // Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.7, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.timing(slideAnim, { toValue: -120, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <LinearGradient colors={config.bg as [string, string]} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {/* Label */}
          <Animated.View style={[styles.labelRow, { opacity: pulseAnim }]}>
            <View style={styles.liveDot} />
            <Text style={styles.labelText}>{config.text}</Text>
          </Animated.View>

          {/* Headline */}
          <Text style={styles.headline} numberOfLines={2}>{headline}</Text>

          {/* Source */}
          {source && <Text style={styles.source}>{source}</Text>}
        </LinearGradient>

        {/* Dismiss hint */}
        <View style={styles.dismissBar}>
          <Text style={styles.dismissText}>Tap to dismiss</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  pressable: { flex: 1 },
  banner: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  labelText: { color: "#fff", fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  headline: { color: "#fff", fontSize: 18, fontWeight: "800", lineHeight: 24 },
  source: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "700" },
  dismissBar: { backgroundColor: "rgba(0,0,0,0.3)", paddingVertical: 4, alignItems: "center" },
  dismissText: { color: "rgba(255,255,255,0.4)", fontSize: 10 },
});
