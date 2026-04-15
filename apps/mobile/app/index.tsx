import { Redirect } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";

export default function Index() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const hasBudget     = useAppStore((s) => s.timeBudgetMinutes !== null);

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (!hasBudget)      return <Redirect href="/time-budget" />;
  return <Redirect href="/(tabs)" />;
}
