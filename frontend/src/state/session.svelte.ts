// The per-tab state in memory (workspace.md answer 9's second lifetime): the
// model, the open level, the selection, the tree's expansion and the drawer.
// Keyed by path and name, never by index; nothing here touches local storage.
import type { Selection } from "../lib/detail";
import type { Model } from "../lib/model";
import { ancestors, defaultExpansion, folderOf } from "../lib/outline";

export type Tab = "diagnostics" | "root-inputs" | "timing" | "order";
export const TABS: Tab[] = ["diagnostics", "root-inputs", "timing", "order"];

let model = $state.raw<Model | undefined>();
let level = $state("");
let selection = $state.raw<Selection | undefined>();
let expanded = $state.raw<ReadonlySet<string>>(new Set());
let drawer = $state.raw<{ open: boolean; tab: Tab }>({ open: false, tab: "diagnostics" });

export const session = {
  get model() { return model; },
  /** The open level's path. */
  get level() { return level; },
  get selection() { return selection; },
  /** The expanded node and folder rows, by path. */
  get expanded() { return expanded; },
  get drawer() { return drawer; },
};

/** The diagnostics and warnings the body carries. */
export function diagnosticCount(m: Model): number {
  const d = m.descriptor;
  const body = d.kind === "build" ? d.build : d.kind === "deployment" ? d.deployment.build : d.failure;
  return ("diagnostics" in body ? body.diagnostics.length : 0) + body.warnings.length;
}

/** A new model, or none after a refusal: the root open, its row expanded one level, nothing selected, the drawer open on diagnostics only when one exists. */
export function load(m: Model | undefined) {
  model = m;
  level = "";
  selection = undefined;
  expanded = m?.tree ? defaultExpansion(m.tree) : new Set();
  drawer = { open: !!m && diagnosticCount(m) > 0, tab: "diagnostics" };
}

function expand(paths: string[]) {
  if (paths.every((p) => expanded.has(p))) return;
  expanded = new Set([...expanded, ...paths]);
}

/** Opens a level: the selection cleared, its row and its ancestors expanded. */
export function open(path: string) {
  const tree = model?.tree;
  if (!tree || tree.byPath.get(path)?.class !== "assembly") return;
  level = path;
  selection = undefined;
  expand([...ancestors(tree, path), path]);
}

/** Opens the open level's parent. */
export function climb() {
  const p = model?.tree?.parent.get(level);
  if (p !== undefined) open(p);
}

/** Selects an element on its level, showing that level; a node's or folder's row is revealed. */
export function select(s: Selection | undefined) {
  const tree = model?.tree;
  selection = s;
  if (!tree || !s) return;
  const { kind, id } = s.target;
  if ((kind === "block" && tree.byPath.has(id)) || (kind === "folder" && folderOf(tree, id))) expand(ancestors(tree, id));
  if (s.level !== level) level = s.level;
}

export function toggleExpanded(path: string) {
  const next = new Set(expanded);
  if (!next.delete(path)) next.add(path);
  expanded = next;
}

export function openDrawer(tab: Tab) {
  drawer = { open: true, tab };
}

/** A click on a tab: opens the drawer on it, or closes the drawer when it is the open tab. */
export function toggleDrawer(tab: Tab) {
  drawer = drawer.open && drawer.tab === tab ? { open: false, tab } : { open: true, tab };
}
