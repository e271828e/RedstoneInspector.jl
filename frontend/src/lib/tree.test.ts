import { describe, expect, it } from "vitest";
import { fixtureModel } from "./fixtures";
import { displayName, membershipOf, parentOf, segmentOf, type Membership, type Tree } from "./tree";

const tree = (name: string): Tree => fixtureModel(name).tree!;

// nodes, assemblies, root children, memberships (field / keyed / transparent)
const TABLE: [string, number, number, number, [number, number, number]][] = [
  ["aircraft", 2, 1, 1, [0, 0, 1]],
  ["descent", 4, 1, 3, [0, 0, 3]],
  ["closed_loop", 30, 6, 6, [0, 0, 29]],
  ["closed_loop_deployment", 30, 6, 6, [0, 0, 29]],
  ["containers", 7, 1, 6, [1, 3, 2]],
  ["primitive", 1, 0, 0, [0, 0, 0]],
  ["kinds", 10, 1, 9, [0, 0, 9]],
  ["rates", 8, 4, 3, [0, 0, 7]],
  ["large", 171, 11, 150, [0, 0, 170]],
  ["failure_cycle", 3, 1, 2, [0, 0, 2]],
  ["library", 33, 1, 32, [0, 0, 32]],
];

describe("the tree of each fixture", () => {
  it.each(TABLE)("%s: %i nodes, %i assemblies, %i root children", (name, nodes, assemblies, rootChildren, [f, k, t]) => {
    const tr = tree(name);
    expect(tr.byPath.size).toBe(nodes);
    expect([...tr.byPath.values()].filter((n) => n.class === "assembly")).toHaveLength(assemblies);
    expect(tr.children.get("")).toHaveLength(rootChildren);
    const count = (m: Membership) => [...tr.membership.values()].filter((x) => x === m).length;
    expect([count("field"), count("keyed"), count("transparent")]).toEqual([f, k, t]);
    expect(tr.membership.size).toBe(nodes - 1);
  });

  it.each(TABLE.map((r) => r[0]))("%s: every non-root node's parent is an assembly and the path extends it", (name) => {
    const tr = tree(name);
    expect(tr.root.path).toBe("");
    for (const [path, parent] of tr.parent) {
      expect(tr.byPath.get(parent)?.class).toBe("assembly");
      expect(parent === "" ? path : `${parent}/${tr.segment.get(path)}`).toBe(path);
      expect(tr.children.get(parent)).toContain(path);
    }
    expect(tr.parent.size).toBe(tr.byPath.size - 1);
  });
});

describe("the parent rule", () => {
  it("takes the longest node path that is a proper prefix", () => {
    const tr = tree("rates");
    expect(tr.parent.get("fast/outer/hold")).toBe("fast/outer");
    expect(tr.parent.get("fast/outer")).toBe("fast");
    expect(tr.parent.get("fast")).toBe("");
    expect(tr.children.get("fast/outer")).toEqual(["fast/outer/hold"]);
    expect(tr.segment.get("fast/outer/hold")).toBe("hold");
  });

  it("skips a container's non-node path and aligns on segments", () => {
    const paths = new Set(["", "a", "a/b", "ab"]);
    expect(parentOf("a/loops/l1", paths)).toBe("a");
    expect(parentOf("ab/c", paths)).toBe("ab");
    expect(parentOf("abc/d", paths)).toBe("");
    expect(parentOf("", paths)).toBeUndefined();
    expect(segmentOf("a/loops/l1", "a")).toBe("loops/l1");
    expect(segmentOf("x/y", "")).toBe("x/y");
  });

  it("lists children in walk order", () => {
    expect(tree("rates").children.get("")).toEqual(["src", "fast", "slow"]);
  });
});

describe("memberships", () => {
  it("reads containers' keyed, transparent and field nodes", () => {
    const tr = tree("containers");
    for (const p of ["gains/a", "gains/b", "pair/1"]) {
      const n = tr.byPath.get(p)!;
      expect(tr.segment.get(p)).toBe(`${n.field}/${n.key}`);
      expect(tr.membership.get(p)).toBe("keyed");
    }
    for (const p of ["s1", "s2"]) expect(tr.membership.get(p)).toBe("transparent");
    expect(tr.byPath.get("scale")!.key).toBeUndefined();
    expect(tr.membership.get("scale")).toBe("field");
  });

  it("compares the segment to field/key, not to the key alone", () => {
    const n = tree("containers").byPath.get("gains/a")!;
    expect(membershipOf(n, "gains/a")).toBe("keyed");
    expect(membershipOf(n, "a")).toBe("transparent");
  });
});

describe("display names", () => {
  it("prefers the alias's last segment, else the type's", () => {
    const tr = tree("closed_loop");
    expect(displayName(tr.byPath.get("sensing/altimeter")!)).toBe("SumJunction");
    expect(displayName(tr.byPath.get("plant")!)).toBe("Longitudinal");
    expect(displayName(tr.root)).toBe("Group");
  });
});

it("makes a primitive root a tree of one leaf", () => {
  const tr = tree("primitive");
  expect(tr.root.class).toBe("leaf");
  expect(tr.children.get("")).toEqual([]);
  expect(tr.parent.size).toBe(0);
});
