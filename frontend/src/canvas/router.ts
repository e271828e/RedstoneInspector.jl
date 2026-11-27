// The local router for a dragged block (the spike's report, section 1): ELK's
// layered algorithm cannot keep one node fixed, so a drag re-routes only the
// moved block's wires with a right-angle route. DOM-free.
import { portId, type BlockSize, type Level } from "../lib/level";
import type { Point, Rect } from "../lib/view";
import type { Geometry } from "./layout";

/** The stub a route leaves its producer's port by, or enters its consumer's by. */
export const STUB = 12;
/** The clear space past a type label's far end before a route turns (the look pass, 1.3). */
const LABEL_CLEAR = 4;

/**
 * A right-angle route from an east port to a west port. From a gap of `2 * STUB` it runs forward, turning at the
 * midpoint moved toward the consumer to clear the producer's stub, `from`, where the gap allows, never nearer the
 * consumer than `STUB`. Below that gap it runs backward, below both boxes, leaving the producer by the whole stub.
 */
export function orthoRoute(a: Point, b: Point, below = Math.max(a.y, b.y), from = STUB): Point[] {
  if (b.x - a.x >= 2 * STUB) {
    const mx = Math.min(Math.max(Math.round((a.x + b.x) / 2), a.x + from), b.x - STUB);
    return [a, { x: mx, y: a.y }, { x: mx, y: b.y }, b];
  }
  const y = below + STUB;
  return [a, { x: a.x + from, y: a.y }, { x: a.x + from, y }, { x: b.x - STUB, y }, { x: b.x - STUB, y: b.y }, b];
}

/**
 * The producer's stub: past its port's drawn type label by `LABEL_CLEAR`, the label's offset from the port and its
 * width taken from the layout's box, or `STUB` where no label is drawn (the look pass, 1.3, and its review, F3).
 */
export const producerStub = (label: Rect | undefined): number =>
  label ? Math.max(STUB, Math.max(0, label.x) + label.width + LABEL_CLEAR) : STUB;

/** A port's point in world units: its block's box plus the measured port position. */
function portPoint(g: Geometry, sizes: ReadonlyMap<string, BlockSize>, block: string, side: "in" | "out", name: string): Point {
  const box = g.boxes.get(block)!;
  const p = sizes.get(block)!.ports.find((q) => q.side === side && q.name === name)!;
  return { x: box.x + p.x, y: box.y + p.y };
}

/**
 * New routes and junctions: every wire with `block` at either end re-routed port to port with its junction points
 * dropped, since the local router draws no trunks, its producer's stub clearing its type label while `labels` draws
 * it; every other wire kept.
 */
export function rerouteTouching(
  g: Geometry, level: Level, sizes: ReadonlyMap<string, BlockSize>, block: string, labels: boolean,
): Pick<Geometry, "routes" | "junctions"> {
  const routes = new Map(g.routes);
  const junctions = new Map(g.junctions);
  for (const w of level.wires) {
    if (w.from.block !== block && w.to.block !== block) continue;
    junctions.delete(w.id);
    const a = portPoint(g, sizes, w.from.block, "out", w.from.port);
    const b = portPoint(g, sizes, w.to.block, "in", w.to.port);
    const fa = g.boxes.get(w.from.block)!, fb = g.boxes.get(w.to.block)!;
    const from = producerStub(labels ? g.labels.get(portId(w.from.block, "out", w.from.port)) : undefined);
    routes.set(w.id, orthoRoute(a, b, Math.max(fa.y + fa.height, fb.y + fb.height), from));
  }
  return { routes, junctions };
}
