import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../../lib/env";

export async function generateAiImage(prompt: string): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${prompt}. Cinematic, dramatic lighting, news broadcast style, photorealistic, 16:9 aspect ratio.`,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export function buildImagePrompt(title: string, tags: string[]): string {
  return `Breaking news visual: "${title}". Topic: ${tags.join(", ")}. No text overlay.`;
}
