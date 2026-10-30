import { describe, expect, it } from "vitest";
import type { AssemblyNode, LeafNode } from "./descriptor";
import { fixtureModel } from "./fixtures";
import { elkGraph, inPinId, levelOf, outPinId, parsePortId, portId, type BlockSize, type Level } from "./level";

const level = (name: string, path = ""): Level => {
  const m = fixtureModel(name);
  return levelOf(m.tree!, m.resolution!, path);
};
const STRUCTURES = ["aircraft", "descent", "closed_loop", "closed_loop_deployment", "containers", "primitive", "kinds", "rates", "large", "failure_cycle"];

describe("the root level", () => {
  it.each([
    ["aircraft", 3, 2], ["descent", 5, 4], ["closed_loop", 9, 30], ["closed_loop_deployment", 9, 30], ["containers", 8, 7],
    ["kinds", 9, 1], ["rates", 6, 5], ["large", 156, 323], ["failure_cycle", 5, 5],
  ] as const)("%s: %i blocks, %i wires", (name, blocks, wires) => {
    const l = level(name);
    expect(l.blocks).toHaveLength(blocks);
    expect(l.wires).toHaveLength(wires);
  });

  it("orders input pins, children in walk order, output pins", () => {
    const m = fixtureModel("rates");
    expect(levelOf(m.tree!, m.resolution!, "").blocks.map((b) => b.id))
      .toEqual(["src", "fast", "slow", outPinId("inner"), outPinId("outer"), outPinId("slow")]);
    expect(level("descent").blocks.map((b) => b.role)).toEqual(["in", "in", "leaf", "leaf", "leaf"]);
  });

  it("flags the root's input pins, and no inner level's", () => {
    const pins = level("closed_loop").blocks.filter((b) => b.role === "in");
    expect(pins.map((b) => b.role === "in" && b.rootInput)).toEqual([true, true, true]);
    const inner = level("closed_loop", "sensing").blocks.filter((b) => b.role === "in");
    expect(inner.map((b) => b.role === "in" && b.rootInput)).toEqual([false]);
  });

  it("gives a child its segment, display name, class, tier and face names", () => {
    const b = level("closed_loop", "sensing").blocks.find((x) => x.id === "sensing/altimeter")!;
    expect(b).toMatchObject({ role: "leaf", path: "sensing/altimeter", segment: "altimeter", displayName: "SumJunction", tier: "continuous" });
    const g = level("containers").blocks.find((x) => x.id === "gains/a")!;
    expect(g).toMatchObject({ segment: "gains/a", inputs: ["e"], outputs: ["out"] });
    expect(level("closed_loop").blocks.find((x) => x.id === "sensing")).toMatchObject({ role: "assembly", inputs: ["h"], outputs: ["h_meas"] });
  });

  it("maps a boundary endpoint to its pin", () => {
    const l = level("containers");
    expect(l.wires.find((w) => w.from.block === inPinId("u"))).toEqual({
      id: portId("gains/a", "in", "e"), from: { block: inPinId("u"), port: "u" }, to: { block: "gains/a", port: "e" },
    });
    expect(l.wires.find((w) => w.to.block === outPinId("y"))!.from).toEqual({ block: "scale", port: "out" });
  });
});

