# Pending

What the inspector still owes its records, the work order and the open
items, in two lists. Every item here is known and recorded; none is
abandoned. The core's `Redstone.jl/design/pending.md` holds what the spec
owes the inspector's later stages and the descriptor changes the core
makes.

## The work order

The bullets stand in working order, the first one next.

- **The class value and the module's name at the next pin.** The core
  renamed the descriptor's class value `"leaf"` to `"primitive"` at
  `c894949` on 2026-11-05, with `PrimitiveNode` and `PrimitiveFace` in the schema and no format bump,
  since the spec spells a node's class as assembly or primitive and *leaf*
  is the value leaf. By the user's ruling of 2026-11-11 it follows
  increment 8b and the core's retirement of the term *block*,
  so one pin carries both renames. The core's rename landed on its
  `master` at `c8a15b9` on 2026-11-12, not pushed, as increment 94 (D-453,
  `Redstone.jl/design/increments/094_retire_block/notes_increment_94.md`);
  its names are that session's overnight rulings and await the user's
  confirmation, so the pin's brief takes them from the core at its own
  tip and not from here. As landed: the module is `Redstone.Library` in
  `src/library.jl`, so a node's `type` reads `Redstone.Library.PID` and an
  alias `Redstone.Library.SumJunction`, and `signature` changes with them;
  the schema changes in one description string; a `types` row's `file`,
  `line` and `docstring` change as content; the hosted API anchors follow
  the module, `api/#Redstone.Library.<name>`; the glossary anchor
  `g-block` is gone and the library's docstrings link
  `@ref g-library-component`. Here every fixture regenerates, and the
  icon table's keys in `frontend/src/lib/icons.ts`, the tests' literals
  and the README follow. The pin's brief verifies that the docstring link
  rule's anchors follow the data and that no test or check cites
  `g-block`, and it drops the two exclusions for `Blocks.` names and
  `blocks.jl` paths from `help.spec.ts`'s check on the retired words,
  which the new names make needless. The text a user reads already says "primitive"
  and "component" since increment 8's look pass; the code keeps `block`
  for a box on the level (`glossary.md`). The same pin moves the six
  construction sites from `h =` to `Δt_frame =`, as the core's bullet on
  this repo says. When the pin moves: the schema copy
  follows and `npm run types` regenerates `descriptor.d.ts`; every
  comparison on the descriptor's `class` in `src/lib`, `src/canvas`,
  `src/frame` and the e2e specs reads `"primitive"`, while an internal role
  string such as `role: "leaf"` in `level.test.ts` is this repo's own call;
  every fixture carrying `"class": "leaf"` is regenerated from the core,
  since the regenerated schema refuses them; and the records that spell the
  old names, `descriptor_design.md`, `build_release.md`, `initial_design.md`
  answer 17 and `frontend/MAP.md`, are treated under the rule on frozen
  records.
- **The inspector, stage 1, its remaining increments**: the static
  inspector over the descriptor. Its records, none normative, are
  `initial_design.md` and one per axis beside it: `descriptor_design.md`
  (axes 1 and 2, §13.9, D-432),
  `visual_grammar.md` (axis 3), `prototypes/render_spike/report.md`
  (axis 4), `workspace.md` (axis 5), `live_session.md` (axis 6),
  `failure_descriptor.md` (the failure bump, D-434) and `build_release.md`
  (axis 7). `roadmap.md` stages the build in eleven increments and records
  each landed one with the facts the next briefs take. Increments 1 to 9
  and 8b have landed. After the pin, 10, the deployment
  overlay on both tracks after its design session writes the eighth
  record, `deployment_overlay.md`, with the writer's qualified `@ref`
  links folded in, so a bare `@ref` to a name in a parent module reaches
  its anchor (amending `descriptor_design.md` answer 10); then 11, the
  release. The Firefox project blocks CI as Chromium's does, by the
  user's ruling of 2026-11-15 after its first run with every check
  passed, so increment 6's reading 18, non-blocking until the release, is
  settled. The built-in Julia GUI is parked (D-310).
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

- **Format bumps still open.** The per-component chain of `sample_times`
  links that `descriptor_design.md` answer 9 left out, and the state
  events, both outside increment 10's narrowed scope. A `string` kind when
  a `String` port appears, and `min`/`max` on an integer marker if stage
  4's widgets want bounds. Locations beyond the declarations: the stage
  functions `y_state`, `y_direct`, `x_deriv`, `s_update` and the event
  functions, none of them owed for a loop, whose row takes the structural
  reading below. Each is a minor bump ruled in the core's spec and log
  first (D-433).
