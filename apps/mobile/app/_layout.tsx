import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "../src/store/useAppStore";
import BottomDock from "../src/components/BottomDock";

export default function RootLayout() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const addAccount = useAppStore((s) => s.addAccount);
  const reorderCustomChannels = useAppStore((s) => s.reorderCustomChannels);

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
      </Stack>
      <BottomDock />
    </View>
  );
}
