import { afterEach, describe, expect, it, vi } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { levelOf } from "../lib/level";
import { faceInfo } from "../lib/resolve";
import { labelledPorts, shortType } from "../lib/wires";
import { detailAt, FLOOR_FACES, FLOOR_NAMES, FLOOR_SEGMENTS, LABEL_FONT, LABEL_HEIGHT, sizeLabels, textWidth } from "./size";

describe("detailAt", () => {
  it("drops the face names first, then the display names and icons, the segments last", () => {
    expect(FLOOR_FACES).toBeGreaterThan(FLOOR_NAMES);
    expect(FLOOR_NAMES).toBeGreaterThan(FLOOR_SEGMENTS);
    expect([2, FLOOR_FACES, FLOOR_FACES - 0.01, FLOOR_NAMES, FLOOR_NAMES - 0.01, FLOOR_SEGMENTS, FLOOR_SEGMENTS - 0.01, 0.01].map(detailAt))
      .toEqual(["full", "full", "no-faces", "no-faces", "segments", "segments", "frames", "frames"]);
  });
});

describe("sizeLabels", () => {
  // no DOM here: a document whose canvas has no 2D context, so `textWidth` falls back to its estimate
  afterEach(() => vi.unstubAllGlobals());

  it("sizes each producer port's unqualified type whole at the label's font, one line high, and skips an empty type", () => {
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => null }) });
    const m = fixtureModel("kinds");
    const l = levelOf(m.tree!, m.resolution!, "");
    faceInfo(m.resolution!, "i", "out", "y")!.type = "";
    const ports = labelledPorts(m, l);
    const sized = sizeLabels(m, l);
    expect(sized.has("i|out|y")).toBe(false);
    expect([...sized.keys()]).toEqual(ports.filter((p) => p.port !== "i|out|y").map((p) => p.port));
    for (const p of ports.filter((p) => p.port !== "i|out|y")) {
      const text = shortType(p.type);
      expect(sized.get(p.port), p.port).toEqual({ text, width: Math.ceil(textWidth(text, LABEL_FONT)), height: LABEL_HEIGHT });
    }
  });
});
