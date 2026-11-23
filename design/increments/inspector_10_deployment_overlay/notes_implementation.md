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
