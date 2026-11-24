# Pending

What the inspector still owes its records, the work order and the open
items, in two lists. Every item here is known and recorded; none is
abandoned. The core's `Redstone.jl/design/pending.md` holds what the spec
owes the inspector's later stages and the descriptor changes the core
makes.

## The work order

The bullets stand in working order, the first one next.

- **The inspector, stage 1, its remaining increments**: the static
  inspector over the descriptor. Its records, none normative, are
  `initial_design.md` and one per axis beside it: `descriptor_design.md`
  (axes 1 and 2, §13.9, D-432),
  `visual_grammar.md` (axis 3), `prototypes/render_spike/report.md`
  (axis 4), `workspace.md` (axis 5), `live_session.md` (axis 6),
  `failure_descriptor.md` (the failure bump, D-434), `build_release.md`
  (axis 7) and `deployment_overlay.md` (increment 10's design).
  `roadmap.md` stages the build in eleven increments and records
  each landed one with the facts the next briefs take. Increments 1 to 9
  and 8b have landed, as have the pin to the core's `6afd6fb` and the
  icons for its new components and the polish batch. Next, 10, the
  deployment overlay, whose design session closed on 2026-11-20 with the
  eighth record, `deployment_overlay.md`, answers 1 to 17. The core's
  work came first, in four parts, and is landed and pushed (the core's
  D-464, D-466, D-467, D-468 and D-471). Increment 10 runs in three
  steps, in this order, by the user's ruling of 2026-11-22. The first,
  the pin bump, landed on 2026-11-23 and is not pushed: the pin stands
  at the core's `7ea3600`, with the fixtures regenerated, `descent`
  built in the script and nothing new drawn. Its notes,
  `increments/20261123_pin_7ea3600/notes_pin_7ea3600.md`, hold its
  rulings, the answers to the two checks of `deployment_overlay.md`
  answer 16, what the regenerated fixtures show and the look by
  captures. The second, the record at the new pin, landed the same day
  and is not pushed. `deployment_overlay.md` was read against the core's
  §13.9 as pinned, the schema copy, the fixtures and the deployments of
  answer 16 built in scratch, with the user away, and fifteen of its
  answers are amended. Nothing was found that the core must change. The
  bump's three items are placed: a deployment's own warnings join the
  diagnostics tab (answer 4), the loader refuses a file from an older
  core by its structure (answer 2), and the pane reads the rate chain
  from the node's `rates` (answers 5 and 10). The step's notes,
  `increments/inspector_10_deployment_overlay/notes_record_at_pin.md`,
  hold each ruling with its reason and the alternative it rejected, and
  the user's review of them is owed. One step remains:
  - **The implementation**, briefed and launched from the amended
    record. Its prototype shows the user both alternatives of the
    readings the notes list as a matter of taste: a bare docstring link
    joined to its type's module or shown as text (answer 15), the rate
    chain on a line under the frames table or left out (answer 10), and
    the pool's alternatives and the prime attribution under the anchors
    table or left out (answer 9).

  Then a pin bump to the core's timing notation (the core's D-478 and
  D-479), after the user's visual review pass closes 10 and before 10b,
  by the user's ruling of 2026-11-24. The core's increment, recorded in
  `Redstone.jl/design/increments/20261124_timing_notation/notes_timing_notation.md`,
  renames the descriptor's keys with the format left at 1.0 (§13.9): a
  node's and a scope's `timing` `{anchor, m, c}` becomes
  `{anchor, D, phi}`, and a `Relative` link's `{K, phi}` becomes
  `{D, phi}`. The page reads the old keys in `analysis.ts`, `rates.ts`,
  `focus.ts` and `detail.ts`, and `detail.ts` prints `m` and `c`, so the
  bump adapts the reads, prints the timing under the core's symbols
  (`Dₐ`, `Φₐ`, `D₀`, `Φ₀`), regenerates the fixtures and copies the
  schema. `deployment_overlay.md`, whose answers still write the core's
  D-464 letters, follows at the bump with a dated note. The core's commits are not pushed yet, and the pin names a
  revision on GitHub, so the core's push comes first.

  Then 10b, the events, after a short
  design session of its own that also decides where the three event
  parameters show; then the look pass, the next bullet; then 11, the
  release, with a check that runs the real server. Stage reached on 10:
  designed and not briefed, with the pin bump and the record at the new
  pin landed and not pushed, the bump cold-reviewed, the user's look at
  the bump and review of the record's rulings owed, and the brief
  next. The session's handover
  is `increments/inspector_10_deployment_overlay/notes_inspector_10.md`.
  The Firefox project blocks CI as Chromium's does, by the
  user's ruling of 2026-11-15 after its first run with every check
  passed, so increment 6's reading 18, non-blocking until the release, is
  settled. The built-in Julia GUI is parked (D-310).
