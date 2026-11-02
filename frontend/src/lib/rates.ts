// Rate mode's data (visual_grammar.md answer 6): each drawn block's timing
// triple, the model's palette order, a level's legend and the clock badge.
import type { Node } from "./descriptor";
import { levelOf, producerFace, type LevelWire } from "./level";
import type { Model } from "./model";
import { terminalProducer } from "./resolve";

/** A timing triple: the anchor's index (0 the base grid), the multiple `m` and the phase `c`. */
export type Triple = [anchor: number, m: number, c: number];
export const tripleKey = (t: Triple): string => t.join(",");
/** The palette's colored steps; a triple from this index on is an extra. */
export const STEPS = 8;

const triple = (t: { anchor: number; m: number; c: number }): Triple => [t.anchor, t.m, t.c];
const isDiscreteLeaf = (n: Node) => n.class === "leaf" && n.tier === "discrete";

/** The timing triples of the discrete leaves beneath an assembly, in walk order, repeats kept. */
function leafTriples(model: Model, path: string): Triple[] {
  const tree = model.tree!;
  const out: Triple[] = [];
  for (const c of tree.children.get(path) ?? []) {
    const n = tree.byPath.get(c)!;
    if (n.class === "leaf") {
      if (isDiscreteLeaf(n)) out.push(triple(n.timing));
    } else out.push(...leafTriples(model, c));
  }
  return out;
}

/**
 * A block's triple in rate mode (visual_grammar.md answer 6, amended 2026-11-02): a discrete leaf's own timing; a
 * closed assembly's the one triple its discrete leaves share, since an assembly ticks on nothing itself and its
 * `scopes` row, a frame for its `Relative` children, plays no part; `undefined` for a continuous leaf and an
 * assembly with no discrete leaf, which take the continuous color, and for a mixed assembly, which takes the
 * assembly gray (`mixed`).
 */
export function blockTriple(model: Model, path: string): Triple | undefined {
  const n = model.tree!.byPath.get(path);
  if (!n) return undefined;
  if (n.class === "leaf") return isDiscreteLeaf(n) ? triple(n.timing) : undefined;
  const clocks = clocksBeneath(model, path);
  return clocks.length === 1 ? clocks[0] : undefined;
}

/** Whether an assembly's discrete leaves tick on several triples, the assembly gray's case. */
export const mixed = (model: Model, path: string): boolean => clocksBeneath(model, path).length > 1;

/** A triple's period in seconds, the anchor's `T` times `m`; the base grid before every anchor. */
function period(model: Model, t: Triple): number {
  if (t[0] === 0) return -1;
  const T = model.structure!.anchors[t[0] - 1].T;
  return (T.num / T.den) * t[1];
}

/**
 * Every triple a drawn block takes, the root's leaf included when the root is primitive, in palette order: anchor 0
 * first, then by period ascending, ties by anchor index, then `m`, then `c`. A triple's step is its index.
 */
export function tripleOrder(model: Model): Triple[] {
  const seen = new Map<string, Triple>();
  for (const n of model.structure!.nodes) {
    if (n.path === "" && n.class !== "leaf") continue;
    const t = blockTriple(model, n.path);
    if (t) seen.set(tripleKey(t), t);
  }
  return [...seen.values()].sort((a, b) => period(model, a) - period(model, b) || a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

/** Each triple's step by its key. */
export const stepsOf = (model: Model): Map<string, number> => new Map(tripleOrder(model).map((t, i) => [tripleKey(t), i]));

/** A triple read out: `anchor 1 (1/10 s) × 2, phase 1`, `base grid` for anchor 0, `× m` past 1, the phase past 0. */
export function tripleText(model: Model, t: Triple): string {
  const T = t[0] === 0 ? undefined : model.structure!.anchors[t[0] - 1].T;
  const head = T ? `anchor ${t[0]} (${T.num}/${T.den} s)` : "base grid";
  return `${head}${t[1] > 1 ? ` × ${t[1]}` : ""}${t[2] > 0 ? `, phase ${t[2]}` : ""}`;
}

/** The anchor's key and the scope declaring it, `fast at the root`; the base grid for anchor 0. */
export function tripleTitle(model: Model, t: Triple): string {
  if (t[0] === 0) return "the base grid";
  const a = model.structure!.anchors[t[0] - 1];
  return `${a.key} at ${a.scope === "" ? "the root" : a.scope}`;
}

/** The continuous line's key, beside the triples' keys. */
export const CONTINUOUS = "continuous";

/** A legend line: a triple's, or the continuous color's, which has no triple and no step. */
export interface LegendLine {
  /** The triple's key, or `CONTINUOUS`. */
  key: string;
  triple?: Triple;
  step?: number;
  text: string;
  title: string;
}

/** The blocks a level draws that can take a color: its children, or a primitive root's leaf. */
function drawnPaths(model: Model, level: string): string[] {
  const n = model.tree!.byPath.get(level)!;
  return n.class === "leaf" ? [level] : model.tree!.children.get(level)!;
}

/**
 * The continuous line first (visual_grammar.md answer 6, amended 2026-11-02), when a block takes the continuous
 * color or a wire the continuous wire color, a root input's wires being neutral; then the triples visible on the
 * level, each drawn block's and each wire's, in palette order.
 */
export function legend(model: Model, level: string, steps = stepsOf(model)): LegendLine[] {
  const visible = new Map<string, Triple>();
  let continuous = false;
  for (const p of drawnPaths(model, level)) {
    const t = blockTriple(model, p);
    if (t) visible.set(tripleKey(t), t);
    else if (!mixed(model, p)) continuous = true;
  }
  for (const w of levelOf(model.tree!, model.resolution!, level).wires) {
    const t = wireTriple(model, level, w);
    if (t) visible.set(tripleKey(t), t);
    else if (!fromRootInput(model, level, w)) continuous = true;
  }
  const lines: LegendLine[] = [...visible.values()]
    .map((t) => ({ key: tripleKey(t), triple: t, step: steps.get(tripleKey(t))!, text: tripleText(model, t), title: tripleTitle(model, t) }))
    .sort((a, b) => a.step! - b.step!);
  if (continuous) lines.unshift({ key: CONTINUOUS, text: "continuous", title: "No rate: continuous leaves, assemblies with no discrete leaf, and their wires" });
  return lines;
}

/** The distinct triples of the discrete leaves under an assembly, in walk order. */
export function clocksBeneath(model: Model, path: string): Triple[] {
  return [...new Map(leafTriples(model, path).map((t) => [tripleKey(t), t])).values()];
}

/** The clock badge's count: the distinct triples of the discrete leaves beneath an assembly, 0 with none. */
export const clockCount = (model: Model, path: string): number => clocksBeneath(model, path).length;

/** Whether a level wire's terminal producer is a root input, whose wires stay neutral. */
export function fromRootInput(model: Model, level: string, w: LevelWire): boolean {
  return terminalProducer(model.resolution!, producerFace(level, w))?.end === "root-input";
}

/** A wire's terminal producer's triple; `undefined` from a root input (neutral) and from a continuous producer (the continuous wire color). */
export function wireTriple(model: Model, level: string, w: LevelWire): Triple | undefined {
  const t = terminalProducer(model.resolution!, producerFace(level, w));
  return t?.end === "leaf-output" ? blockTriple(model, t.face.path) : undefined;
}
