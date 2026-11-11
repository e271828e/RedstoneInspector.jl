# Look pass: inspector increment 8

The user's checklist for the look-and-adjust pass over `increment-8` at
`bb2511f`, the review's fixes landed and verified, drawn from
`notes_inspector_08.md`, the three builders' headed looks and the open
items of `frontend/MAP.md`. Entries are numbered for discussion. The user's
rulings from the pass follow their entries.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-inc8/frontend && npm run dev`,
then drop fixtures from `frontend/fixtures/`. `o` toggles the badges, `d`
the drawer, `r` the color mode, `?` the help page.

## 0. Rulings before the look

- [x] **0.1** Reading 1, the schedule rows and the hyperperiod chart not
  built; the timing tab says why in one sentence per kind. Already superseded
  in substance by increment 10's entry in the roadmap; confirm the two
  sentences read right until it lands.
- [x] **0.2** Readings 2 to 4 move three items out of the release's
  increment: the docs constant, the baked version, the Vimium patterns.
  Ratify, and the roadmap's increment 11 line loses them at landing.
- [x] **0.3** Readings 5 to 18: strike any, and the fixer reverts it.
  Ruling: none is struck. Four are amended below: reading 8 by 1.7, reading
  11 by 1.1, reading 14 by 4.2 and reading 15 by 4.5.
- [x] **0.4** Reading 19, ruled during the build: a clock pill that does
  not fit beside the order badge rides one row higher. Look at 2.3 before
  ruling. REVIEW: See 2.3 below
  Ruling: reading 19 is withdrawn by 2.3.
- [x] **0.5** Agent C's departure: a history entry made by a hash link or a
  typed hash is stamped as a level entry, so Shift-h now walks back from a
  typed level hash. Keep, or confine the stamp to `#help`.
- [x] **0.6** Review finding 1: a primitive root's root-input row now
  selects the tag, agent A's premise having been false. Finding 6: the badge
  takes the pointer for its hover title. Both land with the fixer. REVIEW: On finding 1, see 1.2 (the behavior is the same).
- [x] **0.7** `build_release.md`'s pending note bites (notes, "For the
  user" 2): bare `@ref` links to parent-module names land at the API page's
  top. Settled by increment 10's writer change; nothing to do here.

## 1. The drawer's tabs: `closed_loop`

- [x] **1.1** Root inputs: three rows, `mode` with seven consumers on one
  line each; `td.pinned` empty with its hover title explaining version 1.0.
  Does an always-empty column earn its place now? REVIEW: The consumers are separated by commas, not one per line. Is the inclusion of "pinned" marker planned?
  Ruling: the consumers go one per line, as the detail pane lists them. The
  pinned column is dropped, amending reading 11. No plan exists to fill it:
  a root input's `pinned` is false in version 1 because the wire pass strips
  the marker when it fixes the type, so the blank reads as "not pinned"
  where it means "not carried". Primitive faces keep their flag. What a root
  input's row should say about seedability, and whether the client derives
  it from the consumers' flags or the core carries it, becomes a bullet of
  `pending.md`.
- [x] **1.2** A root-input row's click selects the tag on the root level
  (reading 11); the canvas does not pan to it, as a tree click does not. REVIEW: Select works, but only when the name itself is clicked.
  Ruling: the whole row takes the click, in the three tabs. The button stays
  inside it for the keyboard.
- [x] **1.3** Timing, anchors: the base grid's row reads "0 base grid",
  `Δt`, "0", "—", "the deployment's", the last in the key column (agent A's
  departure). Choose a better reading for the two empty cells, or leave.
- [x] **1.4** Anchor rows 1 to 10 all `1/50 s`, each selecting its
  declaring assembly; a row whose scope is the root has no button. The scope
  buttons read as plain code, nothing showing they are clickable; `tau`
  reads "0/1 s" (reviewer). REVIEW: Why does `Rate scopes` say "No rate scopes"?
  Ruling: the data is right and the wording changes. A row of the format's
  `scopes` is an assembly that a `sample_times` key names. `rates` has
  three; every key of `closed_loop` names a primitive, so it has ten anchors
  and no such assembly. The anchor table's "scope" column becomes "declared
  in", and the empty table's sentence reads "No assembly is keyed in
  `sample_times`; every key names a primitive."
- [x] **1.5** Components: ten rows, the swatch the rate color in both modes
  (reading 13). The sort toggle "by period" reads right; the tab switch keeps
  it. An extra triple's swatch carries no "#9" number, unlike the canvas
  (reviewer; `large` shows it).
