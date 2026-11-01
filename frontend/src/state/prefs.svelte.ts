// The per-browser presentation state (workspace.md answers 1, 7 and 9): the
// splitters, the collapsed side panes, the color mode and the type labels, one
// versioned key in local storage.

export type Side = "tree" | "detail";
export type Splitter = Side | "drawer";
/** The canvas's color mode (visual_grammar.md answer 6). */
export type Mode = "tier" | "rate";

export interface Prefs {
  version: 1;
  /** The tree's and the detail pane's widths and the drawer's height, in CSS pixels. */
  sizes: Record<Splitter, number>;
  collapsed: Record<Side, boolean>;
  mode: Mode;
  /** The wires' type labels shown. */
  labels: boolean;
}

export const KEY = "redstone-inspector/prefs";
/** Each splitter's minimum and maximum. */
export const BOUNDS: Record<Splitter, [number, number]> = { tree: [160, 640], detail: [240, 800], drawer: [80, 640] };
const DEFAULTS: Prefs = { version: 1, sizes: { tree: 280, detail: 360, drawer: 200 }, collapsed: { tree: false, detail: false }, mode: "tier", labels: false };

export const clamp = (s: Splitter, px: number): number => Math.min(BOUNDS[s][1], Math.max(BOUNDS[s][0], Math.round(px)));

/** The stored text read back; the defaults on a missing, malformed or differently versioned entry, a size out of bounds clamped. */
export function parsePrefs(text: string | null): Prefs {
  const p: Prefs = structuredClone(DEFAULTS);
  let d: any;
  try {
    d = JSON.parse(text ?? "null");
  } catch {
    return p;
  }
  if (d?.version !== 1) return p;
  for (const s of ["tree", "detail", "drawer"] as const) {
    if (typeof d.sizes?.[s] === "number" && Number.isFinite(d.sizes[s])) p.sizes[s] = clamp(s, d.sizes[s]);
  }
  for (const s of ["tree", "detail"] as const) if (typeof d.collapsed?.[s] === "boolean") p.collapsed[s] = d.collapsed[s];
  if (d.mode === "tier" || d.mode === "rate") p.mode = d.mode;
  if (typeof d.labels === "boolean") p.labels = d.labels;
  return p;
}

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function write(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // storage refused: the prefs last for the page
  }
}

export const prefs: Prefs = $state(typeof window === "undefined" ? structuredClone(DEFAULTS) : parsePrefs(read()));

export function setSize(s: Splitter, px: number) {
  prefs.sizes[s] = clamp(s, px);
  write($state.snapshot(prefs));
}

export function toggleCollapsed(s: Side) {
  prefs.collapsed[s] = !prefs.collapsed[s];
  write($state.snapshot(prefs));
}

export function setMode(mode: Mode) {
  prefs.mode = mode;
  write($state.snapshot(prefs));
}

export function toggleLabels() {
  prefs.labels = !prefs.labels;
  write($state.snapshot(prefs));
}
