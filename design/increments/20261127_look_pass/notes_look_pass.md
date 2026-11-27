# Notes: the look pass before the release

The record of the look pass's fixes, `pending.md`'s first bullet.
`look_pass.md`, beside this file, is the user's checklist of 2026-11-27:
the user's words after each `REVIEW:`, and a ruling under each entry.
The user ruled every entry, asked for every fix, and left the run to
the coordinator. What follows was ruled by the coordinator with the user
away, unless the checklist says otherwise.

## The pipeline

- One high-tier builder in the worktree `look_pass` on the branch
  `look-pass`, from `415a64b`, with the checklist as its brief and no
  other. A cold review follows, then the fixes to its findings and a
  delta check. Nothing is merged or pushed.
- The coordinator's slip, which the builder corrected: the checklist's
  1.4 ruling cites `workspace.md` answer 6 for the route pill, which is
  the drawer. The rule lives in `visual_grammar.md` answer 9, which took
  the amendment.
- The coordinator took the builder's twelve readings as reported.
  Readings 1 and 4 go past the ruling's words: a pill on an output port
  of the producer's child, and a pill moved past another port's label.
  Both follow from "beside the port it crosses, clear of the type
  label". Both are for the user's check.

## Commits, from `415a64b`

| hash | entry | message |
|---|---|---|
| `33d83a6` | | Commit the look pass's checklist and amend the records its rulings change |
| `b0e5147` | 1.1 | Break the detail pane header's path after each slash so the narrow pane never scrolls sideways in Chromium |
| `f6c16f3` | 1.3 | Lengthen a dragged wire's producer stub past its port's type label |
| `1810c2b` | 1.4, 2.1 | Stand the route's and the loop's pills beside the ports they cross, above the wire and clear of the type labels |
| `c7af7b2` | 3.2, 4.4 | Give a stacked parameter's name the lighter text color |
| `0fe6a65` | 4.1 | Raise the text levels' floors to 0.7, 0.6 and 0.4 |
| `76ce63e` | 6.1 | Cut a long diagnostic pill to its block and open its title with the whole text |
| `03bff14` | 7.1 | Widen the dead hop's cross to four units each way on the canvas and the help page |
| `990ebfb` | 8.2 | Write the localization tolerance as a product with Δt_frame |
| `9782e59` | 9 | Set the chart's threshold to 500 base ticks and its pitch to 10 px, and draw the base ticks longer in the lighter text color |
| `699daa9` | 2.1 | Apply a search prefix standing alone to the word after it |

## The records amended

All in `33d83a6`, each with one note dated 2026-11-27. `1810c2b`
tightened answers 8 and 9 of `visual_grammar.md` within the same note.

- **`visual_grammar.md` answer 8.** The diagnostic badge keeps the bottom
  edge at the right. Its text is cut with an ellipsis to end at the
  block's left inset, or short of the order badge while the badges show.
  Its title opens with the whole text, then the message's first line.
  The loop's badges stand as answer 9 places a route's.
- **`visual_grammar.md` answer 9.** A route's badge stands outside the
  block or pin, above the wire, clear of its type label. On a closed
  child it stands left of each input port the route enters by. On a
  closed child entered by no input, the one holding the producer, it
  stands right of each output port the route leaves by. Off the root it
  stands past where the wire leaves an input pin, or short of where it
  reaches an output pin. There is one per port, the loop's nearer the
  port. A badge that would meet a drawn label moves outward past it.
- **`workspace.md` answer 5.** A search prefix standing alone applies to
  the next word.
- **`workspace.md` answer 6.** The tolerance reads `2.5e-5 × Δt_frame`.
  Its 10b form stood only in 10b's notes.
- **`workspace.md` answer 7.** The overlay's pills no longer draw over
  an order badge, and the diagnostic pill is cut short of it.
- **`deployment_overlay.md` answer 11.** The threshold is 500 base
  ticks, the minimum pitch 10 px, and a base tick a 6 px stroke in the
  lighter text color.
- **`design/rules.md`.** The trap "Pills sharing an edge" states the new
  places.
