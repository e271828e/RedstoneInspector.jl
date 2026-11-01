// The push's rekeying (workspace.md answers 3 and 9): what of the per-tab state
// survives a new model, keyed by path and name, never by index.
import type { Selection } from "./detail";
import { inPinId, levelOf, outPinId, parsePortId } from "./level";
import type { Model } from "./model";
import { folderOf } from "./outline";
import type { Tree } from "./tree";
import type { View } from "./view";

/** The per-tab state a push rekeys; a level's layout is opaque here. */
export interface PerTab<L> {
  level: string;
  selection: Selection | undefined;
  expanded: ReadonlySet<string>;
  views: ReadonlyMap<string, View>;
  layouts: ReadonlyMap<string, L>;
  query: string;
}
export interface Rekeyed<L> extends PerTab<L> {
  /** Set when the open level fell back. */
  note?: string;
}

/** A path that draws as a level: the root, or an assembly. */
export const isLevel = (tree: Tree, path: string): boolean => path === "" || tree.byPath.get(path)?.class === "assembly";

/** The path itself when it is a level, else its longest segment-aligned prefix that is, the root at worst. */
export function fallback(tree: Tree, path: string): string {
  for (let p = path; p !== ""; p = p.slice(0, Math.max(0, p.lastIndexOf("/")))) if (isLevel(tree, p)) return p;
  return "";
}

const hasFace = (tree: Tree, path: string, side: "in" | "out", name: string) =>
  !!tree.byPath.get(path)?.[side === "in" ? "inputs" : "outputs"].some((f) => f.name === name);

/** The selection carried into the new model, or undefined when its key is gone. */
function rekeySelection(model: Model, s: Selection | undefined): Selection | undefined {
  const tree = model.tree!;
  if (!s) return undefined;
  const { kind, id } = s.target;
  const levelKept = isLevel(tree, s.level);
  /** A node's or port's own level: the selection's when it survives, else the node's parent. */
  const at = (path: string) => (levelKept ? s.level : tree.parent.get(path) ?? "");
  if (kind === "folder") return folderOf(tree, id) ? { level: folderOf(tree, id)!.parent, target: s.target } : undefined;
  if (kind === "block") {
    if (tree.byPath.has(id)) return { level: at(id), target: s.target };
    if (!levelKept) return undefined;
    const pin = id.startsWith(inPinId("")) ? { side: "in" as const, name: id.slice(inPinId("").length) }
      : id.startsWith(outPinId("")) ? { side: "out" as const, name: id.slice(outPinId("").length) } : undefined;
    return pin && hasFace(tree, s.level, pin.side, pin.name) ? s : undefined;
  }
  if (kind === "port") {
    const p = parsePortId(id);
    if (tree.byPath.has(p.block)) return hasFace(tree, p.block, p.side, p.name) ? { level: at(p.block), target: s.target } : undefined;
    // a pin's port: its level must survive with the face
    const pinFace = p.block === inPinId(p.name) ? "in" : p.block === outPinId(p.name) ? "out" : undefined;
    return levelKept && pinFace && hasFace(tree, s.level, pinFace, p.name) ? s : undefined;
  }
  if (!levelKept) return undefined;
  return levelOf(tree, model.resolution!, s.level).wires.some((w) => w.id === id) ? s : undefined;
}

/** Whether a path draws the same blocks, by id, as a level of both models. */
export function sameBlocks(a: Model, b: Model, path: string): boolean {
  if (!a.tree || !b.tree || !isLevel(a.tree, path) || !isLevel(b.tree, path)) return false;
  const ids = (m: Model) => new Set(levelOf(m.tree!, m.resolution!, path).blocks.map((x) => x.id));
  const x = ids(a), y = ids(b);
  return x.size === y.size && [...x].every((id) => y.has(id));
}

/**
 * What survives a new model: the level by path or its longest prefix still a level, noted when it falls; the
 * expansion's existing paths; the selection by its key; the views and layouts of surviving levels, a fallen
 * level's and the fallback's views dropped so the canvas fits, and, given the previous model, a view whose level's
 * blocks changed (workspace.md answer 9); the query whole.
 */
export function rekey<L>(previous: PerTab<L>, model: Model, from?: Model): Rekeyed<L> {
  const tree = model.tree;
  const fell = (to: string) =>
    `\`${previous.level}\` is not in this model; showing ${to === "" ? "the root" : `\`${to}\``}`;
  if (!tree) {
    return {
      level: "", selection: undefined, expanded: new Set(), views: new Map(), layouts: new Map(), query: previous.query,
      note: previous.level === "" ? undefined : fell(""),
    };
  }
  const level = fallback(tree, previous.level);
  const views = new Map([...previous.views].filter(([p]) => isLevel(tree, p) && (!from || sameBlocks(from, model, p))));
  if (level !== previous.level) views.delete(level);
  return {
    level,
    selection: rekeySelection(model, previous.selection),
    expanded: new Set([...previous.expanded].filter((p) => tree.byPath.has(p) || folderOf(tree, p))),
    views,
    layouts: new Map([...previous.layouts].filter(([p]) => isLevel(tree, p))),
    query: previous.query,
    note: level === previous.level ? undefined : fell(level),
  };
}
