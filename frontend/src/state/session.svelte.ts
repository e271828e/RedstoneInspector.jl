// The per-tab state in memory (workspace.md answer 9's second lifetime): the
// model, the open level and its hash, each visited level's view and layout, the
// selection, the tree's expansion, the query, the legend's focus, the drawer and
// the keyboard's region. Keyed by path and name, never by index; a push rekeys it (`rekey`).
// Nothing here touches local storage; the open level is the URL's hash.
import type { Geometry, LevelLayout } from "../canvas/layout";
import type { Selection } from "../lib/detail";
import type { Model } from "../lib/model";
import { rekeyFocus } from "../lib/focus";
import { ancestors, defaultExpansion, folderOf } from "../lib/outline";
import { isLevel, rekey } from "../lib/rekey";
import type { View } from "../lib/view";

export type Tab = "diagnostics" | "root-inputs" | "timing" | "order";
export const TABS: Tab[] = ["diagnostics", "root-inputs", "timing", "order"];
/** The four regions Tab moves between, in order. */
export type Region = "tree" | "canvas" | "detail" | "drawer";

let model = $state.raw<Model | undefined>();
let level = $state("");
let selection = $state.raw<Selection | undefined>();
let expanded = $state.raw<ReadonlySet<string>>(new Set());
let drawer = $state.raw<{ open: boolean; tab: Tab }>({ open: false, tab: "diagnostics" });
let views = $state.raw<ReadonlyMap<string, View>>(new Map());
let layouts = $state.raw<ReadonlyMap<string, LevelLayout>>(new Map());
let query = $state("");
let legendFocus = $state<string | undefined>();
let focus = $state<Region | undefined>();
let note = $state<string | undefined>();

export const session = {
  get model() { return model; },
  /** The open level's path. */
  get level() { return level; },
  get selection() { return selection; },
  /** The expanded node and folder rows, by path. */
  get expanded() { return expanded; },
  get drawer() { return drawer; },
  /** Each visited level's zoom and pan, by path. */
  get views() { return views; },
  /** Each visited level's geometry, by path. */
  get layouts() { return layouts; },
  /** The search text. */
  get query() { return query; },
  /** The legend line focused: a triple's key or `continuous`. */
  get legendFocus() { return legendFocus; },
  /** The region holding the keyboard's focus. */
  get focus() { return focus; },
  /** The fallback note, while it stands. */
  get note() { return note; },
};

/** The hash naming a level: none for the root, `#level=<path>` otherwise. */
export const hashOf = (path: string): string =>
  path === "" ? "" : `#level=${encodeURIComponent(path).replaceAll("%2F", "/")}`;
/** The level a hash names, undefined when it names none. */
export function levelOfHash(hash: string): string | undefined {
  const m = /^#level=(.+)$/.exec(hash);
  if (!m) return undefined;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return undefined;
  }
}

const browser = typeof window !== "undefined";
/** The URL with the level's hash, the page's own address for the root. */
const urlOf = (path: string) => `${location.pathname}${location.search}${hashOf(path)}`;

/**
 * The level entries this page load made, each carrying `{load, depth}` in `history.state`: the entry the page
 * loaded on is depth 0, each `open` one deeper; `top` is the deepest reachable forward. Shift-h and Shift-l walk
 * them and never leave the page.
 */
const LOAD = browser ? `${Date.now()}-${Math.random()}` : "";
let depth = 0;
let top = 0;
if (browser) history.replaceState({ load: LOAD, depth }, "");

function pushHash() {
  if (!browser || location.hash === hashOf(level)) return;
  depth += 1;
  top = depth;
  history.pushState({ load: LOAD, depth }, "", urlOf(level));
}
function replaceHash() {
  if (browser && location.hash !== hashOf(level)) history.replaceState(history.state, "", urlOf(level));
}

/** Shift-h: the previous level entry of this page load; nothing at the first. */
export function back() {
  if (depth > 0) history.back();
}
/** Shift-l: the next level entry of this page load; nothing at the last. */
export function forward() {
  if (depth < top) history.forward();
}

const bodyOf = (m: Model) => {
  const d = m.descriptor;
  return d.kind === "build" ? d.build : d.kind === "deployment" ? d.deployment.build : d.failure;
};

/** The diagnostics and warnings the body carries: the diagnostics tab's count. */
export function diagnosticCount(m: Model): number {
  const body = bodyOf(m);
  return ("diagnostics" in body ? body.diagnostics.length : 0) + body.warnings.length;
}

