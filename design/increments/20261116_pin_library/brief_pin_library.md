# Brief: the pin to the core's `6afd6fb`

The first bullet of `pending.md`'s work order as it stood at `bfb622e`:
the pin on the core moves from `035aa95` to `6afd6fb`, the core's pushed
`origin/master`, with the core's class value `"primitive"`, its module
`Redstone.Library` and its `Δt_frame`. The user widened it on 2026-11-16
to one vocabulary: "leaf" for a primitive node and "block" for a library
component leave the code, the records and the synthetic models.

Drafted on 2026-11-16 at `bfb622e`. One high-tier agent prototyped the
whole arc in the worktree `~/.julia/dev/RedstoneInspector_pin` on the
branch `pin-library`, two commits:

- `23fd23b`, the docs: the records and `frontend/MAP.md`.
- `6b03039`, the code: the pin, the fixtures, the schema copy, the code,
  the tests, the README and `scripts/synthetic.jl`.

The prototype is the implementation. There is no patch file: the branch
is reviewed, fixed on the branch, and merged by the user. The rulings and
the coordinator's adjudications are in `notes_pin_library.md` beside this
brief.

Not normative: if a shape below proves wrong at the keyboard, stop and
report rather than deviate.

## What is settled

- **The target.** `6afd6fb` is the core's pushed tip. Its local `b37c018`
  is an unpushed docs commit, out of reach of a `[sources]` revision.
- **The core's side is ruled.** D-453 is ratified. The schema changes by
  the rename alone, with no format bump: the class value, `PrimitiveNode`,
  `PrimitiveFace`, and five description strings. `Deployment` and
  `Simulation` take `Δt_frame` (D-443).
- **The user's rulings**, each with its reason in the notes:
  1. The frontend's code says "primitive" as the descriptor does: the
     internal types, the identifiers and tags, the DOM contract, the tests
     and the whole map.
  2. The records' format facts are amended in place, each with one dated
     note, under `design/rules.md`'s "Amending a record". The bullet's
     "rule on frozen records" exists in neither repo.
  3. The fixtures' content beyond the rename is accepted, with the two
     tests that pin the Integrator row's link counts following it.
  4. The library's seven new components and their icons head the work
     order.
  5. The prose sweep joins this pin, classified by mid-tier agents.
  6. The sweep erases the old words with no amendment note, a one-off
     bend of "Amending a record". The notes file is the trace.

## The shape built

**The pin** (`6b03039`).
- Both `[sources]` revisions read `6afd6fbba48936dab895f342d2587729e925cfa9`.
- The six construction sites read `Δt_frame =`: `README.md` twice,
  `test/test_server.jl`, `test/runtests.jl` and `scripts/fixtures.jl`
  twice.
- `import Redstone.Blocks:` becomes `import Redstone.Library:` in
  `scripts/synthetic.jl` and `test/runtests.jl`, since the module is gone.
- The fixtures, the schema copy and `descriptor.d.ts` are regenerated.

**The frontend** (`6b03039`).
- Every comparison on a node's `class` reads `"primitive"`, and
  `PrimitiveNode` and `PrimitiveFace` replace the old types.
- A child's `role`, a tree row's `class` and the pane's `kind` type
  `"primitive" | "assembly"` and take `n.class` straight through.
- The DOM contract reads `g.block.primitive`, the tree row's `.primitive`
  and `aside.detail[data-kind="primitive"]`. The screenshot `detail-leaf`
  is `detail-primitive`.
- Identifiers and tags follow: `isPrimitive`, `primitiveTriples`,
  `"primitive-output"` and the rest, about 40 sites.
- `icons.ts`'s `LIBRARY` reads `"Redstone.Library."`.
- `help.spec.ts`'s check on the retired words drops `strip()` and its two
  exclusions.
- Comments and test names follow. At `bfb622e`, 268 lines of the
  frontend's code and checks said "leaf" or "leaves". Thirty remain, each
  the verb or a word mention, and none meant a value leaf. The
  classification log of the second pass is `probe/leafsweep.json` in the
  session's scratchpad.

**The synthetic models** (`6b03039`). `ContinuousBlock` and
`DiscreteBlock` become `ContinuousPrimitive` and `DiscretePrimitive`; the
locals `blocks`, `block_names` and `N_BLOCKS` become `components`,
`component_names` and `N_COMPONENTS`; the docstrings say "primitive". The
`large` fixture's node types and two `types` rows follow, as do one
docstring each in `failure_dead` and `failure_probe`.

**The records** (`23fd23b`).
- The format's renames, amended with a dated note:
  `descriptor_design.md` answers 3 and 4, `build_release.md` answers 4
  and 7, `initial_design.md` answer 17.
- The prose sweep, no notes: 54 lines in eight records, from the
  adjudicated list in the notes. What stays: "block" for a box on the
  level; the format notes above; the roadmap's landed entries; "leaf" for
  the type inside `Pinned` and for an opaque value leaf; and every verb,
  code block or word mention.
- `frontend/MAP.md`: no "leaf" left; its DOM rows and vocabulary follow
  the code.

## Readings the prototype took

Every reading went to the user and is ruled above, so none is open. The
fixtures moved beyond the rename in three ways, all from the core:

- The `types` rows' `file` changes by the depot's slug and from
  `src/blocks.jl` to `src/library.jl`, and `line` by the library's growth.
- The library's docstrings were rewritten. They now link
  `g-library-component` and six more glossary ids, all present in the
  core's spec at `6afd6fb`.
- The integrators and `Delay` gained a trailing `Bool` type parameter.
  `iconOf` still reads `Delay`'s `K` as its one integer parameter.

## What the tests pin, by property

No test is added or removed. The existing suites pin the renames:

