/**
 * SocialTV — Ontology Pipeline
 * Based on Jessica Talisman's Ontology Pipeline® methodology
 *
 * Stage 1: Controlled Vocabulary — canonical terms, synonyms, UF (Use For)
 * Stage 2: Metadata Standards — structural, descriptive, administrative
 * Stage 3: Taxonomy — hierarchical BT (Broader Term) / NT (Narrower Term)
 * Stage 4: Thesaurus — associative RT (Related Term) relationships
 * Stage 5: Knowledge Graph — entity properties and inference rules
 */

// ─── Stage 1: Controlled Vocabulary ─────────────────────────────────────────

export interface VocabTerm {
  id: string;
  label: string;
  definition: string;
  useFor: string[];      // UF — synonyms that should resolve to this term
  scopeNote?: string;    // additional disambiguation
}

export const VOCAB: VocabTerm[] = [
  // Technology
  { id: "artificial_intelligence", label: "Artificial Intelligence", definition: "Machine systems that perform tasks requiring human intelligence", useFor: ["AI", "machine learning", "ML", "deep learning", "LLM", "large language model", "generative ai", "gen ai"] },
  { id: "software_development", label: "Software Development", definition: "Creation and maintenance of software applications", useFor: ["coding", "programming", "dev", "engineering", "software engineering", "building apps"] },
  { id: "open_source", label: "Open Source", definition: "Software with publicly available source code", useFor: ["oss", "foss", "github", "open-source"] },
  { id: "startup", label: "Startup", definition: "Early-stage company pursuing scalable growth", useFor: ["startup", "early stage", "seed stage", "pre-seed", "founder", "building in public"] },
  // Sports
  { id: "football_association", label: "Association Football", definition: "Sport played with a round ball between two teams of eleven", useFor: ["football", "soccer", "footy", "the beautiful game", "premier league", "champions league"] },
  { id: "american_football", label: "American Football", definition: "Sport played with an oval ball between two teams of eleven", useFor: ["NFL", "american football", "superbowl", "gridiron"] },
  { id: "basketball", label: "Basketball", definition: "Sport played with a round ball through elevated hoops", useFor: ["NBA", "basketball", "hoops", "WNBA"] },
  { id: "cricket", label: "Cricket", definition: "Bat-and-ball sport between two teams of eleven", useFor: ["cricket", "test match", "IPL", "ODI", "T20"] },
  // Fashion
  { id: "streetwear", label: "Streetwear", definition: "Casual clothing influenced by skateboarding and hip-hop cultures", useFor: ["streetwear", "hype", "hypebeast", "sneakers", "kicks", "drip", "fit"] },
  { id: "luxury_fashion", label: "Luxury Fashion", definition: "High-end designer clothing and accessories", useFor: ["luxury", "designer", "high fashion", "haute couture", "luxury brand"] },
  { id: "sustainable_fashion", label: "Sustainable Fashion", definition: "Clothing produced with minimal environmental impact", useFor: ["sustainable fashion", "eco fashion", "slow fashion", "ethical fashion", "conscious fashion"] },
  // Business
  { id: "venture_capital", label: "Venture Capital", definition: "Financing provided to early-stage high-growth companies", useFor: ["VC", "venture capital", "funding", "seed round", "series A", "series B", "raise", "investment round"] },
  { id: "financial_markets", label: "Financial Markets", definition: "Systems for trading financial instruments", useFor: ["stocks", "markets", "trading", "investing", "equities", "shares", "market cap"] },
  { id: "career_development", label: "Career Development", definition: "Progression and growth within professional life", useFor: ["career", "job", "promotion", "hiring", "recruitment", "job market", "work life"] },
  // Entertainment
  { id: "music", label: "Music", definition: "Organised sound as artistic expression", useFor: ["music", "album", "track", "song", "artist", "band", "concert", "tour", "single", "release"] },
  { id: "film_television", label: "Film & Television", definition: "Moving image entertainment", useFor: ["movie", "film", "TV", "series", "show", "streaming", "netflix", "disney", "cinema", "trailer"] },
  { id: "viral_content", label: "Viral Content", definition: "Media that spreads rapidly through social sharing", useFor: ["viral", "meme", "trending", "gone viral", "blowing up"] },
  // Lifestyle
  { id: "fitness_wellness", label: "Fitness & Wellness", definition: "Physical and mental health practices", useFor: ["fitness", "gym", "workout", "exercise", "health", "wellness", "mental health", "meditation"] },
  { id: "food_drink", label: "Food & Drink", definition: "Culinary experiences and culture", useFor: ["food", "recipe", "cooking", "restaurant", "foodie", "cuisine", "coffee", "dining"] },
  { id: "travel", label: "Travel", definition: "Movement between geographic locations for leisure or work", useFor: ["travel", "holiday", "vacation", "trip", "adventure", "explore", "destination"] },
];

