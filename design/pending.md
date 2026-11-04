# Pending

What the inspector still owes its records, the work order and the open
items, in two lists. Every item here is known and recorded; none is
abandoned. The core's `Redstone.jl/design/pending.md` holds what the spec
owes the inspector's later stages and the descriptor changes the core
makes.

## The work order

The bullets stand in working order, the first one next.

- **The inspector, stage 1**: the static inspector over the descriptor.
  Its records, none normative, are `initial_design.md` and one per axis
  beside it: `descriptor_design.md` (axes 1 and 2, §13.9, D-432),
  `visual_grammar.md` (axis 3), `prototypes/render_spike/report.md`
  (axis 4), `workspace.md` (axis 5), `live_session.md` (axis 6),
  `failure_descriptor.md` (the failure bump, D-434) and `build_release.md`
  (axis 7). `roadmap.md` stages the build in eleven increments and records
  each landed one with the facts the next briefs take. Increments 1 to 7
  and 9 have landed. Increment 8, the analysis views and the help page, is
  in its look-and-adjust pass: its review's fixes landed at `bb2511f` on
  the `increment-8` branch, checked out in a worktree, and
  `increments/inspector_08_analysis_help/look_inspector_08.md` is the
  pass's checklist; the merge follows the pass. Then 10, the deployment
  overlay on both tracks after its design session writes the eighth
  record, `deployment_overlay.md`, with the writer's qualified `@ref`
  links folded in; then 11, the release. Open across increments: the
  non-blocking Firefox project fails the two leave-prompt checks, to be
  settled before it turns blocking. The built-in Julia GUI is parked
  (D-310). The later stages, the bridge, the live inspector and the
  cockpit, stand after the core's first release, their questions listed
  in `initial_design.md` and the spec's debts in the core's `pending.md`.

## Unordered

Nothing yet; the records' open items join here as they are gathered.
