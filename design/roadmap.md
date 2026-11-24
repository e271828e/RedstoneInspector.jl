# The inspector: roadmap

The staging of the inspector's stage 1, the static inspector over the
descriptor, into eleven increments on two tracks. Grounded in the core's
tree at `2072d41` and in the seven design records under `design/`, which
hold every ruling; this file restates none and says which answers each
brief draws on. Each increment follows the pipeline as `rules.md` adapts
it for the frontend: a brief in `increments/` written against the landed
tree of its predecessors, a prototype in a worktree, one cold review, a
fixer, push.
The briefs are written one at a time, after the predecessor lands, because
they name files the predecessor creates.

## Origin

Stage 1's design closed on 2026-10-30 with axis 7 (`build_release.md`).
What it specifies is larger than any core increment, and different in
three ways that the pipeline as run for the core does not cover.

- **Size.** The rendering spike is 928 lines of TypeScript and Svelte for
  one canvas with layout and drag, a fifth of the visual grammar and none
  of the workspace. The three frontend records hold 42 answers, most of
  them a component or two with their tests. The static page is several
  thousand lines; the core's largest increments, 83 and 84, were about a
  thousand insertions, and 84's prototype ran its agent's context near
  its limit. The Julia package is one ordinary increment.
- **The review model.** `initial_design.md`'s answer 11 rules that the
  frontend's code is not read line by line: the type checker, the tests
  on validated fixtures and looking in a browser stand in. The brief must
  therefore define the checks, since no reader judges the code.
- **Looking, in a loop.** Layout quality, the palette, the icons and the
  keyboard's feel are "tuned in the browser" by the records' own words,
  and the spike reports the closed loop drawing tangled. These cannot be
  specified to completion in a brief; each needs a look-and-adjust pass
  with the user after the agent's first pass.
- **No map.** The pipeline routes reading through `implementation.md`.
  The frontend has none, and agent-built code nobody reads drifts in
  structure across slices.

## The rulings

All in this repo's `design/`, none normative, the core's spec winning
where they touch it (`Redstone.jl/design/spec.md` §13.9). A brief cites
answers by record and number.

- `initial_design.md`: scope, the eighteen stage-1 answers, the axes.
- `descriptor_design.md`: the format, the writer, the schema of record at
  `Redstone.jl/src/descriptor.json`, the fixtures rule (answer 16).
- `prototypes/render_spike/report.md`: hand-rolled SVG over ELK.js,
  the layout options exercised, what the spike did not test.
- `visual_grammar.md`: how every concept is drawn, answers 1 to 10.
- `workspace.md`: the frame, navigation, selection, the detail pane,
  search, the drawer, the analysis views, routes, view state, files and
  the hosted copy, the help page and the keyboard, answers 1 to 11.
- `live_session.md`: `inspect` and `write_descriptor`, the encoder, the
  server, channels, the protocol, open-in-editor, the development loop,
  the package and its suite, answers 1 to 10.
- `failure_descriptor.md`: the failure body the overlay reads.
- `build_release.md`: the release mechanics, the pin, the repo layout,
  the generated types, the tests, CI, the hosted address, the checklist,
  answers 1 to 8.
- `deployment_overlay.md`: the descriptor at parity with `show`, the
  timing notation, the timing tab, the pane's frames table, the chart,
  the legend, a root input's pin, the docstring links, the fixtures and
  the staging of increments 10 and 10b, answers 1 to 17.
- `rules.md`: the inspector's rules beyond the core's, the frontend's
  pipeline among them.
- `pending.md`: the work order and the open items, first bullet next.

## Staging

Eleven increments, each closer to increment 82's size than 84's, and a
prototype that finds one too large splits it at the brief. Two tracks:
the Julia track is increments 1 and 9, the frontend track 2 to 8, 10 runs
on both after a design session, and 11 closes both. Each entry names what it delivers, what is visible after it,
and the answers its brief draws on.

**Increment 1: the repo and the writing half of the package.** The
workspace with its `test` and `scripts` projects, the pin as two
`[sources]` entries at one core revision, the committed `Artifacts.toml`
naming no bundle, `write_descriptor` over its `IO` primitive with the
JSON.jl encoder at two spaces, the synthetic models in
`scripts/synthetic.jl`, `scripts/fixtures.jl` with its revision check,
the committed fixtures and schema copy, the `julia` and `fixtures` CI
jobs, the README's first form. The package suite covers
`write_descriptor` and the root form's rethrow; the server waits for
increment 9. Visible: `frontend/fixtures/` holding one descriptor per
model, and a green CI. Draws on `live_session.md` answers 2 and 10,
`build_release.md` answers 2, 3 and 6. Ordinary Julia work; it precedes
the frontend because the fixtures are its output, which corrects the
hand-on order of `build_release.md`. *Landed on 2026-10-30 at `f8f7a3b`
of `RedstoneInspector.jl`, pinned at the core's `4e51cbc`; its brief,
`brief_inspector_01_repo_and_writer.md`, records the repo's shape as
built, the review and the two CI runs. Facts the next briefs take from
it: the workspace instantiates from the root, never from a member; the
fixtures are `aircraft`, `descent`, `closed_loop`,
`closed_loop_deployment`, `large`, `containers`, `primitive`, `kinds`,
`rates`, `failure_cycle` and `failure_structure`, every one but
`aircraft` carrying `name`; a fixture's method locations are labels under
`<depot>/` and `<repo>/`; the CI jobs are `julia` and `fixtures`.*

