// The lit sets and marks from the look fixer's oracle (`continuous.py <fixtures> <key> <fixture>`); those the
// assembly rule of 2026-11-02 changed, read by hand off the fixtures' timings.
import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { legendLit, legendMarks, rekeyFocus } from "./focus";
import type { LeafFace, StructureSection } from "./descriptor";
import type { Model } from "./model";
import { CONTINUOUS } from "./rates";
import { buildResolution } from "./resolve";
import { buildTree } from "./tree";

const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const lit = (m: Model, level: string, key: string) => {
  const l = legendLit(m, level, key);
  return { blocks: [...l.blocks].sort(), wires: [...l.wires].sort() };
};

describe("legendLit", () => {
  it("lights each of closed_loop's two single-clock assemblies by its triple at the root, no wire, no pin", () => {
    expect(lit(cl, "", "1,1,0")).toEqual({ blocks: ["sensing"], wires: [] });
    expect(lit(cl, "", "6,1,0")).toEqual({ blocks: ["lqr_controller"], wires: [] });
  });

  it("lights an assembly with a leaf of anchor 4 beneath and the wire its tint draws", () => {
    expect(lit(cl, "", "4,1,0")).toEqual({ blocks: ["pid_controller"], wires: ["selection|in|δe_pid"] });
    expect(lit(cl, "pid_controller", "4,1,0")).toEqual({ blocks: ["pid_controller/q_ctl"], wires: ["pid_controller/θ_ctl|in|saturation", "⟨out⟩δe|in|δe"] });
    expect(lit(cl, "selection", "4,1,0")).toEqual({ blocks: [], wires: ["selection/select_δe|in|in1"] });
  });

  it("lights an extra's limiter and actuators above it", () => {
    expect(lit(cl, "", "9,1,0")).toEqual({ blocks: ["actuators"], wires: [] });
    expect(lit(cl, "actuators", "9,1,0")).toEqual({ blocks: ["actuators/δe_limiter"], wires: ["actuators/δe_lag|in|u"] });
  });

  it("lights the continuous color: plant, every assembly with a continuous leaf beneath, the 17 wires plant tints", () => {
    const l = lit(cl, "", CONTINUOUS);
    expect(l.blocks).toEqual(["actuators", "lqr_controller", "pid_controller", "plant", "selection", "sensing"]);
    expect(l.wires).toHaveLength(17);
    expect(l.wires).toContain("sensing|in|h");
    expect(l.wires).not.toContain("pid_controller|in|V_ref");
    expect(lit(cl, "actuators", CONTINUOUS)).toEqual({
      blocks: ["actuators/δe_lag", "actuators/δt_lag"],
      wires: ["actuators/δe_limiter|in|u", "actuators/δt_limiter|in|u", "⟨out⟩δe|in|δe", "⟨out⟩δt|in|δt"],
    });
  });

  it("on rates lights the mixed fast by its leaves beneath, never by the continuous color, and the continuous wires on levels with no continuous block", () => {
    expect(lit(rates, "", "1,1,0")).toEqual({ blocks: ["fast"], wires: ["⟨out⟩inner|in|inner"] });
    expect(lit(rates, "", "1,2,0")).toEqual({ blocks: ["fast"], wires: ["⟨out⟩outer|in|outer"] });
    expect(lit(rates, "fast", "1,2,0")).toEqual({ blocks: ["fast/outer"], wires: ["⟨out⟩outer|in|outer"] });
    expect(lit(rates, "", "2,1,0")).toEqual({ blocks: ["slow"], wires: ["⟨out⟩slow|in|slow"] });
    expect(lit(rates, "fast", CONTINUOUS)).toEqual({ blocks: [], wires: ["fast/inner|in|in", "fast/outer|in|in"] });
    expect(lit(rates, "", CONTINUOUS)).toEqual({ blocks: ["src"], wires: ["fast|in|in", "slow|in|in"] });
  });
});

describe("legendMarks", () => {
  it("marks the rows whose dot takes the color", () => {
    expect([...legendMarks(cl, "1,1,0")].sort()).toEqual(["sensing", "sensing/noise"]);
    expect([...legendMarks(cl, "4,1,0")]).toEqual(["pid_controller/q_ctl"]);
    expect([...legendMarks(rates, "1,1,0")]).toEqual(["fast/inner"]);
    expect(legendMarks(cl, CONTINUOUS).size).toBe(14);
    expect(legendMarks(cl, CONTINUOUS).has("plant")).toBe(true);
    expect(legendMarks(cl, CONTINUOUS).has("sensing")).toBe(false);
    expect([...legendMarks(rates, "1,2,0")].sort()).toEqual(["fast/outer", "fast/outer/hold"]);
    expect([...legendMarks(rates, CONTINUOUS)]).toEqual(["src"]);
  });
});

describe("rekeyFocus", () => {
  it("keeps a triple and the continuous color across closed_loop_deployment, drops a triple rates lacks", () => {
    const dep = fixtureModel("closed_loop_deployment");
    expect(rekeyFocus("4,1,0", cl, dep)).toBe("4,1,0");
    expect(rekeyFocus(CONTINUOUS, cl, dep)).toBe(CONTINUOUS);
    expect(rekeyFocus("9,1,0", cl, rates)).toBeUndefined();
  });

  it("drops the continuous color when the one node without a triple is a mixed assembly", () => {
    const f = (name: string): LeafFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
    const id = { type: "T", signature: "T", parameters: [] };
    const leaf = (name: string, m: number) =>
      ({ ...id, path: `A/${name}`, field: name, class: "leaf" as const, tier: "discrete" as const, timing: { anchor: 0, m, c: 0 }, inputs: [f("u")], outputs: [f("v")] });
    // an assembly `A` of the discrete leaves `D1` and `D2` on two clocks, alone under the root
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [], outputs: [], wires: [] },
        { ...id, path: "A", field: "A", class: "assembly", inputs: [], outputs: [], wires: [{ from: { path: "A/D1", port: "v" }, to: { path: "A/D2", port: "u" } }] },
        leaf("D1", 1), leaf("D2", 2),
      ],
      root_inputs: [], anchors: [], scopes: [], types: [],
    };
    const tree = buildTree(structure);
    const next = { tree, structure, resolution: buildResolution(tree, structure) } as Model;
    expect(rekeyFocus(CONTINUOUS, cl, next)).toBeUndefined();
    expect(rekeyFocus("0,2,0", cl, next)).toBe("0,2,0");
  });

  it("follows an anchor by its key, not its index", () => {
    const anchors = rates.structure!.anchors;
    const swapped = { ...rates, structure: { ...rates.structure!, anchors: [anchors[1], anchors[0]] } } as Model;
    // in the copy the index points elsewhere, so a triple of anchor 1 there is anchor 2 here
    expect(rekeyFocus("1,2,0", rates, swapped)).toBeUndefined();
    expect(rekeyFocus("2,1,0", swapped, rates)).toBe("1,1,0");
  });
});
