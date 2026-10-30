// The keyboard's cursor on the diagram (workspace.md answer 11): the nearest box
// in a direction, and the least pan that brings a box into view.
import { viewRect, type Rect, type Size, type View } from "./view";

export interface Box extends Rect {
  id: string;
}
/** Vim's directions: left, down, up, right. */
export type Direction = "h" | "j" | "k" | "l";

const center = (b: Rect) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

/**
 * The box nearest to `from` in a direction: among the boxes whose center lies in that direction's quadrant of
 * the origin's center, the component along the direction exceeding the perpendicular one, the least distance
 * between centers, ties by the lower id; undefined when none.
 */
export function nearest(boxes: readonly Box[], from: string, direction: Direction): string | undefined {
  const origin = boxes.find((b) => b.id === from);
  if (!origin) return undefined;
  const o = center(origin);
  let best: { id: string; d: number } | undefined;
  for (const b of boxes) {
    if (b.id === from) continue;
    const c = center(b);
    const dx = c.x - o.x, dy = c.y - o.y;
    const along = direction === "l" ? dx : direction === "h" ? -dx : direction === "j" ? dy : -dy;
    const across = direction === "h" || direction === "l" ? dy : dx;
    if (!(along > Math.abs(across))) continue;
    const d = Math.hypot(dx, dy);
    if (!best || d < best.d || (d === best.d && b.id < best.id)) best = { id: b.id, d };
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
