// What the detail pane shows, as data (workspace.md answer 4): one function per
// selectable element, each a function of the model and the element's key.
import type { KindMarker, Location, Parameter, PrimitiveFace } from "./descriptor";
import { inPinId, levelOf, outPinId, portId } from "./level";
import type { Model } from "./model";
import { folderOf } from "./outline";
import { chainLine, framesTable, scopeFramesTable, type FramesTable } from "./timing";
import { faceInfo, faceKey, isRootInput, terminalConsumers, terminalProducer, type Face, type Side } from "./resolve";
import { displayName, type Membership, type Tree } from "./tree";

/** What a click selects: the canvas's targets and a tree folder; a block or folder by path or pin id, a wire by wire id, a port by port id. */
export interface Selected {
  kind: "block" | "wire" | "port" | "folder";
  id: string;
}
/** A selection and the level it was made on, since pin and wire ids repeat across levels. */
export interface Selection {
  level: string;
  target: Selected;
}

/** A kind marker as a short phrase: `vector 2 of float`, `array 2×2 of float`, `struct {a, b}`, `enum {up, down}`. */
export function kindPhrase(k: KindMarker): string {
  switch (k.kind) {
    case "enum":
      return `enum {${k.values.join(", ")}}`;
    case "struct":
      return `struct {${k.fields.join(", ")}}`;
    case "vector":
      return `${k.shape.length === 1 ? "vector" : "array"} ${k.shape.join("×")} of ${kindPhrase(k.element)}`;
    default:
      return k.kind;
  }
}

/** The class in the reader's words and, on a primitive, the tier: "primitive, continuous", "assembly". */
export function classPhrase(kind: "primitive" | "assembly", tier?: string): string {
  return tier ? `${kind}, ${tier}` : kind;
}

/** The member row's lead before the field: the container's kind, or "field" for a membership of neither form. */
export const memberKind = (how: Membership | undefined): string =>
  how === "transparent" ? "transparent container" : how === "keyed" ? "keyed container" : "field";

/** The membership kind explained, the member row's hover title. */
export function memberTitle(m: { how: Membership | undefined; field: string; key: string }): string {
  if (m.how === "keyed") return `Keyed: an element of the container in field ${m.field}, its path segment ${m.field}/${m.key}.`;
  if (m.how === "transparent") return `Transparent: an element of the container in field ${m.field}, its path segment the key ${m.key} alone.`;
  return `An element of the container in field ${m.field} under key ${m.key}, its path segment neither ${m.field}/${m.key} nor ${m.key}.`;
}

/** What each fact's label means, its hover title. */
export const FACT_TITLES = {
  type: "The node's Julia type, qualified by its module, with the alias the library gives it when it gives one.",
  class: "Whether the node is a primitive or an assembly and, for a primitive, its tier: continuous or discrete.",
  rate: "When the discrete primitive runs, in each frame from its rate scope to seconds.",
  children: "How many child nodes the assembly holds directly.",
  wires: "How many wires the assembly declares on its own level.",
  member: "Where the node sits in its parent: the field holding it and its key in that field's container.",
} as const;

/** One face's facts: its type and kind phrase, what feeds it and what it feeds, an output's stage. */
export interface FaceFacts {
  face: Face;
  name: string;
  type?: string;
  /** The kind marker as a phrase. */
  phrase?: string;
  /**
   * On a primitive's own face alone, where the marker is declared; none on an assembly's face, which declares none,
   * nor on a root input, whose `pinned` is the fan-out meet's and waits for the root-inputs tab (deployment_overlay.md answer 14).
   */
  pinned?: boolean;
  /** A primitive output's stage, from `outputs.components`. */
  stage?: 1 | 2;
  /** The terminal producer, when another face. */
  producer?: Face;
  /** The terminal consumers, for any face but a primitive input. */
  consumers?: Face[];
}

