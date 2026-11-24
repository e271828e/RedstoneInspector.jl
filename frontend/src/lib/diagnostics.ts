// The diagnostics overlay as data (visual_grammar.md answer 8, workspace.md
// answers 2 and 6): the drawer's rows, a loop's chain of declared wires by the
// resolution in reverse, what each level draws, the tree's propagated marks,
// where a row's click goes and what a focused diagnostic lights.
import type { BuildBody, Cycle, Diagnostic, Endpoint, FailureBody, Location, TracedMember, Wire } from "./descriptor";
import type { Selection } from "./detail";
import type { Lit } from "./focus";
import { inPinId, outPinId, portId } from "./level";
import type { Model } from "./model";
import { faceKey, wireFaces, type Face } from "./resolve";
import type { Tree } from "./tree";

export type Severity = Diagnostic["severity"];
/** A diagnostic or a warning with its place in the drawer's list, errors first. */
export type Indexed = Diagnostic & { index: number };

const bodyOf = (m: Model): BuildBody | FailureBody => {
  const d = m.descriptor;
  return d.kind === "build" ? d.build : d.kind === "deployment" ? d.deployment.build : d.failure;
};

/**
 * The body's diagnostics then its warnings, one list, each with its index in it; a deployment's own warnings after
 * its build's (deployment_overlay.md answer 4).
 */
export function diagnosticsOf(model: Model): Indexed[] {
  const b = bodyOf(model), d = model.descriptor;
  const own = d.kind === "deployment" ? d.deployment.warnings : [];
  return [...("diagnostics" in b ? b.diagnostics : []), ...b.warnings, ...own].map((x, index) => ({ ...x, index }));
}

/** One declared wire of a loop's chain: its level and its id there, the consumer's port id, with its two faces. */
export interface Hop {
  level: string;
  wire: string;
  from: Face;
  to: Face;
}

/** A level wire's id from its consumer face: a child's input port, or the level's own output pin's port. */
const wireId = (level: string, to: Face) => portId(to.path === level ? outPinId(to.port) : to.path, "in", to.port);

/**
 * One terminal pair mapped onto the declared wires between its two primitives, consumer first: from the pair's
 * consumer up through `feeder` to its producer. A walk that ends anywhere else gives nothing.
 */
function pairChain(model: Model, w: Wire): Hop[] {
  const res = model.resolution;
  if (!res) return [];
  const goal = faceKey({ path: w.from.path, side: "out", port: w.from.port });
  const hops: Hop[] = [];
  let to: Face = { path: w.to.path, side: "in", port: w.to.port };
  for (let f = res.feeder.get(faceKey(to)); f; f = res.feeder.get(faceKey(to))) {
    hops.push({ level: f.level, wire: wireId(f.level, to), from: f.face, to });
    if (faceKey(f.face) === goal) return hops;
    to = f.face;
  }
  return [];
}

/** A loop's terminal pairs mapped onto the declared wires between the two primitives, each pair's from its consumer up. */
export const chainOf = (model: Model, cycle: Cycle): Hop[] => cycle.wires.flatMap((w) => pairChain(model, w));

/** The assembly method that declares a level's wire: from the level's own input, to its own output, else between children. */
export type Declaration = "input_wires" | "output_wires" | "local_wires";
/** A declared wire of a loop's pair, with the method of the assembly holding it that declares it, and that method's location. */
export interface DeclaredHop extends Hop {
  declaration: Declaration;
  location?: Location;
}
/** The drawer's loop row: each terminal pair with its declared wires producer first, each member with its tracing mode. */
export interface LoopFacts {
  wires: { from: Endpoint; to: Endpoint; hops: DeclaredHop[] }[];
  /** Each member with its mode, none when `traced` omits it; `presumed` when traced structurally, every input taken to reach every output. */
  members: { path: string; mode?: TracedMember["mode"]; presumed: boolean }[];
}

/** Whether a type is the core's own, `Redstone` or a module under it: its methods lie in the core's source, which the user does not edit. */
export const isCoreType = (name: string | undefined): boolean => !!name && (name === "Redstone" || name.startsWith("Redstone."));

/**
 * The loop row's facts: each pair's declared wires located by their holder's `types` row, none for a holder of the
 * core's own type, such as a `Group`, whose declaring methods are the core's accessors; each member's mode.
 */
export function loopFacts(model: Model, cycle: Cycle): LoopFacts {
  const s = model.structure;
  const located = (h: Hop): DeclaredHop => {
    const declaration: Declaration = h.from.path === h.level ? "input_wires" : h.to.path === h.level ? "output_wires" : "local_wires";
    const type = model.tree?.byPath.get(h.level)?.type;
    const location = isCoreType(type) ? undefined : s?.types.find((t) => t.name === type)?.locations.find((l) => l.function === declaration);
    return { ...h, declaration, location };
  };
  const mode = new Map(cycle.traced.map((t) => [t.path, t.mode]));
  return {
    wires: cycle.wires.map((w) => ({ from: w.from, to: w.to, hops: pairChain(model, w).reverse().map(located) })),
    members: cycle.members.map((path) => ({ path, mode: mode.get(path), presumed: mode.get(path) === "structural" })),
  };
}