- **Not amended.** `workspace.md` answer 8 states no place for the
  badge. `visual_grammar.md` answer 10 states no floor values. No record
  states the cross's size, which `frontend/MAP.md` holds. The glossary
  needed nothing. `pending.md`'s bullet waits for the close (10.1).

## The readings

1. **Which ports of a closed child take a pill.** `crossings()` in
   `level.ts`, one rule for the route and the loop. Each input port
   entered takes one. A child entered by no input takes one at each
   output port it is left by: the route's producer child, or a loop's
   partial chain. *Rejected:* inputs only, which leaves the route out of
   its producer's child with no pill, as on `rates`' root at
   `fast|out|outer`. Also every touched port, which gives a child the
   route passes through two pills. Probe: `failure_nested`'s root gets
   `ctl|in|y` alone.
2. **The pins.** An input pin's pill stands right of its port, past
   where the wire leaves it. An output pin's stands left of its port,
   above the wire arriving. *Rejected:* the top edge's outer end, the
   old place.
3. **The offsets.** The pill stands `BADGE_GAP`, 2 px, beyond the port
   square. Its bottom is `PILL_LIFT`, 4 px, above the wire's centre,
   clear of the route's 7 px casing.
4. **A pill meeting another port's label.** On `rates`, the pill of
   `fast|out|outer` sat over the label of `fast|out|inner`, the port
   above. A pill that would meet a drawn label moves outward along its
   wire, past the label's far end plus 2. With the labels off it does
   not move. *Rejected:* lifting the pill between the rows, since a
   label fills most of a 16 px row.
5. **A loop and a route at one port.** The loop's pill stands nearer
   the port, the route's next.
6. **The fit** covers the overlay's pills as it covers the boxes.
   *Rejected:* the boxes alone, which cut a pill at the edge when
   `fast/outer` is dragged 600 px left.
7. **Left as is.** A pill draws over other wires, and under the HTML
   legend, as a block does. On `rates`' `fast` the pills at the two ends
   of one short wire stand side by side, `fast/outer|out|out` and the
   output pin `out`. On a shorter wire they would overlap.
8. **1.3, which label counts.** The stub counts a port's label whether
   the toggle shows it or not, since the layout reserves the labels
   either way. It runs to the label box's far end, its ELK offset
   included, plus 4, and is at least 12. A forward route turns no nearer
   the producer than its stub and no nearer the consumer than 12. It
   needs the stub plus 12 of run, else it goes backward. *Rejected:*
   following the toggle, which would make a route depend on a
   preference.
9. **6.1's cut** is measured on the canvas, by `cutPill` over a new
   `cutTo` in `size.ts`, and the pill is at most its room. A block with
   no order badge keeps the left inset as its limit, the badges on or
   off. At the harness's widths `failure_probe`'s `s/g` reads `EmptyF…`.
10. **2.1's search.** A lone prefix takes the next word only when that
    word is bare. Before a prefixed word, or at the end, it is no term.
    Of two lone prefixes in a row, the nearer wins. *Rejected:* taking a
    prefixed word as the text, `face:path:x`.
11. **7.1.** A new `CROSS = 4` in `size.ts`, read by the canvas and by
    the help page's chord sample, which wrote ±3 itself.
12. **4.1.** At the harness's 1600 by 1000, `library` fits at 0.277 and
    loads at `frames`, `large` at 0.083, `closed_loop` at 0.819. The
    checklist's 0.36 was the user's window. The check pins `library`
    loading at `frames` and each zoom step drawing `detailAt`'s level,
    and not the third and fourth steps, which the window decides.

## The gate

| | `33d83a6`, the base's code | `699daa9` |
|---|---|---|
| unit tests | 792 in 32 files | 801 in 32 files |
| the checker | 413 files, clean | 413 files, clean |
| build | ok | ok |
| browser checks, both projects | 752 passed, 4 skipped | 770 passed, 4 skipped |

The base's first run failed four `zoom.spec` checks, which read the
floors from the source, already at the ruled values; at the base's
floors they pass. The Julia suite and the drift check did not run:
nothing under `src/`, `test/` or `scripts/` changed.

## What the tests pin

Each fix was reverted alone from a saved copy by
`look_pass_scratch/mutant.py`. All red, no survivor.