/** The open level: its node's facts as a closed assembly's (workspace.md answer 4) and its rate scopes. */
export interface LevelFacts extends Omit<NodeFacts, "kind"> {
  kind: "level";
  /** Each rate scope the level declares, with its frames table. */
  scopes: { key: string; table: FramesTable }[];
}
export interface NodeFacts {
  kind: "primitive" | "assembly";
  path: string;
  /** The root's is the model's label. */
  segment: string;
  displayName: string;
  tier?: "continuous" | "discrete";
  /** A discrete primitive's frames table and its chain line, none on an empty chain (deployment_overlay.md answer 10). */
  rate?: { table: FramesTable; chain?: string };
  membership?: { how: Membership | undefined; field: string; key: string };
  alias?: string;
  type: string;
  signature: string;
  docstring?: string;
  locations: Location[];
  parameters: Parameter[];
  children?: number;
  /** An assembly's own level's wires. */
  wires?: number;
  inputs: FaceFacts[];
  outputs: FaceFacts[];
}
export interface FolderFacts {
  kind: "folder";
  path: string;
  parent: string;
  field: string;
  keys: { key: string; path: string }[];
}
export interface WireFacts {
  kind: "wire";
  level: string;
  id: string;
  /** The declared endpoints, a boundary face spelled with the level's own path. */
  from: { path: string; port: string };
  to: { path: string; port: string };
  producer?: Face;
  consumers: Face[];
  type?: string;
  phrase?: string;
}
export interface FaceElementFacts extends FaceFacts {
  kind: "pin" | "port";
  level: string;
  id: string;
  /** The `root_inputs` row, for a root input. */
  rootInput?: PrimitiveFace;
}
export type Facts = LevelFacts | NodeFacts | FolderFacts | WireFacts | FaceElementFacts;

const isPrimitive = (tree: Tree, path: string) => tree.byPath.get(path)?.class === "primitive";
const same = (a: Face, b: Face) => faceKey(a) === faceKey(b);

/** A face's facts through the resolution. */
export function faceFacts(model: Model, face: Face): FaceFacts {
  const res = model.resolution!, tree = res.tree;
  const info = faceInfo(res, face.path, face.side, face.port);
  const out: FaceFacts = {
    face, name: face.port, type: info?.type, phrase: info && kindPhrase(info.kind),
  };
  const primitive = isPrimitive(tree, face.path);
  if (primitive && !isRootInput(face)) out.pinned = info?.pinned ?? false;
  if (primitive && face.side === "out") {
    const c = model.outputs?.components.find((x) => x.path === face.path);
    if (c) out.stage = c.stage1.includes(face.port) ? 1 : c.stage2.includes(face.port) ? 2 : undefined;
  }
  const t = terminalProducer(res, face);
  if (t && !same(t.face, face)) out.producer = t.face;
  if (!(primitive && face.side === "in")) out.consumers = terminalConsumers(res, face);
  return out;
}

const facesOf = (model: Model, path: string, side: Side, names: { name: string }[]) =>
  names.map((f) => faceFacts(model, { path, side, port: f.name }));

/** A primitive's or a closed assembly's facts; the root's segment is the label. */
export function nodeFacts(model: Model, path: string): NodeFacts {
  const s = model.structure!, tree = model.tree!;
  const n = tree.byPath.get(path)!;
  const row = s.types.find((t) => t.name === n.type);
  const facts: NodeFacts = {
    kind: n.class, path, segment: path === "" ? model.label : tree.segment.get(path)!, displayName: displayName(n),
    alias: n.alias, type: n.type, signature: n.signature, docstring: row?.docstring, locations: row?.locations ?? [],
    parameters: n.parameters, inputs: facesOf(model, path, "in", n.inputs), outputs: facesOf(model, path, "out", n.outputs),
  };
  if (n.key !== undefined) facts.membership = { how: tree.membership.get(path), field: n.field!, key: n.key };
  if (n.class === "primitive") {
    facts.tier = n.tier;
    if (n.tier === "discrete") facts.rate = { table: framesTable(model, path)!, chain: chainLine(model, path) };
  } else {
    facts.children = tree.children.get(path)!.length;
    facts.wires = n.wires.length;
  }
  return facts;
}

/** A count in words, the singular for one: `1 wire`, `2 wires`. */
export const count = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** The open level's facts: its node's as a closed assembly's, with its scopes; a primitive root's level is the root itself. */
export function levelFacts(model: Model, path: string): LevelFacts | NodeFacts {
  const s = model.structure!, n = model.tree!.byPath.get(path)!;
  const node = nodeFacts(model, path);
  if (n.class === "primitive") return node;
  return {
    ...node, kind: "level",
    scopes: s.scopes.filter((x) => x.path === path).map((x) => ({ key: x.key, table: scopeFramesTable(model, path, x.key)! })),
  };
}

