# Increment 10, the implementation: notes

The third of increment 10's three steps, from the first bullet of
`design/pending.md` at `7b66e6b`. It builds what
`design/deployment_overlay.md` rules, as amended at the core's `7ea3600`.
The brief is `brief_inspector_10_implementation.md`, beside this file.

The user was away on the night of 2026-11-23 and delegated the calls the
rules put to them. One coordinating agent ran the pipeline of
`Redstone.jl/design/rules/increment_rules.md` and built nothing. Its
agents prototyped, built, reviewed and fixed. Every ruling below that is
not the user's is the coordinator's, made with the user away, and the
user's review of each is owed.

## The user's rulings

Made on 2026-11-23, before leaving.

1. **The whole increment lives on the branch `increment-10`**, in a
   worktree at `~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10`
   made from `7b66e6b`. Nothing lands on `master` and nothing is merged.
   The user merges after their look.
2. **The coordinator runs the whole pipeline on the branch and stops
   before the merge.** The readings round is the coordinator's. The
   record is not shown to the user before it lands. The user's diff
   check, the look-and-adjust pass and the push are owed.
3. **The three readings of the task stay switchable.** The build takes
   step 2's rulings: the joining kept (answer 15), the chain line shown
   (answer 10), the grid report whole (answer 9). Each alternative is a
   patch that applies to the branch's tip, with screenshots of both
   forms.
4. **A finding that the core must change ends the run.** A finding the
   page can absorb is ruled, recorded and noted as owed to the core.
5. **The look is the user's**, from
   `~/.julia/dev/RedstoneInspector.jl-worktrees/increment_10_look/`.

## How the step ran

- **The class of work.** A multi-stage increment with a brief. The
  roadmap lists nine items over the fixtures, the loader, three drawer
  tabs, the pane, the chart, the legend and the help page. Prototyper A's
  half alone took 367k tokens of a 500k ceiling, so one builder's run
  could not hold it.
- **The prototype** ran in a scratch worktree,
  `…-worktrees/increment_10_proto`, on the branch `increment-10-proto`,
  made from `7b66e6b`. Three fresh high-tier agents built it one after
  the other, split by concern, each from its predecessor's notes: A the
  fixtures, the oracle and the page's data, B the timing tab and the
  chart, C the pane, the legend, the fit, the help page and the map. Each
  stage ended with the gate green and one commit there. Those commits are
  the stages' reference patches, beside the brief.
- **The agents' notes, the oracle and the probes** are outside the tree,
  under `…-worktrees/increment_10_notes/`. The gate's logs are under
  `…-worktrees/run_20261123_logs/increment_10/`, with `gate.sh`, the one
  script every agent ran.

## The coordinator's rulings

Each was the user's to make by the rules and was delegated.

1. **The prototype is split in three by concern, and the build in four
   stages.** *Why:* `increment_rules.md` splits a frontend increment
   larger than one builder's run, the second agent starting from the
   first's notes. *Rejected:* one prototyper, which the two agents before
   this step show would not fit; the prototype's patch applied whole by
   the coordinator, which the rules keep for a single-stage increment.
2. **The frames table names the root as the scope of a component under
   no keyed assembly, and its ticks read "base ticks".** *Why:* answer 10
   gives the root as the outermost scope, at `(1, 0)` on `A₀`, and says
   its ticks are base ticks. Step 2 left the wording open beyond that.
   *Rejected:* "ticks of A₀", a second name for the base grid in one
   table.
3. **Answers 5 and 14 of the record say that they amend
   `descriptor_design.md` answers 4 and 7.** *Why:* those answers' notes
   already cite the overlay's, and every other answer of the record names
   the parent it amends. Step 2 left the question open. *Rejected:* the
   record silent, the link readable from the parent alone.

## The readings

Each is a seam no answer ruled. The prototyper took the reading and built
it, and the coordinator ratified it. The hunk is what changes under the
alternative. The ones marked *look* decide what the page shows, and the
user should see them first.

