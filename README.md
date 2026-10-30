# RedstoneInspector.jl

The browser inspector for [Redstone.jl](https://github.com/e271828e/Redstone.jl)
models: it draws a build, a deployment or a failed build from its descriptor,
the core's rendering of the artifact to data (Redstone's spec, §13.9). Stage 1
is a static page reading descriptor files and a live session that pushes them
from Julia to an open tab.

**Status:** the writing half; the live session and the page are coming.

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

- `src/RedstoneInspector.jl`: the package.
- `test/runtests.jl`: the suite, run with `julia --project=test test/runtests.jl`.
- `scripts/fixtures.jl`, `scripts/synthetic.jl`: the fixture script and its synthetic models.
- `frontend/fixtures/`, `frontend/schema/`: the committed descriptors and schema copy.
- `Artifacts.toml`: the bundle's entry, written by the release workflow.
- `.github/workflows/CI.yml`: the package suite and the fixtures' drift check.

## License

MIT, in `LICENSE`.
