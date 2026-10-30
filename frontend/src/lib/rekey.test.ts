import { describe, expect, it } from "vitest";
import type { LeafFace, StructureSection } from "./descriptor";
import { fixtureJson, fixtureModel } from "./fixtures";
import { parseDescriptor } from "./loader";
import { loadModel, type Model } from "./model";
import { rekey, type PerTab } from "./rekey";
import { buildResolution } from "./resolve";
import { buildTree } from "./tree";

const deployment = fixtureModel("closed_loop_deployment");
const rates = fixtureModel("rates");
const view = { x: 10, y: 20, scale: 1.5 };

/** closed_loop's state at `sensing`, `sensing/noise` selected, `actuators` expanded, a view and a layout at `sensing`. */
const atSensing = (selection: PerTab<string>["selection"]): PerTab<string> => ({
  level: "sensing", selection, expanded: new Set(["", "sensing", "actuators"]),
  views: new Map([["", view], ["sensing", view]]), layouts: new Map([["", "root"], ["sensing", "sensing"]]), query: "h",
});
const noise = { level: "sensing", target: { kind: "block" as const, id: "sensing/noise" } };

describe("rekey", () => {
  it("keeps everything against the deployment of the same structure, with no note", () => {
    const r = rekey(atSensing(noise), deployment);
    expect(r).toEqual({ ...atSensing(noise), note: undefined });
  });

  it("falls back to the root against rates, noting sensing, dropping the selection and the sensing view", () => {
    const r = rekey(atSensing(noise), rates);
    expect(r.level).toBe("");
    expect(r.note).toBe("`sensing` is not in this model; showing the root");
    expect(r.selection).toBeUndefined();
    // the root survives but is the fallback, so it fits too
    expect([...r.views.keys()]).toEqual([]);
    expect([...r.layouts.keys()]).toEqual([""]);
    expect([...r.expanded]).toEqual([""]);
    expect(r.query).toBe("h");
  });

  it("keeps a pin on sensing against the deployment and drops it where sensing lacks the face", () => {
    const pin = { level: "sensing", target: { kind: "block" as const, id: "⟨in⟩h" } };
    expect(rekey(atSensing(pin), deployment).selection).toEqual(pin);
    const d = fixtureJson("closed_loop") as any;
    const sensing = d.build.structure.nodes.find((n: any) => n.path === "sensing");
    sensing.inputs = sensing.inputs.filter((f: any) => f.name !== "h");
    const loaded = parseDescriptor(JSON.stringify(d), "no_h.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    const r = rekey(atSensing(pin), loadModel(loaded));
    expect(r.level).toBe("sensing");
    expect(r.selection).toBeUndefined();
  });

  it("keeps a wire and a port by their keys against the deployment", () => {
    const wire = { level: "sensing", target: { kind: "wire" as const, id: "sensing/altimeter|in|in1" } };
    expect(rekey(atSensing(wire), deployment).selection).toEqual(wire);
    const port = { level: "sensing", target: { kind: "port" as const, id: "sensing/altimeter|in|in1" } };
    expect(rekey(atSensing(port), deployment).selection).toEqual(port);
    const gone = { level: "sensing", target: { kind: "wire" as const, id: "sensing/altimeter|in|nowhere" } };
    expect(rekey(atSensing(gone), deployment).selection).toBeUndefined();
  });

  it("falls back to the longest prefix still an assembly", () => {
    const f = (name: string): LeafFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
    const id = { type: "T", signature: "T", parameters: [] };
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [], outputs: [], wires: [] },
        { ...id, path: "a", field: "a", class: "assembly", inputs: [], outputs: [], wires: [] },
        { ...id, path: "a/b", field: "b", class: "leaf", tier: "continuous", timing: { anchor: 0, m: 1, c: 0 }, inputs: [f("e")], outputs: [] },
      ],
      root_inputs: [], anchors: [], scopes: [], types: [],
    };
    const tree = buildTree(structure);
    const model = { tree, resolution: buildResolution(tree, structure) } as Model;
    const r = rekey({
      level: "a/b", selection: { level: "a/b", target: { kind: "block", id: "a/b/c" } },
      expanded: new Set(["", "a", "a/b"]), views: new Map([["a/b", view]]), layouts: new Map(), query: "",
    }, model);
    expect(r.level).toBe("a");
    expect(r.note).toBe("`a/b` is not in this model; showing `a`");
    expect(r.selection).toBeUndefined();
    expect([...r.expanded]).toEqual(["", "a", "a/b"]);
    expect(r.views.size).toBe(0);
  });
});
