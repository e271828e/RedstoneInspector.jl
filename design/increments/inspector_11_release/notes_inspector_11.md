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
   account. The workflow reads the repo's name from `github.repository`
   so that one file runs in both. The user gave a standing approval for
   the run, the same day. Without asking, the coordinator may create one
   public repo, `e271828e/RedstoneInspector-rehearsal`, described as a
   throwaway that nobody should install; push branches, tags and releases
   to it; set its Pages source to "GitHub Actions"; and run, re-run and
   deliberately break its workflows. Without the user's word it pushes
   nothing to `RedstoneInspector.jl`, the first pin bump included, changes
   none of that repo's settings, and does not delete the rehearsal repo,
   which it leaves for the user with a list of what to look at. If git's
   keychain credential cannot push a workflow file, that one push goes
   through `gh`'s login, as
   `git -c credential.helper='!gh auth git-credential' push`, which
   changes no configuration. The login holds no `delete_repo` scope.
   *Why:* a workflow cannot run locally, its first real run is v0.1.0,
   and only a throwaway allows failing a step on purpose and a second
   bump. *Rejected:* a trial version in this
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
6. **The pin moves twice.** A first bump goes to the core's tip at once,
   before the tutorial's increment 1b, and takes in what the core changed
   since `fcd3660`. A second follows once 1b has landed and brings the
   example's changes alone. Each is one commit by `build_release.md`
   answer 2, and the new fixture follows the second as a commit of its
   own. All are pushed before the landing push, while master's workflow
   has no `release` job. *Why two:* the last diff before the release is
   then small and reads as the example's rework, and the first bump waits
   for nothing. *Rejected:* one bump after 1b, which mixes the reworded
   diagnostics with the example's changes. The README says in two
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
  worktree under `../RedstoneInspector.jl-worktrees/`. The user is away
  for the run, so the coordinator rules on the prototype's readings and
  records each one here for the user's review.

Made at the launch of step 1 on 2026-11-27, the user away, for the user's
review.

- **C8. The first bump's target is the core's `318859d4`**, the tip of
  its GitHub master that day, 89 commits past `fcd3660`. Its folder is
  `increments/20261127_pin_318859d/`.
- **C9. Two builders, one per unit**, each a high-tier agent in a
  worktree of its own: `pin_318859d` on the branch `pin-318859d`, and
  `release_mechanics` on `release-mechanics`, both cut from `3afd3ed`.
  The mechanics are committed on their branch, one commit per concern.
  *Why:* the branch waits for the second bump and rebases onto it, which
  an uncommitted patch would not survive.
- **C10. The rehearsal's pushes run from a clone of their own**, whose
  one remote is the rehearsal repo. The builder never runs `git push` in
  a worktree of this repo. *Why:* no command in that clone can reach
  `RedstoneInspector.jl`.
- **C11. Nothing published in the rehearsal repo is deleted.** A second
  or third release there takes a new version, in a commit that lives
  only in the clone. A draft that a failed run left may be deleted, which
  is C1's recovery. A deliberate break is a commit of the clone alone,
  and every run reported as the rehearsal's uses the branch's workflow
  file byte for byte. *Why:* ruling 1 lists pushing and breaking, not
  deleting.
- **C12. A lock around the browser checks.** `npm run e2e` reuses a
  server already on port 4319, so two worktrees running it at once would
  test one another's build. Each builder holds the directory
  `../RedstoneInspector.jl-worktrees/e2e.lock` for the run. The
  real-server check binds a free port and needs none.

Made on the mechanics' report, 2026-11-28, the user away, for the
user's review. Each is a reading of the builder's that the coordinator
kept.

- **C13. Pages deploys from a sixth job, `pages`.** `deploy-pages` runs
  in a job that names the `github-pages` environment, and GitHub lets
  that environment deploy from `master` alone. A `release` job naming it
  would fail before its first step on a dispatch from another branch,
  red where ruling 2 wants green, and every ordinary push would record a
  deployment that deployed nothing. So `pages` names the environment and
  runs only when `release` published something. It runs even when the
  release job's last step failed, since the release is public by then.
  C1's order holds, and ruling 3's fifth job is `live`.
