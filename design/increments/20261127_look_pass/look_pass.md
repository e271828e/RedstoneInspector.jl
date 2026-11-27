# Look: the look pass before the release

The user's checklist for the canvas's open look items, `pending.md`'s
first bullet, at `415a64b`. Entries are numbered for discussion and
grouped by the fixture that shows them. `REVIEW:` opens the user's own
words, and a ruling goes under its entry. Each entry says what to do,
what to look at and what to decide. Where a constant decides, the entry
names its line.

Setup: `cd frontend && npm run dev`, then drop fixtures from
`frontend/fixtures/`. Firefox unless an entry says Chromium. To try
another value for a constant, edit its line while the dev server runs.
Vite reloads the page, and `git checkout -- <file>` restores the line.

The canvas's scale, screen pixels per world unit, is not shown on the
page. The browser's console reads it:

    (s => s.clientWidth / s.viewBox.baseVal.width)(document.querySelector("svg.canvas"))

## 1. `closed_loop`

- [x] **1.1** The pane's header at 240 px, in Chromium. Open
  `lqr_controller`, select `command_pack` and drag the detail pane to its
  narrowest. The Copy button beside the long path pushes the pane 14 to
  21 px sideways, so the body scrolls horizontally. Five other nodes do
  the same. Then the same in Firefox, which breaks the path after its
  slashes. Decide what the button does in a narrow pane: it wraps under
  the path, it shrinks to an icon, or the path wraps around it. REVIEW: I prefer Firefox's behavior, the path breaks into lines to keep the button in sight.
  Ruling: the header's path takes a `<wbr>` after each slash, through the
  pane's `slashed` snippet, so Chromium breaks it as Firefox does.
- [x] **1.2** `lqr_controller/free_pair`, a `Constant` of `Int8[0, 0]`.
  Is it whole on a Mac? `CONSTANT_WIDTH` is 60 px
  (`frontend/src/canvas/size.ts:54`). CI's fonts are wider and may cut it,
  which only the release's screenshots will show. 3.1 decides the width. REVIEW: The `Int8[0, 0]` is whole on the canvas.
  Ruling: as it is. CI's fonts get their look at 10.3.
- [x] **1.3** The router's stub. On the root, drag `plant` until a wire of
  `actuators` runs backward, right to left. A backward route leaves its
  port by a 12 px stub, then runs 12 px under the lower box. Look where
  the stub meets `actuators`' `δt`: it can cross the port's label. Decide
  whether that is worth a fix before the release. A dragged layout is
  never in the README's images. REVIEW: I don't understand. The plant is the leftmost block, root inputs aside, so `actuators`' wires already run right to left in the default layout. They look good to me.
  Ruling, after the coordinator explained the drag's router: the stub at
  the producer's end is at least the port's drawn type label's width plus
  4 px, and 12 px where no label is drawn. Only the stub: the router
  still ignores third blocks in its path. ELK cannot replace it, since it
  places and routes in one pass and either ignores a dragged block's
  place or moves blocks nobody dragged (`workspace.md` answer 9).
- [x] **1.4** The route pill on a tall assembly. On the root, select the
  pin `h_ref` and press `t`. The route enters `pid_controller`, and its
  `route` pill sits at the block's bottom right, where the overlay's pills
  stack. Does it read as the route's mark, or as a mark on the block? The
  alternative is a pill beside the entry port. REVIEW: It reads as a mark on the block, and it occludes the ordering pill when the order overlay is active. Moving the route pill beside the entry point might work better, but it should not overlap its own type annotation, which is rendered below the wire.
  Ruling: the route pill leaves the bottom edge. On a closed child it
  stands outside the block, left of each input port the route enters by,
  above the wire: one pill per port entered. On a pin it stands past the
  point where the wire leaves the pin, above the wire, clear of the type
  label below it. The `loop` pill moves with it, one rule for both.
  `workspace.md` answer 6 takes the amendment.

## 2. `rates`