/** A node diagnostic's badge: the function at fault or the kind, titled with the message's first line. */
export interface Badge {
  text: string;
  title: string;
  index: number;
  severity: Severity;
}
/** A dead hop drawn across its member, from its input square to its output square, by port id. */
export interface Chord {
  block: string;
  from: string;
  to: string;
  severity: Severity;
}
/** What a level draws for every diagnostic and warning together, the error winning where both land. */
export interface Overlay {
  blocks: Map<string, { severity: Severity; badge?: Badge }>;
  ports: Map<string, Severity>;
  wires: Map<string, Severity>;
  chords: Chord[];
  /** A closed child the chain continues inside, with the loop's index. */
  continues: Map<string, { severity: Severity; index: number }>;
  /** A pin of the level's own the chain leaves the level through, off the root, with the loop's index. */
  leaves: Map<string, { severity: Severity; index: number }>;
}

/** One diagnostic's marks on one level, by id. */
interface LevelMarks {
  blocks: string[];
  badge?: string;
  ports: string[];
  wires: string[];
  chords: { block: string; from: string; to: string }[];
  continues: string[];
  /** The level's own pins the chain runs to or from. */
  pins: string[];
}

/** An endpoint's face side: an input it declares, else an output; `undefined` for a face it lacks. */
function sideOf(tree: Tree, e: Endpoint): "in" | "out" | undefined {
  const n = tree.byPath.get(e.path);
  if (!n) return undefined;
  return n.inputs.some((f) => f.name === e.port) ? "in" : n.outputs.some((f) => f.name === e.port) ? "out" : undefined;
}

/** An endpoint's port square on a level: a child's port, or the pin's when the endpoint is on the level's own path. */
function endpointPort(tree: Tree, level: string, e: Endpoint): string | undefined {
  const side = sideOf(tree, e);
  if (!side) return undefined;
  if (e.path === level) return side === "in" ? portId(inPinId(e.port), "out", e.port) : portId(outPinId(e.port), "in", e.port);
  return e.path !== "" && tree.parent.get(e.path) === level ? portId(e.path, side, e.port) : undefined;
}

/** A marked wire: the level whose wire list spells its endpoints and its id there. */
function wireMark(model: Model, w: Wire): { level: string; id: string } | undefined {
  const same = (a: Endpoint, b: Endpoint) => a.path === b.path && a.port === b.port;
  for (const n of model.structure!.nodes) {
    if (n.class === "assembly" && n.wires.some((x) => same(x.from, w.from) && same(x.to, w.to))) {
      return { level: n.path, id: wireId(n.path, wireFaces(n.path, w).to) };
    }
  }
  return undefined;
}

function marksOn(model: Model, level: string, d: Diagnostic): LevelMarks {
  const tree = model.tree!;
  const out: LevelMarks = { blocks: [], ports: [], wires: [], chords: [], continues: [], pins: [] };
  const onLevel = (p: string) => p !== "" && tree.parent.get(p) === level;
  const closed = (p: string) => onLevel(p) && tree.byPath.get(p)?.class === "assembly";
  if (d.cycle) {
    out.blocks.push(...d.cycle.members.filter(onLevel));
    for (const h of chainOf(model, d.cycle)) {
      if (h.level !== level) continue;
      out.wires.push(h.wire);
      for (const p of [h.to.side === "in" ? h.to.path : undefined, h.from.side === "out" ? h.from.path : undefined]) {
        if (p !== undefined && closed(p) && !out.continues.includes(p)) out.continues.push(p);
      }
      if (h.from.path === level) out.pins.push(inPinId(h.from.port));
      if (h.to.path === level) out.pins.push(outPinId(h.to.port));
    }
    for (const x of d.cycle.dead) {
      if (onLevel(x.path)) out.chords.push({ block: x.path, from: portId(x.path, "in", x.input), to: portId(x.path, "out", x.output) });
    }
  } else if (onLevel(d.path) && tree.byPath.has(d.path)) {
    out.blocks.push(d.path);
    out.badge = d.path;
  }
  for (const e of d.marks?.ports ?? []) {
    const id = endpointPort(tree, level, e);
    if (id) out.ports.push(id);
  }
  for (const w of d.marks?.wires ?? []) {
    const m = wireMark(model, w);
    if (m?.level === level) out.wires.push(m.id);
  }
  return out;
}