| fix reverted | the check that goes red |
|---|---|
| 1.1, no `<wbr>` | `detail.spec`, every node's and port's header at the 240 px pane on `closed_loop` and `approach_deployment`: 2 red in Chromium; Firefox stays green, breaking after slashes itself |
| 1.3, the stub at 12 | `router.test`, `closed_loop`'s backward wire out of `actuators` |
| 1.4, the pill on the wire | `routes.spec` and `overlay.spec`, 8 red |
| 1.4, no move past a label | `routes.spec`, the route's pills with the labels on |
| 1.4, a fit without pills | `routes.spec`, `rates`' `fast` with `outer` dragged left |
| 3.2, the rule removed | `detail.spec`, `kinds`' `nt` and `library`'s `ss` at 360 px |
| 4.1, the old floors | `size.test`, the floors; `zoom.spec`, `library`'s fit below the segment's floor |
| 6.1, no cut; the order badge ignored | `overlay.spec`, the long pill cut with an ellipsis |
| 6.1, the old title | `diagnostics.test`, `failure_probe`'s titles |
| 7.1, `CROSS = 3` | `overlay.spec`, `failure_dead`'s cross 8 by 8 |
| 8.2, " of " | `events.test`; `events.spec` on `events_deployment` |
| 9, the threshold at 1000; the pitch at 6 | `timing.test`; `timing.spec` |
| 9, the ticks in `--border`; 4 px long | `timing.spec`, the look pass's chart |
| 2.1, a lone prefix dropped | `search.test`, 3 red |

Two pins rest on probes:
- **1.1.** At the base in Chromium at 240 px, these node panes scrolled
  sideways:
  - `closed_loop`'s `lqr_controller/command_pack` by 14 px, and its copy
    in `closed_loop_deployment`;
  - `approach_deployment`'s `vehicle/selection/command_δe` and
    `command_δt` by 21 px, and `select_δe` and `select_δt` by 14 px.

  Port panes, with their Trace button, scrolled by up to 73 px. Firefox
  showed none, and after the fix neither browser does.
- **6.1.** The pin that the cut is the longest that fits allows 3 units.
  Firefox's SVG text measures about 2 units narrower than the canvas the
  cut measures with.

## Captures

Local to one machine, in `RedstoneInspector.jl-worktrees/look_pass_captures/`,
each entry as `<entry>.chromium.png` and `<entry>.firefox.png`:
`1.4_root`, `1.4_routes_root`, `1.4_outputs`, `2.1_pin`, `3.2`, `4.4`,
`4.1`, `6.1`, `6.1_order`, `6.1_overlay`, `7.1`, `8.2`, `9.2` and
`9.4`. None for 1.1 or 1.3, and no Firefox shot of `failure_nested`'s
pins inside `ctl`.

## Noticed, not touched

- A wire pane's endpoint paths, `p.endpoints`, carry no `<wbr>`. The
  ruling and the probe covered node and port panes.
- The help page's search lead printed as plain text. It renders its code
  spans now, through the `text` snippet as `KEYS_NOTE` does (`699daa9`).
- `RouteDrawing.entered`, block ids, became `crossed`, port ids, and an
  overlay badge carries `data-port`, in `frontend/MAP.md`'s contract
  table.

## The cold review's charter

An independent agent reads the checklist and the amended answers, then
the page, and the code only where a check needs it. It runs the gate and
reverts each fix alone. It drives what the builder did not:
- the route pills under a drag that puts one near another block or a
  junction, a child both entered and left, a short wire from a child's
  output to an output pin, a pill under the legend, `y` toggling the
  labels beside a pill, and a far zoom with pills on;
- 1.3's stub under a drag of `plant` on `closed_loop`, the labels on and
  off;
- 6.1's cut and its two-line title in Firefox;
- the chart's ticks on `rates_deployment` and 360 ticks at 10 px;
- the floors on `library` in a real window;
- typing `face: out` and `face: ` key by key.

## The cold review