- **C14. The rule has a third branch, the resume.** When the tag exists
  and its commit's parent is the run's commit, the job publishes the
  draft if it is still one and runs its last step. It packs nothing and
  pushes nothing. *Why:* a failure after the atomic push leaves the tag
  on the generated commit and the Release a draft, and a rule of the
  absent tag alone would stop a re-run there. An ordinary later push
  never matches, since its commit is no parent of the tag's. A failure
  before the push needs no branch: the re-run deletes the draft it finds
  and packs again.
- **C15. The driver is `frontend/live/driver.jl`**, beside its spec, run
  under the root project. *Rejected:* `scripts/`, whose environment is
  the fixture script's and pulls in the examples.
- **C16. The test of a start with no bundle runs under an empty depot.**
  A helper swaps `DEPOT_PATH` for one empty folder around those cases,
  and `src/` is unchanged. *Rejected:* a test that branches on whether
  `Artifacts.toml` has an entry; an argument on `_bundle_directory`, a
  source change made for the test.
- **C17. The small readings.** The notice is a workflow annotation
  titled "Nothing released", which the run's summary shows; an ordinary
  push writes one log line. The tag is lightweight, the Release is
  titled by the tag and its notes are the ones GitHub generates. The
  last step compares `index.html` alone. `release` runs on every event
  but a pull request, so the dispatch runs the same rule. Permissions
  are stated per job: `contents: write` on `release`, `pages: write` and
  `id-token: write` on `pages`, and no other job gains any.
- **C18. The mechanics get their cold review now**, one independent
  agent over the branch, and the later steps a review of their delta.
  *Why:* the workflow's first real run is the release, and the pictures
  and the README touch none of its logic but the Pages upload.

Made on the mechanics' cold review, 2026-11-28, the user away, for the
user's review.

- **C19. The rule's two release branches also require the run's ref to
  be master.** A run from another ref releases nothing, ends green and
  writes a notice. *Why:* a dispatch from a branch or a tag whose tip is
  master's tip passes ruling 2's tip condition. It runs in another
  concurrency group, beside master's own run, and the two can cross
  their drafts: one deletes the other's and its tarball is then the one
  published, which master's `Artifacts.toml` does not name. Only a new
  version repairs that. Ruling 2 means a dispatch from another branch to
  release nothing, and the tip condition alone does not hold it when the
  two tips are one commit. *Rejected:* a concurrency group on the job,
  where a later run can cancel a waiting release.
- **C20. The resume deploys Pages only for the latest release.** It
  writes the output that starts `pages` only when the remote `release`
  branch is at the tag's commit. *Why:* C14's test stays true for the
  run that released a tag, so a re-run of an old release's run would put
  its page back on Pages over a newer one.
- **C21. A failed command stops the step.** The rule, the draft's step
  and the publish run under `pipefail`, with each `git ls-remote` and
  `gh` result assigned on a line of its own, and an empty version stops
  the rule. *Why:* the runner's shell is `bash -e` without `pipefail`,
  so a failed lookup read as "no tag", "no tip" or "no draft".
- **C22. The job owns the tag's Release.** It deletes every draft it
  finds at the tag before it creates its own, a draft written by hand
  included. The README's release lines say so at the landing.
  *Rejected:* sparing a draft the bot did not write, which leaves two
  drafts at one tag and a publish that may take the wrong one.
- **C23. A lowered version is not guarded.** A version lowered to one
  that has no tag is released as any other, and `release` moves to it.
  A guard would be a condition the user has not ruled. Left to the user.

## The order of the work

1. The mechanics, now: the release script, the workflow, the `base` line,
   the real-server check, and the two rehearsals. None needs a picture or
   the new pin. They stay on their branch, since the first push of master
   that carries the `release` job is the release. Beside them, the first
   pin bump, a unit of its own as the earlier bumps were, merged locally
   when green and pushed by the user.
2. The core's increment 1b, in parallel.
3. The second pin bump, then the `autopilot_deployment` fixture, both
   pushed. The mechanics' branch rebases onto them.
4. The captures and the user's choice of pictures.
5. Pages' source set to "GitHub Actions", once, by hand or by the
   coordinator at the user's word.
6. The landing push, which is the release.

If 1b stalls on its retuning, the fallback is a release with today's
`autopilot` in tier colors. Each release redraws the pictures.

## The questions left to the prototype, answered

The probes are in the builder's scratch,
`release_mechanics_scratch/probes/` and `logs/`, until the unit closes.

