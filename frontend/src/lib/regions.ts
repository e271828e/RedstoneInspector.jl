// Regions for keyed containers (visual_grammar.md answer 5): a keyed
// container's elements draw inside one frame captioned with the field, each
// labelled by its key; a transparent container draws none. The region is the
// tree's folder: the same path, `parent/field`, the field alone under the root.
import { folderPath } from "./outline";
import type { Tree } from "./tree";

export interface Region {
  /** The folder's path. */
  path: string;
  field: string;
  /** The keyed members' paths, in walk order. */
  members: string[];
}

/** A level's keyed containers, in walk order of their first member. */
export function regionsOf(tree: Tree, level: string): Region[] {
  const byField = new Map<string, Region>();
  for (const c of tree.children.get(level) ?? []) {
    if (tree.membership.get(c) !== "keyed") continue;
    const field = tree.byPath.get(c)!.field!;
    let r = byField.get(field);
    if (!r) byField.set(field, (r = { path: folderPath(level, field), field, members: [] }));
    r.members.push(c);
  }
  return [...byField.values()];
}

/**
 * A block's label on the canvas: a keyed member's key, every other child's segment, and a primitive root's block,
 * the one block with an empty segment, the model's label.
 */
export const label = (tree: Tree, path: string, rootLabel: string): string =>
  path === "" ? rootLabel : tree.membership.get(path) === "keyed" ? tree.byPath.get(path)!.key! : (tree.segment.get(path) ?? "");
