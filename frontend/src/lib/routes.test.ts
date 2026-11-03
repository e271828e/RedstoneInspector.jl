// Face routes from the oracle (`overlay.py`'s `routes`, brief 7's scratchpad, over the committed fixtures).
import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import type { Face } from "./resolve";
import { originOf, rekeyRoute, routeDrawing, routeLevels, routeLit, routeOf, routeStatus, type Traced } from "./routes";

const sorted = (s: Iterable<string>) => [...s].sort();
const face = (path: string, side: "in" | "out", port: string): Face => ({ path, side, port });
function traced(name: string, origin: Face): Traced {
  const r = routeOf(fixtureModel(name), origin);
  if (!r) throw new Error("no route");
  return r;
}
/** A level's drawing with its sets sorted, for `toEqual`. */
const drawing = (name: string, r: Traced, level: string) => {
  const d = routeDrawing(fixtureModel(name), r, level);
  return { wires: sorted(d.wires), entered: sorted(d.entered), pins: sorted(d.pins), terminals: sorted(d.terminals), origin: d.origin };
};

describe("originOf", () => {
  const m = fixtureModel("closed_loop");
  it("a pin's and a port's own face, a wire's producer face, none for a block or a folder", () => {
    expect(originOf(m, { level: "", target: { kind: "block", id: "⟨in⟩h_ref" } })).toEqual(face("", "in", "h_ref"));
    expect(originOf(m, { level: "", target: { kind: "port", id: "⟨in⟩h_ref|out|h_ref" } })).toEqual(face("", "in", "h_ref"));
    expect(originOf(m, { level: "", target: { kind: "port", id: "plant|out|V" } })).toEqual(face("plant", "out", "V"));
    expect(originOf(m, { level: "pid_controller", target: { kind: "block", id: "⟨in⟩h_ref" } })).toEqual(face("pid_controller", "in", "h_ref"));
    expect(originOf(m, { level: "", target: { kind: "wire", id: "sensing|in|h" } })).toEqual(face("plant", "out", "h"));
    expect(originOf(m, { level: "", target: { kind: "block", id: "plant" } })).toBeUndefined();
    expect(originOf(m, undefined)).toBeUndefined();
  });
  it("a wire's route is its producer face's: sensing|in|h traces plant/h", () => {
    const o = originOf(m, { level: "", target: { kind: "wire", id: "sensing|in|h" } })!;
    expect(routeStatus(o, routeOf(m, o)!)).toMatch(/^tracing `plant\/h`: /);
  });
});

describe("closed_loop's routes", () => {
  it("h_ref: 2 consumers across 3 levels, both controllers entered, the tag the origin", () => {
    const r = traced("closed_loop", face("", "in", "h_ref"));
    expect(routeStatus(r.origin, r)).toBe("tracing `h_ref`: 2 consumers across 3 levels");
    expect(sorted(routeLevels(r))).toEqual(["", "lqr_controller", "pid_controller"]);
    expect(drawing("closed_loop", r, "")).toEqual({
      wires: ["lqr_controller|in|h_ref", "pid_controller|in|h_ref"], entered: ["lqr_controller", "pid_controller"],
      pins: ["⟨in⟩h_ref"], terminals: ["⟨in⟩h_ref|out|h_ref"], origin: "⟨in⟩h_ref|out|h_ref",
    });
    expect(drawing("closed_loop", r, "pid_controller")).toEqual({
      wires: ["pid_controller/h_ctl|in|r"], entered: [], pins: ["⟨in⟩h_ref"], terminals: ["pid_controller/h_ctl|in|r"], origin: undefined,
    });
    expect(drawing("closed_loop", r, "sensing")).toEqual({ wires: [], entered: [], pins: [], terminals: [], origin: undefined });
  });
  it("mode: 7 consumers across 4 levels", () => {
    const r = traced("closed_loop", face("", "in", "mode"));
    expect(routeStatus(r.origin, r)).toBe("tracing `mode`: 7 consumers across 4 levels");
    expect(sorted(routeLevels(r))).toEqual(["", "lqr_controller", "pid_controller", "selection"]);
    expect(drawing("closed_loop", r, "").entered).toEqual(["lqr_controller", "pid_controller", "selection"]);
    expect(drawing("closed_loop", r, "pid_controller").terminals).toEqual([
      "pid_controller/V_ctl|in|engaged", "pid_controller/h_ctl|in|engaged", "pid_controller/q_ctl|in|engaged", "pid_controller/θ_ctl|in|engaged",
    ]);
  });
  it("plant/V: 3 consumers across 3 levels, the origin plant's port square", () => {
    const r = traced("closed_loop", face("plant", "out", "V"));
    expect(routeStatus(r.origin, r)).toBe("tracing `plant/V`: 3 consumers across 3 levels");
    expect(drawing("closed_loop", r, "")).toEqual({
      wires: ["lqr_controller|in|V", "pid_controller|in|V"], entered: ["lqr_controller", "pid_controller"], pins: [],
      terminals: ["plant|out|V"], origin: "plant|out|V",
    });
    expect(drawing("closed_loop", r, "lqr_controller").terminals).toEqual(["lqr_controller/state_pack|in|in1", "lqr_controller/z_pack|in|in2"]);
  });
  it("a route traced from pid_controller's h_ref input is h_ref's, its origin that face's square on each level", () => {
    const r = traced("closed_loop", face("pid_controller", "in", "h_ref"));
    expect(routeStatus(r.origin, r)).toBe("tracing `pid_controller/h_ref`: 2 consumers across 3 levels");
    expect(drawing("closed_loop", r, "").origin).toBe("pid_controller|in|h_ref");
    expect(drawing("closed_loop", r, "").terminals).toEqual(["⟨in⟩h_ref|out|h_ref"]);
    expect(drawing("closed_loop", r, "pid_controller").origin).toBe("⟨in⟩h_ref|out|h_ref");
    expect(drawing("closed_loop", r, "lqr_controller").origin).toBeUndefined();
  });
  it("lights the blocks and pins touched, the wires and the terminal ports", () => {
    const m = fixtureModel("closed_loop");
    const r = traced("closed_loop", face("", "in", "h_ref"));
    const lit = routeLit(m, r, "");
    expect(sorted(lit.blocks)).toEqual(["lqr_controller", "pid_controller", "⟨in⟩h_ref"]);
    expect(sorted(lit.wires)).toEqual(["lqr_controller|in|h_ref", "pid_controller|in|h_ref"]);
    expect(sorted(lit.ports)).toEqual(["⟨in⟩h_ref|out|h_ref"]);
    expect(sorted(routeLit(m, r, "pid_controller").blocks)).toEqual(["pid_controller/h_ctl", "⟨in⟩h_ref"]);
    const v = routeLit(m, traced("closed_loop", face("plant", "out", "V")), "");
    expect(sorted(v.blocks)).toEqual(["lqr_controller", "pid_controller", "plant"]);
  });
});