- **What a failure after the atomic push leaves, and how a re-run
  recovers.** It leaves master, `release` and the tag on the generated
  commit and the Release a draft. The tarball's address answers 404, and
  a user's `Pkg.update()` fails on it until the draft is public. "Re-run
  failed jobs" recovers through C14's resume: it published the same
  draft, whose SHA-256 is the tagged `Artifacts.toml`'s (the rehearsal's
  case H).
- **Whether the root's `Pkg.instantiate` installs the package's own
  artifact.** It does, 507.9 KiB. After a release master's
  `test/test_server.jl:141` fails in 3 tests, and with C16 the suite
  passes 131 of 131.
- **Whether Pkg downloads an artifact from a `file://` address.** It
  does.
- **Whether a published draft attaches to the tag the job pushed.** It
  does. The tag stayed on the generated commit.
- **Whether `Pkg.update()` follows the `release` branch.** It does, on
  disk and on GitHub, from `v0.1.0` to `v0.1.1` and on to `v0.1.3`, each
  with its own bundle.
- **The `live` job's duration.** 218 s on a cold cache, of which the
  instantiation is 144 s and the check 28 s. 66 to 187 s with a cache,
  the instantiation still taking up to 98 s. The check alone takes 10 to
  12 s on the user's machine.

## The mechanics as built

Five commits on `release-mechanics`, from `3afd3ed`, hashes as of
2026-11-28 and before any rebase. A sixth holds the review's fixes
("The mechanics' cold review" below), and the workflow described here
is the one before them. `Artifacts.toml` is as master has it.

- **`98a6657`, the `base` line.** `base: "./"` in
  `frontend/vite.config.ts`. A new check in `e2e/network.spec.ts` serves
  the page under `/hosted/`, refuses every other path as Pages does,
  drops `closed_loop` and requires the stylesheet applied and no request
  outside the folder.
- **`6a4744e`, the test** of C16, in `test/test_server.jl`.
- **`ca0e57c`, `scripts/release.jl`.** `julia scripts/release.jl <dist>
  <version> <owner/repo>` runs answer 6's three calls, writes the root's
  `Artifacts.toml` and leaves `bundle.tar.gz` beside it.
- **`6b9e6ca`, the real-server check.** `frontend/live/` holds
  `driver.jl`, `server.spec.ts` and `playwright.config.ts`, run by
  `npm run live`. The driver starts the server on a free port with
  `bundle_dir` at `dist`, prints the port, reads `<model> [channel]`
  lines on standard input, pushes and answers `pushed`. Each browser's
  worker starts its own Julia. The one test checks ruling 3's five
  things; for the fifth, a later push to `/` is the sync point, after
  which `/` has received three frames and none of the channel's. No
  server runs on port 4319.
- **`5856562`, the workflow.** The jobs `live`, `release` and `pages`.
  `release` reads the version with `sed` and master's tip with
  `git ls-remote`, and takes one of four ways: release, the notice,
  C14's resume, or a log line that the version is tagged. The pack runs
  under a throwaway depot, so the last step downloads the public
  tarball. `pages` uploads `dist` from a folder `site/`, where the
  README's images will join as `site/img/`.

## The rehearsals

**On disk.** A bare repo stood in for GitHub and a folder for the
Release. `Pkg.add` by the repo's `file://` address at `rev = "release"`,
under a scratch depot, installed the package and the bundle in 2 min 1 s,
103 s of it precompiling. The installed server served the four files of
`dist` byte for byte. A bump to 0.1.1 and `Pkg.update()` followed. A
changed `index.html` made the last step's comparison fail. `~/.julia`
took nothing.

**On GitHub**, in `e271828e/RedstoneInspector-rehearsal`. Every run used
the branch's `CI.yml` byte for byte, but for the two that carry a
deliberate break. Runs are at
`https://github.com/e271828e/RedstoneInspector-rehearsal/actions/runs/`
followed by the number.

