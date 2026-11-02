import { describe, expect, it } from "vitest";
import { detailAt, FLOOR_FACES, FLOOR_NAMES, FLOOR_SEGMENTS } from "./size";

describe("detailAt", () => {
  it("drops the face names first, then the display names and icons, the segments last", () => {
    expect(FLOOR_FACES).toBeGreaterThan(FLOOR_NAMES);
    expect(FLOOR_NAMES).toBeGreaterThan(FLOOR_SEGMENTS);
    expect([2, FLOOR_FACES, FLOOR_FACES - 0.01, FLOOR_NAMES, FLOOR_NAMES - 0.01, FLOOR_SEGMENTS, FLOOR_SEGMENTS - 0.01, 0.01].map(detailAt))
      .toEqual(["full", "full", "no-faces", "no-faces", "segments", "segments", "frames", "frames"]);
  });
});
