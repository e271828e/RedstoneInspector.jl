import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { beneath, CAP, hitSelection, levelHits, marked, parseQuery, ranges, searchModel, stepHit } from "./search";

const closedLoop = fixtureModel("closed_loop");
const find = (fixture: string, q: string) => searchModel(fixture === "closed_loop" ? closedLoop : fixtureModel(fixture), parseQuery(q));
const faceTriple = (f: { path: string; side: string; name: string }) => [f.path, f.side, f.name];

describe("parseQuery", () => {
  it("takes the three prefixes spelled exactly, lower-cases, and reads anything else as a bare term", () => {
    expect(parseQuery("  path:Sensing  H ")).toEqual([{ field: "path", text: "sensing" }, { field: undefined, text: "h" }]);
    expect(parseQuery("TYPE:junction")).toEqual([{ field: undefined, text: "type:junction" }]);
    expect(parseQuery("doc:x face:in1")).toEqual([{ field: undefined, text: "doc:x" }, { field: "face", text: "in1" }]);
    expect(parseQuery("")).toEqual([]);
  });

  it("reads a prefix with no text after it as no term, so a query of bare prefixes is the empty query", () => {
    expect(parseQuery("face:")).toEqual([]);
    expect(parseQuery("path: type: face:")).toEqual([]);
    expect(parseQuery("face: h")).toEqual([{ field: undefined, text: "h" }]);
    expect(find("closed_loop", "face:").total).toBe(0);
    expect(find("closed_loop", "type:").total).toBe(0);
  });
});

describe("stepHit, n and N", () => {
  const tree = closedLoop.tree!;
  it("walks the full order from the first or the last, after a selected hit, and wraps both ways", () => {
    const f = find("closed_loop", "h");
    const all = [...f.nodes, ...f.faces].map((h) => hitSelection(tree, "", h));
    expect(stepHit(tree, "", f, undefined, 1)).toEqual(all[0]);
    expect(stepHit(tree, "", f, undefined, -1)).toEqual(all[12]);
    expect(stepHit(tree, "", f, all[3], 1)).toEqual(all[4]);
    expect(stepHit(tree, "", f, all[4], -1)).toEqual(all[3]);
    expect(stepHit(tree, "", f, all[12], 1)).toEqual(all[0]);
    expect(stepHit(tree, "", f, all[0], -1)).toEqual(all[12]);
    // a selection that is no hit starts the walk afresh
    expect(stepHit(tree, "", f, { level: "", target: { kind: "block", id: "plant" } }, 1)).toEqual(all[0]);
    expect(stepHit(tree, "", find("closed_loop", "zzz"), undefined, 1)).toBeUndefined();
  });

  it("walks past the cap: on large's b, N from nothing selects the 171st hit, not the 100th row", () => {
    const large = fixtureModel("large");
    const f = searchModel(large, parseQuery("b"));
    expect(f.total).toBeGreaterThan(CAP);
    const last = [...f.nodes, ...f.faces].at(-1)!;
    expect(stepHit(large.tree!, "", f, undefined, -1)).toEqual(hitSelection(large.tree!, "", last));
    expect(stepHit(large.tree!, "", f, hitSelection(large.tree!, "", f.rows[CAP - 1]), 1))
      .toEqual(hitSelection(large.tree!, "", [...f.nodes, ...f.faces][CAP]));
  });
});