describe("rates' and the other fixtures' routes", () => {
  it("src/out: 3 consumers across 4 levels, fast and slow entered at the root, fast/outer at fast", () => {
    const r = traced("rates", face("src", "out", "out"));
    expect(routeStatus(r.origin, r)).toBe("tracing `src/out`: 3 consumers across 4 levels");
    expect(drawing("rates", r, "")).toEqual({
      wires: ["fast|in|in", "slow|in|in"], entered: ["fast", "slow"], pins: [], terminals: ["src|out|out"], origin: "src|out|out",
    });
    expect(drawing("rates", r, "fast")).toEqual({
      wires: ["fast/inner|in|in", "fast/outer|in|in"], entered: ["fast/outer"], pins: ["⟨in⟩in"], terminals: ["fast/inner|in|in"], origin: undefined,
    });
    expect(drawing("rates", r, "fast/outer").terminals).toEqual(["fast/outer/hold|in|in"]);
  });
  it("the root output outer: 1 consumer across 3 levels, the pins crossed", () => {
    const r = traced("rates", face("", "out", "outer"));
    expect(routeStatus(r.origin, r)).toBe("tracing `outer`: 1 consumer across 3 levels");
    expect(drawing("rates", r, "")).toEqual({
      wires: ["⟨out⟩outer|in|outer"], entered: ["fast"], pins: ["⟨out⟩outer"], terminals: ["⟨out⟩outer|in|outer"], origin: "⟨out⟩outer|in|outer",
    });
    expect(drawing("rates", r, "fast")).toEqual({ wires: ["⟨out⟩outer|in|outer"], entered: ["fast/outer"], pins: ["⟨out⟩outer"], terminals: [], origin: undefined });
    expect(drawing("rates", r, "fast/outer")).toEqual({
      wires: ["⟨out⟩out|in|out"], entered: [], pins: ["⟨out⟩out"], terminals: ["fast/outer/hold|out|out"], origin: undefined,
    });
  });
  it("large's b102/out1: 6 consumers across 1 level", () => {
    const r = traced("large", face("b102", "out", "out1"));
    expect(routeStatus(r.origin, r)).toBe("tracing `b102/out1`: 6 consumers across 1 level");
    expect(drawing("large", r, "").wires).toHaveLength(6);
  });
  it("primitive's u: no wire, 0 consumers across 0 levels, the tag still the origin", () => {
    const r = traced("primitive", face("", "in", "u"));
    expect(routeStatus(r.origin, r)).toBe("tracing `u`: 0 consumers across 0 levels");
    expect(drawing("primitive", r, "")).toEqual({ wires: [], entered: [], pins: [], terminals: [], origin: "⟨in⟩u|out|u" });
  });
});

describe("rekeyRoute", () => {
  it("keeps h_ref and plant/V across the deployment, drops h_ref against rates", () => {
    const next = fixtureModel("closed_loop_deployment");
    expect(rekeyRoute(face("", "in", "h_ref"), next)).toEqual(face("", "in", "h_ref"));
    expect(rekeyRoute(face("plant", "out", "V"), next)).toEqual(face("plant", "out", "V"));
    expect(rekeyRoute(face("plant", "in", "V"), next)).toBeUndefined();
    expect(rekeyRoute(face("", "in", "h_ref"), fixtureModel("rates"))).toBeUndefined();
    expect(rekeyRoute(face("", "in", "h_ref"), fixtureModel("failure_structure"))).toBeUndefined();
  });
});
