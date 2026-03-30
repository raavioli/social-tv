import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAppStore } from "../src/store/useAppStore";
import { PLATFORMS } from "../src/constants/platforms";
import { api } from "../src/lib/api";
import { Platform, ConnectedAccount } from "@social-tv/shared";

interface ConnectScreenProps {
  onDone?: () => void;
  showSkip?: boolean;
}

export default function ConnectScreen({ onDone, showSkip = false }: ConnectScreenProps) {
  const { connectedAccounts, addAccount, removeAccount } = useAppStore();
  const [connecting, setConnecting] = useState<string | null>(null);

  const isConnected = (platformId: string) =>
    connectedAccounts.some((a) => a.platform === platformId);

  const getAccount = (platformId: string) =>
    connectedAccounts.find((a) => a.platform === platformId);

  const handleConnect = async (platform: Platform) => {
    setConnecting(platform.id);
    try {
      const { authUrl } = await api.getOAuthUrl(platform.id);
      // Open the OAuth URL in the browser
      // In production, use expo-web-browser for in-app OAuth
      await Linking.openURL(authUrl);
      // For demo: simulate a successful connection
      await simulateConnection(platform, addAccount);
    } catch (e) {
      console.warn("OAuth failed:", e);
      // Demo fallback
      await simulateConnection(platform, addAccount);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    const account = getAccount(platformId);
    if (account) removeAccount(account.id);
  };

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.heading}>Connect Accounts 📡</Text>
          <Text style={styles.sub}>
            Each account becomes a TV channel.{"\n"}
            Swipe between them like changing channels.
          </Text>

          <View style={styles.list}>
            {PLATFORMS.map((platform, i) => {
              const connected = isConnected(platform.id);
              const account = getAccount(platform.id);
              const isLoading = connecting === platform.id;
              const channelNum = connectedAccounts.findIndex(
                (a) => a.platform === platform.id
              ) + 1;

              return (
                <BlurView key={platform.id} intensity={15} tint="dark" style={styles.row}>
                  {/* Channel number */}
                  <View style={styles.chNumWrap}>
                    <Text style={styles.chNum}>
                      {connected ? `CH ${channelNum}` : `—`}
                    </Text>
                  </View>

                  {/* Platform icon + gradient */}
                  <LinearGradient
                    colors={[platform.color, platform.colorEnd]}
                    style={styles.platformIcon}
                  >
                    <Text style={styles.platformEmoji}>{platform.emoji}</Text>
                  </LinearGradient>

                  {/* Info */}
                  <View style={styles.info}>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    {connected && account ? (
                      <Text style={styles.username}>@{account.username}</Text>
                    ) : (
                      <Text style={styles.platformDesc}>{platform.description}</Text>
                    )}
                  </View>

                  {/* Action */}
                  {isLoading ? (
                    <ActivityIndicator color="#6c47ff" />
                  ) : connected ? (
                    <TouchableOpacity
                      onPress={() => handleDisconnect(platform.id)}
                      style={styles.disconnectBtn}
                    >
                      <Text style={styles.disconnectText}>Disconnect</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleConnect(platform)}
                      style={styles.connectBtn}
                    >
                      <LinearGradient
                        colors={[platform.color, platform.colorEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.connectBtnGrad}
                      >
                        <Text style={styles.connectBtnText}>Connect</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </BlurView>
              );
            })}
          </View>

          {connectedAccounts.length > 0 && onDone && (
            <TouchableOpacity onPress={onDone} style={styles.doneBtn}>
              <LinearGradient
                colors={["#6c47ff", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneBtnGrad}
              >
                <Text style={styles.doneBtnText}>
                  Start watching ({connectedAccounts.length} channel
                  {connectedAccounts.length !== 1 ? "s" : ""}) →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {showSkip && connectedAccounts.length === 0 && onDone && (
            <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now (demo mode)</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Demo: simulate OAuth connection for testing without real credentials
async function simulateConnection(
  platform: Platform,
  addAccount: (a: ConnectedAccount) => void
) {
  await new Promise((r) => setTimeout(r, 1500));
  const mockUsernames: Record<string, string> = {
    twitter: "you",
    instagram: "yourhandle",
    youtube: "YourChannel",
    linkedin: "Your Name",
  };
  addAccount({
    id: `${platform.id}-${Date.now()}`,
    platform: platform.id as any,
    username: mockUsernames[platform.id] ?? "user",
    displayName: mockUsernames[platform.id] ?? "User",
    channelNumber: 1,
    isActive: true,
    connectedAt: new Date().toISOString(),
  });
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, padding: 24, gap: 16, paddingBottom: 40 },
  heading: { color: "#fff", fontSize: 28, fontWeight: "900" },
  sub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chNumWrap: { width: 36 },
  chNum: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  platformIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  platformEmoji: { fontSize: 22 },
  info: { flex: 1 },
  platformName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  username: { color: "#a78bfa", fontSize: 12, marginTop: 2 },
  platformDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  connectBtn: { borderRadius: 10, overflow: "hidden" },
  connectBtnGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  connectBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  disconnectBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  disconnectText: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  doneBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  doneBtnGrad: { paddingVertical: 16, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  skipBtn: { alignItems: "center", paddingVertical: 12 },
  skipText: { color: "rgba(255,255,255,0.25)", fontSize: 13 },
});
