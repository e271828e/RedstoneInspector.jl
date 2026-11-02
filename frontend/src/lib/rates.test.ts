import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { levelOf } from "./level";
import type { Model } from "./model";
import type { LeafFace, StructureSection } from "./descriptor";
import { buildResolution } from "./resolve";
import { buildTree } from "./tree";
import { blockTriple, clockCount, clocksBeneath, CONTINUOUS, fromRootInput, legend, mixed, stepsOf, tripleKey, tripleOrder, wireTriple, type Triple } from "./rates";

const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const texts = (m: Model, level: string) => legend(m, level).map((l) => [l.step, l.text]);
const step = (m: Model, path: string) => stepsOf(m).get(tripleKey(blockTriple(m, path)!));
const wire = (m: Model, level: string, id: string) => levelOf(m.tree!, m.resolution!, level).wires.find((w) => w.id === id)!;

describe("tripleOrder", () => {
  it("orders closed_loop's 10 triples by anchor, no block on the base grid, anchors 9 and 10 extra", () => {
    const order = tripleOrder(cl);
    expect(order).toEqual<Triple[]>(Array.from({ length: 10 }, (_, i): Triple => [i + 1, 1, 0]));
    expect(order.slice(8).map((t) => t[0])).toEqual([9, 10]);
  });

  it("sorts rates' triples by period: anchor 1, anchor 1 × 2, then anchor 2 at 1/10 s", () => {
    expect(tripleOrder(rates)).toEqual([[1, 1, 0], [1, 2, 0], [2, 1, 0]]);
  });

  it("sorts library's period before the anchor index: anchor 2 at 1/50 s before anchor 1 at 1/10 s", () => {
    const lib = fixtureModel("library");
    expect(tripleOrder(lib)).toEqual([[0, 1, 0], [0, 2, 0], [0, 2, 1], [2, 1, 0], [1, 1, 0]]);
    expect(texts(lib, "")).toEqual([
      [undefined, "continuous"], [0, "base grid"], [1, "base grid × 2"], [2, "base grid × 2, phase 1"], [3, "anchor 2 (1/50 s)"], [4, "anchor 1 (1/10 s)"],
    ]);
  });

  it("gives kinds one triple, the base grid, with s at step 0; aircraft and containers none", () => {
    const k = fixtureModel("kinds");
    expect(tripleOrder(k)).toEqual([[0, 1, 0]]);
    expect(step(k, "s")).toBe(0);
    expect(texts(k, "")).toEqual([[undefined, "continuous"], [0, "base grid"]]);
    expect(tripleOrder(fixtureModel("aircraft"))).toEqual([]);
    expect(tripleOrder(fixtureModel("containers"))).toEqual([]);
  });
});

