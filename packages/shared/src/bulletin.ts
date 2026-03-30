// SocialTV — Bulletin & Smart Scheduling Types

export type MoodId = "focused" | "curious" | "chill" | "stressed" | "energised";

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  description: string;
  // How this mood reshapes content ranking
  boostTags: string[];       // topic tags to surface more
  suppressTags: string[];    // topic tags to bury
  preferFormats: BulletinFormatId[];
  accentColor: string;
}

// ─── Bulletin Formats ────────────────────────────────────────────────────────

export type BulletinFormatId =
  | "flash"      // 2–5 min voiced catch-up, one sentence per story
  | "top10"      // Ranked card stack — the 10 most important things today
  | "top100"     // Scrollable ranked list of 100 items
  | "hundred_in_hundred" // 100 stories in 100 seconds, auto-advancing
  | "deep_dive"  // Pick one topic, get every angle across all channels
  | "custom";    // User-defined

export interface BulletinFormat {
  id: BulletinFormatId;
  name: string;
  emoji: string;
  description: string;
  minMinutes: number;
  maxMinutes: number;
  storyCount: number;
  autoAdvance: boolean;
  voicedByDefault: boolean;
}

// ─── User Interest Profile ────────────────────────────────────────────────────

export interface InterestSignal {
  tag: string;
  score: number;       // 0–10, higher = more interested
  saveCount: number;
  skipCount: number;
  dwellMs: number;     // total time spent reading stories with this tag
  lastUpdated: string;
}

export interface InterestProfile {
  userId: string;
  signals: InterestSignal[];
  updatedAt: string;
}

// ─── Bulletin Schedule (user-programmed) ─────────────────────────────────────

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type TimeSlotId = "morning" | "lunch" | "evening" | "custom";

export interface BulletinRule {
  id: string;
  name: string;           // e.g. "Monday morning commute"
  enabled: boolean;
  // When
  days: DayOfWeek[];
  timeSlot: TimeSlotId;
  customTime?: string;    // "HH:MM" if timeSlot === "custom"
  // Context
  availableMinutes: number;   // how long user has — 2, 5, 10, 20, 30, 60
  moods: MoodId[];        // which moods trigger this rule
  // Format
  formatId: BulletinFormatId;
  channelIds: string[];   // which connected accounts to pull from
  // Notifications
  sendNotification: boolean;
  notificationMessage?: string;
}

export interface BulletinSchedule {
  userId: string;
  rules: BulletinRule[];
  updatedAt: string;
}

// ─── Generated Bulletin ───────────────────────────────────────────────────────

export interface BulletinStory {
  rank: number;
  feedItemId: string;
  headline: string;         // AI-compressed to one punchy line
  oneliner: string;         // AI one-sentence summary
  whyItMatters: string;     // AI: why this is relevant to THIS user
  readingTimeSec: number;
  platform: string;
  imageUrl?: string;
  url: string;
  tags: string[];
  relevanceScore: number;   // 0–10 personalised score
  moodFit: number;          // 0–10 how well it fits current mood
}

export interface GeneratedBulletin {
  id: string;
  userId: string;
  ruleId: string;
  formatId: BulletinFormatId;
  date: string;
  mood: MoodId;
  availableMinutes: number;
  title: string;            // e.g. "Your 5-min Monday morning catch-up"
  stories: BulletinStory[];
  totalStoriesConsidered: number;
  generatedAt: string;
  audioUrl?: string;        // ElevenLabs voiced full bulletin
  estimatedDurationSec: number;
}

// ─── Interaction Tracking (for passive interest learning) ────────────────────

export type InteractionType = "save" | "skip" | "share" | "dwell" | "deep_dive" | "dismiss";

export interface StoryInteraction {
  storyId: string;
  tags: string[];
  platform: string;
  type: InteractionType;
  dwellMs?: number;
  timestamp: string;
}

// ─── API request types ────────────────────────────────────────────────────────

export interface GenerateBulletinRequest {
  mood: MoodId;
  availableMinutes: number;
  formatId: BulletinFormatId;
  channelIds: string[];
  interestProfile?: InterestProfile;
}

export interface RecordInteractionRequest {
  interactions: StoryInteraction[];
}
