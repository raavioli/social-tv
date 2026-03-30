import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";

export default function Index() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  return <Redirect href={onboardingDone ? "/(tabs)" : "/onboarding"} />;
}
