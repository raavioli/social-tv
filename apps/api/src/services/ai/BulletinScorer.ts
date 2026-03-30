/**
 * BulletinScorer — the brain of the bulletin system.
 *
 * Takes raw feed items + user context (mood, interests, time available)
 * and produces a ranked, annotated GeneratedBulletin.
 *
 * Uses GPT-4o-mini for:
 *   - Compressing headlines to punchy one-liners
 *   - Explaining "why it matters to THIS user"
 *   - Mood-fit scoring
 *
 * Falls back to heuristic scoring if no OpenAI key.
 */
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  FeedItem,
  MoodId,
  BulletinFormatId,
  GeneratedBulletin,
  BulletinStory,
  InterestProfile,
} from "@social-tv/shared";
import { env } from "../../lib/env";
import { MOOD_CONFIGS } from "./moodConfig";
import { BULLETIN_FORMAT_CONFIG } from "./formatConfig";

interface ScoreBulletinParams {
  feedItems: FeedItem[];
  mood: MoodId;
  availableMinutes: number;
  formatId: BulletinFormatId;
  interestProfile?: InterestProfile;
  date: string;
}

export async function scoreBulletin(params: ScoreBulletinParams): Promise<GeneratedBulletin> {
  const { feedItems, mood, availableMinutes, formatId, interestProfile, date } = params;
  const moodCfg = MOOD_CONFIGS[mood];
  const fmtCfg = BULLETIN_FORMAT_CONFIG[formatId];

  // Step 1: heuristic pre-scoring (fast, no API needed)
  const prescored = feedItems.map((item) => {
    let score = item.engagementScore;

    // Mood boost/suppress
    for (const tag of item.tags) {
      if (moodCfg.boostTags.some((t) => tag.toLowerCase().includes(t))) score += 1.5;
      if (moodCfg.suppressTags.some((t) => tag.toLowerCase().includes(t))) score -= 2;
    }

    // Interest profile boost
    if (interestProfile) {
      for (const tag of item.tags) {
        const signal = interestProfile.signals.find(
          (s) => s.tag.toLowerCase() === tag.toLowerCase()
        );
        if (signal) score += (signal.score - 5) * 0.3; // ±1.5 max
      }
    }

    return { item, score: Math.max(0, Math.min(10, score)) };
  });

  // Step 2: sort + slice to format's story count
  const storyCount = fmtCfg.storyCount;
  const topItems = prescored
    .sort((a, b) => b.score - a.score)
    .slice(0, storyCount);

  // Step 3: AI annotation (if API key available)
  if (env.OPENAI_API_KEY && topItems.length > 0) {
    return await aiAnnotateBulletin(topItems, mood, availableMinutes, formatId, date, moodCfg);
  }

  // Step 4: fallback — heuristic annotation
  return heuristicBulletin(topItems, mood, availableMinutes, formatId, date);
}

