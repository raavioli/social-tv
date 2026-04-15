export type TimeSlotId =
  | "early_morning"
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "prime_time"
  | "late_night";

export type Pace = "rapid" | "steady" | "deep";

export interface TimeSlot {
  id: TimeSlotId;
  label: string;
  time: string;
  hours: [number, number];
  emoji: string;
  defaultMix: { news: number; tech: number; entertainment: number; personal: number; trending: number };
  defaultPace: Pace;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "early_morning", label: "Wake Up",      time: "5–8am",   hours: [5, 8],   emoji: "🌅", defaultMix: { news: 60, tech: 20, entertainment: 0,  personal: 20, trending: 0  }, defaultPace: "steady" },
  { id: "morning",       label: "Morning News", time: "8–11am",  hours: [8, 11],  emoji: "☀️", defaultMix: { news: 50, tech: 30, entertainment: 0,  personal: 10, trending: 10 }, defaultPace: "steady" },
  { id: "midday",        label: "Lunch Break",  time: "11am–2pm",hours: [11, 14], emoji: "🍕", defaultMix: { news: 20, tech: 20, entertainment: 30, personal: 10, trending: 20 }, defaultPace: "rapid"  },
  { id: "afternoon",     label: "Afternoon",    time: "2–5pm",   hours: [14, 17], emoji: "☕", defaultMix: { news: 30, tech: 30, entertainment: 10, personal: 20, trending: 10 }, defaultPace: "steady" },
  { id: "evening",       label: "Evening News", time: "5–8pm",   hours: [17, 20], emoji: "🌆", defaultMix: { news: 40, tech: 20, entertainment: 10, personal: 20, trending: 10 }, defaultPace: "steady" },
  { id: "prime_time",    label: "Prime Time",   time: "8–11pm",  hours: [20, 23], emoji: "📺", defaultMix: { news: 10, tech: 10, entertainment: 40, personal: 10, trending: 30 }, defaultPace: "deep"   },
  { id: "late_night",    label: "Late Night",   time: "11pm–5am",hours: [23, 5],  emoji: "🌙", defaultMix: { news: 0,  tech: 10, entertainment: 50, personal: 0,  trending: 40 }, defaultPace: "rapid"  },
];

export function getActiveSlot(now: Date = new Date()): TimeSlot {
  const h = now.getHours();
  return (
    TIME_SLOTS.find(s => {
      const [a, b] = s.hours;
      return a <= b ? h >= a && h < b : h >= a || h < b; // wraparound for late_night
    }) ?? TIME_SLOTS[0]
  );
}