- **A rational part past `2^53`** (the core's exact-arithmetic audit,
  `Redstone.jl/design/reports/20261113_exact_arithmetic/report.md`
  section 2.8). The descriptor writes an anchor's `T` and `τ` as the JSON
  integers `num` and `den`, exact in the file. `rational` in
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
- **Zed's entry upstream** (`live_session.md` answer 6). Julia 1.13.3's
  editor table lacks Zed, so `edit` runs `zed path` without the line; the
  README gives the `InteractiveUtils.define_editor("zed")` entry for
  `startup.jl`. Proposing the entry to Julia is open.
- **The schema's record path.** The description in the core's
  `src/descriptor.json`, and so in `frontend/schema/descriptor.json`,
  still names `design/inspector/descriptor_design.md`. A source change in
  the core, proposed before it is made; the copy follows at the next pin
  bump.
- **ELK on the main thread** (increments 3 and 4). `large`'s root takes
  about 460 ms from drop to drawn on an M4 at thoroughness 20, sizing and
  layout both on the main thread; a web worker would move them off.
- **A primitive root's blank first line** (increment 3). Its leaf has an
  empty segment, so the block's bold first line is blank; the tree's row,
  the breadcrumb and the pane carry the label.
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
- **The tree's chevron** (increment 4). The `▸` glyph reads small in the
  system font.
- **A folder under a non-root node** (increment 4) starts collapsed when
  that node is expanded; no fixture has one.
- **The favicon** (increment 4). The console shows one 404, the
  favicon's.
- **A selection in a collapsed tree** (increment 4). The selected row does
  not scroll into view when the tree expands.
- **An unnamed `inspect` labels the tab `Group`** (increment 5) and
  downloads `Group.json`, `workspace.md` answer 10's label rule as written;
  the fixtures all carry `name`.
- **The ring kept on a press** (increment 5). A mouse press on a canvas
  that already holds keyboard focus keeps the ring; a blur and refocus on
  the press would drop it.
- **Shift-`l`'s bound** (increment 5). It stops at the deepest entry this
  load pushed, so it never leaves the page forward; the records ask that
  of Shift-`h` alone.
- **The leave prompt on old Safari** (increment 5). It calls
  `preventDefault` alone; Safari before 17 may also want `returnValue`.
  Untested.
- **`follow` on a large box** (increment 5). It aligns the top or left
  edge of a box larger than the viewport.
- **The drawer on a replacement** (increment 5). It keeps its state, and
  opens on `diagnostics` when the new model carries one; the records say
  nothing of it.
- **A `type:` hit's mark** (increment 5). A face hit found by a `type:`
  term alone carries no `mark`, since its row shows no type.
- **The download of a dropped file** (increment 5). The live tab offers
  the download only for a model that came over the socket, none for a
  dropped file.
- **The real server in the checks** (increment 5). No check runs it; the
  live tab is looked at through `inspect` with `bundle_dir` at
  `frontend/dist`.
- **Firefox's skipped checks** (increment 6). Its clipboard skip takes
  `live.spec.ts`'s whole hosted-copy check, so the no-connection and
  no-download pins do not run under Firefox.
- **The base grid's peach** (increment 6). Step 0 goes to a block ticking
  on the base grid; `closed_loop` has none, so its palette starts at
  anchor 1 and the peach goes to `sensing`.
- **The fit** (increment 6). It does not reserve the legend, which can sit
  over the drawing's bottom-left corner, and the type labels' room widens
  every level, 12% on `pid_controller` to 42% on `lqr_controller`, so
  every fit scale moves down.
- **The text levels' floors** (increment 6). A root whose fit falls below
  a floor loads without its names: `library` fits at about 0.36, at
  `segments`, and `large` below the first floor. At 0.52 the display names
  show at about 6 px; the floors might rise to about 0.8, 0.6 and 0.4.
- **Type labels take the pointer** (increment 6). They sit above the
  blocks with a title, so a block dragged onto a label has the label take
  its click there.
- **The router's stub** (increment 6). The local router's backward route
  leaves the port by a 12 px stub, so after a drag its vertical segment
  can cross the port's label, as `actuators`' `δt` after dragging `plant`
  on `closed_loop`'s root.
