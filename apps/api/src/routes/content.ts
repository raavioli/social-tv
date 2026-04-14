import { FastifyPluginAsync } from "fastify";
import { processContentFeed, FeedMode } from "../services/ContentProcessor";

export const contentRoutes: FastifyPluginAsync = async (app) => {
  // GET /content/top10 — quick top 10 across all platforms
  app.get("/top10", async (req) => {
    const { platforms, mood } = req.query as { platforms?: string; mood?: string };
    const platformList = platforms ? platforms.split(",") : [];
    const feed = await processContentFeed(platformList, "top10", { moodId: mood, limit: 10 });
    return { data: feed };
  });

  // GET /content/friends — close friends updates
  app.get("/friends", async (req) => {
    const { platforms, handles } = req.query as { platforms?: string; handles?: string };
    const platformList = platforms ? platforms.split(",") : [];
    const friendHandles = handles ? handles.split(",") : ["@you", "you"];
    const feed = await processContentFeed(platformList, "close_friends", { closeFriends: friendHandles });
    return { data: feed };
  });

  // GET /content/mood — mood-based feed
  app.get("/mood", async (req) => {
    const { platforms, mood, limit } = req.query as { platforms?: string; mood?: string; limit?: string };
    const platformList = platforms ? platforms.split(",") : [];
    const feed = await processContentFeed(platformList, "mood_feed", {
      moodId: mood ?? "curious",
      limit: limit ? parseInt(limit) : 20,
    });
    return { data: feed };
  });

  // GET /content/full — everything ranked
  app.get("/full", async (req) => {
    const { platforms, limit } = req.query as { platforms?: string; limit?: string };
    const platformList = platforms ? platforms.split(",") : [];
    const feed = await processContentFeed(platformList, "full_feed", {
      limit: limit ? parseInt(limit) : 50,
    });
    return { data: feed };
  });
};
