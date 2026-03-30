import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { PLATFORMS } from "../../src/constants/platforms";

export default function ChannelsScreen() {
  const { connectedAccounts, activeChannelIndex, setActiveChannelIndex } = useAppStore();

  return (
    <LinearGradient colors={["#0a0a0f", "#0f0a1e"]} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>My Channels 📡</Text>
          <Text style={styles.sub}>
            {connectedAccounts.length > 0
              ? `${connectedAccounts.length} channel${connectedAccounts.length !== 1 ? "s" : ""} connected`
              : "No channels yet"}
          </Text>

          {connectedAccounts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📺</Text>
              <Text style={styles.emptyText}>
                Connect your social accounts to create channels.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/connect")}
                style={styles.addBtn}
              >
                <LinearGradient
                  colors={["#6c47ff", "#a855f7"]}
                  style={styles.addBtnGrad}
                >
                  <Text style={styles.addBtnText}>+ Add Channels</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>YOUR CHANNELS</Text>
              {connectedAccounts.map((account, i) => {
                const platform = PLATFORMS.find((p) => p.id === account.platform);
                if (!platform) return null;
                const isActive = i === activeChannelIndex;

                return (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setActiveChannelIndex(i)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isActive
                          ? [platform.color + "33", platform.colorEnd + "22"]
                          : ["#1a1a2e", "#16213e"]
                      }
                      style={[styles.channelRow, isActive && styles.channelRowActive]}
                    >
                      {/* Channel number */}
                      <View style={styles.chNumBox}>
                        <LinearGradient
                          colors={[platform.color, platform.colorEnd]}
                          style={styles.chNumGrad}
                        >
                          <Text style={styles.chNumText}>CH</Text>
                          <Text style={styles.chNumBig}>{i + 1}</Text>
                        </LinearGradient>
                      </View>

                      {/* Platform icon */}
                      <View style={styles.platformIconWrap}>
                        <Text style={styles.platformEmoji}>{platform.emoji}</Text>
                      </View>

                      {/* Info */}
                      <View style={styles.channelInfo}>
                        <Text style={styles.channelName}>{platform.name}</Text>
                        <Text style={styles.channelHandle}>@{account.username}</Text>
                      </View>

                      {/* Active indicator */}
                      {isActive && (
                        <View style={[styles.nowWatching, { backgroundColor: platform.color }]}>
                          <View style={styles.liveDot} />
                          <Text style={styles.nowText}>WATCHING</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => router.push("/connect")}
                style={styles.addMoreBtn}
              >
                <Text style={styles.addMoreText}>+ Connect more accounts</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24 },
  heading: { color: "#fff", fontSize: 30, fontWeight: "900", marginBottom: 4 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 },
  sectionLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 },
  channelRow: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  channelRowActive: { borderColor: "rgba(108,71,255,0.4)" },
  chNumBox: { borderRadius: 10, overflow: "hidden" },
  chNumGrad: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  chNumText: { color: "rgba(255,255,255,0.7)", fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  chNumBig: { color: "#fff", fontSize: 18, fontWeight: "900", lineHeight: 20 },
  platformIconWrap: { width: 32, alignItems: "center" },
  platformEmoji: { fontSize: 24 },
  channelInfo: { flex: 1 },
  channelName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  channelHandle: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  nowWatching: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  nowText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 16 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  addBtn: { borderRadius: 14, overflow: "hidden", alignSelf: "stretch" },
  addBtnGrad: { paddingVertical: 14, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  addMoreBtn: { alignItems: "center", marginTop: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(108,71,255,0.3)" },
  addMoreText: { color: "#a78bfa", fontSize: 14, fontWeight: "700" },
});
