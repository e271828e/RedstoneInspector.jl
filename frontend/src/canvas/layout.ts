// ELK over one level, on the main thread as the spike ran it (initial_design.md
// answer 12). DOM-free: the sizes come measured from `size.ts`.
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge } from "elkjs/lib/elk-api";
import { elkGraph, type BlockSize, type Level } from "../lib/level";
import type { Point, Rect } from "../lib/view";

export interface Geometry {
  /** Each block's box, by block id. */
  boxes: Map<string, Rect>;
  /** Each wire's right-angle polyline, producer to consumer, by wire id. */
  routes: Map<string, Point[]>;
  /** ELK's junction points, where a fan-out's trunk branches, by wire id; a wire with none has no entry. */
  junctions: Map<string, Point[]>;
  width: number;
  height: number;
}
/** A level's layout as the session keeps it: ELK's output plus drags, the dragged ids in drag order, `stale` after a push until laid out again. */
export interface LevelLayout {
  geometry: Geometry;
  dragged: ReadonlySet<string>;
  stale: boolean;
}

const elk = new ELK();

export async function layoutLevel(level: Level, sizes: ReadonlyMap<string, BlockSize>): Promise<Geometry> {
  const out = await elk.layout(elkGraph(level, sizes));
  const boxes = new Map<string, Rect>();
  for (const c of out.children ?? []) boxes.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, width: c.width ?? 0, height: c.height ?? 0 });
  const routes = new Map<string, Point[]>();
  const junctions = new Map<string, Point[]>();
  for (const e of (out.edges ?? []) as ElkExtendedEdge[]) {
    const s = e.sections?.[0];
    if (s) routes.set(e.id, [s.startPoint, ...(s.bendPoints ?? []), s.endPoint].map(({ x, y }) => ({ x, y })));
    if (e.junctionPoints?.length) junctions.set(e.id, e.junctionPoints.map(({ x, y }) => ({ x, y })));
  }
  return { boxes, routes, junctions, width: out.width ?? 0, height: out.height ?? 0 };
}

export const pathD = (pts: Point[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
