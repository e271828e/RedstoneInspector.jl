// The help page's text (workspace.md answer 11, initial_design.md answer 15,
// build_release.md answers 7 and 8): the legend of visual_grammar.md's terms,
// the Simulink vocabulary, the refusals, the keyboard table and the about
// section's statement and links. Pure data; a backquoted span renders as code.
import { DOCS_URL } from "./docstring";

/** A legend line: `sample` names the drawing `Help.svelte` makes for it, none for a term that names no drawn thing. */
export interface Term {
  key: string;
  term: string;
  line: string;
  sample?: string;
}

/** Block, face and wire, then the glossary's fifteen entries in its order. */
export const TERMS: Term[] = [
  {
    key: "block", term: "block", sample: "block",
    line: "A component on the open level: a rounded rectangle with its segment in bold and its display name beneath, filled by tier, a closed assembly gray with a double border, the cue that it opens.",
  },
  {
    key: "face", term: "face", sample: "face",
    line: "A block's input or output, a small square on its edge with its name inside the block, inputs west and outputs east; a stage 1 output is open, a stage 2 output filled.",
  },
  {
    key: "wire", term: "wire", sample: "wire",
    line: "A gray right-angle line with an arrowhead at its consumer, the value's kind as weight and pattern: thin for a number, dashed for a flag, thick for a vector, a triple line for a struct.",
  },
  {
    key: "badge", term: "badge", sample: "badge",
    line: "A small mark in a block's corner or at a pin's end carrying a fact: a diagnostic, a loop or route continuing inside a closed child, a multi-rate interior, a root input's claim.",
  },
  { key: "casing", term: "casing", sample: "casing", line: "The highlight of a line: a wider translucent band under a wire in the highlight hue." },
  {
    key: "chord", term: "chord", sample: "chord",
    line: "A dead hop drawn inside its member, a dashed line from an input square to an output square with a cross at its middle.",
  },
  {
    key: "dim", term: "dim", sample: "dim",
    line: "The opacity state of everything uninvolved while a diagnostic, a route or a search is focused; never a color change.",
  },
  {
    key: "display-name", term: "display name",
    line: "A block's second text line: the alias's last segment, else the type's, replaced by an icon where one applies.",
  },
  { key: "halo", term: "halo", sample: "halo", line: "The highlight of a shape: a soft wide outline just outside a block, a pin or a port square." },
  { key: "hue", term: "reserved hue", sample: "hue", line: "Red for errors, amber for warnings, blue for highlight, all absent from the rate palette." },
  {
    key: "legend", term: "legend",
    line: "The canvas-corner list of the triples visible on the open level in rate mode, each read out, later with its concrete `Δt`.",
  },
  { key: "level", term: "level", line: "What the canvas draws at a time: an assembly's children as blocks, its own faces as pins, its wires." },
  {
    key: "pin", term: "pin", sample: "pin",
    line: "A boundary face of the open level drawn as a node with one port: an outlined capsule, or a tag for a root input.",
  },
  {
    key: "modes", term: "rate mode, tier mode", sample: "modes",
    line: "The two color modes: by timing triple, the compiled clock, or by continuous against discrete.",
  },
  {
    key: "region", term: "region", sample: "region",
    line: "A keyed container's elements framed in a thin dashed rounded rectangle captioned with the field name.",
  },
  {
    key: "semantic-zoom", term: "semantic zoom",
    line: "The fixed order in which a block's text levels drop below the legibility floor: face names, display name and icon, segment.",
  },
  {
    key: "tag", term: "tag", sample: "tag",
    line: "A root input's pin: a capsule pointed into the model, filled with the external color, its outer end a slot for the claim badge.",
  },
  {
    key: "triple", term: "triple",
    line: "A leaf's or scope's `(anchor, m, c)`: the anchor it hangs from, its multiple and its phase in that anchor's ticks.",
  },
];

