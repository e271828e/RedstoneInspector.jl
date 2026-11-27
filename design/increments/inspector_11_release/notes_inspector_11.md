# Increment 11, the release: notes

The record of increment 11. It opens with the design session of
2026-11-27, which settled seven points the roadmap's entry and
`build_release.md` leave open. The prototype is to be the implementation,
so this file is the increment's record and no brief is written. Nothing is
built yet.

## The facts the session started from

Read on 2026-11-27 at `415a64b`, the pin at the core's `fcd3660`, on
Julia 1.13.3. The look pass merged later that day, at `782eb72`. The
scripts behind the probed facts are in `probes/` beside this file.

- **What the tree already has.** The version baked into the page
  (`frontend/vite.config.ts`), both Vimium patterns and the hosted address
  (`frontend/src/lib/help.ts`), the docs constant at `dev/`
  (`frontend/src/lib/docstring.ts`), and `dist` and the screenshots as job
  outputs of the `frontend` job.
- **What it lacks.** The `base` line, `scripts/release.jl`, the `release`
  job, `readme.spec.ts` and the images, the real-server check, and the
  README's released form.
- **An install by URL resolves the core.** In an empty environment
  `Pkg.add(url = …)` of this repo took Redstone from this package's own
  `[sources]` entry, at the pin.
- **A user's own core wins.** With Redstone added first at its master, the
  same call kept it and ignored the pinned revision. Both packages say
  `0.1.0`, so no `[compat]` bound tells the revisions apart.
- **The landing push is the release.** `Project.toml` says `0.1.0` and no
  tag exists, so the tag-absent rule fires on the first push that carries
  the `release` job.
- **The repo's settings.** The workflow token is read-only by default.
  Master is unprotected. Pages is not enabled. The core's docs serve
  `dev/` and not `stable/`.
- **The actions' versions that day.** `upload-pages-artifact` 5.0.0,
  `deploy-pages` 5.0.1, `download-artifact` 8.0.2, `configure-pages` 6.0.0.
- **A tarball cannot be rebuilt.** `frontend/dist` packed twice by answer
  6's calls gave one tree hash and two SHA-256 values. The file uploaded
  must be the file whose hash `Artifacts.toml` holds. The tarball is about
  519 kB.
- **`gh release create` with a file** makes a draft, uploads and then
  publishes, by its help text. Nobody has run it here.
- **A test the release breaks.** `test/test_server.jl:141` expects
  `start!` to fail when `bundle_dir` is `nothing`. With a bundle named in
  `Artifacts.toml` and installed, that call succeeds.
- **The live session's two halves never meet.** `test/test_server.jl` runs
  the real server against an HTTP.jl client and serves `test/stub_bundle`,
  one `index.html`. `frontend/e2e/live.spec.ts` runs the real page against
  a mocked socket. The server has never served a `.js` file in a test.
- **Three checks read the format's major**: the page's loader, the
  `hello` the page sends, and the server's comparison of it with
  `Redstone.DESCRIPTOR_FORMAT`.
- **The core's `autopilot`.** `RedstoneExamples.autopilot(solution)`, the
  tutorial's chapter 5 loop, is in the examples at the pin: 13 primitives,
  4 assemblies and 39 wires, against `closed_loop`'s 24, 6 and 94. It
  declares eight anchors, and its `cascade` level draws five rate colors
  for two periods.
- **The core since the pin.** 87 commits, 32 of them in `src/`. The schema
  is unchanged, `src/descriptor.jl` gained a line, and
  `src/diagnostics.jl` changed in about 80 lines.

## The user's rulings

The session of 2026-11-27. The coordinator proposed and the user ruled,
point by point.

1. **The release is rehearsed twice before it is real.** The Pkg half
   runs locally, a bare repo on disk standing in for the remote. The
   GitHub half runs end to end in a throwaway public repo on the user's
   account, which the coordinator asks before creating and before
   deleting. The workflow reads the repo's name from `github.repository`
   so that one file runs in both. *Why:* a workflow cannot run locally,
   its first real run is v0.1.0, and only a throwaway allows failing a
   step on purpose and a second bump. *Rejected:* a trial version in this
   repo, which leaves a trial tag in public history; no rehearsal, with
   repairs by hand.
2. **The rule has two conditions.** The job releases when the tag
   `v<version>` is absent and the run's commit is master's tip. When the
   tip moved it releases nothing, ends green and writes a notice in the
   run's summary, and the later run releases its own commit. The job's
   own push is `--atomic`, which guards the seconds between the check and
   the push. *Why:* the tagged commit is then always one a run tested,
   plus one generated file. The tip condition also stops a dispatch from
   another branch. *Rejected:* rebasing the generated commit onto a moved
   master, which tags untested code; pushing the tag alone, which leaves
   master's `Artifacts.toml` naming no bundle; a red run for the skipped
   case, which turns the badge red over a double push. *Cost accepted:* a
   commit pushed with `[skip ci]` moves the tip and starts no run, so the
   release waits for the next push. Master on GitHub is one commit ahead
   of every clone after a release.
