// A deployment's timing as data, pinned from increment 10's oracle over the committed fixtures
// (deployment_overlay.md answers 3, 5, 6, 8 to 11 and 13); inline copies for a frame that is not a whole number
// of base ticks, a frame finer than the base tick and a proposing algorithm, as answer 16 says.
import { describe, expect, it } from "vitest";
import { parseDescriptor } from "./loader";
import { fixtureJson, fixtureModel } from "./fixtures";
import { loadModel, type Model } from "./model";
import {
  anchorTable, anchorTitle, baseMultiple, CHART_PAD, chainLine, chartFit, chartRows, coarsestLine, componentTable, dueTicks,
  frameLines, frameTopX, framesTable, gridReport, headList, hyperperiod, hyperperiodLine, jointLine, jointPeriod, julia,
  lcmQ, legendText, q, scopeFramesTable, scopeTable, seconds, stepsPerFrame, tickX, type DrawnFit,
} from "./timing";

/** A fixture's JSON edited, then loaded: an inline copy. */
function edited(name: string, edit: (d: any) => void): Model {
  const d = fixtureJson(name) as any;
  edit(d);
  const loaded = parseDescriptor(JSON.stringify(d), `${name}.json`);
  if (!loaded.ok) throw new Error(loaded.reason);
  return loadModel(loaded);
}
/** The grid report as the tab prints it in the base grid's section under the first line, line by line. */
function gridReportLines(m: Model): string[] {
  const r = gridReport(m);
  if (!r) return [];
  return [...r.entries, ...(r.primes ? [r.primes] : []), ...r.attribution.map((a) => `${a.power}: ${a.suppliers.map((x) => x.text).join(", ")}`)];
}
const timingDep = fixtureModel("timing_deployment");
const libDep = fixtureModel("library_deployment");
/** A deployment of `primitive` made discrete (an inline structure): one row at the root path, `D = 1`, at the frame given. */
const primitiveRootDep = (frame: { num: number; den: number }) => edited("library_deployment", (d) => {
  const build = (fixtureJson("primitive") as any).build;
  Object.assign(build.structure.nodes[0], { tier: "discrete", timing: { anchor: 0, m: 1, c: 0 } });
  Object.assign(d.deployment, {
    build, dt_base: { num: 1, den: 150 }, dt_frame: frame, h_max: frame, schedule: { anchors: [], rows: [{ path: "", D: 1, phi: 0 }], scopes: [] }, warnings: [],
  });
});

describe("exact fractions", () => {
  it("reduce over BigInt and print as seconds, as a multiple of Δt_base and as Julia prints them", () => {
    expect(q(6n, 300n)).toEqual({ n: 1n, d: 50n });
    expect(q(-2, -4)).toEqual({ n: 1n, d: 2n });
    expect([seconds(q(0)), seconds(q(1, 50)), seconds(q(3)), seconds(q(6, 5))]).toEqual(["0", "1/50 s", "3 s", "6/5 s"]);
    expect([baseMultiple(0), baseMultiple(1), baseMultiple(2)]).toEqual(["0", "Δt_base", "2·Δt_base"]);
    expect([julia(q(0)), julia(q(1, 300))]).toEqual(["0//1", "1//300"]);
  });
  it("take the lcm of two fractions as the lcm of the numerators over the gcd of the denominators", () => {
    expect(lcmQ(q(1, 10), q(3, 200))).toEqual(q(3, 10));
    expect(lcmQ(q(6, 5), q(1, 100))).toEqual(q(6, 5));
  });
});

describe("the anchors table (answers 6 and 9)", () => {
  it("library: the base grid first, a build's A₀ symbolic, no pool factor in a row", () => {
    expect(anchorTable(fixtureModel("library"))).toEqual([
      { index: 0, label: "A₀ (base)", dt: "Δt_base", tau: "0" },
      { index: 1, label: "A₁ (noise)", dt: "1/10 s", tau: "0", scope: "", key: "noise" },
      { index: 2, label: "A₂ (dss)", dt: "1/50 s", tau: "0", scope: "", key: "dss" },
    ]);
  });
  it("timing_deployment: the deployment's Dₖ and Φₖ, A₀ at its value", () => {
    expect(anchorTable(timingDep)).toEqual([
      { index: 0, label: "A₀ (base)", dt: "1/300 s", tau: "0", D: 1, phi: 0 },
      { index: 1, label: "A₁ (staggered)", dt: "1/10 s", tau: "1/300 s", D: 30, phi: 1, scope: "", key: "staggered" },
      { index: 2, label: "A₂ (fast)", dt: "1/50 s", tau: "0", D: 6, phi: 0, scope: "", key: "fast" },
    ]);
  });
  it("the coarsest line: a build's tick, a deployment's Δt_base beside it, equal or not, none without anchors", () => {
    expect(coarsestLine(fixtureModel("library"))).toBe("coarsest admissible Δt_base: 1/50 s");
    expect(coarsestLine(libDep)).toBe("Δt_base: 1/100 s, coarsest admissible: 1/50 s");
    expect(coarsestLine(timingDep)).toBe("Δt_base: 1/300 s, coarsest admissible: 1/300 s");
    expect(coarsestLine(fixtureModel("kinds"))).toBeUndefined();
  });
});

