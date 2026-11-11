# Second look: inspector increment 8

The user's checklist for the second look over `increment-8` at `06176a1`, after
the fixes of the first look. It covers what the first look's rulings
changed and nothing else: `look_inspector_08.md` holds those rulings under
their entries, cited here by number, and
`brief_inspector_08_look_fixes.md` holds what was built. Entries are
numbered for discussion, and the rulings from this look follow their
entries.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-inc8/frontend && npm run dev`,
then drop fixtures from `frontend/fixtures/`. `o` toggles the badges, `d`
the drawer, `r` the color mode, `?` the help page.

## 0. Rulings made while you were away

Each was the coordinating session's, recorded in `notes_inspector_08.md`
with its reason. Strike any, and a fixer reverts it.

- [ ] **0.1** The first group of the order tab keeps the core's order,
  though any order would do. See 1.1.
- [ ] **0.2** A component with no output port stands in neither group. No
  fixture has one.
- [ ] **0.3** The rate pill yields to the overlay's pills on a block too
  narrow for both. You asked for the bottom-left and a measurement; the
  rule came before the measurement. See 2.3 and 2.4.
- [ ] **0.4** The open level's pane keeps its line "open level · N children
  · M wires" above the assembly's facts. See 3.1.
- [ ] **0.5** The help page's wire line now says "a double line for a
  struct", where it said "triple". The canvas and the help page's own
  sample draw two lines, and `visual_grammar.md` answer 4 says triple. The
  text followed the page; a triple line would be a canvas change. See 4.3.
- [ ] **0.6** A root input's pin no longer says "not pinned" in the detail
  pane, by the reason you gave for the tab's column in 1.1 of the first
  look. Other faces keep the phrase. See 3.4.
- [ ] **0.7** The wording is the session's in these places: the two group
  headings, the two empty-group sentences, the badges' hover titles, the
  order toggle's title, the help page's lead paragraph and six of its
  legend lines. Each appears below where you meet it.
- [ ] **0.8** Increment 8b's keys amend `workspace.md` answer 11 in that
  increment's own docs commit, not now.

## 1. The drawer's tabs

- [ ] **1.1** Execution order on `closed_loop` (first look 1.7): "Stage 1,
  any order" with thirteen unnumbered rows and open port boxes, then
  "Stage 2, in order" with sixteen rows numbered from 1 and filled boxes.
  Do the two headings read right?
- [ ] **1.2** `pid_controller/h_ctl` stands in both groups: `saturated` in
  the first, `u` and `u_raw` at position 7 in the second. Does the double
  appearance read as intended?
- [ ] **1.3** The edges (1.8) sit under their stage 2 row, five under
  `lqr_controller/tracker` at position 10. Hover one and read the new
  title.
- [ ] **1.4** The empty groups: `containers` shows "No stage 1 outputs.";
  `large` shows "No stage 2 outputs, so nothing is ordered." under 160
  unnumbered rows.
- [ ] **1.5** The tab still reads "Execution order 24", the length of the
  core's order, beside groups of 13 and 16. Keep, or show the second
  group's count, or both.
- [ ] **1.6** Root inputs (1.1): four columns, no pinned column, `mode`'s
  seven consumers one to a line.
- [ ] **1.7** The whole row clicks (1.2), in the three tabs. Try a cell far
  from the name: `mode`'s type, a component's period, an anchor's key, the
  right end of an edge. The base grid's row and a root scope's row take no
  click and show no pointer.
- [ ] **1.8** A drag that selects text inside a row also selects the row's
  target on release. Acceptable, or should a text selection suppress the
  click?
- [ ] **1.9** Timing (1.4): the anchors' fourth heading reads "declared
  in"; under "Rate scopes" `closed_loop` reads "No assembly is keyed in
  `sample_times`; every key names a primitive."; `rates` lists its three.

## 2. The badges and the rate pill

- [ ] **2.1** The badges' numbers (1.7), with `o` at `closed_loop`'s root:
  `sensing` "1", `pid_controller` "2, 7, 9, 11", `lqr_controller` "3–6, 8,
  10, 12", `selection` "13–14", `actuators` "15–16", `plant` none. Inside
  `pid_controller`: 2, 7, 9, 11, and `free` none. Hover a badge for its
  title, "Stage 2 position 7 in the execution order".
- [ ] **2.2** `large` with `o`: no badge on any level, since all 160
  primitives publish from stage 1 alone. Does a toggle that shows nothing
  need a word somewhere?
- [ ] **2.3** The rate pill (2.3), in rate mode at `closed_loop`'s root: at
  the bottom-left of each assembly, on the edge, the same place with `o`
  on and off. Check it against the wires below a block, and zoomed in.
- [ ] **2.4** The yield (0.3). `failure_nested`'s root in rate mode: `ctl`
  shows its "loop" pill and no clock pill, being 17 units too narrow for
  both. On `rates`, trace a route from `src`'s output with `t`: the clock
  pills on `fast` and `slow` go while the route stands and return on
  Escape. They miss by about one unit, with the left half of the edge
  free to the eye. Keep the rule, or let the two pills overlap, or move
  one.
- [ ] **2.5** The measurement you asked for: 53 rate pills over 40 levels of
  15 fixtures. One block meets as loaded, `ctl` above. Five more would
  with a route entering: `fast`, `slow` and `fast/outer` in `rates`, and
  `sensing` in `closed_loop` and its deployment twin, the last two by one
  unit.

## 3. The detail pane

- [ ] **3.1** The open level (3.5), nothing selected at `closed_loop`'s
  root: no Open button, the level's line, then type, class and children,
  the signature and docstring, five locations, four parameters and the
  faces with their links. "6 children" now appears twice, in the line and
  in the facts (0.4).
- [ ] **3.2** Inside `pid_controller` with nothing selected: the same
  layout, its member row, and a face row's click selecting the level's
  pin. On `rates`' `fast`, the rate scopes sit between the line and the
  facts.
- [ ] **3.3** A docstring's code blocks (3.2): `library`'s `lqr`, the long
  signatures on one line each with a sideways scroll.
- [ ] **3.4** A root input's pin (0.6): select `h_ref`'s tag at
  `closed_loop`'s root and read the pane; then a pinned port, the output
  `y` of `pid_controller/free`, which still says so. An assembly's face
  still reads "not pinned": the port `h_ref` on `pid_controller` at the
  root, or the pin `h_ref` inside it, through the root input's
  always-false flag; and the port `θ` on `pid_controller`, where the flag
  is `plant`'s output's and not a fact about the assembly's face. An
  assembly's face declares nothing of its own. Say nothing of pinning on
  every assembly face, or only on those fed by a root input, or leave it.
  A primitive root's inputs also say nothing now, being root inputs.
- [ ] **3.5** A location's label can break inside its line number,
  "blocks.jl:2" then "123", at the default pane width. It predates the
  pass and shows more now that the root lists five locations. An item, or
  fix now.

## 4. The help page

- [ ] **4.1** The lead paragraph (4.2, 4.6), under "Reading the diagram".
  Read it: the level, the double-click, the order in which text drops, the
  computed layout and the dragged component.
- [ ] **4.2** Fifteen terms, each with a drawing (4.2). The two new
  drawings: `display name`, a component named `plant` over "Airframe" and
  one named `err` over the Σ icon, both names invented to fit; `legend`,
  the corner box with two lines.
- [ ] **4.3** The six rewritten lines: component, face, badge, display
  name, halo, legend. And the wire line's "double" (0.5).
- [ ] **4.4** The badge's drawing shows "2 clocks" at the bottom-left, as
  the canvas now draws it.
- [ ] **4.5** Coming from Simulink (4.5): the nineteen rows of the first
  look's 7.2. Read the notes. The third column has no heading; "note", or
  as is.
- [ ] **4.6** Four sections and four links (4.6); the refusals are gone
  from the page.
- [ ] **4.7** The frame under the page (4.10). Click a tree row, press `?`
  twice: the row has focus again and `j` walks the tree. On `large`,
  scroll the tree, open and close the page: the scroll holds. Try each way
  of closing: the button, `?`, Escape, the browser's back.
- [ ] **4.8** With the page open, other keys do nothing to the frame
  beneath: press `d`, `r`, `o`, `j`, close, and find everything as it was.
- [ ] **4.9** At a narrow window the page scrolls sideways by the About
  section's long addresses. It predates the pass. An item, or fix now.

## 5. The words

- [ ] **5.1** "Component" for "block" and "primitive" for "leaf" (4.5), in
  every text you read. Places to check: the status bar's "24 primitives",
  the pane's class "primitive, discrete", the rate legend's hover title,
  the clock pill's title, the tabs' "Select the primitive", the help page.
- [ ] **5.2** The README's "By design" section (4.6), after the status line
  and before "Writing a descriptor": the four lines of the first look's
  7.3.
- [ ] **5.3** The README's status line still says the page is coming. It
  predates the pass. Reword now, or at the release.
- [ ] **5.4** One internal error message keeps the word, `"<path>" is a
  leaf, not a level` in `src/lib/level.ts`, which no reader should meet.
  Leave it for the pin's sweep.

## 6. After the look

- [ ] **6.1** Record what this look settles, docs commit first.
- [ ] **6.2** The merge: rebase `increment-8` onto `master`, fast-forward.
- [ ] **6.3** The push and its CI run. The clock pill's check recomputes its
  rule from the page, so CI's wider fonts should not flip it; the Firefox
  `leave.spec.ts` item stands from increment 6.
- [ ] **6.4** The roadmap's landed note for increment 8, `pending.md`'s
  first bullet, and the brief for increment 8b.
