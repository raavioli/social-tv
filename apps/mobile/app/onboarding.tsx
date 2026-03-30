import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import { PersonaCard } from "../src/components/PersonaCard";
import { PERSONAS } from "../src/constants/personas";
import ConnectScreen from "./connect";

const STEPS = ["welcome", "persona", "connect", "done"] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const { settings, selectPersona, connectedAccounts, completeOnboarding } = useAppStore();

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
        {step === "connect" && (
          <View style={{ flex: 1 }}>
            <ConnectScreen onDone={next} showSkip />
          </View>
        )}
        {step === "done" && (
          <DoneStep
            channelCount={connectedAccounts.length}
            onFinish={finish}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>📺</Text>
    <Text style={styles.heading}>Your Social Life,{"\n"}TV-ified</Text>
    <Text style={styles.sub}>
      All your social accounts — Twitter, Instagram, YouTube, LinkedIn — presented as
      personalised TV channels. Swipe to change the channel.
    </Text>
    <Btn label="Let's go →" onPress={onNext} />
  </View>
);

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
    <Text style={styles.heading}>Pick your host</Text>
    <Text style={styles.sub}>
      Who presents your daily social media briefing?
    </Text>
    <View style={styles.personaGrid}>
      {PERSONAS.map((p) => (
        <PersonaCard
          key={p.id}
          persona={p}
          isSelected={selectedId === p.id}
          onSelect={() => onSelect(p.id)}
        />
      ))}
    </View>
    <Btn label="Next →" onPress={onNext} />
  </View>
);

const DoneStep = ({
  channelCount,
  onFinish,
}: {
  channelCount: number;
  onFinish: () => void;
}) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>🎬</Text>
    <Text style={styles.heading}>On air!</Text>
    <Text style={styles.sub}>
      {channelCount > 0
        ? `${channelCount} channel${channelCount !== 1 ? "s" : ""} connected. Your social TV is ready.`
        : "You're in demo mode. Connect accounts anytime from the Channels tab."}
    </Text>
    <Btn label="Start watching →" onPress={onFinish} />
  </View>
);

const Btn = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.85}
    style={[styles.btn, disabled && styles.btnDisabled]}
  >
    <LinearGradient
      colors={disabled ? ["#333", "#333"] : ["#6c47ff", "#a855f7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.btnGrad}
    >
      <Text style={styles.btnText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingTop: 16, paddingBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { backgroundColor: "#6c47ff" },
  stepContainer: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: "center", gap: 16 },
  bigEmoji: { fontSize: 72, textAlign: "center" },
  heading: { color: "#fff", fontSize: 34, fontWeight: "900", textAlign: "center", lineHeight: 40, letterSpacing: -0.5 },
  sub: { color: "rgba(255,255,255,0.55)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  personaGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 8 },
  btn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnGrad: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