describe("the grid report (answers 6 and 9)", () => {
  it("timing, as a build and as a deployment: the offset's factor with its alternatives, then the denominator's factors and a row per prime power by anchor and kind", () => {
    for (const m of [fixtureModel("timing"), timingDep]) expect(gridReportLines(m)).toEqual([
      "τ₁ = 1/300 s (staggered) makes the grid 6× finer. With τ₁ = 0 or 1/50 s, the coarsest admissible Δt_base would be 1/50 s.",
      "Prime factors of the denominator, 300 = 2²·3·5²",
      "2²: τ₁ (staggered)",
      "3: τ₁ (staggered)",
      "5²: Δt₂ (fast), τ₁ (staggered)",
    ]);
  });
  it("library and rates, builds and deployments: a period's sentence alone, for the one entry whose factor is above 1, then two prime rows", () => {
    for (const m of [fixtureModel("library"), libDep]) expect(gridReportLines(m)).toEqual([
      "Δt₂ = 1/50 s (dss) makes the grid 5× finer.", "Prime factors of the denominator, 50 = 2·5²", "2: Δt₁ (noise), Δt₂ (dss)", "5²: Δt₂ (dss)",
    ]);
    for (const m of [fixtureModel("rates"), fixtureModel("rates_deployment")]) expect(gridReport(m)!.entries).toEqual(["Δt₁ = 1/50 s (fast) makes the grid 5× finer."]);
  });
  it("closed_loop: ten factors of 1, no sentence", () => {
    for (const name of ["closed_loop", "closed_loop_deployment"] as const) {
      expect(gridReport(fixtureModel(name))!.entries).toEqual([]);
      expect(gridReport(fixtureModel(name))!.primes).toBe("Prime factors of the denominator, 50 = 2·5²");
    }
  });
  it("the sentences keep the pool's order, a period's before an offset's (an inline copy of timing)", () => {
    const m = edited("timing", (d) => (d.build.structure.grid.pool[1].factor = 2));
    expect(gridReport(m)!.entries.map((e) => e.split(".")[0])).toEqual([
      "Δt₂ = 1/50 s (fast) makes the grid 2× finer", "τ₁ = 1/300 s (staggered) makes the grid 6× finer",
    ]);
  });
  it("a whole-second grid has no prime line, an unfactored cofactor says so, no anchors no report", () => {
    const whole = edited("library", (d) => {
      const s = d.build.structure;
      s.anchors.forEach((a: any) => (a.dt = { num: 2, den: 1 }));
      s.grid = { admissible: { num: 2, den: 1 }, pool: [{ anchor: 1, kind: "period", factor: 1 }, { anchor: 2, kind: "period", factor: 1 }], primes: [] };
    });
    expect(gridReport(whole)).toEqual({ entries: [], attribution: [] });
    expect(gridReportLines(whole)).toEqual([]);
    const big = edited("library", (d) => {
      d.build.structure.grid.primes = [{ prime: 1099511627791, power: 1, suppliers: [2], unfactored: true }];
      d.build.structure.grid.admissible = { num: 1, den: 1099511627791 };
    });
    expect(gridReportLines(big).slice(1)).toEqual(["Prime factors of the denominator, 1099511627791 = 1099511627791 unfactored", "1099511627791 unfactored: Δt₂ (dss)"]);
    expect(gridReport(big)!.attribution.map((a) => a.unfactored)).toEqual([true]);
    expect(gridReport(libDep)!.attribution.map((a) => a.unfactored)).toEqual([false, false]);
    expect(gridReportLines(fixtureModel("kinds"))).toEqual([]);
  });
});