- [x] **2.1** The route pill on a short pin. Select `src`'s `out` port and
  press `t`, then open `fast`. The `route` pill stands at the outer end of
  the pin `in` and covers most of its top edge. Decide with 1.4, since
  one place for the pill serves both. REVIEW: I'd also prefer the pill beside the exit point here. Something unrelated I noticed: when I type `face: out` in the search box in the model tree, the results also show nodes whose paths partially match `out`. In contrast, when I type `face: out` in `closed_loop` it only shows faces whose *name* actually match `out`. 
  Ruling: 1.4's. The search's behavior is no fault: `face:` followed by a
  space is a prefix with no text, so `out` stands as a bare term and
  matches `fast/outer`'s path. The fix the user asked for: a prefix
  standing alone applies to the next word, so `face: out` reads as
  `face:out`.

## 3. `kinds`

- [x] **3.1** Cut constants. `nt` reads `a=1.0, b=…`, its whole value in
  the hover. The whole text is 64 px against `CONSTANT_WIDTH`'s 60. Look
  at `v`, `mat`, `fn` and `r` too. Decide the width: 60, or wide enough
  for `nt`, about 70. A wider constant widens its block. REVIEW: 60 is fine.
  Ruling: 60 stays.
- [x] **3.2** The stacked parameters. Select `nt`. At the default 360 px
  the pane stacks each parameter's name over its value, and `value.a`
  reads like `1.0`. Decide how to tell them apart: the name in a lighter
  color, the value indented, or both. REVIEW: Lighter color.
  Ruling: in the stacked layout the parameter's name takes the lighter
  text color. The two-column layout stays as it is.

## 4. `library`

- [x] **4.1** The text levels' floors. Load the file. The fit is about
  0.36, at the `segments` level, so the blocks show their names in the
  head line and no display names or icons. Zoom in with the wheel and
  read the scale where the names first read well. The floors now are
  0.6 for face names, 0.4 for display names and icons, and 0.25 for the
  head line (`size.ts:59-61`). At 0.4 an 11 px name draws at about 4 px,
  and at 0.52 at about 6 px. Increment 6's look suggested 0.8, 0.6 and
  0.4. Decide the floors, and whether a root that loads below a floor is
  fine as it is. Raising the floors makes more roots load without
  names. REVIEW: Read the scale where? If I fit `library` at the root, the blocks' text starts becoming helpful at the third zoom-in step and somewhat readable at the fourth.
  Ruling, after trying them: the floors are 0.7 for face names, 0.6 for
  display names and icons, and 0.4 for the segment. The zoom keys' step
  is 1.25, so from `library`'s fit of about 0.36 the third and fourth
  steps reach 0.70 and 0.88, an 11 px name at about 7.7 and 9.7 px.
- [x] **4.2** The squeezed icons. `ss` draws `ẋ=Ax+Bu`, `tf` and
  `zoh_tf` draw `N(s)/D(s)`, `dtf` draws `N(z)/D(z)`, each squeezed into
  `ICON_WIDTH`'s 44 px (`size.ts:50`). Zoom to about 1. Decide: a wider
  `ICON_WIDTH`, which widens every icon's block, a smaller font for these
  texts, or a glyph in their place. REVIEW: Looks OK as it is.
  Ruling: as it is.
- [x] **4.3** The glyphs as a whole. The root holds one of each library
  primitive. The glyphs are a first pass. Note any that read wrong or
  badly, at the fit and at about 1.
- [x] **4.4** The stacked parameters on matrices. Select `ss`, whose `A`,
  `B`, `C` and `D` stack at 360 px. The same question as 3.2, on longer
  values. REVIEW: Same
  Ruling: 3.2's.

## 5. `large`

- [x] **5.1** A root below every floor. The fit is under 0.1, at the
  `frames` level: frames and wires, no text in the blocks. Decide with
  4.1 whether this needs anything beyond the floors. REVIEW: It's OK.
  Ruling: as it is.

## 6. `failure_probe` and `warning`

