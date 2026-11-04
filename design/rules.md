# Rules

The inspector's own rules, read after the core's: `Redstone.jl/design/rules/code_rules.md`, `brief_rules.md` and `increment_rules.md` apply here first, and this file adds the frontend's pipeline, what the frontend's increments taught, the frontend's traps, and how a record is amended. A rule that holds for the core too goes there.

## The pipeline for the frontend

What changes for a frontend increment, and only that; the Julia
increments run the pipeline unchanged.

- **The repo.** All eleven increments land in `RedstoneInspector.jl`, a
  separate repo with the layout of `build_release.md`'s answer 3. A
  prototype runs in a worktree of that repo, with `npm ci` run there and
  the committed fixtures at hand. The core repo gains nothing from stage
  1 beyond the `$id` commit already landed and increment 10's core half.
- **The map.** Increment 2 wrote `frontend/MAP.md`. Every later brief
  routes reading through it, and every increment extends it in its last
  stage. It holds the layout table, the vocabulary, what is built once on
  load, the stores, the DOM contract as tables of selectors, the
  keyboard, the live tab and the generated types. It holds no test
  inventory, since the test names carry what each test pins; no traps,
  which live in this file; no open items, which live in `pending.md`; and
  no changelog preamble, which git holds. It is read whole before a
  frontend change and kept under about 700 lines.
- **The brief's checks.** Beside its bookkeeping a frontend brief lists
  the unit tests and Playwright checks the increment adds, each named
  with the answer it pins, and the screenshots it must produce. The cold
  reviewer runs the checker, the tests and the browser checks, reverts
  each fix alone to show a check goes red, and reads the screenshots
  against the answers; it does not read the code for style.
- **The look-and-adjust pass.** After the review, before the increment is
  called done, the user looks: the screenshots from the CI run, and
  `npm run dev` in `frontend/` on the fixtures, which is the whole of
  the user's own frontend loop. What the user asks to change goes to the
  fixer as findings, with a cap of one pass per increment; what needs
  more is a note in the next brief.
- **Routing for the agent.** The prototype prompt names the records'
  answers, never whole records, and the agent reads the map whole before
  the frontend change; test output goes through `tail`, Vite's and
  Playwright's output being verbose; ELK's bundle and `node_modules/` are
  never read. The notes-file and
  milestone rules of the delegation pipeline apply unchanged.
- **Versions.** The spike's `package.json` fixes the dependency versions
  the first frontend increment starts from: Svelte 5.57, Vite 8.3, ELK
  0.12, Playwright 1.64, TypeScript 6.0, svelte-check 4.7, ajv 8.20.

## Frontend increments

- No reader judges the code, so the pins come from an independent oracle:
  a Python script over the committed fixtures repeating the derivations,
  cross-checked against the core's functions on the same models through
  the inspector's `scripts` project. The reviewer compares oracle, a
  scratch Vitest file and the modules, and writes a third reading of its
  own from the records; a disagreement is a finding. An oracle column is
  computed by the same definition the brief gives the module, and a rule
  over nodes is checked at the root path (a tree row but no block) before
  it enters either, since an oracle and a module written from one brief
  share one slip; the root case is pinned on a synthetic descriptor
  dropped as text.
- Before pinning a property on a fixture, check the fixture exhibits it;
  otherwise the test needs an inline synthetic structure, and a frontend
  check a copy of a fixture's text with the fact edited in.
- Probe the type generator and `tsc --strict` on a probe file outside the
  tree before the brief: the schema's idioms decide whether a core commit
  must precede launch.
- A mechanism a record calls untested (a layout engine's position hints,
  edge labels) is probed in the worktree before the brief, a scratch
  Vitest file over the real modules; what the probe rules out becomes a
  reading with the evidence, never a shape the builder discovers.
- Before launch, walk each check's narrative against the brief's own
  prose and the oracle's definitions; a builder follows the check.