From prototyper A, the data:

1. **A ten-line message on the diagnostics tab** (answer 4). The message
   shows whole, as the tab shows every message, and the drawer's body
   scrolls. *Why:* `timing_deployment`'s `GridUtilization` holds the grid
   report, whose table keeps its columns in the tab's monospace.
   *Rejected:* the first line alone, the rest behind a disclosure, a
   control the tab has nowhere else. *Probe:* a capture of the tab at the
   default 200 px drawer, eight lines in view. *Hunk:* `Drawer.svelte`'s
   `span.message` and `drawer.spec.ts`'s ten-line assertion.
2. **The coarsest line's words** (answers 6 and 9), *look*. A build
   reads `coarsest admissible Δt_base: 1/50 s`. A deployment reads
   `Δt_base: 1/100 s, the coarsest admissible 1/50 s divided by 2`, or
   `Δt_base: 1/300 s, the coarsest admissible` where the two are equal.
   *Why:* answer 6 gives the comparison `show(::Deployment)`'s form, the
   value and the whole number, in the page's fractions. *Rejected:*
   `show(::Structure)`'s `admissible: gcd(pool)/k, coarsest 1//50`, which
   names the pool before the table shows it. *Probe:* the oracle against
   the core's `_admissible_line`. *Hunk:* `timing.ts`'s `coarsestLine`.
3. **The grid report's words** (answer 9), *look*. An alternative reads
   `A₁ (staggered): declaring τ₁ = 0 or 1/50 s keeps 1/50 s`. A supplier
   reads `Δt₂ (fast)` or `τ₁ (staggered)`, and a prime's row
   `5²: Δt₂ (fast), τ₁ (staggered)`. *Why:* answer 9 asks for `show`'s
   wording and answer 3 takes the word "offset" off the tab. The symbols
   keep `show`'s facts and order and satisfy both. *Rejected:* `show`'s
   `staggered offset`. *Probe:* the oracle compares each line's facts
   with `show`'s. *Hunk:* `timing.ts`'s `gridReport`.
4. **The chain line's numbers** (answer 10). They read as `show` prints
   them, `Absolute(1//50, 0//1)`, and an explicit `Relative(1)` reads
   `Relative(1, 0)`. *Why:* the line is what the author wrote, in Julia,
   and answer 10's example has this form. *Rejected:* the page's `1/50`.
   *Probe:* the oracle matches every chain against `show`'s line.
   *Hunk:* `timing.ts`'s `linkText`.
5. **The root inputs' cause** (answer 14). A `pinned` column holds `◆`
   with the cause in its title. Each pinning consumer is followed by
   `show`'s words, `pinned by tier` or `pinned by declaration`. A
   primitive root lists no consumer, so its cause stands in the mark's
   title alone. *Rejected:* the cause as a glyph with a title on each
   consumer, which the keyboard cannot reach. *Probe:* a capture of
   `timing`'s tab. *Hunk:* `RootInputs.svelte`.
6. **The steps item** (answer 9). One item of the head list:
   `steps per unsplit frame: 1; the rows that split frames: staggered`.
   A proposing method reads `1 to 4, as proposed`, as `show` prints it.
   *Rejected:* the splitting rows as an item of their own, which parts
   them from the count they qualify. *Hunk:* `timing.ts`'s `headList`.
7. **The omitted chart's line** (answer 11). `chart omitted: the joint
   period is 360 base ticks, 6/5 s`. *Rejected:* `show`'s count of
   columns of the exact unit, a unit the page does not draw. *Hunk:*
   `timing.ts`'s `chartFit`.
8. **The refusal's words** (answer 2). `This build descriptor has no
   build.structure.grid: an older Redstone wrote it. Write the file
   again with the current Redstone.` The key reads
   `deployment.build.structure.grid`, `failure.structure.grid` or
   `deployment.schedule` by case. *Rejected:* the advice before the
   cause. *Hunk:* `loader.ts`'s `older`.
9. **A link whose target is the module `Redstone` itself** (answer 15)
   shows as text. *Why:* the answer links a target under `Redstone.`,
   and the API page may hold no anchor for the module. No fixture has
   one. *Rejected:* a link to `#Redstone`. *Hunk:* the first line of
   `docstring.ts`'s `refLink`.
