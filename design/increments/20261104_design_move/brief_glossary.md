# Brief: one glossary

The seven records under `design/` end in five glossaries
(`initial_design.md`, `descriptor_design.md`, `visual_grammar.md`,
`workspace.md`, `live_session.md`, `failure_descriptor.md`,
`build_release.md`; check which have one). They overlap: "Kind marker",
"Format version" and "Parameter summary" are defined twice, the
descriptor's `timing` object and the grammar's "Triple" are one thing
under two names, and `kind` collects three senses across three files.
This job merges them into `design/glossary.md`. Runs after the pending
pass (`brief_pending_roadmap.md`), on its commit.

Read first: `AGENTS.md`, then every glossary section whole, then the
answer each entry cites when two entries disagree. Answer numbers are an
API; touch no answered question's text or number.

## The merged file

- `design/glossary.md`, one alphabetical list, one entry per term, the
  shape of the existing entries: the term in bold, a period, one to three
  sentences. Each entry ends with the record and answer that defines the
  thing, as "(`workspace.md` answer 9)", so a reader can go to the ruling.
- Two entries for one term: merge into one, keeping every fact; where
  they disagree, the later record wins and the entry says so in a clause
  only if the older sense is still in use somewhere.
- `kind`: one entry with its three senses, the envelope's `kind`, the kind
  marker's first field, and a diagnostic's `kind`, each in one sentence.
- "Timing" and "Triple": one entry under "Timing", with "Triple" as a
  one-line cross-reference entry, since both words are in use in the
  records and the code.
- Terms the core's spec defines (component, assembly, leaf, face, root
  input, build, deployment, structure and the like) get no entry; the
  spec's glossary is normative. Keep only what the inspector coins.
- A term's definition must match the record's current answer after the
  records' pass; a stale glossary entry (the old marker vocabulary, the
  envelope without `name`) is corrected to the answer, not copied.

## The records

- Replace each record's "Glossary" section body with one sentence: "Terms
  are defined in `glossary.md`." Keep the heading.
- `AGENTS.md`'s "Where things live" table gains a row for the glossary.

## The traps

`design/increments/20261104_design_move/traps.md`, if present, holds the
frontend's traps condensed out of `frontend/MAP.md`. Fold them into
`design/rules.md` under a heading "Frontend traps" after the frontend
rules, keeping each as one bullet, and delete `traps.md`. If the file is
absent, say so in your report and leave `rules.md` as it is.

## Bookkeeping

- Append a section "The glossary pass" to
  `increments/20261104_design_move/notes.md`: the entries merged, the
  disagreements resolved and how, the terms dropped as the spec's.
- One commit, one sentence, no body, no trailers of any kind. Stage
  explicit paths only. Do not push. Do not touch the
  `RedstoneInspector.jl-inc8` worktree or the `increment-8` branch.
- Use `/bin/ls` or `fd`, never `ls`.

Report back in under 600 words: the entry count, the disagreements
resolved, and the commit hash.
