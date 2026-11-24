# The pin to the core's `fcd3660`, notes

The bump to the core's timing notation (its D-478 and D-479), from the
first bullet of `design/pending.md` at `9e75f39`. The pin moves from the
core's `7ea3600` to `fcd3660618da4290696f49b0085831e50fc6cbba`, 15 commits
on. The core's increment is
`Redstone.jl/design/increments/20261124_timing_notation/notes_timing_notation.md`.

The user was away on 2026-11-24 and asked for the bump to be applied
without them, with the findings and the decisions recorded for a later
review. One session owned the step and built it in the worktree
`~/.julia/dev/RedstoneInspector.jl-worktrees/pin_fcd3660`, branch
`pin-fcd3660`, from `9e75f39`. The prototype is the implementation, so this
file is the record and there is no brief. Nothing is merged or pushed. The
look's captures are in `../RedstoneInspector.jl-worktrees/pin_fcd3660_look/`,
local to one machine.

## Rulings

The session's, each open to the user.

1. **The target is the tip of the core's GitHub master**, with its four
   workflows green. The core's local `master` is 22 commits ahead, unpushed,
   so nothing there can be pinned. Those commits touch docstrings and
   comments in `src/`, no descriptor code.
2. **The branch is left unmerged**, by `AGENTS.md`'s "the user merges it".
   The last bump committed on `master` by a ruling of the user's that named
   that run alone.
3. **One session built the step, with no prototyper**, as the last bump
   did. The cold review went to an independent agent.
4. **Every symbol follows D-478 as `show` prints it.** The heads are
   `anchor`, `Δt`, `τ`, `D₀`, `Φ₀` on the anchors and `anchor`, `Dₐ`, `Φₐ`,
   `D₀`, `Φ₀`, `Δt`, `τ` on the scopes and the components, `show`'s own. The
   pane's scope row reads `Dₛ` and `Φₛ`, as the core's §6.3 table does. The
   head `k` became `anchor`, since D-479 gives `k` to the frames.
5. **The grid report names its entries `Δt(A₂)` and `τ(A₁)`**, where it
   had `Δt₂` and `τ₁`. D-478 gives the seconds pair no subscript and names
   its node in an argument, and the line is prose, with no row to name the
   node. The key still follows, so a prime's row reads `Δt(A₂) (fast)`.
   *Rejected:* `A₂'s Δt`, words where answer 3 wants a symbol.
6. **An anchor reads `A₁ (key)` on the help page**, where it had
   `Aₖ (key)`. D-478 writes a generic anchor as the node `a`, and a printed
   one by its number.
7. **The help page's notation table goes from nine rows to seven.** The
   anchors' own two rows go, since the base grid's pair and the seconds pair
   are now one symbol each for a component and an anchor, and the argument
   tells them apart. The lead gains three sentences on the subscript and the
   argument. The law keeps its four lines, with the arguments `i` and `a`.
   *Not taken:* D-478's one generic law over `i`, `j` and `k`, which would
   also cover the rate scope's pair. It is the user's to weigh at a look.
8. **The triple's positions are unchanged**, so its key `"2,6,3"`, its
   palette and its focus are too. Only the tuple's labels changed.
9. **A record's row of two lattices names each field by its lattice**,
   `Da`, `phia`, `D0`, `phi0`, on `TimingRow` and in the table cells'
   classes. A row of one lattice keeps the bare `D` and `phi`, as D-478 lets
   a field do, so the schedule's and the chart's rows are untouched.
10. **The chart's base tick index is `n`, D-479's**, in its code, its
    comments and the attribute `data-n`, and the frame tops keep `j`.
    A local `k` that indexes anything else stays.
11. **The loader's refusal is not extended.** See the first finding.

## The shape built

- `Project.toml`, `scripts/Project.toml`: both revisions.
- `frontend/fixtures/`: 20 of the 21 regenerated. `failure_structure` has no
  structure. 1,378,469 bytes become 1,379,218. Compared as values, with the
  renamed keys mapped back, they differ in two ways: the package paths in
  the locations, whose line numbers hold, and the message of
  `timing_deployment`'s `GridUtilization`, which reads `at D₀ = 6` and
  `gcd(pool)/Q`.
- `frontend/schema/descriptor.json`: the core's copy at the pin, byte for
  byte.
- `src/lib/timing.ts`, `rates.ts`, `focus.ts`: the reads and the symbols.
- `src/lib/help.ts`, `src/frame/Help.svelte`: the notation, the law, the
  legend's term and its sample, the vocabulary's row on the triple.
- `src/frame/tabs/Timing.svelte`, `Chart.svelte`: the heads, the cells'
  classes, `data-n`.
- `src/canvas/Canvas.svelte`: one comment.
- `frontend/MAP.md`: the triple, the legend, the two rows of the DOM
  contract.