10. **The legend's tooltip** (answer 13). A deployment's line reads
    `D 2 · Φ 1 · τ 1/100 s`, a build's `τ Δt_base`, each after the
    declaring scope the title holds today. *Rejected:* `D`, `Φ` and `τ`
    alone, which drops the scope answer 3 puts in the tooltip. *Hunk:*
    `timing.ts`'s `legendText`.

One existing unit test changed its claim under answer 15. A link written
with an explicit unqualified target, `` [`x`](@ref Junction) ``, joined
to the type's module. It now shows as text, since the answer links only
a target under `Redstone.` and joins only a bare link.

From prototyper B, the timing tab and the chart. Its stage is built and
not gated, so each reading stands on the runs the handover below names.
The probes are in `…-worktrees/increment_10_notes/probes_b/`, and the
five-part form of each is in `notes_proto_b.md` there.

11. **A swatch pressed in tier mode** (answer 11), *look*. It turns
    rate mode on, then toggles the focus. In rate mode it toggles alone.
    *Why:* the shell clears the legend's focus in tier mode. *Rejected:*
    a swatch disabled in tier mode; a press that sets a focus the shell
    clears at once. *Probe:* `gesture.out`, Chromium event by event, the
    gesture made twice. *Hunk:* `App.svelte`'s `chartSwatch`.
12. **The sideways scroll** (answer 11). The tab's own body scrolls
    under a long timeline, the chart's labels a sticky column, so the
    drawer's `h`, `l` and arrows reach it. *Rejected:* a scroller of the
    timeline's own, which the drawer's keys never reach. *Probe:*
    `gesture.out` at a 496 px tab. *Hunk:* `Chart.svelte`'s `.labels`
    and `.inner`.
13. **The chart's place** (answers 9 and 11), *look*. After the head
    list, before the caption and the tables. *Why:* answer 9 keeps the
    list beside what depends on it. *Rejected:* at the tab's end, below
    tables of 11 and 10 rows on `closed_loop`. *Hunk:* the `{#if joint}`
    block in `Timing.svelte`.
14. **The caption on a build** (answer 9). All four lines of the law,
    as on a deployment. *Rejected:* the seconds line alone. *Hunk:*
    `Timing.svelte`'s `{#each EQUATIONS}`.
15. **The anchor's column** (answers 3 and 9), *look*. The head is `k`
    and each cell reads `Aₖ (key)`, titled with the declaring scope, in
    all three tables. The anchors table's own key column goes. *Why:*
    answer 3 has an anchor read `Aₖ (key)`. *Rejected:* the bare index
    of answer 9's sketch. *Hunk:* the `anchor` snippet and `td.k`.
16. **The sort's words** (answer 3). `by Δt`. *Rejected:* `by period`
    kept. *Hunk:* the button and `analysis.spec.ts`'s library check.
17. **The marks and the frame tops** (answer 11). A mark sits at its
    tick's instant. A line stands at each frame top from 0 to the span's
    end, the closing one included. *Rejected:* a mark centered in its
    tick's cell, which parts a tick from the frame top it lands on.
    *Hunk:* `timing.ts`'s `tickX` and `Chart.svelte`'s `tops`.
