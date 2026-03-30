import { FeedItem, VerticalId, CONTENT_VERTICALS, TAXONOMY, extractEntities, getAncestors, resolveVocabTerm } from "@social-tv/shared";

export function classifyVertical(item: FeedItem, selfHandles: string[] = []): VerticalId {
  if (selfHandles.length > 0 && selfHandles.some(h =>
    item.authorHandle?.toLowerCase().includes(h.toLowerCase()) ||
    item.author?.toLowerCase() === "you"
  )) return "personal";

  const text = [item.title, item.summary, ...(item.tags ?? [])].filter(Boolean).join(" ").toLowerCase();

  // Entity signals (strongest)
  const entities = extractEntities(text);
  const entityVerticals = entities.flatMap(e =>
    e.taxonomyIds.map(tid => {
      const ancestors = getAncestors(tid);
      return ancestors[ancestors.length - 1]?.verticalId;
    })
  ).filter(Boolean) as string[];

  if (entityVerticals.length > 0) {
    // Return most common entity vertical
    const counts: Record<string, number> = {};
    for (const v of entityVerticals) counts[v] = (counts[v] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as VerticalId;
  }

  // Taxonomy node matching
  const nodeScores: Record<string, number> = {};
  for (const node of TAXONOMY) {
    let score = 0;
    if (text.includes(node.label.toLowerCase())) score += 2;
    for (const vocabId of node.vocabTerms) {
      const resolved = resolveVocabTerm(text.split(" ").find(w => resolveVocabTerm(w) === vocabId) ?? "");
      if (resolved === vocabId) score += 3;
    }
    if (score > 0) nodeScores[node.id] = score;
  }

  const bestNodeId = Object.entries(nodeScores).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (bestNodeId) {
    const ancestors = getAncestors(bestNodeId);
    const topLevel = ancestors[ancestors.length - 1];
    if (topLevel?.verticalId) return topLevel.verticalId as VerticalId;
  }

  // Content vertical keyword fallback
  const scores: Record<string, number> = {};
  for (const vertical of CONTENT_VERTICALS) {
    if (vertical.id === "personal") continue;
    for (const kw of vertical.classifyKeywords) {
      if (text.includes(kw)) scores[vertical.id] = (scores[vertical.id] ?? 0) + 1;
    }
  }
  const bestVertical = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (bestVertical) return bestVertical as VerticalId;

  // Platform defaults
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
