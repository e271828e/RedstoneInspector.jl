// The canvas's placeholder colors, the only file that names one; increment 6
// settles the palette (visual_grammar.md answer 6) and replaces this file.

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
  /** Port squares: filled for stage 2, open (the background) for stage 1. */
  port: "#333333",
  text: "#1d1d1d",
  /** The display name, the block's lighter text level. */
  textLight: "#6a6a6a",
  background: "#ffffff",
  /** The one highlight hue: halos, casings, marked ports. */
  highlight: "#1f6feb",
};
