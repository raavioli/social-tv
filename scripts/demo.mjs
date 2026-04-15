#!/usr/bin/env node
// SocialTV demo + smoke-test script.
// Usage: node scripts/demo.mjs [url]
//   url defaults to http://localhost:19006
//
// Does:
//   1. Launches headless Chromium (Playwright)
//   2. Navigates to the Expo web app
//   3. Waits for render, dumps console messages + failed network requests
//   4. Screenshots to scripts/screenshots/<ts>.png
//   5. Queries DOM for the latest UI markers (🎛️ 📺 🎭 icon-row) and reports pass/fail
//
// Exit code: 0 if all markers present, 1 otherwise.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = process.argv[2] ?? "http://localhost:19006";
const SHOT_DIR = resolve(__dirname, "screenshots");

const MARKERS = [
  { name: "time budget prompt",     selector: "text=HOW MUCH TIME DO YOU HAVE?" },
  { name: "Top 10 tile",            selector: "text=Top 10" },
  { name: "Breaking tile",          selector: "text=Breaking" },
  { name: "bottom dock: Programming", selector: "text=Programming" },
  { name: "bottom dock: Sources",     selector: "text=Sources" },
  { name: "bottom dock: Filters",     selector: "text=Filters" },
];

await mkdir(SHOT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
// Phone viewport so the screenshot previews what friends will see on their phones.
// Override via PHONE=0 env to use desktop 1280x900.
const phoneMode = process.env.PHONE !== "0";
const ctx = await browser.newContext(
  phoneMode
    ? {
        viewport: { width: 390, height: 844 }, // iPhone 14 Pro
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      }
    : { viewport: { width: 1280, height: 900 } }
);
console.log(`→ Viewport: ${phoneMode ? "phone 390×844" : "desktop 1280×900"}`);
const page = await ctx.newPage();

const consoleMsgs = [];
const failures = [];
page.on("console", m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on("requestfailed", r => failures.push(`${r.url()} — ${r.failure()?.errorText}`));
page.on("pageerror", e => failures.push(`PAGE ERROR: ${e.message}`));

console.log(`→ Navigating to ${URL}`);
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120_000 }).catch(() => {});
// Wait for app root to appear, then an extra beat for HMR / font loading.
await page.waitForSelector("#root > *", { timeout: 120_000 }).catch(() => {});
await page.waitForTimeout(3000);

// Walk past onboarding. Prefer buttons at the bottom; match exact short labels to avoid
// hitting headings that contain the word.
const CTA_PATTERNS = [
  "Let's go", "Next", "Start programming", "Continue", "Done",
  "Finish", "Skip", "Get started", "Enter",
];
for (let i = 0; i < 10; i++) {
  let clicked = false;
  for (const label of CTA_PATTERNS) {
    const btn = page.getByText(label, { exact: true }).last();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`   onboarding click: ${label}`);
      await btn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(900);
      clicked = true;
      break;
    }
  }
  if (!clicked) break;
}

const ts = new Date().toISOString().replace(/[:.]/g, "-");
const shotPath = resolve(SHOT_DIR, `${ts}.png`);
// Font-loading can hang behind a slow Metro asset request. Cap it, fall back to viewport-only.
try {
  await page.screenshot({ path: shotPath, fullPage: true, timeout: 15_000, animations: "disabled" });
  console.log(`📸 ${shotPath}`);
} catch {
  try {
    await page.screenshot({ path: shotPath, fullPage: false, timeout: 15_000, animations: "disabled" });
    console.log(`📸 ${shotPath} (viewport-only — fullPage timed out)`);
  } catch (e) {
    console.log(`⚠️  screenshot failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log(`\n── Markers ──`);
let passed = 0;
for (const m of MARKERS) {
  const found = await page.locator(m.selector).first().isVisible().catch(() => false);
  console.log(`  ${found ? "✅" : "❌"} ${m.name}`);
  if (found) passed++;
}

if (consoleMsgs.length) {
  console.log(`\n── Console ──`);
  consoleMsgs.slice(-20).forEach(m => console.log("  " + m));
}
if (failures.length) {
  console.log(`\n── Failures ──`);
  failures.slice(-10).forEach(f => console.log("  " + f));
}

await browser.close();
const ok = passed === MARKERS.length;
console.log(`\n${ok ? "✅ PASS" : "❌ FAIL"} — ${passed}/${MARKERS.length} markers`);
process.exit(ok ? 0 : 1);
