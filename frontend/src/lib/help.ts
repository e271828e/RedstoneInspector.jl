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
export const LEAD = "The canvas shows one level at a time: an assembly's children as components, its own faces as pins, and its wires. Double-click a closed assembly to open its level. Zooming out drops text in a fixed order: face names first, then the display name and the icon, then the segment. The layout is computed on every load. A dragged component keeps its place for the session only: `x` puts the last one dragged back in its computed place, and `X` or the Undo drags button every one.";

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
    line: "A small mark carrying a fact, on a component's edge or beside a port: a diagnostic, a loop or a route crossing into a closed child or through a pin, the clocks inside an assembly, a position in the execution order.",
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
  {
    key: "events", term: "events pill", sample: "events",
    line: "A count of state events on a component's top edge at the right, in both color modes: the events a primitive declares, or on a closed assembly those of the primitives inside. Its tooltip lists a primitive's events in priority order. A localized event cuts the integration step where its guard crosses zero and fires at that instant; one not localized, `no` in the events tab, fires at the first step boundary that sees its guard come to hold: the step's end, or an earlier localized event's instant in that step.",
  },
  { key: "halo", term: "halo", sample: "halo", line: "The highlight of a shape: a soft wide outline just outside a component, a pin or a port square." },
  { key: "hue", term: "reserved hue", sample: "hue", line: "Red for errors, amber for warnings, blue for highlight, all absent from the rate palette." },
  {
    key: "legend", term: "legend", sample: "legend",
    line: "The canvas-corner list of the rates visible on the open level in rate mode. Each line names a color's clock: a deployment's by `D₀ · Φ₀`, `Δt` and its anchor, a build's by `Δt · τ` and its anchor. Its tooltip adds the anchor's key and scope, `Dₐ` and `Φₐ`, and a deployment's `τ`. A click on a line dims what does not run on it.",
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

/** The timing notation (deployment_overlay.md answer 3, the core's D-478): each symbol once, `[symbols, meaning]`, in the frames' order. */
export const NOTATION: [string, string][] = [
  ["`Δt_base`", "the base tick, the finest step of the discrete schedule. A deployment fixes it; a build writes it as a symbol."],
  ["`Δt_frame`", "a deployment's frame period, the spacing of the frame tops where the run meets the outside."],
  ["`A₁ (key)`", "an anchor by its number, a clock an `Absolute` entry of `sample_times` declares under that key; its tooltip names the declaring scope. `A₀ (base)` is the base grid."],
  ["`Dₛ`, `Φₛ`", "a component's period and phase in ticks of its enclosing rate scope, as its `Relative(D, Φ)` entry declares them."],
  ["`Dₐ`, `Φₐ`", "its period and phase in ticks of its anchor."],
  ["`D₀`, `Φ₀`", "its period and phase in base ticks, a deployment's. An anchor has the same pair, `A₀` at 1 and 0."],
  ["`Δt`, `τ`", "its period and phase in seconds; `τ` is the time of its first tick after `t₀`. An anchor has the same pair, `A₀` at `Δt_base` and 0."],
];

/** The paragraphs of the timing and root inputs section. */
export const NOTATION_LEAD = "A discrete component runs on a period and a phase, stated in four frames: its rate scope, its anchor, the base grid and seconds. The detail pane shows them as a table, a row per frame. The pane, the legend, the timing tab and their tooltips name each quantity by its symbol alone. A subscript names the ticks a count is in, and `0 ≤ Φ < D` holds under each. An argument names the node a symbol belongs to, a component, a scope or an anchor, as in `Δt(A₁)`. A table, a legend line and a chart label omit it.";
export const LAW_LEAD = "One law composes the frames, in seconds and in base ticks, for a component or a scope `i` on an anchor `a`:";
/** The law (deployment_overlay.md answer 3): each line's frame and its two equations. */
export const EQUATIONS: { frame: string; period: string; phase: string }[] = [
  { frame: "in seconds", period: "Δt(i) = Dₐ(i) · Δt(a)", phase: "τ(i) = τ(a) + Φₐ(i) · Δt(a)" },
  { frame: "in base ticks", period: "D₀(i) = Dₐ(i) · D₀(a)", phase: "Φ₀(i) = Φ₀(a) + Φₐ(i) · D₀(a)" },
  { frame: "linked by", period: "Δt(a) = D₀(a) · Δt_base", phase: "τ(a) = Φ₀(a) · Δt_base" },
  { frame: "hence", period: "Δt(i) = D₀(i) · Δt_base", phase: "τ(i) = Φ₀(i) · Δt_base" },
];
export const TYPE_RULE = "A root input that some consumer pins carries ◆ on its tag, in the detail pane and in the root inputs tab, which names each pinning consumer with its cause: by tier for a discrete consumer, by declaration for a continuous one. A pinned input is frozen at every activation, so `linearize` cannot seed it. `linearize` seeds a root input only at a `Float64` reached by at most one index step: the input itself when it is a `Float64`, or one element of an array of `Float64`, never a field. The tab's type and kind columns show which.";

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
  ["sample time", "triple", "a discrete primitive's period and phase, compiled as `(a, Dₐ, Φₐ)`, `a` its anchor. Declared in an assembly's `sample_times`, not on the component"],
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
  [["q", "w", "e", "s"], "focus the tree, the canvas, the detail pane, the drawer; a collapsed pane expands and a closed drawer opens first"],
  [["Q", "E", "S"], "collapse or expand the tree, the detail pane, the drawer"],
  [["<", ">"], "shrink, grow the focused tree, detail pane or drawer"],
  [["Tab", "Shift-Tab"], "move focus between the tree, the canvas, the detail pane and the drawer"],
  [["h", "j", "k", "l"], "on the canvas or with nothing focused, select the nearest component or pin in that direction, the view following"],
  [["h", "j", "k", "l", "←", "↓", "↑", "→"], "in the tree, the next and previous row, expand or collapse, or the child's or the parent's row"],
  [["h", "j", "k", "l", "←", "↓", "↑", "→"], "in the detail pane, `j` and `k` move between its headings, rows and buttons; `l` opens a section, steps into it and along a row's links; `h` goes back and closes a section from its heading"],
  [["h", "j", "k", "l", "←", "↓", "↑", "→"], "in the drawer, `j` and `k` move between the rows, `h` and `l` along a row's controls"],
  [["←", "↓", "↑", "→"], "on the canvas or with nothing focused, pan the canvas"],
  [["Enter"], "press the focused control of the detail pane or the drawer; with none, open the selected assembly"],
  [["Shift-h", "Shift-l"], "back and forward between the levels opened since the page loaded; nothing before the first or past the last"],
  [["Shift-j"], "open the selected assembly"],
  [["Shift-k", "Backspace", "Alt-↑"], "go to the parent, the child left selected"],
  [["zh", "zj", "zk", "zl"], "pan the canvas, or scroll the focused pane"],
  [["zz"], "bring the selection drawn on the canvas, the selected row or the focused control to the middle"],
  [["d", "u"], "half a page down, up: a pane scrolls, the canvas pans"],
  [["0"], "fit the level"],
  [["+", "=", "zi"], "zoom in"],
  [["-", "zo"], "zoom out"],
  [["gg", "G"], "the first, the last row of the tree, or control of the detail pane or the drawer"],
  [["gt", "gT"], "the drawer's next, previous tab; a closed drawer opens"],
  [["j", "k", "d", "u", "gg", "G"], "on this page, scroll it"],
  [["/", "Cmd-K", "Ctrl-K"], "focus the search; `/` in the drawer's diagnostics tab, its filter, where Escape gives the focus back"],
  [["n", "N"], "the next, the previous search hit"],
  [["t"], "trace the selected pin, port or wire, or clear its route"],
  [["c"], "switch between tier and rate colors"],
  [["y"], "type labels on or off"],
  [["o"], "execution-order badges on or off"],
  [["?"], "the help page, open or closed"],
  [["Cmd-O", "Ctrl-O"], "open a descriptor"],
  [["x", "X"], "put the last dragged component or pin back in its computed place, or every one"],
  [["Escape"], "close the right-click menu, else cancel a pending `z` or `g`, else close the help page, else clear the route, then the focused diagnostic, then the legend's focus, then the search, then the selection"],
];

/** The keys apply outside text fields; two take a second key; colors, labels and badges are kept per browser. */
export const KEYS_NOTE = "Single keys or pairs, outside text fields, where Tab, Cmd-K, Ctrl-K, Cmd-O and Ctrl-O still act. `z` and `g` wait for a second key, shown in the status bar; while `z` is held, every `h`, `j`, `k`, `l`, `i` and `o` acts under it. The color mode, the type labels, the order badges and the panes' sizes and collapse are kept per browser.";

/** The search's prefixes (workspace.md answer 5), each with the field it narrows a term to. */
export const SEARCH_LEAD = "The search matches a term in paths, types and face names. A prefix narrows it to one of them, and several terms must all match.";
export const SEARCH_PREFIXES: [string, string][] = [
  ["path:", "the path of a component"],
  ["type:", "its type or its type's alias"],
  ["face:", "the name of a face"],
];

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
