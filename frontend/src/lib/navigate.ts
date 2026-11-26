// The keyboard's cursor (workspace.md answer 11): on the diagram the nearest box
// in a direction, and the least pan that brings a box into view; in the detail
// pane and the drawer the next stop.
import { viewRect, type Rect, type Size, type View } from "./view";

export interface Box extends Rect {
  id: string;
}
/** Vim's directions: left, down, up, right. */
export type Direction = "h" | "j" | "k" | "l";

const center = (b: Rect) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

/**
 * The box nearest to `from` in a direction (workspace.md answer 11, as settled 2026-11-02): among the boxes whose
 * center lies beyond the origin's far edge in that direction, so a box in the origin's own layer never counts, the
 * least score, the gap between the facing edges (clamped at zero) plus twice the perpendicular offset between
 * centers; ties by the lower id; undefined when none. Edges along the direction, since that is how far the eye
 * travels to the next box; centers across it, so a tall box barely overlapping the origin's row does not beat one
 * level with it.
 */
export function nearest(boxes: readonly Box[], from: string, direction: Direction): string | undefined {
  const origin = boxes.find((b) => b.id === from);
  if (!origin) return undefined;
  const o = center(origin);
  const horizontal = direction === "h" || direction === "l";
  let best: { id: string; score: number } | undefined;
  for (const b of boxes) {
    if (b.id === from) continue;
    const c = center(b);
    let beyond: boolean, along: number;
    switch (direction) {
      case "l": beyond = c.x >= origin.x + origin.width; along = b.x - (origin.x + origin.width); break;
      case "h": beyond = c.x <= origin.x; along = origin.x - (b.x + b.width); break;
      case "j": beyond = c.y >= origin.y + origin.height; along = b.y - (origin.y + origin.height); break;
      case "k": beyond = c.y <= origin.y; along = origin.y - (b.y + b.height); break;
    }
    if (!beyond) continue;
    const across = horizontal ? Math.abs(c.y - o.y) : Math.abs(c.x - o.x);
    const score = Math.max(along, 0) + 2 * across;
    if (!best || score < best.score || (score === best.score && b.id < best.id)) best = { id: b.id, score };
  }
  return best?.id;
}

/** One axis: the least shift of [start, start + span) that brings [lo, hi) inside, the near edge when it cannot fit. */
function shift(start: number, span: number, lo: number, hi: number): number {
  if (hi - lo > span) return lo - start;
  if (lo < start) return lo - start;
  if (hi > start + span) return hi - (start + span);
  return 0;
}

/**
 * The view panned by the least amount that brings the box, grown by `padding` screen pixels, inside the
 * viewport's world rectangle, the scale unchanged; the view itself when the box already lies inside. A box larger
 * than the viewport along an axis has its top or left edge aligned.
 */
export function follow(view: View, viewport: Size, box: Rect, padding: number): View {
  const r = viewRect(view, viewport);
  const p = padding / view.scale;
  const dx = shift(r.x, r.width, box.x - p, box.x + box.width + p);
  const dy = shift(r.y, r.height, box.y - p, box.y + box.height + p);
  return dx === 0 && dy === 0 ? view : { x: view.x + dx, y: view.y + dy, scale: view.scale };
}

/** A pane's stop: a heading, a header's control or a row outside a section at depth 0, a section's row at 1, a row's further control at 2. */
export interface Stop {
  depth: 0 | 1 | 2;
  /** A heading's state; undefined on every other stop. */
  open?: boolean;
}

/**
 * A pane's `h j k l` from the focused stop, -1 for none (workspace.md answer 11): `j` and `k` the next and previous
 * stop but a row's further controls, the first when none is focused; `l` opens a closed heading, steps from an open
 * one to its first row and along a row's controls; `h` steps back along them, from a section's row to its heading,
 * and collapses an open heading. Nothing when no stop fits.
 */
export function stopStep(stops: readonly Stop[], at: number, key: Direction): { focus: number } | { toggle: number } | undefined {
  if (key === "j" || key === "k") {
    const walk = walkOf(stops);
    // from a row's further control, the walk goes on from the row
    const from = walk.filter((i) => i <= at).length - 1;
    const to = walk[from < 0 ? 0 : key === "j" ? from + 1 : from - 1];
    return to === undefined ? undefined : { focus: to };
  }
  const s = stops[at];
  if (!s) return undefined;
  if (key === "l") {
    if (s.open === false) return { toggle: at };
    const next = stops[at + 1];
    return next && (next.depth > s.depth || next.depth === 2) ? { focus: at + 1 } : undefined;
  }
  if (s.open) return { toggle: at };
  if (s.depth === 0) return undefined;
  let to = at - 1;
  while (s.depth === 1 && stops[to].depth > 0) to--;
  return { focus: to };
}

/** The stops `j` and `k` walk, by index: all but a row's further controls. */
export const walkOf = (stops: readonly Stop[]): number[] => stops.flatMap((s, i) => (s.depth < 2 ? [i] : []));