describe("every level", () => {
  it.each(STRUCTURES)("%s: wire keys are unique and every end is a block's port", (name) => {
    const m = fixtureModel(name);
    for (const n of m.structure!.nodes) {
      if (n.class !== "assembly") continue;
      const l = levelOf(m.tree!, m.resolution!, n.path);
      expect(new Set(l.wires.map((w) => w.id)).size).toBe(l.wires.length);
      const ports = new Set(l.blocks.flatMap((b) => b.role === "in" ? [portId(b.id, "out", b.name)]
        : b.role === "out" ? [portId(b.id, "in", b.name)]
        : [...b.inputs.map((p) => portId(b.id, "in", p)), ...b.outputs.map((p) => portId(b.id, "out", p))]));
      for (const w of l.wires) {
        expect(ports).toContain(portId(w.from.block, "out", w.from.port));
        expect(ports).toContain(portId(w.to.block, "in", w.to.port));
        expect(w.id).toBe(portId(w.to.block, "in", w.to.port));
      }
    }
  });

  it("closed_loop: pid_controller 16 blocks and 22 wires, lqr_controller 21 and 21", () => {
    expect([level("closed_loop", "pid_controller").blocks.length, level("closed_loop", "pid_controller").wires.length]).toEqual([16, 22]);
    expect([level("closed_loop", "lqr_controller").blocks.length, level("closed_loop", "lqr_controller").wires.length]).toEqual([21, 21]);
  });

  it("large: ten child assemblies of 4 blocks and 3 wires", () => {
    const m = fixtureModel("large");
    const inner = m.structure!.nodes.filter((n): n is AssemblyNode => n.class === "assembly" && n.path !== "");
    expect(inner).toHaveLength(10);
    for (const a of inner) {
      const l = levelOf(m.tree!, m.resolution!, a.path);
      expect([l.blocks.length, l.wires.length]).toEqual([4, 3]);
    }
  });

  it("primitive: the leaf with a pin and a wire per face", () => {
    const m = fixtureModel("primitive");
    const l = levelOf(m.tree!, m.resolution!, "");
    expect(l.blocks).toEqual([
      { id: inPinId("u"), role: "in", name: "u", rootInput: true },
      { id: inPinId("d"), role: "in", name: "d", rootInput: true },
      {
        id: "", role: "leaf", path: "", segment: "", displayName: "Plant", tier: (m.tree!.root as LeafNode).tier,
        inputs: ["u", "d"], outputs: ["y", "power"],
      },
      { id: outPinId("y"), role: "out", name: "y" },
      { id: outPinId("power"), role: "out", name: "power" },
    ]);
    expect(l.wires).toEqual([
      { id: portId("", "in", "u"), from: { block: inPinId("u"), port: "u" }, to: { block: "", port: "u" } },
      { id: portId("", "in", "d"), from: { block: inPinId("d"), port: "d" }, to: { block: "", port: "d" } },
      { id: portId(outPinId("y"), "in", "y"), from: { block: "", port: "y" }, to: { block: outPinId("y"), port: "y" } },
      { id: portId(outPinId("power"), "in", "power"), from: { block: "", port: "power" }, to: { block: outPinId("power"), port: "power" } },
    ]);
  });

  it("refuses a path that is no level", () => {
    const m = fixtureModel("descent");
    const leaf = m.structure!.nodes.find((n) => n.class === "leaf")!.path;
    expect(() => levelOf(m.tree!, m.resolution!, leaf)).toThrow(/leaf/);
    expect(() => levelOf(m.tree!, m.resolution!, "nowhere")).toThrow(/no node/);
  });
});

