import { env } from "../lib/env";
import { runSync } from "../services/sync/SyncEngine";

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

  // Sync all connected platform feeds every 5 minutes
  const syncInterval = 5 * 60 * 1000;
  const doSync = () => {
    console.log("🔁 Running platform sync...");
    // Connected accounts would come from the DB in production
    runSync([]).catch((err) => console.error("Sync error:", err));
  };
  doSync(); // run immediately on startup
  setInterval(doSync, syncInterval);
}
