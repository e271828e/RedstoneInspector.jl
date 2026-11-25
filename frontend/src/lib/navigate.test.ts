import { describe, expect, it } from "vitest";
import { follow, nearest, stopStep, walkOf, type Box, type Stop } from "./navigate";

/** A three-by-three grid of 40 px boxes at 100 px pitch, ids `r<row>c<col>`. */
const grid: Box[] = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ id: `r${r}c${c}`, x: 100 * c, y: 100 * r, width: 40, height: 40 })));

describe("nearest", () => {
  it("from the center gives the four neighbors, never a diagonal", () => {
    expect(nearest(grid, "r1c1", "l")).toBe("r1c2");
    expect(nearest(grid, "r1c1", "h")).toBe("r1c0");
    expect(nearest(grid, "r1c1", "j")).toBe("r2c1");
    expect(nearest(grid, "r1c1", "k")).toBe("r0c1");
  });

  it("from a corner the two directions outward give undefined", () => {
    expect(nearest(grid, "r0c0", "h")).toBeUndefined();
    expect(nearest(grid, "r0c0", "k")).toBeUndefined();
    expect(nearest(grid, "r2c2", "l")).toBeUndefined();
    expect(nearest(grid, "r2c2", "j")).toBeUndefined();
    expect(nearest(grid, "r0c0", "l")).toBe("r0c1");
  });

  it("a closer box off the row wins while its offset costs less than the farther box's gap, then loses to it", () => {
    const o: Box = { id: "o", x: 0, y: 0, width: 20, height: 20 };
    const far: Box = { id: "far", x: 200, y: 0, width: 20, height: 20 };
    // gap 40 and 60 down, score 160, against far's gap 180
    expect(nearest([o, far, { id: "near", x: 60, y: 50, width: 20, height: 20 }], "o", "l")).toBe("near");
    // gap 40 and 80 down, score 200: far wins, and j takes the near one, far's center being above o's bottom
    const off: Box = { id: "near", x: 60, y: 70, width: 20, height: 20 };
    expect(nearest([o, far, off], "o", "l")).toBe("far");
    expect(nearest([o, far, off], "o", "j")).toBe("near");
  });

  it("reaches a box far above in the next layer, and the box touching the row before a nearer-centered one beyond it", () => {
    // closed_loop's root: selection sits 292 up and 162 right of pid_controller's center, actuators farther
    const pid: Box = { id: "pid_controller", x: 445, y: 295, width: 111, height: 192 };
    const selection: Box = { id: "selection", x: 602, y: 35, width: 120, height: 128 };
    const actuators: Box = { id: "actuators", x: 750, y: 35, width: 99, height: 80 };
    expect(nearest([pid, selection, actuators], "pid_controller", "l")).toBe("selection");
    // lqr_controller: tracker's box starts 36 right of command_pack's edge, u_unpack's 185, its center nearer the cone
    const pack: Box = { id: "command_pack", x: 124, y: 492, width: 123, height: 80 };
    const tracker: Box = { id: "tracker", x: 283, y: 280, width: 121, height: 144 };
    const unpack: Box = { id: "u_unpack", x: 432, y: 280, width: 86, height: 80 };
    expect(nearest([pack, tracker, unpack], "command_pack", "l")).toBe("tracker");
    // a box in the origin's own layer, overlapping it in x, is never to its right
    const below: Box = { id: "below", x: 130, y: 600, width: 100, height: 40 };
    expect(nearest([pack, below], "command_pack", "l")).toBeUndefined();
    expect(nearest([pack, below], "command_pack", "j")).toBe("below");
  });

  it("measures along the direction between facing edges, clamped at zero, not between centers", () => {
    const o: Box = { id: "o", x: 0, y: 0, width: 20, height: 20 };
    // wide starts 10 past o's edge with its center 110 away; narrow starts 80 past it with its center 90 away
    const wide: Box = { id: "wide", x: 30, y: 0, width: 200, height: 20 };
    const narrow: Box = { id: "narrow", x: 100, y: 0, width: 20, height: 20 };
    expect(nearest([o, wide, narrow], "o", "l")).toBe("wide");
    // a box reaching back past o's edge counts a gap of 0, so its 100 offset still loses to a box 10 away in line
    const reaching: Box = { id: "reaching", x: -500, y: 100, width: 1100, height: 20 };
    const inLine: Box = { id: "inLine", x: 30, y: 0, width: 20, height: 20 };
    expect(nearest([o, reaching, inLine], "o", "l")).toBe("inLine");
  });

  it("breaks a tie by the lower id, and gives undefined for an unknown origin", () => {
    const o: Box = { id: "o", x: 0, y: 0, width: 20, height: 20 };
    const b: Box = { id: "b", x: 100, y: 30, width: 20, height: 20 };
    const a: Box = { id: "a", x: 100, y: -30, width: 20, height: 20 };
    expect(nearest([o, b, a], "o", "l")).toBe("a");
    expect(nearest(grid, "nowhere", "l")).toBeUndefined();
  });
});

