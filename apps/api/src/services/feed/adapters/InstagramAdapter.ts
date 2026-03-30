import { FeedItem } from "@social-tv/shared";

export async function fetchInstagramFeed(accessToken: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&access_token=${accessToken}&limit=12`
    );
    if (!res.ok) return mockInstagramFeed();
    const json = await res.json();

    return (json.data ?? []).map((post: any, i: number): FeedItem => ({
      id: `instagram-${post.id}`,
      channelId: "instagram",
      platform: "instagram",
      type: post.media_type === "VIDEO" ? "reel" : "post",
      summary: post.caption ?? "",
      url: post.permalink,
      imageUrl: post.thumbnail_url ?? post.media_url,
      videoUrl: post.media_type === "VIDEO" ? post.media_url : undefined,
      author: "You",
      authorHandle: "@you",
      publishedAt: post.timestamp,
      engagementScore: Math.min(10, (post.like_count ?? 0) / 500 + (10 - i * 0.5)),
      stats: { likes: post.like_count, comments: post.comments_count },
      tags: extractHashtags(post.caption ?? ""),
    }));
  } catch {
    return mockInstagramFeed();
  }
}

function extractHashtags(text: string): string[] {
  return (text.match(/#\w+/g) ?? []).map((t) => t.slice(1)).slice(0, 5);
}

function mockInstagramFeed(): FeedItem[] {
  return [
    { id: "ig-1", channelId: "instagram", platform: "instagram", type: "post", summary: "Golden hour hits different when you're up early ✨ #morning #grateful", author: "You", authorHandle: "@yourhandle", url: "https://instagram.com", publishedAt: new Date(Date.now() - 3600000).toISOString(), engagementScore: 9.5, stats: { likes: 1240, comments: 67 }, tags: ["morning", "grateful"], imageUrl: "https://picsum.photos/seed/ig1/800/600" },
    { id: "ig-2", channelId: "instagram", platform: "instagram", type: "reel", summary: "Behind the scenes of building the app 👨‍💻 #buildinpublic #tech", author: "You", authorHandle: "@yourhandle", url: "https://instagram.com", publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(), engagementScore: 8.8, stats: { likes: 880, comments: 42 }, tags: ["buildinpublic", "tech"], imageUrl: "https://picsum.photos/seed/ig2/800/600" },
  ];
}