- [x] **1.6** The schedule note's build sentence under the tables.
- [x] **1.7** Execution order: 24 rows, stage-1 ports as open boxes, stage-2
  filled (agent A's rendering). Does the distinction read without a legend? REVIEW: If you already know the convention for the output port stages in the canvas, this one's easy to read. The question that comes to mind is whether having pure stage-1 blocks interspersed with those that have stage-2 outputs corresponds to any actual ordering, since in principle evaluation of stage-1 outputs is unordered. Maybe we could have a button to toggle between stage-2 only and all outputs, and/or two different rows for those components that have both stage-1 and stage-2 outputs.
  Ruling: two groups, after the spec's §5.3, "all stage-1 functions in any
  order, then stage 2 in topological order". "Stage 1, any order" lists
  every primitive with a stage 1 port, unnumbered. "Stage 2, in order" lists
  every primitive with a stage 2 port, renumbered from 1, sixteen on
  `closed_loop`. A primitive with both stages appears in both groups, each
  time with that stage's ports. No toggle. The canvas badges take the same
  numbers: a primitive with stage 1 outputs alone carries none, and an
  assembly's ranges count its stage 2 primitives. The core's printout
  numbers nothing, so no number of the core's is lost. Amends reading 8 and
  `workspace.md` answers 6 and 7.
- [x] **1.8** The edges under their consumer's row (reading 10), five under
  row 18, "presumed" in italics, the hover title's caveat. Read the title's
  sentence for tone. REVIEW: The sentence does not make it too clear that each listed edge is a stage-2 output from another component potentially involved in the computation of the stage-2 output above.
  Ruling: the edges sit under their consumer's stage 2 row of 1.7's second
  group, and the title takes the text of 7.1.
- [x] **1.9** An edge row's click selects the consumer's port square inside
  its level; a step row's click selects the leaf.
- [x] **1.10** The tab body scrolls to its top on a tab switch and keeps its
  scroll across a push (agent A's addition).
- [x] **1.11** The tables' widths at the drawer's default height and at a
  narrow window; the long consumer lists.

## 2. The order badges: `closed_loop`, `rates`, `primitive`

- [x] **2.1** Reading 8 and 9: at the root with `o`, every leaf numbered
  from 1, each assembly its ranges, "4–5, 15, 17, 19" on `pid_controller`;
  the badge straddling the top edge at the left, background fill, text
  color; legible at the fit?
- [x] **2.2** Inside `pid_controller`: 15, 17, 19, 4 and 5 just above the
  segments, covering no name.
- [x] **2.3** Rate mode: the four raised pills (reading 19) float above the
  badges on `pid_controller`, `lqr_controller`, `selection`, `actuators`;
  `sensing` keeps both on the edge. The pills on `selection` and
  `actuators` sit on the wire along the drawing's top (agent B). A raised
  pill can read as the neighbour's: `rates`' `slow` under `fast`'s bottom
  edge, `pid_controller`'s "4 clocks" under `lqr_controller` zoomed in
  (reviewer). Keep, or move the pill elsewhere on a narrow block. REVIEW: The raised pills look a bit weird, they could be confusing in some cases, and their change of location when the ordering pills are toggled on and off is a bit off-putting. What alternative location would you suggest? The block's bottom seems to be available.
  Ruling: the clock pill straddles the bottom edge at the left, on every
  block and whatever `o` says, so it never moves and always touches its own
  block. Reading 19 is withdrawn. The overlay's pills keep the bottom edge
  at the right and stack leftward; the fixer measures the failure fixtures
  in rate mode and reports any block where the two rows meet.
- [x] **2.4** The breadcrumb's third control "order" beside "types" and the
  mode switch; the row's width at a narrow window.
- [x] **2.5** `rates`: `fast` "2–3", `fast/outer` "3", `slow` "4".
  `primitive`: the leaf's "1".
- [x] **2.6** The badges' tie to a dimmed block under a focus, and under the
  search's dim.
- [x] **2.7** The badges are tiny at the root's fit (reviewer); their hover
  title now shows, the badge taking the pointer (review finding 6).
- [x] **2.8** The Fit button covers `selection`'s badge zoomed in (reviewer). REVIEW: I don't know what this refers to.
  Ruling: struck. The Fit button is fixed at the canvas's top-right corner
  and the drawing pans under it, so at one zoom it hid that badge. A pan
  uncovers it, and nothing is specific to badges.

## 3. The docstrings: `library` and `closed_loop`

- [x] **3.1** `integrator`: the signature as a code block, the prose in the
  pane's font, seven links in the highlight color opening in a new tab;
  "Keywords" as a small heading over a list (agent B's departure).
- [x] **3.2** `lqr`: fifteen links, the two long signature forms wrapping
  messily in their code block (reviewer). REVIEW: The long signatures do wrap messily.
  Ruling: a docstring's code blocks stop wrapping and scroll sideways.
- [x] **3.3** A bare link to a parent-module name (`local_wires` in a
  `Group` docstring, through `closed_loop`'s `sensing`) lands at the API
  page's top (0.6). REVIEW: It does land at the API page's top
- [x] **3.4** `plant` (`RedstoneExamples.Longitudinal`): no links, the
  `@ref` texts as code.
- [x] **3.5** The root's pane is the level layout and never shows its type's
  docstring, so a root `Group`'s docstring is unreachable (agent B). An
  item for a later increment, or the level layout gains the docstring? REVIEW: As expected. When an assembly is the current level and none of its children is selected, is there a reason not to show the same information on the pane as when the assembly itself is selected (on the upper level)?
  Ruling: none was found. With nothing selected the pane shows the open
  level in the assembly layout, with two differences: no Open button, and a
  face row selects the level's pin. The root gains its docstring, locations
  and parameters. The level's own line of counts and its scope timing stay
  above it. Amends `workspace.md` answer 4.
- [x] **3.6** The rendered block's typography against the pane: headings at
  13 px, list padding, code on the strip color.

## 4. The help page

- [x] **4.1** From the landing's "help" link, from `?` on a loaded level,
  from the status bar's "?" (reading 18); each close (the button, `?`,
  Escape, back) returns where it came from with the hash restored
  (reading 5).
- [x] **4.2** Reading the diagram: eighteen terms, thirteen samples at
  about 1:1 with the canvas (agent C). The five terms without a drawing
  leave an empty first column. Rule: a placeholder, text spanning the
  column, or as is. REVIEW: Are all five terms without a drawing really helpful for someone reading the diagram? In particular, "level" and "semantic zoom" read more like glossary entries. Others, like "legend" or "display name" could use a drawing.
  Ruling: fifteen terms, each with a drawing, amending reading 14. `level`
  and semantic zoom leave the list for a lead paragraph above it, which
  also carries 4.6's sentence on dragging. `display name` gets a drawing of
  two components, one with its type's name and one with an icon. `legend`
  gets a drawing of the legend box and takes `triple` into its line. The
  first term reads "component", by 4.5.
- [x] **4.3** The tier and rate sample fills are close in hue; the labels
  carry them.
- [x] **4.4** The samples' construction: the tag sample repeats the
  canvas's `tagD` formula rather than sharing it (agent C). An item, or
  share now. REVIEW: Please explain.
  Ruling: shared now. The canvas and the help page each hold a copy of the
  function that draws a root tag's outline, and no check compares them.
  `tagD` moves to `canvas/glyphs.ts` and both import it.
- [x] **4.5** Coming from Simulink: thirteen rows (reading 15); the third
  column's notes are the agent's wording. Read them. REVIEW: Many entries are inaccurate or outright wrong. The whole section needs to be rewritten.
  Ruling: rewritten. The table of 7.2 replaces the thirteen pairs, amending
  reading 15 and `workspace.md` answer 11. With it the page's word for a
  drawn component changes: every text a user reads says "component" where
  it said "block", in the help page, the hover titles and the README. The
  core retires the term *block* (its `pending.md`, first bullet), so the
  table carries no note on it. The code and the DOM contract keep `block`
  as their word for a box on the level, a child's or a pin's, and the
  glossary gains that entry. By the same ruling every text a user reads
  says "primitive" where it said "leaf", now and not at the pin; the
  descriptor's class value and the code's comparisons on it wait for the
  pin.
- [x] **4.6** What the page does not do: the three refusals with the
  brief's reasons, the three "not yet" lines. Read for tone. REVIEW: I'd like a clearer, more affirmative style. 
  Ruling: the section leaves the help page, which keeps four: the diagram,
  Simulink's vocabulary, the keyboard and About. The README gains a short
  section near its top with the text of 7.3. One sentence stays in the
  page, in 4.2's lead paragraph, since a reader meets it there: "The layout
  is computed on every load. A dragged component keeps its place for the
  session only." Amends `workspace.md` answer 11.
- [x] **4.7** The keyboard: twenty rows in the map's order, `kbd` chips, the
  Vimium paragraph with both patterns (reading 4); the wording is the
  agent's. REVIEW: Shortcuts for toggling the model tree and detail panel (the way `d` works for the drawer) and opening a file would be very convenient.
  Ruling: increment 8b. `m` toggles the model tree and `i` the detail pane,
  over the frame's collapse buttons and their prefs. Cmd-O and Ctrl-O open
  a file.
- [x] **4.8** About: the privacy statement shared with the landing,
  "inspector 0.1.0", "format major 1" (reading 16), three links in a new
  tab.
- [x] **4.9** Section headings and the page's typography at 1600 and at
  700 px; the nav links scroll without changing the hash.
- [x] **4.10** Under the help page the frame unmounts, so after the close
  focus falls to the body (agent C); Tab then starts from the page's top. REVIEW: Please explain
  Ruling: the frame stays mounted and inert under the help page. Today the
  page replaces the frame, so the tree, canvas, pane and drawer are
  destroyed and rebuilt: the focused element is gone, the tree's scroll
  resets, and `hjkl` act on the canvas where they acted on the tree. Kept
  mounted, everything survives, and the close returns focus where it was.

## 5. The keyboard and the shell

- [x] **5.1** `o` and `?` act; nothing is swallowed any more. With the help
  page shown only `?` and Escape are the page's, Space and the arrows
  scroll.
- [x] **5.2** Shift-h after a typed level hash now walks back (0.5); Shift-l
  from a level whose forward entry is `#help` reopens the page (reviewer).
- [x] **5.3** Escape's chain: the help page first, then the route, the
  focused diagnostic, the legend's focus, the search, the selection.

## 6. After the pass

- [x] **6.1** Record amendments the pass settles, docs commit first.
- [x] **6.2** The merge: rebase onto `master`, fast-forward.
- [x] **6.3** The push and its CI run; the Firefox `leave.spec.ts` item
  stands from increment 6.
- [x] **6.4** The roadmap's line for increment 8, and increment 11's line
  losing readings 2 to 4's items; the brief's "Built" section; the pending
  bullet.

  REVIEW (additional comments)
  - The `hjkl` keys jump between blocks and the arrow keys pan the canvas even when the canvas is not selected. It may be more convenient for some keys to change behavior depending on the currently selected panel. For example, when the model tree, the detail pane or the drawer are selected (or the help page is shown), `j` and `k` and the up and down arrows could be repurposed for scrolling.
    Ruling: increment 8b, amending `workspace.md` answer 11. The keys follow
    the focused region. In the tree the arrows follow `hjkl`. In the detail
    pane and the drawer `j`, `k` and the vertical arrows scroll, and `h` and
    `l` scroll sideways or do nothing, so the four never split between two
    targets. On the help page `j` and `k` scroll. On the canvas, or with
    nothing focused, the keys act as now. A pane's focused state must show
    clearly, since a key that changes meaning with the focus can surprise.

  Ruling on the order after the pass, 2026-11-11. The fixes land on the
  branch, the small ones and the design changes of 1.7, 2.3, 3.5, 4.2, 4.5,
  4.6 and 4.10, then a second look and the merge. Increment 8b, the
  keyboard, follows the merge, since it builds on 4.10. The core's session
  on the term *block* runs when the core's increment 93 closes and may
  overlap 8b. The pin comes last and carries `primitive`, `Δt_frame` and
  the module's new name together.

## 7. Texts the pass settled

- **7.1** The feedthrough edge's hover title (1.8): "A stage 2 output wired
  into this component. Its own stage 2 output may read it in the same sweep,
  so the producer runs first. Presumed: the build knows the wiring and the
  stages, not which inputs each output reads."
- **7.2** Coming from Simulink (4.5):

  | Simulink | Redstone | note |
  |---|---|---|
  | block | primitive | a component with behavior and no children |
  | subsystem | assembly | a component made of components. Every assembly is virtual in Simulink's sense: execution is flat over the primitives, and no assembly runs as a unit |
  | block port | face | a named input or output on a component's boundary |
  | signal | port | a primitive's output, the value that consumers and logs address |
  | signal line | wire | |
  | Inport and Outport blocks | an assembly's faces | drawn as pins on its open level. The root's inputs are the root inputs, drawn as tags |
  | data type | the face's type | in the detail pane |
  | line styles for dimensions and buses | kind marker | the wire's weight and pattern |
  | continuous and discrete sample times | tier | |
  | sample time | triple | a discrete primitive's period and phase, compiled as `(anchor, m, c)`. Declared in an assembly's `sample_times`, not on the component |
  | Sample Time Colors and Legend | rate mode and the legend | |
  | direct feedthrough | a stage 2 output | Simulink marks the input port; Redstone marks the output. A stage 1 output is published before the component reads its inputs |
  | sorted execution order | execution order | the order tab and the order badges |
  | algebraic loop | a loop diagnostic | the build rejects it and never solves it |
  | Sum and the logical operators | `Junction` | as `SumJunction`, `Or` and `And`, told apart by icon |
  | Mux and Demux | `Pack` and `Unpack` | over an `SVector` |
  | Bus Selector | `Fields` | each field of a struct input as an output of its own |
  | Highlight to Source, to Destination | a face route | upstream to the producer, downstream to every consumer, across levels |
  | Model Browser | the tree | |

- **7.3** The README's section (4.6), under a heading such as "By design":
  - "**The code is the model.** The inspector reads it and never edits it."
  - "**The layout is computed.** Every load derives it from the declaration
    order, so two readers of one model see the same diagram."
  - "**The icons are the inspector's.** It draws them from the type. A
    model carries none."
  - "**Coming in stages 3 and 4:** run control, live values on the diagram,
    panels."
