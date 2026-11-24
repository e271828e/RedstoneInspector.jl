import { describe, expect, it } from "vitest";
import type { KindMarker, PrimitiveFace, StructureSection } from "./descriptor";
import {
  classPhrase, detailOf, faceSelection, folderFacts, kindPhrase, levelFacts, memberKind, memberTitle, nodeFacts, pinFacts, portFacts,
  wireFacts,
  type FaceFacts, type LevelFacts, type NodeFacts,
} from "./detail";
import { fixtureModel } from "./fixtures";
import type { Model } from "./model";
import type { FramesTable } from "./timing";
import { buildResolution, type Face } from "./resolve";
import { buildTree } from "./tree";

const cl = fixtureModel("closed_loop");
const face = (path: string, side: "in" | "out", port: string): Face => ({ path, side, port });
const by = (faces: FaceFacts[], name: string) => faces.find((f) => f.name === name)!;

describe("kindPhrase", () => {
  it.each<[KindMarker, string]>([
    [{ kind: "boolean" }, "boolean"],
    [{ kind: "symbol" }, "symbol"],
    [{ kind: "integer" }, "integer"],
    [{ kind: "float" }, "float"],
    [{ kind: "number" }, "number"],
    [{ kind: "opaque" }, "opaque"],
    [{ kind: "enum", values: ["up", "down"] }, "enum {up, down}"],
    [{ kind: "vector", shape: [3], element: { kind: "float" } }, "vector 3 of float"],
    [{ kind: "vector", shape: [2, 3, 4], element: { kind: "integer" } }, "array 2×3×4 of integer"],
    [{ kind: "vector", shape: [2], element: { kind: "struct", fields: ["x", "y"] } }, "vector 2 of struct {x, y}"],
    [{ kind: "struct", fields: ["x", "y"] }, "struct {x, y}"],
  ])("%j reads %s", (k, phrase) => expect(kindPhrase(k)).toBe(phrase));

  it("kinds' eleven faces", () => {
    const m = fixtureModel("kinds");
    const phrases = Object.fromEntries([...m.tree!.byPath.values()].flatMap((n) =>
      n.class === "primitive" ? [...n.inputs, ...n.outputs].map((f) => [`${n.path}.${f.name}`, kindPhrase(f.kind)]) : []));
    expect(phrases).toEqual({
      "i.y": "integer", "r.y": "number", "v.y": "vector 2 of float", "mat.y": "array 2×2 of float",
      "nt.y": "struct {a, b}", "fn.y": "opaque", "g.gear": "enum {up, down}", "g.y": "float",
      "s.phase": "symbol", "p.phase": "symbol", "p.armed": "boolean",
    });
  });
});

/** A frames table's rows as the pane prints them: the frame, then the name and the pair with its unit. */
const cells = (t: FramesTable) => t.rows.map((r) => [r.frame, r.name, r.period, r.phase, r.unit]);

