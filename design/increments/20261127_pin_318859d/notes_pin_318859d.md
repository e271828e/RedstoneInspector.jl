# The pin to the core's `318859d`, notes

The first of increment 11's two bumps
(`../inspector_11_release/notes_inspector_11.md`, ruling 6). The pin moves
from the core's `fcd3660` to `318859d48e5f9ce726a915b267fb6d6091b92648`,
89 commits on. It takes in what the core changed before the tutorial's
increment 1b, so that the second bump brings the example's rework alone.

The user was away on 2026-11-27. The coordinator of increment 11 ran the
unit: one high-tier agent built it in the worktree
`~/.julia/dev/RedstoneInspector.jl-worktrees/pin_318859d`, branch
`pin-318859d`, from `3afd3ed`, and an independent one reviewed it. The
prototype is the implementation, so this file is the record and there is
no brief. The bump is the commit `209f642`.

## Rulings

The builder's readings, which the coordinator kept, and the coordinator's
own. All are for the user's review.

1. **The target is the tip of the core's GitHub master**, `318859d4`,
   with its four workflows green. The core's local `master` stood at the
   same commit.
2. **`failure_descriptor.md` answer 2 names `BundleFieldError` among the
   kinds that write `function`.** The core's `dc884b9` added
   `_function(d::BundleFieldError) = d.family` to `src/descriptor.jl`, so
   the writer gives that kind its family: a stage's name, `guard` or
   `handler`. The answer listed four kinds and now lists five, with a
   dated note. The page needs nothing: it reads `d.function ?? d.kind`
   for the badge whatever the kind (`diagnostics.ts:209`). No fixture
   holds a `BundleFieldError`. *Rejected:* leaving the answer as the
   core's schema text has it, which still lists the four (finding 1).
3. **The oracle's `crosscheck.jl` builds `events_deployment`.** Increment
   10b added that fixture after the tool was written, and one check of
   the oracle failed on it, on the old fixtures as on the new. The tool
   gains the deployment as `scripts/fixtures.jl` builds it, and its
   README the new counts. *Rejected:* leaving the gap and reporting the
   failure as known.
4. **No test was added.** A test of a `BundleFieldError` badge would pin
   the branch that `UserCodeFraming`'s `function` on `failure_probe`
   already pins.
5. **The branch is merged locally once the review is clean**, by the
   order of the work in increment 11's notes, and the user pushes it.

## The shape built

- `Project.toml`, `scripts/Project.toml`: both revisions.
- `frontend/fixtures/`: 18 of the 22 regenerated. `containers`,
  `failure_structure`, `primitive` and `warning` are unchanged. Every
  file keeps its size, 1,409,625 bytes in all. Compared as values
  (`tools/valuediff.py`), 523 leaves differ, of two kinds:
  - 433 package paths in a location's `file`, in the hashed folder under
    `packages/Redstone/` or `packages/RedstoneExamples/` alone.
  - 90 line numbers: `Redstone.Group`'s five locations, 9 lines down in
    every fixture that holds a `Group`, since `src/assembly.jl` gained 9
    lines above them.

  No message, docstring, key, kind, length or type differs.
- `frontend/schema/descriptor.json`: the core's copy at the pin, byte
  for byte. Its top-level `description` alone changed, which now cites
  D-483 and reads "Until RedstoneInspector.jl's first release". No
  definition changed.
- `design/failure_descriptor.md`: answer 2 and its note (ruling 2).
- `design/increments/inspector_10_deployment_overlay/tools/`:
  `crosscheck.jl` and `README.md` (ruling 3).
- The page: nothing. No module, test, help text or line of
  `frontend/MAP.md` changed.

## The core between the two pins

Checked against the core's history, `fcd3660..318859d4`.

- 89 commits, 33 of them in `src/`. Increment 11's notes say 87 and 32,
  read two commits earlier.
- `src/diagnostics.jl`: 79 lines added and 66 removed, over 11 commits.
- `src/descriptor.jl`: one line, ruling 2's.
- `src/assembly.jl`: 16 lines added and 7 removed, 9 net above `Group`'s
  methods, the fixtures' only line shift.
- `show.jl` and `readers.jl` changed in comments alone, and
  `structure.jl` in one internal docstring. `deployment.jl` is untouched.
- The manifest differs from the old one in the two Redstone revisions
  alone.

## The reworded diagnostics

The page prints a diagnostic's `message` as the core writes it. No
fixture's message changed, so a user meets these texts only in a failure
of their own model.

- **`DeclarationOnWrongTier`.** The `:continuous_only` arm is retired
  with its message on `x_projection`; the core's `7a300b9d` moves that
  check to the structure step, the `:no_manifold` arm with it. A model
  that fails it gave a descriptor with a structure, which the page drew
  with a badge on the node, and now gives the list alone.
- **`TransparentContainerUnknown`.** "returns `:<field>`" became
  "returns `<repr(field)>`", so a value that is no `Symbol` prints as it
  is, and "names a `Tuple` or `NamedTuple` field" became "names one".
