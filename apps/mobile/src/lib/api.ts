import { DailyShow, GenerateShowRequest, ApiResponse, FeedItem, OAuthStartResponse } from "@social-tv/shared";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const api = {
  getFeed: (platformIds: string[]) =>
    request<FeedItem[]>(`/feed?platforms=${platformIds.join(",")}`),

  generateShow: (body: GenerateShowRequest) =>
    request<DailyShow>("/shows/generate", { method: "POST", body: JSON.stringify(body) }),

  getTodayShow: (personaId: string, channelId: string) =>
    request<DailyShow | null>(`/shows/today?personaId=${personaId}&channelId=${channelId}`),

  getOAuthUrl: (platform: string) =>
    request<OAuthStartResponse>(`/auth/${platform}`),

  disconnectPlatform: (platform: string) =>
    request<void>(`/auth/${platform}`, { method: "DELETE" }),

  getBulletin: (body: import("@social-tv/shared").GenerateBulletinRequest) =>
    request<import("@social-tv/shared").GeneratedBulletin>("/bulletin/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getTop10: (platforms?: string[], mood?: string) => {
    const params = new URLSearchParams();
    if (platforms?.length) params.set("platforms", platforms.join(","));
    if (mood) params.set("mood", mood);
    return request<any>(`/content/top10?${params}`);
  },

  getFriendsFeed: (platforms?: string[], handles?: string[]) => {
    const params = new URLSearchParams();
    if (platforms?.length) params.set("platforms", platforms.join(","));
    if (handles?.length) params.set("handles", handles.join(","));
    return request<any>(`/content/friends?${params}`);
  },

  getMoodFeed: (mood: string, platforms?: string[], limit?: number) => {
    const params = new URLSearchParams({ mood });
    if (platforms?.length) params.set("platforms", platforms.join(","));
    if (limit) params.set("limit", String(limit));
    return request<any>(`/content/mood?${params}`);
  },

  getVisualFeed: (platforms?: string[], limit?: number) => {
    const params = new URLSearchParams();
    if (platforms?.length) params.set("platforms", platforms.join(","));
    if (limit) params.set("limit", String(limit));
    return request<any>(`/visuals/feed?${params}`);
  },
};