describe("the components and scopes tables (answers 3, 5 and 9)", () => {
  it("library: d_pid's cell before and after binding, 2·Δt_base and 1/50 s", () => {
    const build = componentTable(fixtureModel("library")).find((r) => r.path === "d_pid")!;
    expect(build).toEqual({ path: "d_pid", triple: [0, 2, 1], anchor: "A₀ (base)", m: 2, c: 1, dt: "2·Δt_base", tau: "Δt_base" });
    const dep = componentTable(libDep).find((r) => r.path === "d_pid")!;
    expect(dep).toEqual({ path: "d_pid", triple: [0, 2, 1], anchor: "A₀ (base)", m: 2, c: 1, D: 2, phi: 1, splits: false, dt: "1/50 s", tau: "1/100 s" });
  });
  it("timing_deployment: the five rows in walk order with D, Φ and exact seconds; staggered splits frames", () => {
    expect(componentTable(timingDep).map((r) => [r.path, r.anchor, r.m, r.c, r.D, r.phi, r.dt, r.tau, r.splits])).toEqual([
      ["staggered", "A₁ (staggered)", 1, 0, 30, 1, "1/10 s", "1/300 s", true],
      ["fast/inner", "A₂ (fast)", 1, 0, 6, 0, "1/50 s", "0", false],
      ["fast/outer/hold", "A₂ (fast)", 6, 3, 36, 18, "3/25 s", "3/50 s", false],
      ["fast/outer/same", "A₂ (fast)", 2, 1, 12, 6, "1/25 s", "1/50 s", false],
      ["fast/outer/deep/hold", "A₂ (fast)", 4, 3, 24, 18, "2/25 s", "3/50 s", false],
    ]);
  });
  it("timing: a build's seconds from the anchors, τ = τₖ + c·Δtₖ", () => {
    expect(componentTable(fixtureModel("timing")).map((r) => [r.path, r.dt, r.tau])).toEqual([
      ["staggered", "1/10 s", "1/300 s"], ["fast/inner", "1/50 s", "0"], ["fast/outer/hold", "3/25 s", "3/50 s"],
      ["fast/outer/same", "1/25 s", "1/50 s"], ["fast/outer/deep/hold", "2/25 s", "3/50 s"],
    ]);
  });
  it("timing_deployment: the scopes with the key after the path, joined by path and key", () => {
    expect(scopeTable(timingDep).map((r) => [r.path, r.key, r.m, r.c, r.D, r.phi, r.dt, r.tau])).toEqual([
      ["fast", "fast", 1, 0, 6, 0, "1/50 s", "0"],
      ["fast/outer", "outer", 2, 1, 12, 6, "1/25 s", "1/50 s"],
      ["fast/outer/deep", "deep", 4, 3, 24, 18, "2/25 s", "3/50 s"],
    ]);
  });
  it("library: by Δt in the palette's order, A₀'s triples first, then Δt ascending, equal triples in walk order; library_deployment's exact Δt the same", () => {
    expect(componentTable(fixtureModel("library")).map((r) => r.path)).toEqual([
      "noise", "unit_delay", "d_integrator", "rate_limiter", "dss", "dtf", "zoh_ss", "zoh_tf", "d_limited", "delay", "d_pid", "d_lqr", "backlash",
    ]);
    const sorted = [
      "unit_delay", "d_integrator", "rate_limiter", "dtf", "zoh_ss", "zoh_tf", "delay", "d_lqr", "backlash", "d_limited", "d_pid", "dss", "noise",
    ];
    expect(componentTable(fixtureModel("library"), true).map((r) => r.path)).toEqual(sorted);
    expect(componentTable(libDep, true).map((r) => r.path)).toEqual(sorted);
    expect(componentTable(fixtureModel("failure_structure"), true)).toEqual([]);
  });
  it("sorts a deployment by its exact Δt, ties in the palette's order, and a build in the palette's order (inline copies with d_limited at m 20)", () => {
    const slow = (d: any) => {
      const b = d.kind === "deployment" ? d.deployment : d;
      (b.build ?? b).structure.nodes.find((n: any) => n.path === "d_limited").timing.m = 20;
      if (d.kind === "deployment") d.deployment.schedule.rows.find((r: any) => r.path === "d_limited").D = 20;
    };
    const ones = ["unit_delay", "d_integrator", "rate_limiter", "dtf", "zoh_ss", "zoh_tf", "delay", "d_lqr", "backlash"];
    const dep = componentTable(edited("library_deployment", slow), true);
    expect(dep.map((r) => r.path)).toEqual([...ones, "d_pid", "dss", "noise", "d_limited"]);
    expect(dep.slice(-4).map((r) => r.dt)).toEqual(["1/50 s", "1/50 s", "1/10 s", "1/5 s"]);
    expect(componentTable(edited("library", slow), true).map((r) => r.path)).toEqual([...ones, "d_pid", "d_limited", "dss", "noise"]);
  });
  it("names an anchor's declaring key and scope in its tooltip, the base grid for A₀", () => {
    const cl = fixtureModel("closed_loop").structure!;
    expect([anchorTitle(cl, 0), anchorTitle(cl, 1), anchorTitle(timingDep.structure!, 2)]).toEqual([
      "the base grid", "noise at sensing", "fast at the root",
    ]);
  });
  it("joins the rows and the scope rows by path and key, relying on neither order", () => {
    const reversed = edited("timing_deployment", (d) => {
      d.deployment.schedule.rows.reverse();
      d.deployment.schedule.scopes.reverse();
    });
    expect(componentTable(reversed)).toEqual(componentTable(timingDep));
    expect(scopeTable(reversed)).toEqual(scopeTable(timingDep));
  });
});

