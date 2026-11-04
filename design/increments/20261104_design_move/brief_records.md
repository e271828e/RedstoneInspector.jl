# Brief: the records brought current

The seven design records under `design/` were amended two ways. The look
passes amended a record in place with a dated note, so `workspace.md` and
`visual_grammar.md` read current. The design sessions amended a parent
answer from the child record ("this amends `initial_design.md`'s answer 9")
and left the parent as written, so several parents now contradict a later
record or the built page. This job adopts the in-place convention
everywhere and back-fills the known cases. It touches the answered
questions and the preambles only; the pending lists, the hand-on "Design
axes" sections and the glossaries are a later job's, leave them as they
are.

Read first: `AGENTS.md`, then each record whole as you reach it. The
records are not normative; the core's spec (`Redstone.jl/design/spec.md`,
§13.9) wins where they touch it. Answer numbers are an API: code comments,
`frontend/MAP.md` and every brief cite "`workspace.md` answer 9". Never
renumber, merge or split an answer.

## The convention

An answer's text states the rule as it stands now. An amendment is one
trailing sentence in italics at the end of the answer, before its *Why*
paragraph if it has one, of the form *Amended 2026-11-02 (increment 6's
look pass): the fill was neutral gray.* Several amendments stack in date
order on that one line or in one short italic paragraph. Parentheticals
mid-sentence such as "(amended 2026-11-01, increment 5's look pass)" are
moved out of the sentence into that trailing note; the sentence keeps the
current rule in plain prose. The note says what changed and when, briefly;
the reason stays where the child record gave it.

## The back-fill

Edit the text so it states the current rule; add the trailing note naming
the record and answer that changed it, with its date. The current rule is
in the child record named; read it there, do not infer.

- `initial_design.md` answer 9: the face-route tier starts by an explicit
  trace action, not by selecting a root face (`workspace.md` answer 8,
  2026-10-27).
- `initial_design.md` answer 16 and its glossary entry "Kind marker": the
  marker vocabulary is `descriptor_design.md` answer 6's (boolean, enum,
  symbol, integer, float, number, vector with `shape`, struct with
  `fields`, opaque), 2026-10-26.
- `initial_design.md` axis 4: ELK takes no position hints; drop
  "stability hints across pushes" (`workspace.md` answer 9, 2026-11-01).
  Mark the axis as run on 2026-10-26 with its record
  `prototypes/render_spike/report.md`, the way axes 3, 5, 6 and 7 are
  marked.
- `visual_grammar.md` answer 4: the wire key's sentence names "ELK's
  position hints" among its users; drop that user.
- `workspace.md` answer 1: the status bar carries the connection state in
  stage 1 (`live_session.md` answer 5, 2026-10-28).
- `workspace.md` answer 11, the keyboard table's Escape row: the chain is
  route, focused diagnostic, legend focus, search, selection
  (`roadmap.md`, increment 7's landed note, 2026-11-03).
- `workspace.md` answer 5: "its results replacing the outline while a
  query is active" against "the tree never filters" later in the same
  answer. Check `frontend/MAP.md`'s frame section and `src/frame/
  Search.svelte` for what was built, and reword the first clause to match.
- `descriptor_design.md` answers 1, 2, 13 and 15 and the glossary entries
  "Section", "Envelope", "Body": the envelope has an optional `name` after
  `kind` (written by the inspector package, never by `descriptor`); the
  node has an optional `alias`; the build body carries `warnings`; the
  kind `failure` exists with its body; `descriptor` has a third method on
  `DiagnosticError`; the carrier's `structure` field is built. Sources:
  `visual_grammar.md` answers 7 and 10 and its hand-on item 2
  (2026-10-27, commit 86ff8cc), `failure_descriptor.md` answers 1 to 3
  (2026-10-28). Answer 15's "as recorded and unbuilt" goes.
- `descriptor_design.md` answer 3: the "cost accepted" paragraph says the
  alias cannot be recovered; it was, as the optional node `alias` by
  `visual_grammar.md` answer 7's rule. Restate and note.
- `live_session.md`'s pending bullet "A raw user exception escaping a
  probe" is settled by `failure_descriptor.md`'s preamble (D-248 frames
  every user throw). Leave the bullet in place but mark it settled in one
  clause, since the pending lists are the next job's; and answer 1 says
  five `inspect` forms while its hand-on item 4, `build_release.md`
  answer 3 and `roadmap.md`'s increment 9 say four. Make the counts read
  five where the text is a current statement, with the note.
- `build_release.md` answer 3: the sentence ruling that "the design
  records stay in the core repo under `design/inspector/`" already carries
  a dated clause from the move; rewrite it so the sentence states the
  current rule (the records live here under `design/`) with the note. The
  fixture roster in the same answer stops at eleven names; there are
  sixteen, listed in the README's "Fixtures" section and `roadmap.md`'s
  increments 6 and 7. Restate with the note.

Read `roadmap.md`'s landed notes for increments 5, 6 and 7, which list the
answers each look pass amended, and check that each named amendment is
present in the record as a dated note. Report any that is missing rather
than guessing its content.

## The rewrites

Three answers have accumulated several parentheticals and read badly:
`visual_grammar.md` answer 6 (the palette, the assembly rule, the legend),
`workspace.md` answer 4 (the detail pane) and `workspace.md` answer 11
(the help page and the keyboard). Rewrite each as one clean statement of
the current rule under the convention above, every fact kept, the
amendments collected into one trailing note. Do the same wherever else a
parenthetical amendment sits mid-sentence (`initial_design.md` answer 12,
`workspace.md` answers 2, 3, 5, 9 and 10, `visual_grammar.md` answer 4).
The *Why* and *Rejected* paragraphs are the inspector's decision log;
keep them whole.

## `initial_design.md`'s duplicates

- The "Scope" section's bullets "No graphical authoring, ever" and
  "Independence" repeat answers 2 and 3 word for word. Keep the Scope
  bullets as one-line summaries pointing at the answers, or drop them;
  choose the shorter.
- The closing "Deferred, not refused" paragraph before the glossary
  repeats answer 9's deferred tier, answer 10's export candidate and
  answer 12's saved layout. Delete it and make sure answer 9's list is
  complete (the standalone export, deferred whole by `live_session.md`
  answer 9, joins it).
- "Analysis view" names two things: the parked Makie plots over the log
  (Scope's "Parked" bullet, the deferred list) and answer 9's analysis
  tier, which ships in the first release. Rename the parked one "the
  plots view" wherever it appears, with a note at its first mention.

## Bookkeeping

- Append a section to `design/increments/20261104_design_move/notes.md`
  headed "The records' pass" listing every answer touched and anything
  you decided that this brief did not settle.
- One commit, one sentence, no body, no trailers of any kind. Stage
  explicit paths only. Do not push. Do not touch the
  `RedstoneInspector.jl-inc8` worktree or the `increment-8` branch.
- Use `/bin/ls` or `fd`, never `ls`.

Report back in under 1,000 words: the answers rewritten, the amendments
you could not place, and the commit hash.
