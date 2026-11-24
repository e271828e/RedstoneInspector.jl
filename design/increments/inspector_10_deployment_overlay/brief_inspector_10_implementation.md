# Brief: increment 10, the deployment overlay's implementation

*The folders under `RedstoneInspector.jl-worktrees/` that this file names
were local to one machine and are gone, deleted on 2026-11-24 with the
worktrees. What a later increment needs is in `tools/`, beside this file.*

The third of increment 10's three steps, from the first bullet of
`design/pending.md`. The arc makes these commits on the branch
`increment-10`: the docs commit that carries this brief, the record's
dated notes and the notes file; four stage commits; one commit for the
review's fixes; and a closing docs commit for the roadmap and the pending
list. Drafted on 2026-11-23 on top of `9f60c57`, after the pin bump and
the record at the new pin, with the core pinned at `7ea3600`.

Three high-tier agents prototyped the increment one after the other in
the scratch worktree `~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10_proto`,
on the branch `increment-10-proto`, made from `7b66e6b`. Each stage of
the prototype is one commit there with the gate green. Those four
commits are the stages' reference patches. They are not copied beside
this brief, since the fixtures bring them to about 1.4 MB, and the branch
stays until the user merges (the notes' ruling 4).

The user is away. The coordinator's rulings and every reading are in
`notes_implementation.md`, beside this brief. Nothing lands on `master`,
and nothing is pushed or merged.

Not normative: if a shape below proves wrong at the keyboard, stop and
report rather than deviate.

Below, `W` is `~/.julia/dev/RedstoneInspector.jl-worktrees`. Every agent
reads `W/increment_10_notes/standing_rules.md` first.

## What is settled

- **The scope** is `design/roadmap.md`'s entry "Increment 10: the
  deployment overlay", its nine items.
- **The design** is `design/deployment_overlay.md`, answers 1 to 17, as
  amended at the core's `7ea3600` and by the docs commit that carries
  this brief. Step 2's rulings are in `notes_record_at_pin.md`.
- **The user's rulings for the night** are the notes' first section. The
  whole increment lives on `increment-10`. The three readings of the task
  are built as step 2 ruled them, the joining kept, the chain line shown
  and the grid report whole, and each alternative is left as a patch.
- **The readings** the prototypers took on unruled seams are the notes'
  section "The readings". The coordinator ratified each. They are
  settled for the builders and open to the reviewer.
- **Increment 10b's events** and the three event parameters are read and
  not shown.

## The shape built

Per stage, with the prototype's commit that is its reference.

### Stage 1, the fixtures: `b5b0c18`

- `scripts/synthetic.jl`: the model `timing` at the file's end, after
  `Scale`, so no other fixture's locations move. It brings `PinnedGain`
  with a docstring, `timing_deep()` and `timing_outer()`. `Pinned` joins
  the import line.
- `scripts/fixtures.jl`: `approach` imported from RedstoneExamples,
  `"timing"` in the synthetic loop, and four deployments written:
  `timing_deployment` at `Δt_frame = 1//100` and `Δt_base = :derive`,
  `library_deployment` at `1//100`, `rates_deployment` at `1//100` and
  `Δt_base = 1//200`, `approach_deployment` at `1//200`.
- `frontend/fixtures/`: five new files, `timing.json`,
  `timing_deployment.json`, `library_deployment.json`,
  `rates_deployment.json` and `approach_deployment.json`.
- `frontend/src/lib/fixtures.test.ts`: the counts move from sixteen
  fixtures to twenty-one and from fifteen structures to twenty.
- `frontend/e2e/draw.spec.ts`: the table gains 19 levels, four each for
  `timing`, `timing_deployment` and `rates_deployment`, six for
  `approach_deployment` and one for `library_deployment`.
- Nothing else enumerates the fixtures.

### Stage 2, the page's data and the two small tabs: `ae55de9`

- `frontend/src/lib/timing.ts`, new and pure: exact fractions over
  `BigInt` and their printing; the joins by path and by path and key;
  the anchors table with the pool's factors and `coarsestLine`; the
  components' and the scopes' tables; `gridReport` and
  `gridReportLines`; `headList` and
  `stepsPerFrame`; `hyperperiod`, `jointPeriod`, `frameLines` and
  `chartRows`; `chartFit` with `CHART_THRESHOLD = 1000` and
  `CHART_PITCH = 6`; `framesTable`, `scopeFramesTable`, `chainLine` and
  `linkText`; `legendText`. The page reads no float from the file and
  multiplies none.
- `frontend/src/lib/loader.ts`: the refusal of a structure without
  `grid`, whatever the kind, then of a deployment without `schedule`,
  after the nodes refusals, whose words stay.
- `frontend/src/lib/diagnostics.ts`: `diagnosticsOf` appends a
  deployment's own warnings after the build's.
  `frontend/src/state/session.svelte.ts`: the count reads
  `diagnosticsOf`.
- `frontend/src/lib/analysis.ts`: a root input's row gains `pinned` and
  `pins`, each with its cause, through `pinCause`.
- `frontend/src/frame/tabs/RootInputs.svelte`: a `pinned` column,
  `td.pinned[title]`, and each consumer as `.consumer[data-cause]` with a
  `.cause` span.
- `frontend/src/lib/docstring.ts`: `refLink` reads the target, and the
  joining stands behind the exported `joinBare`.
- The tests beside each module, and `analysis.spec.ts`,
  `drawer.spec.ts`, `landing.spec.ts` and `detail.spec.ts`.

### Stage 3, the timing tab and the chart: `7d27432`

- `frontend/src/lib/timing.ts` gains `anchorTitle`,
  `componentTable(model, byPeriod)`, the `unfactored` flag of a prime's
  row, `hyperperiodLine`, `jointLine`, `DrawnFit`, `CHART_PAD`, `tickX`,
  `frameTopX`, `dueTicks` and `EQUATIONS`. `gridReportLines` goes, the
  tab rendering from `gridReport`.
- `frontend/src/lib/analysis.ts` loses `anchorRows`, `scopeRows`,
  `componentRows`, `periodText`, `scheduleNote` and their four row
  types. `rowTarget` reads a `TimingTarget`.
- `frontend/src/frame/tabs/Timing.svelte`, rewritten, in this order: the
  head list of a deployment, the chart, the caption's four equations,
  the anchors with the coarsest line, the factors and the grid report,
  the rate scopes, the components, and on a build the closing sentence.
- `frontend/src/frame/tabs/Chart.svelte`, new: the rows per `(D, Φ)`
  with their swatch buttons, the marks, the frame tops, and the fit, the
  scroll or the omission.
- `frontend/src/frame/Drawer.svelte` and `frontend/src/App.svelte` pass
  the legend's focus and `chartSwatch`.
- `frontend/src/lib/timing.test.ts` and `analysis.test.ts`, beside
  their modules.
- `frontend/e2e/timing.spec.ts`, new, 14 checks, and
  `frontend/e2e/analysis.spec.ts` amended where the tab's shape changed.

### Stage 4, the pane, the legend, the fit, the help page and the map: `3357fd3`

- `frontend/src/lib/detail.ts`: the rate fact is a frames table with
  its chain, from `framesTable` and `chainLine`, and the open level's
  scopes each hold a table, from `scopeFramesTable`. `ratePhrase`,
  `timingPhrase`, `ordinal` and `rational` go.
- `frontend/src/frame/Detail.svelte`: `table.frames` with a
  `tr[data-frame]` per frame, then `p.chain`, across the facts' width.
  A scope of the open level holds its own table.
- `frontend/src/lib/timing.ts` gains `FRAME_TITLES`.
- `frontend/src/lib/rates.ts`: a legend line is `{key, triple?, step?}`,
  and `tripleText` and `tripleTitle` go.
- `frontend/src/canvas/Canvas.svelte`: the legend reads `legendText`
  into three aligned columns under a titled line. The fit takes
  `fitBeside` with the legend's measured box, and a first fit waits a
  tick.
- `frontend/src/lib/view.ts` gains `fitBeside`.
- `frontend/src/canvas/palette.ts`: the comment on the peach.
- `frontend/src/lib/help.ts` and `frontend/src/frame/Help.svelte`: a
  fifth section, "Timing and root inputs", with each symbol once, the
  law and the type rule, and the legend's term and sample in the short
  form.
- `frontend/MAP.md`, for all four stages, 728 lines to 758.
  `design/rules.md`, ten traps. `README.md`, the help line.
- `frontend/src/lib/detail.test.ts`, `rates.test.ts` and
  `view.test.ts`, beside their modules.
- `frontend/e2e/frames.spec.ts` and `legend.spec.ts`, new, and
  `detail.spec.ts`, `colors.spec.ts` and `help.spec.ts` amended where
  the pane's, the legend's and the help page's text moved.

## Measurements

Every figure is the prototype's, from its gates' summaries under
`W/run_20261123_logs/increment_10/`.

| after | Julia tests | unit tests | checker | browser checks | gate |
|---|---|---|---|---|---|
| `7b66e6b` | 128 | 526 | 0 errors, 399 files | 500 passed, 4 skipped | the pin bump's |
| stage 1 | 128 | 546 | 0 errors | 538 passed, 4 skipped | `protoA_1` |
| stage 2 | 128 | 601 | 0 errors, 401 files | 554 passed, 4 skipped | `protoA_2` |
| stage 3 | 128 | 601 | 0 errors, 403 files | 582 passed, 4 skipped | `protoB_2` |
| stage 4 | 128 | 600 | 0 errors, 405 files | 602 passed, 4 skipped | `protoC_2` |

- The fixtures: 21 files and 1,378,469 bytes, from 16 and 988,119. The
  five new ones hold 390,350 bytes.
- The oracle: 567 checks, none failed, over the 20 structures. The
  modules printed in the oracle's form give 1163 lines, all in
  agreement.
- The fit's cost, from `W/increment_10_notes/probes_c/fit.out`, 16
  roots in Chromium at 1600 by 1000 with the default panes: every root
  keeps its scale but `large`, which goes from 0.083 to 0.062 under a
  legend of 43 lines. No block meets the legend. No existing geometric
  check moved.

## Readings the prototype took

The notes' section "The readings" holds each with its reason, the
alternative it rejected, its probe and its hunk. The coordinator ratified
all, the user being away, and the user's review of each is owed. The
ones that decide what the page shows: the coarsest line's words and the
grid report's words (2 and 3), the swatch in tier mode (11), the chart's
place (13) and the anchor's column (15), the frames table's heads (25), the fit's
rule (27) and the help page's text (30).

## What the tests pin, by property

Each check's name states what it pins. The mutants are those of the
prototype's runners, `W/increment_10_notes/probes_a/mutants.py`,
`probes_b/mutants.py` and `probes_c/mutants.py`, each red on the
prototype.

Stage 1:

- The fixture counts (answer 16). No mutant was run for this stage.
- Every level of the five new fixtures draws its blocks, pins and wires
  (answer 16), by the oracle's `draw.txt`.

Stage 2, unit tests:

- Exact fractions and the least common multiple (answer 5). Mutant: the
  gcd of the numerators.
- The anchors table and the coarsest line (answers 6 and 9). Mutant: a
  divisor of 1 kept in the line.
- The grid report, with an inline grid of whole seconds and an inline
  unfactored prime (answers 6 and 9). Mutant: the suppliers' kinds
  swapped.
- The components' and the scopes' tables, a build's `τ` among them
  (answers 3, 5 and 9). Mutant: a build's `τ` without `τₖ`.
- The join with the rows reversed (answer 5). Mutant: the rows joined by
  position.
- The head list and the steps, with inline copies for a proposing
  method, the floor case and a frame of `3/200 s` (answer 9). Mutants:
  the steps taking the floor; the upper count below the lower.
- The split rule (answer 9). Mutant: `Φ` ignored.
- The hyperperiod, with no rows and with coprime periods past `2^53`
  (answer 8). Mutant: the least common multiple over floats.
- The joint period, the frame lines and the caption, a frame finer than
  the tick among them (answer 11).
- The chart's rows (answer 11). Mutant: sorted by `Φ` first.
- The fit and the threshold, the frame tops counted and the frame as the
  finer unit (answer 11). Mutants: the threshold blind to the frame
  tops; the pitch always the base tick's.
- The frames tables: answer 10's example, a component that opens an
  anchor, the nested scope's division, an inline grandparent scope and
  an inline discrete root (answer 10). Mutants: `φ` not divided by `mₛ`;
  the enclosing scope taken as the parent alone.
- The chain line (answer 10) and the legend's text (answer 13). Mutant:
  a deployment's `A₀` line left symbolic.
- The loader's two refusals and a failure without a structure (answer
  2). Mutants: no `grid` check; no `schedule` check.
