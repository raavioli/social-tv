import { FastifyPluginAsync } from "fastify";
import { aggregateFeed } from "../services/feed/FeedAggregator";
import { generateScript } from "../services/ai/ScriptGenerator";
import { ApiResponse, DailyShow, GenerateShowRequest } from "@ai-tv-news/shared";
import { z } from "zod";

// In-memory cache for demo (replace with DB in production)
const showCache = new Map<string, DailyShow>();

export const showRoutes: FastifyPluginAsync = async (app) => {
  // GET today's show (returns cached if already generated)
  app.get<{ Querystring: { personaId: string; channels: string } }>(
    "/today",
    async (req, reply) => {
      const { personaId = "host_maya", channels = "tech,world" } = req.query;
      const channelIds = channels.split(",").filter(Boolean);
      const date = new Date().toISOString().split("T")[0];
      const cacheKey = `${date}-${personaId}-${channelIds.sort().join(",")}`;

      const cached = showCache.get(cacheKey);
      if (cached) {
        return { data: cached } as ApiResponse<DailyShow>;
      }

      return { data: null } as ApiResponse<DailyShow | null>;
    }
  );

  // POST generate a show
  app.post<{ Body: GenerateShowRequest }>("/generate", async (req, reply) => {
    const { channelIds, personaId, date } = req.body;
    const cacheKey = `${date}-${personaId}-${channelIds.sort().join(",")}`;

    // Return cached if exists
    const cached = showCache.get(cacheKey);
    if (cached?.status === "ready") {
      return { data: cached } as ApiResponse<DailyShow>;
    }

    try {
      // Aggregate feed
      const items = await aggregateFeed(channelIds);

      // Generate script
      const segments = await generateScript(items, personaId as any, date);

      const show: DailyShow = {
        id: cacheKey,
        date,
        title: `Your ${new Date(date).toLocaleDateString("en-US", { weekday: "long" })} Briefing`,
        persona: personaId as any,
        segments,
        status: "ready",
        generatedAt: new Date().toISOString(),
      };

      showCache.set(cacheKey, show);
      return { data: show } as ApiResponse<DailyShow>;
    } catch (err: any) {
      reply.status(500);
      return { data: null as any, error: err.message };
    }
  });
};
