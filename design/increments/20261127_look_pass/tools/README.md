# The look pass's tools

The scratch of the look pass's builder and its cold review, kept so a later
run can repeat them (`design/rules.md`, "Nothing left on one machine"). Every
machine path is an argument or an environment variable. The screenshots and
the logs stayed on the machine that made them.

## The mutant runners

- `mutant_inplace.py`, the builder's. It swaps one text for another in a file
  of the worktree, runs a command in the frontend folder and restores the file
  from a saved copy. The builder ran it once per fix, with the pairs in
  `builder_mutants/` (`<entry>.old` and `<entry>.new`, named by the
  checklist's entry), for example:

      python3 mutant_inplace.py "$FRONTEND" "$FRONTEND/src/canvas/Canvas.svelte" \
        builder_mutants/14a.old builder_mutants/14a.new -- npx vitest run

  Each `.old` text occurs once at `699daa9`, under `frontend/src/`: 11 and
  32 in `frame/Detail.svelte`, 13 in `canvas/router.ts`, 14a, 14b, 14fit,
  61a and 61b in `canvas/Canvas.svelte`, 21s in `lib/search.ts`, 41 and 71
  in `canvas/size.ts`, 61c in `lib/diagnostics.ts`, 82 in `lib/events.ts`,
  9a and 9b in `lib/timing.ts`, 9c and 9d in `frame/tabs/Chart.svelte`.
  The cold review's fixes changed some of that text, and the user's
  rulings of section 11 removed what 13, 14a, 14b and 14fit mutate. Nothing
  may read or edit the tree while it runs.
- `mutant_scratch.py`, the review's. It works on a scratch copy of the
  frontend folder, never the worktree, and restores each file from the
  worktree. A command `e2e:<args>` builds the copy first. Set
  `MUTANT_SCRATCH` to the copy, with `node_modules` linked in,
  `MUTANT_SOURCE` to the worktree's `frontend/` and `MUTANT_LOG` to a log
  file.
- `run_e2e_mutants.sh` and `run_e2e_mutants2.sh`, the review's mutants of
  the look pass's fixes, one `mutant_scratch.py` call a line, the checks it
  runs named on its line. They match the code at `699daa9`, which `fe0e1be`
  leaves unchanged. E2b, E9b and E17 survived the review; the checks F4
  added turn them red. Those on the pills beside the ports and on the drag
  no longer apply after the checklist's section 11.
- `run_fix_mutants.sh`, the second fixer's mutants of the user's rulings in
  the checklist's section 11, the same way, one per rule: the components'
  row order, a pin's corner and edge and its loop's place, the cut leaving
  room for the loop's pill, the draw order of the order badges and the
  route's pills, the order badge's dimming, and no drag. `fix2_mutants/`
  holds the two texts too long for a line, a swap each. All go red.

## The probes

`probe/` is the review's Playwright project outside the tree. It needs a
`node_modules` symlink beside `package.json` pointing at a frontend's own,
and the frontend built (`design/rules.md`, "A Playwright probe outside the
tree"). Set `PROBE_ROOT` to that `frontend/` folder, whose `dist/` it serves
on `PROBE_PORT` (4329 by default), and `PROBE_OUT` to an existing folder
holding a `shots/` folder, then run `npx playwright test` from `probe/`.

- `specs/h.ts`: the drop, the keys, the log, and `pillReport`, what every
  overlay pill meets: another pill, a block, a type label, a port square,
  the legend, the svg's edge.
- `specs/sweep.spec.ts`: every producer port on every fixture's root and on
  each closed child of the root traced, labels and rate mode on, each
  level's meetings logged. It found the cold review's F1, of the pills
  beside the ports that section 11 reverted.
- `specs/cases.spec.ts`: F1's three cases, cropped, labels on and off.
- `specs/charter.spec.ts`: the review's charter, driven and logged: a child
  both entered and left, a drag beside another block, a far zoom, a pill
  under the legend, 1.3's drags, 6.1's cut, the chart, the floors and the
  search typed key by key.
- `specs/stub.spec.ts`: `plant` dragged 30, 60 and 120 px right of
  `actuators` on `closed_loop`, labels on and off. It found F2.
- `specs/cut.spec.ts`: 6.1's cut, cropped.
