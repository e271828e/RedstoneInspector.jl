// The local router for a dragged block (the spike's report, section 1): ELK's
// layered algorithm cannot keep one node fixed, so a drag re-routes only the
// moved block's wires with a right-angle route. DOM-free.
import type { BlockSize, Level } from "../lib/level";
import type { Point } from "../lib/view";
import type { Geometry } from "./layout";

/** A right-angle route from an east port to a west port, below both boxes when it runs backward. */
export function orthoRoute(a: Point, b: Point, below = Math.max(a.y, b.y)): Point[] {
  const stub = 12;
  if (b.x - a.x >= 2 * stub) {
    const mx = Math.round((a.x + b.x) / 2);
    return [a, { x: mx, y: a.y }, { x: mx, y: b.y }, b];
  }
  const y = below + stub;
  return [a, { x: a.x + stub, y: a.y }, { x: a.x + stub, y }, { x: b.x - stub, y }, { x: b.x - stub, y: b.y }, b];
}

/** A port's point in world units: its block's box plus the measured port position. */
function portPoint(g: Geometry, sizes: ReadonlyMap<string, BlockSize>, block: string, side: "in" | "out", name: string): Point {
  const box = g.boxes.get(block)!;
  const p = sizes.get(block)!.ports.find((q) => q.side === side && q.name === name)!;
  return { x: box.x + p.x, y: box.y + p.y };
}

/** A new routes map: every wire with `block` at either end re-routed port to port, every other route kept. */
export function rerouteTouching(g: Geometry, level: Level, sizes: ReadonlyMap<string, BlockSize>, block: string): Map<string, Point[]> {
  const routes = new Map(g.routes);
  for (const w of level.wires) {
    if (w.from.block !== block && w.to.block !== block) continue;
    const a = portPoint(g, sizes, w.from.block, "out", w.from.port);
    const b = portPoint(g, sizes, w.to.block, "in", w.to.port);
    const fa = g.boxes.get(w.from.block)!, fb = g.boxes.get(w.to.block)!;
    routes.set(w.id, orthoRoute(a, b, Math.max(fa.y + fa.height, fb.y + fb.height)));
  }
  return routes;
}