describe("the head list and the steps per frame (answer 9)", () => {
  it("timing_deployment: three lines, no h_min and no attempt_budget, the splitting rows an item of their own", () => {
    expect(headList(timingDep)).toEqual([
      [{ label: "Δt_frame", values: ["1/100 s"] }, { label: "Δt_base", values: ["1/300 s"] }],
      [{ label: "algorithm", values: ["RK4()"] }, { label: "h_max", values: ["1/100 s"] }],
      [{ label: "steps per unsplit frame", values: ["1"], prose: true }, { label: "rows that split frames", values: ["staggered"] }],
    ]);
    expect(stepsPerFrame(timingDep)).toEqual({ label: "steps per unsplit frame", value: "1", splitting: ["staggered"] });
  });
  it("a build has no head list and no steps", () => {
    expect(headList(fixtureModel("timing"))).toBeUndefined();
    expect(stepsPerFrame(fixtureModel("timing"))).toBeUndefined();
  });
  it("names a splitting row at the root path as the components table's path cell does, /", () => {
    const root = primitiveRootDep({ num: 1, den: 100 });
    expect(componentTable(root).map((r) => [r.path, r.splits])).toEqual([["", true]]);
    expect(stepsPerFrame(root)).toEqual({ label: "steps per unsplit frame", value: "1", splitting: ["/"] });
    expect(headList(root)!.at(-1)!.at(-1)).toEqual({ label: "rows that split frames", values: ["/"] });
  });
  it("library_deployment: one step per frame, no row splitting", () => {
    expect(stepsPerFrame(libDep)).toEqual({ label: "steps per frame", value: "1", splitting: [] });
    expect(headList(libDep)!.at(-1)).toEqual([{ label: "steps per frame", values: ["1"], prose: true }]);
  });
  it("a proposing method takes a range up to ⌊Δt_frame / h_min⌋ and the list shows h_min and attempt_budget after h_max (an inline copy)", () => {
    const proposing = edited("library_deployment", (d) => {
      d.deployment.algorithm = { text: "BS3(reltol = 1.0e-6, abstol = 1.0e-9)", proposes: true };
      d.deployment.h_min = { num: 1, den: 400 };
    });
    expect(stepsPerFrame(proposing)!.value).toBe("1 to 4, as proposed");
    expect(headList(proposing)!.map((l) => l.map((x) => x.label))).toEqual([
      ["Δt_frame", "Δt_base"], ["algorithm", "h_max", "h_min", "attempt_budget"], ["steps per frame"],
    ]);
    expect(headList(proposing)![1].map((x) => x.values[0])).toEqual(["BS3(reltol = 1.0e-6, abstol = 1.0e-9)", "1/100 s", "1/400 s", "7"]);
  });
  it("a proposing method with no h_min shows attempt_budget alone, a fixed-step one with h_min set neither (inline copies)", () => {
    const line = (edit: (d: any) => void) => headList(edited("library_deployment", edit))![1].map((x) => x.label);
    expect(line((d) => (d.deployment.algorithm.proposes = true))).toEqual(["algorithm", "h_max", "attempt_budget"]);
    expect(line((d) => (d.deployment.h_min = { num: 1, den: 400 }))).toEqual(["algorithm", "h_max"]);
  });
  it("the upper count is never below the lower", () => {
    const floor = edited("library_deployment", (d) => {
      d.deployment.algorithm = { text: "BS3()", proposes: true };
      d.deployment.h_max = { num: 1, den: 150 };
      d.deployment.h_min = { num: 1, den: 120 };
    });
    expect(stepsPerFrame(floor)!.value).toBe("2 to 2, as proposed");
  });
  it("a frame of one and a half base ticks: ⌈Δt_frame / h_max⌉ steps, and every row splits (an inline copy)", () => {
    const m = edited("library_deployment", (d) => (d.deployment.dt_frame = { num: 3, den: 200 }));
    const steps = stepsPerFrame(m)!;
    expect(steps.label).toBe("steps per unsplit frame");
    expect(steps.value).toBe("2");
    expect(steps.splitting).toHaveLength(13);
  });
});