- A geometric pin (nearest block, a pan) is a rule the check recomputes
  from the DOM; the brief states the rule, not numbers. An opacity pin
  reads the effective opacity, the product up to the svg, wherever a
  record says something "never dims" or "always wins": an element's own
  value misses a dim set on an ancestor group.

## Frontend traps

What the frontend's increments ran into, one bullet each, condensed from
`frontend/MAP.md` on the `increment-8` branch at `bb2511f`, where the
full text stays.

- **The generator's placeholders.** Schema branches spelled `true` came out of
  `json2ts` as `unknown`, so the core's schema spells them (core `778d6ee`);
  the envelope's branches still type `kind?:` optional, and narrowing works
  through the intersection with the top-level `kind`.
- **ajv's strict mode** refuses the schema (`strictRequired` on the `not`
  clauses), so the test runs ajv at default strictness.
- **Node types.** The spike's `tsconfig.json` limits `types` to `vite/client`,
  so `src/lib/fixtures.ts` carries `/// <reference types="node" />`.
- **Narrowing on a literal union.** A discriminant typed `"in" | "out"` does
  not narrow through a ternary chain, so the pins are two types.
- **Vitest's console.** Vitest hides a passing test's console output; a probe
  writes to a file.
- **A route's start.** The chain depends on the face a walk starts from, so a
  route carries its producer, not the chain, or a wire's route and its
  producer face's would differ.
- **The drop in Playwright.** Playwright cannot drop an outside file; a
  `DataTransfer` built in `page.evaluate` and a `DragEvent("drop")` on the
  window reach the shell's handler, and the pick path is checked by hand.
- **The preview server.** The checks run `vite preview` over `dist/`, so a
  stale `dist/` tests old code: build first; outside CI a server already on
  port 4319 is reused.
- **Fonts on Linux.** Text is measured in the system stack, which on the
  Ubuntu runner resolves to whatever Playwright installs, so CI's
  screenshots differ in face from a Mac's.
- **The wheel.** Svelte's `onwheel` may be passive, so the canvas adds its own
  listener with `{passive: false}` for `preventDefault` to stop the page
  scrolling.
- **Unfilled shapes take no click.** A shape with `fill="none"` is hit only on
  its stroke; `.shape` carries `pointer-events: visible`.
- **A double-click selects text.** Without `user-select: none` on the canvas a
  double-click selected the Fit button's label.
- **Counting after a click.** `expect(await locator.count())` can read before
  Svelte flushes; use `await expect(locator).toHaveCount(n)`, which retries.
- **Clicking a wire.** A polyline's bounding-box center is often off the
  line; `wirePoint` finds a point by `getPointAtLength` where
  `elementFromPoint` is the wire's hit path.
- **The hover after a click.** The pointer stays where it clicked, so after
  Escape the block under it still shows its `incident-hover` casings.
- **A newline in a title.** `&#10;` in a `<title>` does not survive Svelte's
  compile; the title is a template literal with `\n`.
- **ELK's components.** ELK packs disconnected components in its own order
  unless `considerModelOrder.components` is `MODEL_ORDER`.
- **ELK's cycle breaking.** `MODEL_ORDER` reverses every edge against model
  order, cycle or not, which put `lqr_controller`'s `tracker` first;
  `GREEDY_MODEL_ORDER` reverses a minimal set, model order the tie-break.
- **ELK's weight.** The bundle is one 1.49 MB chunk, mostly ELK, past Vite's
  500 kB warning; not split.
- **Svelte state.** The laid-out level and the session's state are
  `$state.raw`, each change a new value; a deep proxy over hundreds of
  blocks and routes buys nothing.
- **The splitter's pointer capture.** A splitter drag captures the pointer on
  the splitter so moves keep arriving over the panes, and the size is the
  start size plus the travel, never accumulated; an inactive splitter stays
  in the DOM with `pointer-events: none`.
- **Local storage in Playwright.** Each test's context starts with empty
  storage and `page.reload()` keeps it within a test; `drop` navigates to `/`
  itself.