An independent agent reviewed `415a64b..c9b8475` on 2026-11-27 in its own
worktree, `look_pass_review`. Its gate matched the record's figures:
801 unit tests in 32 files, the checker clean, the build, and 770
browser checks passed and 4 skipped. It ran every fix's mutant again,
all red, and 21 of its own. It swept every producer port on every
fixture's root and on each closed child of the root, both browsers,
with the labels on and off. The coordinator ruled on each finding with
the user away.

- **F1, fixed.** With the labels on, reading 4's move put a pill onto
  another block, port or pill on three fixtures:
  - on `failure_nested`'s root, `plant|out|power` traced, the route's
    pill at `ctl|in|y` landed on `plant`'s `y`;
  - on `closed_loop`'s root, `selection|out|δt` traced, `selection`'s
    pill landed on `actuators|in|δt_cmd`'s;
  - on `timing`'s `fast`, `fast/outer|out|deep` traced, the output
    pill landed on the `⟨out⟩deep` pin's.

  A drag of `pid_controller` gave the same. Ruling: a pill's move
  along its wire stays within the half of the wire's end segment
  nearest its port, so the two ends' pills never meet and none reaches
  the far block. Where no place in that half clears the label, the pill
  stands at its unmoved place. A check pins, over the review's sweep,
  that no pill meets another block, port square or pill.
- **F2, fixed.** A regression of 1.3. The router chose the backward form
  below a gap of the stub plus 12, about 52 units for a `Float64` label,
  where it had chosen it below 24. A forward drag with a gap of 24 to 52
  then ran both wires into the consumer's box and round it. This
  happened with the labels on or off. Ruling: the choice stays the
  base's, forward from a gap of 24. A forward route turns at the
  midpoint, moved toward the consumer to clear the label where the gap
  allows, and never nearer the consumer than 12. The longer stub
  applies in full only to the backward form. A check pins a forward gap
  that the base drew forward.
- **F3, ruled to the user's wording.** The user ruled the stub on the
  "drawn" label, and 12 px where none is drawn. Reading 8 counted the
  label with the toggle off too, so that a route never depends on a
  preference. The user's ruling stands: the stub follows the toggle. A
  toggle re-routes the wires touching each dragged block, so a drawn
  route never keeps a stub for a label no longer drawn. Reading 8 is
  overturned on that point.
- **F4, checks added.** Two rules of answer 9 held with no check. The
  loop's pill stands nearer the port than the route's, which
  `failure_nested`'s root shows with `plant|out|power` traced. The pill
  stands `PILL_LIFT` above the wire, within a tolerance.
- **F5, fixed.** `visual_grammar.md` answer 8 had the loop's badge where
  the chain crosses "into" a closed child, which misses an output port
  the chain only leaves. It now reads as answer 9 does for a route.

Not findings, ruled as follows:
- **The probes and the mutant scripts** are committed in a `tools/`
  folder beside this file, their paths as arguments: the builder's
  `mutant.py` and the review's runners and specs. The captures stay on
  this machine until the user's look, then go.
- Left as observed: a pill's top edge sits on the wire of the port
  above; the fit covers the diagnostic pills as well; `cutPill` gives
  "…" where the room is narrower than an ellipsis pill; MAP's `size.ts`
  row does not list `CROSS`. The help page's chord sample at ±3
  survives a mutant, a minor gap the fixer may close.

## The fix

A fresh high-tier fixer landed the rulings: `b7f0161` amends answers 8
and 9 and the trap "Pills sharing an edge", `ee9ef37` "Fix the look
pass's review findings", and `c4fa27e` commits `tools/` beside this file.

- **F1.** A pill moved past a label falls back to its unmoved place when
  the move would take it past half of the end segment nearest its port.
  For an input port that is the wire's last segment. For an output port
  it is the shortest first segment among the port's wires.
  `e2e/pills.spec.ts` sweeps every producer port on the root and on each
  closed child of the root, on all 22 fixtures, with the labels off and
  on. It asserts that no overlay pill meets a block (a diagnostic's own
  excepted), a port square or another pill. It found the review's three
  cases before the fix and none after. The suite's browser run went from
  2.5 to 3.4 minutes.
- **F2.** The route runs forward from a gap of 24 again, turning at
  `min(max(midpoint, a.x + stub), b.x - 12)`. The backward form leaves by
  the whole stub. `router.test.ts` pins `plant` 30 units right of
  `actuators` on `closed_loop`'s root, four points with the label drawn
  or not, and gaps of 50, 24 and 23.