**Increment 2: the foundation, pure half.** The Vite and Svelte project
under `frontend/` with the spike's versions, `npm run types` from the
schema copy with the two checks of `build_release.md`'s pending list,
the loader with the header check and the drop and pick paths, the
resolution modules, the parent rule, every face to its terminal, the
routes, the feedthrough edges, the level's graph, each with unit tests
over the fixtures, ajv over every fixture in the test run, and the map.
No drawing. Visible: `npm test` and `npm run check` green. Draws on
`initial_design.md` answers 17 and 18, `workspace.md` answer 10,
`build_release.md` answers 4 and 5. *Landed on 2026-10-30 at `ccbedf8`
of `RedstoneInspector.jl`, pinned at the core's `abf1d81`, which spells
the schema's node and envelope branches (`778d6ee`) after both generator
checks failed; its brief, `brief_inspector_02_foundation_pure.md`,
records the modules, the review and the first run of the `frontend` CI
job, 32 s. Facts the next briefs take from it: the map is
`frontend/MAP.md`, cited by section; the test helper is
`src/lib/fixtures.ts`; the module names are `loader`, `tree`, `resolve`,
`feedthrough`, `level`, `model`; `elkGraph` takes sizes and runs no
layout; the shell `App.svelte` prints the loader's outcome and is
replaced by increment 3; the `frontend` CI job exists and increment 3
extends it with the build, Playwright and the screenshots.*

**Increment 3: the foundation, canvas.** The SVG canvas ported from the
spike over the resolution modules: ELK per level with the spike's
options, blocks, faces as ports, the level's boundary pins, wires in
their plain form, pan and zoom with fit, open a level, selection as a
halo, the Playwright harness with one screenshot per fixture and level,
the network check of the no-CDN rule, and the `frontend` CI job with
its job outputs. Visible: every fixture drawn, the first look. Draws on
`visual_grammar.md` answers 1 to 4 and 9, the spike's report, `build_release.md`
answers 5 and 6. *Landed on 2026-10-30 at `57eb335` of
`RedstoneInspector.jl`, seven commits above `38b8c8e`, CI green with the
`frontend` job running the build and the browser checks in 85 s; its
brief, `brief_inspector_03_canvas.md`, records the shape, the review, the
look-and-adjust pass and the observations. Facts the next briefs take
from it: DOM-touching code lives under `src/canvas/` (`Canvas.svelte`,
`size.ts`, `layout.ts`, `palette.ts`, the placeholder colors) and
`src/lib/` stays pure, with the viewport math in `src/lib/view.ts`; the
map's "DOM contract" section is what the browser checks select on; the
harness is `frontend/e2e/`, one spec per concern, `e2e/fixtures.ts`
dropping a fixture in the page, screenshots to
`e2e/screenshots/<fixture>__<level>.png`; the shell `App.svelte` carries
the level line, Backspace and Enter, and the loader outcome, all of
which increment 4's frame replaces; `Canvas.svelte` takes `model` and
`path` with `onopen` and `onselect` callbacks and owns the selection and
the view, which increments 4 and 5 lift into stores; ELK runs on the main
thread with `GREEDY_MODEL_ORDER` cycle breaking and components packed in
model order; the fit scale is capped at 2; a primitive root's bold first
line is blank, its segment being empty, for increment 4's labels to
settle.*