describe("the hyperperiod and the joint period (answers 8 and 11)", () => {
  it("is the lcm of the rows' D: 360, 10 and 40; none for a build or a deployment with no rows", () => {
    expect(hyperperiod(timingDep)).toBe(360n);
    expect(hyperperiod(libDep)).toBe(10n);
    expect(hyperperiod(fixtureModel("rates_deployment"))).toBe(40n);
    expect(hyperperiod(fixtureModel("timing"))).toBeUndefined();
    const empty = edited("closed_loop_deployment", (d) => (d.deployment.schedule.rows = []));
    expect(hyperperiod(empty)).toBeUndefined();
    expect(jointPeriod(empty)).toBeUndefined();
    expect(chartRows(empty)).toEqual([]);
  });
  it("is exact past 2^53, for coprime periods", () => {
    const coprime = edited("closed_loop_deployment", (d) => {
      const ps = [2147483647, 2147483629, 2147483587];
      d.deployment.schedule.rows = d.deployment.schedule.rows.slice(0, 3).map((r: any, i: number) => ({ ...r, D: ps[i], phi: 0 }));
    });
    expect(hyperperiod(coprime)).toBe(2147483647n * 2147483629n * 2147483587n);
  });
  it("spans the lcm of the hyperperiod and the frame in time: timing 6/5 s, rates 1/5 s, a 3/200 s frame 3/10 s", () => {
    expect(jointPeriod(timingDep)).toEqual({ hyperperiod: 360n, hyperSeconds: q(6, 5), seconds: q(6, 5), baseTicks: 360n, frames: 120n, frameInTicks: q(3) });
    expect(jointPeriod(fixtureModel("rates_deployment"))).toMatchObject({ seconds: q(1, 5), baseTicks: 40n, frames: 20n, frameInTicks: q(2) });
    const m = edited("library_deployment", (d) => (d.deployment.dt_frame = { num: 3, den: 200 }));
    expect(jointPeriod(m)).toMatchObject({ hyperperiod: 10n, seconds: q(3, 10), baseTicks: 30n, frames: 20n, frameInTicks: q(3, 2) });
  });
});

describe("the frame lines and the chart's rows (answer 11)", () => {
  it("draws the frame tops only where some base tick is not one; else the caption gives the frames in one base tick", () => {
    expect(frameLines(fixtureModel("rates_deployment"))).toEqual({ drawn: true });
    expect(frameLines(timingDep)).toEqual({ drawn: true });
    expect(frameLines(libDep)).toEqual({ drawn: false, framesPerTick: 1n, caption: "every base tick is a frame top: 1 frame in one base tick" });
    const fine = edited("library_deployment", (d) => {
      d.deployment.dt_frame = { num: 1, den: 200 };
      d.deployment.h_max = { num: 1, den: 200 };
    });
    expect(frameLines(fine)).toEqual({ drawn: false, framesPerTick: 2n, caption: "every base tick is a frame top: 2 frames in one base tick" });
    expect(frameLines(fixtureModel("library"))).toBeUndefined();
  });
  it("library_deployment: four rows by D then Φ, (2, 0) with two swatches in palette order", () => {
    expect(chartRows(libDep).map((r) => [r.label, r.swatches.map((s) => s.key), r.countText, r.splits])).toEqual([
      ["D 1 · Φ 0", ["0,1,0"], "9 primitives", false],
      ["D 2 · Φ 0", ["0,2,0", "2,1,0"], "2 primitives", false],
      ["D 2 · Φ 1", ["0,2,1"], "1 primitive", false],
      ["D 10 · Φ 0", ["1,1,0"], "1 primitive", false],
    ]);
    expect(chartRows(libDep)[1].swatches.map((s) => s.step)).toEqual([1, 3]);
  });
  it("closed_loop_deployment: one row of ten swatches; timing_deployment's staggered row splits frames", () => {
    const one = chartRows(fixtureModel("closed_loop_deployment"));
    expect(one).toHaveLength(1);
    expect([one[0].label, one[0].swatches.length, one[0].count]).toEqual(["D 2 · Φ 0", 10, 10]);
    expect(chartRows(timingDep).map((r) => [r.label, r.splits])).toEqual([
      ["D 6 · Φ 0", false], ["D 12 · Φ 6", false], ["D 24 · Φ 18", false], ["D 30 · Φ 1", true], ["D 36 · Φ 18", false],
    ]);
  });
  it("a row is due at base tick k where k mod D = Φ", () => {
    const row = chartRows(libDep)[2];
    expect([0n, 1n, 2n, 3n].map(row.due)).toEqual([false, true, false, true]);
  });
});

