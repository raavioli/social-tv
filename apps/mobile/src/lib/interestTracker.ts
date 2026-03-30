/**
 * Passive interest tracker — learns what the user cares about
 * by watching their saves, skips, shares, and dwell time.
 * Stored locally in AsyncStorage, sent to API for server-side scoring.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterestProfile, InterestSignal, StoryInteraction, getThesaurusEntry, resolveVocabTerm, TAXONOMY } from "@social-tv/shared";

const STORAGE_KEY = "interest_profile";
const DECAY_FACTOR = 0.98; // score decays slightly each day so fresh behaviour matters more

export async function loadInterestProfile(): Promise<InterestProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { userId: "local", signals: [], updatedAt: new Date().toISOString() };
}

export async function recordInteraction(
  interaction: StoryInteraction
): Promise<void> {
  const profile = await loadInterestProfile();
  const now = new Date().toISOString();

  for (const tag of interaction.tags) {
    let signal = profile.signals.find((s) => s.tag === tag);
    if (!signal) {
      signal = { tag, score: 5, saveCount: 0, skipCount: 0, dwellMs: 0, lastUpdated: now };
      profile.signals.push(signal);
    }

    switch (interaction.type) {
      case "save":
      case "share":
        signal.saveCount++;
        signal.score = Math.min(10, signal.score + 1.0);
        break;
      case "skip":
      case "dismiss":
        signal.skipCount++;
        signal.score = Math.max(0, signal.score - 0.8);
        break;
      case "dwell":
        signal.dwellMs += interaction.dwellMs ?? 0;
        // +0.3 per 10 seconds of reading
        signal.score = Math.min(10, signal.score + (interaction.dwellMs ?? 0) / 10000 * 0.3);
        break;
      case "deep_dive":
        signal.score = Math.min(10, signal.score + 1.5);
        break;
    }

    signal.lastUpdated = now;
  }

  // Apply daily decay to all signals not updated today
  const today = now.split("T")[0];
  for (const signal of profile.signals) {
    if (!signal.lastUpdated.startsWith(today)) {
      signal.score = Math.max(1, signal.score * DECAY_FACTOR);
    }
  }

  profile.updatedAt = now;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function getTopInterests(n = 10): Promise<InterestSignal[]> {
  const profile = await loadInterestProfile();
  return [...profile.signals]
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Score a set of tags against the user's interest profile.
 * Returns 0–10 relevance score.
 */
export async function scoreTagRelevance(tags: string[]): Promise<number> {
  if (!tags.length) return 5;
  const profile = await loadInterestProfile();
  const scores = tags.map((tag) => {
    const signal = profile.signals.find(
      (s) => s.tag.toLowerCase() === tag.toLowerCase()
    );
    return signal?.score ?? 5; // default neutral score
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Sync helper — looks up a single tag score against a loaded profile
function scoreTagRelevanceSync(tag: string, profile: InterestProfile): number {
  const signal = profile.signals.find(
    (s) => s.tag.toLowerCase() === tag.toLowerCase()
  );
  return signal?.score ?? 5;
}

/**
 * Ontology-aware scoring: uses the thesaurus RT relationships
 * to score content even when the exact tag isn't in the interest profile.
 *
 * Example: if user has high "nba" interest, content tagged "sneakers"
 * gets a boost because "sneakers" RT "nba" in the thesaurus.
 */
export function scoreWithOntology(
  tags: string[],
  profile: InterestProfile,
  moodId?: string
): number {
  let score = 0;

  for (const tag of tags) {
    // Direct score
    const direct = scoreTagRelevanceSync(tag, profile);
    score += direct;

    // Thesaurus boost: find this tag's taxonomy node
    const vocabId = resolveVocabTerm(tag);
    if (vocabId) {
      const node = TAXONOMY.find(n => n.vocabTerms.includes(vocabId));
      if (node) {
        const thesaurus = getThesaurusEntry(node.id);
        if (thesaurus) {
          // Mood affinity boost
          if (moodId && thesaurus.moodAffinity.includes(moodId)) {
            score += 0.5;
          }
          // Related terms partial boost (0.3x of their direct score)
          for (const rtId of thesaurus.rt) {
            const rtNode = TAXONOMY.find(n => n.id === rtId);
            if (rtNode) {
              const rtScore = rtNode.vocabTerms.reduce((acc, vId) => {
                return acc + scoreTagRelevanceSync(vId, profile) * 0.3;
              }, 0);
              score += rtScore;
            }
          }
        }
      }
    }
  }

  return Math.min(score, 10); // cap at 10
}
