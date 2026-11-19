# Increment 10, the deployment overlay: notes

The handover of the design session of 2026-11-19, which is open. A fresh
session resumes it from this file, the draft record
`design/deployment_overlay.md` and the two `pending.md` bullets named
below. It reads those and the rules, never the old transcript.

## 1. The state

- **The session is a design session, and nothing is built.** No brief, no
  prototype, no worktree. The increment's pipeline starts after the
  record lands.
- **The record is a draft**, `design/deployment_overlay.md`: thirteen
  answers and six open questions. Its first lines say it is a draft.
- **The inspector's tree** stands at the commit that adds this file, on
  top of `cba1680`, with nothing unpushed before it.
- **The core's tree** carries two commits of this session, both on
  `design/pending.md` alone: `f4c859c`, the question of retiring `Period`
  and `Hz` on the friction review's bullet, and `cf3c782`, the first
  bullet of the work order, "The core work ahead of the inspector's
  increment 10", in four parts. Neither is pushed.
- **A peer session works on the core's tree**, on the tutorial's
  increment 2, with uncommitted files there. Stage explicit paths only,
  and run `ListAgents` before launching anything.
- **The pin needs a pushed core.** The inspector pins the core by
  revision at its remote, so the core's parts are pushed before the pin
  bump.

## 2. How the session runs

The user runs it under the `initial-design` skill. One question at a
time, each with its options, a stated preference and the reason. A
question is settled only when the user says so. A question from the user
that implies an edit is answered with the proposed text first. When the
user's answer is ambiguous between two open things, it is taken for one
and the other is asked again.

## 3. Where each ruling lives

Every ruling of the session is in the draft record, with its reason and
the alternatives it rejected. The core's `pending.md` restates the four
parts of the core's work in short. Nothing is ruled that neither file
holds.

| ruling | the draft's answer |
|---|---|
| the descriptor at parity with `show`, with the derivation clause | 1 |
| the format at 1.0 until the first release | 2 |
| the notation, `Aₖ (key)`, `τ` for a component, the core taking it first | 3 |
| the deployment body, flat | 4 |
| the `schedule` section, the anchors' rows, the key `dt` | 5 |
| the grid report as data in `structure`, derived from the anchors | 6 |
| the events carried now and drawn in 10b | 7 |
| the hyperperiod derived by the client | 8 |
| the timing tab | 9 |
| the pane's frames table | 10 |
| the chart | 11 |
| the staging | 12 |
| the legend | 13 |

## 4. What is open, with the facts gathered

The order below is the order planned. Items 1 and 2 need a yes or a
correction. The leanings are the coordinator's and are not rulings.

1. **The events section's shape.** The JSON in the draft's answer 7,
   which mirrors what `show(::Events)` prints. The `Events` artifact
   holds one row per component, 19 for `approach`, and `show` prints
   only the rows with an event. The user has not seen the JSON.
2. **When 10b runs.** The lean is before the look pass, since an event
   mark changes the canvas again and the look pass and the README's
   images follow the last change to it. It delays the release.
3. **A root input's seedability.** The one substantial question left.
   - The spec pins a root input when any consumer's entry pins, and a
     discrete consumer pins by tier (§8.2, §14.10).
   - The core decides it at a `Dual` activation:
     `Redstone.jl/src/linearize.jl`, `_seeded_tap` for `Val{:u}`, asks
     `_accepts_wire` of each consumer's entry at the retyped root type.
     `_check_seedable` adds that only a `Float64` leaf reached by at most
     one index step is seedable, so a `Bool` or an `Int` root input never
     is.
   - The format writes a root input's `pinned` as false, the wire pass
     having stripped the marker.
   - The client already resolves each root input's terminal consumers,
     and has each consumer face's `pinned` flag and its node's `tier`.
     So a client derivation covers a whole-entry `Pinned` and a discrete
     consumer. It misses a `Pinned` leaf inside a struct-typed entry,
     since the writer sets the flag only when the whole entry is the
     marker (`_primitive_face` in `Redstone.jl/src/descriptor.jl`).
   - `show` prints nothing about pinning or seedability, so the parity
     rule does not oblige the format to carry it.
   - The options: the root-inputs tab stays silent; the client derives
     it and says what it cannot see; the writer computes it and the
     format carries it, which needs a structural form of the meet at
     `Float64`. No lean was put to the user.
4. **The `@ref` rule's edges.**
   - At the core's tip the 42 component docstrings hold 277 glossary
     links, 112 bare links into the type's own module, 9 bare links from
     `Library` into `Redstone` (`Pinned` twice, and `Group`'s
     `local_wires`, `input_wires`, `output_wires` and `sample_times`
     among them) and 2 links qualified as written. Every bare link is a
     plain identifier and every one resolves.
   - The 9 are today's dead links: the page joins the name to the type's
     module (`frontend/src/lib/docstring.ts`, `refLink`).
   - `which(mod, name)` names the binding's owner. For a name a module
     imports from outside `Redstone` it would give a module with no
     anchor on the core's API page.
   - The lean: the writer qualifies every bare link it resolves, and the
     page links a qualified name only under `Redstone.` and shows any
     other as code text.
