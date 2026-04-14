import { Platform } from "react-native";

export async function impact(style: "light" | "medium" | "heavy" = "medium") {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  const map = { light: Haptics.ImpactFeedbackStyle.Light, medium: Haptics.ImpactFeedbackStyle.Medium, heavy: Haptics.ImpactFeedbackStyle.Heavy };
  Haptics.impactAsync(map[style]);
}

export async function notification(type: "success" | "warning" | "error" = "success") {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  const map = { success: Haptics.NotificationFeedbackType.Success, warning: Haptics.NotificationFeedbackType.Warning, error: Haptics.NotificationFeedbackType.Error };
  Haptics.notificationAsync(map[type]);
}

export async function selection() {
  if (Platform.OS === "web") return;
  const Haptics = await import("expo-haptics");
  Haptics.selectionAsync();
}
