import { FeedItem, Channel } from "@social-tv/shared";
import { env } from "../../../lib/env";

const CATEGORY_MAP: Record<string, string> = {
  tech: "technology",
  world: "general",
  finance: "business",
  science: "science",
  entertainment: "entertainment",
  sports: "sports",
  space: "science",
};

export async function fetchNewsApi(channel: Channel): Promise<FeedItem[]> {
  if (!env.NEWS_API_KEY) {
    console.warn("NEWS_API_KEY not set — skipping NewsAPI fetch");
    return [];
  }

  const category = CATEGORY_MAP[channel.id] ?? "general";
  const query =
    channel.id === "space" ? "space nasa spacex" : undefined;

  const params = new URLSearchParams({
    apiKey: env.NEWS_API_KEY,
    language: "en",
    pageSize: "10",
    ...(query ? { q: query, sortBy: "publishedAt" } : { category, country: "us" }),
  });

  const endpoint = query
    ? `https://newsapi.org/v2/everything?${params}`
    : `https://newsapi.org/v2/top-headlines?${params}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);

  const json = await res.json();

  return (json.articles ?? [])
    .filter((a: any) => a.title && a.description && a.url)
    .map((a: any, i: number): FeedItem => ({
      id: `newsapi-${channel.id}-${Buffer.from(a.url).toString("base64").slice(0, 12)}`,
      channelId: channel.id,
      source: "newsapi",
      title: a.title,
      summary: a.description ?? "",
      body: a.content ?? undefined,
      url: a.url,
      imageUrl: a.urlToImage ?? undefined,
      author: a.author ?? a.source?.name ?? undefined,
      publishedAt: a.publishedAt ?? new Date().toISOString(),
      engagementScore: Math.max(0, 10 - i * 0.8),
      tags: [channel.name],
    }));
}
