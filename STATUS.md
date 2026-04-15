# SocialTV — Status & Resume Plan

Last updated: 2026-04-15 (post WSL crash recovery)

## Quick resume

```bash
# 1. In WSL (Ubuntu 22.04)
cd /mnt/e/Dev/ai-tv-news

# 2. Backend (k3s infra — already running, survives WSL restart)
kubectl get all -n socialtv
# expected: socialtv-api, socialtv-postgres, socialtv-redis all Running 1/1

# 3. Port-forwards (systemd service, auto-starts)
systemctl status socialtv-portforward.service

# 4. Start Expo (not in systemd — manual)
cd apps/mobile && NODE_OPTIONS='--dns-result-order=ipv4first' npx expo start --web --port 19006

# 5. From Windows browser
#    http://127.0.0.1:19006             — app
#    http://socialtv.localhost:8080     — API (via Traefik)
#    http://127.0.0.1:3011/health       — API (direct)

# 6. Verify + screenshot
node scripts/demo.mjs
# walks onboarding → screenshots to scripts/screenshots/ → exits 0 on PASS
```

## What's live

### Infra (k3s namespace `socialtv`)
- **redis** (ClusterIP 6379) — `redis:7-alpine`
- **postgres** (ClusterIP 5432) — `pgvector/pgvector:pg16`, 5Gi PVC
- **api** — `localhost/socialtv-api:dev`, ConfigMap + Secret, Traefik Ingress `socialtv.localhost`
- **port-forward** — `socialtv-portforward.service` (systemd) bridges 3011→API, 8080→Traefik
- **hosts entry** — `127.0.0.1 socialtv.localhost` in `C:\WINDOWS\System32\drivers\etc\hosts`

### Mobile (Expo web :19006)
- Web bundle verified end-to-end via Playwright in [scripts/demo.mjs](scripts/demo.mjs)
- Home screen ([apps/mobile/app/(tabs)/index.tsx](apps/mobile/app/(tabs)/index.tsx)):
  - Three header icons on QUICK PROGRAMMES: 🎛️ → `/programming-board`, 📺 → `/channels`, 🎭 → mood cycle
  - Time-budget chip row (1/5/15/30 min / Full) replaces mood bar
  - YOUR CHANNELS list **removed from home** — moved to [apps/mobile/app/channels.tsx](apps/mobile/app/channels.tsx)
- Shared [packages/shared/src/timeSlots.ts](packages/shared/src/timeSlots.ts) — canonical TIME_SLOTS + `getActiveSlot()`

## Open tasks (prioritized)

1. **[blocker] API TS errors** (~40) — missing `.js` ESM extensions, missing `@social-tv/shared` exports (`MoodId`, `VerticalId`, `CONTENT_VERTICALS`, etc.), implicit `any`s. Currently bypassed by running `tsx watch` in container (dev mode). Need fix to restore multi-stage prod Dockerfile.
2. **Skip-onboarding on repeat visits** — user wants "how much time do you have?" as the entry UX (instead of persona pick) for already-onboarded users. Time-budget chips exist; need to: (a) gate full onboarding on first launch only (Zustand `hasOnboarded`), (b) show only time-budget prompt on subsequent launches.
3. **Wire time budget → content** — selection currently visual only. Plumb `timeBudget` + active slot `mix`/`pace` into `/feed` API request.
4. **Presenter TTS** (ElevenLabs) — read presenter line on channel entry.
5. **TV Guide as drawer** (not tab).
6. **Real API keys** — `socialtv-api-keys` Secret is empty; populate + rollout restart.
7. **Physical device support** — Expo on LAN IP instead of `socialtv.localhost` (which only resolves on the dev machine).

## Deferred

- HuggingFace model for mood/interest profiling
- Real OAuth flows (currently demo-simulation)
- Tune-Slots editor UI (edit time-slot labels/hours/mix/pace, persist to AsyncStorage)
- Knative Serving install (CLI present, controller not deployed — plain Deployments work fine for now)

## How to pick up with an agent

Point any agent at this file + [memory/project_socialtv.md](../../../Users/ravih/.claude/projects/e--Dev/memory/project_socialtv.md) (same info, broader context including the MSYS fake-mount pitfall).

For status checks, run:
```bash
cd /mnt/e/Dev/ai-tv-news && node scripts/demo.mjs
kubectl get pods -n socialtv
systemctl is-active socialtv-portforward.service
git -C /mnt/e/Dev/ai-tv-news log --oneline -10
```

## Known pitfalls

- **Don't use the Claude Bash tool (MSYS) for `/mnt/e/...` paths** — MSYS rewrites `/mnt/e` to `C:\Program Files\Git\mnt\e\` (fake mount). Always route WSL work via `wsl.exe -d Ubuntu-22.04 -- bash -lc "..."` or use Windows-style `E:\Dev\...` paths for Write/Edit.
- **Metro's file watcher over 9p is flaky** — after Windows-side edits, sometimes restart Metro (`pkill -f 'expo start'` then `npx expo start --clear`).
- **Don't use plain `localhost` from Windows** — it resolves to IPv6 (`::1`) first but port-forwards bind IPv4. Use `127.0.0.1` or a hosts entry.
- **Expo web stuck on onboarding?** You haven't completed it. Click "Let's go" → "Next" → "Start programming" to reach home. `scripts/demo.mjs` auto-walks these.
