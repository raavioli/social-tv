import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LowerThirdProps {
  name: string;
  title: string;
  accentColor?: string;
  platform?: string;
  visible?: boolean;
}

export function LowerThird({ name, title, accentColor = "#6c47ff", platform, visible = true }: LowerThirdProps) {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -300, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
      {/* Accent bar */}
      <LinearGradient colors={[accentColor, accentColor + "88"]} style={styles.accentBar} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {platform && (
            <View style={[styles.platformBadge, { backgroundColor: accentColor + "30" }]}>
              <Text style={[styles.platformText, { color: accentColor }]}>{platform}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, borderRadius: 8, overflow: "hidden", backgroundColor: "rgba(10,10,20,0.92)" },
  accentBar: { width: 4 },
  content: { flex: 1, paddingHorizontal: 14, paddingVertical: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#fff", fontSize: 15, fontWeight: "900" },
  platformBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  platformText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 },
});
