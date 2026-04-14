import { FeedItem, Channel } from "@social-tv/shared";
import { env } from "../../../lib/env";

const SUBREDDIT_MAP: Record<string, string[]> = {
  tech: ["technology", "programming", "artificial"],
  finance: ["investing", "stocks", "CryptoCurrency"],
  science: ["science", "EverythingScience"],
  entertainment: ["movies", "Music", "television"],
  sports: ["sports", "soccer", "nba"],
  space: ["space", "spacex", "nasa"],
  reddit_hot: ["all"],
  world: ["worldnews"],
};

let redditToken: { token: string; expiry: number } | null = null;

async function getRedditToken(): Promise<string | null> {
  if (!env.REDDIT_CLIENT_ID || !env.REDDIT_CLIENT_SECRET) return null;
  if (redditToken && Date.now() < redditToken.expiry) return redditToken.token;

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${env.REDDIT_CLIENT_ID}:${env.REDDIT_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "ai-tv-news/0.1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) return null;
  const json = await res.json();
  redditToken = { token: json.access_token, expiry: Date.now() + json.expires_in * 1000 };
  return redditToken.token;
}

export async function fetchReddit(channel: Channel): Promise<FeedItem[]> {
  const subreddits = SUBREDDIT_MAP[channel.id];
  if (!subreddits) return [];

  const token = await getRedditToken();
  const sub = subreddits[0]; // use first subreddit for now

  const baseUrl = token
    ? "https://oauth.reddit.com"
    : "https://www.reddit.com";

  const headers: Record<string, string> = {
    "User-Agent": "ai-tv-news/0.1.0",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${baseUrl}/r/${sub}/hot.json?limit=8`, { headers });
  if (!res.ok) return [];

  const json = await res.json();
  const posts = json.data?.children ?? [];

  return posts
    .filter((p: any) => !p.data.stickied && p.data.title)
    .map((p: any, i: number): FeedItem => {
      const d = p.data;
      return {
        id: `reddit-${d.id}`,
        channelId: channel.id,
        source: "reddit",
        title: d.title,
        summary: d.selftext
          ? d.selftext.slice(0, 280)
          : `${d.score.toLocaleString()} upvotes · ${d.num_comments} comments on r/${d.subreddit}`,
        url: `https://reddit.com${d.permalink}`,
        imageUrl:
          d.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ??
          (d.url?.match(/\.(jpg|png|gif|webp)$/i) ? d.url : undefined),
        author: `u/${d.author}`,
        publishedAt: new Date(d.created_utc * 1000).toISOString(),
        engagementScore: Math.min(10, d.score / 10000) + (10 - i),
        tags: [`r/${d.subreddit}`, channel.name],
      };
    });
}
