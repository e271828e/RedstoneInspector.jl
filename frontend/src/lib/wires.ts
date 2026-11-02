// Wire styles by kind (visual_grammar.md answer 4): each wire's class from its
// terminal producer's kind marker, the producer ports a type label marks with
// its unqualified type and the segment it sits on, the fan-outs ELK draws as trunks.
import type { KindMarker } from "./descriptor";
import { portId, producerFace, type Level } from "./level";
import type { Model } from "./model";
import { faceInfo } from "./resolve";
import type { Point } from "./view";

/** The five line styles: thin solid, thin dashed, thick, the triple line, thin dotted. */
export type WireClass = "scalar" | "flag" | "vector" | "struct" | "opaque";

/** A kind marker's class; the outer kind wins, so a vector of anything is `vector`. */
export function wireClass(k: KindMarker): WireClass {
  switch (k.kind) {
    case "integer": case "float": case "number": return "scalar";
    case "boolean": case "enum": case "symbol": return "flag";
    case "vector": return "vector";
    case "struct": return "struct";
    default: return "opaque";
  }
}

/** A level wire's producer port id: a child's output port, or an input pin's own port. */
const producerPort = (level: Level, i: number) => {
  const w = level.wires[i];
  return portId(w.from.block, "out", w.from.port);
};

/** Each wire's class by wire id, from its terminal producer's face. */
export function levelWireClasses(model: Model, level: Level): Map<string, WireClass> {
  const out = new Map<string, WireClass>();
  for (const w of level.wires) {
    const f = producerFace(level.path, w);
    const info = faceInfo(model.resolution!, f.path, f.side, f.port);
    out.set(w.id, info ? wireClass(info.kind) : "opaque");
  }
  return out;
}

export interface PortLabel {
  /** The producer port's id. */
  port: string;
  /** The producer face's type as printed. */
  type: string;
  /** The port's wires on the level, in wire order; the label sits on one of them. */
  wires: string[];
}

/** The producer ports with a wire on the level, once each in wire order, with their face's type. */
export function labelledPorts(model: Model, level: Level): PortLabel[] {
  const out = new Map<string, PortLabel>();
  level.wires.forEach((w, i) => {
    const port = producerPort(level, i);
    const seen = out.get(port);
    if (seen) return void seen.wires.push(w.id);
    const f = producerFace(level.path, w);
    out.set(port, { port, type: faceInfo(model.resolution!, f.path, f.side, f.port)?.type ?? "", wires: [w.id] });
  });
  return [...out.values()];
}

/**
 * A type with its module qualifiers dropped from every name inside it: `StaticArraysCore.SVector{5, Float64}` reads
 * `SVector{5, Float64}`, `typeof(Main.var"#f#1")` reads `typeof(var"#f#1")`. A `var"…"` name or a string is copied
 * whole, so a dot inside one stays.
 */
export const shortType = (type: string): string =>
  type.replace(/var"[^"]*"|"[^"]*"|(?:[\p{L}_][\p{L}\p{N}_!]*\.)+/gu, (m) => (m.endsWith(".") ? "" : m));

/** A horizontal stretch of a wire's route: its wire, its left and right ends and its height. */
export interface Segment {
  wire: string;
  x0: number;
  x1: number;
  y: number;
}

/** The longest horizontal segment among the given wires' routes, the first on a tie; none when no route has one. */
export function longestHorizontal(routes: [wire: string, points: Point[]][]): Segment | undefined {
  let best: Segment | undefined;
  for (const [wire, pts] of routes) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      if (Math.abs(a.y - b.y) > 0.5 || a.x === b.x) continue;
      const s = { wire, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), y: a.y };
      if (!best || s.x1 - s.x0 > best.x1 - best.x0) best = s;
    }
  }
  return best;
}

/** The producer ports feeding two or more wires on the level, with their counts. */
export function fanouts(level: Level): Map<string, number> {
  const n = new Map<string, number>();
  level.wires.forEach((_, i) => n.set(producerPort(level, i), (n.get(producerPort(level, i)) ?? 0) + 1));
  return new Map([...n].filter(([, k]) => k > 1));
}
