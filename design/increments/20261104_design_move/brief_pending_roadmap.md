# Brief: pending.md filled, the records' pending and hand-on sections retired, the roadmap split

`design/pending.md` becomes the one home of the inspector's open work. The
seven records' "Pending questions" sections and their hand-on "Design
axes" sections are retired, and `roadmap.md` gives its process rules to
`rules.md`. Runs after the records' pass (`brief_records.md`), on its
commit.

Read first: `AGENTS.md`, `pending.md`, `rules.md`, `roadmap.md` whole, and
each record's preamble, "Pending questions" and "Design axes" sections.
Answer numbers are an API; touch no answered question's text or number.
The core's `Redstone.jl/design/pending.md` is the model for the file's
shape: a "work order" list in working order, first bullet next, then an
"Unordered" list; the state of an open task lives on its bullet and
nowhere else.

## What pending.md holds

Keep the stage 1 bullet as it stands. Add, as bullets in the work order
or under Unordered, judged by whether a date orders them:

- **Scheduled work**, already in the stage 1 bullet: increment 8's look
  pass and merge; increment 10 after the deployment overlay's design
  session and its eighth record `deployment_overlay.md`, with the writer's
  qualified `@ref` links folded in (which closes `build_release.md`'s
  pending note on a bare `@ref` and amends `descriptor_design.md` answer
  10); increment 11, the release. Make sure the bullet says these in that
  order.
- **Format bumps still open** (one bullet, from `descriptor_design.md`'s
  pending list): the per-component `sample_times` chain and the state
  events, which increment 10's narrowed scope leaves out; a `string` kind
  when a `String` port appears and `min`/`max` on an integer marker if
  stage 4's widgets want bounds; locations beyond the declarations, with a
  one-line hook to the core's `pending.md` bullet "Stage-function
  locations in the descriptor", which owns the `y_direct` case. Each is a
  minor bump ruled in the core's spec and log first.
- **From the records' pending lists**, one bullet each: Vite's dev server
  proxying the socket (`live_session.md`); proposing the Zed editor entry
  upstream (`live_session.md`); the docs address flip from `dev/` to
  `stable/`, the pin's conversion to a `[compat]` range with the exact pin
  in `scripts/`, and the `$id` resolving, all gated on the core's first
  release (`build_release.md`). The claim badge on a root input pin and
  the stage 2 token and protocol version are stage 2's and go in the
  later-stages pointer, not as bullets.
- **The open items of the landed increments.** Gather every item from
  `roadmap.md`'s landed notes (increments 4 to 7, "Open items") and from
  the "Open items" section of `frontend/MAP.md` as it stands on the
  `increment-8` branch before its cut, read with `git show
  bb2511f:frontend/MAP.md`, which supersets master's. Merge duplicates,
  drop any the map or a later increment shows fixed (check the roadmap's
  later notes and the map's sections, not the code), and write each as
  one bullet under Unordered with the increment it came from. Leave
  `MAP.md` untouched on every branch: its cut is a separate job running
  on the `increment-8` branch, which drops the section in favor of this
  list.
- **Record maintenance**: whatever the records' pass reported as not
  placed, from the "The records' pass" section of
  `increments/20261104_design_move/notes.md`.
- **Later stages**: one bullet pointing at `initial_design.md`'s stage 2
  to 4 sections for the questions, and at the core's `pending.md` for the
  spec's debts. No copy.

## The records' pending and hand-on sections

- Each "Pending questions" section: move every open item into
  `pending.md` as above; delete every item marked settled, closed or
  dissolved, since the settling record and the roadmap hold the outcome;
  then replace the section's body with one sentence: "Open items live in
  `pending.md`." Keep the heading so the section numbering of a record
  does not shift.
- Each "Design axes" hand-on section (`descriptor_design.md`,
  `visual_grammar.md`, `workspace.md`, `live_session.md`,
  `failure_descriptor.md`, `build_release.md`): every item has either
  landed or sits in `roadmap.md`'s staging. Check each item against the
  roadmap; if one names something the roadmap lacks and `pending.md` now
  lacks, add it to `pending.md` and report it. Then replace the section's
  body with one sentence pointing at `roadmap.md`. `initial_design.md`'s
  "Design axes" list under stage 1 is the index of the axes, not a
  hand-on list; leave it.
- `visual_grammar.md`'s pending bullet "The bare port" is a ruling, not a
  question; fold its content into answer 2 as a dated amendment under the
  convention of `brief_records.md`.

## The roadmap

- Move "The pipeline for the frontend" section whole into `rules.md`,
  under its own heading, before "Frontend increments"; fix its "All ten
  increments" to eleven; drop the sentence naming the Node version on the
  user's machine. The roadmap keeps "Origin", "The rulings", "Staging",
  "Parallelism" and "Facts the briefs will cite". Update the roadmap's
  preamble so it no longer promises the pipeline section.
- Increment 8's entry: remove "the schedule and hyperperiod chart over
  the deployment fixture", which increment 10 owns since the deployment
  fixture has no `schedule` section before 10's bump; say in one clause
  that it moved there on 2026-11-04.
- "The rulings" list names the records by their old home; update the
  sentence and the paths to `design/` here, and add `rules.md` and
  `pending.md` to the list in one line each.
- Add a ruling under "The pipeline for the frontend" as moved into
  `rules.md`: what `frontend/MAP.md` holds (the layout table, the
  vocabulary, what is built once on load, the stores, the DOM contract as
  tables of selectors, the keyboard, the live tab, the generated types)
  and what it does not (test inventories, which the test names carry;
  traps, which live in `rules.md`; open items, which live in
  `pending.md`; a changelog preamble, which git holds). Say the map is
  read whole before a frontend change and kept under about 700 lines.

## Loose ends from the records' pass

The records' pass (its section in `increments/20261104_design_move/notes.md`)
left these, which are yours:

- `visual_grammar.md` answers 1 and 7 still say they "ask for" the alias
  bump, and its preamble says a schema change "lands as a minor bump",
  while `alias` and `name` joined version one unbumped. State the current
  fact in each place with a dated note, the one exception to the rule
  that this job touches no answered question.
- `live_session.md`'s hand-on item 4 and `roadmap.md`'s increment 9 say
  "four `inspect` methods"; the hand-on section retires, and the roadmap's
  landed note gets "five" with the increment 9 clause that added the
  fifth.
- The amendment convention lives only in `brief_records.md`. Add it to
  `rules.md` as a short section "Amending a record": the answer states
  the current rule; one trailing italic note per answer collects the
  amendments in date order, each with its date, source and what changed;
  no parenthetical amendment mid-sentence; *Why* and *Rejected* stay
  whole; answer numbers never change.

## Bookkeeping

- Append a section "The pending pass" to
  `increments/20261104_design_move/notes.md`: what moved where, the items
  dropped as closed, and anything decided that this brief did not settle.
- One commit, one sentence, no body, no trailers of any kind. Stage
  explicit paths only. Do not push. Do not touch the
  `RedstoneInspector.jl-inc8` worktree or the `increment-8` branch.
- Use `/bin/ls` or `fd`, never `ls`.

Report back in under 1,000 words: the bullets added to `pending.md` by
title, the items dropped as closed, and the commit hash.
