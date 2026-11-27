import { afterEach, describe, expect, it, vi } from "vitest";
import { eventsPill } from "../lib/events";
import { fixtureModel, fixtureNames } from "../lib/fixtures";
import { levelOf } from "../lib/level";
import { ratePill } from "../lib/rates";
import { faceInfo } from "../lib/resolve";
import { labelledPorts, shortType } from "../lib/wires";
import {
  BADGE_GAP, BADGE_INSET, detailAt, FLOOR_FACES, FLOOR_NAMES, FLOOR_SEGMENTS, LABEL_FONT, LABEL_HEIGHT, pillWidth, sizeBlock, sizeLabels, sizeLevel,
  textWidth, topPills, topPillsWidth,
} from "./size";

describe("detailAt", () => {
  it("drops the face names first, then the display names and icons, the segments last", () => {
    expect(FLOOR_FACES).toBeGreaterThan(FLOOR_NAMES);
    expect(FLOOR_NAMES).toBeGreaterThan(FLOOR_SEGMENTS);
    expect([2, FLOOR_FACES, FLOOR_FACES - 0.01, FLOOR_NAMES, FLOOR_NAMES - 0.01, FLOOR_SEGMENTS, FLOOR_SEGMENTS - 0.01, 0.01].map(detailAt))
      .toEqual(["full", "full", "no-faces", "no-faces", "segments", "segments", "frames", "frames"]);
  });
});

describe("the floors", () => {
  it("are the look pass's: 0.7 for the face names, 0.6 for the display names and icons, 0.4 for the segment (4.1)", () => {
    expect([FLOOR_FACES, FLOOR_NAMES, FLOOR_SEGMENTS]).toEqual([0.7, 0.6, 0.4]);
    expect([0.36, 0.45, 0.56, 0.7, 0.88].map(detailAt)).toEqual(["frames", "segments", "segments", "full", "full"]);
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

describe("the top edge's pills (visual_grammar.md answer 11, the notes' C2)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("only the events pill reserves width: its insets and its own, the rate pill's and the gap counted beside it", () => {
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => null }) });
    expect(topPillsWidth({})).toBe(0);
    expect(topPillsWidth({ rate: "2 clocks" })).toBe(0);
    expect(topPillsWidth({ events: "1 event" })).toBe(2 * BADGE_INSET + pillWidth("1 event"));
    expect(topPillsWidth({ rate: "#9 · 1 clock", events: "4 events" })).toBe(2 * BADGE_INSET + pillWidth("#9 · 1 clock") + BADGE_GAP + pillWidth("4 events"));
  });

  it.each(fixtureNames().filter((n) => fixtureModel(n).tree))("%s: every child is at least as wide as its top pills need, and one without the events pill is sized as if it had no pill", (name) => {
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => null }) });
    const m = fixtureModel(name), tree = m.tree!;
    for (const n of m.structure!.nodes) {
      if (n.class !== "assembly" && n.path !== "") continue;
      const level = levelOf(tree, m.resolution!, n.path);
      const sizes = sizeLevel(level, m);
      for (const b of level.blocks) {
        if (b.role === "in" || b.role === "out") continue;
        const top = topPills(m, b.path), width = sizes.get(b.id)!.width;
        expect(top, b.path).toEqual({ rate: ratePill(m, b.path)?.text, events: eventsPill(m, b.path)?.text });
        expect(width, b.path).toBeGreaterThanOrEqual(topPillsWidth(top));
        if (top.events === undefined) expect(width, b.path).toBe(sizeBlock(b, tree, m.label).width);
      }
    }
  });

  it("events_deployment's pods: their own lines need less than their two pills, so the reserved width sets theirs", () => {
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => null }) });
    const m = fixtureModel("events_deployment"), level = levelOf(m.tree!, m.resolution!, "");
    for (const id of ["pods/a", "pods/b"]) {
      const b = level.blocks.find((x) => x.id === id)!;
      const top = topPills(m, id);
      expect(top).toEqual({ rate: "1 clock", events: "1 event" });
      expect(sizeBlock(b, m.tree!, m.label).width).toBeLessThan(topPillsWidth(top));
      expect(sizeLevel(level, m).get(id)!.width).toBe(topPillsWidth(top));
    }
  });
});
