import { useEffect } from "react";
import { View, Alert, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "../src/store/useAppStore";
import BottomDock from "../src/components/BottomDock";

function useTimeBudgetReminder() {
  const minutes = useAppStore((s) => s.timeBudgetMinutes);
  const startedAt = useAppStore((s) => s.budgetStartedAt);
  const setBudget = useAppStore((s) => s.setTimeBudget);
  const clearBudget = useAppStore((s) => s.clearTimeBudget);

  useEffect(() => {
    if (!minutes || minutes <= 0 || !startedAt) return;
    const elapsed = Date.now() - startedAt;
    const remaining = minutes * 60_000 - elapsed;
    if (remaining <= 0) return;
    const id = setTimeout(() => {
      const msg = `That's your ${minutes} min. Extend by 5?`;
      if (Platform.OS === "web") {
        const extend = globalThis.confirm?.(msg);
        if (extend) setBudget(5);
        else { clearBudget(); router.replace("/time-budget" as any); }
      } else {
        Alert.alert("Time's up", msg, [
          { text: "Extend 5 min", onPress: () => setBudget(5) },
          { text: "Done", style: "cancel", onPress: () => { clearBudget(); router.replace("/time-budget" as any); } },
        ]);
      }
    }, remaining);
    return () => clearTimeout(id);
  }, [minutes, startedAt]);
}

export default function RootLayout() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const addAccount = useAppStore((s) => s.addAccount);
  const reorderCustomChannels = useAppStore((s) => s.reorderCustomChannels);

  useTimeBudgetReminder();

  useEffect(() => {
    // Restore persisted state
    AsyncStorage.multiGet(["onboarding_done", "settings", "retained", "accounts", "customChannels"]).then(
      (pairs) => {
        const [onboarding, settings, retained, accounts, customChannels] = pairs;
        if (onboarding[1] === "true") completeOnboarding();
        if (settings[1]) updateSettings(JSON.parse(settings[1]));
        if (accounts[1]) {
          const parsed = JSON.parse(accounts[1]);
          parsed.forEach((a: any) => addAccount(a));
        }
        if (customChannels[1]) {
          reorderCustomChannels(JSON.parse(customChannels[1]));
        }
      }
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="channel-creator" />
        <Stack.Screen name="programming-board" />
        <Stack.Screen name="time-budget" />
      </Stack>
      <BottomDock />
    </View>
  );
}
