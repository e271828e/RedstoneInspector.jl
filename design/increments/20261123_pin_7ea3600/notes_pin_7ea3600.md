# The pin to the core's `7ea3600`, notes

The first of increment 10's three steps, from the first bullet of
`design/pending.md` at `47f8ed9`. The pin moves from the core's `6afd6fb`
to its tip `7ea360094d89f658fe3d3e0909be1af6fa4f5365`, 107 commits on.
The bump follows the core's D-464, D-466, D-467, D-468, D-469 and D-472
in the fixture script, the suite, the fixtures, the schema copy and the
page's readers. It draws nothing new.

The user was away on the night of 2026-11-23 and delegated the calls
the rules put to them. One agent owned the step. It prototyped in the
worktree `~/.julia/dev/RedstoneInspector.jl-worktrees/pin_bump`, branch
`pin-bump`, from `47f8ed9`, and landed the patch on `master`. The
prototype is the implementation, so this file is the record and there
is no brief. The look's captures, its tools and the probe are in
`~/.julia/dev/RedstoneInspector.jl-worktrees/pin_bump_look/`.

## The user's rulings

Made on 2026-11-22, before leaving.

1. **The target is the core's tip, `7ea3600`.** It is pushed, and its
   four workflows were green on 2026-11-22.
2. **The step commits on `master`, unpushed.**
3. **The bump stays minimal.** It regenerates the existing fixtures,
   rebuilds `descent` in the script and answers the two checks of
   `deployment_overlay.md` answer 16. The three new deployments and the
   synthetic `timing` wait for the implementation. An item of the
   roadmap's list for increment 10 is taken only where an existing
   feature breaks without it.
4. **The closing look is the agent's, by screenshots** of each existing
   tab before and after. The user's own look is owed and blocks nothing.
5. **A finding that the core must change ends the run.**
6. **The pipeline's cold review applies.**

## The owner's rulings

Each was the user's to make by the rules and was delegated.

1. **One agent built the step, with no prototyper of its own.** The
   bump is one builder's run: two revisions, eight calls, two imports,
   six readers of one key and the tests that follow the fixtures. A
   second agent would have cost a handoff in each direction. The cold
   review went to an independent high-tier agent. *Rejected:* a
   high-tier prototyper under a coordinator that only adjudicates,
   which the pipeline prescribes for an increment.