- **Local storage in Vitest.** Node 26's experimental `localStorage` warns
  when touched, so the prefs store reads only when `window` exists.
- **Clipboard permissions.** Headless Chromium reads the clipboard only after
  `context.grantPermissions(["clipboard-read", "clipboard-write"])`.
- **`scrollIntoView` in a hidden pane.** A collapsed tree renders no rows, so
  a selection made while collapsed scrolls nothing, nor does expanding it.
- **Narrowing in templates.** An `{:else if}` on a union discriminant does not
  narrow the later branches; the pane narrows with `"signature" in facts` and
  `"id" in facts`.
- **Whitespace in blocks.** Svelte drops a leading space inside `{#if}`, so a
  line built from conditional pieces is a joined string and a separator is
  written `{", "}`.
- **Class collisions.** The canvas's old wrapper `.frame` and the drawer's
  `section.pane.drawer` each made a contract selector match twice; the
  wrapper is `.viewport` and the panes carry only `pane` and `data-pane`.
- **A row's text.** A tree row's text includes the chevron's glyph; checks read
  `.segment`.
- **A face row's middle.** Playwright clicks an element's centre, which in a
  face row can be a link; the check clicks `.face-name`.
- **Word breaking in the pane.** `overflow-wrap: anywhere` let a cell shrink to
  one character, so the type cell has a `min-width` of `8ch` and only side,
  pinned and stage are `nowrap`; CI's wider fonts overflowed a pane no Mac
  run did, so the check also pins the narrowest pane.
- **ELK's position hints.** Probed 2026-10-30: ELK ignores position hints
  while model order steers the layout, and with model order off it moves
  blocks nobody dragged, so a push relays out without hints and puts dragged
  blocks back (`workspace.md` answer 9).
- **A block drag's pointer capture.** Capturing on the press retargets a port
  square's click to the block; the canvas captures only past the 3 px slop,
  after `tick()`, since moving a captured node drops the capture.
- **The lost click.** Chrome fires no `click` after a release when the
  pressed node moved in the DOM, so the canvas selects a dragged block itself.
- **A pan only on the bare SVG.** The pan starts only when the press's target
  is the `svg` itself, so a press on a block is the block's.
- **The canvas effect and `untrack`.** The path drawing a stored layout runs
  under `untrack`, or `fit` reads the size and the effect refits on every
  resize.
- **A name collision.** The shell's canvas handle is `canvasView`: `canvas`
  collides with `Frame`'s snippet, a svelte-check error.
- **Focus on a canvas press.** A press focuses `.viewport` with no
  `:focus-visible` ring, and a row click lands in the tree region where
  `h j k l` are the tree's; a check wanting the canvas's keys presses Tab
  first.
- **`:focus-visible` and a press.** Chromium keeps `:focus-visible` on an
  element that stays focused, so a press on a Tab-focused canvas keeps the
  ring; `focus()` from a key handler matches `:focus-visible`.
- **`N` in Playwright.** `page.keyboard.press("N")` sends no `shiftKey`; the
  shell reads `N` from `e.key`, and checks press `Shift+N`.
- **`boundingBox()` of an SVG group.** Playwright's box for a `g.block` reads
  far larger than its client rect; in-view checks read a `.shape`'s client
  rect through `evaluate`.
- **The leave prompt in Playwright.** With a dismissing `dialog` listener
  `page.goBack()` never settles, so the check times out at 2 s and catches;
  Chromium asks only after a real input, which a `page.mouse` or locator
  click is.
- **Reverting a mutant.** `git checkout -- <file>` also drops the uncommitted
  change under the mutant; revert from a copy.
- **Tab from the search field.** The shell handles Tab before it ignores keys
  in text fields, so Tab cycles the regions from the field too.
- **The search's hit rows and focus.** A row click would blur the field and
  hide the list first; the row's `mousedown` is prevented.
