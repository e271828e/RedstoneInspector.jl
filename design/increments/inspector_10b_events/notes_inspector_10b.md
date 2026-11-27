# Increment 10b, the events: notes

The record of increment 10b. It opens with the design session of
2026-11-27, which the roadmap asked for, and then holds the run that built
the increment with the user away. The rules stand in `visual_grammar.md`
answer 11, `workspace.md` answers 4, 6 and 11 and `deployment_overlay.md`
answers 7 and 9. This file holds their reasons, what was rejected, the
coordinator's own rulings and what the user is to review.

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
