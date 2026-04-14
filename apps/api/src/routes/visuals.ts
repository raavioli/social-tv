import { FastifyPluginAsync } from "fastify";
import { generateFeedVisuals } from "../services/VisualGenerator";
import { aggregateFeed } from "../services/feed/FeedAggregator";

export const visualRoutes: FastifyPluginAsync = async (app) => {
  // GET /visuals/feed — returns feed items with auto-generated visual metadata
  app.get("/feed", async (req) => {
    const { platforms, limit } = req.query as { platforms?: string; limit?: string };
    const platformList = platforms ? platforms.split(",") : ["twitter", "instagram", "youtube", "linkedin"];
    const items = await aggregateFeed(platformList);
    const withVisuals = generateFeedVisuals(items.slice(0, parseInt(limit ?? "20")));
    return { data: withVisuals };
  });
};