- `npm run check` pins every reader of `class`, `role` and `kind`. The
  regenerated union against the old internal types gave 95 errors in 19
  files.
- The e2e checks pin the DOM contract through the seven
  `data-kind="primitive"` asserts, and since the review's fix through the
  `.primitive` class on a block and on a tree row.
- `docstring.test.ts` and `detail.spec.ts` pin the Integrator row: 14
  links, 11 of them to the glossary, with `g-library-component` among
  the ids.
- `help.spec.ts`'s check on the retired words runs over `closed_loop`'s
  reader text without its two exclusions. It still skips the docstrings
  and the help page's Simulink column.
- The fixture drift check pins the fixtures to the pinned core.

## Bookkeeping

After the merge, one commit on `master`:

- `pending.md`: the pin's bullet is retired. The stage 1 bullet's "After
  the pin, 10" becomes "Next, 10".
- `roadmap.md`: a dated entry for the pin, with the facts the next briefs
  take: the core at `6afd6fb`, `Redstone.Library`, the `"primitive"`
  class through the DOM contract, `ContinuousPrimitive` and
  `DiscretePrimitive` in `large`, and the records' vocabulary. It also
  gives the API anchor form `Redstone.Library.<name>` and `descriptor`'s
  methods at `src/descriptor.jl:43` to `46`, which the dated list "Facts
  the briefs will cite" gives as of `2072d41`.
- The core's `pending.md` bullet "The inspector, stage 1" lists the three
  changes this pin takes and cites this repo's pin bullet by name. By the
  user's ruling of 2026-11-16, the coordinator cuts that sentence in the
  core after the merge: `git status` checked first, `design/pending.md`
  staged alone, one commit, nothing pushed. Peer sessions work in the
  core.

The icons bullet and this folder land with the brief, before the review.

## Out of scope

- The library's seven new components and their icons: the work order's
  first bullet.
- A bare `@ref` joined to `Redstone.Library` where the name lives in
  `Redstone`, as in `Group`'s `local_wires`: increment 10's qualified
  `@ref` links.
- The schema's record path in the core's `descriptor.json`: its own
  unordered bullet, untouched by this pin.
- The Firefox project: it cannot start in this machine's sandbox. CI runs
  it on the push.

## The cold review

One independent high-tier agent over `bfb622e..pin-library`, in the
worktree, with an open mind; "empty is acceptable". It:

- runs the whole gate as `AGENTS.md` gives it, on Julia 1.13, Chromium
  for the e2e checks;
- reverts single changes on a scratch copy and shows a check goes red: a
  `class === "primitive"` back to `"leaf"`, a `data-kind` back to
  `"leaf"`, the `LIBRARY` prefix, one exclusion restored in
  `help.spec.ts`'s check. A change no check catches is a finding or an
  acceptable survivor named with its reason;
- re-checks the frontend's classification log, and the prose sweep's
  result against the adjudicated list and the five tables, for a row
  changed that should stay or the reverse;
- re-runs the residual diff of the old fixtures against the new and
  confirms every difference is the rename or the core's own change;
- confirms no amendment note was added by the sweep and that ruling 2's
  notes follow `design/rules.md`'s form;
- reads the rewritten record lines for sense and grammar.

No look-and-adjust pass: the page draws nothing new. What a reader sees
changes only where the data does, in the library's docstrings and the
synthetic type names.

## The review's record

One high-tier reviewer ran the gate green on Julia 1.13.3: 128 Julia
tests, a clean fixture drift check, 511 unit tests, 0 checker errors and
230 Chromium checks, with the Firefox configuration listing 230. It ran 16
mutants on a scratch worktree, removed afterwards.

- **F1, a missing test.** No check read the `.primitive` class on
  `g.block` or on a tree row; mapping either back to `leaf` left every
  check green. The gap predates the pin, since no check read `.leaf`
  either. Fixed in `8d44fda`: `tree.spec.ts`'s test on `closed_loop`'s
  rows asserts both classes on `sensing/noise`, red under each mutant.
- **F2, the brief's prose.** Five statements were miscounted or
  overstated: the schema's description strings, the frontend's "leaf"
  counts, the `types` rows' `file`, the `g.block` selectors as a pin, and
  the reach of `help.spec.ts`'s check. Corrected in place above.
- **F3, a sentence false at the pin.** `synthetic.jl`'s `library()`
  docstring and `build_release.md` answer 3 say one instance of every
  shipped component, which the seven new components break. No edit: the
  icons bullet, first in the work order, restores them and now names the
  two lines.
- **F4, the roadmap's dated facts.** The list "Facts the briefs will cite"
  still gives `Redstone.Blocks.Junction` and the old lines of
  `descriptor`'s methods, as of `2072d41`. No edit to the list: the pin's
  roadmap entry gives the current facts.

Survivors accepted:

- **`help.spec.ts`'s exclusions restored.** No page text holds `Blocks.`
  or `blocks.jl` today, so no check can tell the two forms apart; a probe
  with an injected `Redstone.Blocks.Foo` showed the removal takes effect.
- **The `local_wires` link.** `docstring.test.ts` pins
  `api/#Redstone.Library.local_wires`, an anchor that does not exist; the
  test records today's behaviour, which increment 10's qualified `@ref`
  links fix.

The reviewer's delta check verified `8d44fda`, red under both mutants
with 230 Chromium checks green, and the corrections above. It found one
slip, F3's sentence cited as `build_release.md` answer 4 where it sits in
answer 3, corrected here and in `pending.md`.

Landed on 2026-11-16, the branch rebased onto `823d79b` and fast-forwarded:
`23fd23b`, `6b03039` and `8d44fda` became `a139e2a`, `cfd55cd` and
`61f40f8`.
