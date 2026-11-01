// The glyph icons' artwork (visual_grammar.md answer 7), drawn by the canvas as
// one `<symbol>` each, `icon-<id>`, in the text color: a stroked path, with a
// short text for the integrators. Each is ICON_HEIGHT (12) high and at most
// ICON_WIDTH (44) wide; the look pass tunes them.

export interface Glyph {
  /** The symbol's width in its own units, its height being 12. */
  width: number;
  /** The stroked path, `currentColor`, no fill. */
  d: string;
  /** A text drawn in the symbol: the integrators' `1/s`. */
  text?: { x: number; y: number; size: number; s: string };
}

const CIRCLE = "M11.5,6 A5.5,5.5 0 1 1 0.5,6 A5.5,5.5 0 1 1 11.5,6 Z";
const BARS = "M1,0.5 V11.5 M23,0.5 V11.5";

export const GLYPHS: Record<string, Glyph> = {
  sum: { width: 12, d: `${CIRCLE} M8.4,3.2 H3.8 L6.4,6 L3.8,8.8 H8.4` },
  or: { width: 12, d: `${CIRCLE} M3.6,3.6 L6,8.6 L8.4,3.6` },
  and: { width: 12, d: `${CIRCLE} M3.6,8.4 L6,3.4 L8.4,8.4` },
  pack: { width: 18, d: "M0,1.5 H6 L11,6 M0,6 H18 M0,10.5 H6 L11,6" },
  unpack: { width: 18, d: "M18,1.5 H12 L7,6 M0,6 H18 M18,10.5 H12 L7,6" },
  "limited-integrator": { width: 24, d: BARS, text: { x: 12, y: 9.5, size: 10, s: "1/s" } },
  "discrete-integrator": { width: 28, d: "M17,11 H20 V7.5 H23 V4 H26", text: { x: 7, y: 9.5, size: 10, s: "1/s" } },
  "discrete-limited-integrator": {
    width: 34, d: "M1,0.5 V11.5 M33,0.5 V11.5 M19,11 H22 V7.5 H25 V4 H28", text: { x: 10, y: 9.5, size: 10, s: "1/s" },
  },
  "constant-opaque": { width: 16, d: "M1,2 H15 V10 H1 Z" },
  step: { width: 16, d: "M0,10 H7 V2 H16" },
  noise: { width: 18, d: "M0,6 L2,3 L4,9 L6,1.5 L8,8.5 L10,3.5 L12,10.5 L14,4 L16,8 L18,6" },
  switch: { width: 20, d: "M0,6 H4 L14,2.2 M14,2 H20 M14,10 H20 M4,6 m-1,0 a1,1 0 1 0 2,0 a1,1 0 1 0 -2,0" },
  relay: { width: 18, d: "M0,10 H11 V2 H18 M7,10 V2 H11" },
  "rate-limiter": { width: 18, d: "M0,10 H5 L13,2 H18" },
  freeze: { width: 14, d: "M1.5,1.5 H12.5 L7,10.5 Z M1,11.5 L13,0.5" },
  stop: { width: 12, d: "M3.7,0.5 H8.3 L11.5,3.7 V8.3 L8.3,11.5 H3.7 L0.5,8.3 V3.7 Z" },
};
