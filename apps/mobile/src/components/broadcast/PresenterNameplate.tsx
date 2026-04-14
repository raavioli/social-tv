import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PresenterNameplateProps {
  emoji: string;
  name: string;
  role: string;
  line: string;
  accentColor?: string;
  visible?: boolean;
}

export function PresenterNameplate({ emoji, name, role, line, accentColor = "#6c47ff", visible = true }: PresenterNameplateProps) {
  const slideX = useRef(new Animated.Value(-400)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }),
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: -400, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideX }, { translateY: slideY }], opacity }]}>
      <LinearGradient
        colors={[accentColor + "20", "rgba(10,10,20,0.92)"]}
        style={styles.plate}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: accentColor + "30" }]}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: accentColor + "25" }]}>
              <Text style={[styles.roleText, { color: accentColor }]}>{role}</Text>
            </View>
          </View>
          <Text style={styles.line} numberOfLines={2}>{line}</Text>
        </View>

        {/* Accent line at bottom */}
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      </LinearGradient>

      {/* Voice wave animation */}
      <View style={styles.waveContainer}>
        {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4].map((h, i) => (
          <View key={i} style={[styles.waveBar, { height: 16 * h, backgroundColor: accentColor + "50" }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 12, marginBottom: 8 },
  plate: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 26 },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#fff", fontSize: 15, fontWeight: "900" },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  line: { color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 18 },
  accentLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2 },
  waveContainer: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 16, paddingHorizontal: 12, paddingTop: 4 },
  waveBar: { width: 3, borderRadius: 2 },
});
