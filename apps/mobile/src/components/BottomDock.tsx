import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";

type DockItem = { label: string; emoji: string; path: string };

const ITEMS: DockItem[] = [
  { label: "Programming", emoji: "🎛️", path: "/programming-board" },
  { label: "Sources",     emoji: "🔗", path: "/connect" },
  { label: "Filters",     emoji: "🎚️", path: "/programming/filters" },
];

// Hide on routes where the dock would overlap dedicated UI (onboarding, full-screen players).
const HIDDEN_PREFIXES = ["/onboarding", "/bulletin", "/formats"];

export default function BottomDock() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.dock}>
        {ITEMS.map(it => {
          const active = pathname.startsWith(it.path);
          return (
            <Pressable
              key={it.path}
              onPress={() => router.push(it.path as any)}
              style={[styles.item, active && styles.itemActive]}
              hitSlop={6}
            >
              <Text style={styles.emoji}>{it.emoji}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 80, // sit above the tab bar
    alignItems: "center",
    zIndex: 50,
  },
  dock: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(20,20,30,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
    gap: 2,
    minWidth: 72,
  },
  itemActive: { backgroundColor: "rgba(108,71,255,0.25)" },
  emoji: { fontSize: 20 },
  label: { color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: "700" },
  labelActive: { color: "#fff" },
});
