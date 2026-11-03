# RedstoneInspector.jl

The browser inspector for [Redstone.jl](https://github.com/e271828e/Redstone.jl)
models: it draws a build, a deployment or a failed build from its descriptor,
the core's rendering of the artifact to data (Redstone's spec, §13.9). Stage 1
is a static page reading descriptor files and a live session that pushes them
from Julia to an open tab.

**Status:** the writing half and the live session; the page is coming.

## Writing a descriptor

```julia
using Redstone, RedstoneInspector
import Redstone: build, Deployment

model = MyModel()    # any root component
RedstoneInspector.write_descriptor("model.json", model; name = "my model")
RedstoneInspector.write_descriptor("deployment.json", Deployment(build(model); h = 1//100))
```

`write_descriptor(path, x; name = nothing)` takes a root component, a `Build`,
a `Deployment` or a `DiagnosticError`, and `write_descriptor(io, x; name)`
writes the same text to a stream. A root that fails to build writes the failure
descriptor, then the `DiagnosticError` is rethrown. The text is JSON at two
spaces of indentation with a trailing newline, and `name` follows `kind` in the
envelope only when given. Nothing is exported.

## The live session

`inspect` pushes a descriptor to the page in the browser, which draws it. At
the REPL, line by line:

```julia
import RedstoneInspector: inspect

inspect(model)                                 # builds the root and draws the build
inspect(broken; name = "broken")               # draws the failure, then rethrows
inspect(Deployment(build(model); h = 1//100))  # draws the deployment
inspect(err)                                   # draws the DiagnosticError in the REPL's last error
```

`inspect` takes a root component, a `Build`, a `Deployment`, a
`DiagnosticError` or an exception stack, and returns `nothing`. A root that
fails to build pushes the failure descriptor, then the `DiagnosticError` is
rethrown. At the REPL, `err` then holds the exception stack, and `inspect(err)`
pushes the last `DiagnosticError` in it.

`name` picks the channel, `""` by default, and is the envelope's `name`. The
page shows the channel `variant` at `/?tab=variant` and the default one at `/`.
Every tab open on a channel receives each push to it, and a tab reopened on its
URL gets the latest. When no tab is open on the channel, `inspect` opens one
in the default browser.

The first `inspect` starts a server on `127.0.0.1`, port 8601, and prints one
line with its URL and the pattern to exclude from Vimium. When 8601 is taken,
the server tries the nine ports after it. `inspect(x; port = 8700)` on the first
call picks another port for the session. On a remote machine, forward the port
with `ssh -L 8601:localhost:8601 host` and open `http://localhost:8601/` on
your own.

### Preferences

Three per-machine preferences, read when the server starts, each set after
`using Preferences, RedstoneInspector`; a line for a key already set throws
unless it adds `force = true`:

- `port`, default 8601:
  `Preferences.set_preferences!(RedstoneInspector, "port" => 8700)`
- `open_browser`, default `true`; `false` for the remote case:
  `Preferences.set_preferences!(RedstoneInspector, "open_browser" => false)`
- `bundle_dir`, default none, the installed bundle being served:
  `Preferences.set_preferences!(RedstoneInspector, "bundle_dir" => "/path/to/frontend/dist")`

### Developing the page

With `bundle_dir` set to `frontend/dist`, the server reads each file from disk
on every request, so a rebuild of the page and a browser reload show the edit
against the live server. With Revise loaded, edits to the server's request and
message handlers reach the running server. After a change to the session or
channel structs, `RedstoneInspector.stop!()` closes the server, and the next
`inspect` starts a fresh one.

### Open in the editor

A click on a source location in the page opens the file at that line through
`InteractiveUtils.edit`, the function behind `@edit`, so the editor is
`JULIA_EDITOR`, `VISUAL` or `EDITOR`. The server opens only the locations of the
`types` table of the descriptor the tab shows, the methods that declare each
component type.

The server binds `127.0.0.1` and accepts a socket only from a page served at
its own address, so another site open in the browser cannot connect. There is
no TLS and no login: a local process that is not a browser can connect, as it
could read the files anyway.

## Fixtures

`frontend/fixtures/` holds descriptors of the examples' models and of the
synthetic models in `scripts/synthetic.jl`, and `frontend/schema/` a copy of
the pinned Redstone's `src/descriptor.json`. Among the synthetic models,
`kinds` declares a face of every kind marker and wires each of its outputs to a
root output of the same name, so its root draws a wire of every style, and
`library` holds one instance of every shipped block, plus a `Junction` over a
user function, on two anchors with a relative and a phased rate, so every icon
and every legend form has something to show. Four models give the overlay
something to show, each ported from the core's suite. `failure_nested` closes
`failure_cycle`'s loop through a controller one level down, so the loop's chain
crosses a boundary. `failure_dead` is an artificial loop with a dead hop.
`failure_probe` is a probe throw, fail-fast with its structure, beside an
`EmptyFaceSelection` warning. `warning` is a clean build with that warning
alone. Both directories are committed, so the frontend builds and tests
without Julia. To regenerate them, from the repository root:

    julia --project=. -e 'using Pkg; Pkg.instantiate()'
    julia --project=scripts scripts/fixtures.jl

