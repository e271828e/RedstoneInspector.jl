// One level as the canvas draws it (visual_grammar.md answers 3 and 4), and
// the ELK graph over it. Sizes come from the caller: nothing here measures text.
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import type { Resolution } from "./resolve";
import { displayName, type Tree } from "./tree";

/** An input face of the opened level, drawn as a pin with one output port. */
export interface InPin {
  id: string;
  role: "in";
  name: string;
  /** A pin of the root: a root input, drawn as a tag. */
  rootInput: boolean;
}
/** An output face of the opened level, drawn as a pin with one input port. */
export interface OutPin {
  id: string;
  role: "out";
  name: string;
}
/** A child of the opened level; `role` is its class. */
export interface ChildBlock {
  id: string;
  role: "leaf" | "assembly";
  path: string;
  segment: string;
  displayName: string;
  tier?: "continuous" | "discrete";
  inputs: string[];
  outputs: string[];
}
export type Block = InPin | OutPin | ChildBlock;

export interface LevelEnd {
  block: string;
  port: string;
}
export interface LevelWire {
  /** The consumer's port id, unique within a level. */
  id: string;
  from: LevelEnd;
  to: LevelEnd;
}
export interface Level {
  path: string;
  blocks: Block[];
  wires: LevelWire[];
}

export const inPinId = (name: string) => `⟨in⟩${name}`;
export const outPinId = (name: string) => `⟨out⟩${name}`;
export const portId = (block: string, side: "in" | "out", name: string) => `${block}|${side}|${name}`;

/** Input pins, the children in walk order, output pins; the wires keyed by their consumer. A primitive root is its one block. */
export function levelOf(tree: Tree, _res: Resolution, path: string): Level {
  const self = tree.byPath.get(path);
  if (!self) throw new Error(`no node at "${path}"`);
  if (self.class === "leaf") {
    if (path !== "") throw new Error(`"${path}" is a leaf, not a level`);
    return { path, blocks: [childBlock(tree, path)], wires: [] };
  }
  const blocks: Block[] = [
    ...self.inputs.map((f): InPin => ({ id: inPinId(f.name), role: "in", name: f.name, rootInput: path === "" })),
    ...tree.children.get(path)!.map((c) => childBlock(tree, c)),
    ...self.outputs.map((f): OutPin => ({ id: outPinId(f.name), role: "out", name: f.name })),
  ];
  const wires = self.wires.map((w): LevelWire => {
    const from = { block: w.from.path === path ? inPinId(w.from.port) : w.from.path, port: w.from.port };
    const to = { block: w.to.path === path ? outPinId(w.to.port) : w.to.path, port: w.to.port };
    return { id: portId(to.block, "in", to.port), from, to };
  });
  return { path, blocks, wires };
}

function childBlock(tree: Tree, path: string): ChildBlock {
  const n = tree.byPath.get(path)!;
  return {
    id: path, role: n.class, path, segment: tree.segment.get(path) ?? "", displayName: displayName(n),
    tier: n.class === "leaf" ? n.tier : undefined,
    inputs: n.inputs.map((f) => f.name), outputs: n.outputs.map((f) => f.name),
  };
}

/** A port's position relative to its block. */
export interface PortPosition {
  side: "in" | "out";
  name: string;
  x: number;
  y: number;
}
/** A block's size and port positions, measured by the canvas. */
export interface BlockSize {
  width: number;
  height: number;
  ports: PortPosition[];
}

const ROOT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.layered.cycleBreaking.strategy": "MODEL_ORDER",
  "elk.spacing.nodeNode": "24",
  "elk.layered.spacing.nodeNodeBetweenLayers": "40",
  "elk.layered.spacing.edgeNodeBetweenLayers": "14",
  "elk.spacing.edgeEdge": "6",
  "elk.padding": "[top=20,left=20,bottom=20,right=20]",
};

/** ELK's graph for one level: fixed ports, input pins first and output pins last, the wires port to port. */
export function elkGraph(level: Level, sizes: ReadonlyMap<string, BlockSize>): ElkNode {
  const children: ElkNode[] = level.blocks.map((b) => {
    const size = sizes.get(b.id)!;
    const layer: Record<string, string> = b.role === "in" ? { "elk.layered.layering.layerConstraint": "FIRST_SEPARATE" }
      : b.role === "out" ? { "elk.layered.layering.layerConstraint": "LAST_SEPARATE" } : {};
    return {
      id: b.id, width: size.width, height: size.height,
      layoutOptions: { "elk.portConstraints": "FIXED_POS", ...layer },
      ports: size.ports.map((p) => ({
        id: portId(b.id, p.side, p.name), x: p.x, y: p.y, width: 0, height: 0,
        layoutOptions: { "elk.port.side": p.side === "in" ? "WEST" : "EAST" },
      })),
    };
  });
  const edges: ElkExtendedEdge[] = level.wires.map((w) => ({
    id: w.id, sources: [portId(w.from.block, "out", w.from.port)], targets: [portId(w.to.block, "in", w.to.port)],
  }));
  return { id: "level", layoutOptions: ROOT_OPTIONS, children, edges };
}