- **`ConformanceFailure`.** The `:s_init` arm is retired.
- **`BindingContractMismatch`.** "declares an input side" became
  "declares `is_input`", "declares an output side" became "declares
  `is_output`", and "declares neither side" became "declares neither
  `is_input` nor `is_output`".
- **`ArgumentInvalid`** gains a `:BS3` arm, on a tolerance of `BS3`.
- **`TapResolution`**'s unseedable clause cites D-168 and D-263, where
  it cited D-167 and D-168.
- **`FaceNameIllegal`** is also raised for a contract key that holds a
  slash, its message unchanged.
- **`StepError`'s `showerror`** gains the hosts `:trim` and `:linearize`.
  It has no descriptor in stage 1, so the page never shows it.

## Measurements

| | at `3afd3ed` | at the pin |
|---|---|---|
| the Julia gate | 131 passed | 131 passed |
| `npm test` | 793 passed in 31 files | 793 passed in 31 files |
| `npm run check` | 0 errors, 410 files | 0 errors, 410 files |
| `npm run e2e`, both browsers | 752 passed, 4 skipped | 752 passed, 4 skipped |
| the drift check | empty | empty after the commit |

With the pin and the fixtures alone nothing went red, where the last
bump had 37 checker errors.

- **The oracle** (`../inspector_10_deployment_overlay/tools/`): 616
  checks against the core's own `show` at the pin, none failed. 14 are
  new, on `events_deployment`. On the old fixtures it ran 602 checks and
  failed the one of ruling 3.
- **The look's reading**: 2100 facts over the 22 fixtures, none
  disagreeing with the modules.

## What the tests pin

The bump changes no code of the page, so its content is pinned by the
drift check alone. Three mutants ran on a scratch clone, all killed:

- `library.json` and the schema copy committed as the old pin wrote
  them: the regeneration shows both files.
- `scripts/Project.toml` back at `fcd3660`: the fixture script refuses,
  "the pin's revisions differ".
- The manifest kept at the old pin: the script refuses, "the manifest is
  stale".

## Findings

1. **The core's schema text lags its writer.** `Diagnostic`'s
   description in `Redstone.jl/src/descriptor.json` still lists four
   kinds that write `function`, and `descriptor.jl` writes it for
   `BundleFieldError` too. It is the core's to fix, and the copy here
   follows at the next bump after the fix. Increment 11's bullet in
   `pending.md` holds it, since a fix before the second bump puts one
   schema line in a diff that ruling 6 wants to be the example's alone.
2. **The oracle had a gap from increment 10b**, closed by ruling 3.

## Bookkeeping

- `roadmap.md`: the pin's sentence under increment 10's entry, at the
  merge.
- `pending.md` and increment 11's notes: the state of the run, kept by
  the coordinator.

## Out of scope

The core, read only, finding 1 included. The second bump, after the
tutorial's increment 1b. The export audit's renames, none in this range,
so the bare link's joining stands (`pending.md`).

## The cold review

One independent high-tier agent, over `209f642`, in a worktree of its
own, by `Redstone.jl/design/rules/increment_rules.md` step 5. It runs
the whole gate, regenerates the fixtures, repeats the comparison as
values with a reading of its own, looks for a reader of the descriptor
or a printed text that the core's 89 commits leave behind, reads ruling
2's amendment against the core's writer, and tries the drift check's
mutants. An empty review is acceptable.

## The review's record

One high-tier agent reviewed `209f642` with its record, at `d67a540`, in
a worktree of its own. Its gate was green at this file's counts, the
oracle and the look's reading included. Its own comparison of the
fixtures as values, written before it opened `tools/valuediff.py`, gave
the same 523 leaves: 405 paths of `Redstone`, 28 of `RedstoneExamples`
and 90 lines. The schema copy is the core's byte for byte. It found no
reader of the descriptor that the core's changes pass by, and no text of
the page, the help page, the map, the README or a record that the core
reworded. Nothing was a must-fix. It disagreed with no ruling. The
findings, as the coordinator adjudicated them, all landed in one commit:

- **1, finding 1 had no home outside this file.** Taken: a sentence on
  increment 11's bullet in `pending.md`, at the merge. The core's
  `pending.md` is the core's to write.
- **2, answer 2's amended sentence** ran to 93 characters and read
  `GuardForm`'s clause as more of `BundleFieldError`'s. Rewrapped and
  split.
- **3, the amendment's note** lacked "the user away". Added.
- **4, two figures** of "The core between the two pins": `assembly.jl`'s
  lines and `structure.jl`'s docstring. Fixed.
- **5, the `x_projection` check's move** changes what the page draws for
  that failure. A sentence added to the bullet.
- **6, `tools/valuediff.py`** folded the two packages' folders into one
  name, so a location moved from one package to the other would have
  counted as a path's hash. Fixed; the figures stand.

Its mutants: the drift check's three, killed again; the badge reading
`d.kind` alone, killed by two tests of `diagnostics.test.ts`, which
bears ruling 4 out; and `events_deployment` built with another
localization budget in the crosscheck, which survives. The last is
acceptable: the oracle derives timing facts alone, and the crosscheck's
call matches `scripts/fixtures.jl:85` argument for argument.
