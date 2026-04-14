import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { selection } from "../lib/haptics";
import { Channel } from "@social-tv/shared";

interface ChannelPillProps {
  channel: Channel;
  isSelected: boolean;
  onToggle: () => void;
}

export const ChannelPill: React.FC<ChannelPillProps> = ({
  channel,
  isSelected,
  onToggle,
}) => {
  const handlePress = () => {
    selection();
    onToggle();
  };

  if (isSelected) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={[channel.color, channel.colorEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pill}
        >
          <Text style={styles.emoji}>{channel.emoji}</Text>
          <Text style={styles.labelSelected}>{channel.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.pillUnselected}>
      <Text style={styles.emoji}>{channel.emoji}</Text>
      <Text style={styles.label}>{channel.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 9,
    margin: 4,
    gap: 6,
  },
  pillUnselected: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 9,
    margin: 4,
    gap: 6,
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  labelSelected: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
