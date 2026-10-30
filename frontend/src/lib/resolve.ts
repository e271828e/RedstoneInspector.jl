// The client's resolution (initial_design.md answer 18): every face to its
// terminal producer and through every fan-out to its terminal consumers, built
// once on load from the wires as declared.
import type { LeafFace, StructureSection, Wire } from "./descriptor";
import type { Tree } from "./tree";

export type Side = "in" | "out";
/** A face: a node's path, the side it is declared on and its name. A root input is `("", "in", name)`. */
export interface Face {
  path: string;
  side: Side;
  port: string;
}
/** One step of a resolution: the face at the other end of a wire, and the level that declares the wire. */
interface Hop {
  face: Face;
  level: string;
}

export interface Resolution {
  tree: Tree;
  structure: StructureSection;
  /** The producer feeding each consumer face: a leaf input, an assembly's input face at its parent, an output face inside its own level. */
  feeder: Map<string, Hop>;
  /** The consumers fed by each producer face, in wire order. */
  fanout: Map<string, Hop[]>;
}

export const faceKey = (f: Face): string => JSON.stringify([f.path, f.side, f.port]);

/** A wire's two ends as faces: an endpoint on the level's own path is one of the level's boundary faces. */
export function wireFaces(level: string, w: Wire): { from: Face; to: Face } {
  return {
    from: { path: w.from.path, side: w.from.path === level ? "in" : "out", port: w.from.port },
    to: { path: w.to.path, side: w.to.path === level ? "out" : "in", port: w.to.port },
  };
}

export function buildResolution(tree: Tree, structure: StructureSection): Resolution {
  const feeder = new Map<string, Hop>();
  const fanout = new Map<string, Hop[]>();
  for (const n of structure.nodes) {
    if (n.class !== "assembly") continue;
    for (const w of n.wires) {
      const { from, to } = wireFaces(n.path, w);
      feeder.set(faceKey(to), { face: from, level: n.path });
      const k = faceKey(from);
      if (!fanout.has(k)) fanout.set(k, []);
      fanout.get(k)!.push({ face: to, level: n.path });
    }
  }
  return { tree, structure, feeder, fanout };
}

const isRootInput = (f: Face) => f.path === "" && f.side === "in";
const isLeaf = (res: Resolution, f: Face) => res.tree.byPath.get(f.path)?.class === "leaf";
const isRootOutput = (res: Resolution, f: Face) => f.path === "" && f.side === "out" && !isLeaf(res, f);

export interface TerminalProducer {
  face: Face;
  end: "leaf-output" | "root-input";
  /** The producer faces the walk passes, the terminal last; an output face is its own first, a consumer starts at its feeder. */
  chain: Face[];
}

/**
 * From a leaf input, an assembly face or a root face, upstream to the leaf output
 * or root input that produces its value. A primitive root's inputs are root inputs.
 */
export function terminalProducer(res: Resolution, face: Face): TerminalProducer | undefined {
  let cur: Face | undefined = face;
  if (face.side === "in" && !isRootInput(face)) cur = res.feeder.get(faceKey(face))?.face;
  const chain: Face[] = [];
  while (cur) {
    chain.push(cur);
    if (isRootInput(cur)) return { face: cur, end: "root-input", chain };
    if (cur.side === "out" && isLeaf(res, cur)) return { face: cur, end: "leaf-output", chain };
    cur = res.feeder.get(faceKey(cur))?.face;
  }
  return undefined;
}

/** Downstream from a producer face, an assembly face or a root input, through every fan-out to every leaf input or root output, in wire order. */
export function terminalConsumers(res: Resolution, face: Face): Face[] {
  const out: Face[] = [];
  walkDown(res, face, (_, hop, terminal) => terminal && out.push(hop.face));
  return out;
}

function walkDown(res: Resolution, face: Face, visit: (from: Face, hop: Hop, terminal: boolean) => void): void {
  for (const hop of res.fanout.get(faceKey(face)) ?? []) {
    const terminal = (hop.face.side === "in" && isLeaf(res, hop.face)) || isRootOutput(res, hop.face);
    visit(face, hop, terminal);
    if (!terminal) walkDown(res, hop.face, visit);
  }
}

/** A face's type, kind marker and pinned flag: a leaf's own, a root input's from `root_inputs`, an assembly face's from its terminal producer. */
export function faceInfo(res: Resolution, path: string, side: Side, name: string): LeafFace | undefined {
  const node = res.tree.byPath.get(path);
  if (node?.class === "leaf") return (side === "in" ? node.inputs : node.outputs).find((f) => f.name === name);
  if (isRootInput({ path, side, port: name })) return res.structure.root_inputs.find((f) => f.name === name);
  const t = terminalProducer(res, { path, side, port: name });
  return t && faceInfo(res, t.face.path, t.face.side, t.face.port);
}

export interface RouteWire {
  level: string;
  from: Face;
  to: Face;
}
/** A face route (workspace.md answer 8): a tree rooted at the terminal producer. */
export interface Route {
  producer: Face;
  end: TerminalProducer["end"];
  consumers: Face[];
  /** Every wire the value crosses, depth first from the producer in wire order. */
  wires: RouteWire[];
  /** The levels whose wires the route crosses. */
  levels: Set<string>;
}

/** The route through any face: up to its terminal producer, then down through every fan-out. */
export function route(res: Resolution, path: string, side: Side, name: string): Route | undefined {
  const t = terminalProducer(res, { path, side, port: name });
  if (!t) return undefined;
  const consumers: Face[] = [];
  const wires: RouteWire[] = [];
  walkDown(res, t.face, (from, hop, terminal) => {
    wires.push({ level: hop.level, from, to: hop.face });
    if (terminal) consumers.push(hop.face);
  });
  return { producer: t.face, end: t.end, consumers, wires, levels: new Set(wires.map((w) => w.level)) };
}

/** A wire's route is its producer face's. */
export function wireRoute(res: Resolution, level: string, w: Wire): Route | undefined {
  const { from } = wireFaces(level, w);
  return route(res, from.path, from.side, from.port);
}