describe("blockTriple and the badge", () => {
  it("gives a closed_loop assembly the one triple its leaves share, none when they tick on several, and counts the clocks on each", () => {
    expect(blockTriple(cl, "sensing")).toEqual([1, 1, 0]);
    expect(blockTriple(cl, "lqr_controller")).toEqual([6, 1, 0]);
    for (const a of ["pid_controller", "selection", "actuators"]) {
      expect(blockTriple(cl, a), a).toBeUndefined();
      expect(mixed(cl, a), a).toBe(true);
    }
    for (const p of ["sensing", "lqr_controller", "plant"]) expect(mixed(cl, p), p).toBe(false);
    expect(["sensing", "pid_controller", "lqr_controller", "selection", "actuators"].map((p) => [p, clockCount(cl, p)]))
      .toEqual([["sensing", 1], ["pid_controller", 4], ["lqr_controller", 1], ["selection", 2], ["actuators", 2]]);
    expect(clocksBeneath(cl, "sensing")).toEqual([[1, 1, 0]]);
    expect(blockTriple(cl, "plant")).toBeUndefined();
  });

  it("reads closed_loop's root legend as the continuous line, then the two colored assemblies' steps and those its wires carry", () => {
    expect(legend(cl, "")[1]).toEqual({ key: "1,1,0", triple: [1, 1, 0], step: 0, text: "anchor 1 (1/50 s)", title: "noise at sensing" });
    expect(texts(cl, "")).toEqual([[undefined, "continuous"], ...[1, 4, 5, 6, 7, 8].map((a) => [a - 1, `anchor ${a} (1/50 s)`])]);
  });

  it("lists pid_controller's four controllers at steps 1 to 4 and selection's delays on its wires, the constant continuous", () => {
    expect(texts(cl, "pid_controller")).toEqual([[undefined, "continuous"], ...[2, 3, 4, 5, 7, 8].map((a) => [a - 1, `anchor ${a} (1/50 s)`])]);
    expect(blockTriple(cl, "pid_controller/free")).toBeUndefined();
  });

  it("colors selection's command_δt at step 7 and numbers actuators' two limiters 9 and 10", () => {
    expect(texts(cl, "selection")).toEqual([[undefined, "continuous"], ...[4, 5, 7, 8].map((a) => [a - 1, `anchor ${a} (1/50 s)`])]);
    expect(step(cl, "selection/command_δt")).toBe(7);
    expect([step(cl, "actuators/δe_limiter")! + 1, step(cl, "actuators/δt_limiter")! + 1]).toEqual([9, 10]);
    expect(blockTriple(cl, "actuators/δe_lag")).toBeUndefined();
  });

  it("leaves rates' fast without a triple and counts two clocks, slow on its leaf's with one, their wires giving each level its lines", () => {
    expect(texts(rates, "")).toEqual([[undefined, "continuous"], [0, "anchor 1 (1/50 s)"], [1, "anchor 1 (1/50 s) × 2"], [2, "anchor 2 (1/10 s)"]]);
    expect(legend(rates, "")[1].title).toBe("fast at the root");
    expect([blockTriple(rates, "fast"), mixed(rates, "fast"), clockCount(rates, "fast")]).toEqual([undefined, true, 2]);
    expect([blockTriple(rates, "slow"), mixed(rates, "slow"), clockCount(rates, "slow")]).toEqual([[2, 1, 0], false, 1]);
    expect(texts(rates, "fast")).toEqual([[undefined, "continuous"], [0, "anchor 1 (1/50 s)"], [1, "anchor 1 (1/50 s) × 2"]]);
    expect(texts(rates, "fast/outer")).toEqual([[undefined, "continuous"], [1, "anchor 1 (1/50 s) × 2"]]);
  });

  it("reads no scopes row: fast's row names its inner clock, slow's a clock its leaf does not tick on", () => {
    expect(rates.structure!.scopes.find((s) => s.path === "fast")!.timing).toEqual({ anchor: 1, m: 1, c: 0 });
    const scopes = rates.structure!.scopes.map((s) => (s.path === "slow" ? { ...s, timing: { anchor: 1, m: 1, c: 0 } } : s));
    const m = { ...rates, structure: { ...rates.structure!, scopes } } as Model;
    expect([blockTriple(m, "fast"), blockTriple(m, "slow")]).toEqual([undefined, [2, 1, 0]]);
  });
});

