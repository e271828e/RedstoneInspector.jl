// The settled palette, the canvas's and the frame's, the only file that names a
// color (visual_grammar.md answers 6 and 9). The values are the look pass's to
// tune; the checks pin mechanisms, never a value.

/** A block's fill and stroke. */
export interface Pair {
  fill: string;
  stroke: string;
}

export const palette = {
  /** Leaf fill and stroke by tier, the spike's. */
  continuous: { fill: "#d6e6fb", stroke: "#2f62a8" },
  discrete: { fill: "#fde7c8", stroke: "#b86e00" },
  /** A closed assembly: neutral gray, drawn with a double border. */
  assembly: { fill: "#e4e4e4", stroke: "#555555" },
  /** An inner level's pins and every output pin: outlined, no fill. */
  pin: { fill: "none", stroke: "#555555" },
  /** A root input's tag: the external color at a light tint. */
  rootTag: { fill: "#dcefd6", stroke: "#4b7f3e" },
  wire: "#6b6b6b",
  /** An opaque wire's lighter gray, its dotted line's. */
  wireLight: "#a3a3a3",
  /** Port squares: filled for stage 2, open (the background) for stage 1. */
  port: "#333333",
  text: "#1d1d1d",
  /** The display name, the block's lighter text level. */
  textLight: "#6a6a6a",
  background: "#ffffff",
  /** The one highlight hue: halos, casings, marked ports. */
  highlight: "#1f6feb",
  /** The opacity of what is not a search hit while a query stands. */
  dim: 0.3,
  /** The search hit's dashed halo, as a dash array. */
  dash: "4 3",

  /**
   * Rate mode's eight steps, fastest first. Spread by a search so that every pair of fills and of strokes lies at
   * least CIEDE2000 10 apart under normal vision and simulated deutan, protan and tritan vision, and as far from
   * the continuous, extra and root-tag pairs and the wires' gray. Fills free in hue, light enough for black text
   * (L* 72 and up); strokes, which tint the wires, dark enough for borders and clear of red, amber and the
   * highlight's blue, each near its fill's hue.
   */
  rate: [
    { fill: "#c1b23d", stroke: "#709215" }, // mustard, green
    { fill: "#f793ad", stroke: "#9c67f6" }, // pink, violet
    { fill: "#fed665", stroke: "#2d4830" }, // yellow, dark green
    { fill: "#41c4b0", stroke: "#2791a3" }, // teal, dark cyan
    { fill: "#c0a0ff", stroke: "#4c3675" }, // violet, dark purple
    { fill: "#a3c587", stroke: "#50674b" }, // sage, gray green
    { fill: "#b7b6da", stroke: "#755074" }, // lavender, plum
    { fill: "#f5eeb1", stroke: "#4c5512" }, // cream, olive
  ] as readonly Pair[],
  /** A block past the eighth step: a light neutral, its legend number in a badge. */
  extra: { fill: "#f2f2f2", stroke: "#8c8c8c" },
  /** Increment 7's diagnostics overlay: errors and warnings. */
  error: "#cf222e",
  warning: "#bf8700",

  // The frame's.
  /** The panes' borders and the splitters' rest color. */
  paneBorder: "#d0d0d0",
  /** A collapsed pane's strip, the drawer's tab strip and the status bar. */
  strip: "#f3f3f3",
  /** The selected tree row's tint. */
  rowSelected: "#dbe8fd",
  /** The open level's row marker. */
  openMarker: "#1f6feb",
};

/** A wire's lighter tint of a step's stroke. */
export const tint = (stroke: string): string => `color-mix(in srgb, ${stroke} 55%, white)`;
