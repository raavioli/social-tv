import { BulletinFormatId } from "@social-tv/shared";

export const BULLETIN_FORMAT_CONFIG: Record<BulletinFormatId, { storyCount: number }> = {
  flash:               { storyCount: 5 },
  top10:               { storyCount: 10 },
  top100:              { storyCount: 100 },
  hundred_in_hundred:  { storyCount: 100 },
  deep_dive:           { storyCount: 20 },
  custom:              { storyCount: 10 },
};
