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
    `D 2 · Φ 1 · τ 1/100 s`, a build's `τ Δt_base`, each before the
    declaring scope, which the title held already. *Rejected:* `D`, `Φ` and `τ`
    alone, which drops the scope answer 3 puts in the tooltip. *Hunk:*
    `timing.ts`'s `legendText`.

One existing unit test changed its claim under answer 15. A link written
with an explicit unqualified target, `` [`x`](@ref Junction) ``, joined
to the type's module. It now shows as text, since the answer links only
a target under `Redstone.` and joins only a bare link.

From prototyper B, the timing tab and the chart. The probes are in `…-worktrees/increment_10_notes/probes_b/`, and the
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

From prototyper C, the pane, the legend, the fit and the help page. Its
probes are in `…-worktrees/increment_10_notes/probes_c/`.

24. **Where the frames table sits** (answer 10). In the rate fact's
    `dd`, across the full width of the facts list, under its label, the
    chain line after it. *Rejected:* beside the label, which overflowed
    the 240 px pane by 6 px and wrapped every value at 360 px; a section
    of its own, which parts the rate from the type and the class.
    *Probe:* `narrow.out`, 240 of 240 px on two fixtures. *Hunk:*
    `Detail.svelte`'s rule on `dd[data-fact="rate"]`.
25. **The frames table's heads** (answers 3 and 10), *look*. The column
    heads are the words `period` and `phase`, as answer 10's sketch
    draws them. Each row's head gives the frame's word and its name, and
    is titled with answer 3's pair and unit. *Why:* answer 10 says "the
    column heads give the words", and a head names a column of four
    quantities, which no one symbol does. *Rejected:* no heads; symbols
    as heads. *Hunk:* `Detail.svelte`'s `thead` and `timing.ts`'s
    `FRAME_TITLES`.
26. **The legend's columns** (answer 13). Marks, text and `Δt` align
    across the lines in one grid. *Rejected:* one row per line, the `Δt`
    ragged. *Hunk:* `Canvas.svelte`'s `.legend` rules.
27. **The fit's rule** (answer 13), *look*. `fitBeside` takes the larger
    of the two candidates, the bottom one on a tie, and the whole
    viewport where neither leaves room for the padding. It applies while
    a legend shows. A change of mode does not fit again, and `0` does.
    *Rejected:* a fit on `r`, which would move a view the user set.
    *Probe:* `fit.out`, 16 roots at 1600 by 1000. Every root keeps its
    scale but `large`, which goes from 0.083 to 0.062 under its 43
    lines. No block meets the legend. *Hunk:* `view.ts`'s `fitBeside`
    and `Canvas.svelte`'s `fit`.
28. **The first fit waits a tick** (answer 13), so that the new level's
    legend is measured, and `data-ready` waits with it. *Rejected:* the
    legend's box computed from text widths, a second copy of its rules.
    *Hunk:* `Canvas.svelte`'s `draw`.
29. **The notation's place on the help page** (answers 3 and 14). A
    fifth section, "Timing and root inputs", between "Reading the
    diagram" and "Coming from Simulink": a lead, a table with each
    symbol once, the law's four lines and the type rule. *Rejected:* a
    part of "Reading the diagram", which is about the canvas. *Hunk:*
    `Help.svelte`'s section and `help.ts`'s `SECTIONS`.
30. **The help page's text** (answers 3 and 14), *look*. It is
    `help.ts`'s `NOTATION_LEAD`, `NOTATION`, `LAW_LEAD` and `TYPE_RULE`.
    The type rule reads: "`linearize` seeds a root input only at a
    `Float64` reached by at most one index step: the input itself when
    it is a `Float64`, or one element of an array of `Float64`, never a
    field." The core's §14.10 has "one index step at most and never a
    `.name`". The text also says that `linearize` cannot seed a pinned
    input, a rule and no verdict on any one input, which answer 14 keeps
    off the tab.
31. **The legend's sample on the help page** shows two short lines
    without their `Δt`, which would not read at the sample's scale.
32. **The rate fact's tooltip** reads "When the discrete primitive runs,
    in each frame from its rate scope to seconds."

The sweep for answer 3's three words over `frontend/src` changed the
rate fact's tooltip, the help page's legend term and vocabulary row, and
retired the pane's and the legend's old phrases. It left the frames
table's `phase` head by reading 25, and every use that names no timing
quantity to a reader: a geometric offset, `outline-offset`, "least
common multiple", the pool's `kind: "offset"` and field names.

