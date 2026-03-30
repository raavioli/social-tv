import { FeedItem, PlatformId } from "@social-tv/shared";
import { TwitterAdapter } from "../feed/adapters/TwitterAdapter";
import { InstagramAdapter } from "../feed/adapters/InstagramAdapter";
import { YouTubeAdapter } from "../feed/adapters/YouTubeAdapter";
import { LinkedInAdapter } from "../feed/adapters/LinkedInAdapter";

interface SyncedItem extends FeedItem {
  platforms: PlatformId[];  // platforms where this story appeared
  firstSeen: string;
  lastUpdated: string;
}

interface SyncState {
  items: Map<string, SyncedItem>;
  lastSync: Date | null;
  listeners: Set<(items: SyncedItem[]) => void>;
}

// Deduplication: match stories with >60% title similarity
function titleSimilarity(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wb = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.max(wa.size, wb.size);
}

const state: SyncState = {
  items: new Map(),
  lastSync: null,
  listeners: new Set(),
};

export function onSyncUpdate(cb: (items: SyncedItem[]) => void) {
  state.listeners.add(cb);
  return () => state.listeners.delete(cb);
}

function notifyListeners() {
  const sorted = Array.from(state.items.values())
    .sort((a, b) => b.engagementScore - a.engagementScore);
  state.listeners.forEach(cb => cb(sorted));
}

async function syncPlatform(platformId: PlatformId, token?: string): Promise<FeedItem[]> {
  try {
    switch (platformId) {
      case "twitter":   return await TwitterAdapter.fetch(token);
      case "instagram": return await InstagramAdapter.fetch(token);
      case "youtube":   return await YouTubeAdapter.fetch(token);
      case "linkedin":  return await LinkedInAdapter.fetch(token);
      default:          return [];
    }
  } catch {
    return [];
  }
}

function mergeItem(newItem: FeedItem, platformId: PlatformId) {
  const now = new Date().toISOString();

  // Check for duplicates by title similarity
  for (const [key, existing] of state.items) {
    const title = newItem.title ?? newItem.summary;
    const existingTitle = existing.title ?? existing.summary;
    if (titleSimilarity(title, existingTitle) > 0.6) {
      // Merge — add platform, keep highest engagement score
      if (!existing.platforms.includes(platformId)) {
        existing.platforms.push(platformId);
      }
      existing.engagementScore = Math.max(existing.engagementScore, newItem.engagementScore);
      existing.lastUpdated = now;
      state.items.set(key, existing);
      return;
    }
  }

  // New item
  state.items.set(newItem.id, {
    ...newItem,
    platforms: [platformId],
    firstSeen: now,
    lastUpdated: now,
  });
}

export async function runSync(connectedAccounts: Array<{ platform: PlatformId; token?: string }>) {
  for (const account of connectedAccounts) {
    const items = await syncPlatform(account.platform, account.token);
    for (const item of items) {
      mergeItem(item, account.platform);
    }
  }

  // Evict items older than 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, item] of state.items) {
    if (new Date(item.publishedAt).getTime() < cutoff) {
      state.items.delete(key);
    }
  }

  state.lastSync = new Date();
  notifyListeners();
}

export function getCachedFeed(platformIds?: PlatformId[]): SyncedItem[] {
  const all = Array.from(state.items.values());
  const filtered = platformIds
    ? all.filter(item => item.platforms.some(p => platformIds.includes(p)))
    : all;
  return filtered.sort((a, b) => b.engagementScore - a.engagementScore);
}

export function getSyncStatus() {
  return {
    totalItems: state.items.size,
    lastSync: state.lastSync,
    platforms: Array.from(
      new Set(Array.from(state.items.values()).flatMap(i => i.platforms))
    ),
  };
}
