import { describe, expect, it } from "vitest";
import {
  anchorRows, componentRows, orderBadge, orderRows, ranges, rootInputRows, rowTarget, scheduleNote, scopeRows,
} from "./analysis";
import { fixtureModel } from "./fixtures";
import type { Model } from "./model";
import type { Face } from "./resolve";

// Counts from the oracle, `scratchpad/oracle/analysis.py` over the committed fixtures.
const cl = fixtureModel("closed_loop");
const rates = fixtureModel("rates");
const lib = fixtureModel("library");
const prim = fixtureModel("primitive");
const text = (f: Face) => `${f.path}/${f.port}`;
/** A copy of a model whose execution order lacks some leaves. */
const without = (m: Model, ...paths: string[]): Model => ({ ...m, outputs: { ...m.outputs!, order: m.outputs!.order.filter((p) => !paths.includes(p)) } });

describe("orderRows", () => {
  it("numbers closed_loop's 24 leaves from 1 with their stage ports as the components rows spell them", () => {
    const rows = orderRows(cl);
    expect(rows).toHaveLength(24);
    expect(rows.map((r) => r.position)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    expect(rows[0]).toMatchObject({ position: 1, path: "plant", stage1: ["V", "γ", "θ", "q", "h", "α"], stage2: [] });
    expect(rows[14]).toMatchObject({ position: 15, path: "pid_controller/h_ctl", stage1: ["saturated"], stage2: ["u", "u_raw"] });
    expect(rows[23]).toMatchObject({ position: 24, path: "actuators/δt_limiter", stage1: [], stage2: ["y"] });
  });

  it("puts closed_loop's 16 feedthrough edges under their consumers' rows, five under the tracker's", () => {
    const rows = orderRows(cl);
    expect(rows.flatMap((r) => r.edges)).toHaveLength(16);
    const by = Object.fromEntries(rows.filter((r) => r.edges.length).map((r) => [r.position, r.edges.length]));
    expect(by).toEqual({ 15: 1, 16: 1, 17: 1, 18: 5, 19: 1, 20: 1, 21: 2, 22: 2, 23: 1, 24: 1 });
    expect(rows[17].path).toBe("lqr_controller/tracker");
    expect(rows[16].edges.map((e) => [text(e.from), text(e.to)])).toEqual([["pid_controller/h_ctl/u", "pid_controller/θ_ctl/r"]]);
    // every edge ends at its row's leaf, in feedthroughEdges' order
    for (const r of rows) for (const e of r.edges) expect(e.to.path).toBe(r.path);
    expect(rows.flatMap((r) => r.edges).map((e) => [e.from, e.to])).toEqual(cl.feedthrough!.map((e) => [e.from, e.to]));
  });

  it("gives library 32 rows and 14 edges, three under rows 28, 29 and 31", () => {
    const rows = orderRows(lib);
    expect(rows).toHaveLength(32);
    expect(rows.flatMap((r) => r.edges)).toHaveLength(14);
    expect([28, 29, 31].map((p) => rows[p - 1].edges.length)).toEqual([3, 3, 3]);
  });

  it("gives a failure no rows and a primitive root its leaf", () => {
    expect(orderRows(fixtureModel("failure_cycle"))).toEqual([]);
    expect(orderRows(prim)).toMatchObject([{ position: 1, path: "", stage1: ["y"], stage2: ["power"], edges: [] }]);
  });
});

describe("orderBadge", () => {
  it("reads runs with an en dash: 3–5, 8; a run of two 2–3; a single 3", () => {
    expect(ranges([8, 3, 4, 5])).toBe("3–5, 8");
    expect(ranges([2, 3])).toBe("2–3");
    expect(ranges([3])).toBe("3");
  });

  it("badges closed_loop's assemblies by their leaves' positions and its leaves by their own", () => {
    expect(Object.fromEntries(["sensing", "pid_controller", "lqr_controller", "selection", "actuators", "plant"].map((p) => [p, orderBadge(cl, p)]))).toEqual({
      sensing: "2–3", pid_controller: "4–5, 15, 17, 19", lqr_controller: "6–10, 16, 18, 20", selection: "11–12, 21–22",
      actuators: "13–14, 23–24", plant: "1",
    });
    expect(orderBadge(cl, "pid_controller/h_ctl")).toBe("15");
    expect(orderBadge(cl, "pid_controller/free")).toBe("5");
  });

  it("badges rates' nested assemblies and primitive's root leaf", () => {
    expect(["fast", "fast/outer", "slow"].map((p) => orderBadge(rates, p))).toEqual(["2–3", "3", "4"]);
    expect(orderBadge(prim, "")).toBe("1");
  });

  it("gives no badge to a leaf absent from the order, an assembly with none beneath, or a model without outputs", () => {
    const m = without(cl, "plant", "sensing/noise", "sensing/altimeter");
    expect(orderBadge(m, "plant")).toBeUndefined();
    expect(orderBadge(m, "sensing")).toBeUndefined();
    expect(orderBadge(m, "pid_controller")).toBe("1–2, 12, 14, 16");
    const fc = fixtureModel("failure_cycle");
    for (const n of fc.structure!.nodes) expect(orderBadge(fc, n.path), n.path).toBeUndefined();
  });
});

describe("rootInputRows", () => {
  it("lists closed_loop's three with their kind phrases and terminal consumers", () => {
    const rows = rootInputRows(cl);
    expect(rows.map((r) => [r.name, r.type, r.phrase, r.pinned, r.consumers.length])).toEqual([
      ["h_ref", "Float64", "float", false, 2], ["V_ref", "Float64", "float", false, 2], ["mode", "Bool", "boolean", false, 7],
    ]);
    expect(rows[0].consumers.map(text)).toEqual(["pid_controller/h_ctl/r", "lqr_controller/z_ref_pack/in1"]);
    expect(new Set(rows[2].consumers.map(text))).toEqual(new Set([
      "pid_controller/h_ctl/engaged", "pid_controller/θ_ctl/engaged", "pid_controller/q_ctl/engaged", "pid_controller/V_ctl/engaged",
      "lqr_controller/engaged/in1", "selection/select_δe/select", "selection/select_δt/select",
    ]));
  });

  it("gives kinds none and primitive two on its leaf, which consume nothing beyond it", () => {
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
  it("lists rates' three discrete leaves with their periods", () => {
    expect(componentRows(rates).map((r) => [r.path, r.text, r.period, r.step])).toEqual([
      ["fast/inner", "anchor 1 (1/50 s)", "1/50 s", 0],
      ["fast/outer/hold", "anchor 1 (1/50 s) × 2", "1/25 s", 1],
      ["slow/hold", "anchor 2 (1/10 s)", "1/10 s", 2],
    ]);
  });

  it("lists library's 12 in walk order and, by period, anchor 0's triples first then period ascending, ties in walk order", () => {
    const walk = componentRows(lib).map((r) => r.path);
    expect(walk).toEqual(["noise", "unit_delay", "d_integrator", "rate_limiter", "dss", "dtf", "zoh_ss", "zoh_tf", "d_limited", "delay", "d_pid", "d_lqr"]);
    expect(componentRows(lib, true).map((r) => r.path)).toEqual([
      "unit_delay", "d_integrator", "rate_limiter", "dtf", "zoh_ss", "zoh_tf", "delay", "d_lqr", "d_limited", "d_pid", "dss", "noise",
    ]);
    const by = Object.fromEntries(componentRows(lib).map((r) => [r.path, r.period]));
    expect([by.unit_delay, by.d_limited, by.d_pid, by.dss, by.noise]).toEqual(["1 base tick", "2 base ticks", "2 base ticks", "1/50 s", "1/10 s"]);
    expect(componentRows(lib)).toHaveLength(12);
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
    const order = orderRows(cl);
    expect(rowTarget(cl, order[23])).toEqual({ level: "actuators", target: { kind: "block", id: "actuators/δt_limiter" } });
    expect(rowTarget(cl, order[0])).toEqual({ level: "", target: { kind: "block", id: "plant" } });
    expect(rowTarget(cl, order[16].edges[0])).toEqual({ level: "pid_controller", target: { kind: "port", id: "pid_controller/θ_ctl|in|r" } });
    expect(rowTarget(cl, rootInputRows(cl)[0])).toEqual({ level: "", target: { kind: "block", id: "⟨in⟩h_ref" } });
    const anchors = anchorRows(cl);
    expect(rowTarget(cl, anchors[0])).toBeUndefined();
    expect(rowTarget(cl, anchors[1])).toEqual({ level: "", target: { kind: "block", id: "sensing" } });
    expect(rowTarget(rates, anchorRows(rates)[1])).toBeUndefined();
    expect(rowTarget(rates, scopeRows(rates)[1])).toEqual({ level: "fast", target: { kind: "block", id: "fast/outer" } });
    expect(rowTarget(cl, componentRows(cl)[0])).toEqual({ level: "sensing", target: { kind: "block", id: "sensing/noise" } });
  });

  it("selects a primitive root's leaf on the root level, and its root input's tag there", () => {
    expect(rowTarget(prim, orderRows(prim)[0])).toEqual({ level: "", target: { kind: "block", id: "" } });
    expect(rowTarget(prim, rootInputRows(prim)[0])).toEqual({ level: "", target: { kind: "block", id: "⟨in⟩u" } });
  });
});

describe("a structureless model", () => {
  it("gives every function its empty result", () => {
    const m = fixtureModel("failure_structure");
    expect([orderRows(m), rootInputRows(m), anchorRows(m), scopeRows(m), componentRows(m), componentRows(m, true)]).toEqual([[], [], [], [], [], []]);
    expect(orderBadge(m, "")).toBeUndefined();
    expect(scheduleNote(m)).toBeUndefined();
    expect(rowTarget(m, { kind: "order", position: 1, path: "", stage1: [], stage2: [], edges: [] })).toBeUndefined();
  });
});
