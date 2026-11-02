import { describe, expect, it } from "vitest";
import type { KindMarker, LeafFace, StructureSection } from "./descriptor";
import {
  classPhrase, detailOf, faceSelection, folderFacts, kindPhrase, levelFacts, levelLine, memberKind, memberTitle, nodeFacts, pinFacts, portFacts,
  ratePhrase, timingPhrase, wireFacts,
  type FaceFacts, type LevelFacts, type NodeFacts,
} from "./detail";
import { fixtureModel } from "./fixtures";
import type { Model } from "./model";
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
      n.class === "leaf" ? [...n.inputs, ...n.outputs].map((f) => [`${n.path}.${f.name}`, kindPhrase(f.kind)]) : []));
    expect(phrases).toEqual({
      "i.y": "integer", "r.y": "number", "v.y": "vector 2 of float", "mat.y": "array 2×2 of float",
      "nt.y": "struct {a, b}", "fn.y": "opaque", "g.gear": "enum {up, down}", "g.y": "float",
      "s.phase": "symbol", "p.phase": "symbol", "p.armed": "boolean",
    });
  });
});

describe("timingPhrase", () => {
  it("anchor 0 is the base grid", () => {
    expect(timingPhrase({ anchor: 0, m: 1, c: 0 }, [])).toBe("the base grid, m 1, c 0");
  });
  it("rates' fast/outer/hold hangs from anchor fast at m 2, T 1/50", () => {
    const r = fixtureModel("rates");
    expect(nodeFacts(r, "fast/outer/hold").rate?.title).toBe("anchor fast (T 1/50 s, tau 0/1 s), m 2, c 0");
  });
});