describe("the chart's fit (answer 11, rulings 9 and 16)", () => {
  /** The fit of a model's chart at a width, the frame lines read from the model. */
  const fitOf = (m: Model, width: number, threshold?: number) => chartFit(jointPeriod(m)!, frameLines(m)!, width, threshold);
  it("fits the width while a base tick gets at least the pitch, else scrolls at the pitch", () => {
    expect(fitOf(libDep, 1000)).toEqual({ kind: "fit", finer: "base tick", units: 10n, tickPx: 100, width: 1000 });
    expect(fitOf(timingDep, 1000)).toEqual({ kind: "scroll", finer: "base tick", units: 360n, tickPx: 6, width: 2160 });
  });
  it("past the threshold omits the timeline with one line of its length in base ticks and seconds", () => {
    expect(fitOf(timingDep, 1000, 100)).toEqual({ kind: "omitted", line: "chart omitted: the joint period is 360 base ticks (6/5 s)" });
    expect(fitOf(timingDep, 1000, 360).kind).toBe("scroll");
  });
  it("counts the frame tops too, and gives the pitch to the frame where it is finer than the base tick and does not divide it", () => {
    const fine = edited("library_deployment", (d) => {
      d.deployment.dt_frame = { num: 1, den: 250 };
      d.deployment.h_max = { num: 1, den: 250 };
    });
    const joint = jointPeriod(fine)!;
    expect([joint.baseTicks, joint.frames, frameLines(fine)!.drawn]).toEqual([10n, 25n, true]);
    expect(fitOf(fine, 100)).toEqual({ kind: "scroll", finer: "frame", units: 25n, tickPx: 15, width: 150 });
    expect(fitOf(fine, 1000)).toEqual({ kind: "fit", finer: "frame", units: 25n, tickPx: 100, width: 1000 });
    expect(fitOf(fine, 1000, 15).kind).toBe("omitted");
  });
  it("counts no frame where Δt_frame divides Δt_base, no frame top being drawn: timing at a tenth of its tick keeps its 360 ticks (an inline copy)", () => {
    const fine = edited("timing_deployment", (d) => {
      d.deployment.dt_frame = { num: 1, den: 3000 };
      d.deployment.h_max = { num: 1, den: 3000 };
    });
    expect([jointPeriod(fine)!.baseTicks, jointPeriod(fine)!.frames]).toEqual([360n, 3600n]);
    expect(frameLines(fine)).toEqual({ drawn: false, framesPerTick: 10n, caption: "every base tick is a frame top: 10 frames in one base tick" });
    expect(fitOf(fine, 1000)).toEqual({ kind: "scroll", finer: "base tick", units: 360n, tickPx: 6, width: 2160 });
  });
  it("gives the pitch to the base tick where Δt_frame divides it: library at a tenth of its tick fits 10 ticks in 300 px (an inline copy)", () => {
    const fine = edited("library_deployment", (d) => {
      d.deployment.dt_frame = { num: 1, den: 1000 };
      d.deployment.h_max = { num: 1, den: 1000 };
    });
    expect(jointPeriod(fine)!.frames).toBe(100n);
    expect(frameLines(fine)!.caption).toBe("every base tick is a frame top: 10 frames in one base tick");
    expect(fitOf(fine, 300)).toEqual({ kind: "fit", finer: "base tick", units: 10n, tickPx: 30, width: 300 });
  });
});

