# Look: inspector increment 8b

The user's checklist for the look over `increment-8b`, after the cold
review and its fix. `brief_inspector_08b_keyboard.md` holds what was built
and the ten readings, cited here by number. Entries are numbered for
discussion, and a ruling goes under its entry. `REVIEW:` opens the user's
own words.

Setup: `cd ~/.julia/dev/RedstoneInspector.jl-inc8b/frontend && npm run dev`,
then drop fixtures from `frontend/fixtures/`. `large` has the long tree,
pane and drawer; `closed_loop` the root to drag on. The screenshots are in
`frontend/e2e/screenshots/`: `ring-tree`, `ring-detail`, `ring-drawer`,
`ring-canvas`, `undo-button` and `frame-collapsed-keys`, each
`.closed_loop__root.png`.

## 1. The keys by region

- [ ] **1.1** The tree, focused by a row's click or by Tab: the arrows do
  what `h j k l` do, and the canvas does not pan. With no row selected `j`,
  `k`, Down and Up take the first row; Left and Right do nothing.
- [ ] **1.2** The detail pane, on `large` with a primitive selected: `j`,
  `k`, Up and Down scroll it by 40 px a press (readings 1 and 2); `h`, `l`,
  Left and Right scroll sideways only where it overflows, which the pane
  seldom does.
- [ ] **1.3** The drawer, on `large`'s execution order: the same eight keys
  scroll its body. Narrow the window so the timing tab overflows, and `h`
  and `l` scroll it sideways.
- [ ] **1.4** A closed drawer that holds the focus, reached by Tab: the
  eight keys do nothing and the ring sits on its strip (reading 4). The
  alternative lets the canvas's keys act there.
- [ ] **1.5** The canvas, or nothing focused: `h j k l` jump and the arrows
  pan, as before.
- [ ] **1.6** The help page: `j` and `k` scroll it beside the arrows and
  Space; no other key reaches the frame beneath.
- [ ] **1.7** The other keys act from every region: Shift with `h j k l`,
  `0`, `z`, `n`, `d`, `r`, `y`, `o`, `t`, `/`, `u`, `U`, `m` and `i`
  (reading 7).
- [ ] **1.8** Shift with an arrow acts as the plain arrow in every region.
  No answer rules it.

## 2. The ring

- [ ] **2.1** The tree, the detail pane and the drawer show the ring on the
  pane's box after a click and after Tab, and it stays put while the
  content scrolls. Its weight: 2 px in the highlight hue, inset. A quieter
  mark, an accent on the pane's top edge, is the alternative.
- [ ] **2.2** The canvas shows the ring after Tab and none after a click.
  After a click, the first key pressed turns the ring on: Chromium counts
  a key as keyboard use of the focused element. The canvas's rule is the
  one from before this increment, so this is not new, and the review
  raised it against "for the keyboard only" (its F3). To rule: keep it, as
  the ring then shows once the keyboard drives the canvas, or hold the
  ring back until Tab gives the focus.
- [ ] **2.3** The tree shows the ring while the search field holds the
  focus (reading 8).
- [ ] **2.5** A pane keeps the focus and its ring when the element that
  held it goes away: a clicked row collapsed out of the tree by `h h`, a
  producer link's click in the detail pane, the undo button's own click
  (the review's F1). A row draws no ring of its own; a clicked chevron or
  button draws the browser's after a key (F2).
- [ ] **2.4** A click on a pane's title, "MODEL" or "DETAIL", clears the
  focus: no ring, the canvas's keys act (reading 10). The reviewer had
  read a click anywhere on a pane, its title included, as focusing it.

## 3. `m`, `i` and the focus on a collapse

- [ ] **3.1** `m` collapses and expands the model tree, `i` the detail
  pane, kept across a reload. Shift with either does nothing.
- [ ] **3.2** Collapsing the pane that holds the focus, or closing the
  focused drawer with `d`, moves the focus to the canvas, whose ring then
  shows (reading 5). Expanding moves nothing.
- [ ] **3.3** After both panes collapse the level keeps its view and sits
  left in the wider canvas until `0`, as after any resize.

## 4. Cmd-O and Ctrl-O

- [ ] **4.1** In Chrome: the page's picker opens with a model, on the
  landing, from the search field and under the help page, where the picked
  model loads beneath. With Shift or Alt the key is the browser's.
- [ ] **4.2** In Firefox and in Safari, by hand, since no check runs there:
  the same four places, and the browser's own dialog never opens.

## 5. Undoing drags

- [ ] **5.1** On `closed_loop`'s root drag two components. `u` puts the
  last one back, `u` again the other; the view and the selection stay.
- [ ] **5.2** `U` puts every one back, and so does the button "Undo drags"
  left of Fit, which shows only while the level holds a drag (reading 3:
  its label, its title, its place).
- [ ] **5.3** A component dragged twice counts once. A pin and a root tag
  undo as a component does.
- [ ] **5.4** `u` and `U` during a drag do nothing (reading 6).
- [ ] **5.5** The canvas blinks through a layout on each undo, as on
  opening a level (reading 9).

## 6. The texts

- [ ] **6.1** The help page's lead: "A dragged component keeps its place
  for the session only: `u` puts the last one dragged back in its computed
  place, and `U` or the Undo drags button every one."
- [ ] **6.2** The help page's keyboard table, 25 rows, and its note:
  "Single keys, outside text fields, where Tab, Cmd-O and Ctrl-O still act.
  The color mode, the type labels, the order badges and the collapsed panes
  are kept per browser."
- [ ] **6.3** The README's keyboard paragraph.

## 7. After the look

- [ ] **7.1** Record amendments the look settles, docs commit first.
- [ ] **7.2** The merge: rebase onto `master`, fast-forward.
- [ ] **7.3** The push and its CI run.
- [ ] **7.4** The roadmap's landed note, the pending bullet retired, the
  item "`j` and `k` in an unselected tree" retired and "Keyboard paths and
  buttons" amended.
