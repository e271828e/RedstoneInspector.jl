// Search over the model (workspace.md answer 5): case-insensitive substrings over
// paths, types with their aliases and face names, never a regular expression and
// never a parse of a name. Docstrings and parameters are not searched.
import { faceSelection, type Selection } from "./detail";
import { inPinId, outPinId, portId } from "./level";
import type { Model } from "./model";
import type { Side } from "./resolve";
import { displayName, type Tree } from "./tree";

export type Field = "path" | "type" | "face";
export interface Term {
  /** Undefined for a bare term, which matches all three fields. */
  field: Field | undefined;
  text: string;
}
/** A matched span, start inclusive, end exclusive. */
export type Range = [number, number];

export interface NodeHit {
  path: string;
  /** What the row shows beside the path: the display name, or the qualified name when a type term matched outside it. */
  label: string;
  match: { path: Range[]; label: Range[] };
}
export interface FaceHit {
  /** The owner's path. */
  path: string;
  side: Side;
  name: string;
  match: { path: Range[]; name: Range[] };
}
export interface Found {
  /** Every node hit, in walk order. */
  nodes: NodeHit[];
  /** Every face hit, in walk order, each node's inputs before its outputs. */
  faces: FaceHit[];
  /** The listed rows, the nodes group then the faces group, at most `CAP`. */
  rows: (NodeHit | FaceHit)[];
  /** The uncapped count. */
  total: number;
}

export const CAP = 100;
const PREFIXES: Field[] = ["path", "type", "face"];

/**
 * Space-separated terms, lower-cased; `path:`, `type:` and `face:` taken when spelled exactly, else the whole word
 * bare. A prefix with no text after it is no term.
 */
export function parseQuery(text: string): Term[] {
  return text.split(/\s+/).filter((w) => w !== "").map((w): Term => {
    const i = w.indexOf(":");
    const prefix = w.slice(0, i) as Field;
    return i > 0 && PREFIXES.includes(prefix) ? { field: prefix, text: w.slice(i + 1).toLowerCase() } : { field: undefined, text: w.toLowerCase() };
  }).filter((t) => t.text !== "");
}

/** Every occurrence of every needle in the text, merged, case-insensitive. */
export function ranges(text: string, needles: string[]): Range[] {
  const t = text.toLowerCase();
  const found: Range[] = [];
  for (const n of needles) {
    if (n === "") continue;
    for (let i = t.indexOf(n); i >= 0; i = t.indexOf(n, i + 1)) found.push([i, i + n.length]);
  }
  found.sort((a, b) => a[0] - b[0]);
  const merged: Range[] = [];
  for (const r of found) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}

const has = (text: string, needle: string) => text.toLowerCase().includes(needle);
const typeText = (n: { type: string; alias?: string }) => `${n.type} ${n.alias ?? ""}`;
const needles = (terms: Term[], ...fields: (Field | undefined)[]) => terms.filter((t) => fields.includes(t.field)).map((t) => t.text);

/** The node and face hits of a parsed query over the whole model; none without terms. */
export function searchModel(model: Model, query: Term[]): Found {
  const nodes: NodeHit[] = [];
  const faces: FaceHit[] = [];
  for (const n of model.structure?.nodes ?? []) {
    const nodeHit = query.length > 0 && query.every((t) =>
      t.field === "face" ? false
      : t.field === "path" ? has(n.path, t.text)
      : t.field === "type" ? has(typeText(n), t.text)
      : has(n.path, t.text) || has(typeText(n), t.text));
    if (nodeHit) {
      const typeNeedles = needles(query, undefined, "type").filter((x) => has(typeText(n), x));
      const shown = displayName(n);
      const label = typeNeedles.every((x) => has(shown, x)) ? shown : n.alias ?? n.type;
      nodes.push({ path: n.path, label, match: { path: ranges(n.path, needles(query, undefined, "path")), label: ranges(label, typeNeedles) } });
    }
    for (const [side, list] of [["in", n.inputs], ["out", n.outputs]] as const) {
      for (const f of list) {
        const faceHit = query.length > 0 && query.every((t) =>
          t.field === "path" ? has(n.path, t.text) : t.field === "type" ? has(typeText(n), t.text) : has(f.name, t.text));
        if (faceHit) {
          faces.push({
            path: n.path, side, name: f.name,
            match: { path: ranges(n.path, needles(query, "path")), name: ranges(f.name, needles(query, undefined, "face")) },
          });
        }
      }
    }
  }
  return { nodes, faces, rows: [...nodes, ...faces].slice(0, CAP), total: nodes.length + faces.length };
}

/** The node paths that are hits or own a face hit. */
export const marked = (found: Found): Set<string> => new Set([...found.nodes.map((h) => h.path), ...found.faces.map((h) => h.path)]);

/** For each assembly path, the root's included, the count of marked nodes beneath it. */
export function beneath(tree: Tree, marks: ReadonlySet<string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of marks) {
    for (let p = tree.parent.get(m); p !== undefined; p = tree.parent.get(p)) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return counts;
}

/** What the open level draws as hits: blocks and pins, closed assemblies with marked nodes beneath, port squares. */
export interface LevelHits {
  blocks: Set<string>;
  under: Set<string>;
  ports: Set<string>;
}

/**
 * On a level: its children that are node hits and the pins of its own faces hit; its closed children, not hits
 * themselves, with marked nodes beneath; the port squares of its children's faces hit.
 */
export function levelHits(tree: Tree, level: string, found: Found): LevelHits {
  const children = new Set(tree.children.get(level) ?? []);
  const nodeHits = new Set(found.nodes.map((h) => h.path));
  const counts = beneath(tree, marked(found));
  const blocks = new Set([...children].filter((c) => nodeHits.has(c)));
  const ports = new Set<string>();
  for (const f of found.faces) {
    if (f.path === level) blocks.add(f.side === "in" ? inPinId(f.name) : outPinId(f.name));
    else if (children.has(f.path)) ports.add(portId(f.path, f.side, f.name));
  }
  const under = new Set([...children].filter((c) => !nodeHits.has(c) && tree.byPath.get(c)!.class === "assembly" && (counts.get(c) ?? 0) > 0));
  return { blocks, under, ports };
}

/** What picking a hit selects: a node as its tree row's click does, a face through `faceSelection`. */
export function hitSelection(tree: Tree, level: string, hit: NodeHit | FaceHit): Selection {
  if ("side" in hit) return faceSelection(tree, { path: hit.path, side: hit.side, port: hit.name });
  return { level: hit.path === "" ? level : tree.parent.get(hit.path)!, target: { kind: "block", id: hit.path } };
}

/**
 * `n` and `N`: the selection of the next (`step` 1) or previous (-1) hit in the full order, nodes then faces, not
 * capped, after the current selection when it is a hit, else the first or the last; wrapping. Undefined without hits.
 */
export function stepHit(tree: Tree, level: string, found: Found, current: Selection | undefined, step: 1 | -1): Selection | undefined {
  const all = [...found.nodes, ...found.faces].map((h) => hitSelection(tree, level, h));
  if (!all.length) return undefined;
  const i = current
    ? all.findIndex((s) => s.level === current.level && s.target.kind === current.target.kind && s.target.id === current.target.id)
    : -1;
  return all[i < 0 ? (step > 0 ? 0 : all.length - 1) : (i + step + all.length) % all.length];
}
