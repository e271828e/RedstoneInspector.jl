// The help page's text (workspace.md answer 11, initial_design.md answer 15,
// build_release.md answers 7 and 8): the lead paragraph and the legend of
// visual_grammar.md's drawn terms, the Simulink vocabulary, the keyboard table and
// the about section's statement and links. Pure data; a backquoted span renders as code.
import { DOCS_URL } from "./docstring";

/** A legend line: `sample` names the drawing `Help.svelte` makes for it. */
export interface Term {
  key: string;
  term: string;
  line: string;
  sample: string;
}

/** The paragraph above the legend: the level, the zoom's text order and the computed layout. */
export const LEAD = "The canvas shows one level at a time: an assembly's children as components, its own faces as pins, and its wires. Double-click a closed assembly to open its level. Zooming out drops text in a fixed order: face names first, then the display name and the icon, then the segment. The layout is computed on every load. A dragged component keeps its place for the session only: `u` puts the last one dragged back in its computed place, and `U` or the Undo drags button every one.";

/** Component, face and wire, then the glossary's drawn terms in its order, each with its drawing. */
export const TERMS: Term[] = [
  {
    key: "component", term: "component", sample: "component",
    line: "A child of the open level: a rounded rectangle with its segment in bold and its display name beneath, filled by tier. A closed assembly is gray with a double border, the cue that it opens.",
  },
  {
    key: "face", term: "face", sample: "face",
    line: "A component's input or output, a small square on its edge with its name inside, inputs west and outputs east; a stage 1 output is open, a stage 2 output filled.",
  },
  {
    key: "wire", term: "wire", sample: "wire",
    line: "A gray right-angle line with an arrowhead at its consumer, the value's kind as weight and pattern: thin for a number, dashed for a flag, thick for a vector, a double line for a struct.",
  },
  {
    key: "badge", term: "badge", sample: "badge",
    line: "A small mark on a component's edge or at a pin's end carrying a fact: a diagnostic, a loop or route continuing inside a closed child, the clocks inside an assembly, a position in the execution order.",
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
    key: "display-name", term: "display name", sample: "display-name",
    line: "A component's second text line: the alias's last segment, else the type's, replaced by an icon where one applies.",
  },
  { key: "halo", term: "halo", sample: "halo", line: "The highlight of a shape: a soft wide outline just outside a component, a pin or a port square." },
  { key: "hue", term: "reserved hue", sample: "hue", line: "Red for errors, amber for warnings, blue for highlight, all absent from the rate palette." },
  {
    key: "legend", term: "legend", sample: "legend",
    line: "The canvas-corner list of the rates visible on the open level in rate mode. Each line reads out a triple `(anchor, m, c)`: the anchor a primitive hangs from, its multiple and its phase in that anchor's ticks.",
  },
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
    key: "tag", term: "tag", sample: "tag",
    line: "A root input's pin: a capsule pointed into the model, filled with the external color, its outer end a slot for the claim badge.",
  },
];

/** The Simulink vocabulary (look_inspector_08.md 7.2), `[simulink, redstone, note]`, an empty note where it has none. */
export const VOCABULARY: [string, string, string][] = [
  ["block", "primitive", "a component with behavior and no children"],
  ["subsystem", "assembly", "a component made of components. Every assembly is virtual in Simulink's sense: execution is flat over the primitives, and no assembly runs as a unit"],
  ["block port", "face", "a named input or output on a component's boundary"],
  ["signal", "port", "a primitive's output, the value that consumers and logs address"],
  ["signal line", "wire", ""],
  ["Inport and Outport blocks", "an assembly's faces", "drawn as pins on its open level. The root's inputs are the root inputs, drawn as tags"],
  ["data type", "the face's type", "in the detail pane"],
  ["line styles for dimensions and buses", "kind marker", "the wire's weight and pattern"],
  ["continuous and discrete sample times", "tier", ""],
  ["sample time", "triple", "a discrete primitive's period and phase, compiled as `(anchor, m, c)`. Declared in an assembly's `sample_times`, not on the component"],
  ["Sample Time Colors and Legend", "rate mode and the legend", ""],
  ["direct feedthrough", "a stage 2 output", "Simulink marks the input port; Redstone marks the output. A stage 1 output is published before the component reads its inputs"],
  ["sorted execution order", "execution order", "the order tab and the order badges"],
  ["algebraic loop", "a loop diagnostic", "the build rejects it and never solves it"],
  ["Sum and the logical operators", "`Junction`", "as `SumJunction`, `Or` and `And`, told apart by icon"],
  ["Mux and Demux", "`Pack` and `Unpack`", "over an `SVector`"],
  ["Bus Selector", "`Fields`", "each field of a struct input as an output of its own"],
  ["Highlight to Source, to Destination", "a face route", "upstream to the producer, downstream to every consumer, across levels"],
  ["Model Browser", "the tree", ""],
];

/** The keyboard table, the map's rows in the map's order (frontend/MAP.md, "The keyboard"), each `[keys, action]`. */
export const KEYS: [string[], string][] = [
  [["h", "j", "k", "l", "←", "↓", "↑", "→"], "in the tree, the next and previous row, expand or collapse, or the child's or the parent's row"],
  [["h", "j", "k", "l", "←", "↓", "↑", "→"], "in the detail pane or the drawer, scroll it"],
  [["j", "k"], "on this page, scroll it"],
  [["h", "j", "k", "l"], "on the canvas or with nothing focused, select the nearest component or pin in that direction, the view following"],
  [["←", "↓", "↑", "→"], "on the canvas or with nothing focused, pan the canvas"],
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
  [["u", "U"], "put the last dragged component or pin back in its computed place, or every one"],
  [["/", "Cmd-K", "Ctrl-K"], "focus the search"],
  [["Cmd-O", "Ctrl-O"], "open a descriptor"],
  [["d"], "toggle the drawer"],
  [["m", "i"], "collapse or expand the model tree, the detail pane"],
  [["r"], "switch between tier and rate colors"],
  [["y"], "type labels on or off"],
  [["o"], "execution-order badges on or off"],
  [["?"], "the help page, open or closed"],
  [["Tab", "Shift-Tab"], "move focus between the tree, the canvas, the detail pane and the drawer"],
];

/** The keys apply outside text fields; colors, labels and badges are kept per browser. */
export const KEYS_NOTE = "Single keys, outside text fields, where Tab, Cmd-O and Ctrl-O still act. The color mode, the type labels, the order badges and the collapsed panes are kept per browser.";

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