2. **`descent` is built in `scripts/fixtures.jl` with qualified
   names**, `Redstone.Group`, `RedstoneExamples.Longitudinal`,
   `RedstoneExamples.GroundContact` and `Redstone.Library.StopRequest`.
   The descriptor's `signature` is display text as the REPL prints it
   (the core's §13.9, D-433), and a type name imported into `Main`
   prints bare. The first prototype imported the four names and every
   fixture built in `Main` lost its qualifiers, `aircraft` and
   `closed_loop` among them. *Rejected:* the imports, which strip the
   module from every signature that names one of the four types, for
   no reason of the core's; the model in `scripts/synthetic.jl`, whose
   module would need the examples.
3. **The page reads the anchor's period under `dt`** at its six
   readers, and keeps its own words: the local `T`, the `AnchorRow`
   field `T`, the heading "T" and the phrases "T 1/50 s". *Why:* the
   key is the core's (D-464) and the generated type no longer has `T`,
   so the checker refused the six readers and 20 unit tests failed on
   them. The words are the notation, which is the implementation's (the
   record's answers 3 and 9). *Rejected:* the notation now.
4. **The timing tab's sentence on a deployment is rewritten**, to "This
   page does not draw a deployment's schedule rows and hyperperiod
   chart yet." The old one said that the deployment carries no schedule
   and that format 1.0 holds the build alone. Both are false of every
   deployment the new core writes, and the tab is an existing feature
   on a regenerated fixture. The sentence stays a note, and the
   implementation replaces it with the rows and the chart (the record's
   answers 2 and 9). *Rejected:* the false sentence left for one more
   commit; the sentence dropped, which changes what the tab holds.
5. **The docstring check moves to `Freeze`'s `Pinned`.** It pinned the
   pending note's case, a bare link from `Redstone.Library` to a name of
   `Redstone`, joined to the wrong module, on `Group`'s `local_wires`.
   `Group` is now in `Redstone` (D-472), which owns the names its bare
   links spell.
   `library` keeps four links of that case: `Freeze`'s and `Fn`'s
   `Pinned`, and `StopRequest`'s `StopFlag` and `stop_reason`. *Rejected:*
   the check kept on `Group` with the link that now resolves, which
   drops the case the test's name states.
6. **The inline structures take the schema's new required fields and
   nothing else**: `rates: []` on a primitive, `pinned_by: []` on a root
   input, `grid: { pool: [], primes: [] }` on a structure. The checker
   asked for each. No check reads them.
7. **The loader's refusal of a deployment without `schedule` is not
   taken.** No existing feature breaks without it. It stays on the
   roadmap's list.
8. **`detail.ts`'s comment on a root input's `pinned` is corrected.**
   It said that the format writes false whatever the model declares,
   which D-468 ended. The pane still shows no pin on a root input, and
   the comment now points at the record's answer 14.
9. **The roadmap is not touched.** The second step strikes from its
   list what this one took, and writes the landing there.
10. **The fixes of the cold review are the owner's to land**, as one
    commit, with the reviewer checking the delta. *Rejected:* a
    separate fixer, for findings of this size.
11. **A deployment's own `warnings` are not read by the bump.** The
    review found that the diagnostics tab lists the build's warnings
    and drops the deployment's, which the format now carries. No
    committed fixture has one, the old core wrote none, and the record
    gives them no place on the page, so reading them is new behavior
    and goes to the second step. *Rejected:* the one reader line now,
    with an inline copy to test it.
12. **`pending.md` takes the review's open items on the second step's
    bullet**, and the key `dt` on the bullet about a rational part past
    `2^53`. The other bullets stay as they are, the second step
    reading them against the pin.

## The shape built

- `Project.toml`, `scripts/Project.toml`: both revisions.
- `scripts/fixtures.jl`: `descent` leaves the import list and is built
  above the first `mkpath`, with the comment on the qualified names.
- `scripts/synthetic.jl`: seven `Absolute(Hz(n))` become
  `Absolute(1//n)`, `Hz` leaves the import list, and `Group` moves from
  the `Redstone.Library` list to the `Redstone` one.
- `test/runtests.jl`: one `Absolute(Hz(50))`, and `Group` joins the
  `Redstone` list in `Hz`'s place.
- `frontend/fixtures/`: 15 of the 16 regenerated. `failure_structure`
  carries no structure and is unchanged. The total grows from 912,676
  to 988,119 bytes.
- `frontend/schema/descriptor.json`: the core's copy at the pin.
- `frontend/src/lib/analysis.ts`, `detail.ts`, `rates.ts`: two readers
  each of `dt`; `analysis.ts` also the sentence of ruling 4, and
  `detail.ts` the comment of ruling 8.
- Eleven unit test files and three browser check files, below.

## Measurements

| | at `47f8ed9` | at the pin |
|---|---|---|
| the Julia gate | 128 passed | 128 passed |
| the fixtures' drift check | clean | clean |
| `npm test` | 526 passed in 29 files | 526 passed in 29 files |
| `npm run check` | 0 errors, 399 files | 0 errors, 399 files |
| `npm run e2e`, both browsers | 500 passed, 4 skipped | 500 passed, 4 skipped |

With the pin and the fixtures alone, before any change under
`frontend/src`, the checker reported 23 errors and 26 unit tests failed.
With the six readers changed, 6 failed: three on the inline anchor's
key, two on `Group`'s name and one on the count of `b` hits.

## What the tests pin

No test is new. Each change to the source has a unit test that turns
red when it is reverted alone, the reader with a cast so that the file
still compiles:

| reverted alone | red |
|---|---|
| `anchorRows` reading `T` | 3 in `analysis.test.ts`, "puts the base grid first, then closed_loop's 10 anchors at 1/50 s" among them |
| `analysis.ts`'s `period` reading `T` | 4 in `analysis.test.ts`, the three of `componentRows` among them |
| `timingPhrase` reading `T` | 4 in `detail.test.ts`, "rates' fast/outer/hold hangs from anchor fast at m 2, T 1/50" among them |
| `ratePhrase` reading `T` | 5 in `detail.test.ts`, "a non-zero tau joins the anchor's T" among them |
| `rates.ts`'s `period` reading `T` | 17: 9 in `rates.test.ts`, 4 in `analysis.test.ts`, 2 in `focus.test.ts`, 1 each in `palette.test.ts` and `session.test.ts` |
| `tripleTitle` reading `T` | 7 across `rates.test.ts` and `analysis.test.ts` |
| the old sentence on a deployment | 1, `scheduleNote`'s |

The rewritten pins:

- `detail.test.ts`, `diagnostics.test.ts` and `e2e/detail.spec.ts`
  spell `Redstone.Group`.
- `docstring.test.ts` by ruling 5.
- `search.test.ts` and `e2e/search.spec.ts`: `b` on `large` finds 170
  nodes, where it found 171. The root matched through its type alone,
  on the `b` of `Library`.
- `analysis.test.ts` and `e2e/analysis.spec.ts`, two places: the new
  sentence.
- Seven unit test files by ruling 6, `detail.test.ts` also the inline
  anchor's `dt`.

The fixtures' drift check pins the script: a change to `descent` or to
an `Absolute` call changes a committed file.

## The two checks of `deployment_overlay.md` answer 16

The probe is `pin_bump_look/probes/answer16_checks.jl`, its output
beside it.

1. **`closed_loop`'s `h_ref` is pinned by tier.** Its row reads `pinned`
   true and `pinned_by` `pid_controller/h_ctl`, port `r`. That consumer
   is a `DiscretePID` on the discrete tier, and its own face `r` is not
   pinned. `show(::Structure)` prints "pinned by tier" on the route.
   `V_ref` is pinned the same way by `pid_controller/V_ctl`, port `r`,
   so the tab gets two pinned root inputs at once. `mode`, a `Bool`, is
   not pinned.
2. **A pool entry carries `alternatives` when it is an offset that
   alone refines the grid**: a nonzero `τ` whose leave-one-out factor
   is above 1 (`_grid_report`, `Redstone.jl/src/structure.jl`). It is
   cheap to provoke. `Absolute(1//10, 1//300)` beside `Absolute(1//50)`
   gives the offset a factor of 6 and the alternatives `0` and `1/50`.
   At `Absolute(1//50, 1//300)` the upper neighbour reaches the period
   and only `0` is offered. Two anchors with the same offset `1//300`
   give each a factor of 1 and no alternatives, since neither alone
   refines. So the case stays in `timing` and needs no `pending.md`
   entry.

## What the regenerated fixtures show

For the second step, which reads the record against them.

- **Every body gains its sections.** A build body has `events`; a
  structure has `grid`; a primitive node has `rates`; a root input has
  `pinned_by`; a deployment body has the flat fields of answer 4. A
  failure's structure has `grid`, `rates` and `pinned_by` too.
- **`rates` is on the node**, the chain of `sample_times` links,
  outermost first (D-467 as amended on 2026-11-20). `rates`'
  `fast/outer/hold` has two links, the root's `fast` as `dt` and `tau`
  and `fast`'s `outer` as `K` and `phi`. `library`'s `d_limited` and
  `d_pid` each have one `Relative` link at the root, which no scope row
  shows. The record's answer 5 says a row has no chain "whose home
  would be the node", and `pending.md`'s "Format changes still open"
  still lists the chain as wanted only if answer 10's check fails.
- **Pinned root inputs**: `closed_loop` and its deployment have two,
  `large` four, `u1` to `u4`, and `failure_cycle` and `failure_nested`
  one each, `ref`. All are by tier. No committed fixture has one by
  declaration.
- **Events**: `descent`'s `gear` declares `touchdown`, localized, with
  the bundle `m`, `u`, `y`, `t`, so a committed fixture already holds
  the examples' one event. `library` has six declaring primitives and
  14 events, all localized. `state_events` is located on six of
  `library`'s `types` rows and on `GroundContact`'s in `descent`.
- **The grid report**: `closed_loop`'s admissible base tick is 1/50,
  from ten period entries of factor 1. `rates` and `library` each have
  two entries, the 1/50 one with factor 5. `large` has 43. No fixture
  has an offset entry, so none has `alternatives`.
- **`closed_loop_deployment`**: `dt_frame`, `dt_base` and `h_max` are
  1/100, there is no `h_min`, the algorithm is `RK4()` and does not
  propose, the budgets are 4, 1e-6, 8 and 7, and the schedule has ten
  anchors and ten rows at `D` 2, `phi` 0, and no scopes.
- **The docstrings**: the `@ref` pass rewrote none of the 132 bare
  links of `library`'s and `closed_loop`'s `types` rows, the core
  exporting nothing (the record's answer 15, as amended). `library` has
  101 bare links, 97 to a name of the row's own module and four from
  `Redstone.Library` to `Redstone`, those of ruling 5. `Group`'s five
  now join to the right module, its row being `Redstone.Group`.
- **`Group`'s `types` row** locates its five accessors in the core's
  `assembly.jl`, and its docstring is rewritten.
- **Two failure messages changed.** `failure_cycle`'s and
  `failure_nested`'s `AlgebraicCycle` messages take the core's new
  wording (its `a6b5da5`).
- **One closure's name changed**: the `f` of `closed_loop`'s
  `lqr_controller/engaged` prints as `#28`, where it printed as `#17`.
  The name also stands in three signatures of each of `closed_loop`
  and its deployment, the root's, `lqr_controller`'s and `engaged`'s.
- **A deployment's own warnings** stand under `deployment.warnings`,
  empty in `closed_loop_deployment`. `Δt_base = :derive` over anchors
  at 1/10 and 1/15 writes a `GridUtilization` there, by the reviewer's
  probe.

## The look

The owner's, by captures, with the user's own look owed. The folder's
`README.md` is the index. Each of the 16 fixtures was captured in
Chromium before the bump and after it: the root canvas in both color
modes and with the labels and badges on, the pane on four selections,
and the drawer's four tabs, each tab also as its whole text. A second
capture of the after build gives the noise: five screenshots differ
between two runs of one build, by 2 to 77 pixels.

207 of 358 files are the same byte for byte. The 151 that differ do so
in six ways the bump explains and one it does not need to:

1. The pane's type reads `Redstone.Group` on every `Group` (D-472).
2. The pane's locations change path and line on every type of the core
   or the examples, `Group`'s to `assembly.jl`.
3. The locations gain a `state_events` row on the six `library`
   components that declare events and on `descent`'s `gear` (D-467).
4. The timing tab's last sentence on `closed_loop_deployment`, by
   ruling 4.
5. The `AlgebraicCycle` message on `failure_cycle` and `failure_nested`
   (the core's `a6b5da5`).
6. The parameter `f` of `closed_loop`'s `lqr_controller/engaged` reads
   `#28`.
7. A few pixels on a pin's outline or the toolbar in three screenshots,
   the noise above.

Nothing else differs. The canvas is the same pixel for pixel in both
color modes outside the pane and the cycle message. The tree, the
status bar, the legend, the root-inputs tab and the execution-order tab
are the same text on every fixture, and so is the timing tab but for
the sentence. `containers`, `primitive`, `warning` and
`failure_structure` are the same in every file. Of the 105 screenshots
of the browser checks 80 differ, in the same ways and by a tree chevron
caught mid-turn in a shot taken right after a click.

The captures do not open a docstring or a signature, show no child
level in rate colors, run no search and use Chromium alone. The unit
tests and the browser checks cover the readers behind each. `Group`'s
docstring is rewritten in the
core, and its five bare links now join to `Redstone`, the module that
owns the five names. Nothing new is drawn: the
root-inputs tab shows no pinned mark and the timing tab no schedule.

## Noticed, not touched

- **A file of the old core breaks the page.** A build or a failure
  written before the pin has anchors under `T`. The loader accepts it,
  the format being 1.0 in both, and the readers then throw on the
  missing `dt`. The reviewer dropped the old `rates.json`: the canvas
  draws, the rate colors do not switch on, the timing tab is empty and
  the console holds the error. Answer 2's refusal covers a deployment without
  `schedule` alone. A refusal on a structure without `grid` would cover
  all three kinds.
- **`signature` depends on the session.** In a live session a user who
  imports a component's name gets it bare in `signature`, as ruling 2
  found. The pane shows the signature when it differs from the type,
  so it then shows on every such node. The core rules the text as
  display text (D-433), so this is the page's to weigh.
- **`pending.md`'s "Format changes still open"** lists the rate chain
  as open, and the core now carries it.
- **The docstring check of ruling 5** pins the joining of a bare name
  to the row's module, which the record's answer 15 retires. The
  implementation inverts it.
- **`frontend/MAP.md`** needed no change: the bump adds no file, no
  selector and no key.

## Bookkeeping

- `design/pending.md`: the three "Unordered" bullets on `descent()`, on
  `Period` and `Hz` and on `Group` retire. The first bullet loses the
  pin bump's step and takes the stage reached.
- The roadmap's list for increment 10, for the second step to strike:
  the schema copy, and `descent` rebuilt in the script. The list does
  not name the key `dt` or the tab's sentence, which the bump also
  took, from the record's answers 5 and 2.
- No record is amended. No rule or map entry is added.

## Out of scope

The record at the new pin and the roadmap, the second step's. The three
new deployments, `timing`, the notation, the frames table, the chart,
the legend, the root-inputs tab's pinned mark and the link rule, the
implementation's. The core, which is read only.

## The cold review

One independent high-tier agent, over the commits above `47f8ed9`, in a
worktree of its own. It runs the whole gate on Julia 1.13 and
regenerates the fixtures. It looks for a reader of the descriptor that
the bump missed, by listing what the core changed between the two pins
and grepping the page for each. It checks that every difference in a
fixture follows from a core commit, reverts each source change alone,
repeats the two checks of answer 16 from the core's code, and reads the
captures against the look's index. An empty review is acceptable.

## The review's record

One high-tier agent reviewed `3dd015e`, `5a37bce` and `9e2603b` on
2026-11-23, in a worktree of its own. Its gate was green at the same
counts. It found no reader the bump broke, and one new field with no
reader yet, a deployment's own warnings. It traced every fixture
difference to a core commit or to the script. It confirmed the notes'
figures but two it did not check: the measurements' column at
`47f8ed9`, and the 6 failures with the readers changed. All seven
mutants turned a check red, with no survivor. Its
own probe of answer 16's two checks agrees, and adds two cases: one
anchor `Absolute(1//10, 1//30)` alone has an offset of factor 3 with
the alternative `0`, and `Absolute(1//10, 1//20)` beside
`Absolute(1//50)` has one of factor 2 with `1/25` and `3/50`.

Nothing was a must-fix. The findings, as adjudicated:

- **A deployment's own warnings never reach the diagnostics tab.** Not
  fixed here, by ruling 11. It goes to the second step.
- **Open items stood in the notes alone.** Fixed by ruling 12, but for
  `signature` in a live session, which stays in these notes: the step's
  scope on `pending.md` was the coordinator's to set.
- **The notes' look said the browser checks' screenshots agree**, where
  80 of 105 differ. Fixed above, with what the captures leave out.
- **The closure's name changes in six signatures too.** Fixed above.
- **The docstring check's name cited a pending note that is gone.** It
  now names the case.
- **`scheduleNote`'s comment** described the old sentence. Fixed.
- **A line of `pending.md` ran to 108 characters.** Rewrapped.
- **The bump's commit message is long and reads ambiguously.** Left,
  since rewording a commit is the user's call.

The reviewer agreed with rulings 1 to 3, 6 and 8 to 10, and with 4, 5
and 7 on these terms: the new sentence comes first in the user's look,
the check's name states its case, and the old file's gap is handed on.
It checked the fixes' delta at `974b255` and closed every finding.
