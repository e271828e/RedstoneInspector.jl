import { describe, expect, it } from "vitest";
import type { AssemblyNode, LeafFace, LeafNode, StructureSection } from "./descriptor";
import { fixtureModel } from "./fixtures";
import { buildTree } from "./tree";
import { buildResolution, faceInfo, route, terminalConsumers, terminalProducer, wireFaces, wireRoute, type Face, type Resolution, type Route } from "./resolve";

const res = (name: string): Resolution => fixtureModel(name).resolution!;
const nodes = (r: Resolution) => [...r.tree.byPath.values()];
const assemblies = (r: Resolution) => nodes(r).filter((n): n is AssemblyNode => n.class === "assembly");
const leaves = (r: Resolution) => nodes(r).filter((n): n is LeafNode => n.class === "leaf");
const face = (path: string, side: "in" | "out", port: string): Face => ({ path, side, port });

/** Tallies each face's terminal, by the kind of face and the kind of terminal. */
function tally(r: Resolution): Record<string, number> {
  const t: Record<string, number> = {};
  const add = (k: string) => (t[k] = (t[k] ?? 0) + 1);
  let deepest = 0;
  const resolve = (f: Face, what: string) => {
    const p = terminalProducer(r, f);
    add(`${what}->${p?.end ?? "none"}`);
    deepest = Math.max(deepest, p?.chain.length ?? 0);
  };
  for (const a of assemblies(r)) {
    for (const f of a.inputs) a.path === "" ? add("root-input-face") : resolve(face(a.path, "in", f.name), "asm-in");
    for (const f of a.outputs) resolve(face(a.path, "out", f.name), "asm-out");
  }
  for (const l of leaves(r)) for (const f of l.inputs) resolve(face(l.path, "in", f.name), "leaf-in");
  return { ...t, deepest };
}

describe("the resolution", () => {
  it("closed_loop: 42 assembly faces and every leaf input resolve", () => {
    expect(tally(res("closed_loop"))).toEqual({
      "root-input-face": 3,
      "asm-out->leaf-output": 11,
      "asm-in->leaf-output": 21,
      "asm-in->root-input": 7,
      "leaf-in->leaf-output": 44,
      "leaf-in->root-input": 11,
      deepest: 3,
    });
  });

  it("rates: 7 assembly output faces resolve, the deepest in 4 hops", () => {
    const t = tally(res("rates"));
    expect(t["asm-out->leaf-output"]).toBe(7);
    expect(t.deepest).toBe(4);
    const p = terminalProducer(res("rates"), face("", "out", "outer"))!;
    expect(p.chain).toEqual([face("", "out", "outer"), face("fast", "out", "outer"), face("fast/outer", "out", "out"), face("fast/outer/hold", "out", "out")]);
  });

  it("large: 313 leaf inputs to leaf outputs, 18 to root inputs, 12 assembly outputs", () => {
    const t = tally(res("large"));
    expect(t["leaf-in->leaf-output"]).toBe(313);
    expect(t["leaf-in->root-input"]).toBe(18);
    expect(t["asm-out->leaf-output"]).toBe(12);
    expect(Object.keys(t).filter((k) => k.endsWith("none"))).toEqual([]);
  });

  it("primitive: both inputs resolve to root inputs", () => {
    const r = res("primitive");
    for (const port of ["u", "d"]) {
      expect(terminalProducer(r, face("", "in", port))).toEqual({ face: face("", "in", port), end: "root-input", chain: [face("", "in", port)] });
    }
  });

  it("keeps an assembly's input and output faces of one name apart", () => {
    // A's input face x and output face x share a name; only the side tells them apart.
    const f = (name: string): LeafFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
    const id = { type: "T", signature: "T", parameters: [] };
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [],
          wires: [{ from: { path: "", port: "x" }, to: { path: "A", port: "x" } }] },
        { ...id, path: "A", field: "A", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "x" }],
          wires: [{ from: { path: "A", port: "x" }, to: { path: "A/L", port: "e" } }, { from: { path: "A/L", port: "o" }, to: { path: "A", port: "x" } }] },
        { ...id, path: "A/L", field: "L", class: "leaf", tier: "continuous", timing: { anchor: 0, m: 1, c: 0 }, inputs: [f("e")], outputs: [f("o")] },
      ],
      root_inputs: [f("x")], anchors: [], scopes: [], types: [],
    };
    const r = buildResolution(buildTree(structure), structure);
    expect(terminalProducer(r, face("A", "in", "x"))!.face).toEqual(face("", "in", "x"));
    expect(terminalProducer(r, face("A", "out", "x"))!.face).toEqual(face("A/L", "out", "o"));
    expect(terminalConsumers(r, face("", "in", "x"))).toEqual([face("A/L", "in", "e")]);
  });
});

