# Pending

The work order and the open items, the state of each on its bullet and
nowhere else. The core's `Redstone.jl/design/pending.md` holds what the
spec owes the inspector's later stages and the descriptor changes the core
makes. `roadmap.md` holds the staging and each landed increment's facts.

## The work order

In working order, the first one next. Increments 1 to 10 and 8b have
landed (`roadmap.md`).

- **The keyboard by family and the legend's line** (`roadmap.md`), by the
  user's rulings of 2026-11-25, which took the keyboard sweep from after
  the release and the tall legend from the unordered items. Its notes are
  `increments/20261125_keyboard_legend/notes_keyboard_legend.md`. The
  probes ran on 2026-11-25 and the notes hold them, with the user's rulings
  on them; `probes/hand.html` there waits for the user's keyboard. Next:
  the prototype, on the branch `keyboard-legend-proto`.
- **Increment 10b, the events** (`roadmap.md`), after a short design
  session of its own.
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
  - **The router's stub** (increment 6). The backward route's 12 px stub
    can cross the port's label after a drag, as `actuators`' `δt` after
    dragging `plant` on `closed_loop`'s root.
- **Increment 11, the release** (`roadmap.md`).
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

- **`signature` in a live session** (the pin bump of 2026-11-23). The
  descriptor prints a type as the session's `Main` sees it (the core's
  D-433), so an imported name prints bare and the pane then shows the
  signature on every such node. The page's to weigh.
- **Format changes still open.** Each is ruled in the core first, free
  until the first release and a minor bump after it
  (`deployment_overlay.md` answer 2).
  - A `string` kind when a `String` port appears, and `min`/`max` on an
    integer marker if stage 4's widgets want bounds.
  - Locations of the stage functions `y_state`, `y_direct`, `x_deriv` and
    `s_update` and of the event functions, the last weighed at 10b's
    design session.
  - The call that builds an assembly, without which a loop's row links no
    hop that a core `Group` holds
    (`increments/20261117_polish/notes_polish.md` ruling 3).
- **A bare docstring link's joining** (`deployment_overlay.md` answer 15).
  The page joins one to its type's module, which sends 4 of `library`'s
  101 to a dead anchor. The pin bump that follows the core's export audit
  (D-226) drops the joining and the check that pins it.
- **Names the export audit may change** (the core's `pending.md` bullet
  "The exported-name audit"): `descriptor` and a diagnostic's `kind`. A
  rename reaches the schema, the fixtures and the page.
- **A root input's pin beyond the root-inputs tab**
  (`deployment_overlay.md` answer 14). Its tag on the canvas and its pin's
  pane show no mark, where a primitive's pinned face has one in both.
  Whether they take one is the user's to rule.
- **Hints** (the keyboard session of 2026-11-25). Vimium's `f`, kept
  free: a label on every clickable thing, typed to press it. Wires, port
  squares and the legend's lines have no keyboard path, and on a build no
  key sets the legend's focus.
- **The scopes' empty note on a model with no `sample_times`**
  (increment 10's review). The timing tab's "No assembly is keyed in
  `sample_times`; every key names a primitive." shows there too.
- **`frontend/MAP.md` past its size.** It is 759 lines against
  `design/rules.md`'s "about 700". A trim outside any increment's text
  brings it back.
- **An integer past `2^53`** (the core's
  `Redstone.jl/design/reports/20261113_exact_arithmetic/report.md` section
  2.8). `loader.ts`'s `JSON.parse` reads the descriptor's integers into
  JavaScript numbers, so a period of `1//(2^61 - 1)` prints rounded.
  Display only. The cure is a reader that keeps them exact, or a format
  change ruled in the core first (D-433).
- **Vite's dev server proxying the socket** (`live_session.md` answer 8):
  a preference listing extra allowed origins and a forwarding entry in the
  Vite configuration, taken up when the rebuild-and-reload loop chafes.
- **ELK on the main thread** (increments 3 and 4). `large`'s root takes
  about 460 ms from drop to drawn on an M4 at thoroughness 20. A web worker
  would move the sizing and the layout off.
- **`closed_loop`'s tangled root** (increment 4). Feedback wires loop over
  and under the level, at 60 crossings.
- **Pins out of declared order** (increments 4 and 6). `large`'s root
  draws its two output pins reversed, which only `forceNodeModelOrder`
  fixes, at 663 to 699 crossings, so no check pins the order.
  `pid_controller`'s and `selection`'s input pins and `selection`'s and
  `kinds`' output pins are out of order too.
