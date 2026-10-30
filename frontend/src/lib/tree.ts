// The component tree, read off the node paths (descriptor_design.md answer 4).
import type { Node, StructureSection } from "./descriptor";

export type Membership = "field" | "keyed" | "transparent";

/** The parent rule: the longest node path that is a proper segment-aligned prefix, "" when none, undefined for the root. */
export function parentOf(path: string, paths: ReadonlySet<string>): string | undefined {
  if (path === "") return undefined;
  let p = path;
  for (let i = p.lastIndexOf("/"); i > 0; i = p.lastIndexOf("/")) {
    p = p.slice(0, i);
    if (paths.has(p)) return p;
  }
  return "";
}

/** The remainder after the parent's path and its slash; the whole path under the root. */
export const segmentOf = (path: string, parent: string): string =>
  parent === "" ? path : path.slice(parent.length + 1);

/** No key is a component field; a segment `field/key` a keyed container; a segment equal to the key a transparent one. */
export function membershipOf(node: Node, segment: string): Membership | undefined {
  if (node.key === undefined) return "field";
  if (segment === `${node.field}/${node.key}`) return "keyed";
  if (segment === node.key) return "transparent";
  return undefined;
}

/** The last dot-segment of the alias when present, else of the type. */
export function displayName(node: Node): string {
  const name = node.alias ?? node.type;
  return name.slice(name.lastIndexOf(".") + 1);
}

export interface Tree {
  root: Node;
  byPath: Map<string, Node>;
  /** Every non-root node's parent path. */
  parent: Map<string, string>;
  /** Every node's children paths in walk order, empty for a leaf. */
  children: Map<string, string[]>;
  segment: Map<string, string>;
  membership: Map<string, Membership | undefined>;
}

export function buildTree(structure: StructureSection): Tree {
  const byPath = new Map(structure.nodes.map((n) => [n.path, n]));
  const paths = new Set(byPath.keys());
  const parent = new Map<string, string>();
  const children = new Map<string, string[]>(structure.nodes.map((n) => [n.path, []]));
  const segment = new Map<string, string>();
  const membership = new Map<string, Membership | undefined>();
  for (const n of structure.nodes) {
    const p = parentOf(n.path, paths);
    if (p === undefined) continue;
    const s = segmentOf(n.path, p);
    parent.set(n.path, p);
    children.get(p)!.push(n.path);
    segment.set(n.path, s);
    membership.set(n.path, membershipOf(n, s));
  }
  return { root: byPath.get("")!, byPath, parent, children, segment, membership };
}
