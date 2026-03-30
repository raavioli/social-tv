import { Platform } from "@social-tv/shared";

export const PLATFORMS: Platform[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    emoji: "𝕏",
    color: "#000000",
    colorEnd: "#1a1a1a",
    description: "Your timeline, mentions & likes",
    oauthScope: ["tweet.read", "users.read", "offline.access"],
  },
  {
    id: "instagram",
    name: "Instagram",
    emoji: "📷",
    color: "#833ab4",
    colorEnd: "#fd1d1d",
    description: "Feed, reels & stories",
    oauthScope: ["user_profile", "user_media"],
  },
  {
    id: "youtube",
    name: "YouTube",
    emoji: "▶️",
    color: "#ff0000",
    colorEnd: "#cc0000",
    description: "Subscriptions & watch history",
    oauthScope: ["https://www.googleapis.com/auth/youtube.readonly"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    emoji: "💼",
    color: "#0077b5",
    colorEnd: "#005582",
    description: "Professional feed & notifications",
    oauthScope: ["r_liteprofile", "r_emailaddress", "r_feed"],
  },
];

export const getPlatform = (id: string) =>
  PLATFORMS.find((p) => p.id === id);
