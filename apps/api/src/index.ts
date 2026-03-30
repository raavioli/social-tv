import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { feedRoutes } from "./routes/feed";
import { showRoutes } from "./routes/show";
import { imageRoutes } from "./routes/images";
import { authRoutes } from "./routes/auth";
import { bulletinRoutes } from "./routes/bulletin";
import { startJobs } from "./jobs";

const app = Fastify({ logger: { level: process.env.NODE_ENV === "production" ? "warn" : "info" } });

await app.register(helmet);
await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString(), name: "SocialTV API" }));

await app.register(feedRoutes, { prefix: "/feed" });
await app.register(showRoutes, { prefix: "/shows" });
await app.register(imageRoutes, { prefix: "/images" });
await app.register(authRoutes, { prefix: "/auth" });
await app.register(bulletinRoutes, { prefix: "/bulletin" });

startJobs();

const PORT = Number(process.env.PORT ?? 3001);
await app.listen({ port: PORT, host: "0.0.0.0" });
console.log(`📺 SocialTV API running on port ${PORT}`);
