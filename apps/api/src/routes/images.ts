import { FastifyPluginAsync } from "fastify";
import { generateAiImage, buildImagePrompt } from "../services/ai/ImageGenerator";
import { ApiResponse } from "@ai-tv-news/shared";

export const imageRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { prompt: string; title?: string; tags?: string[] } }>(
    "/generate",
    async (req, reply) => {
      const { prompt, title, tags = [] } = req.body;
      const finalPrompt = title ? buildImagePrompt(title, tags) : prompt;

      const url = await generateAiImage(finalPrompt);
      if (!url) {
        // Return a placeholder for demo
        const seed = Buffer.from(finalPrompt).toString("base64").slice(0, 8);
        return { data: { url: `https://picsum.photos/seed/${seed}/800/500` } } as ApiResponse<{ url: string }>;
      }

      return { data: { url } } as ApiResponse<{ url: string }>;
    }
  );
};
