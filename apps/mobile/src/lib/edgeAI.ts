/**
 * Edge AI — On-device content intelligence
 *
 * Phase 1: Keyword + heuristic classifier (runs now, zero dependencies)
 * Phase 2: ONNX Runtime Mobile for real ML models (future)
 *
 * Design: all functions are sync and fast (<5ms per item)
 * so they can run in the UI thread without jank.
 */

// ─── Topic Classification ───────────────────────────────────────────────────

export type TopicId =
  | "tech" | "entertainment" | "business" | "sports"
  | "lifestyle" | "trending" | "science" | "gaming"
  | "food" | "travel" | "music" | "politics" | "personal";

interface TopicSignal {
  id: TopicId;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
  weight: number; // 0-1, higher = stronger match needed
}

const TOPIC_SIGNALS: TopicSignal[] = [
  { id: "tech", label: "Tech & AI", emoji: "\u{1F4BB}", color: "#3b82f6", weight: 0.7, keywords: [
    "ai", "artificial intelligence", "machine learning", "gpt", "llm", "coding", "programming",
    "developer", "software", "react", "typescript", "python", "api", "startup", "saas",
    "open source", "github", "deploy", "cloud", "database", "algorithm", "neural", "model",
    "fine-tune", "prompt", "claude", "openai", "anthropic", "hugging face", "transformer",
    "cpu", "gpu", "chip", "semiconductor", "robotics", "automation", "devtools", "framework",
  ]},
  { id: "business", label: "Business", emoji: "\u{1F4BC}", color: "#0ea5e9", weight: 0.7, keywords: [
    "market", "stock", "invest", "revenue", "profit", "startup", "founder", "ceo", "vc",
    "venture capital", "funding", "series", "ipo", "valuation", "acquisition", "merger",
    "earnings", "quarterly", "leadership", "management", "strategy", "growth", "scale",
    "b2b", "enterprise", "career", "hiring", "layoff", "remote work", "salary", "promotion",
    "linkedin", "networking", "professional", "consulting", "mba",
  ]},
  { id: "entertainment", label: "Entertainment", emoji: "\u{1F3AD}", color: "#f59e0b", weight: 0.6, keywords: [
    "movie", "film", "tv show", "series", "netflix", "streaming", "trailer", "celebrity",
    "actor", "actress", "director", "award", "oscar", "grammy", "emmy", "viral",
    "meme", "funny", "comedy", "drama", "podcast", "influencer", "creator", "content",
    "tiktok", "reel", "youtube", "subscriber", "views",
  ]},
  { id: "sports", label: "Sports", emoji: "\u{1F3C6}", color: "#22c55e", weight: 0.8, keywords: [
    "game", "match", "score", "goal", "win", "loss", "championship", "league", "tournament",
    "nba", "nfl", "premier league", "champions league", "world cup", "olympics",
    "player", "coach", "team", "transfer", "draft", "injury", "highlights", "espn",
    "cricket", "ipl", "tennis", "f1", "formula", "boxing", "ufc", "mma",
  ]},
  { id: "lifestyle", label: "Lifestyle", emoji: "\u{1F33F}", color: "#10b981", weight: 0.5, keywords: [
    "wellness", "meditation", "mindfulness", "self-care", "routine", "morning",
    "fitness", "workout", "gym", "yoga", "health", "diet", "nutrition", "recipe",
    "fashion", "style", "outfit", "beauty", "skincare", "home", "decor", "garden",
    "relationship", "dating", "parenting", "family", "motivation", "productivity",
  ]},
  { id: "music", label: "Music", emoji: "\u{1F3B5}", color: "#ec4899", weight: 0.7, keywords: [
    "album", "song", "track", "single", "artist", "band", "concert", "tour", "festival",
    "rap", "hip hop", "pop", "rock", "electronic", "edm", "spotify", "playlist",
    "producer", "beat", "remix", "vinyl", "release", "drop", "music video",
  ]},
  { id: "science", label: "Science", emoji: "\u{1F52C}", color: "#6366f1", weight: 0.7, keywords: [
    "research", "study", "discovery", "experiment", "physics", "biology", "chemistry",
    "space", "nasa", "mars", "quantum", "genome", "climate", "environment",
    "sustainability", "renewable", "carbon", "vaccine", "medicine", "breakthrough",
  ]},
  { id: "gaming", label: "Gaming", emoji: "\u{1F3AE}", color: "#14b8a6", weight: 0.7, keywords: [
    "game", "gaming", "playstation", "xbox", "nintendo", "steam", "pc gaming",
    "esports", "twitch", "streamer", "fps", "rpg", "mmorpg", "indie game",
    "gamer", "console", "update", "patch", "dlc", "gameplay", "review",
  ]},
  { id: "food", label: "Food", emoji: "\u{1F355}", color: "#f97316", weight: 0.6, keywords: [
    "food", "recipe", "cooking", "restaurant", "chef", "cuisine", "foodie",
    "coffee", "wine", "beer", "cocktail", "brunch", "dinner", "vegan",
    "baking", "kitchen", "meal prep", "street food", "michelin",
  ]},
  { id: "travel", label: "Travel", emoji: "\u2708\uFE0F", color: "#06b6d4", weight: 0.6, keywords: [
    "travel", "trip", "destination", "flight", "hotel", "airbnb", "backpack",
    "adventure", "explore", "beach", "mountain", "city", "passport", "visa",
    "vacation", "holiday", "road trip", "nomad", "wanderlust",
  ]},
  { id: "politics", label: "Politics", emoji: "\u{1F3DB}\uFE0F", color: "#64748b", weight: 0.8, keywords: [
    "election", "vote", "government", "president", "congress", "parliament",
    "policy", "legislation", "democrat", "republican", "liberal", "conservative",
    "campaign", "debate", "senate", "court", "supreme", "law", "regulation",
  ]},
];

