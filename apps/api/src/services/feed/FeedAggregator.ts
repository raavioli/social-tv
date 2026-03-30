import { FeedItem, PlatformId } from "@social-tv/shared";
import { tokenStore } from "../../routes/auth";
import { fetchTwitterFeed } from "./adapters/TwitterAdapter";
import { fetchInstagramFeed } from "./adapters/InstagramAdapter";
import { fetchYouTubeFeed } from "./adapters/YouTubeAdapter";
import { fetchLinkedInFeed } from "./adapters/LinkedInAdapter";
import { classifyFeed } from "../ai/VerticalClassifier";

const FETCHERS: Record<PlatformId, (token: string) => Promise<FeedItem[]>> = {
  twitter: fetchTwitterFeed,
  instagram: fetchInstagramFeed,
  youtube: fetchYouTubeFeed,
  linkedin: fetchLinkedInFeed,
};

export async function aggregateFeed(platforms: PlatformId[]): Promise<FeedItem[]> {
  const results: FeedItem[] = [];

  await Promise.allSettled(
    platforms.map(async (platform) => {
      const fetcher = FETCHERS[platform];
      if (!fetcher) return;

      // Get token from store (or use demo token)
      const stored = tokenStore.get(platform);
      const token = stored?.accessToken ?? "demo";

      try {
        const items = await fetcher(token);
        results.push(...items);
      } catch (e: any) {
        console.warn(`Feed fetch failed for ${platform}:`, e.message);
      }
    })
  );

  const sorted = results
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 20);

  return classifyFeed(sorted);
}
