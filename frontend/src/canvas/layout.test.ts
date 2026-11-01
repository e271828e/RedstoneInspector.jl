import { describe, expect, it } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { levelOf, REGION_PADDING, type BlockSize, type Level } from "../lib/level";
import { regionsOf } from "../lib/regions";
import { layoutLevel } from "./layout";

/** Every block at 80 by 60, its ports on the west and east edges. */
const flatSizes = (l: Level) => new Map<string, BlockSize>(l.blocks.map((b): [string, BlockSize] => [b.id, {
  width: 80, height: 60,
  ports: b.role === "in" ? [{ side: "out", name: b.name, x: 80, y: 11 }]
    : b.role === "out" ? [{ side: "in", name: b.name, x: 0, y: 11 }]
    : [...b.inputs.map((name, k) => ({ side: "in" as const, name, x: 0, y: 30 + 16 * k })),
       ...b.outputs.map((name, k) => ({ side: "out" as const, name, x: 80, y: 30 + 16 * k }))],
}]));

describe("layoutLevel with regions", () => {
  it("containers' root: members in the level's coordinates, inside their region's box, every route from port to port", async () => {
    const m = fixtureModel("containers");
    const l = levelOf(m.tree!, m.resolution!, "");
    const sizes = flatSizes(l);
    const regions = regionsOf(m.tree!, "");
    const g = await layoutLevel(l, sizes, regions);
    expect([...g.regions.keys()]).toEqual(["gains", "pair"]);
    for (const r of regions) {
      const box = g.regions.get(r.path)!;
      const xs = r.members.map((p) => g.boxes.get(p)!);
      // the region's box is exactly its members' union grown by the padding
      expect(Math.min(...xs.map((b) => b.x)) - REGION_PADDING.left).toBe(box.x);
      expect(Math.min(...xs.map((b) => b.y)) - REGION_PADDING.top).toBe(box.y);
      expect(Math.max(...xs.map((b) => b.x + b.width)) + REGION_PADDING.right).toBe(box.x + box.width);
      expect(Math.max(...xs.map((b) => b.y + b.height)) + REGION_PADDING.bottom).toBe(box.y + box.height);
    }
    expect(g.boxes.size).toBe(l.blocks.length);
    // every route, the one inside gains included, starts at its producer's port and ends at its consumer's
    for (const w of l.wires) {
      const route = g.routes.get(w.id)!;
      const port = (block: string, side: "in" | "out", name: string) => {
        const b = g.boxes.get(block)!, p = sizes.get(block)!.ports.find((q) => q.side === side && q.name === name)!;
        return { x: b.x + p.x, y: b.y + p.y };
      };
      expect(route[0], w.id).toEqual(port(w.from.block, "out", w.from.port));
      expect(route.at(-1), w.id).toEqual(port(w.to.block, "in", w.to.port));
    }
  });

  it("a level with no region keeps no region box", async () => {
    const m = fixtureModel("descent");
    const l = levelOf(m.tree!, m.resolution!, "");
    expect((await layoutLevel(l, flatSizes(l), regionsOf(m.tree!, ""))).regions.size).toBe(0);
  });
});
