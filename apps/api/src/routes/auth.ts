import { FastifyPluginAsync } from "fastify";
import { ApiResponse, OAuthStartResponse, ConnectedAccount } from "@social-tv/shared";
import { env } from "../lib/env";

// Platform OAuth configs
const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectPath: string;
  scope: string;
}> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
    redirectPath: "/auth/twitter/callback",
    scope: "tweet.read users.read offline.access",
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    redirectPath: "/auth/instagram/callback",
    scope: "user_profile,user_media",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    redirectPath: "/auth/youtube/callback",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    redirectPath: "/auth/linkedin/callback",
    scope: "r_liteprofile r_emailaddress",
  },
};

// In-memory token store (replace with encrypted DB in production)
export const tokenStore = new Map<string, {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  account: ConnectedAccount;
}>();

export const authRoutes: FastifyPluginAsync = async (app) => {
  // GET /auth/:platform — return OAuth URL for the platform
  app.get<{ Params: { platform: string } }>(
    "/:platform",
    async (req, reply) => {
      const { platform } = req.params;
      const config = OAUTH_CONFIGS[platform];

      if (!config) {
        reply.status(400);
        return { data: null, error: `Unknown platform: ${platform}` };
      }

      const clientId = process.env[config.clientIdEnv];
      const redirectUri = `${process.env.API_BASE_URL ?? "http://localhost:3001"}${config.redirectPath}`;
      const state = Buffer.from(JSON.stringify({ platform, ts: Date.now() })).toString("base64url");

      // If no client ID configured, return demo URL
      if (!clientId) {
        const response: ApiResponse<OAuthStartResponse> = {
          data: {
            authUrl: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/${platform}/demo`,
            state,
          },
        };
        return response;
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: config.scope,
        state,
      });

      const response: ApiResponse<OAuthStartResponse> = {
        data: { authUrl: `${config.authUrl}?${params}`, state },
      };
      return response;
    }
  );

  // GET /auth/:platform/demo — simulate OAuth for demo without credentials
  app.get<{ Params: { platform: string } }>(
    "/:platform/demo",
    async (req, reply) => {
      const { platform } = req.params;
      const mockAccounts: Record<string, Partial<ConnectedAccount>> = {
        twitter: { username: "you", displayName: "You" },
        instagram: { username: "yourhandle", displayName: "Your Handle" },
        youtube: { username: "YourChannel", displayName: "Your Channel" },
        linkedin: { username: "yourname", displayName: "Your Name" },
      };

      const mock = mockAccounts[platform] ?? { username: "user", displayName: "User" };
      const account: ConnectedAccount = {
        id: `${platform}-demo-${Date.now()}`,
        platform: platform as any,
        username: mock.username!,
        displayName: mock.displayName!,
        channelNumber: tokenStore.size + 1,
        isActive: true,
        connectedAt: new Date().toISOString(),
      };

      tokenStore.set(platform, {
        accessToken: "demo-token",
        account,
      });

      return { data: { account, success: true } } as ApiResponse<any>;
    }
  );

  // DELETE /auth/:platform — disconnect
  app.delete<{ Params: { platform: string } }>(
    "/:platform",
    async (req) => {
      const { platform } = req.params;
      tokenStore.delete(platform);
      return { data: { success: true } } as ApiResponse<any>;
    }
  );
};
