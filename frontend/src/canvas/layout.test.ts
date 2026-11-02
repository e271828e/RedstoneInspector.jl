import { describe, expect, it } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { levelOf, REGION_PADDING, type BlockSize, type Level } from "../lib/level";
import { regionsOf } from "../lib/regions";
import { labelledPorts } from "../lib/wires";
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

describe("layoutLevel's type labels", () => {
  it.each(["closed_loop", "containers"])("%s's root: one box per labelled port, its size, placed from the port's point beside and below it", async (name) => {
    const m = fixtureModel(name);
    const l = levelOf(m.tree!, m.resolution!, "");
    const sizes = flatSizes(l);
    const labels = new Map(labelledPorts(m, l).map((p, i) => [p.port, { text: `T${i}`, width: 20 + i, height: 11 }]));
    const g = await layoutLevel(l, sizes, regionsOf(m.tree!, ""), labels);
    expect([...g.labels.keys()].sort()).toEqual([...labels.keys()].sort());
    for (const [port, box] of g.labels) {
      expect([box.width, box.height], port).toEqual([labels.get(port)!.width, labels.get(port)!.height]);
      // an offset from the port's point, never the level's coordinates: just right of the port and under its wire
      expect(box.x, port).toBeGreaterThanOrEqual(0);
      expect(box.x, port).toBeLessThan(box.width);
      expect(box.y, port).toBeGreaterThanOrEqual(0);
      expect(box.y, port).toBeLessThan(box.height);
    }
  });

  it("no labels given, none laid out", async () => {
    const m = fixtureModel("closed_loop");
    const l = levelOf(m.tree!, m.resolution!, "");
    expect((await layoutLevel(l, flatSizes(l))).labels.size).toBe(0);
  });
});