describe("searchModel, the oracle's table", () => {
  it("closed_loop h: 4 nodes and 9 faces, the root's h_ref first", () => {
    const f = find("closed_loop", "h");
    expect(f.nodes.map((h) => h.path)).toEqual(["sensing/noise", "pid_controller/h_ctl", "selection/select_δe", "selection/select_δt"]);
    expect(f.faces).toHaveLength(9);
    expect(faceTriple(f.faces[0])).toEqual(["", "in", "h_ref"]);
    expect(f.total).toBe(13);
    expect(f.rows).toHaveLength(13);
    // the rows: the nodes group, then the faces group
    expect(f.rows.slice(0, 4)).toEqual(f.nodes);
    expect(f.rows.slice(4)).toEqual(f.faces);
  });

  it.each([
    ["type:Junction", 6, 20], ["face:in1", 0, 8], ["path:sensing", 3, 6], ["plant", 1, 0], ["zzz", 0, 0],
    ["δ", 8, 22], ["type:junction face:y", 0, 6],
  ])("closed_loop %s: %i nodes and %i faces", (q, nodes, faces) => {
    const f = find("closed_loop", q);
    expect([f.nodes.length, f.faces.length]).toEqual([nodes, faces]);
  });

  it("closed_loop: path:plant face:h is plant's h alone, plant is the one node", () => {
    const f = find("closed_loop", "path:plant face:h");
    expect(f.nodes).toEqual([]);
    expect(f.faces.map(faceTriple)).toEqual([["plant", "out", "h"]]);
    expect(find("closed_loop", "plant").nodes.map((h) => h.path)).toEqual(["plant"]);
  });

  it("TYPE:junction reads as a bare term", () => {
    expect(find("closed_loop", "TYPE:junction").total).toBe(0);
  });

  it("a face: term disqualifies node hits", () => {
    expect(find("closed_loop", "face:sensing").nodes).toEqual([]);
  });

  it("large b: 171 nodes, 100 rows, total 171", () => {
    const f = find("large", "b");
    expect(f.nodes).toHaveLength(171);
    expect(f.rows).toHaveLength(CAP);
    expect(CAP).toBe(100);
    expect(f.total).toBe(171);
  });

  it("emphasises the matched text per field", () => {
    const f = find("closed_loop", "path:plant face:h");
    expect(f.faces[0].match).toEqual({ path: [[0, 5]], name: [[0, 1]] });
    const n = find("closed_loop", "pid h").nodes[0];
    expect(n.path).toBe("pid_controller/h_ctl");
    expect(n.match.path).toEqual([[0, 3], [15, 16]]);
    expect(ranges("aXa", ["a", "xa"])).toEqual([[0, 3]]);
  });
});

describe("marked and beneath", () => {
  it("rates hold: marked at fast/outer/hold and slow/hold, 1 beneath fast, fast/outer and slow", () => {
    const m = fixtureModel("rates");
    const marks = marked(searchModel(m, parseQuery("hold")));
    expect([...marks].sort()).toEqual(["fast/outer/hold", "slow/hold"]);
    const b = beneath(m.tree!, marks);
    expect([b.get("fast"), b.get("fast/outer"), b.get("slow")]).toEqual([1, 1, 1]);
  });

  it("closed_loop h: beneath sensing 1, pid_controller 1, selection 2, lqr_controller and actuators 0", () => {
    const f = find("closed_loop", "h");
    const b = beneath(closedLoop.tree!, marked(f));
    expect(["sensing", "pid_controller", "selection", "lqr_controller", "actuators"].map((p) => b.get(p) ?? 0)).toEqual([1, 1, 2, 0, 0]);
  });

  it("counts a node owning several face hits once", () => {
    const f = find("closed_loop", "type:Junction");
    const marks = marked(f);
    expect(marks.size).toBe(6);
    expect(beneath(closedLoop.tree!, marks).get("lqr_controller")).toBe(5);
  });
});

describe("levelHits", () => {
  it("closed_loop h on the root: no block hits, three closed assemblies beneath, eight port squares, the h_ref pin", () => {
    const h = levelHits(closedLoop.tree!, "", find("closed_loop", "h"));
    expect([...h.blocks]).toEqual(["⟨in⟩h_ref"]);
    expect([...h.under].sort()).toEqual(["pid_controller", "selection", "sensing"]);
    expect(h.ports.size).toBe(8);
  });

  it("closed_loop path:sensing on the root: sensing a hit, not beneath, its two ports", () => {
    const h = levelHits(closedLoop.tree!, "", find("closed_loop", "path:sensing"));
    expect([...h.blocks]).toEqual(["sensing"]);
    expect([...h.under]).toEqual([]);
    expect([...h.ports].sort()).toEqual(["sensing|in|h", "sensing|out|h_meas"]);
  });
});
