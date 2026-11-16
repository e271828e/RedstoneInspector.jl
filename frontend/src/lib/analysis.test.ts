import { describe, expect, it } from "vitest";
import {
  anchorRows, componentRows, orderBadge, orderGroups, ranges, rootInputRows, rowTarget, scheduleNote, scopeRows,
} from "./analysis";
import { fixtureModel } from "./fixtures";
import type { Model } from "./model";
import type { Face } from "./resolve";

// Counts from the oracles over the committed fixtures: `scratchpad/oracle/analysis.py`, and `stage2.py` for the two
// groups and the badges.
const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const lib = fixtureModel("library");
const prim = fixtureModel("primitive");
const text = (f: Face) => `${f.path}/${f.port}`;
/** A copy of a model whose execution order lacks some primitives. */
const without = (m: Model, ...paths: string[]): Model => ({ ...m, outputs: { ...m.outputs!, order: m.outputs!.order.filter((p) => !paths.includes(p)) } });
/** A copy of a model in which some primitives publish no output port, which no fixture has. */
const portless = (m: Model, ...paths: string[]): Model => ({
  ...m, outputs: { ...m.outputs!, components: m.outputs!.components.map((c) => (paths.includes(c.path) ? { ...c, stage1: [], stage2: [] } : c)) },
});
const groups = (m: Model) => orderGroups(m)!;
/** The group sizes: the order, the first group, the second, and the paths in both. */
const sizes = (m: Model) => {
  const g = groups(m), one = new Set(g.stage1.map((r) => r.path));
  return [m.outputs!.order.length, g.stage1.length, g.stage2.length, g.stage2.filter((r) => one.has(r.path)).length];
};

