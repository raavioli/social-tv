import { TV_FORMATS, FORMAT_GROUPS, TVFormat } from "../tvFormats";

describe("TV Formats", () => {
  test("all formats have required fields", () => {
    for (const fmt of TV_FORMATS) {
      expect(fmt.id).toBeDefined();
      expect(fmt.name).toBeTruthy();
      expect(fmt.emoji).toBeTruthy();
      expect(fmt.pacing).toMatch(/^(instant|rapid|steady|slow)$/);
      expect(fmt.storyCount).toBeGreaterThan(0);
      expect(fmt.minMinutes).toBeLessThanOrEqual(fmt.maxMinutes);
    }
  });

  test("FORMAT_GROUPS cover all formats", () => {
    const grouped = FORMAT_GROUPS.flatMap(g => g.formats);
    for (const fmt of TV_FORMATS) {
      expect(grouped).toContain(fmt.id);
    }
  });

  test("no duplicate format IDs", () => {
    const ids = TV_FORMATS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