- **The look pass before the release**, between increments 10b and 11,
  by the user's rulings of 2026-11-17 and 2026-11-20: the canvas's open
  look items, judged by eye in one session after 10 has changed the
  legend and 10b has drawn the events, and before 11 captures the
  README's images. The hyperperiod chart's threshold and pitch are
  its too (`deployment_overlay.md` answer 11).
  - **The text levels' floors** (increment 6). A root whose fit falls
    below a floor loads without its names: `library` fits at about 0.36,
    at `segments`, and `large` below the first floor. At 0.52 the display
    names show at about 6 px; the floors might rise to about 0.8, 0.6 and
    0.4.
  - **Cut constants and squeezed icons** (increment 6). `CONSTANT_WIDTH` at
    60 px cuts `kinds`' `a=1.0, b=2.0` to `a=1.0, b=…`, and `Int8[0, 0]`
    may cut under CI's fonts. The text icons wider than `ICON_WIDTH` on a
    Mac, `ẋ=Ax+Bu`, `N(s)/D(s)` and `N(z)/D(z)`, are squeezed to 44 px. The
    glyphs are a first pass.
  - **The stacked parameters** (increment 6) read name and value alike,
    the value under its name at the same indent; a lighter color or an
    indent would tell them apart.
  - **The overlay's marks at the fit** (increment 7). `failure_probe`'s
    `EmptyFaceSelection` pill is about 190 px on a 130 px block, running
    past its left corner; white on amber is the page's lowest-contrast
    text; the dead hop's cross, ±3 px, is small.
  - **The route pill's place** (increment 7). On a short pin, `rates`'
    `in`, it covers most of the top edge; at a tall assembly's bottom right
    it sits far from the entry port and reads as a block mark.
  - **The router's stub** (increment 6). The local router's backward route
    leaves the port by a 12 px stub, so after a drag its vertical segment
    can cross the port's label, as `actuators`' `δt` after dragging
    `plant` on `closed_loop`'s root.
- **The keyboard sweep**, after the release, by the user's ruling of
  2026-11-17, covering increment 10's timing tab too (increment 7, amended
  by increment 8b). The tree's rows and the pane's face rows take a click
  but are a `div` and a `tr`, not buttons; since 8b a tree row takes no
  focus, the selection being the tree's cursor, and the face rows have no
  keyboard path. The drawer's rows and filter are outside Tab's cycle of
  the four region roots, and the drawer's keys scroll its body without
  reaching a row. The right-click menu has no keyboard path, `t` being the
  keyboard's trace, and its button takes no focus on opening. The sweep
  needs a ruling on whether Tab enters a region or each region gets a row
  cursor.
- **After the core's first release.** The bundle's docs constant flips
  from `dev/` to `stable/` (`build_release.md` answer 7). The root's
  `[sources]` revision becomes a `[compat]` range, and `scripts/` keeps the
  exact pin as an equality bound plus the release tag (answer 2). The first
  pin bump to the registered core makes both edits. The schema's `$id`
  names the core's docs site and resolves only once that release deploys
  `stable/`; the file ships before the URL resolves.
- **The later stages**: the bridge, the live inspector and the cockpit.
  Their questions are in `initial_design.md`'s stage 2 to 4 sections, and
  the spec's debts in the core's `pending.md` bullet "The inspector,
  stages 2 to 4". The records name a few more for stage 2: the per-field
  markers on a struct marker, the value type schema and what the connect
  payload adds to the envelope (`descriptor_design.md`); the claim table
  behind the claim badge in a root input pin's slot and the root-inputs
  tab's writer column (`visual_grammar.md` answer 3, `workspace.md` answer
  6); a token in the URL and a protocol version (`live_session.md`
  answers 6 and 5). For stage 3, the runtime carrier: `StepError` is not a
  `DiagnosticError` and has no descriptor (`failure_descriptor.md`).

