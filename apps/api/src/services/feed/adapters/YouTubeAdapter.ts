import { FeedItem } from "@social-tv/shared";

export async function fetchYouTubeFeed(accessToken: string): Promise<FeedItem[]> {
  try {
    // Get subscription activity feed
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&home=true&maxResults=10",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return mockYouTubeFeed();
    const json = await res.json();

    return (json.items ?? [])
      .filter((item: any) => item.snippet?.type === "upload")
      .map((item: any, i: number): FeedItem => {
        const snippet = item.snippet ?? {};
        const videoId = item.contentDetails?.upload?.videoId;
        return {
          id: `youtube-${item.id}`,
          channelId: "youtube",
          platform: "youtube",
          type: "video",
          title: snippet.title,
          summary: snippet.description?.slice(0, 200) ?? snippet.title,
          url: videoId ? `https://youtube.com/watch?v=${videoId}` : "https://youtube.com",
          imageUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url,
          author: snippet.channelTitle ?? "Unknown",
          authorHandle: snippet.channelTitle ?? "",
          publishedAt: snippet.publishedAt ?? new Date().toISOString(),
          engagementScore: 10 - i * 0.8,
          stats: {},
          tags: [],
        };
      });
  } catch {
    return mockYouTubeFeed();
  }
}

function mockYouTubeFeed(): FeedItem[] {
  return [
    { id: "yt-1", channelId: "youtube", platform: "youtube", type: "video", title: "Building an AI app in 24 hours", summary: "We attempted to ship a complete AI product in one day. Here's everything that went wrong and right.", author: "Favourite Creator", authorHandle: "FavChannel", url: "https://youtube.com", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), engagementScore: 9.8, stats: { views: 280000, likes: 18000 }, tags: ["AI", "Build"], imageUrl: "https://picsum.photos/seed/yt1/800/600" },
    { id: "yt-2", channelId: "youtube", platform: "youtube", type: "video", title: "The real cost of AI products in 2026", summary: "A breakdown of API costs, infrastructure, and how to stay profitable.", author: "Tech Analyst", authorHandle: "TechAnalyst", url: "https://youtube.com", publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(), engagementScore: 8.5, stats: { views: 95000, likes: 6200 }, tags: ["AI", "Business"], imageUrl: "https://picsum.photos/seed/yt2/800/600" },
  ];
}
