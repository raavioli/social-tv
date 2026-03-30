// SocialTV — Shared types between mobile app and API server

export type PlatformId = "twitter" | "instagram" | "youtube" | "linkedin";

export interface Platform {
  id: PlatformId;
  name: string;
  emoji: string;
  color: string;
  colorEnd: string;
  oauthScope: string[];
  description: string;
}

export interface ConnectedAccount {
  id: string;
  platform: PlatformId;
  username: string;
  displayName: string;
  avatarUrl?: string;
  channelNumber: number; // TV channel number (1, 2, 3...)
  isActive: boolean;
  connectedAt: string;
}

export interface Channel {
  id: string;
  platform: PlatformId;
  account: ConnectedAccount;
  channelNumber: number;
  name: string; // e.g. "@username on Twitter"
  color: string;
  colorEnd: string;
}

export interface FeedItem {
  id: string;
  channelId: string;
  platform: PlatformId;
  type: "post" | "video" | "story" | "article" | "reel";
  title?: string;
  summary: string; // AI-generated summary or original text
  body?: string;
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  publishedAt: string;
  engagementScore: number;
  stats: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
  tags: string[];
}

export interface ShowSegment {
  id: string;
  order: number;
  type: "intro" | "story" | "outro";
  feedItem?: FeedItem;
  scriptText: string;
  emotionCue: "neutral" | "excited" | "concerned" | "funny" | "inspiring";
  audioUrl?: string;
  durationSec?: number;
  imageUrl?: string;
}

export interface DailyShow {
  id: string;
  date: string;
  title: string;
  persona: PersonaId;
  channelId: string;
  segments: ShowSegment[];
  status: "generating" | "ready" | "played";
  generatedAt?: string;
}

export type PersonaId = "anchor_alex" | "host_maya" | "comedian_jay" | "chill_sam";

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  avatarEmoji: string;
  voiceId: string;
  style: "professional" | "friendly" | "comedic" | "chill";
  accentColor: string;
  promptStyle: string;
}

export interface RetainedItem {
  id: string;
  feedItemId: string;
  feedItem: FeedItem;
  type: "remember" | "follow_up" | "task";
  note?: string;
  dueDate?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface UserSettings {
  selectedPersonaId: PersonaId;
  activeChannelId: string | null;
  showTime: string;
  timezone: string;
  ttsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface GenerateShowRequest {
  channelId: string;
  personaId: PersonaId;
  date: string;
}

// OAuth
export interface OAuthStartResponse {
  authUrl: string;
  state: string;
}

export interface OAuthCallbackResult {
  account: ConnectedAccount;
  success: boolean;
}