With no manifest, `Pkg.instantiate()` from a member project fails, so
instantiate from the root, which resolves the one manifest every member loads.
The file paths in a fixture's method locations are labels, never opened: the
script replaces the repository root with `<repo>` and the depot with `<depot>`,
so every machine writes the same bytes. CI regenerates the fixtures and fails
on any difference.

## Frontend

The page lives in `frontend/`, a Vite and Svelte project. From the repository
root:

    cd frontend && npm ci
    npm test
    npm run check
    npm run build
    npm run e2e -- --project=chromium
    npm run dev

`npm test` validates every fixture against the schema copy with ajv, then runs
the unit tests of the pure modules over the fixtures. `npm run check` type-checks
the sources and the browser checks. `npm run e2e` runs the browser checks:
Playwright drives headless Chromium and Firefox against the built bundle,
served by `vite preview`, so `npm run build` comes first, and `npx playwright
install chromium firefox` once on a new machine; `--project=chromium` or
`--project=firefox` runs one browser. In CI the Chromium run blocks and the
Firefox run is non-blocking until it has passed a few runs, to be made blocking
before the release; the checks that read the clipboard back skip under Firefox. Each check drops fixtures on the page and saves
screenshots to `frontend/e2e/screenshots/`, which CI keeps as a job output. The
TypeScript types are generated from the schema copy into
`frontend/src/lib/descriptor.d.ts`, which is ignored and regenerated before
each of `dev`, `build`, `check` and `test`. Before a file is open the page shows
a landing panel with its privacy statement: the file is read in the browser and
never uploaded, and the page loads nothing from any other site. The page reads a
picked or dropped descriptor and draws its root level: blocks, the level's
boundary pins and the wires, laid out by ELK. Around the canvas sit the model
tree on the left, the detail pane on the right, the breadcrumb above, the
drawer's tab strip with its counts and the status bar below; the splitters
between them drag, the side panes collapse, and both are kept per browser.
Drag pans, the wheel zooms, the corner button fits; a double-click or Enter
opens a closed assembly, from the canvas or the tree, and Backspace, Alt-Up or
the breadcrumb returns, selecting the assembly it came from; a click selects a
block, pin, wire or port square, or a row in the tree, the tree and the canvas
following each other and the detail pane showing what is selected; Escape
clears. A narrow detail pane stacks each parameter and each face's facts.

The canvas draws the visual grammar. Blocks are colored by tier, or, after `r`
or the switch at the right of the breadcrumb, by rate: each timing gets one of
eight colors, fastest first with the base grid first, the rest a neutral fill
with a numbered badge; a closed assembly takes the color its discrete leaves
share, gray when they tick on several, with a badge counting their clocks; and
a legend in the canvas's corner reads first a line for the continuous color,
then each rate on the level. A click on a legend line lights the blocks, assemblies and wires of
that rate and dims the rest, marking the tree; a second click, Escape or tier
colors clear it. The eight colors are evenly spaced hues, distinct under
normal vision; under weak color vision a legend line's click tells any two
apart. Wires show their kind by weight and
pattern (thin for a scalar, dashed for a flag, thick for a vector, a double
line for a struct, dotted for an opaque value), take their producer's fill in
rate mode, and branch from a shared trunk with a dot at each split;
`y` or the toggle beside the switch writes each output's type, its module
names dropped, whole beside its port, below the wire leaving it. The layout
leaves room for the types whether they show or not, so the toggle moves
nothing, and a dragged block carries them. Library blocks show an icon in place of their type's name, a glyph
or a short formula, a `Constant` its value. A keyed container's elements sit
inside a dashed region captioned with the field, each labelled by its key; a
click on the region's frame selects the container as the tree's folder row
does. Zoomed out, the text drops in three steps, face names first, then the
type names and icons, the block names last; wires and ports always show. The
color mode and the labels are kept per browser.

