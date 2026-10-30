import { describe, expect, it } from "vitest";
import { follow, nearest, type Box } from "./navigate";

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

  it("a closer box off the axis wins inside the quadrant and loses to a farther one on the axis once outside it", () => {
    const o: Box = { id: "o", x: 0, y: 0, width: 20, height: 20 };
    const far: Box = { id: "far", x: 200, y: 0, width: 20, height: 20 };
    // 60 right and 50 down: inside l's quadrant and closer than far
    expect(nearest([o, far, { id: "near", x: 60, y: 50, width: 20, height: 20 }], "o", "l")).toBe("near");
    // 60 right and 70 down: outside it, so far wins and j takes the near one
    const off: Box = { id: "near", x: 60, y: 70, width: 20, height: 20 };
    expect(nearest([o, far, off], "o", "l")).toBe("far");
    expect(nearest([o, far, off], "o", "j")).toBe("near");
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
