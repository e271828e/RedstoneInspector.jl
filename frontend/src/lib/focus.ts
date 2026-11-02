// The legend's focus (visual_grammar.md answer 6 as amended in increment 6's
// look pass): a legend line's key, a triple's or the continuous color's, lights
// the blocks on it, the closed assemblies with a leaf of it beneath and the
// wires it tints, and marks the tree's rows on it.
import type { Node } from "./descriptor";
import { levelOf } from "./level";
import type { Model } from "./model";
import { blockTriple, CONTINUOUS, fromRootInput, mixed, stepsOf, tripleKey, wireTriple, type Triple } from "./rates";

const keyOf = (t: Triple | undefined): string => (t ? tripleKey(t) : CONTINUOUS);
/** A leaf's own key: a discrete leaf's timing, else the continuous color. */
const leafKey = (n: Node): string =>
  n.class === "leaf" && n.tier === "discrete" ? tripleKey([n.timing.anchor, n.timing.m, n.timing.c]) : CONTINUOUS;

/** Whether a leaf of the key lies anywhere beneath an assembly. */
function leafBeneath(model: Model, path: string, key: string): boolean {
  const tree = model.tree!;
  return (tree.children.get(path) ?? []).some((c) => {
    const n = tree.byPath.get(c)!;
    return n.class === "leaf" ? leafKey(n) === key : leafBeneath(model, c, key);
  });
}

/** What a focused key lights on a level: block ids and wire ids. */
export interface Lit {
  blocks: Set<string>;
  wires: Set<string>;
}

/**
 * On a level, the blocks whose color is the key's, the closed assemblies with a leaf of the key beneath, and the
 * wires drawn in its color, a root input's wires never; the pins are never lit. A mixed assembly, gray, is lit
 * only by a leaf beneath.
 */
export function legendLit(model: Model, level: string, key: string): Lit {
  const lv = levelOf(model.tree!, model.resolution!, level);
  const blocks = new Set<string>();
  for (const b of lv.blocks) {
    if (b.role !== "leaf" && b.role !== "assembly") continue;
    if (b.role === "assembly" && mixed(model, b.path)) { if (leafBeneath(model, b.path, key)) blocks.add(b.id); }
    else if (keyOf(blockTriple(model, b.path)) === key || (b.role === "assembly" && leafBeneath(model, b.path, key))) blocks.add(b.id);
  }
  const wires = new Set(lv.wires.filter((w) => !fromRootInput(model, level, w) && keyOf(wireTriple(model, level, w)) === key).map((w) => w.id));
  return { blocks, wires };
}

/**
 * The tree's rows on the key, the rows whose dot takes its color: a leaf by its own color, an assembly by the one
 * triple its discrete leaves share, never a mixed one nor for the continuous color (its dot is the assembly gray);
 * not the root assembly, which no level draws.
 */
export function legendMarks(model: Model, key: string): Set<string> {
  const out = new Set<string>();
  for (const n of model.structure!.nodes) {
    if (n.class === "leaf" ? keyOf(blockTriple(model, n.path)) === key : n.path !== "" && blockTriple(model, n.path) && keyOf(blockTriple(model, n.path)) === key) out.add(n.path);
  }
  return out;
}

/**
 * A focused key across a push: a triple's anchor followed by its key and scope, never its index, kept while the new
 * model draws that triple; the continuous color kept while a block takes it. `undefined` when it is gone.
 */
export function rekeyFocus(key: string, old: Model, next: Model): string | undefined {
  if (!next.structure) return undefined;
  if (key === CONTINUOUS) {
    return next.structure.nodes.some((n) => (n.path !== "" || n.class === "leaf") && !blockTriple(next, n.path) && !(n.class === "assembly" && mixed(next, n.path))) ? key : undefined;
  }
  const [a, m, c] = key.split(",").map(Number);
  let anchor = 0;
  if (a > 0) {
    const was = old.structure!.anchors[a - 1];
    anchor = next.structure.anchors.findIndex((x) => x.key === was.key && x.scope === was.scope) + 1;
    if (anchor === 0) return undefined;
  }
  const k = tripleKey([anchor, m, c]);
  return stepsOf(next).has(k) ? k : undefined;
}