## The pause, 2026-11-23

After the prototype's second stage the coordinator took a guard of the
harness for an order to hand back, stopped prototyper B in mid-stage and
committed these notes as a handover. The launching session withdrew
that. The same coordinator went on with its context intact, and B
finished its stage, so no successor ran. Nothing was lost. An earlier
commit of this file calls itself a handover for that reason.

## The prototype's close

Below, `W` is `~/.julia/dev/RedstoneInspector.jl-worktrees`.

| stage | commit on `increment-10-proto` | gate | Julia | unit | browser |
|---|---|---|---|---|---|
| 1, the fixtures | `b5b0c18` | `protoA_1` | 128 | 546 | 538, 4 skipped |
| 2, the data and two tabs | `ae55de9` | `protoA_2` | 128 | 601 | 554, 4 skipped |
| 3, the timing tab and the chart | `7d27432` | `protoB_2` | 128 | 601 | 582, 4 skipped |
| 4, the pane, the legend, the fit, the help page | `3357fd3` | `protoC_2` | 128 | 600 | 602, 4 skipped |

Stages 3 and 4 were each committed, gated, amended by a line or a test,
and gated again, so the gate named is the one on the commit that stands.
The mutants: 24 of A's, 32 of B's and 15 of C's, all red on the
prototype.

## More of the coordinator's rulings

4. **The prototype's patches are not committed.** The brief names the
   prototype's commits as each stage's reference, and the branch
   `increment-10-proto` stays until the user merges. *Why:* with the
   fixtures the patches hold about 1.4 MB, and the stage commits hold
   the same hunks. *Rejected:* the patches beside the brief, as the
   core's increments have them.
5. **The alternative patches and the look folder are made at the
   branch's tip**, after the delta check. *Why:* the user's ruling 3
   wants patches that apply to the tip, and the fixes move it. The
   prototypers' patches in `W/increment_10_notes/alternatives/` apply to
   `3357fd3` and are the models.
6. **A fourth pair goes to the look**, by the launching session's word:
   the grid report in the symbols, as built, against `show`'s words
   (reading 3).
7. **All 32 readings are ratified.**
8. **The map stays at 758 lines**, past the 700 that `design/rules.md`
   asks for. *Why:* the increment added what it owes and cut what it
   made stale. A trim is a sweep of the whole map and no part of this
   increment. *Rejected:* a trim by the last stage's builder.
9. **Two of the traps stage 4 adds to `design/rules.md` are reworded in
   the fix commit.** "New fixtures on the drift line" names the run's
   gate script, and must name `AGENTS.md`'s drift check. "A Playwright
   probe outside the tree" names "the notes folder", a place of this run.

## The builds

Two fresh builders applied the prototype's four commits on
`increment-10`, each stage gated: `4e67e1b`, `16ea596`, `d3d2cb1` and
`049f104`, with the gates `build1` to `build4` at the brief's counts.
The five new fixtures came out of the script byte for byte as the
prototype's, and the tree equals the prototype's `3357fd3` outside
`design/`. The builders' findings on the brief are in its last section.

## The cold review and its adjudication

One independent high-tier agent reviewed `049f104` in a worktree of its
own, `W/increment_10_review`. Its gate, `review_1`, is green at the
brief's counts. Its own reading from the record agrees with the modules
on 711 facts over the 21 fixtures and on 402 over 11 files it had the
core write, and with the oracle. Its verdict: sound to land once a few
small fixes are in. Its notes and probes are
`W/increment_10_notes/notes_review.md` and `W/increment_10_notes/review/`.

The coordinator's rulings on its findings, the user away:

