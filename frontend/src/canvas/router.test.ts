import { describe, expect, it } from "vitest";
import { fixtureModel } from "../lib/fixtures";
import { levelOf, type BlockSize, type Level } from "../lib/level";
import { layoutLevel } from "./layout";
import { orthoRoute, producerStub, rerouteTouching, STUB } from "./router";

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

  it("leaves the producer by the stub it is given and enters the consumer by 12, backward and forward (the look pass, 1.3)", () => {
    const back = orthoRoute({ x: 100, y: 10 }, { x: 0, y: 50 }, 80, 40);
    expect(back[1]).toEqual({ x: 140, y: 10 });
    expect(back[4]).toEqual({ x: -12, y: 50 });
    // forward, the midpoint nearer the producer than its stub moves out to the stub
    expect(orthoRoute({ x: 0, y: 10 }, { x: 60, y: 50 }, undefined, 40)).toEqual([{ x: 0, y: 10 }, { x: 40, y: 10 }, { x: 40, y: 50 }, { x: 60, y: 50 }]);
  });

  it("runs forward from a gap of 24 whatever the stub, turning toward the consumer to clear the stub where the gap allows and never nearer the consumer than 12; below 24 backward by the whole stub (the look pass's review, F2)", () => {
    expect(orthoRoute({ x: 0, y: 10 }, { x: 50, y: 50 }, 80, 40)).toEqual([{ x: 0, y: 10 }, { x: 38, y: 10 }, { x: 38, y: 50 }, { x: 50, y: 50 }]);
    expect(orthoRoute({ x: 0, y: 10 }, { x: 24, y: 50 }, 80, 40)).toEqual([{ x: 0, y: 10 }, { x: 12, y: 10 }, { x: 12, y: 50 }, { x: 24, y: 50 }]);
    const back = orthoRoute({ x: 0, y: 10 }, { x: 23, y: 50 }, 80, 40);
    expect(back).toHaveLength(6);
    expect(back[1]).toEqual({ x: 40, y: 10 });
  });

  it("takes a producer's stub past its type label's far end by 4, 12 at least and 12 with no label (the look pass, 1.3)", () => {
    expect(producerStub(undefined)).toBe(STUB);
    expect(producerStub({ x: 2, y: 3, width: 30, height: 11 })).toBe(36);
    expect(producerStub({ x: 0, y: 3, width: 5, height: 11 })).toBe(STUB);
  });
});

/** Every block of a level at 80 by 60, its ports on the west and east edges, as no text is measured here. */
const flatSizes = (l: Level) => new Map<string, BlockSize>(l.blocks.map((b): [string, BlockSize] => [b.id, {
  width: 80, height: 60,
  ports: b.role === "in" ? [{ side: "out", name: b.name, x: 80, y: 11 }]
    : b.role === "out" ? [{ side: "in", name: b.name, x: 0, y: 11 }]
    : [...b.inputs.map((name, k) => ({ side: "in" as const, name, x: 0, y: 30 + 16 * k })),
       ...b.outputs.map((name, k) => ({ side: "out" as const, name, x: 80, y: 30 + 16 * k }))],
}]));

describe("rerouteTouching", () => {
  it("on closed_loop's root drops the junction points of plant's wires and keeps every other wire's", async () => {
    const m = fixtureModel("closed_loop");
    const l = levelOf(m.tree!, m.resolution!, "");
    const sizes = flatSizes(l);
    const g = await layoutLevel(l, sizes);
    const touching = new Set(l.wires.filter((w) => w.from.block === "plant" || w.to.block === "plant").map((w) => w.id));
    const before = [...g.junctions.keys()];
    expect(before.some((id) => touching.has(id)), "a plant wire with junctions").toBe(true);
    expect(before.some((id) => !touching.has(id)), "another wire with junctions").toBe(true);
    const box = g.boxes.get("plant")!;
    const { junctions } = rerouteTouching({ ...g, boxes: new Map(g.boxes).set("plant", { ...box, y: box.y + 200 }) }, l, sizes, "plant", false);
    for (const id of before) {
      if (touching.has(id)) expect(junctions.has(id), id).toBe(false);
      else expect(junctions.get(id), id).toBe(g.junctions.get(id));
    }
  });

  /** closed_loop's root laid out with a `Float64` label on the actuators' port feeding plant, plant moved to `x`. */
  async function plantMoved(x: (actuators: { x: number; width: number }) => number) {
    const m = fixtureModel("closed_loop");
    const l = levelOf(m.tree!, m.resolution!, "");
    const sizes = flatSizes(l);
    const wire = l.wires.find((w) => w.from.block === "actuators" && w.to.block === "plant")!;
    const port = `actuators|out|${wire.from.port}`;
    const g = await layoutLevel(l, sizes, [], new Map([[port, { text: "Float64", width: 30, height: 11 }]]));
    const label = g.labels.get(port)!;
    const box = g.boxes.get("plant")!, act = g.boxes.get("actuators")!;
    const moved = { ...g, boxes: new Map(g.boxes).set("plant", { ...box, x: x(act) }) };
    return { label, route: (labels: boolean) => rerouteTouching(moved, l, sizes, "plant", labels).routes.get(wire.id)! };
  }

  it("on closed_loop's root a backward wire out of actuators, plant dragged left, leaves by a stub past its drawn type label and enters plant by 12 (the look pass, 1.3)", async () => {
    const { label, route } = await plantMoved((act) => act.x - 200);
    expect(label, "the layout keeps the label's box").toBeDefined();
    const r = route(true);
    expect(r, "the wire runs backward").toHaveLength(6);
    expect(r[1].x - r[0].x).toBe(Math.max(STUB, Math.max(0, label.x) + label.width + 4));
    expect(r[1].x - r[0].x).toBeGreaterThan(STUB);
    expect(r[5].x - r[4].x).toBe(STUB);
  });

  it("on closed_loop's root the same backward wire leaves by 12 where no label is drawn (the look pass's review, F3)", async () => {
    const r = (await plantMoved((act) => act.x - 200)).route(false);
    expect(r).toHaveLength(6);
    expect(r[1].x - r[0].x).toBe(STUB);
  });

  it("on closed_loop's root, plant dragged 30 units right of actuators, the wire runs forward in four points, turning 12 short of plant, the label drawn or not (the look pass's review, F2)", async () => {
    const { route } = await plantMoved((act) => act.x + act.width + 30);
    for (const labels of [true, false]) {
      const r = route(labels);
      expect(r, `labels ${labels}`).toHaveLength(4);
      expect(r[3].x - r[0].x).toBe(30);
      expect(r[1].x).toBe(r[2].x);
      expect(r[3].x - r[2].x).toBe(labels ? STUB : 15);
    }
  });

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
    const { routes } = rerouteTouching(moved, l, sizes, "plant", false);
    const touching = l.wires.filter((w) => w.from.block === "plant" || w.to.block === "plant").map((w) => w.id);
    expect(touching.sort()).toEqual(["gear|in|h", "plant|in|δe", "plant|in|δt"].sort());
    for (const id of touching) expect(routes.get(id), id).not.toEqual(g.routes.get(id));
    expect(routes.get("stop|in|u")).toBe(g.routes.get("stop|in|u"));
    // every re-routed wire ends on its consumer's port
    const end = routes.get("plant|in|δe")!.at(-1)!;
    expect(end).toEqual({ x: box.x, y: box.y + 200 + 30 });
  });
});