- [x] **6.1** A long overlay pill. On `failure_probe`'s `s`, the block
  `g` carries the `EmptyFaceSelection` pill, about 190 px on a 130 px
  block, so it runs past the left corner. Decide: let it run, or cut the
  pill's text with the whole kind in its hover. REVIEW: Cut the text, whole kind in its hover.
  Ruling: the pill's text is cut with an ellipsis so the pill ends at the
  block's left inset, or short of the order badge while the badges are
  on. Every diagnostic pill's title opens with its whole text, then the
  message's first line on the next line.
- [x] **6.2** White on amber. The same pill, and `warning`'s `g`. It is
  the page's lowest-contrast text. Decide: dark text on the amber, a
  darker amber, or as it is. REVIEW: Reads pretty well as it is.
  Ruling: as it is.

## 7. `failure_dead`

- [x] **7.1** The dead hop's cross. The chord between the squares carries
  a cross ±3 px across. Look at the fit and zoomed in. Decide its size. REVIEW: ±4 px.
  Ruling: ±4 px.

## 8. `events_deployment` and `approach_deployment`

- [x] **8.1** Two pills on a narrow assembly. On `events_deployment`'s
  root, `pods/a` and `pods/b` carry the rate pill at the left and the
  events pill at the right. The block is exactly as wide as the two
  need, so they stand 2 px apart and fill the top edge. Press `c` to see
  both color modes. Decide: as it is, or a few pixels of margin in the
  reserved width, which widens these two blocks. REVIEW: As it is.
  Ruling: as it is.
- [x] **8.2** The tolerance's form. Open the drawer's events tab. The head
  list reads `2.5e-5 of Δt_frame` in one code span, and
  `approach_deployment`'s `1e-6 of Δt_frame`. Julia's `show` prints
  `1.0e-6`. Decide among the number and unit in one code span, as now;
  the number in code and "of Δt_frame" as prose; or `2.5 × 10⁻⁵`. REVIEW: Since the tolerance is relative to `Δt_frame`, I propose `2.5e-5 × Δt_frame`
  Ruling: `2.5e-5 × Δt_frame`, in one code span.

## 9. The hyperperiod chart

`deployment_overlay.md` answer 11 leaves the threshold, 1000 base ticks,
and the minimum pitch, 6 px, to this pass (`frontend/src/lib/timing.ts:407-408`).
Open the drawer's timing tab and drag the drawer to about 640 px. The
committed fixtures reach 360 ticks at most, so two edited copies of
`timing_deployment` are in
`~/.julia/dev/RedstoneInspector.jl-worktrees/look_pass_drop/`, local
to one machine.
Each divides `Δt_base` by 2 or 3 and multiplies every `D` and `Φ` in the
schedule by the same factor. Their charts are right, and their base grid
sections no longer match the schedule, so read only the chart.

- [x] **9.1** `rates_deployment`: 40 ticks, fitted to the tab, with a
  frame top every 2 ticks. The chart as it reads when it fits. REVIEW: The separation between base ticks is fine, but the ticks themselves are slightly too faint. A bit more thickness could help.
  Ruling: the base ticks, the short strokes, take the lighter text color
  and 6 px of length, from the border color and 4 px.
- [x] **9.2** `timing_deployment`: 360 ticks at 6 px, 2160 px wide,
  scrolling sideways under the sticky row labels. Do the marks still
  read apart at 6 px? Decide the pitch. REVIEW: The base ticks are too close. The frame top lines are closer together than in `rates_deployment`, and there are two base ticks between them, not one.
  Ruling: the lines are right. `timing_deployment`'s frame is 3 base
  ticks, `rates_deployment`'s 2, and the fitted chart spreads its ticks
  about 35 px apart. The minimum pitch goes from 6 px to 10 px, so the
  5 px marks stand 5 px apart.
- [x] **9.3** `timing_deployment_720`: 720 ticks, 4320 px wide. Is a
  scroll this long still useful? REVIEW: Not really. I'd say anything above a few tens of ticks is visually undecipherable. Is there any drawback to drawing the chart whole? As far as I can tell, it doesn't interfere with the rest of the timing tab.
  Ruling: with 9.4.