/** The Simulink vocabulary, `[simulink, redstone, note]`; the interface keeps Redstone's terms everywhere. */
export const VOCABULARY: [string, string, string][] = [
  ["subsystem", "assembly", "a component made of components; double-click a closed one to open it"],
  ["virtual subsystem", "`Group`", "an assembly with no behavior of its own, its children and wires alone"],
  ["block", "leaf", "a component with behavior and no children"],
  ["port", "face", "a named input or output of any component"],
  ["Inport", "root input", "an input of the root, the one producer the build never sees, drawn as a tag"],
  ["Outport", "root output", "an output of the root, read by whoever binds to it"],
  ["sample time", "rate scope", "a declared clock the leaves beneath compose their timing against"],
  ["data type", "kind marker", "the value's kind, drawn as the wire's weight and pattern; the type itself is in the detail pane"],
  ["non-direct-feedthrough output", "a stage 1 output", "published before the block reads its inputs, so a loop through it is legal; an open square"],
  ["Sum and the logical operators", "`Junction`", "one block over a function, its icon telling Σ, ∨ and ∧ apart"],
  ["Mux and Demux", "`Pack` and `Unpack`", "faces joined into one value and split back"],
  ["signal highlighting", "a face route", "a face's path upstream to its producer and downstream to every consumer, across levels"],
  ["the model browser", "the tree", "the model's hierarchy beside the canvas, in step with it"],
];

/** What the page refuses, with one reason each (initial_design.md answers 2, 12 and 15). */
export const REFUSALS: { what: string; why: string }[] = [
  {
    what: "Editing",
    why: "the inspector never writes model structure; the code is the model, and a diagram that wrote it back would be a second source of truth.",
  },
  {
    what: "Saved hand layout",
    why: "layout is computed from the declaration order on every load, so two readers of one model see one diagram and nothing stales beside the code.",
  },
  {
    what: "Author-supplied icons or masks",
    why: "the library's icons are the inspector's own, keyed on the type; an authored icon would be data the model does not carry, for now.",
  },
];

/** What is not here yet, and when it comes. */
export const NOT_YET = ["Run control.", "Live values on the diagram.", "Panels."];
export const NOT_YET_WHEN = "Stages 3 and 4 of the inspector, over a bridge the core serves.";

/** The keyboard table, the map's rows in the map's order (frontend/MAP.md, "The keyboard"), each `[keys, action]`. */
export const KEYS: [string[], string][] = [
  [["h", "j", "k", "l"], "in the tree, the next and previous row, expand or collapse, or the child's or the parent's row"],
  [["h", "j", "k", "l"], "elsewhere, select the nearest block or pin in that direction, the view following"],
  [["←", "↓", "↑", "→"], "pan the canvas"],
  [["Shift-h", "Shift-l"], "back and forward between the levels opened since the page loaded; nothing before the first"],
  [["Shift-j", "Enter"], "open the selected assembly"],
  [["Shift-k", "Backspace", "Alt-↑"], "go to the parent, the child left selected"],
  [["z"], "centre the selection at the current zoom"],
  [["n", "N"], "the next, the previous search hit"],
  [["Escape"], "close the help page, else clear the route, then the focused diagnostic, then the legend's focus, then the search, then the selection"],
  [["t"], "trace the selected pin, port or wire, or clear its route"],
  [["0"], "fit the level"],
  [["+", "="], "zoom in"],
  [["-"], "zoom out"],
  [["/", "Cmd-K", "Ctrl-K"], "focus the search"],
  [["d"], "toggle the drawer"],
  [["r"], "switch between tier and rate colors"],
  [["y"], "type labels on or off"],
  [["o"], "execution-order badges on or off"],
  [["?"], "the help page, open or closed"],
  [["Tab", "Shift-Tab"], "move focus between the tree, the canvas, the detail pane and the drawer"],
];

/** The keys apply outside text fields; colors, labels and badges are kept per browser. */
export const KEYS_NOTE = "Single keys, outside text fields. The color mode, the type labels and the order badges are kept per browser.";

/** The hosted copy's address (build_release.md answer 7). */
export const HOSTED_URL = "https://e271828e.github.io/RedstoneInspector.jl/";
/** Vimium's exclusion patterns for the live page and the hosted copy, written out so the bundle holds each once. */
export const VIMIUM_PATTERNS = ["http://localhost:8601/*", "https://e271828e.github.io/RedstoneInspector.jl/*"] as const;
/** The Vimium sentence, around the two patterns. */
export const VIMIUM = {
  before: "Vimium owns many of these keys by default. Exclude the inspector's two addresses in Vimium's options,",
  between: "for the live page and",
  after: "for the hosted copy, or use Vimium's insert mode while you work here.",
};

/** The privacy statement, the landing panel's and the about section's (workspace.md answer 10). */
export const PRIVACY = "The file is read inside your browser and never uploaded. The page loads nothing from any other site.";

/** The about section's links, each opening in a new tab. */
export const LINKS: { label: string; href: string }[] = [
  { label: "repository", href: "https://github.com/e271828e/RedstoneInspector.jl" },
  { label: "hosted copy", href: HOSTED_URL },
  { label: "Redstone's documentation", href: DOCS_URL },
];
