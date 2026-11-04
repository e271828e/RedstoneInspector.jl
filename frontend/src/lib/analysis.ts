// The drawer's analysis tabs as data (workspace.md answer 6 and 7): the execution
// order with its stage ports and the presumed feedthrough edges, the order badges,
// the root inputs with their terminal consumers, the timing tables, the schedule
// note, and what a row's click selects.
import type { Rational } from "./descriptor";
import { faceSelection, faceFacts, kindPhrase, type Selection } from "./detail";
import type { Model } from "./model";
import type { Face } from "./resolve";
import { inPinId } from "./level";
import { stepsOf, tripleKey, tripleText, type Triple } from "./rates";

/** A feedthrough edge under its consumer's row: a stage-2 leaf output into a leaf with a stage 2, presumed. */
export interface EdgeRow {
  kind: "edge";
  from: Face;
  to: Face;
}
export interface OrderRow {
  kind: "order";
  /** 1-based. */
  position: number;
  path: string;
  stage1: string[];
  stage2: string[];
  /** The feedthrough edges into this leaf, in `feedthroughEdges`'s order. */
  edges: EdgeRow[];
}
export interface RootInputRow {
  kind: "root-input";
  name: string;
  type: string;
  phrase: string;
  pinned: boolean;
  /** The terminal consumers: leaf inputs and root outputs; none on a primitive root, whose inputs are its leaf's. */
  consumers: Face[];
}
/** The base grid's row, anchor 0, which declares nowhere and whose `T` is the deployment's `Δt`. */
export interface BaseRow {
  kind: "anchor";
  index: 0;
  base: true;
}
export interface AnchorRow {
  kind: "anchor";
  index: number;
  base?: false;
  /** `1/50 s`. */
  T: string;
  tau: string;
  /** The declaring scope's path, `""` for the root. */
  scope: string;
  key: string;
}
export interface ScopeRow {
  kind: "scope";
  path: string;
  key: string;
  triple: Triple;
  text: string;
}
export interface ComponentRow {
  kind: "component";
  path: string;
  triple: Triple;
  text: string;
  /** `1/25 s`, or base ticks for anchor 0: `1 base tick`, `2 base ticks`. */
  period: string;
  /** The palette's step of the triple. */
  step: number;
}
export type Row = OrderRow | EdgeRow | RootInputRow | BaseRow | AnchorRow | ScopeRow | ComponentRow;

const rational = (r: Rational) => `${r.num}/${r.den} s`;
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** One row per entry of `outputs.order`, with its stage ports and the edges it consumes; none without `outputs`. */
export function orderRows(model: Model): OrderRow[] {
  const o = model.outputs;
  if (!o) return [];
  const stages = new Map(o.components.map((c) => [c.path, c]));
  const edges = model.feedthrough ?? [];
  return o.order.map((path, i) => ({
    kind: "order", position: i + 1, path, stage1: stages.get(path)?.stage1 ?? [], stage2: stages.get(path)?.stage2 ?? [],
    edges: edges.filter((e) => e.to.path === path).map((e) => ({ kind: "edge", from: e.from, to: e.to })),
  }));
}

/** Sorted 1-based positions as runs: `3–5, 8`, a run of two `2–3`, a single `3`. */
export function ranges(positions: number[]): string {
  const ps = [...positions].sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 0; i < ps.length; ) {
    let j = i;
    while (j + 1 < ps.length && ps[j + 1] === ps[j] + 1) j++;
    out.push(i === j ? `${ps[i]}` : `${ps[i]}–${ps[j]}`);
    i = j + 1;
  }
  return out.join(", ");
}

/**
 * A block's order badge (answer 7): a leaf's position, a closed assembly's the positions of the leaves beneath it as
 * ranges; `undefined` for a leaf absent from the order, an assembly with no leaf in it and a model without `outputs`.
 */
export function orderBadge(model: Model, path: string): string | undefined {
  const tree = model.tree, o = model.outputs;
  if (!tree || !o) return undefined;
  const pos = new Map(o.order.map((p, i) => [p, i + 1]));
  const found: number[] = [];
  const walk = (p: string) => {
    const n = tree.byPath.get(p);
    if (n?.class === "leaf") {
      const k = pos.get(p);
      if (k !== undefined) found.push(k);
    } else for (const c of tree.children.get(p) ?? []) walk(c);
  };
  walk(path);
  return found.length ? ranges(found) : undefined;
}

