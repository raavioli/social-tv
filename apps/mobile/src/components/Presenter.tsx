import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PresenterProps {
  emoji: string;
  name: string;
  line: string;
  accentColor?: string;
}

export function Presenter({ emoji, name, line, accentColor = "#6c47ff" }: PresenterProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[accentColor + "30", accentColor + "10"]}
        style={styles.bubble}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: accentColor + "40" }]}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.line}>{line}</Text>
          </View>
        </View>
        {/* Simple voice wave indicator */}
        <View style={styles.waveRow}>
          {[0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5, 1, 0.4, 0.7].map((h, i) => (
            <View key={i} style={[styles.waveBar, { height: 12 * h, backgroundColor: accentColor + "60" }]} />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 8 },
  bubble: { borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 20 },
  content: { flex: 1 },
  name: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  line: { color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 20, marginTop: 2 },
  waveRow: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 12, opacity: 0.6 },
  waveBar: { width: 3, borderRadius: 2 },
});