5. **The fixtures and the pin bump.**
   - `closed_loop_deployment` at `Δt_frame = 1//100` has ten rows on ten
     anchors, all `(D, Φ) = (2, 0)`, a hyperperiod of 2, and the frame
     equal to the base tick. It shows one chart row.
   - At the core's tip `descent()` is gone and `scripts/fixtures.jl`
     imports it. `closed_loop(solution, gains)` still exists. Twenty
     frontend test files read `descent.json` (`pending.md`, Unordered).
   - `autopilot(solution)`: 8 rows on 8 anchors, four at `(10, 0)` and
     four at `(2, 0)`, a hyperperiod of 10.
   - `approach(solution)`: 11 rows on the same two clocks, and the
     examples' one event, `gear`'s `touchdown`, localized, with the
     bundle `(m, u, y, t)`. It serves 10b.
   - `library` at `Δt_frame = 1//100`: 13 rows, 5 triples, 4 distinct
     `(D, Φ)`: `(1, 0)` nine times, `(2, 0)` twice from two triples,
     `(2, 1)` once and `(10, 0)` once. Its grid report has two pool
     entries, the coarsest admissible base tick `1//50`.
   - `rates` with `Δt_base = 1//200`: 3 rows, 3 rate scopes, a
     hyperperiod of 40. It is the one model with rate scopes.
   - No fixture has a frame that differs from the base tick, a frame
     that is not a whole number of base ticks, a timeline past the
     threshold, a proposing algorithm with `h_min`, an anchor with a
     nonzero `τ`, or a pool entry with alternatives. The chart's frame
     tops, the joint period, the omitted timeline, the steps as a range
     and the anchors' `Φₖ` each need one, as a fixture or as an inline
     copy.
6. **The spec and log homes, and the order of the commits.** The
   coordinator proposes the list for the user to correct.
   - §13.9: the parity rule in place of "what a client needs to draw and
     explain the component tree", the format at 1.0 until the release,
     the deployment body, the `schedule` section, `events`, `grid` in
     `structure`, the key `dt`, the qualified `@ref` links.
   - §9.2: the grid report derived and printed by `show(::Structure)`,
     the sentence "the grid diagnostics live on the `Deployment`", the
     binding table with `Δtₖ`, and later the chart for part four.
   - §10.5 and the glossary's anchor and phase entries: `Δtₖ`, and
     `Absolute(Δt, τ)`.
   - The log: an entry for the descriptor's content, amending D-432; an
     entry for the report's placement, amending D-254 under D-261; an
     entry for part four's chart, amending D-257. Whether the notation
     earns an entry is read off `Redstone.jl/design/rules/log_rules.md`.
   - The schema's description names
     `RedstoneInspector.jl/design/descriptor_design.md`.

## 5. Facts the session found that no other file holds

- **The roadmap's entry predates the frame period.** It dates from
  2026-11-04 and says "the base step". Since D-443 and D-449 a
  deployment fixes `Δt_frame`, `Δt_base` and `h_max`.
- **The schedule follows from the build body and one rational.** §9.2's
  binding is one division pair per anchor and one multiply-add per
  component. The anchors' `Dₖ` and `Φₖ` are locals in `bind_schedule`,
  `Dk` and `Φk`, and no artifact holds them.
- **The page's words collide today.** `rates.ts`' `tripleText` prints `c`
  as "phase", `detail.ts`' `ratePhrase` prints it as "offset", and the
  timing tab's column reads `tau`. `ratePhrase` has one caller, the pane.
- **The palette's step is the triple's index** in `tripleOrder`: anchor
  0 first, then by period. The peach is step 0 and goes to the fastest
  anchor when no primitive ticks on `A₀`.
- **`Period` wraps more than sampling periods.** The deployment's time
  keywords and `init!`'s `t0` take one. `Absolute`'s first argument is
  the one place in the API that refuses a bare number.
- **The algorithm tokens** are `RK4()`, `Heun()` and
  `BS3(reltol, abstol)`, and `proposes` is true for `BS3` alone.
- **`show`'s output is pinned as text** in `Redstone.jl/test/test_show.jl`
  and `test_adaptive.jl`, and the tutorial's pages print real output.
- **The loader refuses a body without nodes in plain words**
  (`frontend/src/lib/loader.ts`), the pattern answer 2's refusal follows.
- **The session's probes were throwaway scripts** in the session's
  scratch directory. Their findings are the figures in this file.

## 6. What the close owes

When the last question is ruled:

1. The record: the draft marker goes, "Pending questions" reads "Open
   items live in `pending.md`", and the four glossary entries move to
   `glossary.md`.
2. The parents' amendments, each a dated note under `rules.md`'s
   "Amending a record": `workspace.md` answers 4, 6 and 7,
   `visual_grammar.md` answer 6, `descriptor_design.md` answers 2 and 9.
3. `roadmap.md`: increment 10's entry rewritten to the settled scope,
   with "the overlay bump" and "1.1" swept, and a new entry for 10b.
   `pending.md`: the first bullet, with 10b and the event parameters'
   display, and "Format bumps still open" less the state events and,
   if answer 10's check holds, the per-component chain.
4. The user sees the lot before the commit.
5. Then the core's four parts, in the order of its `pending.md`, each
   with its spec edit first. A code change is proposed before it is
   made. The inspector's increment 10 follows the core's push.

## 7. The successor's first prompt

> Resume the design session of the inspector's increment 10. Read
> `RedstoneInspector.jl/design/increments/inspector_10_deployment_overlay/notes_inspector_10.md`
> first, then the draft record `RedstoneInspector.jl/design/deployment_overlay.md`,
> then the first bullet of each repo's `design/pending.md`. Six questions
> are open, listed in the notes' section 4. Take them one at a time under
> the `initial-design` skill, starting with the events section's shape.