The open level is the URL's hash, `#level=sensing`, none at the root, so back
and forward move between levels and a reload or a link reopens one. Each
level keeps its zoom, pan and layout for the session, and a block or pin
dragged on the canvas keeps its place until the page reloads; only its own
wires are re-routed, and Shift held keeps the move to one axis. A second descriptor dropped or pushed over the first keeps
the open level, the selection, the expansion, the views and the search by path
and name, and the keyboard's focus; a level's view is kept only while its
blocks are unchanged, else it fits; what the new model lacks is dropped, and a
level that is gone falls back to its nearest ancestor with a note in the status
bar. While a model opened from a file is loaded, the page asks before it
unloads; a pushed one does not. The keyboard: on the canvas `h` `j` `k` `l`
move the selection to the nearest block or pin in that direction, the view
following; in the tree they move a row, expand and collapse; the arrows pan;
Shift-`h` and Shift-`l` go back and forward between the levels this page load
opened; Shift-`j` or Enter opens the selected assembly and Shift-`k`, Backspace
or Alt-Up climbs; `z` centres the selection; `0` fits, `+` and `-` zoom; `d`
toggles the drawer; Tab moves between the tree, the canvas, the detail pane
and the drawer, the focus ring showing for the keyboard only; `r` switches the
color mode and `y` the type labels; `t` traces the selected pin, port or
wire; `o` and `?` are reserved. Search, in the field at the top of the tree, opened
by `/` or Cmd-K, matches paths, types and face names as case-insensitive
substrings, `path:`, `type:` and `face:` narrowing a term to one field, a
prefix alone matching nothing yet; the hits list while the field has focus,
take a dashed halo on the canvas with the rest dimmed, and mark the tree's rows
with counts up collapsed ones; `n` and `N` select the next and the previous hit
of the whole list, opening its level.

A failed build explains itself on the diagram. A failure opens with the drawer
on its diagnostics tab, one row per diagnostic and warning with its kind, path,
message and source location, a filter over the three, and the count on the
tab. On the canvas a diagnostic halos the block it names in red, a warning in
amber, with a pill reading the kind or the function that threw; a marked port
square and a heavier wire show an unfed input. A loop halos its members and
draws its chain over the declared wires on every level it crosses, a `loop`
pill opening the closed assembly it continues into, and a dead hop draws as a
dashed chord with a cross across its block. The tree carries a red or amber
dot on every row with a diagnostic at it or beneath, its counts on hover. A
click on a row, or on a pill, focuses that diagnostic: what it involves stays,
the rest dims, and the row's element is selected on its level. A face route
starts from the detail pane's Trace button on a pin, a port or a wire, from
the Trace entry of their right-click menu, or by `t`: the value's whole path
from its producer through every fan-out to every consumer, cased in the
highlight hue on each level, the face traced from haloed, the consumers' ports
marked, a `route` pill on each closed assembly it enters and on each pin it
leaves a level by, a click on a pill following it in or out, and a blue dot on
each level's row in the tree. The status bar names it, "tracing `h_ref`: 2
consumers across 3 levels", with a clear control. The route survives
navigation, selection and a push that still declares its face; the trace
repeated, the clear control or Escape clears it. Escape clears the route
first, then a focused diagnostic, then a legend line's focus, then the search,
then the selection.

In the live session the page connects to the server's socket on load and
greets with its tab's channel. The status bar reads "connected, waiting for
`inspect`" until a descriptor arrives, then "connected", and "disconnected,
retrying" while the server is away; the page reconnects by itself. A download
button saves the pushed descriptor named after the model, byte for byte the
file `write_descriptor` writes, and a location click opens the editor. The hosted
copy has no server, so it shows none of this and a location click copies
`file:line`. `frontend/MAP.md` maps the files.

## The pin

Redstone is unregistered, so the package pins it by revision: the root
`Project.toml`'s `[sources]` entry for Redstone and `scripts/Project.toml`'s for
RedstoneExamples (`subdir = "examples"`) name the same commit of the core repo,
and the fixture script refuses to run when they differ. The workspace
`Manifest.toml` is never committed.

A bump is one commit, with whatever the package needs to follow the core:

1. Set both revisions to the new commit.
2. Delete `Manifest.toml`.
3. Instantiate from the root.
4. Regenerate the fixtures and the schema copy.
5. Commit.

Step 2 matters because with the old manifest kept, instantiation only warns
and the fixtures regenerate against the old core.

## Layout

- `src/RedstoneInspector.jl`: the package, `write_descriptor` and `inspect`.
- `src/server.jl`: the live session's server.
- `test/runtests.jl`: the suite, run with `julia --project=test test/runtests.jl`.
- `test/test_server.jl`: the live session's tests, with HTTP.jl's client as the page.
- `test/stub_bundle/`: the bundle directory the suite serves.
- `frontend/PROTOCOL.md`: the messages between the server and the page.
- `scripts/fixtures.jl`, `scripts/synthetic.jl`: the fixture script and its synthetic models.
- `frontend/fixtures/`, `frontend/schema/`: the committed descriptors and schema copy.
- `Artifacts.toml`: the bundle's entry, written by the release workflow.
- `frontend/`: the page, mapped in `frontend/MAP.md`.
- `.github/workflows/CI.yml`: the package suite, the fixtures' drift check, and the frontend's check, tests, build and browser checks, its screenshots and `dist/` kept as job outputs.

## License

MIT, in `LICENSE`.
