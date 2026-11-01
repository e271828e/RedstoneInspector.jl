import { describe, expect, it } from "vitest";
import type { Node, StructureSection } from "./descriptor";
import { fixtureModel } from "./fixtures";
import { label, regionsOf } from "./regions";
import { buildTree } from "./tree";

const asm = (path: string, extra: Partial<Node> = {}): Node =>
  ({ path, type: "Redstone.Group", signature: "Group", parameters: [], class: "assembly", inputs: [], outputs: [], wires: [], ...extra }) as Node;

describe("regionsOf", () => {
  it("containers' root: gains with a and b, pair with 1, the transparent and field children in none", () => {
    const tree = fixtureModel("containers").tree!;
    expect(regionsOf(tree, "")).toEqual([
      { path: "gains", field: "gains", members: ["gains/a", "gains/b"] },
      { path: "pair", field: "pair", members: ["pair/1"] },
    ]);
    expect(tree.children.get("")!.map((c) => label(tree, c))).toEqual(["a", "b", "1", "s1", "s2", "scale"]);
    expect(tree.children.get("")).toEqual(["gains/a", "gains/b", "pair/1", "s1", "s2", "scale"]);
  });

  it("closed_loop's root has none", () => {
    expect(regionsOf(fixtureModel("closed_loop").tree!, "")).toEqual([]);
  });

  it("under a non-root node, the region's path is parent/field, the members by key", () => {
    const nodes = [
      asm(""), asm("ctl", { field: "ctl" }),
      asm("ctl/loops/x", { field: "loops", key: "x" }), asm("ctl/plain", { field: "plain" }), asm("ctl/loops/y", { field: "loops", key: "y" }),
      asm("ctl/s", { field: "stages", key: "s" }),
    ];
    const tree = buildTree({ nodes, root_inputs: [], anchors: [], scopes: [], types: [] } as StructureSection);
    expect(regionsOf(tree, "ctl")).toEqual([{ path: "ctl/loops", field: "loops", members: ["ctl/loops/x", "ctl/loops/y"] }]);
    expect(regionsOf(tree, "")).toEqual([]);
    expect(["ctl/loops/x", "ctl/plain", "ctl/s"].map((p) => label(tree, p))).toEqual(["x", "plain", "s"]);
  });
});