- The unit tests of seven files and the browser checks of seven.
- The records: `deployment_overlay.md` answers 2, 3, 5, 8, 9, 10, 11, 13, 16
  and 17, `descriptor_design.md` answers 4, 9 and 13, `workspace.md` answers
  6 and 7, `visual_grammar.md` answer 6, `glossary.md` (the component's `τ`
  deleted, two entries reworded), one trap of `rules.md`.
- The tools of increment 10 and of the last bump, adapted in place, and
  `tools/` beside this file.

## Measurements

| | at `9e75f39` | at the pin |
|---|---|---|
| the Julia gate | 128 passed | 128 passed |
| `npm test` | 611 passed in 30 files | 611 passed in 30 files |
| `npm run check` | 0 errors, 405 files | 0 errors, 405 files |
| `npm run e2e`, both browsers | 620 passed, 4 skipped | 620 passed, 4 skipped |

With the pin and the fixtures alone the checker reported 37 errors in 9
files and 50 unit tests failed in 6.

- **The oracle** (`../inspector_10_deployment_overlay/tools/`): 589 checks
  against the core's own `show` at the pin, none failed. 22 are new, on the
  heads of `show`'s tables.
- **The look's reading**: 2037 facts over the 21 fixtures, none disagreeing
  with the modules.

## What the tests pin

37 mutants, `tools/mutants.py`, each a change of the bump reverted or a pair
of counts swapped, on a scratch copy. All are killed. Four survived at
first. Three were prose of the help page, and `help.spec.ts` now checks that
no retired letter stands in a code span of the page and no backquote in its
text. The fourth is older than the bump, the legend's `Φ₀` on an anchor with
`D₀` above 1, and `timing.test.ts` now pins it on `timing_deployment`.

## The look

By captures, the user's own look owed. `capture.mjs` ran on the build before
and the build after, with the pane's sections open. 292 of 471 files are the
same byte for byte, and 179 differ. Captures of the after build differ from
each other in 4 or 5 screenshots, all of the labels and the order badges, by
10 to 197 pixels, which is the noise. Line by line, every difference in a
text but the help page's is a symbol, a head, a package path or the one
message. No page error in either run.

To look at, each judged acceptable here:

- The subscripts are small at the legend's 11 px. `ₛ`, `ₐ` and `₀` differ
  in shape, and the row or the line says which is meant.
- The pane at 240 px breaks `Φ₀ = 18` after its equals sign, where
  `Φ = 18` stood on one line. It does not scroll sideways.
- `Δt(A₁) (noise), Δt(A₂) (h_ctl)` in `closed_loop`'s prime rows is longer
  and has two pairs of parentheses per entry.

## Findings

1. **A file of the last pin breaks the page.** A build or a deployment the
   core wrote between `7ea3600` and the rename has `grid`, so the loader
   accepts it, and its timings have `m` and `c`. Dropped, the canvas draws,
   and rate mode and the timing tab throw "Cannot convert undefined to a
   BigInt" (`tools/old_file.mjs` on `9e75f39`'s `rates.json` and
   `rates_deployment.json`). Answer 2 says the page refuses an older file.
   The change is small, a third check in `loader.ts` beside the two there:

   ```ts
   const timing = structure?.nodes.find((n) => n.class === "primitive")?.timing;
   if (timing && !("D" in timing)) return older(`${at}.nodes[].timing.D`);
   ```

   It is a ruling on what the page refuses, so it is proposed and not made.
   `pending.md` has its bullet.
2. **`frontend/MAP.md` is still 759 lines**, past its 700, and the bump
   did not lengthen it.
3. **A mutant runner must read a missing count as no run.** The first run of
   the browser mutants printed 13 survivors, because the scratch copy lacked
   `MAP.md`, which `help.spec.ts` reads, and Playwright ran nothing.
   `tools/mutants.py` says `NO RUN`.
4. **The retired word trap bit again.** "A table leaves it out" on the help
   page turned the check on "leaf" red. The trap's bullet in `rules.md`
   covers it.

## Bookkeeping

- `pending.md`: the first bullet carries the stage, and retires when the
  user merges. A new bullet under "Unordered" holds finding 1.
- `roadmap.md`: not touched, nothing having landed. The landing's facts go
  to increment 10's entry at the merge.

## Out of scope

The core, read only. The loader's refusal. Increment 10b. The generic law on
the help page.

## The cold review

One independent high-tier agent, over the commit above `9e75f39`, in a
worktree of its own, by `Redstone.jl/design/rules/increment_rules.md`
step 5. It runs the whole gate, regenerates the fixtures, looks for a reader
or a printed letter the bump missed, checks that every symbol is the core's
D-478 and D-479, reverts changes alone, and reads the amended records
against the code. An empty review is acceptable.

## The review's record

Filled after the review.
