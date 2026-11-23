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

/** A feedthrough edge under its consumer's row: a stage-2 primitive output into a primitive with a stage 2, presumed. */
export interface EdgeRow {
  kind: "edge";
  from: Face;
  to: Face;
}
/** A primitive with a stage 1 port, in `outputs.order`'s order but unnumbered: stage 1 runs in any order. */
export interface Stage1Row {
  kind: "order";
  stage: 1;
  path: string;
  /** Its stage 1 ports alone. */
  ports: string[];
}
/** A primitive with a stage 2 port, numbered within the second group. */
export interface Stage2Row {
  kind: "order";
  stage: 2;
  /** 1-based, among the stage 2 rows. */
  position: number;
  path: string;
  /** Its stage 2 ports alone. */
  ports: string[];
  /** The feedthrough edges into this primitive, in `feedthroughEdges`'s order. */
  edges: EdgeRow[];
}
export type OrderRow = Stage1Row | Stage2Row;
/** The execution order's two groups, as the core runs a sweep (spec §5.3): stage 1 in any order, then stage 2 in order. */
export interface OrderGroups {
  stage1: Stage1Row[];
  stage2: Stage2Row[];
}
/** Why a consumer's entry pins a root input (deployment_overlay.md answer 14): a discrete consumer by its tier, a continuous one by its declaration. */
export type PinCause = "tier" | "declaration";
export interface RootInputRow {
  kind: "root-input";
  name: string;
  type: string;
  phrase: string;
  /** The meet's: some consumer's entry refuses the type walked to a `Dual`. */
  pinned: boolean;
  /** The terminal consumers: primitive inputs and root outputs; none on a primitive root, whose inputs are its primitive's. */
  consumers: Face[];
  /** The consumers whose entries pin it, `pinned_by` with each one's cause; a primitive root's own input among them. */
  pins: { path: string; port: string; cause: PinCause }[];
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

/**
 * The two groups over `outputs.order`: every path with a stage 1 port, then every path with a stage 2 port numbered
 * from 1 with the edges it consumes. A path with both stages stands in both, one with no output port in neither;
 * `undefined` without `outputs`.
 */
export function orderGroups(model: Model): OrderGroups | undefined {
  const o = model.outputs;
  if (!o) return undefined;
  const stages = new Map(o.components.map((c) => [c.path, c]));
  const edges = model.feedthrough ?? [];
  const stage1: Stage1Row[] = [], stage2: Stage2Row[] = [];
  for (const path of o.order) {
    const c = stages.get(path);
    if (c?.stage1.length) stage1.push({ kind: "order", stage: 1, path, ports: c.stage1 });
    if (c?.stage2.length) stage2.push({
      kind: "order", stage: 2, position: stage2.length + 1, path, ports: c.stage2,
      edges: edges.filter((e) => e.to.path === path).map((e) => ({ kind: "edge", from: e.from, to: e.to })),
    });
  }
  return { stage1, stage2 };
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
 * A block's order badge (answer 7): a primitive's position among the stage 2 rows, a closed assembly's the positions
 * of the primitives beneath it as ranges; `undefined` for a primitive with no stage 2 port, an assembly with none
 * beneath it and a model without `outputs`.
 */
export function orderBadge(model: Model, path: string): string | undefined {
  const tree = model.tree, groups = orderGroups(model);
  if (!tree || !groups) return undefined;
  const pos = new Map(groups.stage2.map((r) => [r.path, r.position]));
  const found: number[] = [];
  const walk = (p: string) => {
    const n = tree.byPath.get(p);
    if (n?.class === "primitive") {
      const k = pos.get(p);
      if (k !== undefined) found.push(k);
    } else for (const c of tree.children.get(p) ?? []) walk(c);
  };
  walk(path);
  return found.length ? ranges(found) : undefined;
}

/** One row per root input, with its kind phrase, its pinned mark, its terminal consumers and those that pin it. */
export function rootInputRows(model: Model): RootInputRow[] {
  const s = model.structure;
  if (!s) return [];
  const tier = (path: string) => (model.tree!.byPath.get(path) as { tier?: string } | undefined)?.tier;
  return s.root_inputs.map((f) => ({
    kind: "root-input", name: f.name, type: f.type, phrase: kindPhrase(f.kind), pinned: f.pinned,
    consumers: faceFacts(model, { path: "", side: "in", port: f.name }).consumers ?? [],
    pins: f.pinned_by.map((e) => ({ path: e.path, port: e.port, cause: tier(e.path) === "discrete" ? "tier" : "declaration" })),
  }));
}

/** A consumer's cause when its entry pins the row's root input; undefined when it does not. */
export const pinCause = (row: RootInputRow, face: Face): PinCause | undefined =>
  row.pins.find((p) => p.path === face.path && p.port === face.port)?.cause;

/** The base grid's row first, then one per anchor numbered from 1; none without a structure. */
export function anchorRows(model: Model): (BaseRow | AnchorRow)[] {
  const s = model.structure;
  if (!s) return [];
  return [
    { kind: "anchor", index: 0, base: true },
    ...s.anchors.map((a, i): AnchorRow => ({ kind: "anchor", index: i + 1, T: rational(a.dt), tau: rational(a.tau), scope: a.scope, key: a.key })),
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
  const T = model.structure!.anchors[t[0] - 1].dt;
  const num = T.num * t[1], g = gcd(num, T.den);
  return `${num / g}/${T.den / g} s`;
}

/**
 * Every discrete primitive in walk order with its triple, period and palette step; with `byPeriod` in the palette's
 * order of their triples (`tripleOrder`: anchor 0 first, then period ascending), equal triples in walk order.
 */
export function componentRows(model: Model, byPeriod = false): ComponentRow[] {
  const s = model.structure;
  if (!s) return [];
  const steps = stepsOf(model);
  const rows = s.nodes.flatMap((n): ComponentRow[] => {
    if (n.class !== "primitive" || n.tier !== "discrete") return [];
    const triple: Triple = [n.timing.anchor, n.timing.m, n.timing.c];
    return [{ kind: "component", path: n.path, triple, text: tripleText(model, triple), period: periodText(model, triple), step: steps.get(tripleKey(triple))! }];
  });
  return byPeriod ? rows.sort((a, b) => a.step - b.step) : rows;
}

/** The timing tab's last sentence (reading 1): that the schedule rows and the hyperperiod chart need a deployment, or are not drawn yet. */
export function scheduleNote(model: Model): string | undefined {
  if (!model.structure) return undefined;
  return model.kind === "deployment"
    ? "This page does not draw a deployment's schedule rows and hyperperiod chart yet."
    : "The schedule rows and the hyperperiod chart need a deployment.";
}

/** A node selected on its parent's level, as the tree's row click selects it; the root on the root level. */
const nodeSelection = (model: Model, path: string): Selection | undefined =>
  model.tree?.byPath.has(path) ? { level: model.tree.parent.get(path) ?? "", target: { kind: "block", id: path } } : undefined;

/**
 * What a row's click selects: an order or component row its primitive, in either group, an edge row its consumer's input port, a root
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
