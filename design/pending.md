# Pending

The work order and the open items, the state of each on its bullet and
nowhere else. The core's `Redstone.jl/design/pending.md` holds what the
spec owes the inspector's later stages and the descriptor changes the core
makes. `roadmap.md` holds the staging and each landed increment's facts.

## The work order

In working order, the first one next. Increments 1 to 10, 8b and 10b, the
keyboard by family and the look pass have landed (`roadmap.md`).

- **Increment 11, the release** (`roadmap.md`). Stage reached: designed
  on 2026-11-27, and step 1's two units launched that day with the user
  away. The first pin bump, to the core's `318859d`, is reviewed and
  merged on the local master, and waits for the user's review and push
  (`increments/20261127_pin_318859d/notes_pin_318859d.md`). The
  mechanics are built on the branch `release-mechanics`, rehearsed on
  disk and in `e271828e/RedstoneInspector-rehearsal`, and reviewed, the
  review's fixes landed on the branch and their delta checked; they
  stay off master, on one machine, until the landing push. Step 1 of
  the notes' order is done, and what follows waits for the core's
  increment 1b and for the user. The rulings,
  the order of the work, the prototype's answers and the state of the
  run are `increments/inspector_11_release/notes_inspector_11.md`. The
  README's pictures wait for a second pin bump to the core once the
  tutorial's increment 1b has landed there
  (`Redstone.jl/design/pending.md`), since they show its reworked
  `autopilot`. To relay to the core, by the user: its schema's text on
  `Diagnostic` lists four kinds that write `function`, and its writer
  serves a fifth, `BundleFieldError`, since its `dc884b9`. If the core
  corrects the text before the second bump, that bump brings the one
  schema line beside the example's changes. No image of `closed_loop`'s
  root: its tangle is the model's feedback loops (`rules.md`, ELK's
  pass), and with the drag gone it cannot be tidied by hand.
- **After the core's first release.** The bundle's docs constant flips
  from `dev/` to `stable/` (`build_release.md` answer 7). The first pin
  bump to the registered core turns the root's `[sources]` revision into a
  `[compat]` range, and `scripts/`'s exact pin into an equality bound plus
  the release tag (answer 2). The schema's `$id` resolves only once that
  release deploys `stable/`. From then the pin moves only at a core
  release.
- **The inspector's registration**, after the core's and before the core's
  announcement, so that the tutorial installs both by name on that day. The
  registration comment goes on the commit the workflow tagged, which holds
  the new `Artifacts.toml`, and never on the bump commit: answer 1 of
  `build_release.md` is right and answer 8's wording is not. The install
  line becomes `Pkg.add("RedstoneInspector")` in the README and in the
  core's tutorial, and the `release` branch leaves the job's push and the
  repo (`increments/inspector_11_release/notes_inspector_11.md`, ruling 7).
  To check then: General's waiting period for a new package, and its rule
  on a first version, the inspector having released several by URL.
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
  until the inspector's first release and a minor bump after it
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
- **Arranging a level by hand** (the look pass of 2026-11-27,
  `increments/20261127_look_pass/look_pass.md` entry 11.4). The drag was
  removed before the release. ELK lays out a level in one pass and cannot
  keep a block where it was dropped, so a drag handed the touching wires
  to a local router blind to other blocks, and the wires could not be
  dragged to repair the result. A drag comes back only as a real
  solution: one whose drawing is as clean as ELK's and predictable, with
  a way to repair what it leaves. None is chosen. One possibility is a
  drop that moves the block to a slot, ELK's `layerChoiceConstraint` and
  `positionChoiceConstraint` laying the level out again with the block in
  the nearest layer and place; whether elkjs 0.12 reads them under the
  declaration-order steering is unprobed. Hand arrangement saved beside
  the code stays refused (`initial_design.md` answer 12).
- **A flaky browser check.** `e2e/landing.spec.ts:106`, Meta+o from the
  search field, failed twice in about fourteen runs on the runner in
  Chromium, during the release's rehearsal on 2026-11-27 and 28. A red
  `frontend` job holds a release back until a re-run.
- **Hints** (the keyboard session of 2026-11-25). Vimium's `f`, kept
  free: a label on every clickable thing, typed to press it. Wires, port
  squares and the legend's lines have no keyboard path, and on a build no
  key sets the legend's focus.
