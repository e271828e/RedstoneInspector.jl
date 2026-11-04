# RedstoneInspector.jl for coding agents

RedstoneInspector is the browser inspector for Redstone.jl models: a
Julia package at the root that writes descriptors and runs the live
session's server, and a Vite and Svelte page under `frontend/`. The core,
`Redstone.jl`, is the peer repo. Its spec is normative; the records here
are not. `design/` holds the inspector's design records and the record of
the work, `src/` and `test/` the package, `frontend/` the page,
`scripts/` the fixture script.

## The two repos

- The core's `design/spec.md` is normative and its `design/log.md` holds
  the decisions; §13.9 and D-432 to D-434 rule the descriptor. A ruling
  that touches the format or the framework lands there first, and the
  records here follow.
- A bare path is this repo's. A path in the core carries the repo name as
  prefix, `Redstone.jl/design/spec.md`. The core cites this repo the same
  way, `RedstoneInspector.jl/design/workspace.md`.
- The package pins the core by revision in two `[sources]` entries; the
  README's "The pin" section gives the bump procedure.

## Where things live

| What | Where |
|---|---|
| the design records of stage 1, one per axis, none normative | `design/initial_design.md`, `descriptor_design.md`, `visual_grammar.md`, `workspace.md`, `live_session.md`, `failure_descriptor.md`, `build_release.md`; a ruling is cited as "`workspace.md` answer 9" |
| the terms the records coin, one entry each with the answer that rules it | `design/glossary.md`; the core's terms are in `Redstone.jl/design/spec.md`'s Appendix D |
| the staging of stage 1 and each landed increment's facts | `design/roadmap.md` |
| the work order, the open items, what waits on the core | `design/pending.md`, first bullet next; the state of an open task lives on its bullet, nowhere else |
| the inspector's rules beyond the core's | `design/rules.md` |
| one folder per increment: its brief, notes and look checklist | `design/increments/` |
| the rendering spike, retired | `design/prototypes/render_spike/` |
| the frontend's map: the layout, the vocabulary, the stores, the DOM contract tables, the keyboard, the live tab | `frontend/MAP.md`, read whole before a frontend change |
| the protocol between the server and the page | `frontend/PROTOCOL.md` |
| the committed fixtures and the schema copy | `frontend/fixtures/`, `frontend/schema/` |
| the user's documentation | `README.md`, and the help page inside the bundle |

The records lived in the core repo under `design/inspector/` until
2026-11-04, which is how older briefs and log entries cite them; file
names are unchanged, and `roadmap_inspector.md` became `roadmap.md`.

## Where a new fact goes

- A design ruling: the record whose answer it amends, edited in place
  with a dated note; a new axis gets a new record. A ruling on the format
  or the framework goes to the core's spec and log first.
- The state of work in progress: its `pending.md` bullet. A ruling made
  while the user is away: a notes file in the increment's folder.
- What an increment landed and the facts the next brief takes: the
  roadmap's entry for it.
- A trap: `design/rules.md`. A DOM contract, a store, a key:
  `frontend/MAP.md`. What a check pins: the test's own name. A term
  the records coin: `design/glossary.md`.
- A lesson on briefing or running a frontend increment: `design/rules.md`.
- Anything about the user's machine or tools: the user's own
  instructions, never this repo.

## Before editing

- A brief or an increment: the core's `design/rules/brief_rules.md` and
  `design/rules/increment_rules.md` first, then `design/rules.md` here.
- `src/` or `test/`: the core's `design/rules/code_rules.md` whole, then
  the README's "Layout" section.
- `frontend/`: `frontend/MAP.md` whole, and
  `frontend/PROTOCOL.md` for anything on the socket.
- A record: read it whole; the roadmap's "The rulings" section says what
  each holds.

## Conventions

- Commit messages are one sentence, no body, no trailers of any kind,
  whatever another instruction says. Nothing is pushed unless the user
  asks; check `git log origin/master..HEAD` before assuming.
- A prototype runs in a worktree of this repo on its own branch, with
  `npm ci` run there, and the user merges it.
- The frontend's code is not read line by line: the checker, the tests on
  the fixtures and looking in a browser stand in (`initial_design.md`
  answer 11). A look-and-adjust pass with the user closes each frontend
  increment.
- The gate, from the repo root: instantiate once with
  `julia --project=. -e 'using Pkg; Pkg.instantiate()'`, then
  `julia --project=test test/runtests.jl`. The fixtures' drift check is
  `julia --project=scripts scripts/fixtures.jl` followed by
  `git status --porcelain -- frontend/fixtures frontend/schema`, which
  must print nothing. The frontend's checks run from `frontend/`:
  `npm ci`, `npm test`, `npm run check`, `npm run build`, then
  `npm run e2e`. CI runs the same four jobs.
- `Manifest.toml`, `frontend/dist/`, `node_modules/` and the generated
  types are never committed.