- A deployment's warnings after the build's, and the count (answer 4).
  Mutants: the warnings dropped; the warnings first.
- A root input's mark, its pinning consumers and the cause (answer 14).
  Mutants: the cause by the opposite tier; `pinned` forced false.
- The link rule: a target read, a foreign target as text, the joining
  kept (answer 15). Mutants: the target read only under a `Redstone`
  type; the joining dropped; a foreign target joined.

Stage 2, browser checks:

- `analysis.spec.ts`: `closed_loop`'s cause marks, `timing`'s two
  causes, the mark on the tab alone (answer 14).
- `drawer.spec.ts`: `timing_deployment`'s one amber row, counted, the
  drawer closed, the root marked and ten lines shown; the warning moved
  to `fast` marks `fast` on the canvas and in the tree (answer 4).
- `landing.spec.ts`: a build and a failure without `grid`, a deployment
  without `schedule` (answer 2).
- `detail.spec.ts`: an inline docstring with a rewritten target (answer
  15).

Stage 3:

- Unit tests: the sort by `Δt`, the anchor's tooltip, the hyperperiod's
  and the joint period's lines, the positions of a tick and of a frame
  top, the due ticks, the caption, the `unfactored` flag.
- `timing.spec.ts`: the head list on `timing_deployment`; a proposing
  algorithm with an `h_min`, inline; a build's whole tab on `timing`;
  `library`; a grid of whole seconds and a structure with no anchors;
  a deployment's columns, every head a term of the caption; the words
  "phase", "offset" and "multiple" nowhere on the tab; four rows on
  `library_deployment`, fitted, the marks where `k mod D = Φ`; the frame
  tops every two ticks on `rates_deployment`; a frame of 1.5 base ticks,
  inline; the scroll at the pitch on `timing_deployment`, with sticky
  labels, the drawer's keys and a row that splits frames; the timeline
  past the threshold, inline; a schedule with no rows; ten swatches and
  the focus gesture on `closed_loop_deployment` (answers 3, 8, 9 and
  11). Every position is a rule recomputed from the page.
