import { env } from "../lib/env";

export function startJobs() {
  // Schedule morning show generation at configured time
  // Uses simple setInterval for demo; replace with BullMQ + Redis in production
  console.log("📅 Job scheduler started (demo mode — using setInterval)");

  // Poll and cache feeds every 30 minutes
  setInterval(
    () => {
      console.log("🔄 Refreshing feed cache...");
      // In production: enqueue BullMQ job
    },
    30 * 60 * 1000
  );
}
