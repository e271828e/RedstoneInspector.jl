import { describe, expect, it } from "vitest";
import { fixtureJson, fixtureModel } from "./fixtures";
import { levelOf } from "./level";
import { parseDescriptor } from "./loader";
import { loadModel, type Model } from "./model";
import type { PrimitiveFace, StructureSection } from "./descriptor";
import { buildResolution } from "./resolve";
import { buildTree } from "./tree";
import { blockTriple, clockCount, clocksBeneath, CONTINUOUS, fromRootInput, legend, mixed, stepsOf, tripleKey, tripleOrder, wireTriple, type Triple } from "./rates";
import { legendText } from "./timing";

const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
/** A level's legend lines as the canvas prints them: the step and the pair with the anchor, or the continuous line's word. */
const line = (m: Model, t: Triple) => {
  const { period, phase, anchor } = legendText(m, t);
  return `${period} · ${phase} ${anchor}`;
};
const texts = (m: Model, level: string) => legend(m, level).map((l) => [l.step, l.triple ? line(m, l.triple) : CONTINUOUS]);
const clLine = (a: number) => `1/50 s · τ 0 A${[...String(a)].map((c) => "₀₁₂₃₄₅₆₇₈₉"[+c]).join("")}`;
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
      [undefined, "continuous"], [0, "Δt_base · τ 0 A₀"], [1, "2·Δt_base · τ 0 A₀"], [2, "2·Δt_base · τ Δt_base A₀"], [3, "1/50 s · τ 0 A₂"],
      [4, "1/10 s · τ 0 A₁"],
    ]);
  });

  it("compares exact periods: A₁ = 1/10 s at Dₐ 3 ties A₂ = 3/10 s at Dₐ 1, and the tie goes by anchor index (an inline copy of library)", () => {
    const d = fixtureJson("library") as any, s = d.build.structure;
    s.anchors[1].dt = { num: 3, den: 10 };
    s.nodes.find((n: any) => n.path === "noise").timing.D = 3;
    const loaded = parseDescriptor(JSON.stringify(d), "library.json");
    if (!loaded.ok) throw new Error(loaded.reason);
    expect(tripleOrder(loadModel(loaded)).slice(-2)).toEqual([[1, 3, 0], [2, 1, 0]]);
  });

  it("keeps the build's palette order under a deployment: each deployment's steps are its build's (deployment_overlay.md answer 13)", () => {
    for (const f of ["closed_loop", "library", "rates", "timing"]) expect([...stepsOf(fixtureModel(`${f}_deployment`))], f).toEqual([...stepsOf(fixtureModel(f))]);
  });

  it("gives kinds one triple, the base grid, with s at step 0; aircraft and containers none", () => {
    const k = fixtureModel("kinds");
    expect(tripleOrder(k)).toEqual([[0, 1, 0]]);
    expect(step(k, "s")).toBe(0);
    expect(texts(k, "")).toEqual([[undefined, "continuous"], [0, "Δt_base · τ 0 A₀"]]);
    expect(tripleOrder(fixtureModel("aircraft"))).toEqual([]);
    expect(tripleOrder(fixtureModel("containers"))).toEqual([]);
  });
});

describe("blockTriple and the badge", () => {
  it("gives a closed_loop assembly the one triple its primitives share, none when they tick on several, and counts the clocks on each", () => {
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
    expect(legend(cl, "")[1]).toEqual({ key: "1,1,0", triple: [1, 1, 0], step: 0 });
    expect(legendText(cl, [1, 1, 0])).toEqual({ period: "1/50 s", phase: "τ 0", dt: "1/50 s", anchor: "A₁", title: "noise at sensing; Dₐ 1 · Φₐ 0" });
    expect(texts(cl, "")).toEqual([[undefined, "continuous"], ...[1, 4, 5, 6, 7, 8].map((a) => [a - 1, clLine(a)])]);
  });

  it("lists pid_controller's four controllers at steps 1 to 4 and selection's delays on its wires, the constant continuous", () => {
    expect(texts(cl, "pid_controller")).toEqual([[undefined, "continuous"], ...[2, 3, 4, 5, 7, 8].map((a) => [a - 1, clLine(a)])]);
    expect(blockTriple(cl, "pid_controller/free")).toBeUndefined();
  });

  it("colors selection's command_δt at step 7 and numbers actuators' two limiters 9 and 10", () => {
    expect(texts(cl, "selection")).toEqual([[undefined, "continuous"], ...[4, 5, 7, 8].map((a) => [a - 1, clLine(a)])]);
    expect(step(cl, "selection/command_δt")).toBe(7);
    expect([step(cl, "actuators/δe_limiter")! + 1, step(cl, "actuators/δt_limiter")! + 1]).toEqual([9, 10]);
    expect(blockTriple(cl, "actuators/δe_lag")).toBeUndefined();
  });

  it("leaves rates' fast without a triple and counts two clocks, slow on its primitive's with one, their wires giving each level its lines", () => {
    expect(texts(rates, "")).toEqual([[undefined, "continuous"], [0, "1/50 s · τ 0 A₁"], [1, "1/25 s · τ 0 A₁"], [2, "1/10 s · τ 0 A₂"]]);
    expect(legendText(rates, legend(rates, "")[1].triple!).title).toBe("fast at the root; Dₐ 1 · Φₐ 0");
    expect([blockTriple(rates, "fast"), mixed(rates, "fast"), clockCount(rates, "fast")]).toEqual([undefined, true, 2]);
    expect([blockTriple(rates, "slow"), mixed(rates, "slow"), clockCount(rates, "slow")]).toEqual([[2, 1, 0], false, 1]);
    expect(texts(rates, "fast")).toEqual([[undefined, "continuous"], [0, "1/50 s · τ 0 A₁"], [1, "1/25 s · τ 0 A₁"]]);
    expect(texts(rates, "fast/outer")).toEqual([[undefined, "continuous"], [1, "1/25 s · τ 0 A₁"]]);
  });

  it("reads no scopes row: fast's row names its inner clock, slow's a clock its primitive does not tick on", () => {
    expect(rates.structure!.scopes.find((s) => s.path === "fast")!.timing).toEqual({ anchor: 1, D: 1, phi: 0 });
    const scopes = rates.structure!.scopes.map((s) => (s.path === "slow" ? { ...s, timing: { anchor: 1, D: 1, phi: 0 } } : s));
    const m = { ...rates, structure: { ...rates.structure!, scopes } } as Model;
    expect([blockTriple(m, "fast"), blockTriple(m, "slow")]).toEqual([undefined, [2, 1, 0]]);
  });
});