describe("follow", () => {
  const viewport = { width: 400, height: 300 };
  const view = { x: 0, y: 0, scale: 2 }; // the world rectangle 0..200 by 0..150

  it("moves x by the shortfall exactly for a box left of the view", () => {
    const v = follow(view, viewport, { x: -50, y: 20, width: 30, height: 30 }, 10);
    // the box grown by 10 / 2 world units starts at -55
    expect(v).toEqual({ x: -55, y: 0, scale: 2 });
  });

  it("moves y by the shortfall for a box below the view", () => {
    const v = follow(view, viewport, { x: 20, y: 160, width: 30, height: 20 }, 0);
    expect(v).toEqual({ x: 0, y: 30, scale: 2 });
  });

  it("returns the view itself for a box inside", () => {
    expect(follow(view, viewport, { x: 20, y: 20, width: 30, height: 30 }, 10)).toBe(view);
  });

  it("aligns the near edge of a box larger than the viewport", () => {
    const v = follow(view, viewport, { x: 300, y: 20, width: 500, height: 30 }, 0);
    expect(v).toEqual({ x: 300, y: 0, scale: 2 });
  });
});

/** A pane: a button; a closed heading; an open one with a row of two links and a row with none; an open one with no row. */
const pane: Stop[] = [
  { depth: 0 }, { depth: 0, open: false }, { depth: 0, open: true }, { depth: 1 }, { depth: 2 }, { depth: 2 }, { depth: 1 }, { depth: 0, open: true },
];
/** A drawer: a row with a control, then a bare row. */
const drawer: Stop[] = [{ depth: 0 }, { depth: 2 }, { depth: 0 }];

describe("stopStep", () => {
  it("j and k walk every stop but a row's links, and stop at the ends", () => {
    expect(walkOf(pane)).toEqual([0, 1, 2, 3, 6, 7]);
    const walk = walkOf(pane);
    for (let i = 0; i < walk.length; i++) {
      expect(stopStep(pane, walk[i], "j")).toEqual(i + 1 < walk.length ? { focus: walk[i + 1] } : undefined);
      expect(stopStep(pane, walk[i], "k")).toEqual(i > 0 ? { focus: walk[i - 1] } : undefined);
    }
  });

  it("j and k from a link go on from its row", () => {
    for (const at of [4, 5]) {
      expect(stopStep(pane, at, "j")).toEqual({ focus: 6 });
      expect(stopStep(pane, at, "k")).toEqual({ focus: 2 });
    }
    expect(stopStep(drawer, 1, "k")).toBeUndefined();
    expect(stopStep(drawer, 1, "j")).toEqual({ focus: 2 });
  });

  it("with no stop focused j and k take the first, h and l nothing; an empty pane has none", () => {
    for (const k of ["j", "k"] as const) {
      expect(stopStep(pane, -1, k)).toEqual({ focus: 0 });
      expect(stopStep([], -1, k)).toBeUndefined();
    }
    for (const k of ["h", "l"] as const) expect(stopStep(pane, -1, k)).toBeUndefined();
  });

  it("l opens a closed heading, steps from an open one to its first row, along a row's links, and no further", () => {
    expect(stopStep(pane, 1, "l")).toEqual({ toggle: 1 });
    expect(stopStep(pane, 2, "l")).toEqual({ focus: 3 });
    expect(stopStep(pane, 3, "l")).toEqual({ focus: 4 });
    expect(stopStep(pane, 4, "l")).toEqual({ focus: 5 });
    for (const at of [0, 5, 6, 7]) expect(stopStep(pane, at, "l"), String(at)).toBeUndefined();
    expect(stopStep(drawer, 0, "l")).toEqual({ focus: 1 });
  });

  it("h steps back along the links to the row, from any row to its heading, and collapses an open heading alone", () => {
    expect(stopStep(pane, 5, "h")).toEqual({ focus: 4 });
    expect(stopStep(pane, 4, "h")).toEqual({ focus: 3 });
    for (const at of [3, 6]) expect(stopStep(pane, at, "h")).toEqual({ focus: 2 });
    for (const at of [2, 7]) expect(stopStep(pane, at, "h")).toEqual({ toggle: at });
    for (const at of [0, 1]) expect(stopStep(pane, at, "h")).toBeUndefined();
    expect(stopStep(drawer, 1, "h")).toEqual({ focus: 0 });
  });
});
