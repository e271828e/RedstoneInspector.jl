# The design records' move: notes

The inspector's design material moved from the core repo into this one
on 2026-11-04, the last step of the core's project setup overhaul
(`Redstone.jl/design/increments/20261104_project_setup/notes.md`). Taken
from the core's tree at `8a9bb52`, a plain copy with no history rewrite;
the core's history keeps every earlier version.

## What moved

- `design/inspector/*.md`, the seven records, to `design/`, names
  unchanged.
- `design/increments/roadmap_inspector.md` to `design/roadmap.md`.
- `design/increments/inspector_01_…` to `inspector_09_…`, nine folders,
  to `design/increments/`, names unchanged.
- `design/prototypes/render_spike/`, the tracked files only, to the same
  path here; its `dist/` and `node_modules/` stay ignored, the root
  `.gitignore` gaining a bare `node_modules/` line.
- The "Frontend increments" section of the core's
  `design/rules/brief_rules.md` to `design/rules.md`.
- The core's stage 1 bullet of `design/pending.md` to `design/pending.md`
  here, corrected: increment 8 is in its look-and-adjust pass, not next.

## New files

`AGENTS.md`, `design/pending.md`, `design/rules.md`, this file, and one
line in the README's layout list.

## The sweep

- A bare path is the repo's own; the other repo's path carries its name
  as prefix. Both `AGENTS.md` files state it.
- Inside the moved files: `design/inspector/X` became `design/X`, the
  roadmap's path and bare name `design/roadmap.md` and `roadmap.md`, and
  the core's `design/spec.md`, `implementation.md`, `companions/` and
  `rules/` citations gained the `Redstone.jl/` prefix. The briefs'
  `design/pending.md` citations stay bare: every one names the stage 1
  bullet, which now lives here. `build_release.md` answer 3's sentence on
  where the records live gained a dated clause; its rewrite waits for the
  records' pass. The spike's `schema.json` keeps the old path in its
  description: it is a frozen data copy.
- `frontend/PROTOCOL.md` names `design/live_session.md`.
- In the core: §13.9's one sentence, six log lines under D-432 to D-434,
  seven lines across increments 081, 082, the pipeline redesign roadmap,
  interrupt windows 3 and the closed-loop hierarchy brief, the `AGENTS.md`
  row and `pending.md`'s stage 1 bullet, now a hook to this repo.
  `src/descriptor.json`'s description still names
  `design/inspector/descriptor_design.md`: a source file, left for a
  proposed change, and the schema copy here with it.

## The records' pass

Run under `brief_records.md`. Every amendment now sits at the end of its
answer as a dated italic note, before the *Why* paragraph, the answer's
text stating the current rule.

### Answers touched

- `initial_design.md`: answers 9, 12 and 16; the Scope section; axis 4;
  the glossary's "Kind marker"; the closing "Deferred, not refused"
  paragraph deleted.
- `workspace.md`: answers 1, 2, 3, 4 (rewritten), 5, 9, 10 and 11
  (rewritten).
- `visual_grammar.md`: answers 4, 6 (rewritten), 8, 9 and 10.
- `descriptor_design.md`: answers 1, 2, 3, 4, 6, 13 and 15; the glossary's
  "Body", "Envelope" and "Section".
- `live_session.md`: answers 1, 7 and 8; the pending bullet on a raw user
  exception, marked settled.
- `build_release.md`: answers 2 and 3.
- `failure_descriptor.md`: untouched.

### The look passes' amendments