describe("a primitive's timing (deployment_overlay.md answer 10)", () => {
  it("timing_deployment's fast/outer/hold: the four frames of the record's example, and the chain under them, outermost first", () => {
    const r = nodeFacts(fixtureModel("timing_deployment"), "fast/outer/hold").timing!;
    expect(cells(r.table)).toEqual([
      ["scope", "fast/outer", "K = 3", "φ = 1", "ticks of fast/outer"],
      ["anchor", "A₂ (fast)", "m = 6", "c = 3", "ticks of A₂"],
      ["base grid", "", "D = 36", "Φ = 18", "base ticks"],
      ["seconds", "", "Δt = 3/25 s", "τ = 3/50 s", ""],
    ]);
    expect(r.chain).toBe("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → hold = Relative(3, 1)");
  });
  it("a build has no base grid row: timing's fast/outer/hold", () => {
    expect(cells(nodeFacts(fixtureModel("timing"), "fast/outer/hold").timing!.table).map((c) => c[0])).toEqual(["scope", "anchor", "seconds"]);
  });
  it("a component with its own anchor has no K and φ, so no scope row: timing's staggered", () => {
    expect(cells(nodeFacts(fixtureModel("timing"), "staggered").timing!.table).map((c) => c[0])).toEqual(["anchor", "seconds"]);
  });
  it("the explicit Relative(1) stays in the chain: timing's fast/outer/same", () => {
    expect(nodeFacts(fixtureModel("timing"), "fast/outer/same").timing!.chain).toBe("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → same = Relative(1, 0)");
  });
  it("on A₀ under no keyed assembly: the root's base ticks, m·Δt_base and c·Δt_base in a build's seconds row, library's d_pid", () => {
    const r = nodeFacts(fixtureModel("library"), "d_pid").timing!;
    expect(cells(r.table)).toEqual([
      ["scope", "the root", "K = 2", "φ = 1", "base ticks"],
      ["anchor", "A₀ (base)", "m = 2", "c = 1", "base ticks"],
      ["seconds", "", "Δt = 2·Δt_base", "τ = Δt_base", ""],
    ]);
    expect(r.chain).toBe("d_pid = Relative(2, 1)");
  });
  it("an empty chain has no line: library's d_lqr, kinds' discrete primitive", () => {
    expect(nodeFacts(fixtureModel("library"), "d_lqr").timing!.chain).toBeUndefined();
    const kinds = fixtureModel("kinds");
    const discrete = [...kinds.tree!.byPath.values()].find((n) => n.class === "primitive" && n.tier === "discrete")!;
    expect(cells(nodeFacts(kinds, discrete.path).timing!.table)[2]).toEqual(["seconds", "", "Δt = Δt_base", "τ = 0", ""]);
    expect(nodeFacts(kinds, discrete.path).timing!.chain).toBeUndefined();
  });
  it("a continuous primitive has no timing; the class phrase names the tier", () => {
    const p = nodeFacts(cl, "plant");
    expect(p.timing).toBeUndefined();
    expect(classPhrase(p.kind, p.tier)).toBe("primitive, continuous");
    expect(classPhrase("primitive", "discrete")).toBe("primitive, discrete");
    expect(classPhrase("assembly")).toBe("assembly");
  });
  it("the member row names the container's kind, the field alone for neither form", () => {
    expect([memberKind("transparent"), memberKind("keyed"), memberKind(undefined)]).toEqual(["transparent container", "keyed container", "field"]);
  });

  it("the member title explains the kind", () => {
    expect(memberTitle({ how: "transparent", field: "children", key: "plant" })).toMatch(/^Transparent: .*children.*plant/);
    expect(memberTitle({ how: "keyed", field: "gains", key: "a" })).toMatch(/^Keyed: .*gains\/a/);
  });
});

