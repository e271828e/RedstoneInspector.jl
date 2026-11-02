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
  /** A continuous producer's wire in rate mode: the continuous blue at a wire's weight, the fill being too pale for a line. */
  continuousWire: "#9fbfe6",
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
   * Rate mode's eight steps, fastest first (visual_grammar.md answer 6, amended 2026-11-02). Constructed, not
   * searched: eight hues evenly spread round the OKLCh hue circle at one chroma, the fills alternating two lightness
   * bands by step, the strokes the same hue darkened. Fills color the wires too, so they keep clear of the error,
   * warning, highlight and wire colors under every vision; every fill pair is CIEDE2000 12 or more apart under
   * normal vision and, under the simulations, never identical (4 and up), the legend focus telling any two apart.
   * Step 0, the base grid wherever a block ticks on it, is the warm peach opposite the continuous blue.
   */
  rate: [
    { fill: "#f8bc91", stroke: "#8d4900" }, // peach, brown
    { fill: "#bba260", stroke: "#745a00" }, // sand, olive brown
    { fill: "#bed594", stroke: "#506803" }, // lime, olive
    { fill: "#75b68c", stroke: "#02703f" }, // green, dark green
    { fill: "#82ded3", stroke: "#016d65" }, // aqua, dark teal
    { fill: "#61b1cf", stroke: "#036884" }, // sky, dark cyan
    { fill: "#cec0ff", stroke: "#634d99" }, // lavender, purple
    { fill: "#ce8eb2", stroke: "#8b3e6d" }, // rose, plum
  ] as readonly Pair[],
  /**
   * The first four extras, steps 8 to 11, numbered #9 to #12 (visual_grammar.md answer 6 as amended): distinct
   * under normal vision only, picked greedily at a lower chroma from the hues left, their badges telling them
   * apart for every reader.
   */
  extras: [
    { fill: "#c0887f", stroke: "#953e32" }, // clay, rust
    { fill: "#fed1d6", stroke: "#943c4e" }, // blush, wine
    { fill: "#f3d0fb", stroke: "#7b4487" }, // orchid, violet
    { fill: "#82a37a", stroke: "#346d26" }, // moss, forest
  ] as readonly Pair[],
  /** A block past the twelfth step: a light neutral shared by all, its legend number in a badge. */
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

/** A step's colors: a palette step's, one of the four colored extras', or the shared neutral past them. */
export const stepPair = (step: number): Pair =>
  step < palette.rate.length ? palette.rate[step]
  : step < palette.rate.length + palette.extras.length ? palette.extras[step - palette.rate.length]
  : palette.extra;