| case | run | what it showed |
|---|---|---|
| A, the first push | 46072362912 | Released `v0.1.0`: the tag on the generated commit, master and `release` at it, the Release public, the tarball's SHA-256 the tagged `Artifacts.toml`'s, Pages serving `dist`'s `index.html` with its files under the base path, the last step passing. |
| B, an install by URL | none | In a scratch depot `Pkg.add` at `rev = "release"` installed `v0.1.0` and its bundle from the Release, and the server served `dist`'s four files. |
| C, an ordinary push | 46074195636 | "v0.1.0 is tagged; nothing to release", in 6 s. Pages skipped. |
| D, the moved tip | 46075389690, 46075400293 | The bump's run released nothing, ended green and wrote the notice. The later run released `v0.1.1` from its own commit. |
| E, a dispatch from another branch | 46074595932 | Green, the notice, nothing released. |
| F, the second bump | 46075400293 | Case D's release: a new tag, `release` moved, and `Pkg.update()` followed it. |
| G, a failure before the push | 46078246268 | Attempt 1, broken on purpose after the draft, left a draft and no tag. Attempt 2 deleted the draft, packed again and released `v0.1.2`. |
| H, a failure after the push | 46079694540 | Attempt 1, broken on purpose at the publish, left the refs moved and a draft. Attempt 2 took the resume and published the same draft as `v0.1.3`. |
| the workflow restored | 46081018637 | Attempt 1 red on a flaky check of `e2e/landing.spec.ts`, attempt 2 green, nothing released. |

**What the repo holds now, for the user to look at.** Four public
releases, `v0.1.0` to `v0.1.3`, with their generated notes. Master's
history, with the bot's "Bind the bundle" commits between the
rehearsal's own. The page at
`https://e271828e.github.io/RedstoneInspector-rehearsal/`, which is
`v0.1.3`'s. The `github-pages` environment's deployments, one per
release. A branch `dispatch-probe`. Nothing there is deleted, and the
repo is the user's to delete.

## The mechanics' measurements

| | at `3afd3ed` | on the branch |
|---|---|---|
| the Julia gate | 131 passed | 131 passed |
| `npm test` | 793 passed in 31 files | 793 passed in 31 files |
| `npm run check` | 0 errors, 410 files | 0 errors, 412 files |
| `npm run e2e`, both browsers | 752 passed, 4 skipped | 754 passed, 4 skipped |
| `npm run live`, both browsers | none | 2 passed |

The jobs of the first run: `julia` 4 min 26 s on Ubuntu and 6 min 31 s
on Windows, `fixtures` 5 min 40 s, `frontend` 9 min 44 s, `live`
3 min 38 s, `release` 2 min 4 s, of which the last step 1 min 40 s, and
`pages` 13 s. `release` takes 5 to 7 s when it releases nothing. A
release takes about 16 minutes from the push.

## What the mechanics' tests pin

Each mutant ran alone and was restored from a copy.

- **The base-path check.** Without the `base` line it is red in both
  browsers.
- **The test under an empty depot.** With `_bundle_directory(nothing)`
  returning the stub folder, 3 tests fail. Without the helper, in the
  state a release leaves, the same 3 fail.
- **The real-server check.** Red with the server's own origin refused,
  with a push's send removed, with only a channel's first push sent,
  with a push broadcast to every channel, and with the stylesheet
  missing. A missing `icon.svg` is red in Firefox alone, an accepted
  survivor: headless Chromium requests no icon.
- **The last step.** A changed `index.html` fails it, on disk.
- **The workflow's rule.** The rehearsal's cases C, D, E, G and H.

## Traps the mechanics met

For `rules.md` at the landing.

- `JULIA_DEPOT_PATH="X:"` appends Julia's bundled depots and not
  `~/.julia`, so a scratch depot set that way is clean.
- `Pkg.add(url = …)` refuses the bare path of a bare repo and takes its
  `file://` address.
- Headless Chromium requests no favicon, so a check of failed requests
  sees a missing icon in Firefox alone.
- `inspect` is not exported; a script imports it by name.
- The page shows "connected" when the socket opens, before the server
  reads its `hello`. A first push can land before the server joins the
  socket and reach the page as the answer to that `hello`, so the second
  push is the one that pins a send to a joined socket.
- The version is baked into the page, so each release's bundle has its
  own tree hash.
- `e2e/landing.spec.ts:106`, Meta+o from the search field, failed once
  in nine runs on the runner in Chromium (`pending.md`).

## The mechanics' cold review

One independent high-tier agent, over the five commits at `5856562`, in
a worktree of its own, with GitHub read-only. Its charter: the whole
gate with `npm run live`; the workflow's rule walked as an adversary,
every way a run can reach the `release` job; the rehearsal's claims
against GitHub; the real-server check, the release script, the test
under an empty depot and the base path, each with mutants; the map and
this record.

