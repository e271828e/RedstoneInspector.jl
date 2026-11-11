# Brief: increment 8, the look pass's fixes

Three commits on `increment-8`, one per stage, then one cold review and its
fix. Drafted on 2026-11-11 at `e2385b3` of the branch, checked out in
`~/.julia/dev/RedstoneInspector.jl-inc8`, after the docs commit on `master`
that carries this brief. No prototype: the look pass ruled each change, and
`look_inspector_08.md` holds the rulings under their entries and the settled
texts in its section 7. The user is away until the second look; the
coordinator's own rulings are in `notes_inspector_08.md`, "The look pass's
fixes". Not normative: if a shape below proves wrong at the keyboard, stop
and report rather than deviate.

The records live on `master` in `~/.julia/dev/RedstoneInspector.jl/design/`
and are read there by absolute path. The branch has no `design/` folder. The
code, `frontend/MAP.md` and `README.md` are the branch's.

## What is settled

Each line cites the look file's entry, which holds the reason.

- **1.1** The root inputs tab lists the consumers one to a line and loses its
  pinned column.
- **1.2** In the three analysis tabs the whole row takes the click.
- **1.4** The anchor table's "scope" heading reads "declared in"; the empty
  scopes table says "No assembly is keyed in `sample_times`; every key names
  a primitive."
- **1.7** The order tab shows two groups, and the order badges take the
  second group's numbers.
- **1.8** The feedthrough edges sit under a stage 2 row with a new title.
- **2.3** The rate pill straddles the bottom edge at the left, always.
- **3.2** A docstring's code blocks scroll sideways and never wrap.
- **3.5** The open level's pane takes the assembly layout.
- **4.2** The help legend has fifteen terms, each drawn, under a lead
  paragraph.
- **4.4** `tagD` is shared by the canvas and the help page.
- **4.5** The Simulink table is the look file's 7.2. Every text a user reads
  says "component" where it said "block" and "primitive" where it said
  "leaf".
- **4.6** The refusals leave the help page for the README.
- **4.10** The frame stays mounted and inert under the help page.

Amended on `master` with this brief: `workspace.md` answers 4, 6, 7 and 11,
`initial_design.md` answer 15, `glossary.md`'s new entry "Block".

## The vocabulary rule, for every stage

A text a user reads is an element's text content, a `title`, an
`aria-label`, a placeholder, a string the page renders, and the README's
prose. In every such text:

- "block" becomes "component" where it names a child drawn on the level.
  "Library blocks" becomes "library components". Other senses stay, a "code
  block" among them.
- "leaf" becomes "primitive", "leaves" becomes "primitives".

Out of this rule, and left as they are: identifiers, `kind: "block"`, CSS
classes, `data-*` values, comments, test names, the descriptor's
`class: "leaf"` and every comparison on it, the fixtures, `MAP.md`'s tables
of selectors. The pin sweeps those later. Each stage applies the rule to
every instance in the files it owns and reports the strings it changed; the
lists below are the coordinator's grep at `e2385b3`, not a limit.

## The shape built

Line numbers are from `git show e2385b3:<file>`, under `frontend/`.

### Stage 1: the analysis data and the drawer's tabs

- `src/lib/analysis.ts`. `orderRows` (78 to 88) gives way to the two groups.
  The first holds, in `outputs.order`'s order, every path whose component
  row has a `stage1` port, each with those ports alone. The second holds, in
  the same order, every path with a `stage2` port, each with those ports,
  its 1-based position within the second group, and the feedthrough edges
  into it as today. A path with both stages is in both groups. A path with
  no output port is in neither. `orderBadge` (107 to 121) reads the second
  group's positions: a leaf's own position or `undefined`, an assembly's the
  `ranges` of the positions beneath it or `undefined`. `RootInputRow` loses
  `pinned` if nothing reads it. `rowTarget` (190 to 207) keeps its targets.
