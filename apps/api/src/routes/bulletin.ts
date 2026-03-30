import { FastifyPluginAsync } from "fastify";
import { aggregateFeed } from "../services/feed/FeedAggregator";
import { scoreBulletin } from "../services/ai/BulletinScorer";
import {
  ApiResponse,
  GenerateBulletinRequest,
  GeneratedBulletin,
  PlatformId,
} from "@social-tv/shared";

// In-memory cache keyed by mood+format+channels+date
const cache = new Map<string, GeneratedBulletin>();

export const bulletinRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: GenerateBulletinRequest }>(
    "/generate",
    async (req, reply) => {
      const { mood, availableMinutes, formatId, channelIds, interestProfile } = req.body;
      const date = new Date().toISOString().split("T")[0];
      const cacheKey = `${date}-${mood}-${formatId}-${channelIds.sort().join(",")}`;

      const cached = cache.get(cacheKey);
      if (cached) return { data: cached } as ApiResponse<GeneratedBulletin>;

      try {
        // 1. Aggregate raw feed across all connected platforms
        const platforms = channelIds as PlatformId[];
        const feedItems = await aggregateFeed(
          platforms.length ? platforms : ["twitter", "instagram", "youtube", "linkedin"]
        );

        // 2. AI scoring: rank by mood fit + interest profile
        const bulletin = await scoreBulletin({
          feedItems,
          mood,
          availableMinutes,
          formatId,
          interestProfile,
          date,
        });

        cache.set(cacheKey, bulletin);
        // Expire cache after 30 minutes
        setTimeout(() => cache.delete(cacheKey), 30 * 60 * 1000);

        return { data: bulletin } as ApiResponse<GeneratedBulletin>;
      } catch (err: any) {
        reply.status(500);
        return { data: null as any, error: err.message };
      }
    }
  );
};