**Increment 4: the frame.** Tree, breadcrumb, detail pane with the leaf
and assembly layouts, the drawer's tab strip, selection in sync across
the three, the landing panel with the privacy statement, the status bar,
the window's title. Visible: a page one can navigate. Draws on
`workspace.md` answers 1 to 4 and 10. *Landed on 2026-10-30 at `13d1f4c`
of `RedstoneInspector.jl`, nine commits above the pin bump `d77cf55`,
CI green with the `frontend` job in 91 s; its brief, `brief_inspector_04_frame.md`, records the shape,
the review, the look-and-adjust pass and the observations. Facts the next
briefs take from it: the stores live in `src/state/`, `session.svelte.ts`
for the per-tab state (the model, the open level, the selection as
`{level, target}` with the kinds block, wire, port and folder, the tree's
expansion set by path, the drawer's open state and tab) and
`prefs.svelte.ts` for the per-browser state under the local-storage key
`redstone-inspector/prefs` version 1 (the three splitter sizes and the
collapsed side panes); `select` sets the level for every kind and `open`
clears the selection; the panes live in `src/frame/` (`Frame.svelte` the
grid, `Tree`, `Breadcrumb`, `Detail`, `Drawer`, `StatusBar`, `Landing`),
the pure rows and facts in `src/lib/outline.ts` and `detail.ts`; the
canvas takes `selected` as a prop; `App.svelte` handles Backspace,
Alt-Up, Enter and Escape outside text fields, for increment 5's keyboard
table to absorb; the map's "DOM contract" has a frame section and
`data-level-path` sits on the breadcrumb; the checks are
`landing`, `tree`, `detail` and `frame` beside the earlier six; the
docstring and the signature are disclosures rebuilt on each selection,
the docstring's summary its first line; the drawer opens on load for a
diagnostic only, warnings counted in its tab; a selected node that is the
open level shows the level layout; the core's parameter summary opens
`NamedTuple` fields into dotted entries (D-439), so `DiscretePID` shows
nine `fixed.*` rows. Open items: the chevron glyph reads small; a
selection made while the tree is collapsed does not scroll into view on
expanding; a folder under a non-root node starts collapsed; the favicon
404; `closed_loop`'s root still tangled, ELK on the main thread, and
`large`'s output pins stacked in reverse.*

**Increment 5: interaction.** Search, the keyboard table, focus and Tab
order, view state by path across a push with the previous positions as
ELK hints, drag with the local router, the URL's level hash. Visible: the
keyboard section of the help page works before the page exists. Draws on
`workspace.md` answers 5, 9 and 11, `initial_design.md` answer 12.
*Landed on 2026-11-01 at `bf52830` of `RedstoneInspector.jl`, eleven
commits above `13d1f4c`, with increment 9's frontend piece, CI run 41358849311 green on all four jobs (frontend 119 s);
its brief, `brief_inspector_05_interaction.md`, and
`notes_inspector_05.md` record the shape, the review, the look-and-adjust
pass and the observations. The pass amended `workspace.md` answers 2, 4,
5, 9, 10 and 11 and `initial_design.md` answer 12 (`45c5047`). Facts the
next briefs take from it: ELK takes no position hints, the probe having
shown they work only with the model-order steering off; each level's view
and geometry are kept per path for the session, and a push keeps a view
only for a level whose blocks are unchanged; blocks, pins and root tags
drag with the local router in `src/canvas/router.ts`; the open level is the
URL hash, the root the empty hash, with `history.state` carrying the load
and depth that bound Shift+h and Shift+l; the keyboard table as built is
the map's, the canvas's `h j k l` jumping, the arrows panning, Shift+h/l
back and forward, Shift+j/k open and up, `0`, `z`, `n`, `N`, `d`, `/`, and
`t`, `r`, `y`, `o`, `?` swallowed for increments 6 to 8; the tree has its
own `h j k l` while focused; the four region roots take Tab and the ring
shows under `:focus-visible`; the pure modules gained `navigate`,
`search`, `rekey` and `protocol`, the live store and `src/live/socket.ts`
the socket; the detail pane's top is a `dl.facts` of labelled rows; the
leave prompt stands for a file-loaded model outside DEV. Open items: a
press on a canvas holding keyboard focus keeps the ring; the faces table
squeezes its kind cells at the pane's default width; an unnamed `inspect`
labels the tab `Group`; the Shift+l bound has no check; increment 4's
items stand.*

**Increment 6: the grammar's finish.** Regions for keyed containers, tier
and rate colors with the legend, wire styles by kind, the type-label
toggle, library icons keyed on alias then type, fan-out trunks, the three
text levels. The slice with the most looking; its brief budgets the
look-and-adjust pass largest. Visible: the closed loop reads at a glance.
Draws on `visual_grammar.md` answers 4 to 7 and 10. *Landed on 2026-11-03
at `2824f1f` of `RedstoneInspector.jl`, CI run 41549947096 green on all
four jobs (frontend 3 min 27 s); its brief, `brief_inspector_06_grammar.md`,
and `notes_inspector_06.md` record the shape, the review, the
look-and-adjust pass in two rounds and the type labels' probe. The pass
amended `visual_grammar.md` answers 4, 6, 8 and 9 and `workspace.md`
answers 3, 4 and 11. Facts the next briefs take from it: the fixtures gain
`library`, every shipped block, and `kinds` wired; the color mode is tier
or rate, `r` toggling; the palette in `palette.ts` is constructed, eight
OKLCh steps, four extras and a shared neutral read through `stepPair`; a
wire takes its producer's fill; a closed assembly takes its discrete
leaves' one triple or gray, with a clock badge; the badge straddles a
block's top edge at the right, leaving the top-left for increment 8's
order badge; a legend line focuses its triple through the search's
dimming, and Escape's chain is route, legend focus, search, selection;
type labels are ELK tail labels present in every layout (`sizeLabels`,
`EdgeLabel`, `LABEL_OPTIONS`, `Geometry.labels`), `y` toggling them with no
block moving; ELK runs with `thoroughness: 20`; a move to an ancestor
selects the child left, in `show`; plain `npm run e2e` runs Chromium and
the non-blocking Firefox project. Open items: Firefox fails the two
`leave.spec.ts` checks, its `beforeunload` dialog never reaching Playwright
on `goBack`; `closed_loop`'s root input pins sit out of declared order for
two crossings; the labels widen levels 12% to 42%, lowering every fit
scale; the fit covers neither the legend nor the labels; the router's 12 px
stub after a drag can cross a label.*

**Increment 7: overlays and routes.** The diagnostics overlay on
`failure_cycle.json` and the list alone on `failure_structure.json`,
warnings in amber, face routes across levels with the trace action, the
feedthrough edges drawn. Visible: a failed build explained on the
diagram. Draws on `visual_grammar.md` answer 8, `workspace.md` answers 6
and 8, `failure_descriptor.md`. *Landed on 2026-11-03 at `63bc8b4` of
`RedstoneInspector.jl`, CI run 41724649421 green on all four jobs (frontend 5 min 21 s), the
non-blocking Firefox project failing only increment 6's two `leave.spec.ts`
checks; its brief,
`brief_inspector_07_overlays.md`, `notes_inspector_07.md` and the look
pass's checklist, `look_inspector_07.md`, record the shape, the sixteen
readings the user ratified, the review and the pass. The feedthrough edges
were not drawn (reading 1): they move to increment 8's execution-order tab
as rows labelled presumed, as `workspace.md`'s pending item then said. Facts
the next briefs take from it: the fixtures gain `failure_nested`,
`failure_dead`, `failure_probe` and `warning`, sixteen in all;
`src/lib/diagnostics.ts` holds the drawer's rows, a loop's chain, each
level's overlay, the tree's marks and a row's target; `src/lib/routes.ts`
holds the trace, what a level draws of a route, the tree's route marks
propagated to ancestors and the origin kept across a push; the session
holds `diagnosticFocus` and `route`, and Escape's chain is route, focused
diagnostic, legend focus, search, selection; one dimming focus stands at a
time, route before diagnostic before legend, at a shared `palette.dim` of
0.35; `g.overlay` is the canvas's last child and never dims; the
diagnostic and route pills straddle a block's bottom edge at the right, a
root tag's slot staying stage 2's; the trace action is `t`, the pane's
button or the one-entry right-click menu; `effectiveOpacity` in
`e2e/fixtures.ts` reads opacity through the ancestors. Open items: a
loop's drawer row shows no location until the core's descriptor locates
`y_direct` (`pending.md`); the drawer's rows and filter, the right-click
menu, and the tree's and pane's face rows have no keyboard path; the
status bar clips a long route line; a kept origin that no longer resolves
stands undrawn.*

**Increment 8: analysis views and the help page.** The drawer's tabs,
execution order with the badges and the feedthrough edges as rows
labelled presumed (increment 7's reading 1), root inputs, the anchor and
component tables, and the help page's five sections with the docstring
link rule and the bundled Markdown renderer; the schedule and hyperperiod
chart moved to increment 10 on 2026-11-04. Visible: the static page
complete. Draws on `workspace.md` answers 7 and 11, `build_release.md`
answer 7. *Landed on 2026-11-12 at `af55fe5` of `RedstoneInspector.jl`,
pushed with its records at `4cb4c64`, CI run 43201633564 green on all four
jobs (frontend 6 min 12 s): 511 unit tests, 210 browser checks in
Chromium, and the non-blocking Firefox project failing only increment 6's
two `leave.spec.ts` checks, 205 passing. Its folder,
`increments/inspector_08_analysis_help/`, records the shape, the nineteen
readings, the reviews and two looks, the second at the user's request:
`brief_inspector_08_analysis_help.md`, `notes_inspector_08.md`, the
checklists `look_inspector_08.md` and `look2_inspector_08.md` with the
rulings under their entries, and the two fix briefs. The looks amended
`workspace.md` answers 4, 6, 7 and 11, `visual_grammar.md` answers 4 and 6
and `initial_design.md` answer 15, and added increment 8b. The help page
has four sections, the refusals having moved to the README's "By design".
Facts the next briefs take from it: the frame stays mounted and `inert`
in `div.under` beneath the help page, the shell noting the focused element
and its region at the open and returning focus at the close, and the
shell's own guard keeps every key but `?` and Escape from the frame, since
`inert` does not stop the window's `keydown`; `src/lib/help.ts` holds the
page's text as data, its `KEYS` mirroring the map's keyboard table, whose
row count `help.spec.ts` checks, so a key is added to both;
`src/lib/analysis.ts` holds the drawer's rows, `orderGroups` with the
stage 1 group and the numbered stage 2 group, `orderBadge` and
`rowTarget`; a click anywhere on an analysis row selects, through
`src/frame/tabs/rowClick.ts`, which blocks a click whose text selection
differs from its press's; the prefs gain `order`, `o` toggling the badges;
the rate pill straddles a component's top edge at the left, the order
badge its bottom edge at the left, the overlay's pills stack from the
bottom edge's right end and draw over a badge they meet, and nothing
yields; the open level's pane is the closed assembly's layout with the
mark "open level" for the Open button, and the pane states pinning on a
primitive's own face alone; a docstring renders through
`src/lib/docstring.ts`, `marked` pinned exactly, `DOCS_URL` the one
constant naming the core's docs; the build defines `__INSPECTOR_VERSION__`
and `__FORMAT_MAJOR__`; a reader's text says "component" and "primitive"
while the code keeps `block` and `leaf` until the pin. Open items, each in
`pending.md`: a root input's seedability; a primitive root's pane without
the "open level" mark; Firefox's two `leave.spec.ts` checks.*

**Increment 8b: the keyboard by region.** Added 2026-11-11 from increment
8's look pass (its 4.7 and additional comment), lettered so the eleven keep
their numbers. It follows increment 8's merge, since it builds on the frame
kept mounted under the help page, and precedes the pin. `m` toggles the
model tree and `i` the detail pane, over the frame's collapse buttons and
their prefs; Cmd-O and Ctrl-O open a file. The keys follow the focused
region: in the tree the arrows follow `h j k l`; in the detail pane and the
drawer `j`, `k` and the vertical arrows scroll, and `h` and `l` scroll
sideways or do nothing; on the help page `j` and `k` scroll; on the canvas,
or with nothing focused, the keys act as before. A pane's focused state
shows clearly. Added 2026-11-12 by the user's ruling: `u` puts the last
dragged component or pin of the open level back in its computed place, the
one dragged before it on the next press, and `U` puts back every one. The
view stays where it is, as after a push, `0` fitting when wanted, and a
button beside Fit, shown while the level holds a drag, does what `U` does.
A drag is otherwise kept through a push and a second drop of the file, so
only a reload undid one. The session already holds a level's dragged ids
in drag order, and a push already relays the level out and puts a list of
them back, so `u` is that path with the list less its last id and `U` with
none. A component's computed place does not depend on the other drags,
ELK reading none of them. Rejected: an undo per gesture, back to the place
before the last drag, which needs a history of positions per level, its
rule across a push and a redo, for the one case of a component dragged
twice, which a new drag covers. Its docs commit amends `workspace.md`
answer 11's key table and answer 9's sentence on a drag's lifetime.
Visible: a page one can drive from the keyboard pane by pane. Draws on
`workspace.md` answers 9 and 11. *Landed on 2026-11-15 at `ca5d342` of
`RedstoneInspector.jl`, pushed that day, CI run 43763489314 green on all four jobs (frontend 5
min 6 s): 511 unit tests, 230 browser checks in Chromium, and the
non-blocking Firefox project failing increment 6's two `leave.spec.ts`
checks and two of the review's focus checks, 223 passing. Its folder,
`increments/inspector_08b_keyboard/`, holds the brief with the ten
readings and the review's record, and the look's checklist
`look_inspector_08b.md` with the rulings under their entries. The look
kept every reading and amended `workspace.md` answer 11 for Shift with an
arrow, which acts as the arrow, and for the canvas's ring after a click,
which the first key turns on. Facts the next briefs take from it:
`App.svelte` dispatches `h j k l` and the arrows on `session.focus`,
`treeMove` in the tree, `scrollBy` by `SCROLL_STEP` (40 px) on
`.pane[data-pane="detail"] .body` or `.tab-body`, the jump and the pan
elsewhere; the help page's guard takes `?`, Escape, `j` and `k`; Cmd-O
and Ctrl-O, without Shift or Alt, click `main > input.pick`, outside
`div.under`; `m`, `i` or `d` hiding the focused region focus
`.viewport`; a tree row takes no focus, a row's click focusing
`nav.tree`, and `nav.tree` and `aside.detail` fill their pane's body; a
focused element removed, with the body holding the focus a microtask
later, gives the focus back to its region's root; the ring is
`.pane:has(.focused[tabindex="0"])` on the three panes and
`.viewport.focused:focus-visible` on the canvas; the canvas's `undrag(all)`
lays the level out again through `relayout` with a shorter list of
dragged ids and the view kept, a `run` counter dropping a layout that a
level change supersedes; `button.undo-drags` sits before `button.fit` in
`.tools`; `help.ts`'s `KEYS` has 25 rows. Open items, each in
`pending.md`: "Keyboard paths and buttons", amended. The four Firefox
failures were fixed the same day at `fbd6ef9`, CI run 43766529507 on the
branch passing every check in both browsers, Firefox 227 with its three
clipboard skips: Firefox fires no `focusout` when the focused element is
removed, so a `MutationObserver` on the region's root takes over the
removal rule while an element inside the root holds the focus, at no cost
measured on `large`; and Firefox replaces the initial `about:blank` with
the first page, so the leave checks open a page before the inspector.*

**Increment 9: the server.** On the Julia track after increment 1, in
parallel with 2 to 8: the module slot, HTTP.jl on the fixed port and
loopback, channels, the four `inspect` methods, the protocol's stage 1
half and `frontend/PROTOCOL.md`, open-in-editor and the `Origin` check,
the three preferences, `stop!`, the suite of `live_session.md`'s answer
10 with the stub bundle, the Zed check. Its one frontend piece, the
page's socket client with the status bar's connection state and the
download, lands once increment 4 has the status bar and is the only
point where the tracks touch. Visible: `inspect(model)` opens the page.
Draws on `live_session.md` answers 1 and 3 to 8. *Landed on 2026-10-30 at
`38b8c8e` of `RedstoneInspector.jl`, four commits on the Julia side only;
its brief, `brief_inspector_09_server.md`, records the review and the
readings, and `notes_inspector_09.md` their reasons. The review added a
fifth `inspect` method, on a `Base.ExceptionStack`, since the REPL's
`err` is the stack (reading 14). Facts the frontend takes from it, all
in `frontend/PROTOCOL.md`: the page greets with
`{"type": "hello", "channel": "<name>", "major": 1}` and asks for an
editor with `{"type": "open_location", "file": "<path>", "line": <n>}`;
the descriptor arrives as the pretty-printed envelope text in one text
frame, told from a control message by `format_version` against `type`;
binary frames are dropped; a second `hello` moves the socket to the new
channel; the handshake is accepted only from `http://localhost:<port>`
or `http://127.0.0.1:<port>`, the port 8601 or the next nine; the
socket client, the connection state and the download wait for increment
4's status bar. The frontend piece landed with increment 5 at `bf52830`,
the reviewer driving the live tab against the real server.*

**The pin to the core's `6afd6fb`.** Added from `pending.md`'s work order
after increment 8b. The pin on the core moves from `035aa95` to `6afd6fb`.
The descriptor's class value reads `"primitive"` (the core's `c894949`),
the library is the module `Redstone.Library` in `src/library.jl` (D-453),
and `Deployment` and `Simulation` take `Δt_frame` (D-443). By the user's
ruling the repo takes one vocabulary with it: "primitive" for a node with
no children, "component" for a library's component, and "block" for a box
on the level alone. *Landed on 2026-11-16 at `61f40f8` of
`RedstoneInspector.jl`, three commits; its brief,
`increments/20261116_pin_library/brief_pin_library.md`, records the
review, and `notes_pin_library.md` the rulings. Facts the next briefs
take: the code, the map and the DOM contract say "primitive", as
`g.block.primitive`, the tree row's `.primitive` and
`aside.detail[data-kind="primitive"]`; a node's `type` reads
`Redstone.Library.<name>` and its API anchor
`api/#Redstone.Library.<name>`; `large`'s synthetic types are
`ContinuousPrimitive` and `DiscretePrimitive`; `descriptor`'s methods sit
at `src/descriptor.jl:43` to `46`, where the list below gives them as of
`2072d41`. The library's seven components added since `035aa95` have no
icon yet, the work order's first bullet.*

**The icons for the library's new components.** Added from `pending.md`'s
work order after the pin, by the user's ruling of 2026-11-16 that it comes
before increment 10. `visual_grammar.md` answer 7's roster takes `Backlash`,
`Comparator`, `Fields`, `Fn`, `LimitedDoubleIntegrator`, `Select` and
`Sequence`, and the fixture script's `library` model gains one instance of
each, with two `Constant`s feeding `Fields` and `Select`. *Landed on
2026-11-16, without a brief, the user approving at the look pass, which
turned `Switch`'s lever and `Select`'s to face their inputs and chose
`u≥c` for `Comparator`. Facts the next briefs take: the roster holds 38
keys over 34 ids, of which `library` draws 33 as 40 icons, `constant-opaque`
being `kinds`' alone; `library` has 42 nodes, 41 primitives, 25 with a
stage 1 output and 18 with a stage 2 one, 2 in both, 48 wires, 16
feedthrough edges and 13 discrete primitives; the new `Constant`s are
`pair`, a `NamedTuple`, and `gear`, the `Gear` enum's `up`; a `Junction`
over a user function stays `fn`, and `Fn` is `apply`.*

**The polish batch.** Added from `pending.md`'s work order after the
icons, by the user's ruling of 2026-11-17 that it comes before increment
10: sixteen frontend items the landed increments left, each ruled on its
bullet. Among them, a loop's drawer row lists each wire pair's declared
hops with a link to the declaring method; a pin a loop's chain leaves
through takes a `loop` badge; a route that no longer resolves after a
push clears with a notice; a level on which a focus lights nothing does
not dim; a folder expands with its node; and the page gains a favicon.
It amends `workspace.md` answers 2, 4 and 8 and `visual_grammar.md`
answers 8 and 9. *Landed on 2026-11-17 at `ef670cc` of
`RedstoneInspector.jl`, five commits, without a brief: the loop row's
contract is in `frontend/MAP.md` and the rulings, the cold review's and
the look's included, in `increments/20261117_polish/notes_polish.md`.
Facts the next briefs take: a hop whose holder's qualified type is
`Redstone` or under `Redstone.` has no link, so no fixture's loop row
links anything, every holder being a `Group`; the status bar's one-off
notice is `session.notice`, set by `say` and cleared by the next push,
open, selection or trace; `containers`' `scale` is now the assembly
`Scale` holding the keyed container `taps = (c = Gain(10.0),)`, so the
model has 8 nodes, 2 assemblies and 6 root children, the outline 11 rows
of which 9 show at load, and `s2/out` feeds `scale/taps/c/e`; the pane's
"fed by" line reads "nothing" on an input face with no producer. The
gate stood at 128 Julia tests, 526 unit tests, and 500 browser checks
passed and 4 skipped, the Firefox clipboard checks.*

**Increment 10: the deployment overlay.** On both tracks, after the
design session of 2026-11-19 and 2026-11-20 that wrote the eighth record,
`design/deployment_overlay.md` (added 2026-11-04, the user's ruling after
increment 8's reading 1; rewritten 2026-11-20 to the record's scope, which
replaced a `schedule` section "and nothing else" and a bump of the format
with the parity rule and the format at 1.0). The core half came first, in
four parts, landed and pushed as the core's D-464, D-466, D-467, D-468 and
D-471 (the record's answers 1 to 8, 12, 14, 15 and 17). The inspector half
ran in three steps, by the user's ruling of 2026-11-22: the pin bump, the
record brought to the new pin, and the implementation. Visible:
`library_deployment`'s chart of four rows on the timing tab. Draws on the
record, and on `workspace.md` answers 4, 6, 7 and 10, `visual_grammar.md`
answer 6, `descriptor_design.md` answers 2, 4, 7, 9 and 10 and
`build_release.md` answer 7 as the record amends them. *The pin bump
landed on 2026-11-23 at `fb8da65` of `RedstoneInspector.jl`, six commits,
without a brief, the pin moving from the core's `6afd6fb` to `7ea3600`;
its notes are `increments/20261123_pin_7ea3600/notes_pin_7ea3600.md`. The
record was brought to the pin the same day, fifteen answers amended, its
rulings in `increments/inspector_10_deployment_overlay/notes_record_at_pin.md`.
Both are on `master`. The implementation was built on
2026-11-23, with the user away, on the branch `increment-10`, and merged on
2026-11-24 at `7b2e050`. It holds a docs commit, four stage commits taken from a prototype in three
parts on `increment-10-proto`, the cold review's fixes at `52524d1` with
the delta check green, and the closing docs commit. The user's look of
2026-11-24 followed, its rulings in `look_inspector_10.md` and its fixes at
`c4ddea3`, the delta check green, and a second look's after it. It draws the timing
tab in the notation with the chart, the pane's frames table with the
chain line, the legend's short line with room in the fit, a deployment's
own warnings, the root inputs' pinned mark and its causes, the loader's
refusal of an older core's file and the link rule that reads a target.
The four pairs kept as patches are ruled as built. The user's diff check is done. `notes_implementation.md` and
`brief_inspector_10_implementation.md`, beside it, hold the rulings, the
39 readings and the reviews. Facts 10b's brief takes: the gate stands at
128 Julia tests, 611 unit tests, and 620 browser checks passed and 4
skipped; the 21 fixtures hold 1,378,469 bytes over 20 structures, the new
ones `timing`, `timing_deployment`, `library_deployment`,
`rates_deployment` and `approach_deployment`; `src/lib/timing.ts` holds
every derivation as a pure function over exact fractions, `Q` over
`BigInt`, joins the schedule's rows by path and never by position, and
reads no float from the file and multiplies none, the palette's order
included; the timing tab runs the head list, the chart, the anchors, the base
grid's section with the coarsest line and the grid report, the rate scopes, and the components sorted on request "by Δt"; the chart in
`Chart.svelte` has a row per `(D, Φ)` with swatch buttons holding the
legend's focus, is omitted past `CHART_THRESHOLD`, 1000, and fits the
tab or scrolls its body at `CHART_PITCH`, 6 px, the frame counting toward both only
where frame tops are drawn; the pane's six collapsible sections are `details.section[data-section]`,
their state in `session.sections`, one for every node; `table.frames` and
`p.chain` sit in TIMING and fit the 240 px pane; a
legend line sets its marks, `legendText`'s text and its `Δt` in three
aligned columns, `D`, `Φ`, `τ` and the declaring scope in its title, and
the fit is `view.ts`'s `fitBeside` around the legend's measured box, the
first fit waiting a tick, at a cost to `large` alone; the readings a mark
or a legend line of 10b meets are the legend's 10, 26, 27 and 28, the
swatch's 11 and the pane's 25 and 36; `frontend/MAP.md` stands at 759
lines, past its 700 by ruling 8; the `events` section and the three event
parameters are read and not shown. The pin then moved to the core's
`fcd3660` for its timing notation (D-478 and D-479), built on 2026-11-24
with the user away and merged on 2026-11-25 after their review; its notes
are `increments/20261124_pin_fcd3660/notes_pin_fcd3660.md`. A timing is
`{anchor, D, phi}` and a `Relative` link `{D, phi}`, the page prints `Dₛ`,
`Dₐ`, `D₀` and their phases, a chart row is a `(D₀, Φ₀)`, its base ticks
are indexed by `n` and its frame tops by `k`, and the loader also refuses a
timing under the old keys. The gate stands at 128 Julia tests, 613 unit
tests, and 620 browser checks passed and 4 skipped, and the 21 fixtures
hold 1,379,218 bytes.*

**Increment 10b: the events.** After a short design session of its own,
and before the look pass (the record's answers 7 and 12, the user's
ruling of 2026-11-20). The session decides how a state event is drawn, a
mark on a block, rows in the pane, a legend line; where `firing_budget`,
`localization_tol` and `localization_budget` show; and whether the
drawing wants more from the format, the guard and handler locations
among it, which is a free change until the release. Its look-and-adjust
pass may open the look pass. Visible: `approach_deployment`'s `touchdown`
on `gear`.

**Increment 11: the release.** `scripts/release.jl`, the `release` job
with the tag-absent rule, Pages, the `base` path, the version baked into
the page, the Vimium patterns, the docs address constant and the
README's images, captured by the `frontend` job and deployed with Pages,
then the first release by the checklist. Folded in on 2026-11-17 from
`pending.md`'s open items, by the user's ruling: a check that runs the
real server, `inspect` serving the built bundle, where until then the live
tab is looked at by hand through `inspect` with `bundle_dir` at
`frontend/dist`. Visible: the hosted copy, the
README's images, and `Pkg.add` by URL at the tag serving the bundle. Draws on
`build_release.md` answers 1, 6, 7 and 8.

**Parallelism.** The Julia track runs beside the frontend track by
default: different language, files and suite, no merge risk, and it fills
the agents' time while the user looks. Inside the frontend the chain is 2,
3, 4, 5 strictly; 6, 7 and 8 are independent in what they do but share
the canvas, the stores and the drawer, so two of them run at once only
when their briefs name disjoint file sets from the map, each in its own
worktree and branch, merged serially with the second rebased on the
first. The help page half of 8 is the clean case; 6 and 7 both edit the
canvas and are the risky pair. The user's look-and-adjust passes are
serial whatever the agents do.

## Facts the briefs will cite

As of `2072d41` and the spike as committed. Every one is re-checked before
it enters a brief.

- The schema of record: `src/descriptor.json`, version 1.0 with the
  `alias` and `name` fields, 28 definitions, `$id` naming the core's docs
  site. `descriptor` has three methods, `src/descriptor.jl:40` to `43`.
- The examples' constructors, `examples/src/longitudinal.jl`:
  `aircraft`, `descent` and `closed_loop(solution, gains)`; `trimmed` is
  a condition, not a model (corrected by increment 1's brief);
  `level_flight` and `lqr_gains` give the closed loop's arguments. The
  package reaches Redstone by qualified import only.
- The pin check of 2026-10-29: a workspace root's `[sources]` entry for
  Redstone and a `scripts` project's entry for the examples with
  `subdir = "examples"`, both at one revision, resolve into one manifest;
  without the root's entry instantiation fails from both projects.
- The spike's files, `design/prototypes/render_spike/src/lib/`:
  `layout.ts` (129 lines, `levelOf`, `sizeBlock`, the ELK options),
  `descriptor.ts` (85, `parentOf`, `typeLabel`), `SvgCanvas.svelte` (77,
  `orthoRoute`), `BlockNode.svelte` (46); `scripts/validate.mjs` is the
  ajv call at default strictness; `scripts/synthetic.mjs` generated the
  150-component fixture the Julia synthetic replaces. `vite.config.ts` turns
  CSS code splitting off, the lazy-CSS trap.
- The docstrings' `@ref` forms over `src/`: 986 glossary links
  `(@ref g-term)`, 676 bare `[\`name\`](@ref)`, two others. Documenter's
  anchors in the local build: `Redstone.x_init`,
  `Redstone.Blocks.Junction` on the API page, `g-assembly` on the
  glossary page.
- The core's CI, `.github/workflows/CI.yml`: Julia 1.13 on Ubuntu and
  Windows, the gate line with `JULIA_LOAD_PATH="@"`, the concurrency
  group; the inspector's workflow copies its shape.
