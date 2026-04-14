import { FeedItem } from "@social-tv/shared";
import { aggregateFeed } from "./feed/FeedAggregator";

export type FeedMode = "top10" | "close_friends" | "mood_feed" | "full_feed";

export interface ProcessedFeed {
  mode: FeedMode;
  stories: RankedStory[];
  generatedAt: string;
  totalCandidates: number;
}

export interface RankedStory {
  item: FeedItem;
  rank: number;
  score: number;
  reasons: string[];       // why this story ranked here
  crossPlatform: string[]; // platforms where this appeared
  presenterLine: string;   // one-liner the presenter says
}

// Dedup by title similarity (>50% word overlap)
function dedup(items: FeedItem[]): FeedItem[] {
  const seen = new Map<string, FeedItem>();
  for (const item of items) {
    const words = new Set((item.title ?? item.summary).toLowerCase().split(/\s+/).filter(w => w.length > 3));
    let isDup = false;
    for (const [key, existing] of seen) {
      const existingWords = new Set(key.split(/\s+/).filter(w => w.length > 3));
      let overlap = 0;
      for (const w of words) if (existingWords.has(w)) overlap++;
      if (overlap / Math.max(words.size, existingWords.size) > 0.5) {
        // Keep higher engagement
        if (item.engagementScore > existing.engagementScore) {
          seen.delete(key);
          seen.set((item.title ?? item.summary).toLowerCase(), item);
        }
        isDup = true;
        break;
      }
    }
    if (!isDup) seen.set((item.title ?? item.summary).toLowerCase(), item);
  }
  return Array.from(seen.values());
}

// Score a story based on engagement, recency, and platform diversity
function scoreStory(item: FeedItem, allItems: FeedItem[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Engagement (0-4 points)
  const eng = item.engagementScore ?? 0;
  score += Math.min(eng / 2.5, 4);
  if (eng >= 8) reasons.push("High engagement");

  // Recency (0-3 points, decays over 24h)
  const ageHours = (Date.now() - new Date(item.publishedAt).getTime()) / 3600000;
  const recencyScore = Math.max(0, 3 - (ageHours / 8));
  score += recencyScore;
  if (ageHours < 1) reasons.push("Just posted");
  else if (ageHours < 3) reasons.push("Recent");

  // Stats boost (0-2 points)
  const stats = item.stats ?? {};
  const totalInteractions = (stats.likes ?? 0) + (stats.comments ?? 0) + (stats.shares ?? 0) + (stats.views ?? 0) / 100;
  if (totalInteractions > 1000) { score += 2; reasons.push("Viral"); }
  else if (totalInteractions > 100) { score += 1; reasons.push("Popular"); }

  // Personal content boost
  if (item.author === "You" || item.authorHandle === "@you") {
    score += 1.5;
    reasons.push("Your content");
  }

  return { score: Math.round(score * 10) / 10, reasons };
}

// Generate a presenter one-liner for a story
function generatePresenterLine(item: FeedItem, rank: number): string {
  const platform = item.platform ?? "social";
  const author = item.author ?? "someone";
  const lines = [
    `Coming in at number ${rank} — ${author} on ${platform}.`,
    `At number ${rank}, from your ${platform} feed.`,
    `Number ${rank} — this one's from ${platform}, and it's worth your time.`,
    `Spot number ${rank} goes to ${author}.`,
    `And at ${rank}, here's what caught our eye on ${platform}.`,
  ];
  return lines[rank % lines.length];
}

export async function processContentFeed(
  platforms: string[],
  mode: FeedMode,
  options: {
    moodId?: string;
    limit?: number;
    closeFriends?: string[];  // handles to prioritise
  } = {}
): Promise<ProcessedFeed> {
  const limit = options.limit ?? (mode === "top10" ? 10 : 20);

  // Aggregate from ALL platforms
  const raw = await aggregateFeed(platforms.length > 0 ? platforms as any : ["twitter", "instagram", "youtube", "linkedin"]);
  const deduped = dedup(raw);

  // Score everything
  let scored = deduped.map(item => {
    const { score, reasons } = scoreStory(item, deduped);
    return { item, score, reasons };
  });

  // Mode-specific adjustments
  if (mode === "close_friends" && options.closeFriends?.length) {
    scored = scored.map(s => {
      const isFriend = options.closeFriends!.some(h =>
        s.item.authorHandle?.toLowerCase().includes(h.toLowerCase()) ||
        s.item.author?.toLowerCase().includes(h.toLowerCase())
      );
      if (isFriend) {
        s.score += 3;
        s.reasons.push("Close friend");
      }
      return s;
    });
  }

  if (mode === "mood_feed" && options.moodId) {
    scored = scored.map(s => {
      // Simple mood matching via tags
      const tags = (s.item.tags ?? []).join(" ").toLowerCase();
      const moodBoosts: Record<string, string[]> = {
        focused: ["work", "productivity", "tech", "dev", "ai", "career"],
        curious: ["learn", "science", "research", "explain", "how"],
        chill: ["fun", "meme", "travel", "food", "life", "relax"],
        stressed: ["calm", "wellness", "meditation", "nature", "good news"],
        energised: ["hype", "launch", "win", "goals", "fitness", "music"],
      };
      const boostTerms = moodBoosts[options.moodId!] ?? [];
      const matches = boostTerms.filter(t => tags.includes(t));
      if (matches.length > 0) {
        s.score += matches.length * 0.5;
        s.reasons.push(`Matches ${options.moodId} mood`);
      }
      return s;
    });
  }

  // Sort by score, take top N
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  // Build ranked stories with presenter lines
  const stories: RankedStory[] = top.map((s, i) => ({
    item: s.item,
    rank: i + 1,
    score: s.score,
    reasons: s.reasons,
    crossPlatform: [s.item.platform],
    presenterLine: generatePresenterLine(s.item, i + 1),
  }));

  return {
    mode,
    stories,
    generatedAt: new Date().toISOString(),
    totalCandidates: raw.length,
  };
}