/** Whether the drawer opens on load: a diagnostic exists, a warning alone does not. */
function opensDrawer(m: Model): boolean {
  const body = bodyOf(m);
  return "diagnostics" in body && body.diagnostics.length > 0;
}

/**
 * A new model. The first, or one after a refusal, resets everything: the root open, its row expanded one level,
 * nothing selected, the drawer open on diagnostics only when one exists. A replacement rekeys the per-tab state
 * and notes a fallen level; the drawer stays, opening on diagnostics when the new model carries one. In both, a
 * hash naming a level of the new model wins.
 */
export function load(m: Model | undefined) {
  const hashed = browser ? levelOfHash(location.hash) : undefined;
  const replacing = !!model && !!m;
  if (m && replacing) {
    const r = rekey({ level, selection, expanded, views, layouts, query }, m, model);
    level = r.level;
    selection = r.selection;
    expanded = r.expanded;
    views = r.views;
    layouts = new Map([...r.layouts].map(([p, l]) => [p, { ...l, stale: true }]));
    query = r.query;
    legendFocus = legendFocus === undefined ? undefined : rekeyFocus(legendFocus, model!, m);
    note = r.note;
    if (opensDrawer(m)) drawer = { open: true, tab: "diagnostics" };
  } else {
    level = "";
    selection = undefined;
    expanded = m?.tree ? defaultExpansion(m.tree) : new Set();
    drawer = { open: !!m && opensDrawer(m), tab: "diagnostics" };
    views = new Map();
    layouts = new Map();
    query = "";
    legendFocus = undefined;
    note = undefined;
  }
  model = m;
  if (m?.tree && hashed !== undefined && hashed !== level && isLevel(m.tree, hashed)) {
    level = hashed;
    note = undefined;
    const v = new Map(views);
    v.delete(hashed);
    views = v;
  }
  if (m?.tree) expand([...ancestors(m.tree, level), level]);
  replaceHash();
}

function expand(paths: string[]) {
  if (paths.every((p) => expanded.has(p))) return;
  expanded = new Set([...expanded, ...paths]);
}

/** Shows a level without touching the history: the selection cleared, its row and its ancestors expanded, the note gone. */
function show(path: string): boolean {
  const tree = model?.tree;
  if (!tree || !isLevel(tree, path)) return false;
  level = path;
  selection = undefined;
  note = undefined;
  expand([...ancestors(tree, path), path]);
  return true;
}

/** Opens a level, a history entry pushed with its hash. */
export function open(path: string) {
  if (show(path)) pushHash();
}

/** Opens the open level's parent. */
export function climb() {
  const p = model?.tree?.parent.get(level);
  if (p !== undefined) open(p);
}

/** Back or forward: the level the hash names, the root when it names none, nothing pushed; `state` the entry's. */
export function openFromHistory(path: string | undefined, state?: unknown) {
  const s = state as { load?: string; depth?: number } | null | undefined;
  depth = s?.load === LOAD && typeof s.depth === "number" ? s.depth : 0;
  if (!show(path !== undefined && model?.tree && isLevel(model.tree, path) ? path : "")) return;
  replaceHash();
}

/** Selects an element on its level, showing that level; a node's or folder's row is revealed. */
export function select(s: Selection | undefined) {
  const tree = model?.tree;
  selection = s;
  if (!tree || !s) return;
  const { kind, id } = s.target;
  if ((kind === "block" && tree.byPath.has(id)) || (kind === "folder" && folderOf(tree, id))) expand(ancestors(tree, id));
  if (s.level !== level) {
    level = s.level;
    replaceHash();
  }
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

export function setView(path: string, view: View) {
  views = new Map(views).set(path, view);
}

export function setLayout(path: string, geometry: Geometry, dragged: ReadonlySet<string>) {
  layouts = new Map(layouts).set(path, { geometry, dragged, stale: false });
}

export function setQuery(text: string) {
  query = text;
}

export function setFocus(region: Region | undefined) {
  focus = region;
}

/** A click on a legend line: focuses its key, or clears the focus when it is the focused one. */
export function toggleLegendFocus(key: string) {
  legendFocus = legendFocus === key ? undefined : key;
}

export function clearLegendFocus() {
  legendFocus = undefined;
}

/** Escape's chain: the legend's focus, then a standing query, then the selection. The route's step, first, waits for increment 7. */
export function escape() {
  if (legendFocus !== undefined) legendFocus = undefined;
  else if (query !== "") query = "";
  else select(undefined);
}
