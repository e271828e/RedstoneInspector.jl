# Pending

The work order and the open items, the state of each on its bullet and
nowhere else. The core's `Redstone.jl/design/pending.md` holds what the
spec owes the inspector's later stages and the descriptor changes the core
makes. `roadmap.md` holds the staging and each landed increment's facts.

## The work order

In working order, the first one next. Increments 1 to 10, 8b and 10b and
the keyboard by family have landed (`roadmap.md`).

- **The look pass before the release**, by the user's rulings of
  2026-11-17 and 2026-11-20: the canvas's open look items, judged by eye
  in one session, after 10b draws the events and before 11 captures the
  README's images. The hyperperiod chart's threshold and pitch are its too
  (`deployment_overlay.md` answer 11).
  - **The pane's header at 240 px** (increment 10). In Chromium the Copy
    button beside a long path scrolls the pane sideways by 14 to 21 px on
    six nodes, `closed_loop`'s `lqr_controller/command_pack` among them.
  - **The text levels' floors** (increment 6). A root whose fit falls
    below a floor loads without its names: `library` fits at about 0.36,
    at `segments`, and `large` below the first floor. At 0.52 the display
    names show at about 6 px. The floors might rise to about 0.8, 0.6 and
    0.4.
  - **Cut constants and squeezed icons** (increment 6). `CONSTANT_WIDTH`
    at 60 px cuts `kinds`' `a=1.0, b=2.0` to `a=1.0, b=…`, and
    `Int8[0, 0]` may cut under CI's fonts. The text icons wider than
    `ICON_WIDTH` on a Mac, `ẋ=Ax+Bu`, `N(s)/D(s)` and `N(z)/D(z)`, are
    squeezed to 44 px. The glyphs are a first pass.
  - **The stacked parameters** (increment 6) read name and value alike. A
    lighter color or an indent would tell them apart.
  - **The overlay's marks at the fit** (increment 7). `failure_probe`'s
    `EmptyFaceSelection` pill is about 190 px on a 130 px block, past its
    left corner. White on amber is the page's lowest-contrast text. The
    dead hop's cross, ±3 px, is small.
  - **The route pill's place** (increment 7). On a short pin, `rates`'
    `in`, it covers most of the top edge. At a tall assembly's bottom
    right it sits far from the entry port and reads as a block mark.
  - **The events pill on a narrow assembly** (increment 10b). On
    `events_deployment`'s `pods/a` and `pods/b` the reserved width is
    exact, so the rate pill and the events pill stand 2 px apart and fill
    the top edge.
  - **The tolerance's form** (increment 10b). The events tab prints
    `1e-6 of Δt_frame` in one code span, where `show` prints `1.0e-6`.
  - **The router's stub** (increment 6). The backward route's 12 px stub
    can cross the port's label after a drag, as `actuators`' `δt` after
    dragging `plant` on `closed_loop`'s root.
- **Increment 11, the release** (`roadmap.md`). No image of
  `closed_loop`'s root unless tidied by hand first: its tangle is the
  model's feedback loops (`rules.md`, ELK's pass).
- **After the core's first release.** The bundle's docs constant flips
  from `dev/` to `stable/` (`build_release.md` answer 7). The first pin
  bump to the registered core turns the root's `[sources]` revision into a
  `[compat]` range, and `scripts/`'s exact pin into an equality bound plus
  the release tag (answer 2). The schema's `$id` resolves only once that
  release deploys `stable/`.
- **The later stages**: the bridge, the live inspector and the cockpit
  (`initial_design.md`'s stage 2 to 4 sections, and the core's `pending.md`
  bullet "The inspector, stages 2 to 4"). The records add, for stage 2,
  the per-field markers on a struct marker, the value type schema and the
  connect payload (`descriptor_design.md`), the claim table
  (`visual_grammar.md` answer 3, `workspace.md` answer 6), and a URL token
  and a protocol version (`live_session.md` answers 5 and 6); for stage 3,
  a descriptor for `StepError` (`failure_descriptor.md`).

## Unordered

- **A bare docstring link's joining** (`deployment_overlay.md` answer 15).
  The page joins one to its type's module, which sends 4 of `library`'s
  101 to a dead anchor. The pin bump that follows the core's export audit
  (D-226) drops the joining and the check that pins it.
- **Names the export audit may change** (the core's `pending.md` bullet
  "The exported-name audit"): `descriptor` and a diagnostic's `kind`. A
  rename reaches the schema, the fixtures and the page.
- **Format changes still open.** Each is ruled in the core first, free
  until the first release and a minor bump after it
  (`deployment_overlay.md` answer 2).
  - A `string` kind when a `String` port appears, and `min`/`max` on an
    integer marker if stage 4's widgets want bounds.
  - Locations of the stage functions `y_state`, `y_direct`, `x_deriv` and
    `s_update` and of each event's guard and handler, as one change. The
    10b session of 2026-11-27 left the events' half out: the fields are
    additions, which a minor bump can carry after the release.
  - The call that builds an assembly, without which a loop's row links no
    hop that a core `Group` holds
    (`increments/20261117_polish/notes_polish.md` ruling 3).
- **Hints** (the keyboard session of 2026-11-25). Vimium's `f`, kept
  free: a label on every clickable thing, typed to press it. Wires, port
  squares and the legend's lines have no keyboard path, and on a build no
  key sets the legend's focus.