// Resolve a raw term to its canonical vocab ID
export function resolveVocabTerm(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  for (const term of VOCAB) {
    if (term.label.toLowerCase() === lower) return term.id;
    if (term.useFor.some(uf => lower.includes(uf.toLowerCase()))) return term.id;
  }
  return null;
}

// ─── Stage 3: Taxonomy ───────────────────────────────────────────────────────
// Hierarchical relationships: BT (Broader Term), NT (Narrower Term)

export interface TaxonomyNode {
  id: string;
  label: string;
  emoji: string;
  verticalId: string;        // maps to ContentVertical
  bt?: string;               // Broader Term (parent)
  nt: string[];              // Narrower Terms (children)
  vocabTerms: string[];      // controlled vocab IDs this node covers
  depth: number;             // 0 = top level, 1 = category, 2 = subcategory
}

export const TAXONOMY: TaxonomyNode[] = [
  // ── TECH (depth 0)
  { id: "tech", label: "Technology", emoji: "💻", verticalId: "tech", nt: ["ai_ml", "software_dev", "hardware", "web3", "cybersecurity"], vocabTerms: [], depth: 0 },
  { id: "ai_ml", label: "AI & Machine Learning", emoji: "🤖", verticalId: "tech", bt: "tech", nt: ["llms", "computer_vision", "robotics"], vocabTerms: ["artificial_intelligence"], depth: 1 },
  { id: "llms", label: "Large Language Models", emoji: "🧠", verticalId: "tech", bt: "ai_ml", nt: [], vocabTerms: ["artificial_intelligence"], depth: 2 },
  { id: "software_dev", label: "Software Development", emoji: "👨‍💻", verticalId: "tech", bt: "tech", nt: ["open_source_dev", "mobile_dev", "web_dev"], vocabTerms: ["software_development", "open_source"], depth: 1 },
  { id: "open_source_dev", label: "Open Source", emoji: "🔓", verticalId: "tech", bt: "software_dev", nt: [], vocabTerms: ["open_source"], depth: 2 },

  // ── SPORTS (depth 0)
  { id: "sports", label: "Sports", emoji: "🏆", verticalId: "sports", nt: ["football", "american_football_cat", "basketball_cat", "cricket_cat", "tennis", "combat_sports"], vocabTerms: [], depth: 0 },
  { id: "football", label: "Football (Soccer)", emoji: "⚽", verticalId: "sports", bt: "sports", nt: ["premier_league", "champions_league", "world_cup"], vocabTerms: ["football_association"], depth: 1 },
  { id: "premier_league", label: "Premier League", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", verticalId: "sports", bt: "football", nt: [], vocabTerms: ["football_association"], depth: 2 },
  { id: "basketball_cat", label: "Basketball", emoji: "🏀", verticalId: "sports", bt: "sports", nt: ["nba", "wnba"], vocabTerms: ["basketball"], depth: 1 },
  { id: "nba", label: "NBA", emoji: "🏀", verticalId: "sports", bt: "basketball_cat", nt: [], vocabTerms: ["basketball"], depth: 2 },
  { id: "cricket_cat", label: "Cricket", emoji: "🏏", verticalId: "sports", bt: "sports", nt: ["test_cricket", "t20"], vocabTerms: ["cricket"], depth: 1 },

  // ── FASHION (depth 0)
  { id: "fashion", label: "Fashion", emoji: "👗", verticalId: "fashion", nt: ["streetwear_cat", "luxury_cat", "sustainable_cat", "beauty"], vocabTerms: [], depth: 0 },
  { id: "streetwear_cat", label: "Streetwear", emoji: "👟", verticalId: "fashion", bt: "fashion", nt: ["sneakers", "hype_drops"], vocabTerms: ["streetwear"], depth: 1 },
  { id: "sneakers", label: "Sneakers", emoji: "👟", verticalId: "fashion", bt: "streetwear_cat", nt: [], vocabTerms: ["streetwear"], depth: 2 },
  { id: "luxury_cat", label: "Luxury Fashion", emoji: "💎", verticalId: "fashion", bt: "fashion", nt: [], vocabTerms: ["luxury_fashion"], depth: 1 },
  { id: "sustainable_cat", label: "Sustainable Fashion", emoji: "♻️", verticalId: "fashion", bt: "fashion", nt: [], vocabTerms: ["sustainable_fashion"], depth: 1 },

  // ── BUSINESS (depth 0)
  { id: "business", label: "Business", emoji: "💼", verticalId: "business", nt: ["startups", "markets", "career"], vocabTerms: [], depth: 0 },
  { id: "startups", label: "Startups & VC", emoji: "🚀", verticalId: "business", bt: "business", nt: ["fundraising", "accelerators"], vocabTerms: ["startup", "venture_capital"], depth: 1 },
  { id: "fundraising", label: "Fundraising", emoji: "💰", verticalId: "business", bt: "startups", nt: [], vocabTerms: ["venture_capital"], depth: 2 },
  { id: "markets", label: "Financial Markets", emoji: "📈", verticalId: "business", bt: "business", nt: ["crypto", "equities"], vocabTerms: ["financial_markets"], depth: 1 },
  { id: "career", label: "Career & Work", emoji: "🧑‍💼", verticalId: "business", bt: "business", nt: [], vocabTerms: ["career_development"], depth: 1 },

  // ── ENTERTAINMENT (depth 0)
  { id: "entertainment", label: "Entertainment", emoji: "🎭", verticalId: "entertainment", nt: ["music_cat", "film_tv", "viral_cat", "celebrity"], vocabTerms: [], depth: 0 },
  { id: "music_cat", label: "Music", emoji: "🎵", verticalId: "entertainment", bt: "entertainment", nt: ["hip_hop", "pop", "electronic"], vocabTerms: ["music"], depth: 1 },
  { id: "hip_hop", label: "Hip-Hop & Rap", emoji: "🎤", verticalId: "entertainment", bt: "music_cat", nt: [], vocabTerms: ["music"], depth: 2 },
  { id: "film_tv", label: "Film & TV", emoji: "🎬", verticalId: "entertainment", bt: "entertainment", nt: [], vocabTerms: ["film_television"], depth: 1 },
  { id: "viral_cat", label: "Viral & Memes", emoji: "🔥", verticalId: "entertainment", bt: "entertainment", nt: [], vocabTerms: ["viral_content"], depth: 1 },

  // ── LIFESTYLE (depth 0)
  { id: "lifestyle", label: "Lifestyle", emoji: "🌿", verticalId: "lifestyle", nt: ["fitness_cat", "food_cat", "travel_cat", "home_garden"], vocabTerms: [], depth: 0 },
  { id: "fitness_cat", label: "Fitness & Wellness", emoji: "💪", verticalId: "lifestyle", bt: "lifestyle", nt: [], vocabTerms: ["fitness_wellness"], depth: 1 },
  { id: "food_cat", label: "Food & Drink", emoji: "🍕", verticalId: "lifestyle", bt: "lifestyle", nt: [], vocabTerms: ["food_drink"], depth: 1 },
  { id: "travel_cat", label: "Travel", emoji: "✈️", verticalId: "lifestyle", bt: "lifestyle", nt: [], vocabTerms: ["travel"], depth: 1 },
];

// Get a node and all its ancestors up to root
export function getAncestors(nodeId: string): TaxonomyNode[] {
  const node = TAXONOMY.find(n => n.id === nodeId);
  if (!node || !node.bt) return node ? [node] : [];
  return [node, ...getAncestors(node.bt)];
}

// Get a node and all its descendants
export function getDescendants(nodeId: string): TaxonomyNode[] {
  const node = TAXONOMY.find(n => n.id === nodeId);
  if (!node) return [];
  const children = node.nt.flatMap(ntId => getDescendants(ntId));
  return [node, ...children];
}

// ─── Stage 4: Thesaurus ──────────────────────────────────────────────────────
// Associative RT (Related Term) relationships — non-hierarchical connections

export interface ThesaurusEntry {
  termId: string;          // taxonomy node ID
  rt: string[];            // Related Terms (associative)
  moodAffinity: string[];  // moods this content typically resonates with
  timeAffinity: string[];  // time slots this content fits (from programmingClock)
  crossVertical: string[]; // verticalIds this overlaps with
}

export const THESAURUS: ThesaurusEntry[] = [
  // Tech associates with...
  { termId: "ai_ml",         rt: ["startups", "software_dev", "film_tv"],        moodAffinity: ["focused", "curious", "energised"],  timeAffinity: ["mid_morning", "prime_time"],   crossVertical: ["business", "culture"] },
  { termId: "software_dev",  rt: ["open_source_dev", "startups", "career"],       moodAffinity: ["focused", "curious"],               timeAffinity: ["mid_morning", "early_evening"], crossVertical: ["business"] },
  { termId: "startups",      rt: ["ai_ml", "fundraising", "career"],              moodAffinity: ["focused", "energised"],             timeAffinity: ["mid_morning", "prime_time"],   crossVertical: ["tech", "business"] },

  // Sports associates with...
  { termId: "football",      rt: ["streetwear_cat", "hip_hop", "celebrity"],      moodAffinity: ["energised", "chill"],               timeAffinity: ["early_evening", "prime_time"],  crossVertical: ["fashion", "entertainment"] },
  { termId: "basketball_cat",rt: ["hip_hop", "streetwear_cat", "sneakers"],       moodAffinity: ["energised", "chill"],               timeAffinity: ["late_night", "prime_time"],     crossVertical: ["fashion", "entertainment"] },
  { termId: "nba",           rt: ["hip_hop", "sneakers", "celebrity"],            moodAffinity: ["energised", "chill"],               timeAffinity: ["late_night"],                   crossVertical: ["fashion", "entertainment"] },

  // Fashion associates with...
  { termId: "streetwear_cat",rt: ["hip_hop", "sneakers", "basketball_cat", "viral_cat"], moodAffinity: ["chill", "energised"],      timeAffinity: ["afternoon", "late_night"],      crossVertical: ["entertainment", "sports"] },
  { termId: "luxury_cat",    rt: ["celebrity", "travel_cat", "film_tv"],          moodAffinity: ["chill", "curious"],                 timeAffinity: ["afternoon", "late_night"],      crossVertical: ["entertainment", "lifestyle"] },

  // Entertainment associates with...
  { termId: "hip_hop",       rt: ["streetwear_cat", "basketball_cat", "viral_cat"], moodAffinity: ["energised", "chill"],            timeAffinity: ["late_night", "afternoon"],      crossVertical: ["fashion", "sports"] },
  { termId: "viral_cat",     rt: ["hip_hop", "celebrity", "football"],            moodAffinity: ["chill", "stressed"],                timeAffinity: ["late_night", "lunchtime"],      crossVertical: ["sports", "fashion"] },

  // Lifestyle associates with...
  { termId: "fitness_cat",   rt: ["food_cat", "travel_cat", "career"],            moodAffinity: ["energised", "focused"],             timeAffinity: ["early_morning", "mid_morning"], crossVertical: ["business"] },
  { termId: "food_cat",      rt: ["travel_cat", "lifestyle", "film_tv"],          moodAffinity: ["chill", "curious"],                 timeAffinity: ["lunchtime", "afternoon"],       crossVertical: ["lifestyle", "entertainment"] },
  { termId: "travel_cat",    rt: ["luxury_cat", "food_cat", "film_tv"],           moodAffinity: ["chill", "curious"],                 timeAffinity: ["afternoon", "prime_time"],      crossVertical: ["fashion", "lifestyle"] },
];

// Get thesaurus entry for a term
export function getThesaurusEntry(termId: string): ThesaurusEntry | null {
  return THESAURUS.find(t => t.termId === termId) ?? null;
}

// Get all related terms for a given termId (direct + via cross-vertical)
export function getRelatedTerms(termId: string): string[] {
  const entry = getThesaurusEntry(termId);
  if (!entry) return [];
  return [...new Set([...entry.rt])];
}

// Given a mood and time slot, find the best taxonomy nodes
export function getOntologyRecommendations(moodId: string, timeSlotId: string): TaxonomyNode[] {
  const matches = THESAURUS
    .filter(t => t.moodAffinity.includes(moodId) && t.timeAffinity.includes(timeSlotId))
    .map(t => TAXONOMY.find(n => n.id === t.termId))
    .filter(Boolean) as TaxonomyNode[];
  return matches;
}

// ─── Stage 5: Entity Types ───────────────────────────────────────────────────
// Named entities that appear in content — people, brands, teams, events

export type EntityType = "person" | "brand" | "team" | "event" | "place" | "product";

export interface ContentEntity {
  id: string;
  label: string;
  type: EntityType;
  taxonomyIds: string[];   // which taxonomy nodes this entity belongs to
  aliases: string[];       // other names/handles
}

export const KNOWN_ENTITIES: ContentEntity[] = [
  // People
  { id: "elon_musk",    label: "Elon Musk",   type: "person", taxonomyIds: ["ai_ml", "startups", "markets"],      aliases: ["@elonmusk", "musk"] },
  { id: "sam_altman",   label: "Sam Altman",  type: "person", taxonomyIds: ["ai_ml", "startups"],                  aliases: ["@sama", "altman"] },
  { id: "lebron_james", label: "LeBron James",type: "person", taxonomyIds: ["nba", "streetwear_cat", "startups"],  aliases: ["@kingjames", "lebron", "king james"] },
  { id: "taylor_swift", label: "Taylor Swift",type: "person", taxonomyIds: ["music_cat", "celebrity", "viral_cat"],aliases: ["@taylorswift13", "taylor", "swifties"] },
  // Brands
  { id: "apple",   label: "Apple",   type: "brand", taxonomyIds: ["software_dev", "luxury_cat"], aliases: ["apple inc", "@apple", "cupertino"] },
  { id: "nike",    label: "Nike",    type: "brand", taxonomyIds: ["sneakers", "fitness_cat"],     aliases: ["@nike", "just do it"] },
  { id: "openai",  label: "OpenAI",  type: "brand", taxonomyIds: ["ai_ml", "llms"],               aliases: ["@openai", "open ai", "chatgpt"] },
  // Teams
  { id: "manchester_united", label: "Manchester United", type: "team", taxonomyIds: ["premier_league"], aliases: ["man utd", "man united", "@manchesterunited", "mufc"] },
  { id: "golden_state", label: "Golden State Warriors", type: "team", taxonomyIds: ["nba"], aliases: ["warriors", "gsw", "@warriors"] },
];

// Extract entities from text
export function extractEntities(text: string): ContentEntity[] {
  const lower = text.toLowerCase();
  return KNOWN_ENTITIES.filter(entity =>
    entity.aliases.some(alias => lower.includes(alias.toLowerCase())) ||
    lower.includes(entity.label.toLowerCase())
  );
}