18. **The hyperperiod's lines** (answers 8 and 11). `hyperperiod: 10
    base ticks, 1/10 s` always, and the joint period's line only where
    the span outlasts the hyperperiod. *Rejected:* the joint line
    always. *Hunk:* `hyperperiodLine` and `jointLine`.
19. **A pool entry's factor** (answer 9). `×6` after its value, as
    `show` prints it, titled with its meaning. *Rejected:* a column of
    its own. *Hunk:* `Timing.svelte`'s `span.factor`.
20. **A chart row's words** (answer 11). `D 2 · Φ 1`, the swatches,
    `2 primitives`, then `on frame tops` or `splits frames`.
21. **The swatch's tooltip** (answer 11). The legend's text, its `Δt`,
    then "focus this rate on the canvas".
22. **The build's closing sentence** (answer 9). "The base grid's
    columns and the hyperperiod chart need a deployment."
23. **The grid report's elements** (answer 9). It renders from
    `gridReport` as elements of its own, so the user's alternative drops
    one block.

## The handover, 2026-11-23

The coordinator was told to hand back before the pipeline had finished.
It was at about 170k tokens of its 500k ceiling, so this is no context
stop, and no design conflict or finding on the core caused it. It
stopped prototyper B in mid-stage, by order, and B wound down cleanly.
A successor reads this file, the pending bullet and the rules, never a
transcript. Below, `W` is `~/.julia/dev/RedstoneInspector.jl-worktrees`.

### The state

- **`master`** stands at `7b66e6b`, untouched.
- **`increment-10`**, in `W/increment_10`: this file and the pending
  bullet's stage, two docs commits on `7b66e6b`. No brief, no record
  amendment and no code is there yet. `npm ci` is run and the root
  `Manifest.toml` is copied in.
- **`increment-10-proto`**, in `W/increment_10_proto`: the prototype.
  - `b5b0c18`, stage 1, the fixtures. Gate `protoA_1` green: Julia 128,
    unit tests 546, browser checks 538 passed and 4 skipped.
  - `ae55de9`, stage 2, the page's data, the loader, the diagnostics
    and root-inputs tabs and the link rule. Gate `protoA_2` green: Julia
    128, unit tests 601, the checker 0 errors on 401 files, browser
    checks 554 passed and 4 skipped, the drift check clean. 21 fixtures
    hold 1,378,469 bytes.
  - Stage 3, the timing tab and the chart, **uncommitted and not
    gated** on `ae55de9`: eight files modified, `tabs/Chart.svelte` and
    `e2e/timing.spec.ts` new. A copy is
    `W/increment_10_notes/handover/stage3_uncommitted_on_ae55de9.patch`.
    Verified so far: the unit tests, 601 passed; the checker, 0 errors;
    `timing.spec` and `analysis.spec`, 27 of 27 in Chromium and in
    Firefox on an earlier build, with `timing.spec` alone run in
    Chromium after the last two style edits; 10 unit mutants and 12
    browser mutants red. Not run: the whole browser suite, the gate, ten
    browser mutants.
  - **`frontend/dist/` there holds a mutant's build.** Build before any
    browser check. The sources are restored, by md5.
  - Stage 4 is not started.
- **No agent, server or gate is alive.** Agents A and B answered the
  coordinator's session alone and cannot be resumed by a successor.

### What is open, in order

1. **Finish stage 3** in `W/increment_10_proto`, a fresh high-tier
   agent from `W/increment_10_notes/notes_proto_b.md`, whose section
   "Stopped by the coordinator's order" is its start: the build, the
   whole gate, the ten browser mutants left, the commit, the alternative
   `grid_report_left_out.patch` with its screenshots, the screenshot
   list, and the map entries and traps for stage 4.
2. **Stage 4**, a fresh high-tier agent in the same worktree: the
   pane's frames table and chain line (answer 10), the legend's lines
   and tooltip from `legendText`, the fit's room for the legend and the
   palette's comment (answer 13), the help page's one definition of each
   symbol and of §14.10's type rule (answers 3 and 14), the notation's
   words in the pane, the legend, the tooltips and the status bar,
   `frontend/MAP.md`, the traps for `design/rules.md`, the alternatives
   `chain_line_left_out.patch` and `bare_link_as_text.patch` with their
   screenshots, and a capture script that fills the look folder from a
   built worktree. The fit changes every level's scale, so expect
   existing geometric checks to move.
3. **The readings round** over stages 3 and 4, then **the record, once**:
   the dated notes below, this file completed, and the brief, as one
   docs commit on `increment-10` before any code.
4. **The builds** on `increment-10`: two fresh builders, four stage
   commits, each applying its stage's reference patch, checking it
   against the brief and the oracle, and gating.
5. **One cold review**, the fixes as one commit, the reviewer's delta
   check with the gate.
6. **At the tip:** the three alternative patches made again and
   checked, the look folder with its index, the roadmap's landed entry
   with the facts 10b's brief takes, and the pending bullet.

### Rulings recorded nowhere else

4. **The prototype's patches are not committed.** The brief names the
   prototype's commits as each stage's reference, and the branch
   `increment-10-proto` stays until the user merges. *Why:* with the
   fixtures the patch holds about 1.4 MB, and the stage commits hold the
   same hunks. *Rejected:* the patches beside the brief, as the core's
   increments have them.
5. **The alternative patches and the look folder are made at the
   branch's tip**, after the delta check, by the capture script and not
   from the prototype. *Why:* the user's ruling 3 wants patches
   that apply to the tip, and the fixes move it.
6. **All 23 readings above are ratified.** Stage 3's rest on a partial
   run, so a red gate there reopens the reading it touches.

### The record's notes still owed

One docs commit, each note dated 2026-11-23 and sourced "the
implementation, the user away", by `design/rules.md`'s "Amending a
record":

- answer 4: a message shows whole (reading 1);
- answers 5 and 14: each says it amends `descriptor_design.md` answers
  4 and 7 (ruling 3);
- answer 9: the coarsest line's form, the report worded in the symbols
  and not as `show` words it, the steps as one item, the chart's place,
  the caption on a build, the anchor's column (readings 2, 3, 6, 13, 14
  and 15);
- answer 10: the root named as the scope and the chain's numbers as
  `show` prints them (ruling 2, reading 4);
- answer 11: the omitted chart's line, the swatch in tier mode, the
  scroll, the marks and the closing frame top (readings 7, 11, 12, 17);
- answer 13: the tooltip keeps the declaring scope (reading 10);
- answer 14: the cause's form (reading 5);
- answer 15: a target that is the module `Redstone`, or an explicit
  unqualified one, shows as text (reading 9);
- answer 16: the new fixtures hold 390,350 bytes, where the answer
  estimated about 300 kB, beside 988,119.

### Noticed, not touched

- `rates.ts` orders the palette's triples by a float period, a float
  product on the page that answer 5 rules out for the tables. The order
  changes only if two periods collide as floats.
- With a closed assembly selected, the shell's Enter opens it even when
  a drawer button holds the focus, so Enter does not press a swatch or a
  sort button there. Space does. It predates the increment and belongs
  to the keyboard sweep.
- `timing.ts`'s `gridReportLines` is read by the tests alone since the
  tab renders from `gridReport`. Keep it or drop it at stage 3's close.
- The oracle's draw counter takes a path's prefix for its parent, wrong
  for a keyed container. Only `containers` has one.
- Nothing is owed to the core, and no core change is needed so far.

### Paths

- `W/increment_10_notes/standing_rules.md`: the rules every agent of
  the run reads first.
- `W/increment_10_notes/notes_proto_a.md` and `notes_proto_b.md`: the
  prototypers' notes, with the API of `timing.ts` and the three hunks of
  the user's alternatives.
- `W/increment_10_notes/oracle/`: `oracle.py`, `crosscheck.jl` and
  their outputs, 567 checks and none failed.
- `W/increment_10_notes/probes_a/` and `probes_b/`: the mutant runners
  and their outputs, the gesture probe and the captures.
- `W/run_20261123_logs/increment_10/`: `gate.sh` and the logs of
  `protoA_1` and `protoA_2`.
- `W/increment_10_look/`: empty.
