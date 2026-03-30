/**
 * SocialTV — Content Verticals
 *
 * Each vertical is like a dedicated TV channel. Posts from the user's
 * social accounts get AI-categorised into these verticals automatically.
 * The user then programs which verticals they want, in what format.
 */

export type VerticalId =
  | "breaking"      // Urgent alerts, important news from your network
  | "sports"        // Match scores, highlights, sports commentary
  | "fashion"       // Style, outfits, trends, fashion brands
  | "entertainment" // Celeb news, movies, TV, music, pop culture (Page 3)
  | "tech"          // Dev tools, product launches, AI, gadgets
  | "business"      // Markets, startups, funding, career, finance
  | "lifestyle"     // Food, travel, fitness, wellness, home
  | "politics"      // Political commentary, elections, policy
  | "science"       // Research, discoveries, environment, space
  | "culture"       // Art, books, design, photography
  | "gaming"        // Games, esports, streaming
  | "personal"      // Your own posts, mentions, direct activity

export interface ContentVertical {
  id: VerticalId;
  name: string;
  emoji: string;
  tvAnalogy: string;       // "Like ESPN" / "Like E! News" / "Like Bloomberg"
  description: string;
  classifyKeywords: string[];   // hints for AI categorisation
  defaultFormat: string;        // default TVFormatId for this vertical
  color: string;                // brand colour
  colorEnd: string;
}