describe("orderGroups", () => {
  it("splits closed_loop's 24 into 13 with a stage 1 port and 16 with a stage 2 port, 5 in both, in outputs.order's order", () => {
    expect(sizes(cl)).toEqual([24, 13, 16, 5]);
    const g = groups(cl);
    const order = cl.outputs!.order;
    for (const rows of [g.stage1, g.stage2]) {
      const at = rows.map((r) => order.indexOf(r.path));
      expect(at).toEqual([...at].sort((a, b) => a - b));
    }
    expect(g.stage1[0]).toEqual({ kind: "order", stage: 1, path: "plant", ports: ["V", "γ", "θ", "q", "h", "α"] });
  });

  it("numbers closed_loop's second group from 1 in outputs.order's order", () => {
    const g = groups(cl);
    expect(g.stage2.map((r) => r.path)).toEqual([
      "sensing/altimeter", "pid_controller/V_ctl", "lqr_controller/state_pack", "lqr_controller/z_ref_pack",
      "lqr_controller/command_pack", "lqr_controller/engaged", "pid_controller/h_ctl", "lqr_controller/z_pack",
      "pid_controller/θ_ctl", "lqr_controller/tracker", "pid_controller/q_ctl", "lqr_controller/u_unpack",
      "selection/select_δe", "selection/select_δt", "actuators/δe_limiter", "actuators/δt_limiter",
    ]);
    expect(g.stage2.map((r) => r.position)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it("shows a row in both groups with that group's ports alone: h_ctl's saturated first, its u and u_raw at 7", () => {
    const g = groups(cl);
    expect(g.stage1.find((r) => r.path === "pid_controller/h_ctl")).toEqual({ kind: "order", stage: 1, path: "pid_controller/h_ctl", ports: ["saturated"] });
    expect(g.stage2.find((r) => r.path === "pid_controller/h_ctl")).toMatchObject({ position: 7, ports: ["u", "u_raw"] });
  });

  it("puts closed_loop's 16 feedthrough edges under their consumers' stage 2 rows, five under the tracker's at 10", () => {
    const rows = groups(cl).stage2;
    expect(rows.flatMap((r) => r.edges)).toHaveLength(16);
    const tracker = rows.find((r) => r.path === "lqr_controller/tracker")!;
    expect([tracker.position, tracker.edges.length]).toEqual([10, 5]);
    expect(rows[8].edges.map((e) => [text(e.from), text(e.to)])).toEqual([["pid_controller/h_ctl/u", "pid_controller/θ_ctl/r"]]);
    // every edge ends at its row's primitive, in feedthroughEdges' order
    for (const r of rows) for (const e of r.edges) expect(e.to.path).toBe(r.path);
    expect(rows.flatMap((r) => r.edges).map((e) => [e.from, e.to])).toEqual(cl.feedthrough!.map((e) => [e.from, e.to]));
    // a first-group row carries no edges
    for (const r of groups(cl).stage1) expect(r).not.toHaveProperty("edges");
  });

  it("gives library 41 as 25 and 18 with 2 in both and its 16 edges, three under d_lqr, lqr and switch at 12, 13 and 16", () => {
    expect(sizes(lib)).toEqual([41, 25, 18, 2]);
    const rows = groups(lib).stage2;
    expect(rows.flatMap((r) => r.edges)).toHaveLength(16);
    expect([12, 13, 16].map((p) => [rows[p - 1].path, rows[p - 1].edges.length])).toEqual([["d_lqr", 3], ["lqr", 3], ["switch", 3]]);
  });

  it("gives rates 4 as 1 and 3, containers 6 as 0 and 6, large 160 as 160 and 0, primitive's root in both", () => {
    expect(sizes(rates)).toEqual([4, 1, 3, 0]);
    expect(groups(rates).stage2.map((r) => [r.position, r.path])).toEqual([[1, "fast/inner"], [2, "fast/outer/hold"], [3, "slow/hold"]]);
    expect(sizes(fixtureModel("containers"))).toEqual([6, 0, 6, 0]);
    expect(sizes(fixtureModel("large"))).toEqual([160, 160, 0, 0]);
    expect(groups(prim)).toEqual({
      stage1: [{ kind: "order", stage: 1, path: "", ports: ["y"] }],
      stage2: [{ kind: "order", stage: 2, position: 1, path: "", ports: ["power"], edges: [] }],
    });
  });

  it("leaves a primitive with no output port out of both groups and out of the numbering", () => {
    const m = portless(cl, "plant", "pid_controller/h_ctl");
    expect(sizes(m)).toEqual([24, 11, 15, 4]);
    const g = groups(m);
    expect([...g.stage1, ...g.stage2].map((r) => r.path)).not.toContain("plant");
    expect([...g.stage1, ...g.stage2].map((r) => r.path)).not.toContain("pid_controller/h_ctl");
    expect(g.stage2.map((r) => r.position)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(g.stage2[6].path).toBe("lqr_controller/z_pack");
    expect(orderBadge(m, "pid_controller/h_ctl")).toBeUndefined();
    expect(orderBadge(m, "pid_controller")).toBe("2, 8, 10");
  });

  it("gives a model without outputs no groups", () => {
    expect(orderGroups(fixtureModel("failure_cycle"))).toBeUndefined();
  });
});

describe("orderBadge", () => {
  it("reads runs with an en dash: 3–5, 8; a run of two 2–3; a single 3", () => {
    expect(ranges([8, 3, 4, 5])).toBe("3–5, 8");
    expect(ranges([2, 3])).toBe("2–3");
    expect(ranges([3])).toBe("3");
  });

  it("badges closed_loop's root assemblies by their stage 2 primitives' positions, and plant, with stage 1 alone, not at all", () => {
    expect(Object.fromEntries(["sensing", "pid_controller", "lqr_controller", "selection", "actuators", "plant"].map((p) => [p, orderBadge(cl, p)]))).toEqual({
      sensing: "1", pid_controller: "2, 7, 9, 11", lqr_controller: "3–6, 8, 10, 12", selection: "13–14", actuators: "15–16", plant: undefined,
    });
  });

  it("badges pid_controller's primitives by their own positions and free, with stage 1 alone, not at all", () => {
    expect(Object.fromEntries(["V_ctl", "h_ctl", "θ_ctl", "q_ctl", "free"].map((p) => [p, orderBadge(cl, `pid_controller/${p}`)]))).toEqual({
      V_ctl: "2", h_ctl: "7", θ_ctl: "9", q_ctl: "11", free: undefined,
    });
  });

  it("badges rates' nested assemblies and none on src, primitive's root, and nothing in large", () => {
    expect(["fast", "fast/outer", "slow", "src"].map((p) => orderBadge(rates, p))).toEqual(["1–2", "2", "3", undefined]);
    expect(orderBadge(prim, "")).toBe("1");
    const large = fixtureModel("large");
    for (const n of large.structure!.nodes) expect(orderBadge(large, n.path), n.path).toBeUndefined();
  });

  it("gives no badge to a primitive absent from the order, an assembly with none beneath, or a model without outputs", () => {
    const m = without(cl, "sensing/altimeter");
    expect(orderBadge(m, "sensing/altimeter")).toBeUndefined();
    expect(orderBadge(m, "sensing")).toBeUndefined();
    expect(orderBadge(m, "pid_controller")).toBe("1, 6, 8, 10");
    const fc = fixtureModel("failure_cycle");
    for (const n of fc.structure!.nodes) expect(orderBadge(fc, n.path), n.path).toBeUndefined();
  });
});

describe("rootInputRows", () => {
  it("lists closed_loop's three with their kind phrases and terminal consumers", () => {
    const rows = rootInputRows(cl);
    expect(rows.map((r) => [r.name, r.type, r.phrase, r.consumers.length])).toEqual([
      ["h_ref", "Float64", "float", 2], ["V_ref", "Float64", "float", 2], ["mode", "Bool", "boolean", 7],
    ]);
    expect(rows[0].consumers.map(text)).toEqual(["pid_controller/h_ctl/r", "lqr_controller/z_ref_pack/in1"]);
    expect(new Set(rows[2].consumers.map(text))).toEqual(new Set([
      "pid_controller/h_ctl/engaged", "pid_controller/θ_ctl/engaged", "pid_controller/q_ctl/engaged", "pid_controller/V_ctl/engaged",
      "lqr_controller/engaged/in1", "selection/select_δe/select", "selection/select_δt/select",
    ]));
  });

  it("gives kinds none and primitive two on its primitive, which consume nothing beyond it", () => {
    expect(rootInputRows(fixtureModel("kinds"))).toEqual([]);
    expect(rootInputRows(prim).map((r) => [r.name, r.consumers])).toEqual([["u", []], ["d", []]]);
  });
});

describe("anchorRows and scopeRows", () => {
  it("puts the base grid first, then closed_loop's 10 anchors at 1/50 s", () => {
    const rows = anchorRows(cl);
    expect(rows).toHaveLength(11);
    expect(rows[0]).toEqual({ kind: "anchor", index: 0, base: true });
    expect(rows[1]).toEqual({ kind: "anchor", index: 1, T: "1/50 s", tau: "0/1 s", scope: "sensing", key: "noise" });
    for (const r of rows.slice(1)) expect(!r.base && [r.T, r.tau]).toEqual(["1/50 s", "0/1 s"]);
    expect(rows.map((r) => r.index)).toEqual(Array.from({ length: 11 }, (_, i) => i));
  });

  it("gives rates two anchors at the root and three scopes with their triples", () => {
    expect(anchorRows(rates).slice(1)).toEqual([
      { kind: "anchor", index: 1, T: "1/50 s", tau: "0/1 s", scope: "", key: "fast" },
      { kind: "anchor", index: 2, T: "1/10 s", tau: "0/1 s", scope: "", key: "slow" },
    ]);
    expect(scopeRows(rates).map((r) => [r.path, r.key, r.triple, r.text])).toEqual([
      ["fast", "fast", [1, 1, 0], "anchor 1 (1/50 s)"],
      ["fast/outer", "outer", [1, 2, 0], "anchor 1 (1/50 s) × 2"],
      ["slow", "slow", [2, 1, 0], "anchor 2 (1/10 s)"],
    ]);
    expect(scopeRows(cl)).toEqual([]);
    expect(anchorRows(prim)).toEqual([{ kind: "anchor", index: 0, base: true }]);
  });
});

describe("componentRows", () => {
  it("lists rates' three discrete primitives with their periods", () => {
    expect(componentRows(rates).map((r) => [r.path, r.text, r.period, r.step])).toEqual([
      ["fast/inner", "anchor 1 (1/50 s)", "1/50 s", 0],
      ["fast/outer/hold", "anchor 1 (1/50 s) × 2", "1/25 s", 1],
      ["slow/hold", "anchor 2 (1/10 s)", "1/10 s", 2],
    ]);
  });

  it("lists library's 13 in walk order and, by period, anchor 0's triples first then period ascending, ties in walk order", () => {
    const walk = componentRows(lib).map((r) => r.path);
    expect(walk).toEqual(["noise", "unit_delay", "d_integrator", "rate_limiter", "dss", "dtf", "zoh_ss", "zoh_tf", "d_limited", "delay", "d_pid", "d_lqr", "backlash"]);
    expect(componentRows(lib, true).map((r) => r.path)).toEqual([
      "unit_delay", "d_integrator", "rate_limiter", "dtf", "zoh_ss", "zoh_tf", "delay", "d_lqr", "backlash", "d_limited", "d_pid", "dss", "noise",
    ]);
    const by = Object.fromEntries(componentRows(lib).map((r) => [r.path, r.period]));
    expect([by.unit_delay, by.d_limited, by.d_pid, by.dss, by.noise]).toEqual(["1 base tick", "2 base ticks", "2 base ticks", "1/50 s", "1/10 s"]);
    expect(componentRows(lib)).toHaveLength(13);
  });

  it("gives closed_loop 10, kinds 1 on the base grid, primitive none", () => {
    expect(componentRows(cl)).toHaveLength(10);
    expect(componentRows(fixtureModel("kinds")).map((r) => [r.path, r.text, r.period, r.step])).toEqual([["s", "base grid", "1 base tick", 0]]);
    expect(componentRows(prim)).toEqual([]);
  });
});

describe("scheduleNote", () => {
  it("tells a build it needs a deployment and a deployment that format 1.0 carries no schedule", () => {
    expect(scheduleNote(cl)).toBe("The schedule rows and the hyperperiod chart need a deployment.");
    expect(scheduleNote(fixtureModel("failure_cycle"))).toBe(scheduleNote(cl));
    expect(scheduleNote(fixtureModel("closed_loop_deployment"))).toBe(
      "This deployment carries no schedule: the format's version 1.0 holds the build alone, and the schedule rows and the hyperperiod chart wait for its next minor version.",
    );
  });
});

describe("rowTarget", () => {
  it("selects each row kind's element on its level, as a tree click does", () => {
    const g = groups(cl);
    expect(rowTarget(cl, g.stage2[15])).toEqual({ level: "actuators", target: { kind: "block", id: "actuators/δt_limiter" } });
    expect(rowTarget(cl, g.stage1[0])).toEqual({ level: "", target: { kind: "block", id: "plant" } });
    expect(rowTarget(cl, g.stage2[8].edges[0])).toEqual({ level: "pid_controller", target: { kind: "port", id: "pid_controller/θ_ctl|in|r" } });
    expect(rowTarget(cl, rootInputRows(cl)[0])).toEqual({ level: "", target: { kind: "block", id: "⟨in⟩h_ref" } });
    const anchors = anchorRows(cl);
    expect(rowTarget(cl, anchors[0])).toBeUndefined();
    expect(rowTarget(cl, anchors[1])).toEqual({ level: "", target: { kind: "block", id: "sensing" } });
    expect(rowTarget(rates, anchorRows(rates)[1])).toBeUndefined();
    expect(rowTarget(rates, scopeRows(rates)[1])).toEqual({ level: "fast", target: { kind: "block", id: "fast/outer" } });
    expect(rowTarget(cl, componentRows(cl)[0])).toEqual({ level: "sensing", target: { kind: "block", id: "sensing/noise" } });
  });

  it("selects a primitive root on the root level, and its root input's tag there", () => {
    expect(rowTarget(prim, groups(prim).stage1[0])).toEqual({ level: "", target: { kind: "block", id: "" } });
    expect(rowTarget(prim, groups(prim).stage2[0])).toEqual({ level: "", target: { kind: "block", id: "" } });
    expect(rowTarget(prim, rootInputRows(prim)[0])).toEqual({ level: "", target: { kind: "block", id: "⟨in⟩u" } });
  });
});

describe("a structureless model", () => {
  it("gives every function its empty result", () => {
    const m = fixtureModel("failure_structure");
    expect(orderGroups(m)).toBeUndefined();
    expect([rootInputRows(m), anchorRows(m), scopeRows(m), componentRows(m), componentRows(m, true)]).toEqual([[], [], [], [], []]);
    expect(orderBadge(m, "")).toBeUndefined();
    expect(scheduleNote(m)).toBeUndefined();
    expect(rowTarget(m, { kind: "order", stage: 2, position: 1, path: "", ports: [], edges: [] })).toBeUndefined();
  });
});
