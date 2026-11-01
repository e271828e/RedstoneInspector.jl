// ELK over one level, on the main thread as the spike ran it (initial_design.md
// answer 12). DOM-free: the sizes come measured from `size.ts`.
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import { elkGraph, regionNodeId, type BlockSize, type Level } from "../lib/level";
import type { Region } from "../lib/regions";
import type { Point, Rect } from "../lib/view";

export interface Geometry {
  /** Each block's box, by block id. */
  boxes: Map<string, Rect>;
  /** Each wire's right-angle polyline, producer to consumer, by wire id. */
  routes: Map<string, Point[]>;
  /** ELK's junction points, where a fan-out's trunk branches, by wire id; a wire with none has no entry. */
  junctions: Map<string, Point[]>;
  /** ELK's box of each region, by folder path; the canvas draws the frame from its members' current boxes. */
  regions: Map<string, Rect>;
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

const rect = (n: ElkNode, dx = 0, dy = 0): Rect => ({ x: (n.x ?? 0) + dx, y: (n.y ?? 0) + dy, width: n.width ?? 0, height: n.height ?? 0 });

/**
 * The level laid out, in the level's coordinates: a region's members translated by its box's position, each
 * edge's points and junction points by its `container`'s, the node whose coordinates ELK gives them in.
 */
export async function layoutLevel(level: Level, sizes: ReadonlyMap<string, BlockSize>, regions: readonly Region[] = []): Promise<Geometry> {
  const out = await elk.layout(elkGraph(level, sizes, regions));
  const boxes = new Map<string, Rect>();
  const boxOf = new Map<string, Rect>();
  const offset = new Map<string, Point>([[out.id, { x: 0, y: 0 }]]);
  const edges = [...(out.edges ?? [])] as (ElkExtendedEdge & { container?: string })[];
  for (const r of regions) {
    const n = out.children?.find((c) => c.id === regionNodeId(r.path));
    if (!n) continue;
    const box = rect(n);
    boxOf.set(r.path, box);
    offset.set(n.id, { x: box.x, y: box.y });
    for (const m of n.children ?? []) boxes.set(m.id, rect(m, box.x, box.y));
    edges.push(...((n.edges ?? []) as ElkExtendedEdge[]));
  }
  for (const c of out.children ?? []) if (!c.children?.length) boxes.set(c.id, rect(c));
  const routes = new Map<string, Point[]>();
  const junctions = new Map<string, Point[]>();
  for (const e of edges) {
    const o = offset.get(e.container ?? out.id) ?? { x: 0, y: 0 };
    const at = ({ x, y }: Point): Point => ({ x: x + o.x, y: y + o.y });
    const s = e.sections?.[0];
    if (s) routes.set(e.id, [s.startPoint, ...(s.bendPoints ?? []), s.endPoint].map(at));
    if (e.junctionPoints?.length) junctions.set(e.id, e.junctionPoints.map(at));
  }
  return { boxes, routes, junctions, regions: boxOf, width: out.width ?? 0, height: out.height ?? 0 };
}

export const pathD = (pts: Point[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
