import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { impact } from "../lib/haptics";
import { Persona } from "@social-tv/shared";

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isSelected,
  onSelect,
}) => {
  const handlePress = () => {
    impact("medium");
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        isSelected && [styles.rowSelected, { borderColor: persona.accentColor }],
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={styles.emoji}>{persona.avatarEmoji}</Text>

      <View style={styles.info}>
        <Text style={styles.name}>{persona.name}</Text>
        <Text style={styles.tagline} numberOfLines={1}>
          {persona.tagline}
        </Text>
      </View>

      <View
        style={[styles.stylePill, { backgroundColor: persona.accentColor + "33" }]}
      >
        <Text style={[styles.styleText, { color: persona.accentColor }]}>
          {persona.style}
        </Text>
      </View>

      {isSelected && (
        <View style={[styles.check, { backgroundColor: persona.accentColor }]}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  rowSelected: {
    shadowColor: "#6c47ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  tagline: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  stylePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  styleText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
