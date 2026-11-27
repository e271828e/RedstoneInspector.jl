# Increment 10b, the events: notes

The record of increment 10b. It opens with the design session of
2026-11-27, which the roadmap asked for, and then holds the run that built
the increment with the user away. The rules stand in `visual_grammar.md`
answer 11, `workspace.md` answers 4, 6 and 11 and `deployment_overlay.md`
answers 7 and 9. This file holds their reasons, what was rejected, the
coordinator's own rulings and what the user is to review.

*The increment merged on 2026-11-27 at `d623151`, after the user's check.
The worktrees, the branch and the folders under
`RedstoneInspector.jl-worktrees/` that this file names were local to one
machine and are gone, deleted that day. What the record rests on is in
`tools/`, `probes/` and `review/` beside this file.*

## The facts the session started from

Read on 2026-11-27 at `a07df11`, the pin at the core's `fcd3660`.

- A build body's `events` section has one row per primitive in walk
  order: its `events` in declaration order, each a `name` and a `policy`,
  and its `bundle`, the field names its guards and handlers receive.
- Declaration order is the priority order inside one component. A
  component fires its first eligible event per round, and components have
  no priority among themselves (the core's §10.6).
- `state_events` is a continuous-only declaration (the core's §8.2), so a
  primitive with events never carries a rate pill.
- `show(build.events)` prints a heading, `14 events over 41 components`,
  and a table of component, events as `name => policy` and bundle, one row
  per declaring component. `show(deployment)` prints `firing_budget`,
  `localization_tol` and `localization_budget` on its head line.
- A failure descriptor has no `events` section. A policy comes from the
  nominal probe, which a failure never ran.
- `descent` and `approach_deployment` hold `gear`'s `touchdown`. `library`
  and `library_deployment` hold 14 events over 6 components, 4 on
  `limited` and on `ld_integrator`. Every event in the 21 fixtures is
  localized, and every declaring primitive is a child of the root. No
  fixture shows a non-localized event, or a closed assembly with an event
  beneath it.
- A `types` row already locates `state_events`, so the pane's LOCATIONS
  lists it. For `GroundContact` that line names the guard and the
  handler. For the library's limiters it reads `limit_events(c)`.
- On a block the top edge holds the rate pill at the left, in rate mode
  alone. The bottom edge holds the order badge at the left and the
  overlay's badges at the right. `MIN_WIDTH` is 60 and `sizeBlock`
  reserves nothing for a pill (`design/rules.md`, "Pills sharing an
  edge").

## The user's rulings

The session of 2026-11-27. The coordinator proposed, and the user agreed
to all of it with two changes, rulings 7 and 12.

1. **A pill on the top edge at the right.** A primitive that declares
   events carries a pill in the rate pill's shape, reading `1 event` or
   `4 events`. It shows in both color modes and is no toggle. *Why:*
   events are rare, and they answer which blocks can cut a step. The
   stage 1 square is the precedent of a structural fact with no toggle.
   *Rejected:* a glyph beside the display name, which gives no count and
   has no place on an icon block; no canvas mark.
2. **A closed assembly shows the count beneath it**, as the rate pill
   shows its clocks.
3. **The title lists the events, and the pill takes no click of its
   own.** A press selects the block, and the pane shows the rest.
4. **No legend line.** The legend explains colors and exists in rate mode
   alone, and events have no color.
5. **A seventh section in the pane, EVENTS**, on a primitive that
   declares some, between TIMING and PARAMETERS, open by default. It
   holds the events in priority order and the bundle under them. A closed
   assembly shows one fact, its count. *Why open:* the section is short
   and most nodes have none.
6. **A fifth drawer tab, `events`**, with the count on the tab. *Why:*
   the page's home for a model-wide table is a drawer tab, and `gt` and
   `gT` already reach it. `deployment_overlay.md` answer 9 rejected a
   fifth tab for the deployment because its facts fit the timing tables.
   Events do not: those tables hold discrete primitives, and events belong
   to continuous ones. *Rejected:* a section at the end of the timing tab,
   which leaves `descent` with a timing tab that holds events alone.
7. **One row per event, with a `localized` column, and no bundle in the
   drawer.** The user's change. The coordinator had drawn `show`'s table,
   one row per component with its events in one cell, which grows long on
   a component with four. The bundle stays in the pane. The parity rule
   holds, since the page shows it there.
8. **The table's details.** The coordinator's, put to the user with
   ruling 7 and not objected to. The path shows on a component's first
   row alone. The `#` column restarts at each component, which also shows
   that priority is per component. A component with all its rows is one
   keyboard stop, since every row selects the same block: `j` and `k`
   walk 6 stops in `library` and not 14, and Enter on the stop selects
   the component. A click on any of its rows selects it too. The cursor's
   ring wraps the whole group. The cell reads `yes` or `no`: events have
   no mark per policy, where the root inputs' ◆ is the canvas's own, and a
   blank cell would read as missing. The pane's table has the same three
   columns.
9. **The three parameters head the events tab on a deployment.**
   `firing_budget` shows when the model declares an event, and
   `localization_tol` and `localization_budget` when it declares a
   localized one. *Why:* they read against the events. The condition is
   the user's ruling of increment 10's look on `h_min` and
   `attempt_budget`, which show only under an algorithm that uses them.
   *Rejected:* a fourth line of the timing tab's head list, always shown.
10. **Nothing more from the format.** The guard and handler locations
    wait, with the stage functions' locations, for one later change.
    *Why:* they are added fields, which a minor bump can carry after the
    release, and `pending.md` already lists the two together. So 10b
    needs no core work and no pin bump.
11. **A synthetic model for the two gaps.** It holds a keyed assembly
    with a discrete primitive and an event-declaring one beneath it, which
    serves the two pills and the count beneath. A policy alone can be
    edited in an inline copy, since it is one independent field.
12. **The two pills on an assembly keep fixed corners, and the block
    reserves their width.** The user asked how the pills sit in rate
    mode. The rate pill stays at the left and the events pill at the
    right, in both modes, so neither moves when the mode changes. The
    events pill has the background fill and a neutral stroke, since the
    rate pill's stroke is its clock's color. `sizeBlock` makes the block
    wide enough for both, whatever the mode, since a level's layout
    outlives a change of mode. *Rejected:* the bottom edge's rule, where
    the right pill draws over the left, which hides the clock count where
    both facts matter; both pills stacked from the left, where the events
    pill jumps on a change of mode; one joined pill, which puts the events
    inside the clock's stroke.
13. **The help page.** The legend gains a term for the pill, and the page
    defines "localized" once and says what `no` means, since the word
    `non_localized` appears nowhere else.
14. **No tree mark and no search prefix.** The tab finds every event.

## The coordinator's rulings before the prototype

The user left on 2026-11-27 with the word to build the whole increment.
These settle what the session left open. Each is a starting point: the
prototype reports where one proves wrong.

- **C1. One new fixture, `events_deployment`, with no build beside it.**
  A deployment body holds its build, so one file shows the pills, the
  pane, the tab and the three parameters. `library` and `descent` already
  show a build's events tab. `approach_deployment` and
  `closed_loop_deployment` are the precedent of a deployment with no build
  beside it. The model holds: a keyed assembly with a short name and few
  faces, so that the reserved width acts, holding a discrete primitive and
  an event-declaring one; an assembly nested in an assembly, each with
  events beneath, so that a count sums over depth; a non-localized event;
  and one component with a localized and a non-localized event, so that
  one group reads `yes` and `no`.
- **C2. The reserved width is the events pill's block's alone.** A block
  that carries the events pill is at least as wide as its top edge's
  pills, their insets and the gap. A block with a rate pill alone stays
  as it is, so no committed layout moves. The prototype reports a figure
  for that.
- **C3. `localization_tol` prints as `1e-6 of Δt_frame`**, the shortest
  exponent form JavaScript gives, with the unit the core's docstring
  states. `show` prints `1.0e-6`. The page copies no Julia float printer
  for one number. The two budgets print as integers.
- **C4. The pill's stroke is the text color**, as the order badge's. A
  primitive's title has a line per event in priority order, `1
  touchdown, localized` or `2 release, not localized`. An assembly's
  reads `4 events on 2 primitives inside`.
- **C5. The empty states.** The tab reads "No state events." on a model
  with none, and "No events: the build did not reach them." on a failure,
  as the order tab words its own. A failure draws no pill and no section.
- **C6. An assembly's fact** is `events` with the count, after `wires`,
  titled "State events declared by the primitives inside". The open level
  shows it as a closed assembly does, so the root's is the model's count.
- **C7. The tab stands last**, after the execution order, and shows its
  count only above zero.
- **C8. The cursor's ring around a group** is the builder's mechanism to
  find. It is probed in Chromium and Firefox before it is built, since an
  outline on a table's row group is the kind of thing browsers differ on.
- **C9. An event's row in the pane is no stop**, as a parameter's row is
  none: it does nothing when pressed.
- **C10. The help page's Simulink table gains no row.** "Zero-crossing
  detection" against a localized event would fit, and the session did not
  ask for it. It is listed for the user below.
- **C11. The pipeline.** The prototype is the implementation, built by
  one high-tier agent in the worktree `increment_10b` on the branch
  `increment-10b`, with this file as the record and no brief. One cold
  review follows, then a fixer and the delta check. Nothing is merged or
  pushed. The roadmap takes the landed facts after the user's merge.

## The readings

The prototype reported on 2026-11-27 with nine readings. The coordinator
ruled on each with the user away.

- **R1, taken. The ring around a group** (C8) is an outline on the
  component's `tbody`, set while its button holds the focus, and the
  button's own ring is off there. The table stays a table. The probe
  drew four variants in Chromium and Firefox and read the pixels 2 px
  outside the group on each side: an outline on the `tbody` under
  collapsed and under separate borders, a positioned `::after`, and a
  grid with subgrid groups. All four painted on all four sides
  (`probes/ring/`). *Rejected:* the subgrid, which turns the table into
  `div`s for nothing.
- **R2, taken. A group's click reuses the timing tab's `component` row
  kind** in `rowTarget`. A new row kind would select the same thing.
- **R3, taken. One head list for both tabs**, `HeadList.svelte`, moved
  out of `Timing.svelte`. A copy in the events tab would be a second
  mechanism for one thing.
- **R4, taken. The rate pill's text moved to `rates.ts`** as `ratePill`,
  from the canvas's `badgeOf`. `size.ts` needs that text in either mode
  for the reserved width, and one derivation serves both.
- **R5, taken. The tolerance reads `2.5e-5 of Δt_frame` in one code
  span.** For the user's look: the unit could stand as prose after the
  number.
- **R6, turned. The `localized` head takes a hover title** in the tab
  and in the pane, saying what `yes` and `no` mean. The prototype gave it
  none, reading ruling 13 as the help page's alone. Every other head and
  fact label on the page carries one (`workspace.md` answer 4), and the
  help page still defines the word once. It goes to the fixer.
- **R7, taken. A deployment with no events shows no head**, since no
  item's condition holds, and the empty sentence alone.
- **R8, taken. The `events` fact stands after `wires`** and before
  `member`.
- **R9, taken. The new fixture sets the three parameters off their
  defaults**, 2, `2.5e-5` and 16, so `approach_deployment` shows the
  defaults and the new one a mantissa.

Two things the prototype noticed also go to the fixer or the close:

- `j` and `k` scroll a group's button into view and not the group, so
  its last rows can stay below the fold. The fixer scrolls the group.
- The glossary gains "events pill", and `design/rules.md` the trap on
  `openPath` and a keyed container's field. Both are in the closing docs
  commit.

## The shape built

- `scripts/synthetic.jl`, `scripts/fixtures.jl`: the model `events` and
  its one fixture, `events_deployment`, 30,407 bytes. `Bouncer` has one
  localized event. `Thermostat` has two localized and one non-localized.
  The root holds the keyed `pods/a` and `pods/b`, each a ball and a
  discrete hold, `nest` with a non-localized `Step` and a nested `deep`,
  and `heater`. The counts beneath are 7 events on 5 primitives at the
  root, 1 on 1 in each pod, 2 on 2 in `nest` and 1 on 1 in `nest/deep`.
- `src/lib/events.ts`, new and pure: the section, a node's events, the
  count beneath, the tab's groups, the pill's text and title, the head's
  items. `rates.ts` gains `ratePill`.
- `src/canvas/size.ts`: `topPills`, `topPillsWidth` and the reserved
  width in `sizeBlock`. `Canvas.svelte` draws `g.events-pill`.
- `src/lib/detail.ts`, `Detail.svelte`: the EVENTS section and the
  `events` fact. `session.svelte.ts`: the fifth tab and the section open
  at first.
- `src/frame/tabs/Events.svelte` and `HeadList.svelte`, new.
  `Drawer.svelte`, `Timing.svelte`.
- `help.ts`, `Help.svelte`: the sixteenth term and its sample.
- `frontend/MAP.md`, at 675 lines.
- Checks: `events.test.ts` and `e2e/events.spec.ts`, new. `size`,
  `rates`, `session`, `detail` and `fixtures` tests, and the `help`,
  `cursor` and `draw` specs, follow. `e2e/fixtures.ts`'s `openPath` now
  passes a keyed container's field, which has no block.

## Measurements

The prototype's, on its uncommitted tree over `8e4c2c2`.

| check | before | after |
|---|---|---|
| Julia suite | 131 | 131 |
| unit tests | 641 in 31 files | 792 in 32 files |
| the checker | clean | clean |
| browser checks, both projects | 700 passed, 4 skipped | 740 passed, 4 skipped |
| fixtures | 21, 1,379,218 bytes | 22, 1,409,625 bytes |
| `frontend/MAP.md` | 660 lines | 675 lines |

- No other fixture and no schema file changed on regeneration.
- **No committed layout moved** (C2). A bundle built from the tip and the
  increment's were compared over every level of the 21 committed
  fixtures, 60 levels in each browser: every block's place and size and
  every wire's path are identical (`probes/layout/`).
- The pills' widths, the same in both browsers: `1 event` 40, `2 events`
  to `4 events` 46, `1 clock` 39. Every committed block that carries the
  pill is wider than it needs, the tightest `library`'s `step` and
  `relay` at 60 against 48 and 54.
- In the new fixture the reserved width sets `pods/a` and `pods/b`: 89
  wide against a need of 89.

## What the tests pin

42 mutants, all red, by `tools/mutants_events.py`, run with a worktree's
`frontend/` as its argument. One survived the first run, a count beneath
that matched a path prefix across a segment, and an inline test now kills
it. The rules on the section, the counts, the pill's text and title, the
head's conditions and the reserved width are unit-tested, tabled over
every fixture where a rule holds for all, with the root path on an inline
copy of `primitive`. The rules on the DOM are in `events.spec.ts`: the
pill's place in both modes, the two pills apart on the pods with nothing
moving between modes, the section's and the fact's order, the tab's
place and count, the ring, one stop per component, Enter and a click on
a later row, the empty states, the head, the 240 px pane and the help
term. `tools/fixture_facts.py` and `tools/draw_oracle.py` are the
prototype's oracles over the fixtures.

## The cold review's charter

An independent agent reads the answers the session amended, then the
page and the code. It runs the gate and writes its own oracle of the
counts from the records. It drives what the builder did not: a push from
a model with events to one without and back with the tab open and a
group focused, the tab under a failure and a structureless failure, the
pill under a search, a legend focus, a route and a diagnostic, a dragged
pod in both modes, the narrow pane and a narrow drawer, and long event
names. It reads the screenshots against the answers. It reverts each
rule alone to show a check goes red.

## The review's record

The cold review of 2026-11-27 ran on `3d5bc26` in its own worktree. Its
gate matched the prototype's counts. Its own oracle, written from the
records and the schema, agreed with `events.ts` and with the prototype's
oracle on all 22 fixtures, and the core's `show` printed the same events
and the same three parameters for the new model. Its own comparison of a
baseline bundle against the increment's found no committed layout moved:
59 assembly levels in each mode and each browser. The prototype's 42
mutants were red for it too, and 13 of its own 18. The coordinator ruled
on each finding with the user away.

- **F1, fixed.** An event name of 20 characters or more overflowed the
  240 px pane and pushed the `localized` column out of it. The name cell
  had no word breaking, where the faces' and the parameters' cells have.
  The name wraps now, and the check loads names of 32 and 77 characters.
- **F2, fixed.** A click on a group's second or later row selected the
  component and left the cursor on the drawer's root with no ring. The
  click looked for the row's button in the clicked `tr`. It finds the
  stop through the group now, and the text-selection guard reads the
  group.
- **F3 to F6, checks added.** Four rules held with no check: the pill
  takes no click of its own, it stays at the lowest text level, it dims
  with its block under a focus, and the tab prints the root's path as
  `/`. Each survived a mutant of the reviewer's and is red now.
- **F7 and F8, fixed here.** `pending.md` and C10 cited a "For the
  user's review" section that did not exist. It follows.
- **F9, fixed.** The help term said a non-localized event fires at the
  end of the step in which its guard first holds. The core's §2.3 has it
  fire at the first boundary that observes the edge, the step's end or
  an earlier localized event's instant. The term says so now.
- **R6 and the group's scroll, fixed** with the findings. Both heads
  carry one title, `LOCALIZED_TITLE`. `j`, `k`, `gg` and `G` scroll the
  whole group into view.
- **Accepted survivor.** The pill's stroke turned to the wire color
  passes every check. No check pins a color (`frontend/MAP.md`, "The
  canvas").
- **The delta check** of `d9e5d0b` found every ruled finding fixed, the
  fixer's nine mutants red, and 20 clicks across the other tabs and the
  pane unchanged from `3d5bc26` in both browsers. The gate there: 792
  unit tests, the checker clean, 750 browser checks passed and 4
  skipped.
- **N1, fixed in `6a28206`.** The delta check found one fault that the
  scroll fix brought in. In the drawer at its 80 px minimum, `k` onto a
  group taller than the tab's body aligned the group's bottom and hid its
  button. A group that does not fit is scrolled to its top now. The
  reviewer verified it in both browsers and ran the `events` and `cursor`
  specs, 92 passed. The fixer's full gate there: 792 unit tests, the
  checker clean, 752 browser checks passed and 4 skipped.
- **Not checked by anyone:** WebKit, and a push of a model with events
  over the live socket. The Julia suite and the drift check last ran at
  `3d5bc26`, and no later commit touches what they read.

`tools/mutants_events.py` holds 52 mutants now, the fixer's ten named
"fix:". `review/` holds the reviewer's oracle, its mutants, its probe
specs and the script that prints the core's `show`. Their paths read
`<probes>`, `<worktree>` and `<dev>`, to be replaced before a run.

## For the user's review

The run of 2026-11-27 stopped before the merge. The branch
`increment-10b` holds, from `a07df11`: the session's record (`8e4c2c2`),
the readings and the tools (`bd1f1a1`), the code (`3d5bc26`), the review's
fixes (`d9e5d0b` and `6a28206`) and the closing docs commit. Nothing is
merged or pushed, and `master` is untouched.

- **To check, the coordinator's calls:** rulings C1 to C11, readings R1
  to R9 with R6 turned, and the adjudication of F1 to F9 and N1 above.
- **To rule:**
  - The Simulink table could gain a row, zero-crossing detection against
    a localized event (C10). The session did not ask for it.
  - `zz` centres a group's button and not the group. Its scroll is apart
    from `focusStop`'s, and extending it is one line.
- **To look at,** with `npm run dev` in the worktree's `frontend/` on
  `events_deployment`, `approach_deployment` and `library_deployment`:
  - The two pills on a narrow assembly. On `pods/a` and `pods/b` the
    reserved width is exact, so the pills stand 2 px apart and fill the
    top edge.
  - The pill's stroke, the text color as the order badge's (C4).
  - The tolerance's form, `1e-6 of Δt_frame` in one code span, where
    `show` prints `1.0e-6` (C3, R5).
  - The words: the pill's titles, `LOCALIZED_TITLE`, the two empty
    sentences, and the help page's term.
  - The help page's "badge" term lists the clocks and the order position
    and not the events count, which has a term of its own.
  - The ring around a group, and the pane's EVENTS open by default.
  - The screenshots of the last e2e run are in the worktree's
    `frontend/e2e/screenshots/`, Firefox's under `firefox/`.
- **Noticed, not touched:** the `#` head's title is a literal written
  twice, in `Detail.svelte` and `Events.svelte`. `Canvas.svelte`'s
  `overlayBadges` keeps a local width with the formula of `size.ts`'s
  `pillWidth`, older than this increment.
- **Then:** the merge, the roadmap's entry with the landed facts, and
  the removal of what is local to this machine under
  `RedstoneInspector.jl-worktrees/`: the worktrees `increment_10b` and
  `increment_10b_review`, the folders `increment_10b_probes`,
  `increment_10b_review_probes` and `increment_10b_fix_probes`, and the
  file `increment_10b_notes.md`. What the record rests on is in `tools/`,
  `probes/` and `review/` beside this file.

## The user's review

- **2026-11-27. "Cuts", not "ends".** The help page's term said a
  localized event "ends the integration step" at its crossing. Under a
  fixed-step method the step is cut there and then finished (the core's
  §2.3, the remainder step), so the term says "cuts". The coordinator
  raised it and the user ruled.

- **2026-11-27. The rest stands as built.** The user checked the
  coordinator's rulings and the open items and asked for no change. `zz`
  keeps centring a group's button: the gap shows only in a drawer well
  below its default height, and the group's own centring would need the
  tall group's exception. The Simulink table gains no row. The two look
  items went to `pending.md` under the look pass. The user then asked for
  the merge, the push and the cleanup.

## Out of scope

- The guard and handler locations, with the stage functions'
  (`pending.md`, "Format changes still open").
- A tree mark, a search prefix and a legend line for events (rulings 4
  and 14).
- The look pass's items on the canvas, the pills' place among them.
