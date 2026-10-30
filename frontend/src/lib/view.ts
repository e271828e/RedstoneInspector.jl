// The viewport math (workspace.md answer 3). A view is the world point at the
// SVG's top-left corner and the scale in screen pixels per world unit; with the
// viewport's size it gives the world rectangle the SVG shows, its `viewBox`.

export interface View {
  x: number;
  y: number;
  scale: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Rect extends Size {
  x: number;
  y: number;
}
export interface Point {
  x: number;
  y: number;
}

/** The world rectangle the view shows in a viewport. */
export const viewRect = (v: View, viewport: Size): Rect =>
  ({ x: v.x, y: v.y, width: viewport.width / v.scale, height: viewport.height / v.scale });

/**
 * The view showing the extent centered at the largest scale that fits both dimensions, `padding` screen
 * pixels clear, and at most `maxScale`, so a small level is not blown up.
 */
export function fitView(extent: Rect, viewport: Size, padding: number, maxScale = Infinity): View {
  const scale = Math.min(
    maxScale,
    (viewport.width - 2 * padding) / Math.max(extent.width, 1),
    (viewport.height - 2 * padding) / Math.max(extent.height, 1),
  );
  return {
    x: extent.x + extent.width / 2 - viewport.width / (2 * scale),
    y: extent.y + extent.height / 2 - viewport.height / (2 * scale),
    scale,
  };
}

/** The world point under a screen point, relative to the SVG's top-left corner. */
export const toWorld = (v: View, p: Point): Point => ({ x: v.x + p.x / v.scale, y: v.y + p.y / v.scale });

/** The view scaled by `factor` about a screen point, the world point under it kept in place. */
export function zoomAt(v: View, pointer: Point, factor: number): View {
  const w = toWorld(v, pointer);
  const scale = v.scale * factor;
  return { x: w.x - pointer.x / scale, y: w.y - pointer.y / scale, scale };
}

/** The view moved with a drag of `dx`, `dy` screen pixels. */
export const pan = (v: View, dx: number, dy: number): View => ({ x: v.x - dx / v.scale, y: v.y - dy / v.scale, scale: v.scale });