- **F3.** `rerouteTouching` takes the labels' state, and one helper,
  `rerouteDragged`, re-routes the dragged blocks' wires in three places:
  after a relayout, when a held layout is drawn again, and on a toggle
  of the labels. `drag.spec.ts` drags `plant`, toggles `y` twice, then
  toggles on another level and climbs back.
- **F4.** Every pill in `routes.spec` and `overlay.spec` stands
  `PILL_LIFT` above its wire, to 0.05 units. `overlay.spec` pins the
  loop's pill between the port and the route's on `failure_nested`.
  `help.spec` pins the help page's cross at 8 by 8.
- **F5.** Answer 8 now places the chain's badges as answer 9 places a
  route's. The help page's badge line follows.

The fixer's readings, which the coordinator took:
1. **F1 on `rates`' root.** `fast|out|outer`'s first segment is 50 units
   and its pill 32, so even the unmoved pill passes the half and the
   move is refused. The pill stands over `fast|out|inner`'s label, the
   port above's, and clear of its own, as 1.4's words ask.
   `routes.spec` pins it unmoved. This is the overlap reading 4 had
   removed, and it is for the user's look.
2. **The review's drag of `pid_controller`, 20 px right of
   `lqr_controller`, is not F1.** The re-routed wire runs through
   `lqr_controller` with the labels off too, since the router ignores
   third blocks as 1.3 ruled, and the pill is wider than the gap. Open,
   unpinned.
3. **A legal move is pinned:** on `approach_deployment`'s `vehicle`,
   `selection|out|engaged` traced, the pill moves 35 units within a
   544-unit segment.
4. **No record states the stub.** F2 and F3 live in MAP's drag paragraph
   and router row.
5. **Held layouts on other levels** are re-routed when drawn again, so a
   toggle made elsewhere reaches them.

Mutants, all red but one: the bound removed; no move at all; the
threshold at the stub plus 12; the label counted with the toggle off;
the toggle's effect removed; a held layout drawn without the re-route;
`PILL_LIFT` 3; a pill 10 higher; the route nearer than the loop; the
help page's cross at ±3. The survivor, the bound taken as half the
wire's whole run, is acceptable: no fixture tells the two readings
apart.

| | before | after |
|---|---|---|
| unit tests | 801 in 32 files | 804 in 32 files |
| the checker | 413 files, clean | 414 files, clean |
| browser checks, both projects | 770 passed, 4 skipped | 818 passed, 4 skipped |

## The delta check

The reviewer, resumed, checked `c9b8475..c4fa27e`. Its gate matched the
fixer's: 804 unit tests in 32 files, 414 files clean, 818 browser checks
passed and 4 skipped. F1 to F5 are fixed as ruled, in both browsers.
Every fixer's mutant is red but F1-wholewire. It agreed with the five
readings. It raised three points, and the coordinator ruled on each.

- **N1, the coordinator's F1 ruling turned.** Bounding the move by half
  the end segment refuses most moves, since ELK usually turns soon after
  the label. The sweep finds 19 output-port pills, on `closed_loop`,
  `approach_deployment`, `rates`, `timing` and `events_deployment`,
  standing over the label of the port above. Before the bound, all but
  F1's three moved clear without meeting anything. Ruling: the bound
  goes. A pill moves past the labels it meets, as reading 4 had it, and
  stands at its unmoved place only where the moved place would meet a
  block, a port square or another pill. That is the rule `pills.spec`
  already checks. A check pins that the 19 now clear the labels.
  Reading 1 of the fix, `rates`' unmoved pill, goes with the bound.
- **N2, left as observed.** Below a gap of 24 the backward route leaves
  by the full stub, so with the labels on its vertical runs 17 to 40
  units inside the consumer's box, where the base ran up to 12 inside.
  The ruling said the full stub applies to the backward form, and the
  router ignores other blocks.
- **N3, a check added.** A live drag with the labels off takes the
  12-unit stub. Nothing pinned it: a mutant passing the labels as drawn
  during the drag survived.
