import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserSettings,
  PersonaId,
  DailyShow,
  RetainedItem,
  FeedItem,
  ConnectedAccount,
  TVFormatId,
} from "@social-tv/shared";

export interface ScheduledShow {
  id: string;
  formatId: TVFormatId;
  label: string;
  days: number[];
  hour: number;
  minute: number;
  enabled: boolean;
  platformIds: string[];
  maxMinutes: number;
  notifyBefore: number;
}

export interface MutedKeyword {
  id: string;
  keyword: string;
  addedAt: string;
}

export interface PinnedSource {
  id: string;
  platform: string;
  handle: string;
  displayName: string;
  boosted: boolean;
}

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

  // Programming
  scheduledShows: ScheduledShow[];
  mutedKeywords: MutedKeyword[];
  pinnedSources: PinnedSource[];
  addScheduledShow: (show: ScheduledShow) => void;
  updateScheduledShow: (id: string, updates: Partial<ScheduledShow>) => void;
  removeScheduledShow: (id: string) => void;
  toggleScheduledShow: (id: string) => void;
  addMutedKeyword: (keyword: string) => void;
  removeMutedKeyword: (id: string) => void;
  addPinnedSource: (source: Omit<PinnedSource, "id">) => void;
  removePinnedSource: (id: string) => void;
  toggleSourceBoost: (id: string) => void;
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

  scheduledShows: [
    { id: "default-morning", formatId: "morning_show", label: "Morning Show", days: [1,2,3,4,5], hour: 8, minute: 0, enabled: true, platformIds: [], maxMinutes: 20, notifyBefore: 5 },
    { id: "default-flash", formatId: "flash_briefing", label: "Lunch Briefing", days: [1,2,3,4,5], hour: 12, minute: 30, enabled: true, platformIds: [], maxMinutes: 5, notifyBefore: 0 },
    { id: "default-evening", formatId: "evening_news", label: "Evening News", days: [1,2,3,4,5], hour: 18, minute: 0, enabled: true, platformIds: [], maxMinutes: 15, notifyBefore: 5 },
    { id: "default-recap", formatId: "weekly_recap", label: "Weekend Recap", days: [0,6], hour: 10, minute: 0, enabled: true, platformIds: [], maxMinutes: 30, notifyBefore: 10 },
  ],
  mutedKeywords: [],
  pinnedSources: [],

  addScheduledShow: (show) =>
    set((s) => ({ scheduledShows: [...s.scheduledShows, show] })),

  updateScheduledShow: (id, updates) =>
    set((s) => ({
      scheduledShows: s.scheduledShows.map((sh) =>
        sh.id === id ? { ...sh, ...updates } : sh
      ),
    })),

  removeScheduledShow: (id) =>
    set((s) => ({ scheduledShows: s.scheduledShows.filter((sh) => sh.id !== id) })),

  toggleScheduledShow: (id) =>
    set((s) => ({
      scheduledShows: s.scheduledShows.map((sh) =>
        sh.id === id ? { ...sh, enabled: !sh.enabled } : sh
      ),
    })),

  addMutedKeyword: (keyword) =>
    set((s) => ({
      mutedKeywords: [
        ...s.mutedKeywords,
        { id: `kw-${Date.now()}`, keyword, addedAt: new Date().toISOString() },
      ],
    })),

  removeMutedKeyword: (id) =>
    set((s) => ({ mutedKeywords: s.mutedKeywords.filter((k) => k.id !== id) })),

  addPinnedSource: (source) =>
    set((s) => ({
      pinnedSources: [
        ...s.pinnedSources,
        { ...source, id: `src-${Date.now()}` },
      ],
    })),

  removePinnedSource: (id) =>
    set((s) => ({ pinnedSources: s.pinnedSources.filter((p) => p.id !== id) })),

  toggleSourceBoost: (id) =>
    set((s) => ({
      pinnedSources: s.pinnedSources.map((p) =>
        p.id === id ? { ...p, boosted: !p.boosted } : p
      ),
    })),
}));