async function aiAnnotateBulletin(
  items: { item: FeedItem; score: number }[],
  mood: MoodId,
  availableMinutes: number,
  formatId: BulletinFormatId,
  date: string,
  moodCfg: (typeof MOOD_CONFIGS)[MoodId]
): Promise<GeneratedBulletin> {
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY! });

  // Batch annotate in groups of 10 to stay within token limits
  const batches: { item: FeedItem; score: number }[][] = [];
  for (let i = 0; i < items.length; i += 10) batches.push(items.slice(i, i + 10));

  const allStories: BulletinStory[] = [];

  for (const [batchIdx, batch] of batches.entries()) {
    const inputJson = batch.map((b, i) => ({
      index: i,
      title: b.item.title ?? b.item.summary?.slice(0, 100),
      summary: b.item.summary?.slice(0, 200),
      platform: b.item.platform,
      tags: b.item.tags,
    }));

    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          stories: z.array(z.object({
            index: z.number(),
            headline: z.string().max(80),
            oneliner: z.string().max(150),
            whyItMatters: z.string().max(120),
            moodFit: z.number().min(0).max(10),
          })),
        }),
        system: `You are an intelligent news curator for a ${mood} user.
Mood context: ${moodCfg.promptContext}
Format: ${formatId} (${availableMinutes} minutes available).
Compress each story into a punchy TV-style headline, one-liner, and a personalised "why it matters" explanation.`,
        prompt: `Annotate these ${batch.length} stories:\n${JSON.stringify(inputJson, null, 2)}`,
      });

      for (const ann of object.stories) {
        const { item, score } = batch[ann.index];
        const rank = batchIdx * 10 + ann.index + 1;
        allStories.push({
          rank,
          feedItemId: item.id,
          headline: ann.headline,
          oneliner: ann.oneliner,
          whyItMatters: ann.whyItMatters,
          readingTimeSec: Math.ceil(ann.oneliner.split(" ").length / 3),
          platform: item.platform,
          imageUrl: item.imageUrl,
          url: item.url,
          tags: item.tags,
          relevanceScore: score,
          moodFit: ann.moodFit,
        });
      }
    } catch {
      // Fallback for this batch
      for (const [i, { item, score }] of batch.entries()) {
        allStories.push(makeHeuristicStory(item, score, batchIdx * 10 + i + 1));
      }
    }
  }

  const totalSec = allStories.reduce((s, st) => s + st.readingTimeSec, 0);

  return {
    id: `bulletin-${Date.now()}`,
    userId: "local",
    ruleId: "manual",
    formatId,
    date,
    mood,
    availableMinutes,
    title: buildTitle(mood, availableMinutes, formatId),
    stories: allStories,
    totalStoriesConsidered: items.length,
    generatedAt: new Date().toISOString(),
    estimatedDurationSec: totalSec,
  };
}

function heuristicBulletin(
  items: { item: FeedItem; score: number }[],
  mood: MoodId,
  availableMinutes: number,
  formatId: BulletinFormatId,
  date: string
): GeneratedBulletin {
  const stories = items.map(({ item, score }, i) =>
    makeHeuristicStory(item, score, i + 1)
  );
  return {
    id: `bulletin-${Date.now()}`,
    userId: "local",
    ruleId: "manual",
    formatId,
    date,
    mood,
    availableMinutes,
    title: buildTitle(mood, availableMinutes, formatId),
    stories,
    totalStoriesConsidered: items.length,
    generatedAt: new Date().toISOString(),
    estimatedDurationSec: stories.reduce((s, st) => s + st.readingTimeSec, 0),
  };
}

function makeHeuristicStory(item: FeedItem, score: number, rank: number): BulletinStory {
  return {
    rank,
    feedItemId: item.id,
    headline: item.title ?? item.summary?.slice(0, 80) ?? "Update",
    oneliner: item.summary?.slice(0, 150) ?? "",
    whyItMatters: `Trending on ${item.platform} with high engagement in your network.`,
    readingTimeSec: Math.ceil((item.summary?.split(" ").length ?? 10) / 3),
    platform: item.platform,
    imageUrl: item.imageUrl,
    url: item.url,
    tags: item.tags,
    relevanceScore: score,
    moodFit: score * 0.9,
  };
}

function buildTitle(mood: MoodId, minutes: number, format: BulletinFormatId): string {
  const moodLabel = { focused: "Sharp", curious: "Curious", chill: "Easy", stressed: "Quick", energised: "Full" }[mood];
  const timeLabel = minutes <= 5 ? `${minutes}-min` : minutes <= 15 ? `${minutes}-min` : "full";
  const formatLabel = { flash: "Flash Briefing", top10: "Top 10", top100: "Top 100", hundred_in_hundred: "100 in 100", deep_dive: "Deep Dive", custom: "Briefing" }[format];
  return `Your ${moodLabel} ${timeLabel} ${formatLabel}`;
}
