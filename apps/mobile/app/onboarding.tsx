import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import { PersonaCard } from "../src/components/PersonaCard";
import { PERSONAS } from "../src/constants/personas";

const STEPS = ["welcome", "persona", "done"] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const { settings, selectPersona, completeOnboarding } = useAppStore();

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const finish = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e", "#0a0f1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[styles.dot, STEPS.indexOf(step) >= i && styles.dotActive]}
            />
          ))}
        </View>

        {step === "welcome" && <WelcomeStep onNext={next} />}
        {step === "persona" && (
          <PersonaStep
            selectedId={settings.selectedPersonaId}
            onSelect={selectPersona}
            onNext={next}
          />
        )}
        {step === "done" && <DoneStep onFinish={finish} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ── Step 1: Welcome ── */
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>📺</Text>
    <Text style={styles.heading}>Your Social Life,{"\n"}TV-ified</Text>
    <Text style={styles.sub}>
      All your social accounts — Twitter, Instagram, YouTube, LinkedIn — presented as
      personalised TV channels. Swipe to change the channel.
    </Text>
    <Btn label="Let's go" onPress={onNext} />
  </View>
);

/* ── Step 2: Persona picker ── */
const PersonaStep = ({
  selectedId,
  onSelect,
  onNext,
}: {
  selectedId: string;
  onSelect: (id: any) => void;
  onNext: () => void;
}) => (
  <View style={styles.stepContainer}>
    <Text style={styles.heading}>Pick your presenter</Text>
    <Text style={styles.sub}>Who hosts your daily social media briefing?</Text>

    <ScrollView
      style={styles.personaScroll}
      contentContainerStyle={styles.personaList}
      showsVerticalScrollIndicator={false}
    >
      {PERSONAS.map((p) => (
        <PersonaCard
          key={p.id}
          persona={p}
          isSelected={selectedId === p.id}
          onSelect={() => onSelect(p.id)}
        />
      ))}
    </ScrollView>

    <Btn label="Next" onPress={onNext} disabled={!selectedId} />
  </View>
);

/* ── Step 3: Done ── */
const DoneStep = ({ onFinish }: { onFinish: () => void }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>🎬</Text>
    <Text style={styles.heading}>You're the director</Text>
    <Text style={styles.sub}>
      Connect your social accounts and tune your channels from the Control Center.
    </Text>
    <Btn label="Start programming" onPress={onFinish} />
  </View>
);

/* ── Shared button ── */
const Btn = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.btn,
      disabled && styles.btnDisabled,
      pressed && { opacity: 0.8 },
    ]}
  >
    <LinearGradient
      colors={disabled ? ["#333", "#333"] : ["#6c47ff", "#a855f7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.btnGrad}
    >
      <Text style={styles.btnText}>{label}</Text>
    </LinearGradient>
  </Pressable>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: { backgroundColor: "#6c47ff" },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
    gap: 16,
  },
  bigEmoji: { fontSize: 72, textAlign: "center" },
  heading: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  personaScroll: { flex: 1 },
  personaList: { gap: 10, paddingVertical: 8 },
  btn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnGrad: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
