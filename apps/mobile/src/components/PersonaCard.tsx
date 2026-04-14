import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[styles.wrapper, isSelected && styles.wrapperSelected]}
    >
      <LinearGradient
        colors={
          isSelected
            ? [persona.accentColor + "44", persona.accentColor + "22"]
            : ["#1a1a2e", "#16213e"]
        }
        style={styles.card}
      >
        {isSelected && (
          <View
            style={[styles.selectedBadge, { backgroundColor: persona.accentColor }]}
          >
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
        <Text style={styles.emoji}>{persona.avatarEmoji}</Text>
        <Text style={styles.name}>{persona.name}</Text>
        <Text style={styles.tagline}>{persona.tagline}</Text>
        <View
          style={[
            styles.stylePill,
            { backgroundColor: persona.accentColor + "33" },
          ]}
        >
          <Text style={[styles.styleText, { color: persona.accentColor }]}>
            {persona.style}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  wrapperSelected: {
    borderColor: "#6c47ff",
    shadowColor: "#6c47ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
    gap: 6,
  },
  selectedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  stylePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  styleText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
