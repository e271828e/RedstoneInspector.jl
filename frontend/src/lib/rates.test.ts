import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { levelOf } from "./level";
import type { Model } from "./model";
import { blockTriple, clocksBeneath, fromRootInput, legend, multiRate, stepsOf, tripleKey, tripleOrder, wireTriple, type Triple } from "./rates";

const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const texts = (m: Model, level: string) => legend(m, level).map((l) => [l.step, l.text]);
const step = (m: Model, path: string) => stepsOf(m).get(tripleKey(blockTriple(m, path)!));
const wire = (m: Model, level: string, id: string) => levelOf(m.tree!, m.resolution!, level).wires.find((w) => w.id === id)!;

describe("tripleOrder", () => {
  it("orders closed_loop's 11 triples base grid first, then anchors 1 to 10, the last three extra", () => {
    const order = tripleOrder(cl);
    expect(order).toEqual<Triple[]>([[0, 1, 0], ...Array.from({ length: 10 }, (_, i): Triple => [i + 1, 1, 0])]);
    expect(order.slice(8).map((t) => t[0])).toEqual([8, 9, 10]);
  });

  it("sorts rates' triples by period: anchor 1, anchor 1 × 2, then anchor 2 at 1/10 s", () => {
    expect(tripleOrder(rates)).toEqual([[1, 1, 0], [1, 2, 0], [2, 1, 0]]);
  });

  it("sorts library's period before the anchor index: anchor 2 at 1/50 s before anchor 1 at 1/10 s", () => {
    const lib = fixtureModel("library");
    expect(tripleOrder(lib)).toEqual([[0, 1, 0], [0, 2, 0], [0, 2, 1], [2, 1, 0], [1, 1, 0]]);
    expect(texts(lib, "")).toEqual([
      [0, "base grid"], [1, "base grid × 2"], [2, "base grid × 2, phase 1"], [3, "anchor 2 (1/50 s)"], [4, "anchor 1 (1/10 s)"],
    ]);
  });

  it("gives kinds one triple, the base grid, with s at step 0; aircraft and containers none", () => {
    const k = fixtureModel("kinds");
    expect(tripleOrder(k)).toEqual([[0, 1, 0]]);
    expect(step(k, "s")).toBe(0);
    expect(texts(k, "")).toEqual([[0, "base grid"]]);
    expect(tripleOrder(fixtureModel("aircraft"))).toEqual([]);
    expect(tripleOrder(fixtureModel("containers"))).toEqual([]);
  });
});

describe("blockTriple and the badge", () => {
  it("gives every closed_loop assembly the base grid, no scopes row standing, and badges each", () => {
    for (const a of ["sensing", "pid_controller", "lqr_controller", "selection", "actuators"]) {
      expect(blockTriple(cl, a), a).toEqual([0, 1, 0]);
    }
    expect([["sensing", 1], ["pid_controller", 4], ["lqr_controller", 1], ["selection", 2], ["actuators", 2]].map(([p]) => [p, multiRate(cl, p as string)]))
      .toEqual([["sensing", 1], ["pid_controller", 4], ["lqr_controller", 1], ["selection", 2], ["actuators", 2]]);
    expect(clocksBeneath(cl, "sensing")).toEqual([[1, 1, 0]]);
    expect(blockTriple(cl, "plant")).toBeUndefined();
  });

  it("reads closed_loop's root legend as the base grid and the steps its wires carry, extra 9 among them", () => {
    expect(legend(cl, "")[0]).toEqual({ triple: [0, 1, 0], step: 0, text: "base grid", title: "the base grid" });
    expect(texts(cl, "")).toEqual([[0, "base grid"], ...[4, 5, 7, 8].map((a) => [a, `anchor ${a} (1/50 s)`])]);
  });

  it("lists pid_controller's four controllers at steps 2 to 5 and selection's delays on its wires, the constant continuous", () => {
    expect(texts(cl, "pid_controller")).toEqual([2, 3, 4, 5, 7, 8].map((a) => [a, `anchor ${a} (1/50 s)`]));
    expect(blockTriple(cl, "pid_controller/free")).toBeUndefined();
  });

  it("numbers selection's extra command_δt 9 and actuators' two limiters 10 and 11", () => {
    expect(texts(cl, "selection")).toEqual([4, 5, 7, 8].map((a) => [a, `anchor ${a} (1/50 s)`]));
    expect(step(cl, "selection/command_δt")! + 1).toBe(9);
    expect([step(cl, "actuators/δe_limiter")! + 1, step(cl, "actuators/δt_limiter")! + 1]).toEqual([10, 11]);
    expect(blockTriple(cl, "actuators/δe_lag")).toBeUndefined();
  });

  it("badges rates' fast with two clocks and not slow, its scope rows and wires giving each level its lines", () => {
    expect(texts(rates, "")).toEqual([[0, "anchor 1 (1/50 s)"], [1, "anchor 1 (1/50 s) × 2"], [2, "anchor 2 (1/10 s)"]]);
    expect(legend(rates, "")[0].title).toBe("fast at the root");
    expect([multiRate(rates, "fast"), multiRate(rates, "slow")]).toEqual([2, 0]);
    expect(texts(rates, "fast")).toEqual([[0, "anchor 1 (1/50 s)"], [1, "anchor 1 (1/50 s) × 2"]]);
    expect(texts(rates, "fast/outer")).toEqual([[1, "anchor 1 (1/50 s) × 2"]]);
  });

  it("takes the nearest ancestor's scope row for an assembly without one", () => {
    const m = { ...rates, structure: { ...rates.structure!, scopes: rates.structure!.scopes.filter((s) => s.path !== "fast/outer") } } as Model;
    expect(blockTriple(m, "fast/outer")).toEqual([1, 1, 0]);
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
