import { FeedItem, VerticalId, CONTENT_VERTICALS } from "@social-tv/shared";

/**
 * Classify a feed item into a content vertical.
 * Uses keyword heuristics first (fast, no API cost).
 * Falls back to AI classification for ambiguous items.
 */
export function classifyVertical(item: FeedItem, selfHandles: string[] = []): VerticalId {
  // Personal content check first
  if (selfHandles.length > 0 && selfHandles.some(h =>
    item.authorHandle?.toLowerCase().includes(h.toLowerCase()) ||
    item.author?.toLowerCase() === "you"
  )) {
    return "personal";
  }

  const text = [item.title, item.summary, item.tags?.join(" ")].filter(Boolean).join(" ").toLowerCase();

  // Score each vertical by keyword matches
  const scores: Record<VerticalId, number> = {} as any;

  for (const vertical of CONTENT_VERTICALS) {
    if (vertical.id === "personal") continue;
    let score = 0;
    for (const kw of vertical.classifyKeywords) {
      if (text.includes(kw)) score++;
    }
    // Boost if platform matches typical vertical
    if (vertical.id === "sports" && item.tags?.some(t => ["Sports", "Football", "NBA", "Cricket"].includes(t))) score += 3;
    if (vertical.id === "tech" && ["Dev", "AI", "Tech"].some(t => item.tags?.includes(t))) score += 3;
    if (vertical.id === "business" && ["Career", "Finance"].some(t => item.tags?.includes(t))) score += 3;

    scores[vertical.id as VerticalId] = score;
  }

  // Find highest scoring vertical
  let best: VerticalId = "entertainment";
  let bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = id as VerticalId;
    }
  }

  // If no strong match, use platform heuristics
  if (bestScore === 0) {
    if (item.platform === "linkedin") return "business";
    if (item.platform === "youtube") return "entertainment";
    if (item.platform === "instagram") return "lifestyle";
    if (item.platform === "twitter") return "tech";
  }

  return best;
}

export function classifyFeed(items: FeedItem[], selfHandles: string[] = []): FeedItem[] {
  return items.map(item => ({
    ...item,
    verticalId: item.verticalId ?? classifyVertical(item, selfHandles),
  }));
}
