# Look: the look pass's second look

The user's checklist for the branch `look-pass` at `da20248`, after the
last round. It covers what the page shows now: the rulings of
`look_pass.md`'s section 11, and the earlier entries that still stand.
Entries are numbered for discussion and grouped by the fixture that
shows them, and a ruling goes under its entry. `REVIEW:` opens the
user's own words.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-worktrees/look_pass/frontend && npm run dev`.
The main tree's dev server serves `master`, so stop it first or use the
port Vite prints. Drop fixtures from the worktree's `frontend/fixtures/`.
Three edited copies are in
`~/.julia/dev/RedstoneInspector.jl-worktrees/look_pass_drop/`, local to
one machine. Firefox unless an entry says Chromium. The color mode, the
labels and the order badges are kept per browser, so note which are on
before each entry.

To trace a face: select a pin, a port square or a wire, then press `t`.
`t` again or Escape clears the route. `o` toggles the order badges and
`y` the type labels. A failure has no execution order, so `o` shows
nothing on a failure fixture.

## 1. `closed_loop`

- [ ] **1.1** Root. Select the pin `h_ref` and press `t`. Each closed
  child the route enters carries a `route` pill straddling its bottom
  edge at the right, `pid_controller` among them.
- [ ] **1.2** The same, with `o` on. On `lqr_controller` the `route`
  pill runs over the order badge at the bottom left, and the `route`
  pill is the one on top.
- [ ] **1.3** Root, `o` on, no route. Hover an order badge: its block
  takes the hover's halo. A click selects the block, and a double-click
  on a closed assembly's badge opens it.
- [ ] **1.4** Trace `mode`. The blocks the route does not reach dim,
  their order badges with them. The lit blocks' badges stay full.
- [ ] **1.5** Clear the route and type `sensing` in the tree's search
  field. The badges of the blocks that are not hits dim with them.
- [ ] **1.6** No drag. Press and move on `plant`: nothing moves, the
  view does not pan, and on release nothing is selected. With Shift
  held, the same.
- [ ] **1.7** Press and move on the bare canvas: the view pans. A plain
  click on `sensing` selects it. A double-click on `pid_controller`
  opens it.
- [ ] **1.8** `x` and `X` do nothing, and no undo button shows beside
  Fit. The cursor over a block is a pointer, over the bare canvas a
  hand.
- [ ] **1.9** In Chromium: open `lqr_controller`, select `command_pack`,
  and drag the detail pane to its narrowest. The path breaks after its
  slashes, and the pane does not scroll sideways. The same for a port's
  pane, with its Trace button.
- [ ] **1.10** The fit, then zoomed with `+`. Face names show from scale
  0.7, display names and icons from 0.6, segments from 0.4.

## 2. `failure_nested`

- [ ] **2.1** Root. Select `plant`'s `power` port square and press `t`.
  `ctl` carries one row at its bottom right: the `loop` pill at the
  corner, then the `route` pill left of it, 2 px apart, neither covering
  the other.
- [ ] **2.2** Open `ctl`. The input pin `y` carries its pills on the
  bottom edge at its right end, the end its wire leaves from: the `loop`
  pill at the corner, the `route` pill left of it.
- [ ] **2.3** The same pin is shorter than its row, so the `route` pill
  runs past the pin's left end. Look whether the `loop` pill also passes
  that end. The policy lets a `route` pill run past; a `loop` pill is
  fixed and should stay inside.
- [ ] **2.4** Inside `ctl`, the output pin `u` carries its `loop` pill on
  the bottom edge at its left end, the end its wire arrives at.

## 3. `failure_nested_warning_ctl`, from the drop folder

- [ ] **3.1** Root. `ctl` carries the warning's pill at the corner, its
  text cut with an ellipsis, then the `loop` pill, both inside the
  block. Hover the warning's pill: the tooltip opens with
  `EmptyFaceSelection`, then the message.

## 4. `rates`

- [ ] **4.1** Root. Select `src`'s `out` port square, press `t`, then
  open `fast`. The input pin `in` carries the `route` pill at its bottom
  right. Compare with the old place, the top edge's outer end, which
  covered most of this short pin.
- [ ] **4.2** The tree's search field. Type `face: out`: the list shows
  faces only, no node such as `fast/outer`. `face:` alone lists nothing.

## 5. `warning`

- [ ] **5.1** Root, `o` on. On `g` the warning's pill is cut short of
  the order badge, and the two do not touch.
- [ ] **5.2** The same. The order badge draws over the bottom-left band
  of `g`'s amber halo. Judge whether the warning still stands out. A
  failure carries no order badges, so a red halo never meets one. The
  record's answer 9 now says the error hue "wins over the drawing".

## 6. `failure_probe`

- [ ] **6.1** Open `s`. On `g` the `EmptyFaceSelection` pill reads
  `EmptyF…` or shorter, inside the block.

## 7. `failure_dead`

- [ ] **7.1** Root. The dead hop's cross on `m`'s chord is 8 units
  across.

## 8. `kinds` and `library`

- [ ] **8.1** `kinds`, select `nt`; `library`, select `ss`. At the
  default 360 px pane the parameters' names are in the lighter color
  above their values.
- [ ] **8.2** Both at their fits, then zoomed with `+`, as 1.10.
  `library` now loads with no text in its blocks.

## 9. `events_deployment` and `approach_deployment`

- [ ] **9.1** The drawer's events tab. The head reads `2.5e-5 ×
  Δt_frame` on `events_deployment` and `1e-6 × Δt_frame` on
  `approach_deployment`.

## 10. The chart: `rates_deployment`, `timing_deployment` and the drop folder's copies

The drawer's timing tab, the drawer at about 640 px.

- [ ] **10.1** `rates_deployment` fits its 40 ticks, the base ticks drawn
  as 6 px strokes in the lighter text color.
- [ ] **10.2** `timing_deployment` scrolls its 360 ticks at 10 px, 3600
  px wide.
- [ ] **10.3** `timing_deployment_720` and `timing_deployment_1080` are
  past the threshold of 500, and show the "chart omitted" line.

## 11. The help page

- [ ] **11.1** `?` opens it. Its lead and its key table say nothing
  about dragging, `x` or `X`.
- [ ] **11.2** The chord sample's cross matches 7.1.

## 12. After the look

- [ ] **12.1** The rulings this look makes, into the records and the
  fixes.
- [ ] **12.2** The merge of `look-pass`, the push and CI's screenshots.
- [ ] **12.3** The roadmap's note, and `pending.md`'s look bullet closed
  with the moot stub item.
- [ ] **12.4** The removal of the worktrees and folders under
  `RedstoneInspector.jl-worktrees/`.