describe("the continuous line", () => {
  const f = (name: string): PrimitiveFace => ({ name, type: "Float64", kind: { kind: "float" }, pinned: false });
  const id = { type: "T", signature: "T", parameters: [] };
  /** An inline model: the root input `x` into a discrete primitive `D`, and `D` into the root output `y`; `C` a continuous primitive when asked. */
  function inline(withContinuous: boolean): Model {
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "", port: "x" }, to: { path: "D", port: "u" } }, { from: { path: "D", port: "v" }, to: { path: "", port: "y" } }] },
        { ...id, path: "D", field: "D", class: "primitive", tier: "discrete", timing: { anchor: 0, D: 1, phi: 0 }, rates: [], inputs: [f("u")], outputs: [f("v")] },
        ...(withContinuous ? [{ ...id, path: "C", field: "C", class: "primitive" as const, tier: "continuous" as const, timing: { anchor: 0, D: 1, phi: 0 }, rates: [], inputs: [], outputs: [] }] : []),
      ],
      root_inputs: [{ ...f("x"), pinned_by: [] }], anchors: [], scopes: [], grid: { pool: [], primes: [] }, types: [],
    };
    const tree = buildTree(structure);
    return { tree, structure, resolution: buildResolution(tree, structure), descriptor: { kind: "build" } } as Model;
  }
  /** An inline model: the root input `x` into an assembly `A` of the discrete primitives `D1` and `D2` on two clocks, `A` into the root output `y`. */
  function mixedOnly(): Model {
    const primitive = (name: string, D: number) =>
      ({ ...id, path: `A/${name}`, field: name, class: "primitive" as const, tier: "discrete" as const, timing: { anchor: 0, D, phi: 0 }, rates: [], inputs: [f("u")], outputs: [f("v")] });
    const structure: StructureSection = {
      nodes: [
        { ...id, path: "", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "", port: "x" }, to: { path: "A", port: "x" } }, { from: { path: "A", port: "y" }, to: { path: "", port: "y" } }] },
        { ...id, path: "A", field: "A", class: "assembly", inputs: [{ name: "x" }], outputs: [{ name: "y" }],
          wires: [{ from: { path: "A", port: "x" }, to: { path: "A/D1", port: "u" } }, { from: { path: "A/D1", port: "v" }, to: { path: "A/D2", port: "u" } },
            { from: { path: "A/D2", port: "v" }, to: { path: "A", port: "y" } }] },
        primitive("D1", 1), primitive("D2", 2),
      ],
      root_inputs: [{ ...f("x"), pinned_by: [] }], anchors: [], scopes: [], grid: { pool: [], primes: [] }, types: [],
    };
    const tree = buildTree(structure);
    return { tree, structure, resolution: buildResolution(tree, structure), descriptor: { kind: "build" } } as Model;
  }

  it("is absent when every block has a triple and every other wire leaves a root input", () => {
    expect(texts(inline(false), "")).toEqual([[0, "Δt_base · τ 0 A₀"]]);
  });

  it("is absent when the one block without a triple is a mixed assembly, which takes the assembly gray", () => {
    const m = mixedOnly();
    expect([blockTriple(m, "A"), mixed(m, "A")]).toEqual([undefined, true]);
    expect(texts(m, "")).toEqual([[1, "2·Δt_base · τ 0 A₀"]]);
  });

  it("comes first on a deployment too, its lines then by D₀ and Φ₀, ties in palette order, the steps the build's (answer 13)", () => {
    expect(texts(fixtureModel("library_deployment"), "")).toEqual([
      [undefined, "continuous"], [0, "D₀ 1 · Φ₀ 0 A₀"], [1, "D₀ 2 · Φ₀ 0 A₀"], [3, "D₀ 2 · Φ₀ 0 A₂"], [2, "D₀ 2 · Φ₀ 1 A₀"], [4, "D₀ 10 · Φ₀ 0 A₁"],
    ]);
    expect(texts(fixtureModel("library"), "").map((l) => l[0])).toEqual([undefined, 0, 1, 2, 3, 4]);
  });

  it("comes first, unnumbered, for a continuous primitive on the level", () => {
    expect(legend(inline(true), "")[0]).toEqual({ key: CONTINUOUS });
    expect(texts(inline(true), "")).toEqual([[undefined, "continuous"], [0, "Δt_base · τ 0 A₀"]]);
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
