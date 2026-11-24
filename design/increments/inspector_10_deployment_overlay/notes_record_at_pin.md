# The record at the new pin, notes

*The folders under `RedstoneInspector.jl-worktrees/` that this file names
were local to one machine and are gone, deleted on 2026-11-24 with the
worktrees. What a later increment needs is in `tools/`, beside this file.*

The second of increment 10's three steps, from the first bullet of
`design/pending.md` at `fb8da65`. It brings `design/deployment_overlay.md`
up to date at the core's `7ea3600`, before the implementation is briefed
from it. It changes records alone.

The user was away on the night of 2026-11-23 and delegated the calls the
rules put to them. One agent owned the step and made the edits. One
independent high-tier agent read the amended record cold before the
commit. There is no brief and no prototype.

## The user's rulings

Made on 2026-11-22, before leaving.

1. **A finding that the core must change ends the run.** A finding the
   page can absorb is ruled in the record and noted as owed to the core
   where the core would do better.
2. **The three new deployments of answer 16 are built in scratch** and
   the record is read against their real descriptors. No fixture is
   committed.
3. **The step commits on `master`, unpushed**, records only.

## How the record was read

- **Against the core as pinned.** §13.9 whole. §9.2's binding table, its
  four frames, its "Rendering" and "Grid diagnostics" parts and the
  `Deployment` keywords of Appendix B. The log's D-464 to D-471 and
  D-477. The writer, `src/descriptor.jl`, whole. `show(::Deployment)`'s
  code in `src/show.jl`. The rate fold in `src/structure.jl`. The core's
  own client of the descriptor, in `test/test_descriptor.jl`, which
  rebuilds `show`'s lines from the JSON.
- **Against the schema copy**, which is the core's file byte for byte.
- **Against the 16 fixtures and real descriptors of answer 16's
  deployments.** The scratch folder is
  `~/.julia/dev/RedstoneInspector.jl-worktrees/record_at_pin/`:
  - `build_deployments.jl` writes `deployments/library_deployment.json`,
    `rates_deployment.json`, `approach_deployment.json` at
    `Δt_frame = 1//200` and a second copy at `1//100`, each with the text
    `show` prints beside it. It also rebuilds `closed_loop_deployment`,
    which matches the committed file.
  - `probe_timing.jl` and `probe_timing_chain.jl` build a candidate
    `timing` and deploy it. The second writes `deployments/timing.json`
    and `timing_deployment.json`.
  - `oracle.py` checks the record's claims over the 16 fixtures and the
    scratch files: the chain against the scope rows, the schedule's
    orders and its composition law, the pinned consumers, the grid's
    positions, the events' rows, the chart's rows and the steps.

## The owner's rulings

Each was the user's to make by the rules and was delegated. Each stands
in the record as a note dated 2026-11-23. The first three are the ones
the user should look at first, since each decides what the page shows
and the other reading is also sound.

1. **A bare docstring link keeps its joining until the core's export
   audit** (answer 15). The page reads a link's target, as ruled. A bare
   link in the docstring of a type under `Redstone.` still joins to that
   type's module. *Why:* the answer dropped the joining because, after
   the writer's pass, a bare link would be one that did not resolve. At
   the pin the pass rewrites no link, since the core exports nothing
   until its audit (D-226). The rule as written would turn every bare
   link into text. `library` has 101, and the joining sends 97 of them to
   a name that stands on the API page. The session wanted nine dead links
   mended, not a hundred live ones dropped. *Rejected:* the rule as
   written, which shows no bare link as a link until the audit; a list of
   the core's names kept in the page. *Cost:* four links of `library`
   stay dead, `Pinned` twice, `StopFlag` and `stop_reason`.
2. **The pane shows the whole rate chain on one line under the frames
   table** (answer 10), as `show(::Structure)` prints it. *Why:* the core
   carries the chain so that a client can show what `show` prints, and
   the page had no place for it. An explicit `Relative(1)` shows nowhere
   else. *Rejected:* no line, the links then readable one scope's pane at
   a time; one table row per link, which breaks the table's row per
   frame.
3. **The grid report shows whole on the timing tab** (answer 9): an
   offset's alternatives and the prime attribution stand under the
   anchors table, worded as `show(::Structure)` words them. *Why:* answer
   16 already asked for a fixture with alternatives, and no answer said
   where they show. The parity rule owes both a place, and `show`'s
   wording is the one design that needs no new decision. *Rejected:*
   both left out; both in a tooltip, which the keyboard does not reach.
4. **The loader refuses a file from an older core by its structure**
   (answer 2): a structure without `grid`, whatever the kind, and a
   deployment without `schedule`. *Why:* the pin bump's review found that
   an old build or failure loads and breaks the readers. The header says
   1.0 in both, and the page validates nothing at runtime. `grid` is
   required on every structure since D-467, so one key tells the old
   file. *Rejected:* the readers accepting the old key `T`, a path for an
   older file, which answer 2 and the core's §13.9 rule out; a check of
   an anchor's `dt`, which a model with no anchors passes.