## Unordered

Items with no order among them: the format's open bumps, the records'
open questions, and the open items the landed increments left, each with
the increment it came from.

- **Format changes still open.** A `string` kind when
  a `String` port appears, and `min`/`max` on an integer marker if stage
  4's widgets want bounds. Locations beyond the declarations: the stage
  functions `y_state`, `y_direct`, `x_deriv`, `s_update` and the event
  functions, the last weighed at 10b's design session, none of them owed
  for a loop, whose row takes the structural
  reading the polish batch gives it. The call that builds an assembly: a
  core `Group`'s `types` row locates the core's own accessors, so the loop
  row links no hop a `Group` holds (`increments/20261117_polish/notes_polish.md`
  ruling 3). Each is ruled
  in the core's spec and log first, a free change until the first release
  and a minor bump after it (`deployment_overlay.md` answer 2).
- **A bare docstring link's joining, until the core's export audit**
  (`deployment_overlay.md` answer 15). The writer adds a target only to
  a link whose name its owner exports, and the core exports nothing
  until its audit (D-226), so no link of the core's own has one. Until
  then the page joins a bare link to its type's module, which sends four
  of `library`'s 101 to a dead anchor: `Pinned` twice, `StopFlag` and
  `stop_reason`, each from `Redstone.Library` into `Redstone`. The pin
  bump that follows the audit drops the joining and the docstring check
  that pins it.
- **A root input's pin beyond the root-inputs tab**
  (`deployment_overlay.md` answer 14). The tab marks a pinned root input
  and the consumers that pin it. Its tag on the canvas and its pin's
  pane show no mark, where a primitive's pinned face has one in both.
  Whether they take one is the user's to rule.
- **`frontend/MAP.md` past its size** (the polish batch). The map is about
  730 lines against `design/rules.md`'s "about 700", 714 before the batch.
  A trim outside any increment's text brings it back.
- **A rational part past `2^53`** (the core's exact-arithmetic audit,
  `Redstone.jl/design/reports/20261113_exact_arithmetic/report.md`
  section 2.8). The descriptor writes an anchor's `dt` and `tau` as the JSON
  integers `num` and `den`, exact in the file, and a deployment's three
  times, its counts `D` and `phi` and a pool entry's `factor` likewise. `rational` in
  `frontend/src/lib/analysis.ts` reads them into JavaScript numbers,
  which are exact only below `2^53`, so a period of `1//(2^61 - 1)` prints
  rounded. Display only. The cure is a reader that keeps the integers
  exact, or a format change ruled in the core first (D-433). The user
  ruled on 2026-11-14 that it stays out of the core's exact-arithmetic
  increment and waits here.
- **Names the export audit may change.** `descriptor` is provisional
  until the core's audit (D-226), and a diagnostic's `kind` is its type's
  name, which the audit may rename; the core's `pending.md` bullet "The
  exported-name audit" owns both. A rename reaches the schema, the
  fixtures and the page.
- **Vite's dev server proxying the socket** (`live_session.md` answer 8).
  The faster development loop needs a preference listing extra allowed
  origins and a forwarding entry in the Vite configuration. Taken up when
  the rebuild-and-reload loop chafes.
- **ELK on the main thread** (increments 3 and 4). `large`'s root takes
  about 460 ms from drop to drawn on an M4 at thoroughness 20, sizing and
  layout both on the main thread; a web worker would move them off.
- **`closed_loop`'s tangled root** (increment 4). Feedback wires loop over
  and under the level, as the spike found; increment 6's ELK pass took it
  from 62 crossings to 60.
- **Pins out of declared order** (increments 4 and 6). `large`'s root
  draws its two output pins reversed, which only `forceNodeModelOrder`
  fixes, at 663 to 699 crossings, so no check pins the order.
  `pid_controller`'s and `selection`'s input pins and `selection`'s and
  `kinds`' output pins are out of order too. `closed_loop`'s root input
  pins were given up to two crossings by increment 6's look pass, as
  `visual_grammar.md` answer 3's tie-break reads.
