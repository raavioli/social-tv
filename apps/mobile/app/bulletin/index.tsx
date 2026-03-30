/**
 * Bulletin Hub — the entry point for all bulletin formats.
 * User picks mood + time available → we recommend a format → they watch.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MoodPicker } from "../../src/components/MoodPicker";
import { TimePicker } from "../../src/components/TimePicker";
import { MOODS, BULLETIN_FORMATS } from "../../src/constants/moods";
import { useAppStore } from "../../src/store/useAppStore";
import { MoodId, BulletinFormatId } from "@social-tv/shared";

export default function BulletinHub() {
  const { settings } = useAppStore();
  const [mood, setMood] = useState<MoodId | null>(null);
  const [minutes, setMinutes] = useState(5);

  // Auto-detect time-of-day default mood
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 10) setMood("focused");
    else if (h >= 12 && h < 14) setMood("chill");
    else if (h >= 18) setMood("energised");
    else setMood("curious");
  }, []);

  const moodObj = MOODS.find((m) => m.id === mood);

  // Recommend formats based on mood + time
  const recommendedFormats = BULLETIN_FORMATS.filter((f) => {
    const fitsTime = minutes >= f.minMinutes && minutes <= f.maxMinutes * 2;
    const moodPrefers = mood ? moodObj?.preferFormats.includes(f.id) : true;
    return fitsTime || moodPrefers;
  }).sort((a, b) => {
    const aMoodFit = moodObj?.preferFormats.includes(a.id) ? 1 : 0;
    const bMoodFit = moodObj?.preferFormats.includes(b.id) ? 1 : 0;
    return bMoodFit - aMoodFit;
  });

  const otherFormats = BULLETIN_FORMATS.filter(
    (f) => !recommendedFormats.includes(f)
  );

  const FORMAT_ROUTES: Partial<Record<BulletinFormatId, string>> = {
    breaking_news: "/formats/breaking_news",
    previously_on: "/formats/previously_on",
    live_feed: "/formats/live_feed",
  };

  const launch = (formatId: BulletinFormatId) => {
    const customRoute = FORMAT_ROUTES[formatId];
    if (customRoute) {
      router.push(customRoute as any);
      return;
    }
    router.push({
      pathname: `/bulletin/${formatId}`,
      params: { mood: mood ?? "curious", minutes: String(minutes) },
    });
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.heading}>Daily Bulletin 📋</Text>
            <Text style={styles.sub}>
              Tell us your mood and how long you have — we'll build the perfect catch-up.
            </Text>
          </View>

          {/* Mood */}
          <SectionLabel label="HOW ARE YOU FEELING?" />
          <MoodPicker selected={mood} onSelect={setMood} />

          {/* Time */}
          <SectionLabel label="HOW LONG DO YOU HAVE?" />
          <TimePicker selected={minutes} onSelect={setMinutes} />

          {/* Recommendation badge */}
          {mood && (
            <View style={[styles.recommendBadge, { borderColor: moodObj?.accentColor + "44" }]}>
              <Text style={styles.recommendText}>
                {moodObj?.emoji} {moodObj?.label} mood · {minutes < 60 ? `${minutes} min` : "1 hr"} →
              </Text>
              <Text style={[styles.recommendSub, { color: moodObj?.accentColor }]}>
                {recommendedFormats[0]?.name} recommended
              </Text>
            </View>
          )}

          {/* Recommended formats */}
          <SectionLabel label="RECOMMENDED FOR YOU" />
          {recommendedFormats.map((fmt, i) => (
            <FormatCard
              key={fmt.id}
              format={fmt}
              isTop={i === 0}
              accentColor={moodObj?.accentColor ?? "#6c47ff"}
              onPress={() => launch(fmt.id)}
            />
          ))}

          {otherFormats.length > 0 && (
            <>
              <SectionLabel label="ALL FORMATS" />
              {otherFormats.map((fmt) => (
                <FormatCard
                  key={fmt.id}
                  format={fmt}
                  isTop={false}
                  accentColor="#444"
                  onPress={() => launch(fmt.id)}
                />
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SectionLabel = ({ label }: { label: string }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const FormatCard = ({
  format,
  isTop,
  accentColor,
  onPress,
}: {
  format: ReturnType<typeof BULLETIN_FORMATS[0]["id"] extends string ? any : never>;
  isTop: boolean;
  accentColor: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.formatCard}>
    <LinearGradient
      colors={isTop ? [accentColor + "22", accentColor + "0a"] : ["#1a1a2e", "#161627"]}
      style={[styles.formatCardInner, isTop && { borderColor: accentColor + "44" }]}
    >
      <View style={styles.formatLeft}>
        <Text style={styles.formatEmoji}>{format.emoji}</Text>
        <View>
          <View style={styles.formatNameRow}>
            <Text style={styles.formatName}>{format.name}</Text>
            {isTop && (
              <View style={[styles.topBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.topBadgeText}>Best fit</Text>
              </View>
            )}
          </View>
          <Text style={styles.formatDesc}>{format.description}</Text>
          <Text style={styles.formatMeta}>
            {format.storyCount} stories · {format.minMinutes}–{format.maxMinutes} min
            {format.voicedByDefault ? " · 🎙️ voiced" : ""}
            {format.autoAdvance ? " · ⏩ auto" : ""}
          </Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24, gap: 12 },
  header: { gap: 6, marginBottom: 8 },
  backBtn: { marginBottom: 4 },
  backText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  heading: { color: "#fff", fontSize: 28, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 4,
  },
  recommendBadge: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 2,
    marginVertical: 4,
  },
  recommendText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "600" },
  recommendSub: { fontSize: 15, fontWeight: "800" },
  formatCard: { borderRadius: 16, overflow: "hidden" },
  formatCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  formatLeft: { flex: 1, flexDirection: "row", gap: 14, alignItems: "flex-start" },
  formatEmoji: { fontSize: 28, marginTop: 2 },
  formatNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  formatName: { color: "#fff", fontSize: 16, fontWeight: "800" },
  topBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  topBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  formatDesc: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 17, marginBottom: 4 },
  formatMeta: { color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: "600" },
  arrow: { color: "rgba(255,255,255,0.3)", fontSize: 24, fontWeight: "300" },
});
