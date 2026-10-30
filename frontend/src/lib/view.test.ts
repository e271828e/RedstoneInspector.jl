import { describe, expect, it } from "vitest";
import { fitView, pan, toWorld, viewRect, zoomAt, type View } from "./view";

const viewport = { width: 1600, height: 1000 };

describe("zoomAt", () => {
  it.each([[2], [0.5], [1.1], [1 / 1.1]])("keeps the world point under the pointer, factor %d", (factor) => {
    const v: View = { x: -37.5, y: 120.25, scale: 0.8 };
    const pointer = { x: 412, y: 733 };
    const before = toWorld(v, pointer);
    const z = zoomAt(v, pointer, factor);
    const after = toWorld(z, pointer);
    expect(Math.abs(after.x - before.x)).toBeLessThan(1e-9);
    expect(Math.abs(after.y - before.y)).toBeLessThan(1e-9);
    expect(z.scale).toBeCloseTo(v.scale * factor, 12);
  });
});

describe("fitView", () => {
  const contains = (extent: { x: number; y: number; width: number; height: number }, v: View) => {
    const r = viewRect(v, viewport);
    expect(r.x).toBeLessThanOrEqual(extent.x);
    expect(r.y).toBeLessThanOrEqual(extent.y);
    expect(r.x + r.width).toBeGreaterThanOrEqual(extent.x + extent.width);
    expect(r.y + r.height).toBeGreaterThanOrEqual(extent.y + extent.height);
  };

  it("fits a wide extent by its width, centered", () => {
    const extent = { x: 10, y: 20, width: 3000, height: 400 };
    const v = fitView(extent, viewport, 20);
    contains(extent, v);
    expect(v.scale).toBeCloseTo((1600 - 40) / 3000, 12);
    const r = viewRect(v, viewport);
    expect(r.y + r.height / 2).toBeCloseTo(extent.y + extent.height / 2, 9);
  });

  it("fits a tall extent by its height, centered", () => {
    const extent = { x: -50, y: 0, width: 300, height: 2400 };
    const v = fitView(extent, viewport, 20);
    contains(extent, v);
    expect(v.scale).toBeCloseTo((1000 - 40) / 2400, 12);
    const r = viewRect(v, viewport);
    expect(r.x + r.width / 2).toBeCloseTo(extent.x + extent.width / 2, 9);
  });

  it("caps the scale at maxScale, the extent still centered", () => {
    const extent = { x: 0, y: 0, width: 200, height: 100 };
    const v = fitView(extent, viewport, 20, 2);
    expect(v.scale).toBe(2);
    const r = viewRect(v, viewport);
    expect(r.x + r.width / 2).toBeCloseTo(100, 9);
    expect(r.y + r.height / 2).toBeCloseTo(50, 9);
  });
});

describe("pan", () => {
  it("moves the view by the drag's screen pixels in world units at the current scale", () => {
    const v: View = { x: 100, y: -40, scale: 2.5 };
    const p = pan(v, 50, -30);
    expect(p.x).toBeCloseTo(100 - 50 / 2.5, 12);
    expect(p.y).toBeCloseTo(-40 + 30 / 2.5, 12);
    expect(p.scale).toBe(2.5);
    // the world point under a screen point moves with the drag
    const before = toWorld(v, { x: 300, y: 300 });
    const after = toWorld(p, { x: 350, y: 270 });
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
  });
});
