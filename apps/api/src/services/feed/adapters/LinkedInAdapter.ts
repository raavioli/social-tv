import { FeedItem } from "@social-tv/shared";

export async function fetchLinkedInFeed(accessToken: string): Promise<FeedItem[]> {
  // LinkedIn's API is heavily restricted — profile + shares only on free tier
  try {
    const profileRes = await fetch(
      "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!profileRes.ok) return mockLinkedInFeed();
    // Share feed requires Partner API access — return mock for now
    return mockLinkedInFeed();
  } catch {
    return mockLinkedInFeed();
  }
}

function mockLinkedInFeed(): FeedItem[] {
  return [
    { id: "li-1", channelId: "linkedin", platform: "linkedin", type: "article", title: "Why I left a $400k job to build in public", summary: "After 8 years in big tech, I made the leap. Here's my honest reflection 3 months in — the good, the hard, and what I'd do differently.", author: "Connection", authorHandle: "connection", url: "https://linkedin.com", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), engagementScore: 9.2, stats: { likes: 4200, comments: 890 }, tags: ["Career", "Startup"], imageUrl: "https://picsum.photos/seed/li1/800/600" },
    { id: "li-2", channelId: "linkedin", platform: "linkedin", type: "post", summary: "We just crossed 10,000 users with zero paid marketing. Here's the exact playbook we used.", author: "Founder Friend", authorHandle: "founderfriend", url: "https://linkedin.com", publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), engagementScore: 8.7, stats: { likes: 7800, comments: 1200 }, tags: ["Growth", "Startup"], imageUrl: "https://picsum.photos/seed/li2/800/600" },
  ];
}