3. **The real-server check is a fifth job.** A spec starts Julia itself,
   tells it by standard input when to push, and checks five things: the
   page loads from `inspect`'s server with no failed request and no
   console error; the handshake succeeds; a first `inspect` draws; a
   second replaces it; and a named channel reaches `/?tab=name` and
   leaves `/` alone. It runs in Chromium and Firefox, in a job `live`
   that takes `dist` from `frontend` and that `release` needs. The spec
   and its Playwright config live apart from `e2e/`, so `npm run e2e`
   still needs no Julia. The `release` job ends by adding the package at
   the new tag in an empty environment and comparing the served
   `index.html` with `dist`'s. That step runs after the release is public
   and cannot gate it. *Why:* the facts above. *Rejected:* the check
   inside `frontend`, which would stop being the job that builds with no
   Julia; inside `release`, which finds a break on release day.
   *Left out:* open-in-editor, which would need a fake editor on the
   runner, and reconnection. The user agreed and left the mechanics of
   this point to the coordinator.
4. **The README's pictures show the core's reworked `autopilot`.** The
   hero is its root. The second picture is its `cascade` level in rate
   colors. The user chooses from real captures, taken after the pin bump.
   *Why:* the user asked for `closed_loop` without `lqr_controller` and
   `selection`, and the examples already hold that model. Its five colors
   for two periods then led the user to rework the examples' rates and
   sensing in the core: the rulings are R25 to R28 of
   `Redstone.jl/design/increments/roadmap_tutorial.md`, and the rework is
   the tutorial's increment 1b, first in the core's work order (the
   core's `d2cccb07`). *Rejected:* `approach_deployment`'s root and
   cascade, the first candidates; retiming the model in the fixture
   script alone; the timing tab, mostly text; `timing_deployment`, whose
   names say "test model".
5. **The format's bump rules bind from this release.** Version 1.0 is the
   format as of the inspector's first release. After it an addition bumps
   the minor and a break the major. The ruling is the core's D-483, which
   amends D-467, with §13.9. *Why:* by the facts above a released page
   meets whatever core its user holds. A break made at 1.0 would reach it
   as a file it accepts and misreads, and its structural checks only tell
   an older file from a newer page. *Rejected:* the rules binding from
   the core's first release, as D-467 had it; major 0 until then with the
   minor counting breaks, which needs a second matching rule in the three
   checks that read the major and is dead at 1.0.
6. **The pin moves to the core's tip once increment 1b has landed.** The
   bump is one commit by `build_release.md` answer 2. The new fixture
   follows as a second commit. Both are pushed before the landing push,
   while master's workflow has no `release` job. The README says in two
   sentences that a release is tested against the revision in its
   `Project.toml`, which a fresh environment gets, and that a Redstone
   already in the environment is used. It spells no hash.
7. **The install line names a branch, `release`.** The job moves it to
   each tagged commit in the same atomic push as master and the tag. The
   README adds one sentence for a fixed release, with the placeholder
   `rev = "vX.Y.Z"`. The branch goes when the inspector registers.
   *Why:* the line is always right and never edited, here and in the
   core's tutorial, and no version is written outside `Project.toml`.
   *Rejected:* the tag, a second statement of the version in two repos; no
   revision, which installs master's Julia code with the last release's
   bundle and breaks during stage 2.

## The coordinator's rulings

Mechanics the user left to the coordinator, each told to the user in the
session.

- **C1. The job's order.** Pack; create the GitHub Release as a draft
  with the tarball; push master, `release` and the tag atomically; publish
  the draft; deploy Pages. *Why:* a tarball cannot be rebuilt, so the
  upload precedes the push. A failure before the push leaves a draft to
  delete, and one after it leaves the right tarball one command from
  public.
- **C2. The capture.** 1200 by 750 at double pixel density, the detail
  pane folded, the focus moved off the canvas first. *Why:* GitHub shows a
  README about 900 px wide, and a double-click leaves a focus ring.
- **C3. The third picture** is `failure_cycle`'s root with the diagnostics
  tab open, unless the user objects at the captures.
- **C4. One new fixture, `autopilot_deployment`.** The fixture script
  calls the core's `autopilot` and changes nothing in it. The reworked
  model states no seconds, so the deployment gives the tick, with the
  values the tutorial's chapter 5 uses.
- **C5. The pictures' place.** The hero under the README's opening
  paragraph, the others after the code block of "Inspecting a model".
- **C6. The README's released form.** The status line stops saying
  "unreleased". "Getting started" becomes the install line and the first
  `inspect`. The build from a checkout moves under "Development". One
  sentence points to the hosted copy.
- **C7. The run's shape.** The prototype is the implementation, in a
  worktree under `../RedstoneInspector.jl-worktrees/`.

## The order of the work

1. The mechanics, now: the release script, the workflow, the `base` line,
   the real-server check, and the two rehearsals. None needs a picture or
   the new pin.
2. The core's increment 1b, in parallel.
3. The pin bump, then the `autopilot_deployment` fixture, both pushed.
4. The captures and the user's choice of pictures.
5. Pages' source set to "GitHub Actions", once, by hand or by the
   coordinator at the user's word.
6. The landing push, which is the release.

If 1b stalls on its retuning, the fallback is a release with today's
`autopilot` in tier colors. Each release redraws the pictures.

## Open, for the prototype

- What a failure after the atomic push leaves, and how a re-run of the
  job recovers.
- Whether the root's `Pkg.instantiate` installs the package's own
  artifact, which decides how `test_server.jl:141` changes.
- Whether Pkg downloads an artifact from a `file://` address, for the
  local rehearsal.
- Whether a published draft attaches to the tag the job pushed.
- Whether `Pkg.update()` follows the `release` branch.
- The `live` job's duration.

## The records this increment amends when it lands

`build_release.md` answers 1, 5, 6 and 8; `deployment_overlay.md` answer
2, for D-483; `roadmap.md`'s entry; `pending.md`; `AGENTS.md`, for the
fifth job and a fetch after a release; and the README.