- **`descent`'s straight wires.** `plant` dragged down stays left of `gear`, a
  forward route; `drag.spec.ts` drags it past `gear` for the six-point form.
- **Under from marks, not node hits.** `levelHits`' `under` counts marked
  nodes, face owners included, where the oracle's table counts node hits, so
  for `face:in1` the page shows 3 under and the table none.
- **`blockBoxes` and the halo.** `getBBox` on a block's group includes its
  halos, 3 to 6 px larger, which barely moves the centers `nearest` reads.
- **The socket against `vite preview`.** The preview server refuses the
  upgrade at once, never `open`, so every check without a route runs the
  hosted copy.
- **`routeWebSocket`.** Route before `page.goto`; without `connectToServer()`
  it is a pure mock, its handler runs once per connection, and messages are
  read with `expect.poll` on the recorded list.
- **A negative frame check.** That a frame is dropped needs a sync point: a
  descriptor sent after it, whose rekeyed selection shows a replacement.
- **The download's bytes.** `download.path()` is compared to
  `Buffer.from(text, "utf8")`, `closed_loop`'s `δ` exercising UTF-8; the
  `Blob` URL is revoked late since some browsers read it after the click.
- **The status bar before a model.** The frame exists only with a model, so
  the live tab's waiting state needs a status bar the shell renders under the
  landing.
- **ELK's trunks and regions, probed 2026-11-02.** The orthogonal router
  already marks a fan-out's splits in `junctionPoints`, and compound nodes
  need `INCLUDE_CHILDREN` with each edge's points in its `container`'s
  coordinates.
- **ELK's pass, 2026-11-02.** Of fourteen option sets measured for crossings
  and bends, thoroughness 20 alone cut `closed_loop`'s root crossings with
  none more elsewhere and landed; no option fixes the tangle, which is the
  model's feedback loops (the table, cited by `src/lib/level.ts`, is in
  `bb2511f`'s map).
- **Arrowheads on thick wires.** A marker in `strokeWidth` units grew with the
  wire, so markers are `userSpaceOnUse`, one per wire color, the struct's on
  its core since `context-stroke` would take the core's color.
- **A label's text.** A type label's or text icon's `textContent` includes its
  `<title>`; checks read the text nodes alone.
- **`Delay`'s `K`.** The core prints `Delay{Float64, 3}` with `K` second, so
  `iconOf` takes the first top-level integer type parameter.
- **Wires above a region.** A wire crossing a frame takes the click there; a
  check clicks the frame's top edge clear of wires, or the caption.
- **A frame's edge band.** The edge takes a click from 5.5 world units above
  to 0.5 below, so `regions.spec.ts` aims 2.5 units above the edge at the
  current scale.
- **ELK's edge labels, probed 2026-11-03.** A label without `text` is ignored,
  no option moves a tail label across the wire, coordinates are in the
  edge's `container`, and a reused output graph gives corrupt routes, so each
  layout takes a fresh `elkGraph`.
- **Glyphs in the text color.** A glyph's `<symbol>` uses `currentColor`, set
  by `.icon`'s `color` and inherited by `<use>`.
- **The rate palette's construction.** A searched palette cleared the bar but
  read as no nameable hues, and eight light fills distinct under every
  simulated vision do not exist; measure in CIEDE2000, since ΔE76 overstated
  the greens.
- **The default pane is narrow.** The detail pane's default 360 px is under the
  420 px container query, so a first load shows the stacked rows.
- **Shift with no pointer move.** A Shift press while the pointer rests sends
  no pointer event; the canvas's window `keydown` and `keyup` re-apply the
  last place.
- **A legend line in a button.** The button wrapped a line beside its `#9`
  number; it is `nowrap`.
- **Firefox locally.** Firefox cannot start inside this machine's command
  sandbox, so a local run is `npm run e2e -- --project=chromium`;
  `npx playwright test --list --project=firefox` checks the configuration.
