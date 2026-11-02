import { describe, expect, it } from "vitest";
import type { KindMarker, LeafNode } from "./descriptor";
import { fixtureModel } from "./fixtures";
import { levelOf } from "./level";
import type { Model } from "./model";
import { fanouts, labelledPorts, levelWireClasses, longestHorizontal, shortType, wireClass, type WireClass } from "./wires";

const level = (m: Model, path: string) => levelOf(m.tree!, m.resolution!, path);
/** The classes' counts on a level, as the oracle prints them. */
function tally(m: Model, path: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of levelWireClasses(m, level(m, path)).values()) out[c] = (out[c] ?? 0) + 1;
  return out;
}
const cl = fixtureModel("closed_loop");

describe("wireClass", () => {
  it("maps kinds' eleven faces by the outer kind", () => {
    const k = fixtureModel("kinds");
    const got: [string, WireClass][] = [];
    for (const n of k.structure!.nodes) {
      if (n.class !== "leaf") continue;
      for (const f of [...(n as LeafNode).inputs, ...(n as LeafNode).outputs]) got.push([`${n.path}.${f.name}`, wireClass(f.kind)]);
    }
    expect(Object.fromEntries(got)).toEqual({
      "i.y": "scalar", "r.y": "scalar", "v.y": "vector", "mat.y": "vector", "nt.y": "struct", "fn.y": "opaque",
      "g.gear": "flag", "g.y": "scalar", "s.phase": "flag", "p.phase": "flag", "p.armed": "flag",
    });
  });

  it("reads a vector of structs as a vector", () => {
    const k: KindMarker = { kind: "vector", shape: [3], element: { kind: "struct", fields: ["a", "b"] } };
    expect(wireClass(k)).toBe("vector");
  });
});

describe("levelWireClasses", () => {
  it("counts closed_loop's root and lqr_controller as the oracle does", () => {
    expect(tally(cl, "")).toEqual({ scalar: 27, flag: 3 });
    expect(tally(cl, "lqr_controller")).toEqual({ scalar: 13, flag: 1, vector: 7 });
  });

  it("gives descent's one flag wire, gear's Bool into stop; the StopFlag enum reads flag", () => {
    const d = fixtureModel("descent");
    expect(tally(d, "")).toEqual({ scalar: 3, flag: 1 });
    expect(levelWireClasses(d, level(d, "")).get("stop|in|u")).toBe("flag");
    const stop = d.tree!.byPath.get("stop") as LeafNode;
    expect([stop.outputs[0].type, wireClass(stop.outputs[0].kind)]).toEqual(["Redstone.StopFlag", "flag"]);
  });

  it("gives kinds' root one wire of every class", () => {
    const k = fixtureModel("kinds");
    expect(tally(k, "")).toEqual({ scalar: 3, flag: 3, vector: 2, struct: 1, opaque: 1 });
    expect(levelWireClasses(k, level(k, "")).get("⟨out⟩nt|in|nt")).toBe("struct");
  });
});

describe("labelledPorts and fanouts", () => {
  it("labels closed_loop's root 19 ports and lqr_controller 20, once per port", () => {
    expect(labelledPorts(cl, level(cl, ""))).toHaveLength(19);
    expect(labelledPorts(cl, level(cl, "lqr_controller"))).toHaveLength(20);
    const mode = labelledPorts(cl, level(cl, "")).find((p) => p.port === "⟨in⟩mode|out|mode");
    expect(mode).toEqual({ port: "⟨in⟩mode|out|mode", type: "Bool", wires: ["pid_controller|in|mode", "lqr_controller|in|mode", "selection|in|mode"] });
  });

  it("types a label by the producer face, through an assembly's face to its terminal producer", () => {
    const sensing = labelledPorts(cl, level(cl, "")).find((p) => p.port === "sensing|out|h_meas");
    expect(sensing?.type).toBe("Float64");
    const k = fixtureModel("kinds");
    expect(labelledPorts(k, level(k, "")).find((p) => p.port === "nt|out|y")?.type).toBe("@NamedTuple{a::Float64, b::Float64}");
  });

  it("finds closed_loop's ten root fan-outs, mode at 3, and none on kinds", () => {
    const f = fanouts(level(cl, ""));
    expect(f.size).toBe(10);
    expect(f.get("⟨in⟩mode|out|mode")).toBe(3);
    expect(f.get("plant|out|h")).toBe(2);
    expect(fanouts(level(fixtureModel("kinds"), "")).size).toBe(0);
  });
});

describe("shortType", () => {
  it.each([
    ["StaticArraysCore.SVector{5, Float64}", "SVector{5, Float64}"],
    ["Redstone.Blocks.Junction{Float64, Float64, 2, typeof(+)}", "Junction{Float64, Float64, 2, typeof(+)}"],
    ["Main.Synthetic.Pt", "Pt"],
    ["@NamedTuple{a::Float64, b::Main.M.T}", "@NamedTuple{a::Float64, b::T}"],
    ["Tuple{Core.Int64, Base.RefValue{Main.δ.Ω}}", "Tuple{Int64, RefValue{Ω}}"],
    ["typeof(Main.var\"#f#3\")", "typeof(var\"#f#3\")"],
    ["Main.var\"#a.b\"", "var\"#a.b\""],
    ["Val{\"x.y\"}", "Val{\"x.y\"}"],
    ["Val{1.5}", "Val{1.5}"],
    ["Float64", "Float64"],
    ["Vector{Bool}", "Vector{Bool}"],
  ])("reads %s as %s", (full, short) => {
    expect(shortType(full)).toBe(short);
  });

  it("leaves no qualifier in any closed_loop or kinds label", () => {
    for (const m of [cl, fixtureModel("kinds")]) {
      for (const p of labelledPorts(m, level(m, ""))) expect(shortType(p.type), p.type).not.toMatch(/[\p{L}_][\p{L}\p{N}_]*\.[\p{L}_]/u);
    }
  });
});

describe("longestHorizontal", () => {
  const P = (x: number, y: number) => ({ x, y });
  it("picks the longest horizontal stretch over every route, either direction, skipping the vertical ones", () => {
    expect(longestHorizontal([
      ["a", [P(0, 0), P(30, 0), P(30, 50), P(40, 50)]],
      ["b", [P(0, 0), P(10, 0), P(10, 80), P(-50, 80)]],
    ])).toEqual({ wire: "b", x0: -50, x1: 10, y: 80 });
  });

  it("keeps the first of two equal stretches and gives none for vertical routes alone", () => {
    expect(longestHorizontal([["a", [P(0, 0), P(20, 0)]], ["b", [P(5, 9), P(25, 9)]]])?.wire).toBe("a");
    expect(longestHorizontal([["a", [P(0, 0), P(0, 40)]]])).toBeUndefined();
    expect(longestHorizontal([])).toBeUndefined();
  });
});