- 10 unit mutants and 22 browser mutants, all red.

Stage 4:

- `detail.test.ts`, the rate fact (answer 10): the four frames and the
  chain of `fast/outer/hold`; no base grid row on a build; `staggered`
  opening `A₁`; the chain of an explicit `Relative(1)`; `library`'s
  `d_pid` at the root in `Δt_base`; an empty chain; the open level's
  scopes. Mutants: the chain dropped; the level's scopes from the wrong
  path.
- `view.test.ts`, `fitBeside` (answer 13): the bottom candidate, the
  left one centred right of the box, the larger scale, the fallback.
  Mutants: always the bottom candidate; the left candidate not shifted;
  no fallback.
- `rates.test.ts` (answer 13): the build's palette order kept under a
  deployment, and the legend's lines in the short form. Mutants: `A₀`
  last on a deployment; the lines without their step.
- `frames.spec.ts`, 4 checks (answer 10): the example's table, heads,
  titles and chain, with no sentence; `timing`'s `staggered` and `same`;
  `d_pid` on `library` and its deployment, and `d_lqr` with no chain
  line; the open levels `fast/outer/deep` and `fast`, and the 360 px
  pane not scrolling sideways. Mutants: no titles; the fact beside its
  label.
- `legend.spec.ts`, 5 checks (answers 3 and 13): the short line, only
  the `A₀` lines' `Δt` moving under a deployment, the tooltips and the
  build's steps; none of answer 3's three words; the `Δt` column
  aligned; the fit's rule recomputed from the DOM on `large`, where the
  left candidate wins, and on `library_deployment`, where the bottom
  one does; `large` dropped in rate mode fitting as `0` does. Mutants:
  the fit blind to the legend; the first fit in the same turn; no `Δt`;
  the old text.