- [x] **9.4** `timing_deployment_1080`: past the threshold. The rows stay,
  and one line replaces the timeline: `chart omitted: the joint period
  is 1080 base ticks (6/5 s)`. Decide the threshold. At 6 px, 1000 ticks
  is a 6000 px scroll. REVIEW: 1000 ticks is already absurd, but if there is no clear advantage to reducing the threshold, we can keep it.
  Ruling: the threshold drops to 500, and a timeline up to it is drawn at
  full length, scrolling past the tab's width. At 10 px, 500 ticks is a
  5000 px scroll. `deployment_overlay.md` answer 11 takes the amendment.

## 10. After the look

- [ ] **10.1** The rulings into the records, each answer amended in
  place with its dated note, and `pending.md`'s bullet closed.
- [ ] **10.2** The fixes the look asks for, the gate, and the user's
  check.
- [ ] **10.3** The push and CI's screenshots, the first view of 1.2 and
  of the other cuts under CI's fonts. Then increment 11.

## 11. After the fixes

The user's rulings of 2026-11-27, after trying the branch at `e2fe4a5`.
They supersede the rulings of 1.3, 1.4 and 2.1 above.

- [x] **11.1** REVIEW: I've been trying wire routing in a few fixtures,
  and I find the old route pill position (at the block's bottom edge)
  cleaner and more pleasant. Let's revert to it, please. As for the stub
  fix, it buys little, given that the consequences of the routing not
  being re-computed by ELK are far worse than what the fix is meant to
  amend. So I'd like to revert that too.
  Ruling: on a component the `route` and `loop` pills stand on the
  bottom edge as before the look pass, in one row from the right, after
  the diagnostic pill, 2 px apart. 1.3's stub is reverted, then removed
  with the drag (11.4).
- [x] **11.2** REVIEW: Can we put the route pill on the bottom right of
  an input pin and on the bottom left of an output pin? This feels more
  consistent with the pill's placement on components.
  Ruling: a pin's pills straddle its bottom edge at its inner end, the
  end the level's wire touches. On an input pin they form one row from
  the bottom-right corner leftward, on an output pin from the
  bottom-left corner rightward, the `loop` pill nearest the corner.
- [x] **11.3** REVIEW: I would allow a pill or badge to draw over others
  as long as it can be toggled. In other words, anything that cannot be
  toggled should not occlude anything else.
  Ruling, with the coordinator's two refinements, which the user
  agreed: a fixed mark, one drawn whenever its data exists, never covers
  another mark. A mark the reader turns on (a key's toggle, a trace, a
  search, a focus) goes to a free place where one exists. Only where no
  free place is left may it draw over what is there, and it then draws
  on top. So 6.1's cut leaves room for the fixed pills together: the
  diagnostic text is cut so that the diagnostic and `loop` pills end at
  the left inset, or short of the order badge while the badges show.
  The `route` pill may run past them, over the order badge or past the
  corner, and the order badge draws above the overlay's fixed pills.
- [x] **11.4** REVIEW: ELK cannot compute the layout with a forced block
  position. As a consequence, the layout after any drag is quite
  unpredictable and often messy, rarely improving on what ELK gave in
  the first place. Also, wires cannot be dragged, which prevents the
  user from fixing that messiness. Therefore, as it stands, the whole
  drag functionality feels half-baked. Either we find a real solution,
  or we remove it completely. A non-existing feature is better than a
  half-baked one. Then: Let's remove the drag and add it as an Unordered
  item to `pending.md`, but without assuming a specific solution in
  advance; the slot drag is only recorded as one possibility.
  Ruling: the drag goes, with Shift's one-axis drag, `x`, `X`, the undo
  button, the dragged positions in the session and their rekeying on a
  push, and `router.ts`. A level's drawing is ELK's alone. `pending.md`
  gains an unordered item for a drag built properly.