describe("elkGraph", () => {
  const l = level("descent");
  // Sizes as the canvas will measure them; any numbers do here.
  const sizes = new Map<string, BlockSize>(l.blocks.map((b, i): [string, BlockSize] => [b.id, {
    width: 80 + i, height: 40,
    ports: b.role === "in" ? [{ side: "out", name: b.name, x: 80 + i, y: 20 }]
      : b.role === "out" ? [{ side: "in", name: b.name, x: 0, y: 20 }]
      : [...b.inputs.map((name, k) => ({ side: "in" as const, name, x: 0, y: 30 + 16 * k })),
         ...b.outputs.map((name, k) => ({ side: "out" as const, name, x: 80 + i, y: 30 + 16 * k }))],
  }]));
  const g = elkGraph(l, sizes);

  it("has one child per block, sized from the map", () => {
    expect(g.children).toHaveLength(5);
    expect(g.children!.map((c) => [c.id, c.width, c.height])).toEqual(l.blocks.map((b, i) => [b.id, 80 + i, 40]));
  });

  it("pins input pins first and output pins last", () => {
    for (const c of g.children!) {
      const role = l.blocks.find((b) => b.id === c.id)!.role;
      const constraint = c.layoutOptions!["elk.layered.layering.layerConstraint"];
      expect(constraint).toBe(role === "in" ? "FIRST_SEPARATE" : role === "out" ? "LAST_SEPARATE" : undefined);
    }
    expect(g.children!.filter((c) => c.layoutOptions!["elk.layered.layering.layerConstraint"] === "FIRST_SEPARATE")).toHaveLength(2);
  });

  it("fixes every port with its side", () => {
    for (const c of g.children!) {
      expect(c.layoutOptions!["elk.portConstraints"]).toBe("FIXED_POS");
      const expected = sizes.get(c.id)!.ports.map((p) => [portId(c.id, p.side, p.name), p.x, p.y, p.side === "in" ? "WEST" : "EAST"]);
      expect(c.ports!.map((p) => [p.id, p.x, p.y, p.layoutOptions!["elk.port.side"]])).toEqual(expected);
    }
  });

  it("joins 4 edges port to port", () => {
    const ports = new Set(g.children!.flatMap((c) => c.ports!.map((p) => p.id)));
    expect(g.edges).toHaveLength(4);
    for (const e of g.edges!) {
      expect(e.sources).toHaveLength(1);
      expect(ports).toContain(e.sources[0]);
      expect(ports).toContain(e.targets[0]);
    }
    expect(g.edges!.map((e) => e.id)).toEqual(l.wires.map((w) => w.id));
  });

  it("keeps the spike's root options, packs components in model order and breaks cycles greedily with model order as the tie-break", () => {
    expect(g.layoutOptions).toMatchObject({
      "elk.algorithm": "layered", "elk.direction": "RIGHT", "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.considerModelOrder.components": "MODEL_ORDER",
      "elk.layered.cycleBreaking.strategy": "GREEDY_MODEL_ORDER",
    });
  });

  it("containers: pins its input pin first and its output pin last, every port on its side", () => {
    const c = level("containers");
    const pinSizes = new Map<string, BlockSize>(c.blocks.map((b): [string, BlockSize] => [b.id, {
      width: 80, height: 40,
      ports: b.role === "in" ? [{ side: "out", name: b.name, x: 80, y: 20 }]
        : b.role === "out" ? [{ side: "in", name: b.name, x: 0, y: 20 }]
        : [...b.inputs.map((name) => ({ side: "in" as const, name, x: 0, y: 20 })),
           ...b.outputs.map((name) => ({ side: "out" as const, name, x: 80, y: 20 }))],
    }]));
    const children = elkGraph(c, pinSizes).children!;
    const constraint = (role: string) => children.filter((n) => c.blocks.find((b) => b.id === n.id)!.role === role)
      .map((n) => [n.id, n.layoutOptions!["elk.layered.layering.layerConstraint"]]);
    expect(constraint("in")).toEqual([[inPinId("u"), "FIRST_SEPARATE"]]);
    expect(constraint("out")).toEqual([[outPinId("y"), "LAST_SEPARATE"]]);
    for (const n of children) {
      expect(n.ports!.map((p) => p.layoutOptions!["elk.port.side"]))
        .toEqual(pinSizes.get(n.id)!.ports.map((p) => (p.side === "in" ? "WEST" : "EAST")));
    }
  });
});

describe("parsePortId", () => {
  it("reads a port id's block, side and name back from its end", () => {
    expect(parsePortId(portId("sensing/altimeter", "in", "in1"))).toEqual({ block: "sensing/altimeter", side: "in", name: "in1" });
    expect(parsePortId(portId(inPinId("h_ref"), "out", "h_ref"))).toEqual({ block: "⟨in⟩h_ref", side: "out", name: "h_ref" });
  });
});
