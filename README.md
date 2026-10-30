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
the pinned Redstone's `src/descriptor.json`. Both are committed, so the
frontend builds and tests without Julia. To regenerate them, from the
repository root:

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
    npm run e2e
    npm run dev

`npm test` validates every fixture against the schema copy with ajv, then runs
the unit tests of the pure modules over the fixtures. `npm run check` type-checks
the sources and the browser checks. `npm run e2e` runs the browser checks:
Playwright drives headless Chromium against the built bundle, served by `vite
preview`, so `npm run build` comes first, and `npx playwright install chromium`
once on a new machine. Each check drops fixtures on the page and saves
screenshots to `frontend/e2e/screenshots/`, which CI keeps as a job output. The
TypeScript types are generated from the schema copy into
`frontend/src/lib/descriptor.d.ts`, which is ignored and regenerated before
each of `dev`, `build`, `check` and `test`. The page reads a picked or dropped
descriptor and draws its root level: blocks, the level's boundary pins and the
wires, laid out by ELK. Drag pans, the wheel zooms, the corner button fits; a
double-click or Enter opens a closed assembly and Backspace returns to its
parent; a click selects a block, pin, wire or port square, and Escape clears.
`frontend/MAP.md` maps the files.

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
