import { FastifyPluginAsync } from "fastify";
import { onSyncUpdate, getSyncStatus } from "../services/sync/SyncEngine";

export const syncRoutes: FastifyPluginAsync = async (app) => {
  app.get("/status", async () => getSyncStatus());

  // SSE endpoint for real-time feed updates
  app.get("/stream", async (req, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const send = (data: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    send({ type: "connected", ts: new Date().toISOString() });

    const unsub = onSyncUpdate((items) => {
      send({ type: "update", items });
    });

    req.raw.on("close", unsub);
  });
};