- **A wire mark on a fixture.** The diagnostics that mark a wire are raised
  before the structure step, so port and wire marks are pinned on a
  synthetic copy of `failure_cycle`.
- **An endpoint carries no side.** A port mark names `{path, port}`; the side
  is an input when the node declares one by that name, else an output, and
  on the level's own path the mark lands on the pin's square.
- **The overlay during a layout.** `shown` holds the old level while a new
  one lays out, so `g.overlay` draws only once its level is the `path`.
- **The chain's pins under a focus.** `litBy` and `routeLit` light the
  level's own pins a chain or route runs through, or they dim under lit wires.
- **One `focusKey`.** `data-focus` needs a value for each focus, so it is its
  own prop, apart from `legendFocus`.
- **A right-click fires no click.** A right press gives `contextmenu`, never
  `click`; the pan and a drag start on the left button alone.
- **Escape with the menu open.** The shell's Escape listens in the bubbling
  phase; the canvas closes the menu from a capture-phase window listener and
  stops the event.
- **Checking the browser's menu.** Playwright cannot see the native menu; the
  check dispatches a cancelable `contextmenu` and reads `dispatchEvent`'s
  result.
- **The session in unit tests.** `session.svelte.ts` is module state shared
  across a file, so a test starts from `load(undefined)` and closes the help
  page it opened; Node has no `history`, so `closeHelp`'s back branch is
  `help.spec.ts`'s.
- **The consumers' order.** `terminalConsumers` walks depth-first, the oracle
  breadth-first, so `analysis.test.ts` compares `mode`'s as a set.
- **Two pills on one top edge.** With nothing reserved in `sizeBlock`, four of
  `closed_loop`'s root assemblies are too narrow for both pills, so the rate
  pill rides higher there; `orderWidth` serves the badge and the fit test.
- **An exact pin by `npm install`.** `npm install pkg@x.y.z` writes a caret;
  remove it and install again so the lock and `package.json` agree.
- **`marked`'s instance and its type.** The renderer is one module-level
  `new Marked(...)` leaving the global untouched, `parse(..., {async:
  false})` types a string, and `rewriteRefs` runs before parsing since the
  glossary form is no CommonMark link.
- **A constant in an e2e check.** A Playwright check cannot import an app
  module cleanly, so `detail.spec.ts` copies the docs URL and `help.spec.ts`
  reads `Project.toml` and the map's keyboard table.
- **A hash link's entry.** A click on `a[href="#help"]` fires `popstate` with
  `state` null in Chromium; `openFromHistory` stamps it one deeper, or the
  close would leave two equal level entries.
- **A hash link inside the help page.** Any hash but `#help` closes the page,
  so its section links prevent their default and call `scrollIntoView`.
- **Keys scrolling a nested scroller.** With `main` at `100vh` the page never
  scrolls; Space and the arrows scroll `article.help` only because it is
  focused and the shell leaves them alone.
- **A drop under the help page.** No canvas or outcome appears, so
  `help.spec.ts`'s `dropUnder` waits on the window's title.
- **A folded constant.** The minifier kept `` `${LIVE_URL}*` `` as a
  template, so the Vimium patterns never appeared in `dist/`; `help.ts`
  writes them out.
- **The map's keyboard table is read by a check.** `help.spec.ts` counts the
  map's keyboard rows against `table.keys`, so a row added to one alone
  turns it red.

## Amending a record

- An answer's text states the rule as it stands now.
- One trailing italic note per answer, after its text and before its
  *Why* paragraph, collects the amendments in date order, each with its
  date, its source and what changed: *Amended 2026-11-02 (increment 6's
  look pass): the fill was neutral gray.* The reason stays where the
  source gave it.
- No parenthetical amendment sits mid-sentence; the sentence keeps the
  current rule in plain prose.
- The *Why* and *Rejected* paragraphs are the inspector's decision log
  and stay whole.
- Answer numbers never change: code comments, the map and the briefs
  cite them, so an answer is never renumbered, merged or split.