describe("ratePhrase", () => {
  const q = { key: "q_ctl", T: { num: 1, den: 50 }, tau: { num: 0, den: 1 }, scope: "pid_controller" };
  it.each([
    [{ anchor: 0, m: 1, c: 0 }, "every base tick"],
    [{ anchor: 0, m: 4, c: 0 }, "every 4th base tick"],
    [{ anchor: 0, m: 4, c: 1 }, "every 4th base tick, offset 1"],
    [{ anchor: 0, m: 2, c: 3 }, "every 2nd base tick, offset 3"],
    [{ anchor: 0, m: 3, c: 0 }, "every 3rd base tick"],
    [{ anchor: 0, m: 11, c: 0 }, "every 11th base tick"],
    [{ anchor: 0, m: 22, c: 0 }, "every 22nd base tick"],
    [{ anchor: 1, m: 1, c: 0 }, "every tick of q_ctl, 1/50 s"],
    [{ anchor: 1, m: 5, c: 2 }, "every 5th tick of q_ctl, 1/50 s, offset 2"],
  ])("inline %o reads %s", (t, phrase) => {
    expect(ratePhrase(t, [q])).toBe(phrase);
  });
  it("a non-zero tau joins the anchor's T", () => {
    expect(ratePhrase({ anchor: 1, m: 1, c: 0 }, [{ ...q, tau: { num: 1, den: 100 } }])).toBe("every tick of q_ctl, 1/50 s, tau 1/100 s");
  });
  it("the fixtures: rates' hold every 2nd tick of fast, closed_loop's q_ctl, a discrete leaf at anchor 0", () => {
    expect(nodeFacts(fixtureModel("rates"), "fast/outer/hold").rate?.phrase).toBe("every 2nd tick of fast, 1/50 s");
    const ctl = nodeFacts(cl, "pid_controller/q_ctl");
    expect(ctl.rate).toEqual({ phrase: "every tick of q_ctl, 1/50 s", title: "anchor q_ctl (T 1/50 s, tau 0/1 s), m 1, c 0" });
    const kinds = fixtureModel("kinds");
    const discrete = [...kinds.tree!.byPath.values()].find((n) => n.class === "leaf" && n.tier === "discrete")!;
    expect(nodeFacts(kinds, discrete.path).rate?.phrase).toBe("every base tick");
  });
  it("a continuous leaf has no rate; the class phrase names the tier", () => {
    const p = nodeFacts(cl, "plant");
    expect(p.rate).toBeUndefined();
    expect(classPhrase(p.kind, p.tier)).toBe("leaf, continuous");
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
  it("the root level", () => {
    const l = levelFacts(cl, "") as LevelFacts;
    expect([l.kind, l.path, l.label, l.displayName, l.children, l.wires]).toEqual(["level", "", "closed_loop", "Group", 6, 30]);
    expect(l.inputs.map((f) => f.name)).toEqual(["h_ref", "V_ref", "mode"]);
    expect(l.outputs).toEqual([]);
    expect(by(l.inputs, "mode").phrase).toBe("boolean");
    expect(l.scopes).toEqual([]);
  });

  it("plant, a leaf", () => {
    const p = nodeFacts(cl, "plant");
    expect([p.kind, p.segment, p.displayName, p.path, p.tier, p.rate, p.alias, p.type])
      .toEqual(["leaf", "plant", "Longitudinal", "plant", "continuous", undefined, undefined, "RedstoneExamples.Longitudinal"]);
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
    expect([a.alias, a.type, a.displayName]).toEqual(["Redstone.Blocks.SumJunction", "Redstone.Blocks.Junction", "SumJunction"]);
    expect(by(a.inputs, "in1").producer).toEqual(face("plant", "out", "h"));
    expect(by(a.outputs, "y").stage).toBe(2);
  });

  it("sensing, a closed assembly", () => {
    const s = nodeFacts(cl, "sensing");
    expect([s.kind, s.displayName, s.children, s.tier, s.rate]).toEqual(["assembly", "Group", 2, undefined, undefined]);
    expect(s.inputs.map((f) => [f.name, f.type, f.phrase])).toEqual([["h", "Float64", "float"]]);
    expect(s.outputs.map((f) => [f.name, f.type, f.stage])).toEqual([["h_meas", "Float64", undefined]]);
    expect(by(s.inputs, "h").producer).toEqual(face("plant", "out", "h"));
  });

  it("the root wire into sensing|in|h", () => {
    const w = wireFacts(cl, "", "sensing|in|h")!;
    expect([w.from, w.to]).toEqual([{ path: "plant", port: "h" }, { path: "sensing", port: "h" }]);
    expect(w.producer).toEqual(face("plant", "out", "h"));
    expect(w.consumers).toEqual([face("sensing/altimeter", "in", "in1")]);
    expect([w.type, w.phrase, w.level]).toEqual(["Float64", "float", ""]);
  });

  it("a wire into a leaf names the leaf input as its terminal consumer", () => {
    const w = wireFacts(cl, "sensing", "sensing/altimeter|in|in1")!;
    expect(w.from).toEqual({ path: "sensing", port: "h" });
    expect(w.consumers).toEqual([face("sensing/altimeter", "in", "in1")]);
    expect(w.producer).toEqual(face("plant", "out", "h"));
  });

  it("the root input h_ref, as a pin and as its port", () => {
    const p = pinFacts(cl, "", "⟨in⟩h_ref")!;
    expect([p.kind, p.name, p.type, p.phrase, p.pinned]).toEqual(["pin", "h_ref", "Float64", "float", false]);
    expect(p.consumers).toEqual([face("pid_controller/h_ctl", "in", "r"), face("lqr_controller/z_ref_pack", "in", "in1")]);
    expect(p.rootInput?.name).toBe("h_ref");
    expect(p.producer).toBeUndefined();
    const q = portFacts(cl, "", "⟨in⟩h_ref|out|h_ref")!;
    expect([q.kind, q.consumers?.length, q.rootInput?.type]).toEqual(["port", 2, "Float64"]);
  });

  it("a leaf's input port names its producer", () => {
    const q = portFacts(cl, "sensing", "sensing/altimeter|in|in1")!;
    expect([q.face, q.producer, q.consumers]).toEqual([face("sensing/altimeter", "in", "in1"), face("plant", "out", "h"), undefined]);
  });

  it("detailOf dispatches on the selection", () => {
    expect(detailOf(cl, "", undefined)?.kind).toBe("level");
    expect(detailOf(cl, "", { level: "", target: { kind: "block", id: "plant" } })?.kind).toBe("leaf");
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

  it("rates' level fast declares one scope", () => {
    const l = levelFacts(fixtureModel("rates"), "fast") as LevelFacts;
    expect([l.children, l.wires, l.inputs.map((f) => f.name), l.outputs.map((f) => f.name)]).toEqual([2, 4, ["in"], ["inner", "outer"]]);
    expect(l.scopes).toEqual([{ key: "fast", timing: "anchor fast (T 1/50 s, tau 0/1 s), m 1, c 0" }]);
  });

  it("counts the level line in the singular for one child and one wire, the plural otherwise", () => {
    const f = (name: string): LeafFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
    const id = { type: "T", signature: "T", parameters: [] };
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [],
          wires: [{ from: { path: "", port: "x" }, to: { path: "L", port: "e" } }] },
        { ...id, path: "L", field: "L", class: "leaf", tier: "continuous", timing: { anchor: 0, m: 1, c: 0 }, inputs: [f("e")], outputs: [] },
      ],
      root_inputs: [f("x")], anchors: [], scopes: [], types: [],
    };
    const tree = buildTree(structure);
    const one = { tree, structure, resolution: buildResolution(tree, structure) } as Model;
    expect(levelLine(levelFacts(one, "") as LevelFacts)).toBe("open level · 1 child · 1 wire");
    expect(levelLine(levelFacts(fixtureModel("rates"), "fast") as LevelFacts)).toBe("open level · 2 children · 4 wires");
  });

  it("a primitive root's level is its leaf, its segment the label", () => {
    const l = levelFacts(fixtureModel("primitive"), "") as NodeFacts;
    expect([l.kind, l.segment, l.displayName]).toEqual(["leaf", "primitive", "Plant"]);
  });
});
