import { FeedItem, VerticalId, CONTENT_VERTICALS } from "@social-tv/shared";

export function classifyVertical(item: FeedItem, selfHandles: string[] = []): VerticalId {
  if (selfHandles.length > 0 && selfHandles.some(h =>
    item.authorHandle?.toLowerCase().includes(h.toLowerCase()) ||
    item.author?.toLowerCase() === "you"
  )) return "personal";

  const text = [item.title, item.summary, ...(item.tags ?? [])].filter(Boolean).join(" ").toLowerCase();

  const scores: Record<string, number> = {};
  for (const vertical of CONTENT_VERTICALS) {
    if (vertical.id === "personal") continue;
    for (const kw of vertical.classifyKeywords) {
      if (text.includes(kw)) scores[vertical.id] = (scores[vertical.id] ?? 0) + 1;
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best) return best[0] as VerticalId;

  if (item.platform === "linkedin") return "business";
  if (item.platform === "youtube") return "entertainment";
  if (item.platform === "instagram") return "lifestyle";
  return "tech";
}

export function classifyFeed(items: FeedItem[], selfHandles: string[] = []): FeedItem[] {
  return items.map(item => ({
    ...item,
    verticalId: item.verticalId ?? classifyVertical(item, selfHandles),
  }));
}
