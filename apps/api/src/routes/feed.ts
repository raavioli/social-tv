import { FastifyPluginAsync } from "fastify";
import { aggregateFeed } from "../services/feed/FeedAggregator";
import { ApiResponse, FeedItem, PlatformId } from "@social-tv/shared";

export const feedRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { platforms: string } }>("/", async (req, reply) => {
    const platforms = (req.query.platforms ?? "twitter")
      .split(",")
      .filter(Boolean) as PlatformId[];

    try {
      const items = await aggregateFeed(platforms);
      return { data: items } as ApiResponse<FeedItem[]>;
    } catch (err: any) {
      reply.status(500);
      return { data: [], error: err.message };
    }
  });
};
