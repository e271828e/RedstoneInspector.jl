// Face routes (workspace.md answer 8, visual_grammar.md answer 9): the face a
// selection traces, its route through resolve.ts, what each level draws of it,
// the status line, the tree's levels and the origin kept across a push.
import { count, type Selection } from "./detail";
import type { Lit } from "./focus";
import { inPinId, levelOf, outPinId, parsePortId, portId, producerFace } from "./level";
import type { Model } from "./model";
import { faceKey, route, type Face, type Route } from "./resolve";

/** A route and the face it was traced from. */
export interface Traced extends Route {
  origin: Face;
}

/** What a level draws of a route: wire, block, pin and port ids on that level. */
export interface RouteDrawing {
  /** The route's wires, by consumer port id. */
  wires: Set<string>;
  /** The closed children a wire enters or leaves. */
  entered: Set<string>;
  /** The level's own pins a wire starts or ends at, a root tag included. */
  pins: Set<string>;
  /** The terminal producer's and every consumer's port, a root face's as its pin's. */
  terminals: Set<string>;
  /** The origin's port square, when its block or pin is on the level. */
  origin?: string;
}

export const sameFace = (a: Face | undefined, b: Face | undefined): boolean => !!a && !!b && faceKey(a) === faceKey(b);

/** The face a selection traces: a pin's or a port's own face, a wire's producer face; none for a block or a folder. */
export function originOf(model: Model, s: Selection | undefined): Face | undefined {
  const tree = model.tree;
  if (!tree || !s) return undefined;
  const { kind, id } = s.target;
  if (kind === "block") {
    if (tree.byPath.has(id)) return undefined;
    if (id.startsWith("⟨in⟩")) return { path: s.level, side: "in", port: id.slice(4) };
    if (id.startsWith("⟨out⟩")) return { path: s.level, side: "out", port: id.slice(5) };
    return undefined;
  }
  if (kind === "port") {
    const { block, side, name } = parsePortId(id);
    if (block === inPinId(name)) return { path: s.level, side: "in", port: name };
    if (block === outPinId(name)) return { path: s.level, side: "out", port: name };
    return { path: block, side, port: name };
  }
  if (kind === "wire") {
    const w = levelOf(tree, model.resolution!, s.level).wires.find((x) => x.id === id);
    return w && producerFace(s.level, w);
  }
  return undefined;
}

/** The route from a face; undefined when it resolves to no producer. */
export function routeOf(model: Model, origin: Face): Traced | undefined {
  const r = model.resolution && route(model.resolution, origin.path, origin.side, origin.port);
  return r && { ...r, origin };
}

/** A face's port square on a level: the level's own face as its pin's port, a child's face as the child's. */
function portOn(model: Model, level: string, f: Face): string | undefined {
  if (f.path === level) return f.side === "in" ? portId(inPinId(f.port), "out", f.port) : portId(outPinId(f.port), "in", f.port);
  return model.tree!.parent.get(f.path) === level ? portId(f.path, f.side, f.port) : undefined;
}

export function routeDrawing(model: Model, r: Traced, level: string): RouteDrawing {
  const tree = model.tree!;
  const out: RouteDrawing = { wires: new Set(), entered: new Set(), pins: new Set(), terminals: new Set(), origin: portOn(model, level, r.origin) };
  for (const w of r.wires) {
    if (w.level !== level) continue;
    out.wires.add(portOn(model, level, w.to)!);
    for (const f of [w.from, w.to]) {
      if (f.path === level) out.pins.add(f.side === "in" ? inPinId(f.port) : outPinId(f.port));
      else if (tree.byPath.get(f.path)?.class === "assembly") out.entered.add(f.path);
    }
  }
  if (r.levels.has(level)) {
    for (const f of [r.producer, ...r.consumers]) {
      const id = portOn(model, level, f);
      if (id) out.terminals.add(id);
    }
  }
  return out;
}

/** A face as the status line spells it: a root face by its name, another as `path/port`. */
export const faceText = (f: Face) => (f.path === "" ? f.port : `${f.path}/${f.port}`);

/** The status line: "tracing `<face>`: N consumers across K levels". */
export const routeStatus = (origin: Face, r: Route): string =>
  `tracing \`${faceText(origin)}\`: ${count(r.consumers.length, "consumer", "consumers")} across ${count(r.levels.size, "level", "levels")}`;

/** The levels a route crosses, the tree's route marks. */
export const routeLevels = (r: Route): ReadonlySet<string> => r.levels;

/** What a route lights on a level: the blocks and pins its wires touch and the origin's, its wires, its terminal ports. */
export function routeLit(model: Model, r: Traced, level: string): Lit {
  const d = routeDrawing(model, r, level);
  const lv = levelOf(model.tree!, model.resolution!, level);
  const blocks = new Set<string>();
  for (const w of lv.wires) {
    if (d.wires.has(w.id)) blocks.add(w.from.block).add(w.to.block);
  }
  if (d.origin) blocks.add(parsePortId(d.origin).block);
  return { blocks, wires: d.wires, ports: d.terminals };
}

/** The origin across a push: kept while the new model's node at its path declares that face on that side. */
export function rekeyRoute(origin: Face, next: Model): Face | undefined {
  const n = next.tree?.byPath.get(origin.path);
  return n && (origin.side === "in" ? n.inputs : n.outputs).some((f) => f.name === origin.port) ? origin : undefined;
}