describe("the chart's lines and geometry (answers 8 and 11)", () => {
  it("states the hyperperiod in base ticks with the seconds in parentheses, and the joint period only where it outlasts the hyperperiod", () => {
    expect(hyperperiodLine(jointPeriod(libDep)!)).toBe("hyperperiod: 10 base ticks (1/10 s)");
    expect(hyperperiodLine(jointPeriod(timingDep)!)).toBe("hyperperiod: 360 base ticks (6/5 s)");
    expect(jointLine(jointPeriod(timingDep)!)).toBeUndefined();
    expect(jointLine(jointPeriod(fixtureModel("rates_deployment"))!)).toBeUndefined();
    const m = edited("library_deployment", (d) => (d.deployment.dt_frame = { num: 3, den: 200 }));
    expect(hyperperiodLine(jointPeriod(m)!)).toBe("hyperperiod: 10 base ticks (1/10 s)");
    expect(jointLine(jointPeriod(m)!)).toBe("the chart spans the joint period with Δt_frame: 30 base ticks (3/10 s), 20 frames");
  });
  it("reads a count of one in the singular: a hyperperiod of 1 base tick, a joint period of 1 frame", () => {
    const root = primitiveRootDep({ num: 1, den: 100 });
    expect(hyperperiodLine(jointPeriod(root)!)).toBe("hyperperiod: 1 base tick (1/150 s)");
    expect(jointLine(jointPeriod(root)!)).toBe("the chart spans the joint period with Δt_frame: 3 base ticks (1/50 s), 2 frames");
    const one = primitiveRootDep({ num: 1, den: 50 });
    expect(jointLine(jointPeriod(one)!)).toBe("the chart spans the joint period with Δt_frame: 3 base ticks (1/50 s), 1 frame");
  });
  it("puts base tick k at k pitches from the margin, and frame top j at j·Δt_frame/Δt_base ticks, between ticks when that is no whole", () => {
    const fit = chartFit(jointPeriod(timingDep)!, frameLines(timingDep)!, 1000) as DrawnFit;
    expect([tickX(0n, fit), tickX(5n, fit)]).toEqual([CHART_PAD, CHART_PAD + 30]);
    expect(frameTopX(2n, jointPeriod(timingDep)!, fit)).toBe(tickX(6n, fit));
    const m = edited("library_deployment", (d) => (d.deployment.dt_frame = { num: 3, den: 200 }));
    const joint = jointPeriod(m)!, half = chartFit(joint, frameLines(m)!, 600) as DrawnFit;
    expect(half.tickPx).toBe(20);
    expect([frameTopX(1n, joint, half), frameTopX(2n, joint, half)]).toEqual([CHART_PAD + 30, tickX(3n, half)]);
  });
  it("marks a row due from Φ every D base ticks over the joint period", () => {
    const joint = jointPeriod(libDep)!, rows = chartRows(libDep);
    expect(rows.map((r) => dueTicks(r, joint))).toEqual([
      [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n], [0n, 2n, 4n, 6n, 8n], [1n, 3n, 5n, 7n, 9n], [0n],
    ]);
    const tj = jointPeriod(timingDep)!, staggered = chartRows(timingDep).find((r) => r.D === 30)!;
    expect(dueTicks(staggered, tj)).toEqual(Array.from({ length: 12 }, (_, i) => BigInt(1 + 30 * i)));
    for (const r of chartRows(timingDep)) for (const k of dueTicks(r, tj)) expect(r.due(k)).toBe(true);
  });
});

