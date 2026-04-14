import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_W } = Dimensions.get("window");

interface NewsTickerProps {
  headlines: string[];
  speed?: number;
  accentColor?: string;
  label?: string;
}

export function NewsTicker({ headlines, speed = 60, accentColor = "#ef4444", label = "BREAKING" }: NewsTickerProps) {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fullText = headlines.join("  \u2022  ");
  const textWidth = fullText.length * 8; // approximate

  useEffect(() => {
    scrollAnim.setValue(SCREEN_W);
    const anim = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -textWidth,
        duration: (SCREEN_W + textWidth) / speed * 1000,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [fullText]);

  return (
    <View style={styles.container}>
      {/* Label */}
      <LinearGradient colors={[accentColor, accentColor + "cc"]} style={styles.label}>
        <Text style={styles.labelText}>{label}</Text>
      </LinearGradient>

      {/* Scrolling text */}
      <View style={styles.tickerTrack}>
        <Animated.Text
          style={[styles.tickerText, { transform: [{ translateX: scrollAnim }] }]}
          numberOfLines={1}
        >
          {fullText}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", height: 32, backgroundColor: "rgba(10,10,20,0.95)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  label: { paddingHorizontal: 14, justifyContent: "center" },
  labelText: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  tickerTrack: { flex: 1, justifyContent: "center", overflow: "hidden", paddingLeft: 12 },
  tickerText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", position: "absolute" },
});