10. **A splitting row at the root path is named as the components table
    names it** (the review's finding 1, fixed). The steps item named
    nothing there. *Why:* the item names rows of the table under it.
    *Rejected:* `show`'s word "root", a second name on one tab.
11. **A count of one reads "1 base tick" and "1 frame"** (finding 2,
    fixed), as `show` prints it.
12. **The frames table fits the 240 px pane on an "opens" row too**
    (finding 3, fixed, with a check at 240 px).
13. **The palette's order compares exact periods** (finding 4, fixed).
    Two triples of one period, `A₁ = 1/10` at `m = 3` and `A₂ = 3/10` at
    `m = 1`, came out against the module's own tie rule. *Why:* answer 5
    rules out a product of floats, the brief says the page multiplies
    none, and the order now feeds the chart's swatches. This was the
    first item of "Noticed, not touched" and leaves that list.
14. **The sort "by Δt" sorts by the exact `Δt` on a deployment**, and
    keeps the palette's order on a build, where an `A₀` row's `Δt` is a
    symbol (finding 5, fixed), *look*. The button's title says which.
    *Why:* reading 16 changed the words alone, and on a deployment the
    palette's order is no order of `Δt`. *Rejected:* the old words, "by
    period", which answer 3 takes off the tab; the palette's order kept
    under the new words.
15. **The legend's tooltip stands as built**, `D`, `Φ` and `τ` first and
    the declaring scope after them (finding 6). The record's note on
    answer 13 and reading 10 above said the reverse, the coordinator's
    slip, and the closing docs commit corrects both. *Rejected:* the
    order swapped in the code, a change with no reader's gain.
16. **The frame counts toward the chart's threshold and pitch only
    where frame tops are drawn** (finding 7, fixed, with a dated note on
    answer 11), *look*. *Why:* where `Δt_frame` divides `Δt_base` no
    line is drawn, yet a frame of a tenth of a tick spread each tick
    over 60 px, and one of a ten-thousandth omitted a chart of 360
    ticks. Step 2's amendment gave its reason for the frame that does
    not divide the tick, and its words reached further. *Rejected:* the
    record's rule as worded.
17. **A link to the module `Redstone` gets a unit test of its own**
    (the review's surviving mutant, fixed). Reading 9 had a browser
    check alone.
18. **Left for the look pass:** the frame caption under an omitted
    chart (finding 8), and the frames table's row heads wrapping at the
    default 360 px pane (finding 9).

## The close

The fixes landed as `52524d1`, with the gate `fix_1` green at the counts
below. The fix took the map to 759 lines, one past ruling 8's.

The reviewer then ran the delta check on `52524d1` in
`W/increment_10_review`. Its gate, `delta_1`, is green, every step
exiting 0 and the drift empty (`delta_1_summary.log`):

- Julia, 128 tests passed of 128 (`delta_1_julia.log`).
- Unit, 607 tests in 30 files, all passed (`delta_1_npm_test.log`).
- The checker, 0 errors and 0 warnings in 405 files
  (`delta_1_npm_check.log`).
- Browser, 604 checks passed and 4 skipped (`delta_1_e2e.log`).

The reviewer found every fix as ruled and nothing else changed. Its
third reading, brought to rulings 10 and 16, agrees with the modules on
709 facts over the fixtures and on 402 over the core's 11 files. Two
reverts went red. Ruling 16's fix taken out turned two unit tests red,
and ruling 13's float product put back turned the tie in
`rates.test.ts` red. Findings 6, 8 and 9 survive as adjudicated, in
rulings 15 and 18. The reviewer named one harmless import cycle the fix
opened, under "Noticed, not touched". Its record is the section "Delta
check of 52524d1" in `W/increment_10_notes/notes_review.md`.

The account's usage limits stopped the coordinator twice. The five-hour
limit stopped it at 05:42, and it resumed at 09:14. The week's limit on
its model stopped it for good at about 09:20, after the delta check and
while it wrote the closing docs. The launching session gave the rest to
fresh agents. One made the four alternative patches again at the tip and
filled the look folder, by ruling 5. Its index, with what to look at
first, is `W/increment_10_look/README.md`, and the patches are
`W/increment_10_look/alternatives/bare_link_as_text.patch`,
`chain_line_left_out.patch`, `grid_report_left_out.patch` and
`grid_report_show_words.patch`. Another wrote this closing docs commit
from the coordinator's uncommitted start.

The user's items owed:

- The look-and-adjust pass, from `W/increment_10_look/README.md`, with
  findings 8 and 9 among its items.
- The diff check of the arc, `git diff 7b66e6b increment-10`.
- The choice on each of the four pairs, the form built or its patch.
- The merge of `increment-10` into `master`, then the push.
- The removal, once done with them, of `W/increment_10_proto` and its
  branch `increment-10-proto`, `W/pin_bump` and its branch `pin-bump`,
  and the detached worktrees `W/increment_10_review`,
  `W/pin_bump_review` and `W/increment_10_alt`.

## The look and its fixes

The user looked on 2026-11-24. Their words and each ruling stand under
the entries of `look_inspector_10.md`, and the record's amendments landed
first, in `a4bc9b4`. The four pairs are ruled as built, the grid report
as the look's 1.10 rewords it. The look amends readings 2, 3, 6, 13, 14,
18, 19, 24, 29 and 32, reading 13 by the caption alone.

One fresh high-tier agent made the fixes as `c4ddea3`. Its gate,
`look_fix_1`, is green on the committed tree: Julia 128, unit 612, the
checker 0 errors, browser 620 passed and 4 skipped, the drift empty. Its
32 mutants are red. Its readings, each found sound by the delta check and not
yet ruled on by the user:

33. **A refused file keeps the sections' state**, which only a reload
    resets. *Rejected:* the reset that the drawer takes.
34. **The joint period's line** gives the base ticks first, so the
    seconds follow them in parentheses.
35. **Values and paths keep the code font** in the head list. The steps'
    count, which holds words under a proposing algorithm, is prose.
36. **A section is a native `details`**, its `toggle` event feeding the
    session. *Rejected:* a click handler that prevents the default, which
    the browser's find-in-page would put out of step.
37. **Space toggles a focused heading, and Enter too unless a closed
    assembly is selected**, which it opens, as the map states.
38. **TIMING's tooltip** reads "When the discrete primitive or the rate
    scope ticks, in each of its frames down to seconds." *Why:* reading
    32's "from its rate scope" is false of an assembly and of a
    component with its own anchor. *Rejected:* reading 32's text, which
    the look's 8.1 names.
39. **TIMING's pair stands beside the `h3`**, outside its uppercase, and
    moves below the word whole where the pane is too narrow.

An independent high-tier agent ran the delta check in
`W/increment_10_review`. Its gate, `look_delta_1`, is green at the same
counts. Its own reading from the record agrees with the modules on 5350
facts over 48 files and with the page on 2760 facts in each browser, and
none disagrees. 51 of its 53 mutants are red. It found no defect, and
its verdict is sound to land. The two green mutants are style rules: a
heading's disclosure marker, and the `nowrap` that keeps each half of
TIMING's pair whole.

The agents' notes are `W/increment_10_notes/notes_look_fix.md` and
`notes_look_review.md`. The captures for the user's second look are in
`W/increment_10_look/second/`. The user's items owed are now that look,
the diff check of the arc, the merge, the push and the removal of the
worktrees.

## Noticed, not touched

- At 240 px in Chromium the header's Copy button beside a long path
  scrolls the pane sideways by 14 to 21 px on six nodes, `closed_loop`'s
  `lqr_controller/command_pack` among them. The look's fixes do not touch
  it (the look's delta check).

- At 1100 by 700 `large`'s legend, 714 px tall, is taller than the
  canvas and is cut at the top with no scroll (the review).
- "No assembly is keyed in sample_times; every key names a primitive."
  shows on a model with no `sample_times` at all (the review).
- With a closed assembly selected, the shell's Enter opens it even when
  a drawer button holds the focus, so Enter does not press a swatch or a
  sort button there. Space does. It predates the increment and belongs
  to the keyboard sweep.
- The oracle's draw counter takes a path's prefix for its parent, wrong
  for a keyed container. Only `containers` has one.
- `timing.ts` imports `count` from `detail.ts`, which imports
  `timing.ts`, since the fix of finding 2 (the delta check). The fix of
  finding 4 has `rates.ts` import `timing.ts`, which imports `rates.ts`,
  a second cycle. Both are harmless, since neither module of a pair uses
  the other at load time (the fixer's notes).
- Nothing is owed to the core, and no core change was needed.

## Paths

- `W/increment_10_notes/standing_rules.md`: the rules every agent of
  the run reads first.
- `W/increment_10_notes/notes_proto_a.md`, `notes_proto_b.md` and
  `notes_proto_c.md`: the prototypers' notes.
- `W/increment_10_notes/oracle/`: `oracle.py`, `crosscheck.jl` and
  their outputs, 567 checks and none failed.
- `W/increment_10_notes/probes_a/`, `probes_b/` and `probes_c/`: the
  mutant runners and their outputs, the gesture, fit and narrow-pane
  probes and their captures.
- `W/increment_10_notes/notes_build_1.md`, `notes_build_2.md`,
  `notes_fix.md` and `notes_review.md`: the builders', the fixer's and
  the reviewer's notes.
- `W/increment_10_notes/alternatives/`: the prototypers' four patches,
  the models, which apply to `3357fd3` only, and the captures of each
  form.
- `W/increment_10_look/alternatives/`: the four patches made again at
  the tip.
- `W/run_20261123_logs/increment_10/`: `gate.sh` and every gate's logs.
- `W/increment_10_look/`: what the user looks at, its index `README.md`.