describe("closed_loop's elements", () => {
  it("the root level's facts: label, display name, counts, the root inputs as faces, no outputs, no timing", () => {
    const l = levelFacts(cl, "") as LevelFacts;
    expect([l.kind, l.path, l.segment, l.displayName, l.children, l.wires]).toEqual(["level", "", "closed_loop", "Group", 6, 30]);
    expect(l.inputs.map((f) => f.name)).toEqual(["h_ref", "V_ref", "mode"]);
    expect(l.outputs).toEqual([]);
    expect(by(l.inputs, "mode").phrase).toBe("boolean");
    expect(l.timing).toBeUndefined();
  });

  it("the open level carries its node's facts as a closed assembly's: the root's docstring, locations, parameters and faces' consumers", () => {
    const l = levelFacts(cl, "") as LevelFacts;
    const { kind, ...rest } = l;
    expect([kind, l.wires]).toEqual(["level", 30]);
    expect(rest).toEqual({ ...nodeFacts(cl, ""), kind: undefined });
    expect([!!l.docstring, l.locations.length, l.parameters.length, l.type]).toEqual([true, 5, 4, "Redstone.Group"]);
    expect(by(l.inputs, "h_ref").consumers).toEqual([face("pid_controller/h_ctl", "in", "r"), face("lqr_controller/z_ref_pack", "in", "in1")]);
    const pid = levelFacts(cl, "pid_controller") as LevelFacts;
    expect([pid.kind, pid.segment, pid.membership?.field]).toEqual(["level", "pid_controller", "children"]);
    expect(by(pid.inputs, "h_ref").producer).toEqual(face("", "in", "h_ref"));
  });

  it("plant's facts as a primitive: tier, membership, parameters, locations, each input's producer, each output's stage and consumers", () => {
    const p = nodeFacts(cl, "plant");
    expect([p.kind, p.segment, p.displayName, p.path, p.tier, p.timing, p.alias, p.type])
      .toEqual(["primitive", "plant", "Longitudinal", "plant", "continuous", undefined, undefined, "RedstoneExamples.Longitudinal"]);
    expect(p.membership).toEqual({ how: "transparent", field: "children", key: "plant" });
    expect([p.parameters.length, p.locations.length, !!p.docstring]).toEqual([14, 3, true]);
    expect(p.inputs.map((f) => [f.name, f.type, f.phrase, f.pinned])).toEqual([["δe", "Float64", "float", false], ["δt", "Float64", "float", false]]);
    expect(by(p.inputs, "δe").producer).toEqual(face("actuators/δe_lag", "out", "y"));
    expect(by(p.inputs, "δt").producer).toEqual(face("actuators/δt_lag", "out", "y"));
    expect(by(p.inputs, "δe").consumers).toBeUndefined();
    expect(p.outputs.map((f) => [f.name, f.type, f.phrase, f.stage])).toEqual(
      ["V", "γ", "θ", "q", "h", "α"].map((n) => [n, "Float64", "float", 1]));
    expect(by(p.outputs, "h").consumers).toEqual([face("sensing/altimeter", "in", "in1"), face("lqr_controller/state_pack", "in", "in5")]);
    expect(by(p.outputs, "α").consumers).toEqual([]);
    expect(by(p.outputs, "h").producer).toBeUndefined();
  });

  it("sensing/altimeter: the alias against the type", () => {
    const a = nodeFacts(cl, "sensing/altimeter");
    expect([a.alias, a.type, a.displayName]).toEqual(["Redstone.Library.SumJunction", "Redstone.Library.Junction", "SumJunction"]);
    expect(by(a.inputs, "in1").producer).toEqual(face("plant", "out", "h"));
    expect(by(a.outputs, "y").stage).toBe(2);
  });

  it("sensing's facts as a closed assembly: its child and wire counts, no tier or timing, its faces typed through the resolution", () => {
    const s = nodeFacts(cl, "sensing");
    expect([s.kind, s.displayName, s.children, s.wires, s.tier, s.timing]).toEqual(["assembly", "Group", 2, 3, undefined, undefined]);
    expect(s.inputs.map((f) => [f.name, f.type, f.phrase])).toEqual([["h", "Float64", "float"]]);
    expect(s.outputs.map((f) => [f.name, f.type, f.stage])).toEqual([["h_meas", "Float64", undefined]]);
    expect(by(s.inputs, "h").producer).toEqual(face("plant", "out", "h"));
  });

  it("the root wire into sensing|in|h: declared endpoints, terminal producer and consumers, type, phrase and level", () => {
    const w = wireFacts(cl, "", "sensing|in|h")!;
    expect([w.from, w.to]).toEqual([{ path: "plant", port: "h" }, { path: "sensing", port: "h" }]);
    expect(w.producer).toEqual(face("plant", "out", "h"));
    expect(w.consumers).toEqual([face("sensing/altimeter", "in", "in1")]);
    expect([w.type, w.phrase, w.level]).toEqual(["Float64", "float", ""]);
  });

  it("a wire into a primitive names the primitive input as its terminal consumer", () => {
    const w = wireFacts(cl, "sensing", "sensing/altimeter|in|in1")!;
    expect(w.from).toEqual({ path: "sensing", port: "h" });
    expect(w.consumers).toEqual([face("sensing/altimeter", "in", "in1")]);
    expect(w.producer).toEqual(face("plant", "out", "h"));
  });

  it("the root input h_ref as a pin and as its port: type, phrase, no pinned flag, its consumers, its root_inputs row, no producer", () => {
    const p = pinFacts(cl, "", "⟨in⟩h_ref")!;
    expect([p.kind, p.name, p.type, p.phrase, p.pinned]).toEqual(["pin", "h_ref", "Float64", "float", undefined]);
    expect(p.consumers).toEqual([face("pid_controller/h_ctl", "in", "r"), face("lqr_controller/z_ref_pack", "in", "in1")]);
    expect(p.rootInput?.name).toBe("h_ref");
    expect(p.producer).toBeUndefined();
    const q = portFacts(cl, "", "⟨in⟩h_ref|out|h_ref")!;
    expect([q.kind, q.consumers?.length, q.rootInput?.type, q.pinned]).toEqual(["port", 2, "Float64", undefined]);
  });

  it("the pinned flag on a primitive's own face alone: none on a root input, a primitive root's inputs included, none on any assembly face", () => {
    const prim = fixtureModel("primitive");
    expect(levelFacts(prim, "").inputs.map((f) => f.pinned)).toEqual([undefined, undefined]);
    expect(levelFacts(cl, "").inputs.map((f) => f.pinned)).toEqual([undefined, undefined, undefined]);
    expect(portFacts(cl, "pid_controller", "pid_controller/free|out|y")!.pinned).toBe(true);
    expect(portFacts(cl, "", "plant|out|V")!.pinned).toBe(false);
    // an assembly's faces: a closed one's port, a level's pin, whether a root input or a pinned or unpinned output feeds it
    expect(portFacts(cl, "", "sensing|out|h_meas")!.pinned).toBeUndefined();
    expect(portFacts(cl, "", "pid_controller|in|θ")!.pinned).toBeUndefined();
    expect(portFacts(cl, "", "pid_controller|in|h_ref")!.pinned).toBeUndefined();
    expect(pinFacts(cl, "pid_controller", "⟨in⟩h_ref")!.pinned).toBeUndefined();
    expect(pinFacts(cl, "pid_controller", "⟨out⟩δe")!.pinned).toBeUndefined();
    const kinds = fixtureModel("kinds");
    expect(levelFacts(kinds, "").outputs.map((f) => f.pinned)).toEqual(Array(9).fill(undefined));
    expect(pinFacts(kinds, "", "⟨out⟩i")!.pinned).toBeUndefined();
    expect(portFacts(kinds, "", "i|out|y")!.pinned).toBe(true);
    const lib = fixtureModel("library");
    const pinned = ["constant", "step", "source", "relay", "freeze"].map((p) => portFacts(lib, "", `${p}|out|y`)!.pinned);
    expect(pinned).toEqual([true, true, true, true, true]);
  });

  it("a primitive's input port names its producer", () => {
    const q = portFacts(cl, "sensing", "sensing/altimeter|in|in1")!;
    expect([q.face, q.producer, q.consumers]).toEqual([face("sensing/altimeter", "in", "in1"), face("plant", "out", "h"), undefined]);
  });

  it("detailOf dispatches on the selection", () => {
    expect(detailOf(cl, "", undefined)?.kind).toBe("level");
    expect(detailOf(cl, "", { level: "", target: { kind: "block", id: "plant" } })?.kind).toBe("primitive");
    expect(detailOf(cl, "", { level: "", target: { kind: "block", id: "sensing" } })?.kind).toBe("assembly");
    expect(detailOf(cl, "", { level: "", target: { kind: "block", id: "⟨in⟩mode" } })?.kind).toBe("pin");
    expect(detailOf(cl, "", { level: "", target: { kind: "wire", id: "sensing|in|h" } })?.kind).toBe("wire");
    expect(detailOf(cl, "", { level: "", target: { kind: "port", id: "plant|out|V" } })?.kind).toBe("port");
  });

  it("the open level's node selected shows the level layout", () => {
    expect(detailOf(cl, "", { level: "", target: { kind: "block", id: "" } })?.kind).toBe("level");
    expect(detailOf(cl, "sensing", { level: "", target: { kind: "block", id: "sensing" } })).toMatchObject({ kind: "level", path: "sensing" });
  });

  it("a face is selected as its port on its node's level, a root face as its pin", () => {
    expect(faceSelection(cl.tree!, face("sensing/altimeter", "in", "in1")))
      .toEqual({ level: "sensing", target: { kind: "port", id: "sensing/altimeter|in|in1" } });
    expect(faceSelection(cl.tree!, face("", "in", "h_ref"))).toEqual({ level: "", target: { kind: "block", id: "⟨in⟩h_ref" } });
  });
});

