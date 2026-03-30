/**
 * SocialTV — Real TV Program Formats
 *
 * Every format maps to a content strategy, UI layout, and pacing model
 * based on how that format works on actual television.
 */

export type TVFormatId =
  // News
  | "breaking_news"      // BREAKING: urgent, red banner, ticker, auto-interrupts
  | "morning_show"       // GMA / Today style — mix of news, lifestyle, weather
  | "evening_news"       // Classic anchor-read bulletin — structured, serious
  | "flash_briefing"     // 60-second radio-style voiced catch-up
  // Entertainment
  | "late_night"         // Viral clips, funny moments, trending memes
  | "talk_show"          // One topic, multiple angles — like a panel discussion
  | "reality_check"      // What everyone is talking about RIGHT NOW
  | "countdown"          // Chart-style Top 10 / Top 100 countdown
  // Deep Content
  | "documentary"        // One story, full depth — every source, every angle
  | "explainer"          // "What is X and why does it matter?" — educational
  | "long_read"          // Long-form digest — user has 30+ min
  // Live / Real-time
  | "live_feed"          // Real-time stream — posts as they come in
  | "breaking_ticker"    // Bottom-of-screen ticker only — minimal distraction
  // Catch-up
  | "previously_on"      // "Since you were last here..." — missed content digest
  | "weekly_recap"       // Sunday magazine — week in review
  | "highlight_reel"     // Best of your feeds — like a sports highlight reel
  // Rapid formats
  | "hundred_in_hundred" // 100 stories in 100 seconds
  | "speed_round"        // 10 stories in 60 seconds — faster than flash

export interface TVFormat {
  id: TVFormatId;
  name: string;
  emoji: string;
  tvAnalogy: string;        // "Like CNN Breaking News"
  description: string;
  pacing: "instant" | "rapid" | "steady" | "slow";
  layout: "fullscreen" | "card_stack" | "list" | "split" | "ticker" | "grid";
  autoAdvance: boolean;
  voiced: boolean;
  minMinutes: number;
  maxMinutes: number;
  storyCount: number;
  contentStrategy: ContentStrategy;
  triggerConditions?: TriggerCondition[];
}

export interface ContentStrategy {
  sortBy: "recency" | "engagement" | "relevance" | "mood_fit" | "virality";
  deduplicate: boolean;
  crossPlatform: boolean;     // merge same story across platforms
  includeNotifications: boolean;
  includePersonalActivity: boolean; // your own posts/likes/mentions
  filterByMood: boolean;
}

export interface TriggerCondition {
  type: "breaking_keyword" | "engagement_spike" | "mention" | "schedule";
  threshold?: number;
  keywords?: string[];
}

