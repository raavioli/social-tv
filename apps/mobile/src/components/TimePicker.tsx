import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { AVAILABLE_MINUTES } from "../constants/moods";

interface TimePickerProps {
  selected: number;
  onSelect: (minutes: number) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {AVAILABLE_MINUTES.map((min) => {
        const isSelected = selected === min;
        const label = min < 60 ? `${min}m` : "1h";
        const sublabel =
          min <= 2 ? "flash" :
          min <= 5 ? "quick" :
          min <= 15 ? "catch-up" :
          min <= 30 ? "full read" : "deep";

        return (
          <TouchableOpacity
            key={min}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(min);
            }}
            activeOpacity={0.8}
          >
            {isSelected ? (
              <LinearGradient
                colors={["#6c47ff", "#a855f7"]}
                style={styles.chip}
              >
                <Text style={styles.chipLabelSelected}>{label}</Text>
                <Text style={styles.chipSubSelected}>{sublabel}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chipUnselected}>
                <Text style={styles.chipLabel}>{label}</Text>
                <Text style={styles.chipSub}>{sublabel}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 4, paddingVertical: 4 },
  chip: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 60,
  },
  chipUnselected: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 60,
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipLabel: { color: "rgba(255,255,255,0.55)", fontSize: 16, fontWeight: "800" },
  chipLabelSelected: { color: "#fff", fontSize: 16, fontWeight: "800" },
  chipSub: { color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: "600", marginTop: 2 },
  chipSubSelected: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontWeight: "600", marginTop: 2 },
});
