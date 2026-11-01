import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { allRows, ancestors, defaultExpansion, folderOf, outlineRows, rowSelection, treeStep } from "./outline";

// The oracle's rows, node and folder, in full and at load (the root and its folders expanded).
const ROWS: [string, number, number][] = [
  ["aircraft", 2, 2],
  ["closed_loop", 30, 7],
  ["closed_loop_deployment", 30, 7],
  ["containers", 9, 9],
  ["descent", 4, 4],
  ["failure_cycle", 3, 3],
  ["kinds", 10, 10],
  ["large", 171, 151],
  ["primitive", 1, 1],
  ["rates", 8, 4],
];

const rowsOf = (name: string) => {
  const m = fixtureModel(name);
  return { m, tree: m.tree!, all: allRows(m.tree!, m.label), atLoad: outlineRows(m.tree!, m.label, defaultExpansion(m.tree!)) };
};

describe("the outline of each fixture", () => {
  it.each(ROWS)("%s: %i rows, %i at load", (name, full, load) => {
    const { all, atLoad } = rowsOf(name);
    expect(all).toHaveLength(full);
    expect(atLoad).toHaveLength(load);
    expect(new Set(all.map((r) => r.path)).size).toBe(full);
  });

  it("nothing expanded shows the root row alone", () => {
    const { tree, m } = rowsOf("closed_loop");
    expect(outlineRows(tree, m.label, new Set()).map((r) => r.path)).toEqual([""]);
  });
});

describe("containers' folders", () => {
  const { all, tree } = rowsOf("containers");
  const row = (p: string) => all.find((r) => r.path === p)!;

  it("two folder rows under the root, holding the keyed nodes", () => {
    expect(all.filter((r) => r.kind === "folder").map((r) => [r.path, r.parent, r.depth, r.label]))
      .toEqual([["gains", "", 1, "gains"], ["pair", "", 1, "pair"]]);
    expect(all.filter((r) => r.parent === "gains").map((r) => r.path)).toEqual(["gains/a", "gains/b"]);
    expect(all.filter((r) => r.parent === "pair").map((r) => r.path)).toEqual(["pair/1"]);
    for (const p of ["gains/a", "gains/b", "pair/1"]) expect(row(p).depth).toBe(2);
  });

  it("the transparent and plain children are rows of the root", () => {
    for (const p of ["s1", "s2", "scale"]) expect([row(p).parent, row(p).depth, row(p).kind]).toEqual(["", 1, "node"]);
  });

  it("folderOf reads the field and its members; a node's path is no folder", () => {
    expect(folderOf(tree, "gains")).toEqual({ parent: "", field: "gains", members: ["gains/a", "gains/b"] });
    expect(folderOf(tree, "s1")).toBeUndefined();
    expect(folderOf(tree, "nothing")).toBeUndefined();
  });

  it("a keyed node's ancestors include its folder", () => {
    expect(ancestors(tree, "gains/b")).toEqual(["", "gains"]);
    expect(ancestors(tree, "gains")).toEqual([""]);
  });
});

describe("depth and ancestors", () => {
  it("rates' fast/outer/hold sits at depth 3 under fast and fast/outer", () => {
    const { all, tree } = rowsOf("rates");
    expect(all.find((r) => r.path === "fast/outer/hold")!.depth).toBe(3);
    expect(ancestors(tree, "fast/outer/hold")).toEqual(["", "fast", "fast/outer"]);
    expect(ancestors(tree, "")).toEqual([]);
  });

  it("closed_loop: assembly rows expand, leaf rows do not", () => {
    const { all } = rowsOf("closed_loop");
    for (const r of all) expect(r.expandable).toBe(r.class === "assembly");
  });
});

describe("the root row", () => {
  it("primitive is one row labelled primitive", () => {
    const { all } = rowsOf("primitive");
    expect(all.map((r) => [r.path, r.label, r.class, r.expandable])).toEqual([["", "primitive", "leaf", false]]);
  });

  it("aircraft's root row reads the loader's label", () => {
    expect(rowsOf("aircraft").all[0].label).toBe("aircraft");
  });

  it("a node row's label is its segment and its display name the type's last segment", () => {
    const r = rowsOf("closed_loop").all.find((x) => x.path === "sensing/altimeter")!;
    expect([r.label, r.segment, r.displayName, r.depth]).toEqual(["altimeter", "altimeter", "SumJunction", 2]);
  });
});

describe("treeStep, the tree's h j k l", () => {
  const { m, tree } = rowsOf("closed_loop");
  const at = (expanded: Set<string>) => outlineRows(tree, m.label, expanded);
  const path = (r: ReturnType<typeof treeStep>) => (r && "select" in r ? r.select.path : r);
  it("j and k move one visible row, the first with none selected, and stop at the ends", () => {
    const rows = at(new Set([""]));
    expect(path(treeStep(rows, undefined, "j", new Set([""])))).toBe("");
    expect(path(treeStep(rows, "", "j", new Set([""])))).toBe(rows[1].path);
    expect(path(treeStep(rows, rows[2].path, "k", new Set([""])))).toBe(rows[1].path);
    expect(treeStep(rows, "", "k", new Set([""]))).toBeUndefined();
    expect(treeStep(rows, rows.at(-1)!.path, "j", new Set([""]))).toBeUndefined();
  });
  it("l expands a collapsed row, then steps into its first child; on a leaf it does nothing", () => {
    const e = new Set([""]);
    expect(treeStep(at(e), "sensing", "l", e)).toEqual({ toggle: "sensing" });
    const e2 = new Set(["", "sensing"]);
    expect(path(treeStep(at(e2), "sensing", "l", e2))).toBe(tree.children.get("sensing")![0]);
    expect(treeStep(at(e), "plant", "l", e)).toBeUndefined();
  });
  it("h collapses an expanded row, steps from a collapsed row or a leaf to its parent's row; the root has none", () => {
    const e = new Set(["", "sensing"]);
    expect(treeStep(at(e), "sensing", "h", e)).toEqual({ toggle: "sensing" });
    expect(path(treeStep(at(e), "sensing/noise", "h", e))).toBe("sensing");
    expect(path(treeStep(at(e), "plant", "h", e))).toBe("");
    const root = new Set<string>();
    expect(treeStep(at(root), "", "h", root)).toBeUndefined();
  });
  it("folder rows are rows: a keyed member steps to its folder, the folder to its node", () => {
    const c = rowsOf("containers");
    const e = defaultExpansion(c.tree);
    const rows = outlineRows(c.tree, c.m.label, e);
    const member = rows.find((r) => r.kind === "node" && r.parent !== undefined && r.parent !== "")!;
    const folder = rows.find((r) => r.path === member.parent)!;
    expect(folder.kind).toBe("folder");
    expect(path(treeStep(rows, member.path, "h", e))).toBe(folder.path);
    // the folder is expanded: h collapses it; collapsed, h steps to the root
    expect(treeStep(rows, folder.path, "h", e)).toEqual({ toggle: folder.path });
    const shut = new Set([...e].filter((p) => p !== folder.path));
    expect(path(treeStep(outlineRows(c.tree, c.m.label, shut), folder.path, "h", shut))).toBe("");
    expect(rowSelection(c.tree, "", folder)).toEqual({ level: "", target: { kind: "folder", id: folder.path } });
  });
});
