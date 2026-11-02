// The lit sets and marks from the look fixer's oracle (`continuous.py <fixtures> <key> <fixture>`).
import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { legendLit, legendMarks, rekeyFocus } from "./focus";
import type { Model } from "./model";
import { CONTINUOUS } from "./rates";

const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const lit = (m: Model, level: string, key: string) => {
  const l = legendLit(m, level, key);
  return { blocks: [...l.blocks].sort(), wires: [...l.wires].sort() };
};

describe("legendLit", () => {
  it("lights closed_loop's five assemblies on the base grid at the root, no wire, no pin", () => {
    expect(lit(cl, "", "0,1,0")).toEqual({ blocks: ["actuators", "lqr_controller", "pid_controller", "selection", "sensing"], wires: [] });
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

  it("on rates lights fast by its scope and by its leaf beneath, and the continuous wires on levels with no continuous block", () => {
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
    expect([...legendMarks(cl, "0,1,0")].sort()).toEqual(["actuators", "lqr_controller", "pid_controller", "selection", "sensing"]);
    expect([...legendMarks(cl, "4,1,0")]).toEqual(["pid_controller/q_ctl"]);
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

  it("follows an anchor by its key, not its index", () => {
    const anchors = rates.structure!.anchors;
    const swapped = { ...rates, structure: { ...rates.structure!, anchors: [anchors[1], anchors[0]] } } as Model;
    // in the copy the index points elsewhere, so a triple of anchor 1 there is anchor 2 here
    expect(rekeyFocus("1,2,0", rates, swapped)).toBeUndefined();
    expect(rekeyFocus("2,1,0", swapped, rates)).toBe("1,1,0");
  });
});
