# RedstoneInspector.jl

[![CI](https://github.com/e271828e/RedstoneInspector.jl/actions/workflows/CI.yml/badge.svg?branch=master)](https://github.com/e271828e/RedstoneInspector.jl/actions/workflows/CI.yml?query=branch%3Amaster)

A browser inspector for [Redstone.jl](https://github.com/e271828e/Redstone.jl)
models. It draws a model as a block diagram you can navigate, color by rate,
search and trace. A failed build shows its diagnostics on the diagram. The
inspector reads the model and never edits it.

**Status:** stage 1, unreleased. It runs from a checkout. Run control and live
values come in later stages.

## Getting started

Until the first release ships the page as an artifact, build it once and point
the package at it:

```sh
git clone https://github.com/e271828e/RedstoneInspector.jl
cd RedstoneInspector.jl
julia --project=. -e 'using Pkg; Pkg.instantiate()'
cd frontend && npm ci && npm run build
```

```julia
using Preferences, RedstoneInspector
Preferences.set_preferences!(RedstoneInspector, "bundle_dir" => "/path/to/RedstoneInspector.jl/frontend/dist")
```

## Inspecting a model

```julia
using Redstone
import Redstone: build, Deployment
import RedstoneInspector: inspect

inspect(model)                                        # build the root and draw it
inspect(model; name = "closed_loop")                  # the same, labelled closed_loop in its own tab
inspect(Deployment(build(model); Δt_frame = 1//100))  # draw a deployment
inspect(broken)                                       # draw the failure, then rethrow
inspect(err)                                          # draw the DiagnosticError in the REPL's last error
```

The first call starts a local server on `http://127.0.0.1:8601/` and opens the
page in your browser. Later calls push to the open tab. Each `name` is its own
channel: `inspect(x; name = "variant")` draws at `/?tab=variant`. The page
shows `name` as the model's label and names its download after it; without a
`name` the label is the root's type, `Group` for a root built with `Group`.

Press `?` in the page for the legend and the keyboard. A click on a source
location opens it in your editor through `InteractiveUtils.edit`.

On a remote machine, set `open_browser` to `false`, forward the port with
`ssh -L 8601:localhost:8601 host` and open `http://localhost:8601/` locally.

### Writing a descriptor file

The page also opens a descriptor file, by drop or by Cmd-O:

```julia
RedstoneInspector.write_descriptor("model.json", model; name = "my model")
```

It takes a root component, a `Build`, a `Deployment` or a `DiagnosticError`, and
an `IO` in place of the path.

### Preferences

Set with `Preferences.set_preferences!(RedstoneInspector, key => value)`, read
when the server starts:

| Key | Default | |
|---|---|---|
| `port` | `8601` | The server tries the nine ports after it when it is taken. |
| `open_browser` | `true` | `false` on a remote machine. |
| `bundle_dir` | none | The page's folder, read from disk on every request. |

### Security

The server binds `127.0.0.1` and accepts a socket only from a page it served
itself. There is no TLS and no login: a local process can connect, as it could
read your files anyway. The page reads a dropped file in the browser and
uploads nothing.

## Development

- `julia --project=test test/runtests.jl` runs the package suite.
- `frontend/`: `npm test`, `npm run check`, `npm run build`, then
  `npm run e2e` (run `npx playwright install chromium firefox` once).
- `julia --project=scripts scripts/fixtures.jl` regenerates the committed
  fixtures and schema copy. CI fails if they drift.

`AGENTS.md` routes the design records, `frontend/MAP.md` maps the page and
`frontend/PROTOCOL.md` the socket.

### The pin

Redstone is unregistered. The root `Project.toml` and `scripts/Project.toml`
pin it by the same commit, and the fixture script refuses to run when they
differ. To bump, in one commit: set both revisions, delete `Manifest.toml`,
instantiate from the root, regenerate the fixtures and commit. Without
deleting the manifest, the fixtures regenerate against the old core.

### Layout

- `src/`: `write_descriptor`, `inspect` and the server.
- `test/`: the suite, with HTTP.jl's client standing in for the page.
- `frontend/`: the Vite and Svelte page, with its fixtures and schema copy.
- `scripts/`: the fixture script and its synthetic models.
- `design/`: the design records and the roadmap.

## License

MIT, in `LICENSE`.