export const CONTENT_VERTICALS: ContentVertical[] = [
  {
    id: "breaking",
    name: "Breaking",
    emoji: "🔴",
    tvAnalogy: "Like CNN Breaking News",
    description: "Urgent updates, major announcements, viral spikes in your network.",
    classifyKeywords: ["breaking", "urgent", "just in", "alert", "developing", "live"],
    defaultFormat: "breaking_news",
    color: "#cc0000",
    colorEnd: "#ff2200",
  },
  {
    id: "sports",
    name: "Sports",
    emoji: "🏆",
    tvAnalogy: "Like ESPN / Sky Sports",
    description: "Match results, player updates, sports commentary from your accounts.",
    classifyKeywords: ["match", "goal", "score", "game", "league", "player", "win", "loss", "tournament", "transfer", "fixture"],
    defaultFormat: "highlight_reel",
    color: "#0ea5e9",
    colorEnd: "#0369a1",
  },
  {
    id: "fashion",
    name: "Fashion",
    emoji: "👗",
    tvAnalogy: "Like E! / Vogue TV",
    description: "Style drops, outfit posts, brand collabs, trend reports.",
    classifyKeywords: ["outfit", "style", "fashion", "brand", "collection", "designer", "trend", "ootd", "lookbook", "wear"],
    defaultFormat: "highlight_reel",
    color: "#ec4899",
    colorEnd: "#be185d",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    emoji: "🎭",
    tvAnalogy: "Like Entertainment Tonight / Page 3",
    description: "Celebrity news, movie drops, viral moments, pop culture.",
    classifyKeywords: ["celebrity", "movie", "film", "music", "album", "tour", "award", "red carpet", "viral", "meme", "drama"],
    defaultFormat: "late_night",
    color: "#f59e0b",
    colorEnd: "#d97706",
  },
  {
    id: "tech",
    name: "Tech & Dev",
    emoji: "💻",
    tvAnalogy: "Like TechCrunch Live / MKBHD",
    description: "Product launches, AI tools, dev releases, startup news.",
    classifyKeywords: ["launch", "release", "ai", "model", "api", "update", "open source", "github", "startup", "app", "software", "developer", "coding"],
    defaultFormat: "flash_briefing",
    color: "#6c47ff",
    colorEnd: "#a855f7",
  },
  {
    id: "business",
    name: "Business",
    emoji: "💼",
    tvAnalogy: "Like Bloomberg / CNBC",
    description: "Funding rounds, market moves, career posts, professional insights.",
    classifyKeywords: ["funding", "raise", "market", "stock", "revenue", "startup", "investment", "ipo", "acquisition", "career", "job"],
    defaultFormat: "evening_news",
    color: "#0A66C2",
    colorEnd: "#1d4ed8",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    emoji: "🌿",
    tvAnalogy: "Like Good Morning America lifestyle segment",
    description: "Food, travel, fitness, home, wellness from your feeds.",
    classifyKeywords: ["food", "recipe", "travel", "fitness", "workout", "wellness", "home", "garden", "cooking", "restaurant", "holiday"],
    defaultFormat: "morning_show",
    color: "#10b981",
    colorEnd: "#047857",
  },
  {
    id: "politics",
    name: "Politics",
    emoji: "🏛️",
    tvAnalogy: "Like BBC Politics / CNN Politics",
    description: "Political commentary, elections, policy discussions in your network.",
    classifyKeywords: ["election", "vote", "government", "policy", "president", "parliament", "law", "protest", "party", "minister"],
    defaultFormat: "talk_show",
    color: "#6b7280",
    colorEnd: "#374151",
  },
  {
    id: "science",
    name: "Science",
    emoji: "🔬",
    tvAnalogy: "Like National Geographic / PBS",
    description: "Research papers, discoveries, space, climate, health breakthroughs.",
    classifyKeywords: ["research", "study", "discovery", "science", "space", "climate", "health", "nature", "environment", "nasa", "biology"],
    defaultFormat: "explainer",
    color: "#0891b2",
    colorEnd: "#0e7490",
  },
  {
    id: "culture",
    name: "Culture",
    emoji: "🎨",
    tvAnalogy: "Like Arte / Culture channel",
    description: "Art, books, design, photography, creative work from your feeds.",
    classifyKeywords: ["art", "design", "book", "photo", "photography", "creative", "museum", "exhibition", "culture", "architecture"],
    defaultFormat: "documentary",
    color: "#7c3aed",
    colorEnd: "#5b21b6",
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "🎮",
    tvAnalogy: "Like G4 / ESL Gaming",
    description: "Game releases, esports results, streaming highlights.",
    classifyKeywords: ["game", "gaming", "esports", "stream", "twitch", "playstation", "xbox", "nintendo", "release", "patch"],
    defaultFormat: "countdown",
    color: "#8b5cf6",
    colorEnd: "#6d28d9",
  },
  {
    id: "personal",
    name: "Your Activity",
    emoji: "⭐",
    tvAnalogy: "Like a personal highlight reel",
    description: "Your own posts, mentions, replies, and direct interactions.",
    classifyKeywords: [],  // special: uses author = self
    defaultFormat: "highlight_reel",
    color: "#f97316",
    colorEnd: "#ea580c",
  },
];

// Mood → recommended verticals (which channels to tune into per mood)
export const MOOD_VERTICAL_AFFINITY: Record<string, VerticalId[]> = {
  focused:    ["tech", "business", "science", "breaking"],
  curious:    ["science", "culture", "tech", "politics"],
  chill:      ["entertainment", "lifestyle", "fashion", "gaming"],
  stressed:   ["lifestyle", "entertainment", "personal"],
  energised:  ["sports", "breaking", "tech", "entertainment"],
};

// Format → suitable verticals
export const FORMAT_VERTICAL_FIT: Record<string, VerticalId[]> = {
  breaking_news:    ["breaking", "sports", "business", "politics"],
  morning_show:     ["breaking", "tech", "business", "lifestyle", "personal"],
  flash_briefing:   ["breaking", "tech", "business", "sports"],
  late_night:       ["entertainment", "gaming", "fashion", "culture"],
  highlight_reel:   ["personal", "sports", "fashion", "entertainment"],
  documentary:      ["science", "culture", "tech", "politics"],
  talk_show:        ["politics", "business", "culture", "tech"],
  countdown:        ["entertainment", "tech", "sports", "gaming"],
  evening_news:     ["breaking", "business", "politics", "tech"],
  reality_check:    ["entertainment", "fashion", "sports", "personal"],
};
