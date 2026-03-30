import { FeedItem } from "@social-tv/shared";

export async function fetchTwitterFeed(accessToken: string): Promise<FeedItem[]> {
  try {
    // X API v2 — home timeline
    const res = await fetch(
      "https://api.twitter.com/2/timelines/home?max_results=20&tweet.fields=created_at,public_metrics,entities,attachments&expansions=author_id,attachments.media_keys&user.fields=name,username,profile_image_url&media.fields=url,preview_image_url",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) return mockTwitterFeed();
    const json = await res.json();

    const users = new Map(json.includes?.users?.map((u: any) => [u.id, u]) ?? []);
    const media = new Map(json.includes?.media?.map((m: any) => [m.media_key, m]) ?? []);

    return (json.data ?? []).map((tweet: any, i: number): FeedItem => {
      const author: any = users.get(tweet.author_id) ?? {};
      const mediaKey = tweet.attachments?.media_keys?.[0];
      const mediaItem: any = mediaKey ? media.get(mediaKey) : null;

      return {
        id: `twitter-${tweet.id}`,
        channelId: `twitter-${tweet.author_id}`,
        platform: "twitter",
        type: "post",
        summary: tweet.text,
        url: `https://x.com/i/web/status/${tweet.id}`,
        imageUrl: mediaItem?.url ?? mediaItem?.preview_image_url,
        author: author.name ?? "Unknown",
        authorHandle: `@${author.username ?? "unknown"}`,
        authorAvatarUrl: author.profile_image_url,
        publishedAt: tweet.created_at ?? new Date().toISOString(),
        engagementScore: Math.min(10, (tweet.public_metrics?.like_count ?? 0) / 1000 + (10 - i * 0.5)),
        stats: {
          likes: tweet.public_metrics?.like_count,
          comments: tweet.public_metrics?.reply_count,
          shares: tweet.public_metrics?.retweet_count,
        },
        tags: tweet.entities?.hashtags?.map((h: any) => h.tag) ?? [],
      };
    });
  } catch {
    return mockTwitterFeed();
  }
}

function mockTwitterFeed(): FeedItem[] {
  return [
    { id: "tw-1", channelId: "twitter", platform: "twitter", type: "post", summary: "Just shipped a massive update to the AI editor. The new context window is insane 🔥", author: "You", authorHandle: "@you", url: "https://x.com", publishedAt: new Date(Date.now() - 30 * 60000).toISOString(), engagementScore: 9.5, stats: { likes: 847, comments: 93, shares: 210 }, tags: ["AI"], imageUrl: "https://picsum.photos/seed/tw1/800/600" },
    { id: "tw-2", channelId: "twitter", platform: "twitter", type: "post", summary: "Hot take: the best AI products are the ones you forget are powered by AI.", author: "Tech Friend", authorHandle: "@techfriend", url: "https://x.com", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), engagementScore: 8, stats: { likes: 5200 }, tags: ["AI", "Product"], imageUrl: "https://picsum.photos/seed/tw2/800/600" },
  ];
}