const worse = (a: Severity | undefined, b: Severity): Severity => (a === "error" || b === "error" ? "error" : "warning");
/** The badge kept where two land: an error's over a warning's, else the first. */
const keep = (a: Badge | undefined, b: Badge | undefined) => (!a ? b : !b ? a : a.severity === "warning" && b.severity === "error" ? b : a);

/** What a level draws: every diagnostic's and warning's marks on it, merged. Nothing for a structureless model. */
export function overlayOf(model: Model, level: string): Overlay {
  const o: Overlay = { blocks: new Map(), ports: new Map(), wires: new Map(), chords: [], continues: new Map(), leaves: new Map() };
  if (!model.tree) return o;
  for (const d of diagnosticsOf(model)) {
    const s = d.severity, m = marksOn(model, level, d);
    for (const b of m.blocks) {
      const badge: Badge | undefined = m.badge === b ? { text: d.function ?? d.kind, title: d.message.split("\n")[0], index: d.index, severity: s } : undefined;
      const was = o.blocks.get(b);
      o.blocks.set(b, { severity: worse(was?.severity, s), badge: keep(was?.badge, badge) });
    }
    for (const p of m.ports) o.ports.set(p, worse(o.ports.get(p), s));
    for (const w of m.wires) o.wires.set(w, worse(o.wires.get(w), s));
    for (const c of m.chords) o.chords.push({ ...c, severity: s });
    for (const [list, into] of [[m.continues, o.continues], [level === "" ? [] : m.pins, o.leaves]] as const) {
      for (const c of list) {
        const was = into.get(c);
        if (!was || (was.severity === "warning" && s === "error")) into.set(c, { severity: s, index: d.index });
      }
    }
  }
  return o;
}

/** A tree row's mark: the distinct diagnostics and warnings at it or beneath, and whether its own node carries one. */
export interface TreeMark {
  errors: number;
  warnings: number;
  own: boolean;
}

/**
 * The tree's marks by path: a diagnostic marks its attributed node, a loop also each member and each level its
 * chain touches but the root, and every mark propagates to the row's ancestors, the root included. Counts are of
 * diagnostics, not of rows.
 */
export function treeMarks(model: Model): Map<string, TreeMark> {
  const tree = model.tree;
  const sets = new Map<string, { errors: Set<number>; warnings: Set<number>; own: boolean }>();
  if (!tree) return new Map();
  const at = (p: string) => {
    if (!sets.has(p)) sets.set(p, { errors: new Set(), warnings: new Set(), own: false });
    return sets.get(p)!;
  };
  for (const d of diagnosticsOf(model)) {
    const marked = new Set<string>();
    if (tree.byPath.has(d.path)) marked.add(d.path);
    if (d.cycle) {
      for (const m of d.cycle.members) if (tree.byPath.has(m)) marked.add(m);
      for (const h of chainOf(model, d.cycle)) if (h.level !== "") marked.add(h.level);
    }
    for (const p of marked) {
      at(p).own = true;
      for (let q: string | undefined = p; q !== undefined; q = tree.parent.get(q)) {
        (d.severity === "error" ? at(q).errors : at(q).warnings).add(d.index);
      }
    }
  }
  return new Map([...sets].map(([p, s]) => [p, { errors: s.errors.size, warnings: s.warnings.size, own: s.own }]));
}

/**
 * Where a drawer row's click goes: a port mark's square (a pin's port for an endpoint on the root's path), else a
 * wire mark's wire on its level, else a loop's first member on its parent's level, else the attributed node on its
 * parent's level; `undefined` for the root and for a structureless model.
 */
export function diagnosticTarget(model: Model, d: Diagnostic): Selection | undefined {
  const tree = model.tree;
  if (!tree) return undefined;
  for (const e of d.marks?.ports ?? []) {
    const level = e.path === "" ? "" : tree.parent.get(e.path);
    const id = level === undefined ? undefined : endpointPort(tree, level, e);
    if (id) return { level: level!, target: { kind: "port", id } };
  }
  for (const w of d.marks?.wires ?? []) {
    const m = wireMark(model, w);
    if (m) return { level: m.level, target: { kind: "wire", id: m.id } };
  }
  const node = d.cycle ? d.cycle.members[0] : d.path;
  const parent = node === undefined || node === "" ? undefined : tree.parent.get(node);
  return parent === undefined ? undefined : { level: parent, target: { kind: "block", id: node! } };
}

/** What a focused diagnostic lights on a level: its members, continuing children, marked node and chain's pins, its wires and its ports. */
export function litBy(model: Model, level: string, d: Diagnostic): Lit {
  if (!model.tree) return { blocks: new Set(), wires: new Set(), ports: new Set() };
  const m = marksOn(model, level, d);
  return { blocks: new Set([...m.blocks, ...m.continues, ...m.pins]), wires: new Set(m.wires), ports: new Set(m.ports) };
}
