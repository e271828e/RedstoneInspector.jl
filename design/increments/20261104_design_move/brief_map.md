# Brief: the frontend map cut to a map

`frontend/MAP.md` is 2,650 lines on the `increment-8` branch for about
5,500 lines of source. The core's `code_map.md` is 1,160 lines for 46,000.
Most of the excess is not map material: inventories of what every test
pins, down to per-fixture counts; the traps; the open items; a preamble
that is a changelog. This job cuts the file to what a map is, on the
`increment-8` branch in the worktree `~/.julia/dev/RedstoneInspector.jl-inc8`,
so that the cut carries increment 8's additions and the merge to master
stays clean. The design records and the rest of `design/` live on master
at `~/.julia/dev/RedstoneInspector.jl`; read them there, edit nothing
there except the one staging file named below.

Read first: master's `AGENTS.md` and `design/rules.md`, then `MAP.md`
whole in the worktree, then this brief again.

## What the map keeps

- A three-line preamble: what the file is, that paths are relative to
  `frontend/`, and that a brief cites it by section.
- "Layout", the table of files and what each owns.
- "Vocabulary", "Built once on load", "Stores", "The keyboard", "The live
  tab", "The generated types and the scripts", condensed where a sentence
  restates a record's answer: the map says what is built and where, the
  record says why and what the rule is. Keep the citations to records by
  answer number.
- "The canvas" and "The frame": keep the DOM contract, the selectors,
  classes and data attributes the browser checks select on, as tables
  (element, selector, what sets it). Keep behavior only where it differs
  from the record's answer or where the record has no answer; cut the
  narrative that repeats an answer with "as built" appended.
- One short section "The tests" and one "The browser checks" listing one
  line per test file: its concern and the fixtures it runs on. The pins
  themselves live in the test files. Before cutting an inventory entry,
  check that the test file's test names state what the entry pinned; where
  a name is uninformative (a bare fixture name, "works"), list it in your
  report under "test names to improve". Do not edit the tests.

## What the map loses

- The test inventories' per-fixture numbers and per-check narratives.
- "Traps": condense each to one or two sentences, keep every distinct
  trap, and write them to master's
  `design/increments/20261104_design_move/traps.md` under a heading
  "Traps, from `frontend/MAP.md`". A later job folds that file into
  `design/rules.md`; do not edit `rules.md`.
- "Open items": delete the section. The pending pass gathers these from
  the branch's map as it stands before your cut (`git show
  bb2511f:frontend/MAP.md`), so nothing is lost; the map's preamble
  may say in one clause that open items live in `design/pending.md`.
- The changelog preamble listing what each increment added.
- Any sentence that only says a record's answer "as built" without a
  difference.

Target: 500 to 700 lines. Every file in `frontend/src/` and
`frontend/e2e/` named in the old map stays named in the new one.

## Bookkeeping

- Commit the map on the `increment-8` branch from the worktree, one
  commit, one sentence, no body, no trailers of any kind; stage
  `frontend/MAP.md` only. Commit `traps.md` on master from the master
  checkout, its own commit, staging that one path. Do not push.
- Use `/bin/ls` or `fd`, never `ls`. Never run `npm` or the browser
  checks; this job touches no code.

Report back in under 800 words: the line count before and after, the
sections kept and cut, the test names to improve, and the two commit
hashes.
