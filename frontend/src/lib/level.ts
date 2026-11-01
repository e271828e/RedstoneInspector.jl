// One level as the canvas draws it (visual_grammar.md answers 3 and 4), and
// the ELK graph over it. Sizes come from the caller: nothing here measures text.
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import type { Region } from "./regions";
import type { Face, Resolution } from "./resolve";
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
/** A port id's parts, read from its end, since a face name holds no `|`. */
export function parsePortId(id: string): { block: string; side: "in" | "out"; name: string } {
  const j = id.lastIndexOf("|"), i = id.lastIndexOf("|", j - 1);
  return { block: id.slice(0, i), side: id.slice(i + 1, j) as "in" | "out", name: id.slice(j + 1) };
}

/**
 * Input pins, the children in walk order, output pins; the wires keyed by their consumer.
 * A primitive root is its one block with a pin and a wire per face.
 */
export function levelOf(tree: Tree, _res: Resolution, path: string): Level {
  const self = tree.byPath.get(path);
  if (!self) throw new Error(`no node at "${path}"`);
  const inPins = self.inputs.map((f): InPin => ({ id: inPinId(f.name), role: "in", name: f.name, rootInput: path === "" }));
  const outPins = self.outputs.map((f): OutPin => ({ id: outPinId(f.name), role: "out", name: f.name }));
  if (self.class === "leaf") {
    if (path !== "") throw new Error(`"${path}" is a leaf, not a level`);
    const wires = [
      ...self.inputs.map((f) => levelWire({ block: inPinId(f.name), port: f.name }, { block: path, port: f.name })),
      ...self.outputs.map((f) => levelWire({ block: path, port: f.name }, { block: outPinId(f.name), port: f.name })),
    ];
    return { path, blocks: [...inPins, childBlock(tree, path), ...outPins], wires };
  }
  const blocks: Block[] = [...inPins, ...tree.children.get(path)!.map((c) => childBlock(tree, c)), ...outPins];
  const wires = self.wires.map((w): LevelWire => {
    const from = { block: w.from.path === path ? inPinId(w.from.port) : w.from.path, port: w.from.port };
    const to = { block: w.to.path === path ? outPinId(w.to.port) : w.to.path, port: w.to.port };
    return levelWire(from, to);
  });
  return { path, blocks, wires };
}

const levelWire = (from: LevelEnd, to: LevelEnd): LevelWire => ({ id: portId(to.block, "in", to.port), from, to });

/** A level wire's producer as a face: the level's own input face from a pin, else the child's output face. */
export function producerFace(level: string, w: LevelWire): Face {
  const pin = w.from.block === inPinId(w.from.port);
  return { path: pin ? level : w.from.block, side: pin ? "in" : "out", port: w.from.port };
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

// Greedy cycle breaking, with declaration order as the tie-break.
const ROOT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.layered.considerModelOrder.components": "MODEL_ORDER",
  "elk.layered.cycleBreaking.strategy": "GREEDY_MODEL_ORDER",
  "elk.spacing.nodeNode": "24",
  "elk.layered.spacing.nodeNodeBetweenLayers": "40",
  "elk.layered.spacing.edgeNodeBetweenLayers": "14",
  "elk.spacing.edgeEdge": "6",
  "elk.padding": "[top=20,left=20,bottom=20,right=20]",
};

/** A region's compound node id. */
export const regionNodeId = (path: string) => `region:${path}`;
/** A region's frame around its members: room for the caption on top. */
export const REGION_PADDING = { top: 28, left: 12, bottom: 12, right: 12 };
const REGION_OPTIONS = {
  "elk.padding": `[top=${REGION_PADDING.top},left=${REGION_PADDING.left},bottom=${REGION_PADDING.bottom},right=${REGION_PADDING.right}]`,
};

/**
 * ELK's graph for one level: fixed ports, input pins first and output pins last, the wires port to port. A level
 * with regions nests each region's members in a compound node, at its first member's place, and lays out across
 * the hierarchy; a level with none builds the flat graph.
 */
export function elkGraph(level: Level, sizes: ReadonlyMap<string, BlockSize>, regions: readonly Region[] = []): ElkNode {
  const flat: ElkNode[] = level.blocks.map((b) => {
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
  if (!regions.length) return { id: "level", layoutOptions: ROOT_OPTIONS, children: flat, edges };
  const regionOf = new Map(regions.flatMap((r) => r.members.map((m) => [m, r] as const)));
  const byId = new Map(flat.map((c) => [c.id, c]));
  const children: ElkNode[] = [];
  for (const c of flat) {
    const r = regionOf.get(c.id);
    if (!r) children.push(c);
    else if (r.members[0] === c.id)
      children.push({ id: regionNodeId(r.path), layoutOptions: REGION_OPTIONS, children: r.members.map((m) => byId.get(m)!) });
  }
  return { id: "level", layoutOptions: { ...ROOT_OPTIONS, "elk.hierarchyHandling": "INCLUDE_CHILDREN" }, children, edges };
}
