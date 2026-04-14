import {
  MoodId,
  BulletinFormatId,
  GenerateBulletinRequest,
  BulletinStory,
  GeneratedBulletin,
} from "../bulletin";

describe("Bulletin Types", () => {
  test("MoodId type accepts valid values", () => {
    const validMoods: MoodId[] = ["focused", "curious", "chill", "stressed", "energised"];
    expect(validMoods).toHaveLength(5);
  });

  test("BulletinFormatId type accepts valid values", () => {
    const validFormats: BulletinFormatId[] = [
      "flash", "top10", "top100", "hundred_in_hundred", "deep_dive", "custom",
    ];
    expect(validFormats).toHaveLength(6);
  });

  test("GenerateBulletinRequest shape is correct", () => {
    const req: GenerateBulletinRequest = {
      mood: "focused",
      availableMinutes: 5,
      formatId: "flash",
      channelIds: ["twitter"],
    };
    expect(req.mood).toBe("focused");
    expect(req.channelIds).toContain("twitter");
  });

  test("GeneratedBulletin can hold stories", () => {
    const bulletin: GeneratedBulletin = {
      id: "b1",
      userId: "u1",
      ruleId: "r1",
      formatId: "flash",
      date: "2026-04-07",
      mood: "chill",
      availableMinutes: 5,
      title: "Test Bulletin",
      stories: [],
      totalStoriesConsidered: 0,
      generatedAt: new Date().toISOString(),
      estimatedDurationSec: 120,
    };
    expect(bulletin.stories).toBeInstanceOf(Array);
    expect(bulletin.formatId).toBe("flash");
  });
});
