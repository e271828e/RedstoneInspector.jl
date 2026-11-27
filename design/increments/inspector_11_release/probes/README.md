# Increment 11's probes

The scripts behind the facts and the captures of the design session of
2026-11-27 (`../notes_inspector_11.md`). Each ran outside the tree and
takes its paths as arguments.

- `pack_twice.jl <dist>`: packs a built bundle twice with answer 6's
  calls and prints whether the tree hash and the tarball's SHA-256 agree.
  It writes two tarballs and an `Artifacts.toml` in the current folder and
  touches `<dist>/index.html`, so pass a copy. Run with plain `julia`.
  The tree hash agreed and the SHA-256 did not.
- `write_autopilot.jl <out>`: writes the descriptors of the core's
  `autopilot`, a build and a deployment, into `<out>`. Run with
  `julia --project=scripts` from the repo root.
- `write_variants.jl <out>`: the same for two retimed stand-ins, built by
  swapping `sample_times` through the core's `Group(g; …)`: one clock per
  assembly, and no clock with every rate in base ticks. They showed what
  fewer clocks look like and are not the reworked model.
- `capture_autopilot.mjs <dir> <port>` and
  `capture_variants.mjs <dir> <port> <name>…`: Playwright scripts that
  drop `<dir>/<name>.json` on a page served at `localhost:<port>` and save
  the root and the `cascade` level at 1200 by 750 and double density, the
  detail pane folded. Serve a built `dist` first, as with
  `python3 -m http.server <port> --directory <dist>`. They need a
  `node_modules` symlink beside them and a `package.json` of
  `{"type": "module"}` (`design/rules.md`, "A Playwright probe outside
  the tree").

Two facts had no script. Each is one call in an empty environment,
`julia --project=<empty folder>`:

```julia
using Pkg
Pkg.add(url = "https://github.com/e271828e/RedstoneInspector.jl")   # the core comes at the pin

Pkg.add(url = "https://github.com/e271828e/Redstone.jl")            # the core first, at its master
Pkg.add(url = "https://github.com/e271828e/RedstoneInspector.jl")   # the core stays at its master
```
