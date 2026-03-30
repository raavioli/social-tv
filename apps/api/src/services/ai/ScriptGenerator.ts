import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { FeedItem, ShowSegment, PersonaId } from "@ai-tv-news/shared";
import { env } from "../../lib/env";

const PERSONA_PROMPTS: Record<PersonaId, string> = {
  anchor_alex: "You are Alex, a sharp professional news anchor. Be concise, authoritative, and engaging. Use broadcast journalism style.",
  host_maya: "You are Maya, a warm enthusiastic morning show host. Be upbeat, relatable, and friendly. Add personal energy.",
  comedian_jay: "You are Jay, a witty comedian host. Add light humor and wordplay. Keep facts accurate but make them entertaining.",
  chill_sam: "You are Sam, a laid-back podcast host. Keep it conversational, no corporate speak. Talk like you're chatting with a friend.",
};

const EMOTION_MAP: Record<PersonaId, ShowSegment["emotionCue"]> = {
  anchor_alex: "neutral",
  host_maya: "excited",
  comedian_jay: "funny",
  chill_sam: "neutral",
};

export async function generateScript(
  items: FeedItem[],
  personaId: PersonaId,
  date: string
): Promise<ShowSegment[]> {
  if (!env.OPENAI_API_KEY) {
    // Return mock segments for demo without API key
    return generateMockSegments(items, personaId);
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  const personaPrompt = PERSONA_PROMPTS[personaId];
  const top5 = items.slice(0, 5);

  const storiesJson = top5
    .map((item, i) => `${i + 1}. ${item.title}\n   Context: ${item.summary}`)
    .join("\n\n");

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `${personaPrompt}
You present a daily news briefing as a TV host.
Generate SHORT engaging scripts (2-3 sentences max per story).
Return a JSON array of segments. Each segment has:
- type: "intro" | "story" | "outro"
- scriptText: your spoken words
- emotionCue: "neutral" | "excited" | "concerned" | "funny" | "inspiring"`,
    prompt: `Today is ${date}. Here are today's top stories:\n\n${storiesJson}\n\nGenerate the briefing script as a JSON array.`,
  });

  try {
    const raw = text.match(/\[[\s\S]*\]/)?.[0];
    if (!raw) throw new Error("No JSON array found");
    const parsed: Array<{ type: ShowSegment["type"]; scriptText: string; emotionCue: ShowSegment["emotionCue"] }> = JSON.parse(raw);

    return parsed.map((seg, i): ShowSegment => ({
      id: `seg-${i}`,
      order: i,
      type: seg.type ?? "story",
      feedItem: i > 0 && i <= top5.length ? top5[i - 1] : undefined,
      scriptText: seg.scriptText,
      emotionCue: seg.emotionCue ?? EMOTION_MAP[personaId],
      imageUrl: i > 0 && i <= top5.length ? top5[i - 1].imageUrl : undefined,
    }));
  } catch {
    return generateMockSegments(items, personaId);
  }
}

function generateMockSegments(items: FeedItem[], personaId: PersonaId): ShowSegment[] {
  const greeting =
    personaId === "comedian_jay"
      ? "Welcome to the only news show where the puns are free! Here's what's happening:"
      : personaId === "chill_sam"
      ? "Hey, good morning. Here's what you need to know today — no fluff, just the good stuff."
      : personaId === "host_maya"
      ? "Good morning, beautiful people! Maya here, and have I got some stories for you today!"
      : "Good morning. Here is your daily briefing.";

  const segments: ShowSegment[] = [
    { id: "seg-0", order: 0, type: "intro", scriptText: greeting, emotionCue: EMOTION_MAP[personaId] },
    ...items.slice(0, 4).map((item, i): ShowSegment => ({
      id: `seg-${i + 1}`,
      order: i + 1,
      type: "story",
      feedItem: item,
      scriptText: `${item.title}. ${item.summary}`,
      emotionCue: EMOTION_MAP[personaId],
      imageUrl: item.imageUrl,
    })),
    { id: `seg-${items.length + 1}`, order: items.length + 1, type: "outro", scriptText: "That's your briefing for today. Stay curious, stay informed — see you tomorrow.", emotionCue: "neutral" },
  ];

  return segments;
}