Checked against `roadmap.md`'s landed notes for increments 5 to 7 and the
core's commits `45c5047`, `558b270`, `bb19f39`, `e538e38`, `28f5d72`,
`7ef9404` and `d2fc0a0`. Three carried no dated note and now do, their
content read from those commits' diffs: `visual_grammar.md` answer 8 (the
reserved hues moving from the whole palette to the strokes, `558b270`,
then to the fills, `28f5d72`), answer 9 (the legend line among the dimming
foci, `bb19f39`) and `workspace.md` answer 11 (the legend's focus in
Escape's chain, `bb19f39`). Increment 7's Escape chain was back-filled
from the roadmap. None is missing now.

### Rulings this pass made

- **Amendments already in place** were brought to the convention too:
  `descriptor_design.md` answer 6 (D-433's paragraph folded into the rule,
  the marker table gaining the opaque row the spec's §13.9 table has),
  `build_release.md` answer 2 (increment 1's mid-answer note) and
  `initial_design.md` answer 16 (the 2026-10-07 paragraph). The
  parentheticals "(increment 9)" in `live_session.md` answers 1 and 8 and
  `visual_grammar.md` answer 10's parenthetical on the file name moved out
  the same way.
- **`descriptor_design.md` answer 4** gained `alias` in its field list and
  a note, though the brief named answers 1, 2, 13 and 15: answer 4 is
  where the node's fields are listed. Answer 13's title now reads "Three
  methods"; nothing cites the old title.
- **`descriptor_design.md` answer 3's** cost paragraph now names the type
  `Redstone.Blocks.Junction`, as the fixtures carry it, where it said
  `Redstone.Junction`.
- **The Scope bullets** "No graphical authoring" and "Independence" became
  one bullet pointing at answers 2 and 3, since the Scope frames all four
  stages and the answers sit under stage 1. Dropped with them: the model
  editor sentence, which answers 2 and 12 cover, and "with stage 2, the
  handle's control verbs", which stage 2's pending question on control
  leaves open.
- **The deleted "Deferred, not refused" paragraph's** sidecar detail moved
  into answer 12; author icons stay with answer 15, the plots view with
  the Scope's "Parked" bullet.
- **The "five" counts** changed where the text states the current
  package: `live_session.md` answer 7 and `build_release.md` answer 3.
  `live_session.md`'s hand-on item 4 and `roadmap.md`'s increment 9 still
  say four; they belong to the next brief.
- **The glossary entries** the brief named were edited without notes; the
  convention is for answers.
- **Kept in place:** `workspace.md` answer 9's "(probed 2026-10-30,
  increment 5's reading 1)", the evidence for the rule rather than an
  amendment, and every child record's sentence saying it amends a parent.

### Left for later

- `visual_grammar.md` answers 1 and 7 still say they "ask for" the alias
  bump, and its preamble says a schema change lands as a minor bump, while
  `alias` and `name` joined version one unbumped; the hand-on item 2
  records the landing.
- `workspace.md`'s hand-on item "Axis 4: the hints" contradicts answer 9;
  `descriptor_design.md`'s hand-on item 1 says "as recorded and unbuilt".
  Both are the next brief's sections.
- The convention's exact form lives only in `brief_records.md`;
  `AGENTS.md` says "edited in place with a dated note". `design/rules.md`
  could carry the form.

## The pending pass

Run under `brief_pending_roadmap.md`.

### What moved where

- `pending.md`: the stage 1 bullet kept, gaining one clause on what the
  qualified `@ref` links do, since `build_release.md`'s note on them
  retired. Added to the work order: "After the core's first release"
  (the docs flip, the `[compat]` pin, the `$id`) and "The later stages".
  Added under Unordered: the format bumps, the names the export audit may
  change, Vite's proxy, Zed upstream, the schema's record path, and one
  bullet per open item of increments 3 to 7, plus one bullet for
  increment 8's items keyed to its look checklist.
- The six records' "Pending questions" bodies became "Open items live in
  `pending.md`."; their "Design axes" bodies one sentence pointing at
  `roadmap.md`. Every hand-on item had landed, was staged, or now sits in
  `pending.md`; none needed a new bullet beyond those above.
  `initial_design.md`'s stage 2 to 4 pending lists stay, the later-stages
  bullet pointing at them.
- `visual_grammar.md`: "The bare port" folded into answer 2 with a note
  dated 2026-10-30 (D-437); answers 1 and 7 and the preamble state that
  `alias` and `name` joined version one unbumped, each with a note dated
  2026-10-27 (`86ff8cc`).
- `roadmap.md`: "The pipeline for the frontend" moved to `rules.md`; the
  preamble, "The rulings" and increments 7 to 10 edited as the brief
  says.
- `rules.md`: the pipeline section before "Frontend increments", and
  "Amending a record" last.

### Dropped as closed

From the records: every item marked settled or closed (the failure bump,
the drawing's proposals, the `$id`, pretty-printing, the overlay's needs,
the raw user exception, the generator's output). Not marked, judged
closed: `descriptor_design.md`'s fixture set in the core's suite (the
core's `test_descriptor.jl` landed with it); `visual_grammar.md`'s palette
values and glyph artwork and "ELK's part" (increments 3 and 6 built and
tuned them); `workspace.md`'s feedthrough emphasis (increment 8's
execution-order tab draws the presumed rows, per the map at `bb2511f`).
The bare `@ref` note and the timing tab's schedule went to increment 10's
entry, already there.

From the increments: the faces table's squeezed kind cells (increment 6's
stacked rows), the Shift-`l` bound without a check (the keyboard check now
pins it), `closed_loop`'s root pin order and Shift's travel (both ruled in
increment 6's look pass), the halos composing to purple, the selected
block's full casings and the terminal port's thin stroke (ruled in
increment 7's look pass, entries 1.9, 5.6 and 6.3), the mutants' accepted
survivors, and master's map item on the feedthrough edges. The map's
"Firefox has never run here" is stale and was dropped; its clipboard skip
stands.

### Decided here

- `visual_grammar.md`'s preamble keeps the minor-bump rule for later
  changes and states the two fields' exception, rather than dropping the
  rule.
- Increment 8's map items are one bullet keyed to `look_inspector_08.md`'s
  entries, so the pass's rulings stay on the checklist; what the pass
  leaves open becomes its own bullet.
- The map's "increment 11 flips the docs address" yields to
  `build_release.md`'s pending note: the flip waits for the core's
  release, which follows increment 11.
- Some items merged: a legend focus and a route each dimming a level with
  nothing of theirs; the keyboard paths of the tree, the face rows, the
  drawer and the menu; the overlay's look leftovers; the route pill's two
  placements.
- "The schema's record path" was added from the move's sweep, which left
  it tracked nowhere.
- `rules.md`'s "The map" bullet was rewritten to the brief's ruling,
  since its old list of test inventories and traps contradicted it; "The
  repo" gained increment 10's core half beside the `$id` commit.
- `roadmap.md`'s "The rulings" now names `Redstone.jl/src/descriptor.json`
  and `prototypes/render_spike/report.md` by their paths from here.
