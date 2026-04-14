import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { impact } from "../lib/haptics";
import { MoodId } from "@social-tv/shared";
import { MOODS } from "../constants/moods";

const { width: W } = Dimensions.get("window");

interface MoodPickerProps {
  selected: MoodId | null;
  onSelect: (mood: MoodId) => void;
  compact?: boolean;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({
  selected,
  onSelect,
  compact = false,
}) => {
  return (
    <View style={styles.grid}>
      {MOODS.map((mood) => {
        const isSelected = selected === mood.id;
        return (
          <TouchableOpacity
            key={mood.id}
            onPress={() => {
              impact("medium");
              onSelect(mood.id);
            }}
            activeOpacity={0.8}
            style={[styles.pill, isSelected && { borderColor: mood.accentColor + "88" }]}
          >
            {isSelected ? (
              <LinearGradient
                colors={[mood.accentColor + "33", mood.accentColor + "11"]}
                style={styles.pillInner}
              >
                <Text style={styles.emoji}>{mood.emoji}</Text>
                {!compact && (
                  <>
                    <Text style={[styles.label, { color: mood.accentColor }]}>
                      {mood.label}
                    </Text>
                    <Text style={styles.desc}>{mood.description}</Text>
                  </>
                )}
                {compact && (
                  <Text style={[styles.labelCompact, { color: mood.accentColor }]}>
                    {mood.label}
                  </Text>
                )}
              </LinearGradient>
            ) : (
              <View style={styles.pillInner}>
                <Text style={styles.emoji}>{mood.emoji}</Text>
                {!compact && (
                  <>
                    <Text style={styles.label}>{mood.label}</Text>
                    <Text style={styles.desc}>{mood.description}</Text>
                  </>
                )}
                {compact && (
                  <Text style={styles.labelCompact}>{mood.label}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PILL_W = (W - 48 - 12) / 2;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    width: PILL_W,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  pillInner: {
    padding: 14,
    gap: 4,
  },
  emoji: { fontSize: 28 },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  labelCompact: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
  },
  desc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    lineHeight: 15,
  },
});