- `help.spec.ts`, one new check (answers 3 and 14): each symbol defined
  once, the law's four lines, the type rule once on the page, the
  section's link. Mutants: the rule twice; a symbol twice.
- 7 unit mutants and 8 browser mutants, all red.

## The stages

Two fresh high-tier builders work in `W/increment_10`, one after the
other, the first on stages 1 and 2 and the second on stages 3 and 4. One
commit per stage on `increment-10`, the gate green before each.

For each stage the builder:

1. Takes the reference diff,
   `git -C W/increment_10_proto diff <parent> <commit>`, the parents in
   order `7b66e6b`, `b5b0c18`, `ae55de9`, `7d27432`, and applies it in
   `W/increment_10` with `git apply`. Stage 1 applies it without
   `frontend/fixtures/`, runs `scripts/fixtures.jl`, and compares the
   five new files byte for byte with the prototype's.
2. Checks the tree against this brief: every file of the stage's shape
   is changed and no other, and every check of the stage's list stands
   under a name that says so.
3. Runs the oracle against the branch,
   `python3 -I W/increment_10_notes/oracle/oracle.py W/increment_10`
   into a scratch folder, and compares its output with the prototype's
   in `W/increment_10_notes/oracle/`. They must agree line for line.
4. Runs the whole gate, `gate.sh W/increment_10 <label>`, in the
   background, with the labels `build1` to `build4`.
