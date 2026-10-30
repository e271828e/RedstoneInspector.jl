import { describe, expect, it } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { levelOf, type BlockSize } from "../lib/level";
import { layoutLevel } from "./layout";
import { orthoRoute, rerouteTouching } from "./router";

describe("orthoRoute", () => {
  it("runs a forward route in four points through the midpoint", () => {
    expect(orthoRoute({ x: 0, y: 10 }, { x: 100, y: 50 })).toEqual([{ x: 0, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 50 }, { x: 100, y: 50 }]);
  });

  it("runs a backward route in six points, 12 below the taller box", () => {
    const r = orthoRoute({ x: 100, y: 10 }, { x: 0, y: 50 }, 80);
    expect(r).toHaveLength(6);
    expect(r[2].y).toBe(92);
    expect(r[3].y).toBe(92);
    expect(r).toEqual([{ x: 100, y: 10 }, { x: 112, y: 10 }, { x: 112, y: 92 }, { x: -12, y: 92 }, { x: -12, y: 50 }, { x: 0, y: 50 }]);
  });
});

describe("rerouteTouching", () => {
  it("on descent's root re-routes plant's three wires and keeps gear's wire to stop", async () => {
    const m = fixtureModel("descent");
    const l = levelOf(m.tree!, m.resolution!, "");
    const sizes = new Map<string, BlockSize>(l.blocks.map((b): [string, BlockSize] => [b.id, {
      width: 80, height: 60,
      ports: b.role === "in" ? [{ side: "out", name: b.name, x: 80, y: 11 }]
        : b.role === "out" ? [{ side: "in", name: b.name, x: 0, y: 11 }]
        : [...b.inputs.map((name, k) => ({ side: "in" as const, name, x: 0, y: 30 + 16 * k })),
           ...b.outputs.map((name, k) => ({ side: "out" as const, name, x: 80, y: 30 + 16 * k }))],
    }]));
    const g = await layoutLevel(l, sizes);
    const box = g.boxes.get("plant")!;
    const moved = { ...g, boxes: new Map(g.boxes).set("plant", { ...box, y: box.y + 200 }) };
    const routes = rerouteTouching(moved, l, sizes, "plant");
    const touching = l.wires.filter((w) => w.from.block === "plant" || w.to.block === "plant").map((w) => w.id);
    expect(touching.sort()).toEqual(["gear|in|h", "plant|in|δe", "plant|in|δt"].sort());
    for (const id of touching) expect(routes.get(id), id).not.toEqual(g.routes.get(id));
    expect(routes.get("stop|in|u")).toBe(g.routes.get("stop|in|u"));
    // every re-routed wire ends on its consumer's port
    const end = routes.get("plant|in|δe")!.at(-1)!;
    expect(end).toEqual({ x: box.x, y: box.y + 200 + 30 });
  });
});