Its gate was green at this file's counts. `npm run live` passed 20 runs
of 20. Its own `dist` equals `v0.1.0`'s published tarball byte for byte,
so the build is the same on a Mac and on the runner. It confirmed every
case of the rehearsal's table against GitHub: each tag on the bot's
commit whose parent is the run's commit, each asset's SHA-256 and tree
hash the tagged `Artifacts.toml`'s, no draft left, and the workflow file
of every run but G's and H's the branch's byte for byte. It disputed no
ruling, and C13 holds against GitHub's documentation and the rehearsal
repo's environment, whose branch policy allows `master` alone. Nothing
was a must-fix before the release. The findings, as the coordinator
adjudicated them, all taken:

- **1, a transient failure is read as a fact.** C21.
- **2, the resume matches a re-run of any old release run**, and Pages
  goes back to that run's page. C20.
- **3, two release runs on one commit in two concurrency groups** can
  publish a tarball that master does not name. C19.
- **4, the real-server check hangs 5.5 minutes and leaves two Julia
  processes** when the driver stops answering. The teardown now waits
  10 s for the exit and then kills the driver.
- **5, the version was expanded inside a `run` line.** It goes through
  the step's environment.
- **6, an empty version would release a tag named `v`.** C21. A lowered
  version: C23.
- **7, the draft's loop deletes a draft written by hand.** C22.
- **8, `bundle.tar.gz` was not ignored.** Added to `.gitignore`.
- **9, two figures of this file.** Fixed above.

What it could not confirm on GitHub, since no run showed it: the atomic
push's guard, `pages` after a failed last step, and a re-run of all
jobs. The first two go to the rehearsal of the fixes.

Its mutants of the real-server check: eleven red, on the server, the
driver and the page. Six survive and are acceptable, each pinned
elsewhere or outside what the check is for: a re-greeting that leaves
the old channel, which the page never sends; `pushed` printed before
`inspect`; the socket's path, since the server upgrades on any; a
`hello` with major 2, which the server only warns about; a missing
stylesheet link and an absolute base, both the base-path check's. Of the
test under an empty depot: the release's state passes 131 of 131, and
with the helper made inert 3 tests fail.

**The fixes** are one commit on the branch, `adcc116`. The rule reads
each remote fact on a line of its own under `pipefail`, refuses an empty
version, and writes two outputs, the step to take and whether Pages
deploy. The draft's step lists the drafts at the tag through the API and
deletes each by its id. The publish fails when the tag has no Release.
On it `npm run check` is clean and `npm run live` passes in both
browsers. With a driver that sleeps on its second push the check is red
in 42 s and leaves no Julia process. Run by hand under `bash -e` against
a missing repo, the rule stops with no output written.

**The fixes rehearsed**, from the fixed file, with versions from 0.1.4:

| case | run | what it showed |
|---|---|---|
| R1, a dispatch at master's tip | 46085719383, 46085719657 | Master's run released `v0.1.4`. A dispatch on a branch at the same commit released nothing, green, with "only a run on master releases". C19. |
| R2, an old release's run re-run | 46087380514, 46085719383 | `v0.1.5` released. The second attempt of `v0.1.4`'s `release` job took the resume, wrote "Pages left as they are" and deployed nothing; Pages stayed on `v0.1.5`'s page. C20. |
| R3, the last step failing | 46088649478 | Broken on purpose at the end of the last step. `release` red after the publish, `v0.1.6` public, Pages deployed all the same. The run stays red. C13. |
| R4, a push before the atomic push | 46089710872, 46090728330 | A pause of 240 s on purpose before the push, and a commit pushed to master meanwhile. The push was refused whole: no tag, `release` unmoved, a draft left, the run red. The tip's own run deleted that draft and released `v0.1.7`. Ruling 2's guard. |

The tip's run of R4 needed three attempts, neither failure the
workflow's own: `e2e/landing.spec.ts:106` failed again in `frontend`,
and then `pages` failed with "No artifacts named github-pages" and
deployed when re-run alone.

The rehearsal repo now holds eight public releases, `v0.1.0` to
`v0.1.7`, no draft, master and `release` at `v0.1.7`'s commit with the
branch's `CI.yml` byte for byte, Pages on `v0.1.7`'s page, and two
probe branches, `dispatch-probe` and `tip-probe`.

