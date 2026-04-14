import { FeedItem } from "@social-tv/shared";

export interface VisualMetadata {
  // Background
  backgroundType: "image" | "gradient" | "pattern";
  backgroundImage?: string;
  backgroundGradient?: [string, string];

  // Lower third
  lowerThird: {
    name: string;
    title: string;
    accentColor: string;
    platform: string;
  };

  // Stats overlay
  statsOverlay: {
    primary: string;
    secondary?: string;
    trending?: boolean;
  };

  // Rank badge (if applicable)
  rank?: number;

  // Topic badge
  topicBadge?: {
    label: string;
    emoji: string;
    color: string;
  };

  // Engagement ring (0-1 normalized score for visual ring)
  engagementRing: number;

  // Auto-generated headline (cleaned up from post)
  cleanHeadline: string;

  // Color palette extracted from platform + content
  palette: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
}

const PLATFORM_COLORS: Record<string, { primary: string; secondary: string }> = {
  twitter:   { primary: "#1DA1F2", secondary: "#0d8ecf" },
  instagram: { primary: "#E1306C", secondary: "#F77737" },
  youtube:   { primary: "#FF0000", secondary: "#cc0000" },
  linkedin:  { primary: "#0A66C2", secondary: "#004182" },
};

const TOPIC_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  tech:          { label: "TECH",          emoji: "\u{1F4BB}", color: "#3b82f6" },
  ai:            { label: "AI",            emoji: "\u{1F916}", color: "#8b5cf6" },
  business:      { label: "BUSINESS",      emoji: "\u{1F4BC}", color: "#0ea5e9" },
  entertainment: { label: "ENTERTAINMENT", emoji: "\u{1F3AD}", color: "#f59e0b" },
  sports:        { label: "SPORTS",        emoji: "\u{1F3C6}", color: "#22c55e" },
  lifestyle:     { label: "LIFESTYLE",     emoji: "\u{1F33F}", color: "#10b981" },
  music:         { label: "MUSIC",         emoji: "\u{1F3B5}", color: "#ec4899" },
  food:          { label: "FOOD",          emoji: "\u{1F355}", color: "#f97316" },
  travel:        { label: "TRAVEL",        emoji: "\u2708\uFE0F", color: "#06b6d4" },
  finance:       { label: "FINANCE",       emoji: "\u{1F4C8}", color: "#14b8a6" },
  viral:         { label: "VIRAL",         emoji: "\u{1F525}", color: "#ef4444" },
};

function detectTopic(item: FeedItem): { label: string; emoji: string; color: string } | null {
  const text = [item.title, item.summary, ...item.tags].join(" ").toLowerCase();
  for (const [key, topic] of Object.entries(TOPIC_MAP)) {
    if (text.includes(key)) return topic;
  }
  return null;
}

function formatStat(n: number | undefined): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function cleanHeadline(item: FeedItem): string {
  let text = item.title ?? item.summary ?? "";
  // Remove URLs
  text = text.replace(/https?:\/\/\S+/g, "").trim();
  // Remove excessive hashtags (keep max 1)
  const hashtags = text.match(/#\w+/g) ?? [];
  if (hashtags.length > 1) {
    hashtags.slice(1).forEach(h => { text = text.replace(h, ""); });
  }
  // Trim to 120 chars
  if (text.length > 120) text = text.substring(0, 117) + "...";
  return text.trim();
}

export function generateVisuals(item: FeedItem, rank?: number): VisualMetadata {
  const platformColors = PLATFORM_COLORS[item.platform] ?? { primary: "#6c47ff", secondary: "#a855f7" };
  const topic = detectTopic(item);
  const stats = item.stats;

  // Pick primary stat
  const statValues = [
    stats.views ? { val: stats.views, label: "views" } : null,
    stats.likes ? { val: stats.likes, label: "likes" } : null,
    stats.shares ? { val: stats.shares, label: "shares" } : null,
    stats.comments ? { val: stats.comments, label: "comments" } : null,
  ].filter(Boolean) as { val: number; label: string }[];

  statValues.sort((a, b) => b.val - a.val);

  const primaryStat = statValues[0] ? `${formatStat(statValues[0].val)} ${statValues[0].label}` : null;
  const secondaryStat = statValues[1] ? `${formatStat(statValues[1].val)} ${statValues[1].label}` : null;

  // Engagement normalized 0-1
  const engScore = item.engagementScore ?? 5;
  const engagementRing = Math.min(engScore / 10, 1);

  // Is trending?
  const totalEngagement = (stats.likes ?? 0) + (stats.comments ?? 0) + (stats.shares ?? 0);
  const trending = totalEngagement > 1000;

  return {
    backgroundType: item.imageUrl ? "image" : "gradient",
    backgroundImage: item.imageUrl ?? undefined,
    backgroundGradient: item.imageUrl ? undefined : [platformColors.primary + "40", "#0a0a0f"],

    lowerThird: {
      name: item.author ?? "Unknown",
      title: item.authorHandle ?? item.platform,
      accentColor: topic?.color ?? platformColors.primary,
      platform: item.platform.toUpperCase(),
    },

    statsOverlay: {
      primary: primaryStat ?? "New",
      secondary: secondaryStat ?? undefined,
      trending,
    },

    rank,

    topicBadge: topic ?? undefined,

    engagementRing,

    cleanHeadline: cleanHeadline(item),

    palette: {
      primary: topic?.color ?? platformColors.primary,
      secondary: platformColors.secondary,
      text: "#ffffff",
      accent: topic?.color ?? platformColors.primary,
    },
  };
}

// Batch generate for a feed
export function generateFeedVisuals(items: FeedItem[]): Array<FeedItem & { visuals: VisualMetadata }> {
  return items.map((item, i) => ({
    ...item,
    visuals: generateVisuals(item, i + 1),
  }));
}