- `src/frame/tabs/Order.svelte`. Two sections, each a heading and a list:
  "Stage 1, any order" and "Stage 2, in order". The DOM contract:
  `section.order-group[data-stage="1"]` and `[data-stage="2"]`, each with an
  `h3`; rows `li.step[data-stage][data-path]`, and `data-position` on stage 2
  rows alone; `li.port[data-stage]` and `li.edge[data-from][data-to]` as
  today. A stage 1 row shows no number. An empty first group reads "No
  stage 1 outputs." An empty second group reads "No stage 2 outputs, so
  nothing is ordered." A model without `outputs` keeps today's single
  sentence. The edge's title is the look file's 7.1, word for word.
- `src/frame/tabs/RootInputs.svelte`. The `pinned` heading, cell and title
  go. Each consumer stands on its own line inside `td.consumers`.
- `src/frame/tabs/Timing.svelte`. The anchors' fourth heading reads
  "declared in"; the cell's class stays `scope`. The empty scopes sentence
  is 1.4's.
- **The row click, all three tabs.** A click anywhere on a row that has a
  target selects it: `tr.root-input`, `tr.anchor` and `tr.scope` when
  `rowTarget` gives one, `tr.component`, `li.step`'s own line, `li.edge`.
  The row shows `cursor: pointer`. The inner `button.row` stays, for the
  keyboard, and a click on it selects once, not twice. A row without a
  target, the base grid's and a root scope's, takes no click and shows no
  pointer.
- `src/frame/Breadcrumb.svelte:58`. The order toggle's title reads "Number
  every primitive with a stage 2 output by its position among the stage 2
  calls".
- Strings under the vocabulary rule, from the grep: `Order.svelte:12` and
  `:20`, `Timing.svelte:83` and `:91`.

### Stage 2: the canvas and the detail pane

- `src/canvas/Canvas.svelte`, the order badge (778 to 784). Its numbers come
  from stage 1's `orderBadge`, with no change of place. Its title reads
  `Stage 2 position ${n} in the execution order` on a primitive and
  `Stage 2 positions ${text} in the execution order: the primitives inside`
  on an assembly. A primitive with stage 1 outputs alone has no badge.
- `src/canvas/Canvas.svelte`, the rate pill (769 to 776, the constants'
  comment at 96 to 102). The pill sits `BADGE_INSET` from the block's left
  edge and straddles the bottom edge on the overlay pills' row, the row
  `overlayBadges` (535 to 565) computes as
  `box.height - BADGE_HEIGHT - BADGE_TOP` in the block's own coordinates.
  The raise above the order badge goes, with its fit test at 771. The pill
  never depends on `o`.
- **The pill against the overlay's pills.** The diagnostic, loop and route
  pills stack leftward from the bottom edge's right end. Measure every
  committed fixture, every level, in rate mode: a block meets when the rate
  pill's width, the overlay pills' widths, the gaps and both insets exceed
  the block's width. Report the count and the blocks. Where they meet, the
  rate pill is not drawn on that block while an overlay pill is drawn there,
  and the pin states that rule. If none meets on any fixture, build the
  rule all the same and pin it on a synthetic copy.
- `src/frame/Detail.svelte` (118 to 125) and `src/lib/detail.ts` (211 to
  229). With nothing selected the pane keeps `data-kind="level"` and
  `data-id` as today and shows, in order: the header without the Open
  button; the level's line, `levelLine`'s "open level · N children · M
  wires"; the level's rate scopes when it has any; then everything the
  assembly layout shows for that node, its facts, signature, docstring,
  locations, parameters and faces. A face row of the open level selects the
  level's pin, as today, and shows the producer and consumer links the
  assembly layout shows. The root's header keeps the model's label. A
  primitive root keeps its leaf layout.
- `src/frame/Detail.svelte:243`. `div.docstring pre` takes
  `white-space: pre` and `overflow-x: auto`.
