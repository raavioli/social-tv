/**
 * SocialTV — Programming Clock
 *
 * Mirrors how real TV channels structure their broadcast day.
 * Each time slot has a recommended format and tone, exactly
 * like BBC, CNN, ESPN or E! would programme their schedule.
 */

import { TVFormatId } from "./tvFormats";
import { VerticalId } from "./contentVerticals";

export type TimeSlotId =
  | "overnight"     // 00:00 – 05:59
  | "early_morning" // 06:00 – 08:59  (Breakfast TV)
  | "mid_morning"   // 09:00 – 11:59  (Morning magazine)
  | "lunchtime"     // 12:00 – 13:59  (Lunch bulletin)
  | "afternoon"     // 14:00 – 16:59  (Afternoon magazine)
  | "early_evening" // 17:00 – 18:59  (Drive time / early news)
  | "prime_time"    // 19:00 – 21:59  (Prime time)
  | "late_night"    // 22:00 – 23:59  (Late night)

export interface ProgrammingSlot {
  id: TimeSlotId;
  label: string;
  hours: [number, number];    // [startHour, endHour] inclusive
  emoji: string;
  tvAnalogy: string;          // "Like BBC Breakfast"
  defaultFormat: TVFormatId;
  moodOverrides: Partial<Record<string, TVFormatId>>; // mood → format override
  defaultVerticals: VerticalId[];
  tone: string;               // "energetic and informative"
  durationMinutes: number;    // typical duration of content in this slot
}

export const PROGRAMMING_CLOCK: ProgrammingSlot[] = [
  {
    id: "overnight",
    label: "Overnight",
    hours: [0, 5],
    emoji: "🌙",
    tvAnalogy: "Like rolling overnight news (BBC World Service)",
    defaultFormat: "breaking_ticker",
    moodOverrides: {},
    defaultVerticals: ["breaking", "tech", "business"],
    tone: "Minimal. Headlines only. Don't interrupt sleep.",
    durationMinutes: 2,
  },
  {
    id: "early_morning",
    label: "Breakfast",
    hours: [6, 8],
    emoji: "☀️",
    tvAnalogy: "Like BBC Breakfast / Good Morning America",
    defaultFormat: "morning_show",
    moodOverrides: {
      stressed:  "flash_briefing",
      energised: "flash_briefing",
      focused:   "flash_briefing",
      chill:     "morning_show",
      curious:   "morning_show",
    },
    defaultVerticals: ["breaking", "tech", "business", "personal"],
    tone: "Upbeat, positive, light on heavy news. Your day starts here.",
    durationMinutes: 15,
  },
  {
    id: "mid_morning",
    label: "Mid Morning",
    hours: [9, 11],
    emoji: "🌤",
    tvAnalogy: "Like This Morning / The Today Show (2nd hour)",
    defaultFormat: "talk_show",
    moodOverrides: {
      focused:   "explainer",
      curious:   "documentary",
      stressed:  "flash_briefing",
      chill:     "reality_check",
      energised: "countdown",
    },
    defaultVerticals: ["tech", "business", "lifestyle", "culture"],
    tone: "Magazine-style. Mix of topics. Digestible.",
    durationMinutes: 20,
  },
  {
    id: "lunchtime",
    label: "Lunchtime",
    hours: [12, 13],
    emoji: "🍽",
    tvAnalogy: "Like the BBC 1 O'Clock News / CNN midday",
    defaultFormat: "flash_briefing",
    moodOverrides: {
      focused:   "flash_briefing",
      stressed:  "speed_round",
      chill:     "highlight_reel",
      curious:   "explainer",
      energised: "hundred_in_hundred",
    },
    defaultVerticals: ["breaking", "business", "sports", "tech"],
    tone: "Quick. You have 5 minutes. Headlines and highlights only.",
    durationMinutes: 5,
  },
  {
    id: "afternoon",
    label: "Afternoon",
    hours: [14, 16],
    emoji: "🌅",
    tvAnalogy: "Like afternoon chat shows / TalkTV",
    defaultFormat: "talk_show",
    moodOverrides: {
      focused:   "documentary",
      curious:   "explainer",
      stressed:  "reality_check",
      chill:     "late_night",
      energised: "countdown",
    },
    defaultVerticals: ["entertainment", "fashion", "culture", "lifestyle"],
    tone: "Relaxed. Entertainment-leaning. Longer form OK.",
    durationMinutes: 25,
  },
  {
    id: "early_evening",
    label: "Drive Time",
    hours: [17, 18],
    emoji: "🚗",
    tvAnalogy: "Like Sky News at 5 / drive-time radio news",
    defaultFormat: "flash_briefing",
    moodOverrides: {
      focused:   "evening_news",
      stressed:  "flash_briefing",
      chill:     "highlight_reel",
      curious:   "talk_show",
      energised: "reality_check",
    },
    defaultVerticals: ["breaking", "sports", "business", "tech"],
    tone: "Day wrap-up. What happened today. Keep it tight.",
    durationMinutes: 10,
  },
  {
    id: "prime_time",
    label: "Prime Time",
    hours: [19, 21],
    emoji: "📺",
    tvAnalogy: "Like BBC News at 10 / CNN prime time",
    defaultFormat: "evening_news",
    moodOverrides: {
      focused:   "documentary",
      curious:   "documentary",
      stressed:  "highlight_reel",
      chill:     "previously_on",
      energised: "countdown",
    },
    defaultVerticals: ["breaking", "politics", "business", "tech", "personal"],
    tone: "The main event. Full analysis. Your day in review.",
    durationMinutes: 20,
  },
  {
    id: "late_night",
    label: "Late Night",
    hours: [22, 23],
    emoji: "🌙",
    tvAnalogy: "Like The Tonight Show / The Graham Norton Show",
    defaultFormat: "late_night",
    moodOverrides: {
      stressed:  "highlight_reel",
      energised: "countdown",
      chill:     "late_night",
      curious:   "weekly_recap",
      focused:   "previously_on",
    },
    defaultVerticals: ["entertainment", "gaming", "fashion", "personal"],
    tone: "Wind down. Light, funny, entertaining. No heavy news.",
    durationMinutes: 15,
  },
];

/** Get the programming slot for a given hour (0-23) */
export function getSlotForHour(hour: number): ProgrammingSlot {
  return PROGRAMMING_CLOCK.find(s => hour >= s.hours[0] && hour <= s.hours[1])
    ?? PROGRAMMING_CLOCK[0]; // fallback to overnight
}

/** Get the recommended format for current time + mood */
export function getRecommendedFormat(hour: number, moodId?: string): TVFormatId {
  const slot = getSlotForHour(hour);
  if (moodId && slot.moodOverrides[moodId]) {
    return slot.moodOverrides[moodId]!;
  }
  return slot.defaultFormat;
}

/** Get today's full schedule as a list of slots with recommended formats */
export function getTodaySchedule(moodId?: string): Array<ProgrammingSlot & { recommendedFormat: TVFormatId }> {
  return PROGRAMMING_CLOCK.map(slot => ({
    ...slot,
    recommendedFormat: moodId && slot.moodOverrides[moodId]
      ? slot.moodOverrides[moodId]!
      : slot.defaultFormat,
  }));
}