export interface ClassificationResult {
  topicId: TopicId;
  confidence: number;        // 0-1
  allScores: Array<{ topicId: TopicId; score: number }>;
  isPersonal: boolean;
}

export function classifyContent(text: string, authorHandle?: string): ClassificationResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Personal content detection
  const isPersonal = authorHandle === "@you" || lower.includes("your post") || lower.includes("your reel") || lower.includes("profile view");

  const scores: Array<{ topicId: TopicId; score: number }> = TOPIC_SIGNALS.map(topic => {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (keyword.includes(" ")) {
        // Multi-word: check phrase
        if (lower.includes(keyword)) score += 2;
      } else {
        // Single word: check word boundary
        if (words.includes(keyword)) score += 1;
      }
    }
    // Normalize by keyword count and weight
    const normalized = (score / Math.max(topic.keywords.length * 0.3, 1)) * topic.weight;
    return { topicId: topic.id, score: Math.min(normalized, 1) };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const topicId: TopicId = best.score > 0.1 ? best.topicId : "entertainment"; // default

  return {
    topicId: isPersonal ? "personal" : topicId,
    confidence: best.score,
    allScores: scores.filter(s => s.score > 0),
    isPersonal,
  };
}

// ─── Sentiment Analysis ─────────────────────────────────────────────────────

export type Sentiment = "positive" | "negative" | "neutral" | "excited" | "urgent";

const SENTIMENT_PATTERNS: Record<Sentiment, string[]> = {
  positive: ["great", "amazing", "love", "excited", "happy", "congratulations", "awesome", "incredible", "beautiful", "perfect", "win", "success", "growth", "milestone", "proud", "grateful", "thank"],
  negative: ["fail", "crash", "loss", "worst", "terrible", "disappointed", "layoff", "cut", "decline", "drop", "crisis", "concern", "warning", "risk", "problem", "issue"],
  excited: ["\u{1F525}", "\u{1F680}", "\u{1F4AF}", "insane", "huge", "massive", "blown away", "game changer", "revolutionary", "mind-blowing", "viral", "blowing up", "breaking"],
  urgent: ["breaking", "just in", "alert", "urgent", "live", "happening now", "developing", "emergency", "critical", "immediate"],
  neutral: [],
};

export function detectSentiment(text: string): { sentiment: Sentiment; confidence: number } {
  const lower = text.toLowerCase();

  const scores: Record<Sentiment, number> = { positive: 0, negative: 0, neutral: 0, excited: 0, urgent: 0 };

  for (const [sentiment, patterns] of Object.entries(SENTIMENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) scores[sentiment as Sentiment]++;
    }
  }

  const entries = Object.entries(scores) as [Sentiment, number][];
  entries.sort((a, b) => b[1] - a[1]);

  if (entries[0][1] === 0) return { sentiment: "neutral", confidence: 0.5 };

  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  return {
    sentiment: entries[0][0],
    confidence: Math.min(entries[0][1] / Math.max(total, 1), 1),
  };
}

// ─── Mood Matching ──────────────────────────────────────────────────────────

export type MoodId = "focused" | "curious" | "chill" | "energised" | "stressed";

const MOOD_TOPIC_AFFINITY: Record<MoodId, Record<TopicId, number>> = {
  focused:   { tech: 1, business: 0.9, science: 0.8, politics: 0.3, entertainment: 0.2, sports: 0.2, lifestyle: 0.3, music: 0.1, gaming: 0.1, food: 0.2, travel: 0.2, trending: 0.3, personal: 0.5 },
  curious:   { tech: 0.8, science: 1, business: 0.6, entertainment: 0.5, travel: 0.7, food: 0.5, music: 0.4, sports: 0.3, lifestyle: 0.5, gaming: 0.3, politics: 0.4, trending: 0.6, personal: 0.4 },
  chill:     { entertainment: 1, music: 0.9, food: 0.8, travel: 0.8, lifestyle: 0.9, sports: 0.5, gaming: 0.7, tech: 0.2, business: 0.1, science: 0.3, politics: 0.1, trending: 0.6, personal: 0.7 },
  energised: { sports: 1, trending: 0.9, entertainment: 0.8, music: 0.8, gaming: 0.6, tech: 0.5, business: 0.4, lifestyle: 0.5, food: 0.3, travel: 0.4, science: 0.3, politics: 0.2, personal: 0.6 },
  stressed:  { lifestyle: 1, food: 0.8, travel: 0.7, music: 0.7, entertainment: 0.6, personal: 0.5, sports: 0.3, tech: 0.2, business: 0.1, science: 0.3, gaming: 0.4, politics: 0, trending: 0.3 },
};

export function scoreMoodRelevance(topicId: TopicId, moodId: MoodId): number {
  return MOOD_TOPIC_AFFINITY[moodId]?.[topicId] ?? 0.3;
}

// ─── Batch Process ──────────────────────────────────────────────────────────

export interface EnrichedItem {
  classification: ClassificationResult;
  sentiment: { sentiment: Sentiment; confidence: number };
  moodScore?: number;
}

export function enrichItem(text: string, authorHandle?: string, moodId?: MoodId): EnrichedItem {
  const classification = classifyContent(text, authorHandle);
  const sentiment = detectSentiment(text);
  const moodScore = moodId ? scoreMoodRelevance(classification.topicId, moodId) : undefined;

  return { classification, sentiment, moodScore };
}
