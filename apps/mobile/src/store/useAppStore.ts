import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserSettings,
  PersonaId,
  DailyShow,
  RetainedItem,
  FeedItem,
  ConnectedAccount,
} from "@social-tv/shared";

interface AppState {
  // Connected accounts (TV channels)
  connectedAccounts: ConnectedAccount[];
  activeChannelIndex: number;
  addAccount: (account: ConnectedAccount) => void;
  removeAccount: (id: string) => void;
  setActiveChannelIndex: (idx: number) => void;
  nextChannel: () => void;
  prevChannel: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  selectPersona: (id: PersonaId) => void;

  // Show
  currentShow: DailyShow | null;
  isGenerating: boolean;
  currentSegmentIndex: number;
  setCurrentShow: (show: DailyShow) => void;
  setIsGenerating: (val: boolean) => void;
  nextSegment: () => void;
  prevSegment: () => void;

  // Retention
  retainedItems: RetainedItem[];
  retainItem: (item: FeedItem, type: RetainedItem["type"]) => void;
  resolveItem: (id: string) => void;

  // Onboarding
  onboardingDone: boolean;
  completeOnboarding: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  selectedPersonaId: "host_maya",
  activeChannelId: null,
  showTime: "08:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  ttsEnabled: true,
  notificationsEnabled: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  connectedAccounts: [],
  activeChannelIndex: 0,

  addAccount: (account) =>
    set((s) => {
      const next = [...s.connectedAccounts.filter((a) => a.platform !== account.platform), account];
      AsyncStorage.setItem("accounts", JSON.stringify(next));
      return { connectedAccounts: next };
    }),

  removeAccount: (id) =>
    set((s) => {
      const next = s.connectedAccounts.filter((a) => a.id !== id);
      AsyncStorage.setItem("accounts", JSON.stringify(next));
      return { connectedAccounts: next };
    }),

  setActiveChannelIndex: (idx) => set({ activeChannelIndex: idx }),

  nextChannel: () =>
    set((s) => ({
      activeChannelIndex: Math.min(
        s.activeChannelIndex + 1,
        s.connectedAccounts.length - 1
      ),
    })),

  prevChannel: () =>
    set((s) => ({
      activeChannelIndex: Math.max(s.activeChannelIndex - 1, 0),
    })),

  settings: DEFAULT_SETTINGS,

  updateSettings: (patch) =>
    set((s) => {
      const next = { ...s.settings, ...patch };
      AsyncStorage.setItem("settings", JSON.stringify(next));
      return { settings: next };
    }),

  selectPersona: (id) =>
    set((s) => {
      const next = { ...s.settings, selectedPersonaId: id };
      AsyncStorage.setItem("settings", JSON.stringify(next));
      return { settings: next };
    }),

  currentShow: null,
  isGenerating: false,
  currentSegmentIndex: 0,
  setCurrentShow: (show) => set({ currentShow: show, currentSegmentIndex: 0 }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  nextSegment: () =>
    set((s) => ({
      currentSegmentIndex: Math.min(
        s.currentSegmentIndex + 1,
        (s.currentShow?.segments.length ?? 1) - 1
      ),
    })),
  prevSegment: () =>
    set((s) => ({
      currentSegmentIndex: Math.max(s.currentSegmentIndex - 1, 0),
    })),

  retainedItems: [],
  retainItem: (item, type) =>
    set((s) => {
      const retained: RetainedItem = {
        id: `${item.id}-${Date.now()}`,
        feedItemId: item.id,
        feedItem: item,
        type,
        isResolved: false,
        createdAt: new Date().toISOString(),
      };
      const next = [retained, ...s.retainedItems];
      AsyncStorage.setItem("retained", JSON.stringify(next));
      return { retainedItems: next };
    }),

  resolveItem: (id) =>
    set((s) => ({
      retainedItems: s.retainedItems.map((r) =>
        r.id === id ? { ...r, isResolved: true } : r
      ),
    })),

  onboardingDone: false,
  completeOnboarding: () => {
    AsyncStorage.setItem("onboarding_done", "true");
    set({ onboardingDone: true });
  },
}));