5. Commits the stage's files by explicit path, one sentence.

A disagreement between this brief and the reference is a finding: the
builder stops and reports, having committed nothing of that stage. Each
builder keeps its notes at `W/increment_10_notes/notes_build_<n>.md` and
ends by creating `W/increment_10_notes/done_build_<n>`.

## Routing

- Stage 1: `scripts/fixtures.jl` and `scripts/synthetic.jl` whole, the
  core's `design/rules/code_rules.md`, the record's answer 16.
- Stage 2: `frontend/MAP.md` whole; the record's answers 2, 4, 5, 6, 8,
  9, 10, 11, 13, 14 and 15; `W/increment_10_notes/notes_proto_a.md`.
- Stage 3: the record's answers 3, 8, 9 and 11;
  `W/increment_10_notes/notes_proto_b.md`.
- Stage 4: the record's answers 3, 10, 13 and 14;
  `W/increment_10_notes/notes_proto_c.md`.
- `design/rules.md`'s "Frontend traps" by grep, for the traps a stage
  touches.

## Bookkeeping

- `frontend/MAP.md`, extended in stage 4 for all four stages.
- `design/rules.md`, the increment's traps, in stage 4.
- `README.md`, where the increment changed what it states, in stage 4.
- `design/deployment_overlay.md`, the dated notes of the readings, in
  the docs commit before the code.
- `design/roadmap.md`, increment 10's landed entry with the facts 10b's
  brief takes, and `design/pending.md`, the step retired and the stage
  reached, in the closing docs commit.

## Out of scope

- Increment 10b's drawing of the events, the look pass before the
  release, the release and the keyboard sweep, each on `pending.md`.
- The core repo. `master`.
- The findings outside the increment, in the notes' "Noticed, not
  touched".

## The cold review

One independent high-tier agent, with an open mind. An empty review is
acceptable.

- It reads the record's answers and this brief, never the prototypers'
  notes before it has formed its own reading.
- It writes a third reading of its own from the record: a scratch
  Vitest file over the modules and a script over the fixtures, outside
  the tree, for the derivations of answers 5, 6, 8, 9, 10, 11 and 14. It
  compares its reading, the oracle and the modules. A disagreement is a
  finding. It checks each rule at the root path too.
- It runs the gate on the branch's tip, and reads the screenshots
  against the answers.
- It probes what the checks may miss: a file from an older core of each
  kind; a deployment with no discrete primitive; a structure with no
  anchors; a proposing algorithm; a frame finer than the base tick and
  one that is no whole number of ticks; a hyperperiod past the
  threshold; a pane narrower than its table; the legend's fit on the
  widest root and on the root with most lines; the words "phase",
  "offset" and "multiple" on every surface answer 3 names.
- It sweeps for a reader of the descriptor that still multiplies floats
  or reads a schedule row by position.
- It reads the help page's new text against the core's §9.2 and §14.10
  as pinned, sentence by sentence.
- It tries each alternative patch on a scratch copy.
- Survivors it may accept: a wording the look pass will judge, named as
  such; the chart's two constants.

## The review's record

Filled after the review.