describe("faceInfo", () => {
  const r = res("closed_loop");
  const altimeter = r.tree.byPath.get("sensing/altimeter") as LeafNode;
  it("types an assembly output face from the leaf output behind it", () => {
    const leafFace = altimeter.outputs.find((f) => f.name === "y")!;
    expect(faceInfo(r, "sensing", "out", "h_meas")).toEqual(leafFace);
    expect(leafFace).toMatchObject({ type: "Float64", kind: { kind: "float" } });
  });
  it("types an assembly input face from the producer feeding it", () => {
    const plant = r.tree.byPath.get("plant") as LeafNode;
    expect(faceInfo(r, "sensing", "in", "h")).toEqual(plant.outputs.find((f) => f.name === "h"));
  });
  it("types a root input from root_inputs", () => {
    expect(faceInfo(r, "", "in", "mode")).toEqual(r.structure.root_inputs[2]);
    expect(faceInfo(r, "", "in", "mode")).toMatchObject({ name: "mode", kind: { kind: "boolean" } });
  });
  it("types a leaf's face from its own entry", () => {
    expect(faceInfo(r, "sensing/altimeter", "in", "in1")).toEqual(altimeter.inputs.find((f) => f.name === "in1"));
  });
});

/** The routes of every leaf output and root input. */
function producerRoutes(r: Resolution): Route[] {
  const starts = [
    ...leaves(r).flatMap((l) => l.outputs.map((f) => face(l.path, "out", f.name))),
    ...r.structure.root_inputs.map((f) => face("", "in", f.name)),
  ];
  return starts.map((f) => route(r, f.path, f.side, f.port)!);
}
const rootInputConsumers = (r: Resolution) =>
  r.structure.root_inputs.reduce((sum, f) => sum + terminalConsumers(r, face("", "in", f.name)).length, 0);

describe("routes", () => {
  // Every terminal consumer is reached once, from its one terminal producer.
  it.each([
    ["aircraft", 2], ["descent", 4], ["closed_loop", 55], ["closed_loop_deployment", 55], ["containers", 7],
    ["primitive", 0], ["kinds", 10], ["rates", 6], ["large", 333], ["failure_cycle", 5], ["library", 40],
  ] as const)("%s: the producers' routes reach %i consumers", (name, n) => {
    expect(producerRoutes(res(name)).reduce((sum, rt) => sum + rt.consumers.length, 0)).toBe(n);
  });

  it("closed_loop: the root inputs reach 11 consumers, the largest fan-out is 7", () => {
    const r = res("closed_loop");
    expect(rootInputConsumers(r)).toBe(11);
    expect(Math.max(...producerRoutes(r).map((rt) => rt.consumers.length))).toBe(7);
  });

  it("closed_loop: plant's h reaches two consumers across three levels", () => {
    const rt = route(res("closed_loop"), "plant", "out", "h")!;
    expect(rt.consumers).toEqual([face("sensing/altimeter", "in", "in1"), face("lqr_controller/state_pack", "in", "in5")]);
    expect(rt.wires.map((w) => w.level)).toEqual(["", "sensing", "", "lqr_controller"]);
    expect(rt.levels).toEqual(new Set(["", "sensing", "lqr_controller"]));
  });

  it("containers: u reaches one consumer, the root output's route ends at one leaf output", () => {
    const r = res("containers");
    expect(terminalConsumers(r, face("", "in", "u"))).toEqual([face("gains/a", "in", "e")]);
    const rt = route(r, "", "out", "y")!;
    expect(rt.producer).toEqual(face("scale", "out", "out"));
    expect(rt.consumers).toEqual([face("", "out", "y")]);
  });

  it("large: 18 root-input consumers and two root outputs, 20 root-face routes", () => {
    const r = res("large");
    const outs = (r.tree.root as AssemblyNode).outputs;
    expect(rootInputConsumers(r)).toBe(18);
    expect(outs).toHaveLength(2);
    for (const f of outs) expect(terminalProducer(r, face("", "out", f.name))?.end).toBe("leaf-output");
    expect(rootInputConsumers(r) + outs.length).toBe(20);
  });

  it("rates: three root-face routes, the outer one across three levels", () => {
    const r = res("rates");
    const outs = (r.tree.root as AssemblyNode).outputs;
    expect(r.structure.root_inputs).toHaveLength(0);
    expect(outs.map((f) => route(r, "", "out", f.name)?.end)).toEqual(["leaf-output", "leaf-output", "leaf-output"]);
    const rt = route(r, "", "out", "outer")!;
    expect(rt.consumers).toEqual([face("", "out", "outer")]);
    expect(rt.levels).toEqual(new Set(["fast/outer", "fast", ""]));
  });

  it("rates: the source's route fans out through every level", () => {
    const rt = route(res("rates"), "src", "out", "out")!;
    expect(rt.consumers).toEqual([face("fast/inner", "in", "in"), face("fast/outer/hold", "in", "in"), face("slow/hold", "in", "in")]);
    expect(rt.levels.size).toBe(4);
  });

  it.each(["closed_loop", "rates", "containers"])("%s: a wire's route is its producer face's, and its consumer's", (name) => {
    const r = res(name);
    for (const a of assemblies(r)) {
      for (const w of a.wires) {
        const { from, to } = wireFaces(a.path, w);
        const rt = wireRoute(r, a.path, w);
        expect(rt).toEqual(route(r, from.path, from.side, from.port));
        expect(rt).toEqual(route(r, to.path, to.side, to.port));
      }
    }
  });
});
