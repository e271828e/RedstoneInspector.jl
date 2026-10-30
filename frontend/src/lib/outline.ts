// The tree pane's rows (workspace.md answer 2): one row per node in walk order,
// nested by the parent rule, a keyed container's elements under a folder row.
import { displayName, type Tree } from "./tree";

export interface Row {
  kind: "node" | "folder";
  /** A node's path; a folder's `parent/field`, the field alone under the root, which is no node's path. */
  path: string;
  /** The parent row's path, undefined for the root. */
  parent: string | undefined;
  depth: number;
  /** The root's is the model's label, a node's its segment, a folder's its field. */
  label: string;
  segment: string;
  /** Empty for a folder. */
  displayName: string;
  class: "leaf" | "assembly" | undefined;
  expandable: boolean;
}

/** A folder row's path: the field under its parent. */
export const folderPath = (parent: string, field: string): string => (parent === "" ? field : `${parent}/${field}`);

/** The rows under a node, in walk order: a keyed child under its field's folder, at the folder's first member. */
function childEntries(tree: Tree, path: string): ({ folder: string; field: string; members: string[] } | string)[] {
  const out: ({ folder: string; field: string; members: string[] } | string)[] = [];
  const byField = new Map<string, { folder: string; field: string; members: string[] }>();
  for (const c of tree.children.get(path) ?? []) {
    if (tree.membership.get(c) !== "keyed") {
      out.push(c);
      continue;
    }
    const field = tree.byPath.get(c)!.field!;
    let f = byField.get(field);
    if (!f) {
      f = { folder: folderPath(path, field), field, members: [] };
      byField.set(field, f);
      out.push(f);
    }
    f.members.push(c);
  }
  return out;
}

function walk(tree: Tree, label: string, open: (path: string) => boolean): Row[] {
  const rows: Row[] = [];
  const node = (path: string, parent: string | undefined, depth: number) => {
    const n = tree.byPath.get(path)!;
    const segment = tree.segment.get(path) ?? "";
    const kids = childEntries(tree, path);
    rows.push({
      kind: "node", path, parent, depth, label: path === "" ? label : segment, segment,
      displayName: displayName(n), class: n.class, expandable: kids.length > 0,
    });
    if (!open(path)) return;
    for (const k of kids) {
      if (typeof k === "string") {
        node(k, path, depth + 1);
        continue;
      }
      rows.push({
        kind: "folder", path: k.folder, parent: path, depth: depth + 1, label: k.field, segment: k.field,
        displayName: "", class: undefined, expandable: true,
      });
      if (open(k.folder)) for (const m of k.members) node(m, k.folder, depth + 2);
    }
  };
  node("", undefined, 0);
  return rows;
}

/** The rows visible under an expansion set of node and folder paths, in walk order. */
export const outlineRows = (tree: Tree, label: string, expanded: ReadonlySet<string>): Row[] =>
  walk(tree, label, (p) => expanded.has(p));

/** Every row. */
export const allRows = (tree: Tree, label: string): Row[] => walk(tree, label, () => true);

/** The default expansion: the root and the root's folders, one level deep. */
export function defaultExpansion(tree: Tree): Set<string> {
  const s = new Set([""]);
  for (const k of childEntries(tree, "")) if (typeof k !== "string") s.add(k.folder);
  return s;
}

/** A folder's parent node, field and members in walk order; undefined when the path is no folder. */
export function folderOf(tree: Tree, path: string): { parent: string; field: string; members: string[] } | undefined {
  if (tree.byPath.has(path)) return undefined;
  const i = path.lastIndexOf("/");
  const parent = i < 0 ? "" : path.slice(0, i);
  const field = path.slice(i + 1);
  if (!tree.byPath.has(parent)) return undefined;
  const members = (tree.children.get(parent) ?? [])
    .filter((c) => tree.membership.get(c) === "keyed" && tree.byPath.get(c)!.field === field);
  return members.length ? { parent, field, members } : undefined;
}

/** The row paths to expand to reveal a node's or folder's row, root first, folders included. */
export function ancestors(tree: Tree, path: string): string[] {
  const f = folderOf(tree, path);
  if (f) return [...ancestors(tree, f.parent), f.parent];
  const parent = tree.parent.get(path);
  if (parent === undefined) return [];
  const above = [...ancestors(tree, parent), parent];
  if (tree.membership.get(path) === "keyed") above.push(folderPath(parent, tree.byPath.get(path)!.field!));
  return above;
}