export const TV_FORMATS: TVFormat[] = [
  // ─── NEWS ──────────────────────────────────────────────────────────────────
  {
    id: "breaking_news",
    name: "Breaking News",
    emoji: "🔴",
    tvAnalogy: "Like CNN Breaking News",
    description: "Urgent stories only. Red banner, auto-interrupts your feed.",
    pacing: "instant",
    layout: "fullscreen",
    autoAdvance: false,
    voiced: true,
    minMinutes: 1,
    maxMinutes: 5,
    storyCount: 3,
    contentStrategy: { sortBy: "recency", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: false, filterByMood: false },
    triggerConditions: [{ type: "breaking_keyword", keywords: ["breaking", "urgent", "alert", "just in", "developing"] }, { type: "engagement_spike", threshold: 500 }],
  },
  {
    id: "morning_show",
    name: "Morning Show",
    emoji: "🌅",
    tvAnalogy: "Like Good Morning America",
    description: "Mix of news, your social activity, and what's trending — the full morning package.",
    pacing: "steady",
    layout: "card_stack",
    autoAdvance: true,
    voiced: true,
    minMinutes: 10,
    maxMinutes: 30,
    storyCount: 15,
    contentStrategy: { sortBy: "relevance", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: true, filterByMood: true },
  },
  {
    id: "evening_news",
    name: "Evening News",
    emoji: "📺",
    tvAnalogy: "Like BBC News at 10",
    description: "Structured end-of-day briefing. Top stories, your day summarised.",
    pacing: "steady",
    layout: "card_stack",
    autoAdvance: true,
    voiced: true,
    minMinutes: 10,
    maxMinutes: 20,
    storyCount: 10,
    contentStrategy: { sortBy: "engagement", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: true, filterByMood: false },
  },
  {
    id: "flash_briefing",
    name: "Flash Briefing",
    emoji: "⚡",
    tvAnalogy: "Like a radio news minute",
    description: "Voiced 60-second catch-up. One sentence per story.",
    pacing: "rapid",
    layout: "fullscreen",
    autoAdvance: true,
    voiced: true,
    minMinutes: 2,
    maxMinutes: 5,
    storyCount: 5,
    contentStrategy: { sortBy: "relevance", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: true },
  },
  // ─── ENTERTAINMENT ─────────────────────────────────────────────────────────
  {
    id: "late_night",
    name: "Late Night",
    emoji: "🌙",
    tvAnalogy: "Like Jimmy Fallon / Graham Norton",
    description: "Viral moments, funny posts, trending memes. Light and entertaining.",
    pacing: "steady",
    layout: "card_stack",
    autoAdvance: false,
    voiced: true,
    minMinutes: 10,
    maxMinutes: 30,
    storyCount: 12,
    contentStrategy: { sortBy: "virality", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: true, filterByMood: true },
  },
  {
    id: "talk_show",
    name: "Talk Show",
    emoji: "🎤",
    tvAnalogy: "Like The View / Question Time",
    description: "One trending topic, explored from every angle across all your platforms.",
    pacing: "slow",
    layout: "split",
    autoAdvance: false,
    voiced: false,
    minMinutes: 15,
    maxMinutes: 45,
    storyCount: 20,
    contentStrategy: { sortBy: "relevance", deduplicate: false, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: false },
  },
  {
    id: "reality_check",
    name: "Reality Check",
    emoji: "👁️",
    tvAnalogy: "Like trending Twitter / Zeitgeist TV",
    description: "What everyone in your network is talking about RIGHT NOW.",
    pacing: "rapid",
    layout: "grid",
    autoAdvance: false,
    voiced: false,
    minMinutes: 5,
    maxMinutes: 15,
    storyCount: 20,
    contentStrategy: { sortBy: "virality", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: false, filterByMood: false },
  },
  {
    id: "countdown",
    name: "The Countdown",
    emoji: "🔢",
    tvAnalogy: "Like TRL / Billboard Hot 100",
    description: "Ranked countdown of today's most important stories. No. 1 is revealed last.",
    pacing: "steady",
    layout: "list",
    autoAdvance: true,
    voiced: true,
    minMinutes: 10,
    maxMinutes: 20,
    storyCount: 10,
    contentStrategy: { sortBy: "mood_fit", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: true },
  },
  // ─── DEEP CONTENT ──────────────────────────────────────────────────────────
  {
    id: "documentary",
    name: "Documentary",
    emoji: "🔭",
    tvAnalogy: "Like a Netflix mini-doc",
    description: "One story, fully explored. Every source, every angle, full context.",
    pacing: "slow",
    layout: "fullscreen",
    autoAdvance: false,
    voiced: true,
    minMinutes: 15,
    maxMinutes: 60,
    storyCount: 25,
    contentStrategy: { sortBy: "relevance", deduplicate: false, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: false },
  },
  {
    id: "explainer",
    name: "Explainer",
    emoji: "💡",
    tvAnalogy: "Like Vox / Kurzgesagt",
    description: '"What is X and why does it matter?" — educational deep dive on one topic.',
    pacing: "slow",
    layout: "fullscreen",
    autoAdvance: false,
    voiced: true,
    minMinutes: 10,
    maxMinutes: 20,
    storyCount: 8,
    contentStrategy: { sortBy: "relevance", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: false },
  },
  // ─── LIVE / REAL-TIME ──────────────────────────────────────────────────────
  {
    id: "live_feed",
    name: "Live Feed",
    emoji: "🔴",
    tvAnalogy: "Like a live broadcast rolling feed",
    description: "Real-time stream of posts across all your channels. As it happens.",
    pacing: "instant",
    layout: "list",
    autoAdvance: false,
    voiced: false,
    minMinutes: 0,
    maxMinutes: 999,
    storyCount: 999,
    contentStrategy: { sortBy: "recency", deduplicate: false, crossPlatform: true, includeNotifications: true, includePersonalActivity: true, filterByMood: false },
    triggerConditions: [{ type: "schedule" }],
  },
  {
    id: "breaking_ticker",
    name: "Ticker",
    emoji: "📡",
    tvAnalogy: "Like the CNN bottom ticker",
    description: "Minimal mode. Just headlines scrolling at the bottom. Stay in your flow.",
    pacing: "instant",
    layout: "ticker",
    autoAdvance: true,
    voiced: false,
    minMinutes: 0,
    maxMinutes: 999,
    storyCount: 50,
    contentStrategy: { sortBy: "recency", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: false, filterByMood: false },
  },
  // ─── CATCH-UP ──────────────────────────────────────────────────────────────
  {
    id: "previously_on",
    name: "Previously On...",
    emoji: "⏮️",
    tvAnalogy: "Like a TV show recap before a new episode",
    description: "Everything you missed since you last opened the app.",
    pacing: "rapid",
    layout: "card_stack",
    autoAdvance: true,
    voiced: true,
    minMinutes: 3,
    maxMinutes: 10,
    storyCount: 15,
    contentStrategy: { sortBy: "engagement", deduplicate: true, crossPlatform: true, includeNotifications: true, includePersonalActivity: true, filterByMood: false },
    triggerConditions: [{ type: "schedule" }],
  },
  {
    id: "weekly_recap",
    name: "Weekly Recap",
    emoji: "📰",
    tvAnalogy: "Like a Sunday supplement / The Week magazine",
    description: "The most important moments from your feeds this week.",
    pacing: "slow",
    layout: "card_stack",
    autoAdvance: false,
    voiced: true,
    minMinutes: 20,
    maxMinutes: 45,
    storyCount: 30,
    contentStrategy: { sortBy: "engagement", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: true, filterByMood: false },
  },
  {
    id: "highlight_reel",
    name: "Highlight Reel",
    emoji: "🎬",
    tvAnalogy: "Like Match of the Day highlights",
    description: "The best moments from your feeds — curated, condensed, satisfying.",
    pacing: "rapid",
    layout: "card_stack",
    autoAdvance: true,
    voiced: false,
    minMinutes: 5,
    maxMinutes: 15,
    storyCount: 12,
    contentStrategy: { sortBy: "engagement", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: true, filterByMood: true },
  },
  // ─── RAPID ─────────────────────────────────────────────────────────────────
  {
    id: "hundred_in_hundred",
    name: "100 in 100",
    emoji: "🚀",
    tvAnalogy: "Like rapid-fire quiz TV",
    description: "100 headlines in 100 seconds. Auto-advancing. Pure speed.",
    pacing: "instant",
    layout: "fullscreen",
    autoAdvance: true,
    voiced: false,
    minMinutes: 2,
    maxMinutes: 2,
    storyCount: 100,
    contentStrategy: { sortBy: "relevance", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: true },
  },
  {
    id: "speed_round",
    name: "Speed Round",
    emoji: "💨",
    tvAnalogy: "Like a game show lightning round",
    description: "10 stories in 60 seconds. Faster than flash.",
    pacing: "instant",
    layout: "fullscreen",
    autoAdvance: true,
    voiced: false,
    minMinutes: 1,
    maxMinutes: 1,
    storyCount: 10,
    contentStrategy: { sortBy: "mood_fit", deduplicate: true, crossPlatform: true, includeNotifications: false, includePersonalActivity: false, filterByMood: true },
  },
];

// ─── Format groups for UI ─────────────────────────────────────────────────────

export const FORMAT_GROUPS = [
  { id: "news",          label: "News",          emoji: "📰", formats: ["breaking_news", "morning_show", "evening_news", "flash_briefing"] },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", formats: ["late_night", "talk_show", "reality_check", "countdown"] },
  { id: "deep",          label: "Deep Dive",     emoji: "🔭", formats: ["documentary", "explainer"] },
  { id: "live",          label: "Live",          emoji: "🔴", formats: ["live_feed", "breaking_ticker"] },
  { id: "catchup",       label: "Catch-up",      emoji: "⏮️", formats: ["previously_on", "weekly_recap", "highlight_reel"] },
  { id: "rapid",         label: "Rapid Fire",    emoji: "⚡", formats: ["hundred_in_hundred", "speed_round"] },
] as const;