describe("other fixtures", () => {
  it("containers' folder gains holds keys a and b", () => {
    const c = fixtureModel("containers");
    expect(folderFacts(c, "gains")).toEqual({
      kind: "folder", path: "gains", parent: "", field: "gains", keys: [{ key: "a", path: "gains/a" }, { key: "b", path: "gains/b" }],
    });
    expect(folderFacts(c, "pair")?.keys).toEqual([{ key: "1", path: "pair/1" }]);
    expect(nodeFacts(c, "gains/a").membership).toEqual({ how: "keyed", field: "gains", key: "a" });
    expect(nodeFacts(c, "scale").membership).toBeUndefined();
  });

  it("rates' level fast is a rate scope, its timing with no chain", () => {
    const l = levelFacts(fixtureModel("rates"), "fast") as LevelFacts;
    expect([l.children, l.wires, l.inputs.map((f) => f.name), l.outputs.map((f) => f.name)]).toEqual([2, 4, ["in"], ["inner", "outer"]]);
    expect(l.timing?.table.rows.at(-1)).toMatchObject({ frame: "seconds", period: "Δt = 1/50 s", phase: "τ = 0" });
    expect(l.timing?.chain).toBeUndefined();
  });

  it("a keyed assembly's timing, open or closed, is its scope row's frames table and no chain: timing_deployment's fast/outer/deep against fast/outer, fast with no scope row; an unkeyed one has none", () => {
    const m = fixtureModel("timing_deployment");
    for (const facts of [levelFacts, nodeFacts]) {
      const deep = facts(m, "fast/outer/deep").timing!;
      expect(cells(deep.table)).toEqual([
        ["scope", "fast/outer", "K = 2", "φ = 1", "ticks of fast/outer"],
        ["anchor", "A₂ (fast)", "m = 4", "c = 3", "ticks of A₂"],
        ["base grid", "", "D = 24", "Φ = 18", "base ticks"],
        ["seconds", "", "Δt = 2/25 s", "τ = 3/50 s", ""],
      ]);
      expect(deep.chain).toBeUndefined();
      expect(cells(facts(m, "fast").timing!.table).map((c) => c[0])).toEqual(["anchor", "base grid", "seconds"]);
      expect(facts(m, "").timing).toBeUndefined();
    }
  });

  it("an assembly's facts count its own level's wires, open or closed", () => {
    const f = (name: string): PrimitiveFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
    const id = { type: "T", signature: "T", parameters: [] };
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [],
          wires: [{ from: { path: "", port: "x" }, to: { path: "L", port: "e" } }] },
        { ...id, path: "L", field: "L", class: "primitive", tier: "continuous", timing: { anchor: 0, m: 1, c: 0 }, rates: [], inputs: [f("e")], outputs: [] },
      ],
      root_inputs: [{ ...f("x"), pinned_by: [] }], anchors: [], scopes: [], grid: { pool: [], primes: [] }, types: [],
    };
    const tree = buildTree(structure);
    const one = { tree, structure, resolution: buildResolution(tree, structure) } as Model;
    expect([levelFacts(one, "").children, levelFacts(one, "").wires]).toEqual([1, 1]);
    const rates = fixtureModel("rates");
    expect([levelFacts(rates, "fast").children, levelFacts(rates, "fast").wires]).toEqual([2, 4]);
    expect([nodeFacts(rates, "fast").children, nodeFacts(rates, "fast").wires]).toEqual([2, 4]);
    expect([levelFacts(cl, "").children, levelFacts(cl, "").wires]).toEqual([6, 30]);
    expect([nodeFacts(cl, "plant").children, nodeFacts(cl, "plant").wires]).toEqual([undefined, undefined]);
  });

  it("a primitive root's level is the root itself, its segment the label", () => {
    const l = levelFacts(fixtureModel("primitive"), "") as NodeFacts;
    expect([l.kind, l.segment, l.displayName]).toEqual(["primitive", "primitive", "Plant"]);
  });
});