export function folderFacts(model: Model, path: string): FolderFacts | undefined {
  const tree = model.tree!;
  const f = folderOf(tree, path);
  if (!f) return undefined;
  return { kind: "folder", path, parent: f.parent, field: f.field, keys: f.members.map((m) => ({ key: tree.byPath.get(m)!.key!, path: m })) };
}

export function wireFacts(model: Model, level: string, id: string): WireFacts | undefined {
  const res = model.resolution!;
  const w = levelOf(model.tree!, res, level).wires.find((x) => x.id === id);
  if (!w) return undefined;
  const fromPin = w.from.block === inPinId(w.from.port), toPin = w.to.block === outPinId(w.to.port);
  const from: Face = { path: fromPin ? level : w.from.block, side: fromPin ? "in" : "out", port: w.from.port };
  const to: Face = { path: toPin ? level : w.to.block, side: toPin ? "out" : "in", port: w.to.port };
  const terminal = (to.side === "in" && isPrimitive(res.tree, to.path)) || (to.side === "out" && to.path === "");
  const t = terminalProducer(res, from);
  const info = t && faceInfo(res, t.face.path, t.face.side, t.face.port);
  return {
    kind: "wire", level, id, from: { path: from.path, port: from.port }, to: { path: to.path, port: to.port },
    producer: t?.face, consumers: terminal ? [to] : terminalConsumers(res, to),
    type: info?.type, phrase: info && kindPhrase(info.kind),
  };
}

const rootInputRow = (model: Model, f: Face) =>
  f.path === "" && f.side === "in" ? model.structure!.root_inputs.find((r) => r.name === f.port) : undefined;

/** A level's pin, by its id `⟨in⟩name` or `⟨out⟩name`: the level's own face. */
export function pinFacts(model: Model, level: string, id: string): FaceElementFacts | undefined {
  const side: Side | undefined = id.startsWith("⟨in⟩") ? "in" : id.startsWith("⟨out⟩") ? "out" : undefined;
  if (!side) return undefined;
  const face: Face = { path: level, side, port: id.slice(side === "in" ? 4 : 5) };
  return { ...faceFacts(model, face), kind: "pin", level, id, rootInput: rootInputRow(model, face) };
}

/** A port square, by its id `block|side|name`; a pin's port is the pin's face. */
export function portFacts(model: Model, level: string, id: string): FaceElementFacts | undefined {
  const m = /^(.*)\|(in|out)\|([^|]*)$/.exec(id);
  if (!m) return undefined;
  const [, block, side, name] = m;
  const face: Face = block === inPinId(name) ? { path: level, side: "in", port: name }
    : block === outPinId(name) ? { path: level, side: "out", port: name }
    : { path: block, side: side as Side, port: name };
  return { ...faceFacts(model, face), kind: "port", level, id, rootInput: rootInputRow(model, face) };
}

/** The facts the pane shows: the selection's, or the open level's when nothing is selected or the open level's node is. */
export function detailOf(model: Model, level: string, sel: Selection | undefined): Facts | undefined {
  const tree = model.tree!;
  if (!sel) return levelFacts(model, level);
  const { kind, id } = sel.target;
  if (kind === "block" && id === level) return levelFacts(model, level);
  if (kind === "folder") return folderFacts(model, id);
  if (kind === "wire") return wireFacts(model, sel.level, id);
  if (kind === "port") return portFacts(model, sel.level, id);
  return tree.byPath.has(id) ? nodeFacts(model, id) : pinFacts(model, sel.level, id);
}

/** Where a face is selected: a root face's pin, else its port on the level that draws its node. */
export function faceSelection(tree: Tree, face: Face): Selection {
  if (face.path === "" && tree.root.class === "assembly") {
    return { level: "", target: { kind: "block", id: face.side === "in" ? inPinId(face.port) : outPinId(face.port) } };
  }
  return { level: tree.parent.get(face.path) ?? "", target: { kind: "port", id: portId(face.path, face.side, face.port) } };
}
