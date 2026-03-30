import { MoodId } from "@social-tv/shared";

export const MOOD_CONFIGS: Record<MoodId, {
  boostTags: string[];
  suppressTags: string[];
  promptContext: string;
}> = {
  focused: {
    boostTags: ["work", "productivity", "tech", "ai", "finance", "business", "tools"],
    suppressTags: ["meme", "entertainment", "sports", "funny", "celebrity"],
    promptContext: "User wants signal not noise. Prioritise actionable, professional content. Be direct.",
  },
  curious: {
    boostTags: ["science", "space", "research", "explainer", "deep", "discovery"],
    suppressTags: [],
    promptContext: "User wants to learn and explore. Surface surprising or educational content. Add context.",
  },
  chill: {
    boostTags: ["entertainment", "funny", "lifestyle", "art", "music", "travel", "culture"],
    suppressTags: ["politics", "conflict", "breaking", "crisis", "negative"],
    promptContext: "User is relaxed. Keep it light, positive and entertaining. No heavy topics.",
  },
  stressed: {
    boostTags: ["summary", "highlights", "tldr", "quick"],
    suppressTags: ["conflict", "negative", "crisis", "breaking", "controversy"],
    promptContext: "User is stressed. Be ultra-brief. Positive framing only. No anxiety-inducing content.",
  },
  energised: {
    boostTags: [],
    suppressTags: [],
    promptContext: "User is ready for anything. Full variety. High energy tone. Don't hold back.",
  },
};
