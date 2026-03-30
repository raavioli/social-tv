import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../../src/store/useAppStore";
import { PersonaCard } from "../../src/components/PersonaCard";
import { PERSONAS } from "../../src/constants/personas";

export default function SettingsScreen() {
  const { settings, selectPersona, updateSettings } = useAppStore();

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Settings ⚙️</Text>

          <SectionLabel label="YOUR HOST" />
          <View style={styles.personaGrid}>
            {PERSONAS.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                isSelected={settings.selectedPersonaId === p.id}
                onSelect={() => selectPersona(p.id)}
              />
            ))}
          </View>

          <SectionLabel label="SHOW PREFERENCES" />
          <View style={styles.card}>
            <SettingRow
              label="Voice Narration"
              emoji="🎙️"
              value={settings.ttsEnabled}
              onToggle={(v) => updateSettings({ ttsEnabled: v })}
            />
            <Divider />
            <SettingRow
              label="Morning Notification"
              emoji="🔔"
              value={settings.notificationsEnabled}
              onToggle={(v) => updateSettings({ notificationsEnabled: v })}
            />
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowEmoji}>⏰</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Show Time</Text>
                <Text style={styles.rowValue}>{settings.showTime}</Text>
              </View>
            </View>
          </View>

          <SectionLabel label="ABOUT" />
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowEmoji}>📺</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>AI TV News</Text>
                <Text style={styles.rowValue}>v0.1.0 — MIT License</Text>
              </View>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowEmoji}>🔓</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Open Source</Text>
                <Text style={styles.rowValue}>github.com/your-org/ai-tv-news</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SectionLabel = ({ label }: { label: string }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const Divider = () => <View style={styles.divider} />;

const SettingRow = ({
  label,
  emoji,
  value,
  onToggle,
}: {
  label: string;
  emoji: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowEmoji}>{emoji}</Text>
    <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#333", true: "#6c47ff" }}
      thumbColor="#fff"
    />
  </View>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24 },
  heading: { color: "#fff", fontSize: 30, fontWeight: "900", marginBottom: 24 },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
  },
  personaGrid: { flexDirection: "row", flexWrap: "wrap" },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  rowEmoji: { fontSize: 20 },
  rowText: { flex: 1 },
  rowLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
  rowValue: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 16 },
});