**The delta's check.** The reviewer, resumed, found `adcc116` clean. It
ran the three steps under the runner's `bash -e` with a fake `git` and
`gh`, each read failing in turn: a failed read stops the step with no
output written. It walked its table again, and the three rows it had
marked wrong are right. The first release ever, with no tag and no
`release` branch, takes the release and never reads `release`. A resume
whose Release was deleted stops red at the publish and deploys nothing;
its tarball is gone, so the repair is a new version. It confirmed R1 to
R4 against GitHub, each tag's parent and each asset's SHA-256 included.
The `pages` failure of R4 was GitHub's: `deploy-pages` listed the run's
artifacts 0.3 s after the upload finished, before the listing held it.
The job's two steps are GitHub's own pattern and cannot cause it.

**What a person does by hand**, for the README and `AGENTS.md` at the
landing:

- A publish that failed, then a new push before any re-run: the new
  run's Julia jobs fail on the bundle's 404. Re-run the old run's failed
  job, or publish with `gh release edit vX.Y.Z --draft=false`.
- Master force-pushed without the bot's commit: `release` is no longer
  an ancestor and every atomic push fails. Put the bot's commit back.
- A `pages` job that fails on fetching its artifact: re-run that job
  alone.
- A Release deleted by hand after its tag was pushed: a new version.
- Before the landing push, the repo must hold no `release` branch and no
  `v0.1.0` tag. It held neither on 2026-11-28.

## The state of the run

Kept current by the coordinator, for the user and for a successor. All
paths are on one machine.

- **Launched 2026-11-27 from `3afd3ed`.** Nothing is pushed.
- **The first pin bump is merged on the local master**, as `209f642`,
  its record `d67a540` and its review's fixes `f2a835d`, the launch's
  commit placed after them. The Julia gate and the drift check are green
  on the merged tree, with the manifest of the new pin. Its record is
  `../20261127_pin_318859d/notes_pin_318859d.md`: the page needed no
  change, and the review found nothing to fix outside the records. It
  waits for the user's review and push. Until that push its worktrees
  stay, `pin_318859d` and `pin_318859d_review`, with their scratch
  folders.
- **At that pin the facts above read differently in two places.** The
  core is 89 commits past `fcd3660`, 33 of them in `src/`, and the
  schema's top-level `description` changed with D-483.
- **The mechanics are built, rehearsed and reviewed** on
  `release-mechanics`, six commits at `adcc116`, the sixth the review's
  fixes, rehearsed in their turn and their delta checked clean. The
  branch is unmerged and exists on this machine alone, since nothing of
  it may reach `RedstoneInspector.jl` before the landing push. Step 1 of
  the order of the work is done. Steps 2 to 6 wait for the core's
  increment 1b and for the user.
- **Owed at the close**, before the scratch is cleared: the builder's
  and the reviewer's probes, the local rehearsal's script and the
  mutant runners go to `probes/` beside this file with their paths as
  arguments; the traps go to `rules.md`; and the records listed below
  take their amendments, six jobs where they say four or five.
- **For the user**: the push of the pin bump; C8 to C23 to review, C23
  to rule; the relay to the core on `pending.md`'s bullet; and the
  rehearsal repo to look at and delete.
- **The rehearsal repo** exists, `e271828e/RedstoneInspector-rehearsal`,
  public, created empty that day with its Pages source set to "GitHub
  Actions".
- **The worktrees**, under `~/.julia/dev/RedstoneInspector.jl-worktrees/`:
  `pin_318859d`, `pin_318859d_review`, `release_mechanics` and
  `release_mechanics_review`. Beside
  them, each agent's scratch with its `notes.txt`, the folder's name
  ending in `_scratch`, the mechanics' holding the rehearsal's clone; and
  `context_watch.py`, the coordinator's watch on the agents' context.

## The records this increment amends when it lands

`build_release.md` answers 1, 5, 6 and 8; `roadmap.md`'s entry;
`pending.md`; `AGENTS.md`, for the fifth job and a fetch after a release;
and the README. `deployment_overlay.md` answer 2, the glossary's entry and
`pending.md`'s bullet on the open format changes followed D-483 on
2026-11-27.