5. **A deployment's own warnings join the diagnostics tab, after the
   build's** (answer 4). *Why:* `show(::Deployment)` prints them, and the
   tab is where the build's already stand. They follow the build's since
   the build comes first. *Rejected:* a place on the timing tab's head
   list, a second home for diagnostics.
6. **The scope row stays derived, for a primitive and a scope alike**
   (answer 10), and the root counts as the outermost scope. *Why:* the
   fold composes `m = K·mₛ` and `c = cₛ + φ·mₛ` with at most one link
   per child, so the derived pair is the declared one by construction,
   and one rule serves both tables. Answer 10's check is settled so.
   The first draft read a primitive's row from its `rates`, and the
   cold reading showed that it gave no new number. `rates` feeds the
   chain line and the builder's oracle. *Rejected:* two rules, one per
   kind of node.
7. **`timing` is committed as a build and as a deployment**, and holds
   the frames table's cases too (answer 16). *Why:* the answer wants the
   writer's output wherever sections must agree. A nonzero `τₖ` reaches a
   schedule row only through a deployment. A `Relative` entry beneath a
   rate scope needs the node's `timing`, its `rates` and the scope rows
   to agree, and no fixture has one. At `Δt_base = :derive` the
   deployment also has a row that splits frames and a warning of its own,
   so neither needs an inline copy. *Rejected:* `timing` as a build
   alone, with an inline copy for `Φₖ`, which answer 16 already rejects.
   The candidate in `probe_timing_chain.jl` shows that the cases fit in
   one model of six primitives. Answer 10's example is its
   `fast/outer/hold`, so the brief keeps that part as built.
8. **`approach_deployment` is built at `Δt_frame = 1//200`** (answer
   16), the frame the examples' own tests run it at. The answer named
   none.
9. **The chart's threshold counts frame tops as well as base ticks**
   (answer 11). *Why:* a frame far finer than the base tick, and not a
   divisor of it, puts thousands of lines in a span of a few base ticks.
   `show`'s guard counts columns of the exact unit, which bounds both.
   *Rejected:* the threshold on base ticks alone.
10. **The steps and the split rule follow `show(::Deployment)`** (answer
    9): the upper count is never below the lower, a row splits frames
    unless `Δt_frame` divides both `D·Δt_base` and `Φ·Δt_base`, and the
    count is then "per unsplit frame". The answer left these unstated.
11. **A root input's mark stays the tab's alone in increment 10**
    (answer 14). Its tag and its pin's pane show none. *Why:* the answer
    ruled the tab and was silent on the rest. The smallest reading builds
    what was ruled. `pending.md` holds the question. *Rejected:* a mark
    on the tag and in the pane now, a drawing nobody designed.
12. **The parents take the facts the record changed**: `workspace.md`
    answers 4, 6 and 10, `descriptor_design.md` answers 4, 7 and 9,
    `build_release.md` answer 7 and the glossary's "Frames table". `descriptor_design.md` answer 7 had
    never taken `pinned_by`, and answer 4 had no `rates`.

## What the reading found without a ruling

Facts the record now states, each from the core as pinned.