/** One row per root input, with its kind phrase and terminal consumers. */
export function rootInputRows(model: Model): RootInputRow[] {
  const s = model.structure;
  if (!s) return [];
  return s.root_inputs.map((f) => ({
    kind: "root-input", name: f.name, type: f.type, phrase: kindPhrase(f.kind), pinned: f.pinned,
    consumers: faceFacts(model, { path: "", side: "in", port: f.name }).consumers ?? [],
  }));
}

/** The base grid's row first, then one per anchor numbered from 1; none without a structure. */
export function anchorRows(model: Model): (BaseRow | AnchorRow)[] {
  const s = model.structure;
  if (!s) return [];
  return [
    { kind: "anchor", index: 0, base: true },
    ...s.anchors.map((a, i): AnchorRow => ({ kind: "anchor", index: i + 1, T: rational(a.T), tau: rational(a.tau), scope: a.scope, key: a.key })),
  ];
}

/** The keyed rate scopes with their own triples. */
export function scopeRows(model: Model): ScopeRow[] {
  const s = model.structure;
  if (!s) return [];
  return s.scopes.map((x) => {
    const triple: Triple = [x.timing.anchor, x.timing.m, x.timing.c];
    return { kind: "scope", path: x.path, key: x.key, triple, text: tripleText(model, triple) };
  });
}

/** A triple's period: `T × m` reduced, `1/25 s`; base ticks for anchor 0, whose `Δt` a build does not know. */
function periodText(model: Model, t: Triple): string {
  if (t[0] === 0) return `${t[1]} base tick${t[1] === 1 ? "" : "s"}`;
  const T = model.structure!.anchors[t[0] - 1].T;
  const num = T.num * t[1], g = gcd(num, T.den);
  return `${num / g}/${T.den / g} s`;
}

/**
 * Every discrete leaf in walk order with its triple, period and palette step; with `byPeriod` in the palette's
 * order of their triples (`tripleOrder`: anchor 0 first, then period ascending), equal triples in walk order.
 */
export function componentRows(model: Model, byPeriod = false): ComponentRow[] {
  const s = model.structure;
  if (!s) return [];
  const steps = stepsOf(model);
  const rows = s.nodes.flatMap((n): ComponentRow[] => {
    if (n.class !== "leaf" || n.tier !== "discrete") return [];
    const triple: Triple = [n.timing.anchor, n.timing.m, n.timing.c];
    return [{ kind: "component", path: n.path, triple, text: tripleText(model, triple), period: periodText(model, triple), step: steps.get(tripleKey(triple))! }];
  });
  return byPeriod ? rows.sort((a, b) => a.step - b.step) : rows;
}

/** The timing tab's last sentence (reading 1): what the schedule rows and the hyperperiod chart wait on. */
export function scheduleNote(model: Model): string | undefined {
  if (!model.structure) return undefined;
  return model.kind === "deployment"
    ? "This deployment carries no schedule: the format's version 1.0 holds the build alone, and the schedule rows and the hyperperiod chart wait for its next minor version."
    : "The schedule rows and the hyperperiod chart need a deployment.";
}

/** A node selected on its parent's level, as the tree's row click selects it; the root on the root level. */
const nodeSelection = (model: Model, path: string): Selection | undefined =>
  model.tree?.byPath.has(path) ? { level: model.tree.parent.get(path) ?? "", target: { kind: "block", id: path } } : undefined;

/**
 * What a row's click selects: an order or component row its leaf, an edge row its consumer's input port, a root
 * input its root tag, an anchor row its declaring scope's node and a scope
 * row its assembly; nothing for the base grid's row and a root scope.
 */
export function rowTarget(model: Model, row: Row): Selection | undefined {
  const tree = model.tree;
  if (!tree) return undefined;
  switch (row.kind) {
    case "order":
    case "component":
      return nodeSelection(model, row.path);
    case "edge":
      return faceSelection(tree, row.to);
    case "root-input":
      return { level: "", target: { kind: "block", id: inPinId(row.name) } };
    case "anchor":
      return row.base || row.scope === "" ? undefined : nodeSelection(model, row.scope);
    case "scope":
      return row.path === "" ? undefined : nodeSelection(model, row.path);
  }
}