describe("the pane's frames table and the chain line (answer 10)", () => {
  const rows = (m: Model, p: string) => framesTable(m, p)!.rows.map((r) => [r.frame, r.name, r.period, r.phase, r.unit]);
  it("timing_deployment's fast/outer/hold is answer 10's example, its chain the core's", () => {
    expect(rows(timingDep, "fast/outer/hold")).toEqual([
      ["scope", "fast/outer", "K = 3", "φ = 1", "ticks of fast/outer"],
      ["anchor", "A₂ (fast)", "m = 6", "c = 3", "ticks of A₂"],
      ["base grid", "", "D = 36", "Φ = 18", "base ticks"],
      ["seconds", "", "Δt = 3/25 s", "τ = 3/50 s", ""],
    ]);
    expect(chainLine(timingDep, "fast/outer/hold")).toBe("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → hold = Relative(3, 1)");
  });
  it("a build has no base grid row; an explicit Relative(1) shows in the chain alone", () => {
    expect(rows(fixtureModel("timing"), "fast/outer/same")).toEqual([
      ["scope", "fast/outer", "K = 1", "φ = 0", "ticks of fast/outer"],
      ["anchor", "A₂ (fast)", "m = 2", "c = 1", "ticks of A₂"],
      ["seconds", "", "Δt = 1/25 s", "τ = 1/50 s", ""],
    ]);
    expect(chainLine(fixtureModel("timing"), "fast/outer/same")).toBe("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → same = Relative(1, 0)");
  });
  it("a component with its own Absolute entry has no scope row, its anchor's name titled with the declaring key and scope", () => {
    expect(rows(timingDep, "staggered")).toEqual([
      ["anchor", "A₁ (staggered)", "m = 1", "c = 0", "ticks of A₁"],
      ["base grid", "", "D = 30", "Φ = 1", "base ticks"],
      ["seconds", "", "Δt = 1/10 s", "τ = 1/300 s", ""],
    ]);
    expect(framesTable(timingDep, "staggered")!.rows[0].nameTitle).toBe("staggered at the root");
    expect(framesTable(fixtureModel("library"), "d_pid")!.rows.map((r) => r.nameTitle)).toEqual([undefined, "the base grid", undefined]);
    expect(chainLine(timingDep, "staggered")).toBe("staggered = Absolute(1//10, 1//300)");
  });
  it("the nested scope deep divides by mₛ = 2 and subtracts cₛ = 1; the primitive under it is its (1, 0)", () => {
    expect(scopeFramesTable(timingDep, "fast/outer/deep")!.rows[0]).toMatchObject({ name: "fast/outer", period: "K = 2", phase: "φ = 1" });
    expect(rows(timingDep, "fast/outer/deep/hold")[0]).toEqual(["scope", "fast/outer/deep", "K = 1", "φ = 0", "ticks of fast/outer/deep"]);
  });
  it("a scope with its own Absolute entry has no scope row either: fast", () => {
    expect(scopeFramesTable(timingDep, "fast")!.rows.map((r) => [r.frame, r.name, r.nameTitle])).toEqual([
      ["anchor", "A₂ (fast)", "fast at the root"], ["base grid", "", undefined], ["seconds", "", undefined],
    ]);
  });
  it("carries the seconds pair for the heading: exact, and a build's on A₀ symbolic", () => {
    expect(framesTable(timingDep, "staggered")!.pair).toEqual(["Δt 1/10 s", "τ 1/300 s"]);
    expect(scopeFramesTable(timingDep, "fast/outer")!.pair).toEqual(["Δt 1/25 s", "τ 1/50 s"]);
    expect(framesTable(fixtureModel("library"), "d_pid")!.pair).toEqual(["Δt 2·Δt_base", "τ Δt_base"]);
    expect(framesTable(libDep, "d_pid")!.pair).toEqual(["Δt 1/50 s", "τ 1/100 s"]);
  });
  it("library: a component under no keyed assembly reads the root in base ticks, its seconds in Δt_base; no entry, no chain", () => {
    expect(rows(fixtureModel("library"), "d_pid")).toEqual([
      ["scope", "the root", "K = 2", "φ = 1", "base ticks"],
      ["anchor", "A₀ (base)", "m = 2", "c = 1", "base ticks"],
      ["seconds", "", "Δt = 2·Δt_base", "τ = Δt_base", ""],
    ]);
    expect(chainLine(fixtureModel("library"), "d_lqr")).toBeUndefined();
  });
  it("the nearest scope can be a grandparent: rates with fast/outer unkeyed reads hold against fast (an inline structure)", () => {
    const m = edited("rates", (d) => {
      const s = d.build.structure;
      s.scopes = s.scopes.filter((x: any) => x.path !== "fast/outer");
      s.nodes.find((n: any) => n.path === "fast/outer/hold").timing = { anchor: 1, m: 2, c: 1 };
    });
    expect(rows(m, "fast/outer/hold")[0]).toEqual(["scope", "fast", "K = 2", "φ = 1", "ticks of fast"]);
  });
  it("a discrete primitive root reads the root as its scope (an inline structure)", () => {
    const root = edited("primitive", (d) => {
      const n = d.build.structure.nodes[0];
      n.tier = "discrete";
      n.timing = { anchor: 0, m: 2, c: 1 };
    });
    expect(rows(root, "")[0]).toEqual(["scope", "the root", "K = 2", "φ = 1", "base ticks"]);
  });
  it("gives no table for a continuous primitive or an assembly, nor a scope's for a node that is none", () => {
    expect(framesTable(timingDep, "frozen")).toBeUndefined();
    expect(framesTable(timingDep, "fast")).toBeUndefined();
    expect(scopeFramesTable(timingDep, "")).toBeUndefined();
    expect(scopeFramesTable(timingDep, "staggered")).toBeUndefined();
  });
});

describe("the legend's line (answer 13)", () => {
  it("library: which clock and how fast, the A₀ lines symbolic in a build and concrete in a deployment", () => {
    const lib = fixtureModel("library");
    expect(legendText(lib, [0, 1, 0])).toEqual({ text: "A₀ (base) · m 1 · c 0", dt: "Δt_base", title: "τ 0; the base grid" });
    expect(legendText(lib, [0, 2, 1])).toEqual({ text: "A₀ (base) · m 2 · c 1", dt: "2·Δt_base", title: "τ Δt_base; the base grid" });
    expect(legendText(lib, [2, 1, 0])).toEqual({ text: "A₂ (dss) · m 1 · c 0", dt: "1/50 s", title: "τ 0; dss at the root" });
    expect(legendText(libDep, [0, 2, 1])).toEqual({ text: "A₀ (base) · m 2 · c 1", dt: "1/50 s", title: "D 2 · Φ 1 · τ 1/100 s; the base grid" });
    expect(legendText(libDep, [1, 1, 0]).dt).toBe("1/10 s");
  });
  it("timing_deployment: the tooltip's D, Φ and τ through the anchor's Φₖ", () => {
    expect(legendText(timingDep, [1, 1, 0])).toEqual({ text: "A₁ (staggered) · m 1 · c 0", dt: "1/10 s", title: "D 30 · Φ 1 · τ 1/300 s; staggered at the root" });
  });
});
