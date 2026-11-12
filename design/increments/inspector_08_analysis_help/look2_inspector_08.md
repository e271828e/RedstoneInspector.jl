# Second look: inspector increment 8

The user's checklist for the second look over `increment-8` at `06176a1`, after
the fixes of the first look. It covers what the first look's rulings
changed and nothing else: `look_inspector_08.md` holds those rulings under
their entries, cited here by number, and
`brief_inspector_08_look_fixes.md` holds what was built. Entries are
numbered for discussion, and the rulings from this look follow their
entries. The user ran the look on 2026-11-12; `REVIEW:` opens the user's
own words, and the texts the look settled are in section 7.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-inc8/frontend && npm run dev`,
then drop fixtures from `frontend/fixtures/`. `o` toggles the badges, `d`
the drawer, `r` the color mode, `?` the help page.

## 0. Rulings made while you were away

Each was the coordinating session's, recorded in `notes_inspector_08.md`
with its reason. Strike any, and a fixer reverts it.

- [x] **0.1** The first group of the order tab keeps the core's order,
  though any order would do. See 1.1.
  Ruling: stands.
- [x] **0.2** A component with no output port stands in neither group. No
  fixture has one.
  Ruling: stands.
- [x] **0.3** The rate pill yields to the overlay's pills on a block too
  narrow for both. You asked for the bottom-left and a measurement; the
  rule came before the measurement. See 2.3 and 2.4.
  Ruling: struck by 2.4. Nothing yields.
- [x] **0.4** The open level's pane keeps its line "open level · N children
  · M wires" above the assembly's facts. See 3.1.
  Ruling: amended by 3.1. The line goes.
- [x] **0.5** The help page's wire line now says "a double line for a
  struct", where it said "triple". The canvas and the help page's own
  sample draw two lines, and `visual_grammar.md` answer 4 says triple. The
  text followed the page; a triple line would be a canvas change. See 4.3.
  Ruling: stands, by 4.3.
- [x] **0.6** A root input's pin no longer says "not pinned" in the detail
  pane, by the reason you gave for the tab's column in 1.1 of the first
  look. Other faces keep the phrase. See 3.4.
  Ruling: stands, and 3.4 extends it to every assembly face.
- [x] **0.7** The wording is the session's in these places: the two group
  headings, the two empty-group sentences, the badges' hover titles, the
  order toggle's title, the help page's lead paragraph and six of its
  legend lines. Each appears below where you meet it.
  Ruling: stands, the edge's title excepted, which 1.3 amends.
- [x] **0.8** Increment 8b's keys amend `workspace.md` answer 11 in that
  increment's own docs commit, not now.
  Ruling: stands.

## 1. The drawer's tabs

- [x] **1.1** Execution order on `closed_loop` (first look 1.7): "Stage 1,
  any order" with thirteen unnumbered rows and open port boxes, then
  "Stage 2, in order" with sixteen rows numbered from 1 and filled boxes.
  Do the two headings read right?
- [x] **1.2** `pid_controller/h_ctl` stands in both groups: `saturated` in
  the first, `u` and `u_raw` at position 7 in the second. Does the double
  appearance read as intended?
- [x] **1.3** The edges (1.8) sit under their stage 2 row, five under
  `lqr_controller/tracker` at position 10. Hover one and read the new
  title. REVIEW: I'd write "This component's stage 2 output" instead of "Its own stage 2 output"
  Ruling: the title's second sentence opens "This component's stage 2
  output". The whole text is 7.1.
- [x] **1.4** The empty groups: `containers` shows "No stage 1 outputs.";
  `large` shows "No stage 2 outputs, so nothing is ordered." under 160
  unnumbered rows.
- [x] **1.5** The tab still reads "Execution order 24", the length of the
  core's order, beside groups of 13 and 16. Keep, or show the second
  group's count, or both. REVIEW: Keep
  Ruling: kept. The tab's count is the length of the core's order.
- [x] **1.6** Root inputs (1.1): four columns, no pinned column, `mode`'s
  seven consumers one to a line.
- [x] **1.7** The whole row clicks (1.2), in the three tabs. Try a cell far
  from the name: `mode`'s type, a component's period, an anchor's key, the
  right end of an edge. The base grid's row and a root scope's row take no
  click and show no pointer.
- [x] **1.8** A drag that selects text inside a row also selects the row's
  target on release. Acceptable, or should a text selection suppress the
  click? REVIEW: It should suppress it.
  Ruling: a release that leaves a text selection inside the row selects
  nothing, in the three analysis tabs. A plain click and the row's button
  act as before.
- [x] **1.9** Timing (1.4): the anchors' fourth heading reads "declared
  in"; under "Rate scopes" `closed_loop` reads "No assembly is keyed in
  `sample_times`; every key names a primitive."; `rates` lists its three.

## 2. The badges and the rate pill

- [x] **2.1** The badges' numbers (1.7), with `o` at `closed_loop`'s root:
  `sensing` "1", `pid_controller` "2, 7, 9, 11", `lqr_controller` "3–6, 8,
  10, 12", `selection` "13–14", `actuators` "15–16", `plant` none. Inside
  `pid_controller`: 2, 7, 9, 11, and `free` none. Hover a badge for its
  title, "Stage 2 position 7 in the execution order".
- [x] **2.2** `large` with `o`: no badge on any level, since all 160
  primitives publish from stage 1 alone. Does a toggle that shows nothing
  need a word somewhere? REVIEW: No
  Ruling: nothing is added.
- [x] **2.3** The rate pill (2.3), in rate mode at `closed_loop`'s root: at
  the bottom-left of each assembly, on the edge, the same place with `o`
  on and off. Check it against the wires below a block, and zoomed in. REVIEW: I think swapping the rate and order pills (the latter at the bottom) would work better.
  Ruling: swapped. The rate pill straddles the top edge at the left and
  the order badge the bottom edge at the left, on every component and
  whatever the toggles say, so neither moves and each touches its own
  component. Amends the first look's 2.3, `workspace.md` answer 7 and
  `visual_grammar.md` answer 6.
- [x] **2.4** The yield (0.3). `failure_nested`'s root in rate mode: `ctl`
  shows its "loop" pill and no clock pill, being 17 units too narrow for
  both. On `rates`, trace a route from `src`'s output with `t`: the clock
  pills on `fast` and `slow` go while the route stands and return on
  Escape. They miss by about one unit, with the left half of the edge
  free to the eye. Keep the rule, or let the two pills overlap, or move
  one. REVIEW: Let them overlap, with `loop` and `route` on top of the clocks.
  Ruling: nothing yields, and 0.3 is struck. After 2.3 the rate pill
  shares no edge with the overlay's pills. The order badge does, and where
  the two meet they overlap, the overlay's pill drawn on top, since it is
  what the reader follows at that moment.
- [x] **2.5** The measurement you asked for: 53 rate pills over 40 levels of
  15 fixtures. One block meets as loaded, `ctl` above. Five more would
  with a route entering: `fast`, `slow` and `fast/outer` in `rates`, and
  `sensing` in `closed_loop` and its deployment twin, the last two by one
  unit.
  Ruling: superseded by 2.3 and 2.4. No rule depends on the measurement
  any more.

## 3. The detail pane

- [x] **3.1** The open level (3.5), nothing selected at `closed_loop`'s
  root: no Open button, the level's line, then type, class and children,
  the signature and docstring, five locations, four parameters and the
  faces with their links. "6 children" now appears twice, in the line and
  in the facts (0.4). REVIEW: Add "wires" below type, class and children, then remove the children and wire count beside the "open level". Move "open level" to where the `Open` button is when the assembly is selected in the upper level.
  Ruling: as asked. The facts gain "wires" under "children". The line of
  counts goes. The words "open level" stand in the header where a closed
  assembly has its Open button. A closed assembly's facts gain "wires"
  too, the coordinating session's reading, so the two layouts differ by
  the button alone. Amends `workspace.md` answer 4.
- [x] **3.2** Inside `pid_controller` with nothing selected: the same
  layout, its member row, and a face row's click selecting the level's
  pin. On `rates`' `fast`, the rate scopes sit between the line and the
  facts. REVIEW: I'd put `RATE SCOPES` after `LOCATIONS`.
  Ruling: the rate scopes follow the locations and precede the parameters.
- [x] **3.3** A docstring's code blocks (3.2): `library`'s `lqr`, the long
  signatures on one line each with a sideways scroll.
- [x] **3.4** A root input's pin (0.6): select `h_ref`'s tag at
  `closed_loop`'s root and read the pane; then a pinned port, the output
  `y` of `pid_controller/free`, which still says so. An assembly's face
  still reads "not pinned": the port `h_ref` on `pid_controller` at the
  root, or the pin `h_ref` inside it, through the root input's
  always-false flag; and the port `θ` on `pid_controller`, where the flag
  is `plant`'s output's and not a fact about the assembly's face. An
  assembly's face declares nothing of its own. Say nothing of pinning on
  every assembly face, or only on those fed by a root input, or leave it.
  A primitive root's inputs also say nothing now, being root inputs. REVIEW: With `h_ref` selected, the detail pane has a line that reads "pin". The detail pane shows " port - stage 1 - pinned" for `pid_controller/free`'s `y`. When selected inside `pid_controller`, `h_ref`'s detail pane reads "pin - not pinned", which is a bit confusing.
  Ruling: the pane states pinning on a primitive's own face alone, where
  the marker is declared, as "pinned" or "not pinned". Every assembly face
  says nothing: a pin, a tag, a closed assembly's port, and an assembly's
  rows in the faces table, which lose the ◆. The line also drops its kind
  word, "pin" or "port", which the header above it already gives, so no
  line can read "pin · pinned"; a line left empty is not drawn. "Pin" is
  the drawn boundary face and "pinned" the core's `Pinned` marker, two
  senses that the old line set side by side. Amends `workspace.md` answer
  4 and widens 0.6.
- [x] **3.5** A location's label can break inside its line number,
  "blocks.jl:2" then "123", at the default pane width. It predates the
  pass and shows more now that the root lists five locations. An item, or
  fix now. REVIEW: The line numbers don't seem to split between lines no matter the pane width.
  Ruling: fixed now. The break is Chromium's: at the default pane of 360
  px all five of the root's labels break as "blocks.jl:2" then "123", and
  the break falls inside the number from about 360 to 380 px. Chromium
  takes no break after a slash, so a path is one word that
  `overflow-wrap: anywhere` cuts wherever the line ends. Firefox breaks
  after a slash, which is why the user's look showed none; that half is
  inferred, since Playwright's Firefox does not start on this machine. The
  label breaks after a slash, and the file's name stays whole with its
  line number.

## 4. The help page

- [x] **4.1** The lead paragraph (4.2, 4.6), under "Reading the diagram".
  Read it: the level, the double-click, the order in which text drops, the
  computed layout and the dragged component.
- [x] **4.2** Fifteen terms, each with a drawing (4.2). The two new
  drawings: `display name`, a component named `plant` over "Airframe" and
  one named `err` over the Σ icon, both names invented to fit; `legend`,
  the corner box with two lines.
- [x] **4.3** The six rewritten lines: component, face, badge, display
  name, halo, legend. And the wire line's "double" (0.5). REVIEW: Would recommend keeping the double line or the triple one? The latter's similarity to Simulink can be good and bad.
  Ruling: the double line stays, and `visual_grammar.md` answer 4 is
  amended to say so. A triple line needs five bands in the struct wire's 5
  units, about one each, which blurs at the root's fit; wider, it weighs as
  much as a selection's casing. A closed assembly's double border already
  says "parts inside", and a double line says the same of a value with
  fields. Simulink's triple line marks a bus, often a virtual bundle, where
  a struct is one typed value. The canvas and the sample stay as built.
- [x] **4.4** The badge's drawing shows "2 clocks" at the bottom-left, as
  the canvas now draws it. REVIEW: See 2.3
  Ruling: the drawing follows 2.3, the clock pill at the top-left.
- [x] **4.5** Coming from Simulink (4.5): the nineteen rows of the first
  look's 7.2. Read the notes. The third column has no heading; "note", or
  as is.
  Ruling: as is, no heading on the third column.
- [x] **4.6** Four sections and four links (4.6); the refusals are gone
  from the page.
- [x] **4.7** The frame under the page (4.10). Click a tree row, press `?`
  twice: the row has focus again and `j` walks the tree. On `large`,
  scroll the tree, open and close the page: the scroll holds. Try each way
  of closing: the button, `?`, Escape, the browser's back.
- [x] **4.8** With the page open, other keys do nothing to the frame
  beneath: press `d`, `r`, `o`, `j`, close, and find everything as it was.
- [x] **4.9** At a narrow window the page scrolls sideways by the About
  section's long addresses. It predates the pass. An item, or fix now. REVIEW: Not the observed behavior.
  Ruling: fixed now. Chromium scrolls the page sideways below a window of
  528 px, the About section's addresses setting the floor, and below 388
  px the Vimium paragraph's patterns would set the next. Both may break
  anywhere. The cause is 3.5's.

## 5. The words

- [x] **5.1** "Component" for "block" and "primitive" for "leaf" (4.5), in
  every text you read. Places to check: the status bar's "24 primitives",
  the pane's class "primitive, discrete", the rate legend's hover title,
  the clock pill's title, the tabs' "Select the primitive", the help page.
- [x] **5.2** The README's "By design" section (4.6), after the status line
  and before "Writing a descriptor": the four lines of the first look's
  7.3.
- [x] **5.3** The README's status line still says the page is coming. It
  predates the pass. Reword now, or at the release. REVIEW: Now.
  Ruling: reworded now, with the text of 7.2.
- [x] **5.4** One internal error message keeps the word, `"<path>" is a
  leaf, not a level` in `src/lib/level.ts`, which no reader should meet.
  Leave it for the pin's sweep.

## 6. After the look

- [x] **6.1** Record what this look settles, docs commit first.
  Done as `4df73a4`.
- [x] **6.2** The merge: rebase `increment-8` onto `master`, fast-forward.
  Done on 2026-11-12 after the fixes and their review: `master` stands at
  `af55fe5`, the local gate green.
- [ ] **6.3** The push and its CI run. The clock pill's check recomputes its
  rule from the page, so CI's wider fonts should not flip it; the Firefox
  `leave.spec.ts` item stands from increment 6.
  Open: the push waits for the user's word.
- [x] **6.4** The roadmap's landed note for increment 8, `pending.md`'s
  first bullet, and the brief for increment 8b.
  Done but for the brief, which opens increment 8b's own bullet in
  `pending.md`.

## 7. Texts the look settled

- **7.1** The feedthrough edge's hover title (1.3): "A stage 2 output wired
  into this component. This component's stage 2 output may read it in the
  same sweep, so the producer runs first. Presumed: the build knows the
  wiring and the stages, not which inputs each output reads."
- **7.2** The README's status line (5.3): "**Status:** stage 1, before its
  first release. The writer, the live session and the page work from a
  checkout; the deployment overlay and the release are to come."