- The parity clause names each row's exact seconds and the chart over
  the joint period (answer 1, the core's `121da1a`).
- `Period` and `Hz` are retired, and `Absolute(Δt, τ)` takes bare exact
  numbers (answer 3, D-469). The record's two pending questions are the
  core's D-469 and D-465.
- A proposing method always carries `h_min` (answer 4, D-460).
- The schedule's `rows` stand in walk order and its `scopes` in the
  order of `structure.scopes` (answer 5, the core's `7388e28`). The page
  joins by path and relies on neither.
- A prime's row can carry `unfactored`, and a deployment's comparison
  with the coarsest admissible base tick has `show`'s form (answer 6,
  D-467 and D-471).
- A deployment with no discrete primitive has no rows, no hyperperiod
  and no chart (answer 8).
- An `AbstractFloat` entry pins, verified by running in the core's
  descriptor increment (answer 14).
- The figures of answer 16's table hold on the scratch files. The
  examples in answers 4, 5, 6 and 7 match the schema, and answer 14's
  example is now `closed_loop`'s own row.

## The core's items the pending bullet named

- **D-469.** Stated in answer 3.
- **D-471 and the commits after it.** Stated in answers 1, 5, 6, 9 and
  11. The page's chart keeps its own rows, pitch and threshold.
- **D-477's diagnostic kind.** `IllegalWireEntry` is thrown inside the
  walk, so its failure carries no structure and shows as a list, which
  `failure_structure` already covers. The page keys nothing on a
  diagnostic's kind. The record needs no word on it.
- **A schedule row's float `Δt`.** The descriptor carries no float, and
  answer 5 now says that the page computes both seconds as exact
  fractions and never as a product of floats. The item does not reach
  the page.

## Findings on the core

None requires a change for the implementation to be built right.

- **The `@ref` pass rewrites nothing until the export audit.** Absorbed
  by ruling 1. The core's `pending.md` already holds both things that
  wait on the audit.
- **One `T₁` is left in the core's §9.2**, in the worked example under
  the binding table: "`D₁ = T₁/Δt_base`". D-464 writes it `Δt₁`. Owed to
  the core, one symbol.
- **A reader cannot tell an older file by its header.** By design until
  the first release (D-467). Absorbed by ruling 4.
- **A rate scope's own entry is not carried**, the chain standing on
  primitives alone. The page derives it exactly, and `show` prints no
  chain for a scope, so nothing is owed.

## Readings for the prototype to show both ways

The implementation's prototype shows the user both alternatives of
rulings 1, 2 and 3.

## What the candidate `timing` shows

From `probe_timing_chain.jl`, for the brief. Six primitives, two
anchors, three rate scopes.

- `staggered = Absolute(1//10, 1//300)` beside `fast = Absolute(1//50)`.
  The coarsest admissible base tick is `1/300`. The pool has three
  entries, the offset with factor 6 and the alternatives `0` and `1/50`.
- Under `fast`, `outer = Relative(2, 1)`. Under `fast/outer`,
  `hold = Relative(3, 1)` at `m = 6`, `c = 3`, `same = Relative(1)`, and
  the assembly `deep = Relative(2, 1)` at `m = 4`, `c = 3`, whose derived
  pair is `(4 / 2, (3 − 1) / 2)`.
- `ref` is pinned by declaration through a continuous consumer with a
  `Pinned` entry, and `u` by tier through five consumers.
- At `Δt_frame = 1//100` and `Δt_base = :derive` the base tick is
  `1/300`, a frame is three base ticks, `staggered` is at `(30, 1)` and
  splits frames, the hyperperiod is 360, and the deployment carries one
  `GridUtilization` warning at the root, with a message of ten lines.

## Noticed, not touched

- **`descriptor_design.md` answer 13** still says that the deployment
  envelope's body "holds `build` alone until the overlay's bump". Answer
  2 of that record states the body as it is.
- **`signature` in a live session**, from the pin bump's notes, has no
  `pending.md` bullet. The three items handed to this step did not
  include it.
- **No fixture has a proposing algorithm or an `h_min`.** Answer 16
  serves both by an inline copy, which also needs a `proposes` of true
  and an `h_min` at most half of `h_max`.
- **The `GridUtilization` message has ten lines**, the grid report
  among them. The diagnostics tab shows a message whole today.

## Bookkeeping

- `design/deployment_overlay.md`: answers 1 to 6, 8 to 12 and 14 to 17,
  and the "Pending questions" paragraph.
- `design/workspace.md` answers 4, 6 and 10, `design/descriptor_design.md`
  answers 4, 7 and 9, `design/build_release.md` answer 7,
  `design/glossary.md`'s "Frames table".
- `design/roadmap.md`: increment 10's list loses what the bump took and
  takes what this step ruled, and the entry records both landings.
- `design/pending.md`: the first bullet retires this step and takes the
  stage reached, "Format changes still open" loses the rate chain, and
  two open items join the unordered list.
- No rule, map entry or code changes.

## The cold reading

One high-tier agent read the amended record on 2026-11-23, before the
commit, against the pinned spec, the schema, the writer, `show`, the
fixtures and the scratch files, with probes of its own in the session's
scratch folder. Its verdict: safe to build from once its corrections
land, and no core change needed. It confirmed every figure of answer 16,
of the roadmap's entry and of the `pending.md` bullet. It judged every
ruling sound, five with a caveat. Its findings, as adjudicated:

- **`build_release.md` answer 7 still gave the old link rule**, and
  answer 15 amended a roadmap ruling that is gone. Both fixed.
- **Answer 10's example mixed two components and matched no fixture.**
  It is now `timing_deployment`'s `fast/outer/hold`, with its chain.
- **Answer 3 still called a component's `τ` the page's coinage.** Fixed.
  The glossary's entry for it is left, though the core now defines the
  term; retiring it is the user's call.
- **Answer 2's refusal cited words the loader does not use.** Restated,
  with `grid` checked first.
- **Answer 11 was silent on a base tick of several frames and on the
  pitch of a frame finer than a tick.** Both ruled.
- **Answers 6 and 9**: a grid with no primes, one line or two on the
  coarsest tick for a deployment, and the scopes' key column. Ruled.
- **Answer 16**: the proposing inline copy edits two fields, and no
  fixture exercised the scope derivation's division. `timing` gains a
  nested scope beneath `outer = Relative(2, 1)`.
- **`descriptor_design.md` answer 4's example had no `rates`.** Added.
  Answer 9's title, "the chain later", is left.
- **Answer 17's note stood after its Why**, and its text gave the old
  numbers. Fixed, a fifteenth answer.
- **The `2^53` item named the anchors alone.** Widened on `pending.md`.
- **A deployment warning's marks beyond the tab.** One sentence in
  answer 4.
- **Its smaller alternative for answer 10**, one derivation for both
  kinds of node, is taken as ruling 6.

Left open, each small: the frames table's wording of the root's ticks
beyond "base ticks", and whether overlay answers 5 and 14 should say
that they amend `descriptor_design.md` answers 4 and 7, whose notes
cite them. The fixes after the reading were not read cold again.