- Strings under the vocabulary rule, from the grep: `Canvas.svelte:470`,
  `src/lib/rates.ts:126`, `src/lib/detail.ts:65` (the class phrase a reader
  sees, "primitive, discrete", the function's parameter type unchanged),
  `:81` and `:82`, `src/frame/StatusBar.svelte:64`.

### Stage 3: the help page, the shell and the documents

- `src/lib/help.ts`, `TERMS`. Fifteen entries in this order, each with a
  sample: component, face, wire, badge, casing, chord, dim, display name,
  halo, reserved hue, legend, pin, rate mode and tier mode, region, tag. The
  entries `level`, `semantic zoom` and `triple` go. The lines that change:
  - component: "A child of the open level: a rounded rectangle with its
    segment in bold and its display name beneath, filled by tier. A closed
    assembly is gray with a double border, the cue that it opens."
  - face: "A component's input or output, a small square on its edge with
    its name inside, inputs west and outputs east; a stage 1 output is
    open, a stage 2 output filled."
  - badge: "A small mark on a component's edge or at a pin's end carrying a
    fact: a diagnostic, a loop or route continuing inside a closed child,
    the clocks inside an assembly, a position in the execution order."
  - display name: "A component's second text line: the alias's last
    segment, else the type's, replaced by an icon where one applies."
  - halo: "The highlight of a shape: a soft wide outline just outside a
    component, a pin or a port square."
  - legend: "The canvas-corner list of the rates visible on the open level
    in rate mode. Each line reads out a triple `(anchor, m, c)`: the anchor
    a primitive hangs from, its multiple and its phase in that anchor's
    ticks."
- `src/frame/Help.svelte`, the samples. Two new ones in the canvas's shapes
  and constants: `display-name`, two small components side by side, one
  with its type's name as the second line and one with an icon; `legend`,
  the legend box with two swatches from `stepPair` and their triples read
  out. The `badge` sample moves its clock pill to the bottom-left, as stage
  2 draws it. The first sample's key is `component`.
- `src/frame/Help.svelte`, the lead. A paragraph `p.lead` opens the section
  "Reading the diagram", above the list, word for word: "The canvas shows
  one level at a time: an assembly's children as components, its own faces
  as pins, and its wires. Double-click a closed assembly to open its level.
  Zooming out drops text in a fixed order: face names first, then the
  display name and the icon, then the segment. The layout is computed on
  every load. A dragged component keeps its place for the session only."
- `src/lib/help.ts`, `VOCABULARY`. The nineteen rows of the look file's 7.2,
  in its order, each `[simulink, redstone, note]`, an empty note where the
  table has none.
- `src/lib/help.ts` and `Help.svelte`, the sections. `REFUSALS`, `NOT_YET`
  and `NOT_YET_WHEN` go with their section and its nav link. Four sections
  remain: reading, simulink, keyboard, about.
- `src/lib/help.ts`, `KEYS`. The second row reads "elsewhere, select the
  nearest component or pin in that direction, the view following". The row
  count stays twenty, so `MAP.md`'s keyboard table keeps its count.
- `src/canvas/glyphs.ts`. `tagD(w, grow = 0)` moves here from
  `Canvas.svelte:475` unchanged, and `Help.svelte` drops its own copy (39 to
  43) for the import.
- `src/App.svelte` (325 to 390). The help page renders over the frame or the
  landing, which stay mounted with the `inert` attribute while it shows.
  The shell remembers the focused element at the open and returns focus to
  it at the close, whichever way the page closes. The help page's own keys
  (240 to 246) stay: `?` and Escape, the rest the browser's.
- `README.md`. A section "By design" after the opening paragraphs and before
  "Writing a descriptor", with the four lines of the look file's 7.3. The
  vocabulary rule over the whole file. The README's lines on the help page,
  the order tab, the badges, the rate pill and the root inputs tab follow
  what the three stages built.
- `frontend/MAP.md`. The DOM contract tables, the vocabulary section and the
  browser checks follow the three stages, from the predecessors' notes. The
  vocabulary section says that `block` is the code's word for a box on the
  level and that a reader's text says "component" and "primitive". The file
  stays under about 700 lines, so a changed row replaces the old one.
- **The merge's leftovers** (`pending.md`, "Increment 8's merge: stale
  citations and test names"). Two comments cite text that left the map:
  `src/lib/level.ts:124` and `e2e/draw.spec.ts:21`; each says what it meant
  in its own words. The test names the bullet lists are renamed to say what
  they pin.

## Readings the coordinator took

Ruled while the user is away, each on the second look's checklist.

1. The first group keeps `outputs.order`'s order. Any order would do, and
   this one matches the core's printout.
2. A component with no output port stands in neither group. No fixture has
   one; a synthetic model pins it.
3. The two empty-group sentences, the headings and the badge's titles are
   the coordinator's wording.
4. The rate pill yields to the overlay's pills where they meet, since the
   overlay is what a reader is following at that moment.
5. The open level's pane keeps `data-kind="level"`, so the contract's
   selectors hold, and keeps the level's line above the assembly's facts.
6. The legend's line drops "later with its concrete `Δt`", a promise that
   belongs to increment 10.
7. The lead paragraph and the six legend lines above are the coordinator's
   wording.

## What the tests pin, by property

The numbers come from the oracle
`scratchpad/oracle/stage2.py` of the coordinating session, run over
`frontend/fixtures/` at `e2385b3`; its path is in each stage prompt.

- **The two groups** (1.7). `closed_loop`: 24 in the order, 13 in the first
  group, 16 in the second, 5 in both, 8 with stage 1 alone. The second
  group in order: `sensing/altimeter`, `pid_controller/V_ctl`,
  `lqr_controller/state_pack`, `lqr_controller/z_ref_pack`,
  `lqr_controller/command_pack`, `lqr_controller/engaged`,
  `pid_controller/h_ctl`, `lqr_controller/z_pack`, `pid_controller/θ_ctl`,
  `lqr_controller/tracker`, `pid_controller/q_ctl`,
  `lqr_controller/u_unpack`, `selection/select_δe`, `selection/select_δt`,
  `actuators/δe_limiter`, `actuators/δt_limiter`. `library`: 32, 20, 14, 2
  in both. `rates`: 4, 1, 3. `containers`: 6, 0, 6. `large`: 160, 160, 0.
  `primitive`: 1, 1, 1. Mutant: numbering the second group by
  `outputs.order`'s index.
- **A row in both groups shows that stage's ports.**
  `pid_controller/h_ctl` shows `saturated` in the first group and `u` and
  `u_raw` in the second. Mutant: both stages' ports in each.
- **The edges under a stage 2 row.** `lqr_controller/tracker` keeps its five
  edges, under its row of the second group and nowhere in the first.
- **The empty groups.** `containers` shows the first group's sentence,
  `large` the second's.
- **The badges** (1.7). `closed_loop`'s root: `sensing` "1",
  `pid_controller` "2, 7, 9, 11", `lqr_controller` "3–6, 8, 10, 12",
  `selection` "13–14", `actuators` "15–16", and `plant` none. Inside
  `pid_controller`: `V_ctl` "2", `h_ctl` "7", `θ_ctl` "9", `q_ctl` "11",
  `free` none. `rates`: `fast` "1–2", `fast/outer` "2", `slow` "3", `src`
  none. `primitive`: "1". `large` with the badges on: none anywhere.
  Mutant: a badge on a stage 1 leaf.
- **The whole row clicks** (1.2). A click on `mode`'s type cell selects the
  root tag; a click on a component row's period cell selects the leaf; a
  click on the base grid's row selects nothing. Mutant: the handler on the
  button alone.
- **The root inputs' columns** (1.1). Four headings, none "pinned"; `mode`'s
  seven consumers on seven lines, read from the rendered boxes' tops.
- **The scopes' sentence and the heading** (1.4) on `closed_loop`; `rates`
  still lists its three scopes.
- **The rate pill's place** (2.3). In rate mode on `closed_loop`'s root,
  with `o` off and with `o` on, each assembly's pill has the same box, its
  left edge `BADGE_INSET` from the block's left edge and its vertical
  middle on the block's bottom edge, to a pixel's tolerance at scale 1.
  Mutant: the old raise.
- **The pill yields** (reading 4), on a fixture that meets or a synthetic
  copy.
- **The level's pane** (3.5). At `closed_loop`'s root with nothing selected:
  `data-kind="level"`, no Open button, the level's line, a docstring block
  and the locations present. Inside `pid_controller` with nothing selected,
  a face row's click selects the level's pin. Mutant: the old thin layout.
- **A docstring's code block scrolls** (3.2). On `library`'s `lqr`, the
  `pre`'s `scrollWidth` exceeds its `clientWidth` at the default pane and
  its computed `white-space` is `pre`.
- **The legend** (4.2). Fifteen `li[data-term]`, each with an
  `svg.sample`; no entry for `level`, `semantic-zoom` or `triple`; the lead
  paragraph present with its last sentence.
- **The vocabulary table** (4.5). Nineteen rows; the first reads "block" and
  "primitive"; no row holds "virtual subsystem" or "rate scope".
- **Four sections** (4.6). The nav has four links and no section
  `refusals`.
- **The frame under the help page** (4.10). With the page open the frame is
  in the DOM and `inert`. Focus on a tree row, `?`, `?`: the active element
  is that row and `j` moves the tree's selection. On `large`, the tree's
  `scrollTop` is the same after open and close. The drawer's "by period"
  toggle keeps its state. A drop under a page loaded at `/#help` still
  loads. Mutant: the frame unmounted under the page.
- **No reader's text says "block" or "leaf"** in the rule's sense: a check
  over the rendered page on `closed_loop` with every tab and the help page
  open reads the text content and the titles and finds neither word, the
  help page's own "block" in the Simulink column excepted.
- **`tagD` is shared** (4.4): `Help.svelte` holds no path formula for the
  tag. The type check and the tag sample's unchanged path pin it.

Screenshots, each saved by the checks under `e2e/screenshots/`:
`analysis-order.closed_loop__root`, `analysis-root-inputs.closed_loop__root`,
`analysis-timing.closed_loop__root`, `order.closed_loop__root` in rate mode
with the badges on, `detail-level.closed_loop__root`,
`help.none__root`, and `help-simulink.none__root` scrolled to the table.

## The stages

One fresh high-tier agent per stage, serially, in the one worktree. Each
runs, from `frontend/`: `npm run check`, `npm test`, `npm run build`, then
`npm run e2e -- --project=chromium`, all green before its commit. Each
commits once, with one sentence and no trailer, staging explicit paths.
Each hands its notes back in its final message: what it built, the DOM
contract it changed, the strings it changed under the vocabulary rule, its
departures with reasons, and what the next stage must know.

1. **The analysis data and the drawer's tabs.** `src/lib/analysis.ts`,
   `analysis.test.ts`, `src/frame/tabs/*.svelte`, `Breadcrumb.svelte`,
   `e2e/analysis.spec.ts`, and whatever check pins the old order rows.
2. **The canvas and the detail pane.** `src/canvas/Canvas.svelte`,
   `src/frame/Detail.svelte`, `src/lib/detail.ts` and its test,
   `src/lib/rates.ts`, `src/frame/StatusBar.svelte`, `e2e/order.spec.ts`,
   `e2e/colors.spec.ts`, `e2e/detail.spec.ts`.
3. **The help page, the shell and the documents.** `src/lib/help.ts`,
   `src/frame/Help.svelte`, `src/canvas/glyphs.ts`, `src/App.svelte`,
   `e2e/help.spec.ts`, `frame.spec.ts`, `keys.spec.ts`, `landing.spec.ts`,
   `README.md`, `frontend/MAP.md`, and the merge's leftovers.

## Routing

- Every stage: `frontend/MAP.md` whole, on the branch; `design/rules.md` on
  `master`, the sections "Frontend increments" and "Frontend traps"; this
  brief; `look_inspector_08.md` for the entries its stage cites and section
  7.
- Stage 1: `workspace.md` answer 6 on `master`; the core's
  `Redstone.jl/design/spec.md` lines 1365 to 1369, the execution order.
- Stage 2: `workspace.md` answers 4 and 7.
- Stage 3: `workspace.md` answer 11; `initial_design.md` answer 15.

## Bookkeeping

The coordinator's, on `master`, after the review: `pending.md`'s first
bullet and the merge's leftovers bullet; `rules.md`'s trap "Two pills on
one top edge", which the pill's move retires; `notes_inspector_08.md`; the
second look's checklist `look2_inspector_08.md`.

## Out of scope

- Increment 8b: `m`, `i`, Cmd-O and the keys by region (look file 4.7 and
  the additional comment; `roadmap.md`).
- The descriptor's class value and the core's module name, which wait for
  the pin (`pending.md`).
- A root input's seedability (`pending.md`).
- The schedule rows and the hyperperiod chart, increment 10's.

## The cold review

One independent high-tier reviewer over `e2385b3..` the third stage's
commit. It runs the four checks from a clean `npm ci`. It writes its own
reading of the two groups and the badges from the fixtures and compares it
with the oracle and the page on every fixture that has `outputs`. It walks
each entry of "What is settled" against the running page on `closed_loop`,
`rates`, `library`, `large` and `primitive`. It reverts each change alone
on a scratch copy to show a check goes red, the mutants above first. It
reads every screenshot against the rulings. It greps the rendered text for
the two retired words. A surviving mutant is a missing check or an
acceptable survivor named with its reason. Empty is acceptable.

## The review's record

The three stages landed as `ce09ebf`, `8e51de4` and `a6404da`. One
independent reviewer covered `e2385b3..a6404da` from a clean `npm ci` in a
scratch worktree: the type check 398 files with no error, 510 unit tests,
204 browser checks. Its own derivation of the two groups and the badges
agreed with the oracle, the module and the page on the eleven fixtures
that have `outputs`. Every entry of "What is settled" held on the running
page, every literal text matched its source, and every mutant this brief
names turned a check red, with twenty-three of its own.

Three findings, none high, each accepted:

1. **The help page said a struct's wire is a triple line**, where the
   canvas, the page's own sample and the README show two. The line
   predates the pass. The text follows the page, and a check ties the
   sample's struct lines to the canvas's.
2. **No check pinned that other keys do nothing under the help page**,
   which matters once the frame stays mounted. A check presses twelve keys
   under the page and reads six states before and after.
3. **The yield check wrote in that `rates`' `fast` and `slow` meet**, a
   margin of one unit that depends on the font. It asserts the rule alone
   there, and `failure_nested`'s `ctl`, 17 units over, is the one case
   written in.

Two rulings of the coordinator's joined the fix: the pill's five constants
moved to `src/canvas/size.ts`, ending the help page's copy; and a root
input's pin says nothing about pinning in the detail pane, by the reason
of the first look's 1.1. The fixer landed all five as `06176a1`: 511 unit
tests, 206 browser checks.

The reviewer, resumed, verified the delta from a clean install at the same
tallies and saw its mutants turn red for each of the five. Survivors, all
accepted and named:

- **A wording change in a help line** other than those pinned by property.
  The help texts are checked by counts, first and absent rows and the
  lead's last sentence; the reviewer's literal comparison stood in.
- **The focus fallback to the region's root** when the remembered element
  is gone. Nothing in the suite disconnects it under the page.
- **A second handler on a row's button**, which would select twice. The
  selection is idempotent and the page shows no difference.
- **`0` and `t` let through under the help page.** Fit and trace change
  none of the six states the check reads. The shell's guard is one branch,
  whose removal turns the check red on ten other keys; neither leak loses
  anything, and Escape or `0` undoes it.
- **`BADGE_TOP` moved by one unit**, inside the place pins' tolerance of a
  pixel. The canvas and the help sample now share the constant.

Left for the user's second look, `look2_inspector_08.md`: an assembly's
face still reads "not pinned"; the tab's count of 24; the clock count
going while a route is traced; a text selection in a row selecting the
row; the level's child count stated twice; a location's label breaking
inside its line number; the help page's sideways scroll at a narrow
window; the README's status line.