- **Cut constants and squeezed icons** (increment 6). `CONSTANT_WIDTH` at
  60 px cuts `kinds`' `a=1.0, b=2.0` to `a=1.0, b=…`, and `Int8[0, 0]` may
  cut under CI's fonts. The text icons wider than `ICON_WIDTH` on a Mac,
  `ẋ=Ax+Bu`, `N(s)/D(s)` and `N(z)/D(z)`, are squeezed to 44 px. The glyphs
  are a first pass.
- **The stacked parameters** (increment 6) read name and value alike, the
  value under its name at the same indent; a lighter color or an indent
  would tell them apart.
- **The child selected on other climbs** (increment 6). Forward landing on
  an ancestor and a tree double-click on an ancestor row also select the
  child left, since every level change goes through `show`; the records
  name the keys, the breadcrumb and back.
- **A focus with nothing on the level** (increments 6 and 7). A legend
  focus held onto a level with no line of its color, and a route on a
  level it does not cross, dim the whole level; Escape or another focus
  clears it, and the status bar still names the route.
- **A loop's drawer row has no location** (increment 7). The row was to
  link each member's `y_direct`, which the format does not locate; the
  user dropped that on 2026-11-05, since the remedy for a loop is
  structural (§5.5: insert dynamics, a unit delay, or restructure) and a
  member is often a library block the user cannot edit. The descriptor
  already carries what the row wants: `cycle` holds the wires as terminal
  pairs, the classification and each member's tracing mode, and an
  assembly's `types` row holds the location of its wire declarations. The
  row links each wire to the declaration of the assembly that holds it,
  labels a member traced structurally as presumed, and moves the location
  link under the message.
- **A loop's chain through a pin** (increment 7). Where the chain leaves a
  level through a pin there is no badge, `visual_grammar.md` answer 8
  giving the loop none, so the reader climbs by the breadcrumb.
- **The overlay's marks at the fit** (increment 7). `failure_probe`'s
  `EmptyFaceSelection` pill is about 190 px on a 130 px block, running
  past its left corner; white on amber is the page's lowest-contrast text;
  the dead hop's cross, ±3 px, is small.
- **The route pill's place** (increment 7). On a short pin, `rates`' `in`,
  it covers most of the top edge; at a tall assembly's bottom right it
  sits far from the entry port and reads as a block mark.
- **Routes that cannot draw** (increment 7). A face with no producer
  cannot be traced: the shell ignores the trace and the pane shows no
  button. A push that keeps an origin which no longer resolves leaves the
  route standing undrawn, with no status, until Escape or another trace;
  no fixture has one.
- **The status bar clips** (increment 7) on overflow, so at a narrow width
  a long route line can hide its clear control; Escape still clears.
  Untested.
- **The drawer's filter** (increment 7) shows only when rows exist, the
  empty state alone with none, where the brief's contract lists the filter
  in the body.
- **Keyboard paths and buttons** (increment 7, amended by increment 8b),
  for an accessibility sweep. The tree's rows and the pane's face rows take
  a click but are a `div` and a `tr`, not buttons; since 8b a tree row takes
  no focus, the selection being the tree's cursor, and the face rows have
  no keyboard path. The drawer's rows and filter are outside Tab's cycle of
  the four region roots, and the drawer's keys scroll its body without
  reaching a row. The right-click menu has no keyboard path, `t` being the
  keyboard's trace, and its button takes no focus on opening. The sweep
  needs a ruling on whether Tab enters a region or each region gets a row
  cursor.
- **A root input's seedability** (increment 8's look pass, 1.1). The
  root-inputs tab lost its pinned column, since version 1 writes a root
  input's `pinned` false, the wire pass having stripped the marker. The
  spec gives the fact a rule, a meet over the consumers: a root input pins
  when any consumer's entry pins, and is then unseedable. Open: whether
  the row shows it, under "seedable" rather than "pinned", and whether the
  client derives it from the consumers' flags, which miss a discrete
  consumer's wholesale pin, or the core carries it, a format change.
- **A primitive root's pane has no "open level" mark** (increment 8's
  second look). With nothing selected its pane is the primitive's own
  layout, the same as with the primitive selected, so nothing says that
  nothing is selected; `workspace.md` answer 4 puts the mark on an open
  assembly. Whether a primitive root's level takes it is the user's to
  rule.