describe("the continuous line", () => {
  const f = (name: string): LeafFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
  const id = { type: "T", signature: "T", parameters: [] };
  /** An inline model: the root input `x` into a discrete leaf `D`, and `D` into the root output `y`; `C` a continuous leaf when asked. */
  function inline(withContinuous: boolean): Model {
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "", port: "x" }, to: { path: "D", port: "u" } }, { from: { path: "D", port: "v" }, to: { path: "", port: "y" } }] },
        { ...id, path: "D", field: "D", class: "leaf", tier: "discrete", timing: { anchor: 0, m: 1, c: 0 }, inputs: [f("u")], outputs: [f("v")] },
        ...(withContinuous ? [{ ...id, path: "C", field: "C", class: "leaf" as const, tier: "continuous" as const, timing: { anchor: 0, m: 1, c: 0 }, inputs: [], outputs: [] }] : []),
      ],
      root_inputs: [f("x")], anchors: [], scopes: [], types: [],
    };
    const tree = buildTree(structure);
    return { tree, structure, resolution: buildResolution(tree, structure) } as Model;
  }
  /** An inline model: the root input `x` into an assembly `A` of the discrete leaves `D1` and `D2` on two clocks, `A` into the root output `y`. */
  function mixedOnly(): Model {
    const leaf = (name: string, m: number) =>
      ({ ...id, path: `A/${name}`, field: name, class: "leaf" as const, tier: "discrete" as const, timing: { anchor: 0, m, c: 0 }, inputs: [f("u")], outputs: [f("v")] });
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "", port: "x" }, to: { path: "A", port: "x" } }, { from: { path: "A", port: "y" }, to: { path: "", port: "y" } }] },
        { ...id, path: "A", field: "A", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "A", port: "x" }, to: { path: "A/D1", port: "u" } }, { from: { path: "A/D1", port: "v" }, to: { path: "A/D2", port: "u" } },
            { from: { path: "A/D2", port: "v" }, to: { path: "A", port: "y" } }] },
        leaf("D1", 1), leaf("D2", 2),
      ],
      root_inputs: [f("x")], anchors: [], scopes: [], types: [],
    };
    const tree = buildTree(structure);
    return { tree, structure, resolution: buildResolution(tree, structure) } as Model;
  }

  it("is absent when every block has a triple and every other wire leaves a root input", () => {
    expect(texts(inline(false), "")).toEqual([[0, "base grid"]]);
  });

  it("is absent when the one block without a triple is a mixed assembly, which takes the assembly gray", () => {
    const m = mixedOnly();
    expect([blockTriple(m, "A"), mixed(m, "A")]).toEqual([undefined, true]);
    expect(texts(m, "")).toEqual([[1, "base grid × 2"]]);
  });

  it("comes first, unnumbered, for a continuous leaf on the level", () => {
    expect(legend(inline(true), "")[0]).toEqual({ key: CONTINUOUS, text: "continuous", title: expect.stringMatching(/^No rate/) });
    expect(texts(inline(true), "")).toEqual([[undefined, "continuous"], [0, "base grid"]]);
  });

  it("comes from a continuous producer's wires alone on rates' fast, fast/outer and slow, which draw no continuous block", () => {
    for (const lv of ["fast", "fast/outer", "slow"]) {
      expect(rates.tree!.children.get(lv)!.every((c) => blockTriple(rates, c)), lv).toBe(true);
      expect(legend(rates, lv)[0].key, lv).toBe(CONTINUOUS);
    }
  });

  it("shows on every level of closed_loop, as the oracle reads it, and on a primitive root", () => {
    for (const lv of ["", "sensing", "pid_controller", "lqr_controller", "selection", "actuators"]) expect(legend(cl, lv)[0].key, lv).toBe(CONTINUOUS);
    expect(texts(fixtureModel("primitive"), "")).toEqual([[undefined, "continuous"]]);
  });
});

describe("wireTriple", () => {
  it("gives closed_loop's root wire into sensing from plant, continuous, no triple", () => {
    const w = wire(cl, "", "sensing|in|h");
    expect([wireTriple(cl, "", w), fromRootInput(cl, "", w)]).toEqual([undefined, false]);
  });

  it("gives pid_controller's wire out of h_ctl anchor 2", () => {
    expect(wireTriple(cl, "pid_controller", wire(cl, "pid_controller", "pid_controller/θ_ctl|in|r"))).toEqual([2, 1, 0]);
  });

  it("gives a root input's wire no triple and marks it from a root input", () => {
    const w = wire(cl, "", "pid_controller|in|V_ref");
    expect([wireTriple(cl, "", w), fromRootInput(cl, "", w)]).toEqual([undefined, true]);
  });
});
