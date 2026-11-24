# Look: inspector increment 10

The user's checklist for the look over `increment-10` at `9d73d8c`, after
the cold review and its fix. `notes_implementation.md` holds what was
built, the 32 readings and the coordinator's rulings, cited here as
"reading n" and "ruling n". The record's answers are
`deployment_overlay.md`'s. Entries are numbered for discussion, and a
ruling goes under its entry. `REVIEW:` opens the user's own words.
Entries marked *look* are the ones the notes flag as deciding what the
page shows.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10/frontend && npm run dev`,
then drop fixtures from `frontend/fixtures/` there. Five edited copies
for the cases no fixture shows are in
`~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10_look/drop/`.
Most entries read the timing tab, so drag the drawer to about 640 px
first. The captures in `increment_10_look/` show each entry as the
browser checks saw it, on a Mac. CI's fonts are unseen.

## 1. `timing_deployment`

The synthetic model's deployment. It shows most of the new page.

- [x] **1.1** The timing tab's head list, chart, caption and tables, in
  that order (reading 13), *look*. REVIEW: 1. The parameters in the first line, "steps per unsplit frame" and "the rows that split frames" might read better arranged one per line, with a colon after each name. 2. "the rows that split frames" is rendered as code, not as text. 3. Please drop "the" from "the rows...". 4. It's a bit unclear what "attempt_budget" means here, a more specific description would help. 5. The equations relating different timing quantities are already in the help page, repeating them here feels redundant and annoying.
  Ruling (amends readings 6 and 14): the head list stands on three
  lines, a colon after each name, no code font on the prose. The first
  holds `Δt_frame` and `Δt_base`, the second `algorithm`, `h_max`, and
  `h_min` and `attempt_budget` for a proposing algorithm alone, the
  third the steps per frame and, as an item of its own, "rows that split
  frames". The descriptor's `algorithm.proposes` decides, so the core
  changes nothing. `attempt_budget` takes no description. The equations
  leave the tab and stay on the help page:

      Δt_frame: 1/100 s   Δt_base: 1/300 s
      algorithm: RK4()   h_max: 1/100 s
      steps per unsplit frame: 1   rows that split frames: staggered
- [x] **1.2** The head list's steps item: `steps per unsplit frame: 1;
  the rows that split frames: staggered`, the splitting rows in the same
    item (reading 6).
- [x] **1.3** The hyperperiod line always, the joint period's line only
  where the span outlasts the hyperperiod (reading 18). REVIEW: "360 base ticks, 6/5 s" is a bit unclear, "360 base ticks (6/5 seconds)" might be better
  Ruling: `hyperperiod: 360 base ticks (6/5 s)`, and the seconds in
  parentheses on the joint period's line and the omitted chart's too.
- [x] **1.4** The chart scrolls sideways at the minimum pitch of 6 px,
  its row labels a sticky column (reading 12). The drawer's `h`, `l` and
  arrows scroll it.
- [x] **1.5** A mark sits at its tick's instant, and a line stands at each
  frame top from 0 to the span's end, the closing one included (reading
  17).
- [x] **1.6** A chart row reads `D 2 · Φ 1`, its swatches, `2
  primitives`, then `on frame tops` or `splits frames` (reading 20). A
  swatch's tooltip gives the legend's text, its `Δt`, then "focus this
  rate on the canvas" (reading 21).
- [x] **1.7** A swatch pressed in tier mode turns rate mode on, then
  focuses the rate. In rate mode it toggles the focus alone (reading 11),
  *look*. The alternative is a swatch disabled in tier mode.
- [x] **1.8** The coarsest line: `Δt_base: 1/300 s, the coarsest
  admissible` where the two are equal (reading 2), *look*. REVIEW: I'd prefer simply `Δt_base: 1/100 s, coarsest admissible: 1/50 s`
  Ruling (amends reading 2): that form, the two equal or not. It moves
  under the heading of 1.10, where a build keeps `coarsest admissible
  Δt_base: 1/50 s`.
- [x] **1.9** The anchor column's head is `k`, each cell `Aₖ (key)`
  titled with the declaring scope, in all three tables. The anchors table
  has no key column of its own (reading 15), *look*.
- [x] **1.10** The grid report under the anchors table, in symbols:
  `A₁ (staggered): declaring τ₁ = 0 or 1/50 s keeps 1/50 s`, and a
  prime's row such as `5²: Δt₂ (fast), τ₁ (staggered)` (reading 3),
  *look*. A pool entry's factor reads `×6` after its value (reading 19).
  The words form is pair 9.4. REVIEW: I assume the `×1` and `×6` in the anchor table denote by how much the base period must be reduced on account of that entry. That information should probably be left to the GridUtilization diagnostic. By the way, when is the diagnostic raised? Also, the way the prime's row sits right below the `A₁ (staggered): declaring τ₁ = 0 or 1/50 s keeps 1/50 s` line, without separation and starting with the lowercase "primes" is a bit confusing, because it reads like a continuation of that line.
  Ruling (amends readings 3 and 19): the reading is right, and the
  diagnostic cannot hold it alone. `GridUtilization` is raised only
  under `Δt_base = :derive` with no component at `D = 1`, so a build
  never raises it, and of the three models with a factor above 1 only
  `timing_deployment` does. The `×n` leave the anchors table. A section
  "Base grid" follows it, holding 1.8's line, then a sentence per entry
  whose factor is above 1, its alternatives in a second sentence, then
  the primes under a label of their own. A structure with no anchors
  shows none of it, and a whole-second grid no primes:

      Base grid
      Δt_base: 1/300 s, coarsest admissible: 1/300 s
      τ₁ = 1/300 s (staggered) makes the grid 6× finer. With τ₁ = 0 or
      1/50 s, the coarsest admissible Δt_base would be 1/50 s.

      Prime factors of the denominator, 300 = 2²·3·5²
        2²: τ₁ (staggered)
        3: τ₁ (staggered)
        5²: Δt₂ (fast), τ₁ (staggered)
- [x] **1.11** The components table's sort "by Δt" orders by the exact
  `Δt` on a deployment, and the button's title says so (ruling 14),
  *look*.
- [x] **1.12** In the tree, open `fast/outer` and select `hold`. The
  pane's rate fact holds the frames table across the facts' full width,
  under its label (reading 24). The column heads are `period` and
  `phase`. Each row head gives the frame's word and its name, titled
  with answer 3's pair and unit (reading 25), *look*.
- [x] **1.13** Under the table, the chain line as `show` prints it:
  `fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → hold = …`
  (reading 4). The left-out form is pair 9.2.
- [x] **1.14** At the default 360 px pane, the row heads "scope fast/
  outer" and "ticks of fast/ outer" break after the slash. The chain line
  breaks inside a link, "outer =" at one line's end (ruling 18 and the
  look agent).
- [x] **1.15** Drag the detail pane to its narrowest, 240 px. The table
  still fits, a value breaking after its equals sign (ruling 12).
- [x] **1.16** Open the level `fast/outer/deep`. The pane shows the
  level's rate scope as a frames table.
- [x] **1.17** Rate mode (`r`) on `fast/outer`. The legend's short line
  shows a deployment's exact `Δt`. A line's tooltip reads `D 2 · Φ 1 · τ
  1/100 s` before the declaring scope (reading 10).
- [x] **1.18** The diagnostics tab lists the deployment's own
  `GridUtilization` warning after the build's, its ten lines whole, the
  drawer's body scrolling at the default 200 px (answer 4, reading 1).

## 2. `timing`

The same model as a build, with no deployment.

- [x] **2.1** The timing tab: no head list and no chart, the law's four
  lines as the caption (reading 14), `A₀` at `Δt_base`, and the closing
  sentence "The base grid's columns and the hyperperiod chart need a
  deployment." (reading 22).
- [x] **2.2** The coarsest line: `coarsest admissible Δt_base: 1/50 s`
  (reading 2).
- [x] **2.3** The sort "by Δt" keeps the palette's order on a build,
  where an `A₀` row's `Δt` is a symbol (ruling 14).
- [x] **2.4** The grid report under the anchors table, in symbols, with
  an offset's alternatives (answer 9).
- [x] **2.5** Select `staggered`. The frames table names the root as the
  scope of a component under no keyed assembly, and its ticks read "base
  ticks" (ruling 2). At 240 px the chain line breaks inside
  `Absolute(1//10, 1//300)`. REVIEW: The scope row reads "opens A1 at the root" for the period column, the "phase" column is empty, and "base ticks" isn't shown at all.
  Ruling: the entry named the wrong component. `staggered` has an
  `Absolute` entry, so it has no `K` and `φ`, and the root's wording
  shows on `library`'s `d_pid`, 4.5. The row reads badly all the same: a
  component or a scope that opens its own anchor has no scope row, and
  the anchor's name is titled with its declaring key and scope, as on
  the timing tab.
- [x] **2.6** The root inputs tab: a `pinned` column with `◆`, the cause
  in its title, and each pinning consumer followed by `pinned by tier` or
  `pinned by declaration` (reading 5). On `timing`, `u` is pinned by
  five discrete consumers and `ref` by `frozen`, the one fixture's pin
  by declaration.

## 3. `closed_loop` and `closed_loop_deployment`

- [x] **3.1** `closed_loop`'s root inputs tab: `h_ref` and `V_ref`
  pinned by tier, by `pid_controller/h_ctl` and `pid_controller/V_ctl`;
  `mode` unpinned (answer 14).
- [x] **3.2** `closed_loop_deployment`'s timing tab: one chart row of ten
  swatches, fitted whole.
- [x] **3.3** Its grid report: each prime row lists ten suppliers on one
  line, near the tab's full width (the look agent). The words form of
  pair 9.4 makes them longer still.
- [x] **3.4** Repeat 1.7 here, the swatch pressed in tier mode, as the
  look index suggests.

## 4. `library` and `library_deployment`

- [x] **4.1** `library_deployment`'s timing tab: a chart of four rows,
  `(2, 1)` among them and `(2, 0)` from two triples. This is the
  roadmap's "visible" item for the increment.
- [x] **4.2** `library_deployment`'s coarsest line: `Δt_base: 1/100 s,
  the coarsest admissible 1/50 s divided by 2` (reading 2).
- [x] **4.3** Rate mode on each. The legend's short line, its marks, text
  and `Δt` aligned in one grid (reading 26): `library`'s `Δt` symbolic,
  `library_deployment`'s exact. REVIEW: Not clear what I'm supposed to be looking at here.
  Ruling: the canvas's legend at the bottom left, its columns aligned
  and its `A₀` lines symbolic on `library` and exact on
  `library_deployment`. The user then found it right.
- [x] **4.4** Press `0` in rate mode on `library_deployment`. The fit
  leaves the legend's box clear at the bottom (reading 27).
- [x] **4.5** `library_deployment`'s `d_pid` at 360 px, and `library`'s
  `d_pid` at 240 px with a build's seconds row. REVIEW: Not clear what I'm supposed to be looking at here.
  Ruling: the root's wording, "scope the root" and "base ticks", and the
  wraps at 240 px, `Δt =` before `2·Δt_base`. The user then found it
  right.
- [x] **4.6** `library`'s `integrator`, its docstring open.
  `LimitedIntegrator`, `DiscreteIntegrator` and `Comparator` link to
  `api/#Redstone.Library.…` (answer 15, step 2's reversal of the design
  session's ruling), *look*. The text form is pair 9.1.

## 5. `large`

- [x] **5.1** Rate mode, then `0`. The fit takes the left side beside a
  legend of 43 lines, and the drawing's scale drops from 0.083 to 0.062
  (reading 27), *look*. Judge whether the drawing still reads.
- [x] **5.2** At a window of about 1100 by 700 the legend, 714 px tall,
  is cut at the top with no scroll. The closing commit gave it a
  `pending.md` bullet of its own.

## 6. The edited copies in `increment_10_look/drop/`

- [x] **6.1** `rates_deployment_frame_3_400`: a frame of three base
  ticks. The head list's steps item names the rows that split frames.
- [x] **6.2** `timing_deployment_base_3000`: the base tick a tenth of
  the fixture's. The chart is omitted with `chart omitted: the joint
  period is …` (reading 7), and the frame tops' caption is absent.
- [x] **6.3** `timing_deployment_base_and_frame_3000`: the same with
  `Δt_frame = Δt_base`. The caption "every base tick is a frame top: 1
  frame in one base tick" stands under the omitted chart and describes a
  timeline the tab does not draw (ruling 18).
- [x] **6.4** `descent_without_grid` and
  `timing_deployment_without_schedule`: the loader refuses each with
  `… has no build.structure.grid: an older Redstone wrote it. Write the
  file again with the current Redstone.`, the key by case (reading 8).

## 7. The help page

- [x] **7.1** `?` opens it. A fifth section, "Timing and root inputs",
  stands between "Reading the diagram" and "Coming from Simulink": a
  lead, a table with each symbol once, the law's four lines and the type
  rule (reading 29). REVIEW: "Coming from Simulink" should move to the next-to-last position, right before "About"
  Ruling (amends reading 29): reading, timing, keyboard, Simulink,
  about, in the page and in its links.
- [x] **7.2** Its text (reading 30), *look*. The type rule reads
  "`linearize` seeds a root input only at a `Float64` reached by at most
  one index step: …", and the core's §14.10 says "one index step at most
  and never a `.name`".
- [x] **7.3** The legend term's sample shows two short lines without
  their `Δt` (reading 31). The term gives the line as `Aₖ (key) · m · c`
  where the legend prints `A₀ (base) · m 1 · c 0` (the look agent).

## 8. Anywhere

- [x] **8.1** A discrete primitive's rate fact has the tooltip "When the
  discrete primitive runs, in each frame from its rate scope to seconds."
  (reading 32). REVIEW: The tiny "rate" text on a blank line followed by the table looks ugly. I propose to replace "rate" with a collapsible heading "TIMING" (in the same font as "LOCATIONS" and "FACES") that reveals the table when expanded. The "TIMING" heading could go after "signature" and "docstring". Beyond this particular increment, I'd like to: 1. Make "LOCATIONS", "PARAMETERS" and "FACES" collapsible as well. 2. Capitalize "signature" and "docstring" in the same font as "LOCATIONS" and "FACES".
  Ruling (amends readings 24 and 32): all of it, in this increment. The
  `rate` fact leaves the list. After the facts a node's pane has six
  collapsible sections under capitalized headings, SIGNATURE, DOCSTRING,
  LOCATIONS, TIMING, PARAMETERS and FACES, in that order, each shown
  only when it has content, as now. The first four start collapsed, the
  last two open. Each keeps its state across selections and levels until
  a reload, `signature` and `docstring` included, which collapsed again
  at each selection.
  TIMING's heading carries the seconds pair, `TIMING  Δt 1/10 s · τ
  1/300 s`, and reading 32's tooltip. *Amended at the second look,
  2026-11-24: the heading is the word alone, since the section's state is
  remembered, and the tooltip is reading 38's.* The section holds the frames table
  and, on a primitive, the chain line. An assembly that is a rate scope
  has it too, as the open level, where it replaces "Rate scopes", and
  selected as a block, where no timing showed. The headings of a pin's
  and a wire's pane stay fixed.
  The faces table's head "st." becomes "stage". No record gives a reason
  for the short form.
- [x] **8.2** The words "phase", "offset" and "multiple" stand nowhere on
  the timing tab, its tooltips included, but in the frames table's
  `phase` head (answer 3).
- [x] **8.3** In Firefox, 1.12 to 1.15, 2.5 and the help page, where the
  traps say the browsers break text differently.

- [x] **8.4** The second look, 2026-11-24, at `63fa68d`. REVIEW: Since the collapsed or expanded state of the headings is remembered, I'd rather not have the period and phase next to "TIMING".
  Ruling: the pair goes. With it, the user agreed to TIMING's tooltip as
  reading 38 has it; to a build's closing sentence as "The columns in
  base ticks and the hyperperiod chart need a deployment.", since a
  section is now named "Base grid"; to a check on the headings'
  disclosure marker; to Enter on a focused heading left to the keyboard
  sweep; and to the Copy button's overflow at 240 px on the list of the
  look pass.

## 9. The four pairs

Each patch is in `increment_10_look/alternatives/` and applies at the
tip. With `npm run dev` running, apply one and the page reloads:

    git -C ~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10 apply ~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10_look/alternatives/<name>.patch

Undo it with `git apply -R` on the same path before the next one. The
side-by-side captures in `alternatives/` show each pair too.

- [x] **9.1** `bare_link_as_text`: the links of 4.6 as code text (answer
  15). Over `library` the choice covers 101 links. REVIEW: Any reason not to provide links?
  Ruling: the links stay. The case against is that the page guesses a
  bare link's module until the core's export audit, and 4 of the 101 are
  dead.
- [x] **9.2** `chain_line_left_out`: no chain line under the frames
  table, on 1.12 (answer 10). REVIEW: Any reason to drop the chain line?
  Ruling: the chain line stays. The case against is that it wraps in a
  narrow pane and its last link repeats the scope row.
- [x] **9.3** `grid_report_left_out`: no pool alternatives and no prime
  rows, on 1.10 and 2.4 (answer 9). REVIEW: I prefer the baseline.
  Ruling: the baseline, as 1.10 rewords it.
- [x] **9.4** `grid_report_show_words`: the grid report in `show`'s
  words, `staggered offset: declaring 0 or 1/50 s keeps 1/50 s`, on 1.10
  and 3.3 (reading 3). It leaves answer 3's word check red in both
  browsers, so taking it amends answer 3 and that check. REVIEW: I prefer the baseline
  Ruling: the baseline, as 1.10 rewords it.

9.2 and 9.3 meet on one import line of `timing.test.ts`, and 9.3 and 9.4
exclude each other.

## 10. After the look

- [x] **10.1** Record amendments the look settles, and the patches taken,
  docs commit first. Ruling: `a4bc9b4`, then the fixes at `c4ddea3`. No
  patch is taken.
- [x] **10.2** The merge of `increment-10` into `master`. Ruling: a merge
  commit, `7b2e050`, so that the hashes the records cite stay valid.
- [ ] **10.3** The push and its CI run, the first with CI's fonts on this
  increment.
- [x] **10.4** The roadmap's landed note and the `pending.md` stage, with
  the pin bump to the core's timing notation next, before 10b's design
  session.
- [ ] **10.5** The worktrees under `RedstoneInspector.jl-worktrees/`
  removed: `increment_10_proto` and its branch, `increment_10_review`,
  `increment_10_alt`, `pin_bump_review`, and `pin_bump` with its branch.
