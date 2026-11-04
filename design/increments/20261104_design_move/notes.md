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
