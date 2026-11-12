# Brief: increment 8b, the keyboard by region

One code commit on `increment-8b`, then one cold review and its fix, the
user's look, and the merge. Drafted on 2026-11-12 at `9f53616`, the
prototype's base, checked out in `~/.julia/dev/RedstoneInspector.jl-inc8b`.
The docs commit on `master` carries this brief, the amended
`workspace.md` and the new traps. One high-tier agent prototyped the whole
increment in that worktree, and the prototype is the implementation: the
coordinator commits its diff, so this brief is the record half. The user
ruled the scope and the four open questions and asked not to see the brief
unless the prototype surfaced a design decision. It surfaced none; the
readings below are the prototype's and the coordinator's, and the look
checklist `look_inspector_08b.md` puts each before the user. Not normative.

## What is settled

`design/pending.md`'s bullet "Increment 8b" holds every ruling, and
`workspace.md` answers 2, 9 and 11 state them as rules.

- `m` toggles the model tree and `i` the detail pane, over the collapse
  buttons' prefs. Ruled in increment 8's look, 4.7.
- Cmd-O and Ctrl-O open the page's file picker wherever the page shows: with
  a model, on the landing, from the search field and under the help page.
  The browser's own binding would open the file in place of the page.
- `h j k l` and the arrows follow the focused region. In the tree the
  arrows do what `h j k l` do, and with no row selected `j`, `k`, Down and
  Up take the first row. In the detail pane and the drawer all eight
  scroll, `h` and `l` sideways. On the help page `j` and `k` scroll. On the
  canvas or with nothing focused they act as before. The reason is the
  look's additional comment: the four never split between two targets.
- The tree, the detail pane and the drawer show the ring on the pane's box
  whenever they hold the focus. The canvas keeps the ring for the keyboard
  alone, since its keys mean what they mean with nothing focused.
- `u` puts the last dragged block or pin of the open level back in its
  computed place, `U` and a button beside Fit every one, by the push's
  relayout with a shorter list of dragged ids. An undo per gesture was
  rejected (`roadmap.md`'s entry).
- The item "`j` and `k` in an unselected tree" is taken and ruled as built.
  "Keyboard paths and buttons" stays out.

## What the probes found

Chromium, headless, event by event, before the build. The scripts are
outside the tree.

- **Focus by the mouse.** A row click focuses the row, a click on the
  detail pane's text its root, a click in the drawer's body its root. A
  click in a side pane's body below the region root, or on a pane's head,
  focused the page's body and cleared the region: the detail pane's root
  was 755 px in a 974 px body, the tree's 195 px.
- **The scrollers.** A side pane scrolls on `.pane.side .body`, the drawer
  on `.tab-body`. The browser's own arrows scroll the detail pane by 40 px,
  its focused root sitting inside the scroller, and scroll nothing in the
  drawer, whose focused root is the scroller's parent.
- **Cmd-O and Ctrl-O.** A window `keydown` that prevents the default and
  clicks a file input raises the chooser for both keys, from the search
  field and from an input inside the inert `div.under` too. The browser's
  own dialog cannot be seen headless.
- **Focus on a collapse, before the build.** `d` with the drawer's root
  focused left the focus on the closed strip. `d` with a row button
  focused, and a collapse of a pane holding the focus, dropped it to the
  page's body.
- **The undo.** Every property of "What the checks pin" under `drag.spec.ts`
  held on the prototype.

## The shape built

- `src/App.svelte`. Cmd-O and Ctrl-O are read first, with no Shift or Alt,
  and click `input.pick`, the shell's own file input in `main` outside
  `div.under`. The help page's guard takes `?`, Escape, `j` and `k`. `h j k
  l` and the arrows dispatch on `session.focus`: `treeMove` in the tree,
  `scrollBy` on the pane's scroller by `SCROLL_STEP` (40) in the detail
  pane and the drawer, the jump and the pan elsewhere. `m` and `i` go
  through `togglePane`, `d` through `toggleDrawerKey`, each moving the
  focus to `.viewport` when it closes the region that holds it. `u` and `U`
  call the canvas's `undrag`.
- `src/canvas/Canvas.svelte`. `relayout` is factored out of the path's
  effect: ELK, the held layout's dragged ids put back, the draw,
  `onlayout`. A `run` counter replaces the effect's closure flag, so a
  level change drops an undo in flight. The handle gains `undrag(all)`,
  which shortens the dragged list and calls `relayout` on the shown
  geometry with the current view; it does nothing with no drag, during a
  drag, or while another level is drawn. `button.undo-drags` sits before
  `button.fit` in a new `div.tools` and shows while the level holds a drag.
- `src/frame/Frame.svelte`. The ring is `.pane:has(.focused[tabindex="0"])`
  for the three panes and `.viewport.focused:focus-visible` for the canvas.
- `src/frame/Tree.svelte`, `Detail.svelte`. The roots fill their body
  (`min-height: 100%`), so a click below the content focuses the region.
- `src/lib/help.ts`. `KEYS` goes from 20 rows to 25, `LEAD`'s last sentence
  says how a drag is undone, and `KEYS_NOTE` names Cmd-O and Ctrl-O in text
  fields and the collapsed panes among the prefs.
- `frontend/MAP.md`, 711 lines, and `README.md`'s keyboard paragraph follow.
- `e2e/fixtures.ts` gains `SCROLL_STEP`, `expectScrollKeys` and `widen`.

## Readings taken

None is ruled by the user; each is an entry of the look's checklist.

1. The scroll step is 40 px for all eight keys and the help page's `j` and
   `k`, Chromium's own arrow step. The alternative is the pan's 48.
2. The shell scrolls with `scrollBy` and leaves no arrow to the browser in
   a pane, since the browser's arrows are dead in the drawer.
3. The undo button reads "Undo drags", titled "Put every dragged component
   and pin back in its computed place (U)", left of Fit.
4. In a closed drawer that holds the focus the eight keys do nothing, the
   ring on its strip saying where the focus is. The alternative reads a
   closed drawer as nothing focused, the canvas's keys acting.
5. `m`, `i` or `d` closing the region that holds the focus moves the focus
   to the canvas, whose ring then shows, a key having given it. Expanding
   moves nothing. The alternative leaves the focus on the page's body.
6. `u` and `U` do nothing during a drag.
7. `u`, `U`, `m` and `i` act in every region, as `d` does.
8. The tree pane shows the ring while the search field holds the focus,
   the field being the tree region's.
9. An undo clears `data-ready` while ELK runs, as a level's layout does. A
   second `u` during the run shortens the list again and supersedes it.
10. A pane's head stays outside every region: a click on its title clears
    the focus.

## What the checks pin, by property

Fourteen browser checks added, 224 in Chromium. No unit test: no pure
module changed. The prototype ran sixteen mutants, each red.

- `keys.spec.ts`: the ring on each pane's box after a click and after Tab,
  none on the canvas after a click, one after Tab (the old rule on every
  root); a click below the tree's rows or the pane's facts focuses the
  region (`min-height` removed).
- `tree.spec.ts`: the arrows walk the tree as `h j k l` do, step by step,
  the view never panned (the arrows not routed to the tree).
- `detail.spec.ts`, `drawer.spec.ts`: the eight keys scroll the body by the
  step, the view and the selection kept; a closed drawer nothing; `d`
  closing a focused drawer moves the focus to the canvas (the scroll branch
  removed; no focus move).
- `frame.spec.ts`: `m` and `i` toggle, write the pref, survive a reload,
  move the focus on a collapse, and ignore Shift; the ring stays on the
  pane's box while its body scrolls.
- `landing.spec.ts`: Cmd-O and Ctrl-O raise the chooser on the landing, with
  a model, from the search field and under the help page, the picked file
  loading; with Shift or Alt they do not (the key read after the text-field
  check; Shift taken; the help page's guard first).
- `help.spec.ts`: `j` and `k` scroll the page; the frame under it ignores
  `m`, `i`, `u` and `U`; the keys' row count, 25 against 25.
- `drag.spec.ts`: `u` puts the last dragged block back in its place at
  load, the other drag, the view and the selection kept; twice, two; a
  block dragged twice counts once and is the last; with no drag no layout
  runs; nothing during a drag; an undo, then a push, keeps the rest; the
  button shows only while the level holds a drag and puts back every one
  (the first id dropped; the guard removed; a refit; the button always
  shown).

The gate on the prototype: 511 unit tests, svelte-check clean over 399
files, the build, 224 of 224 browser checks in Chromium.

## Bookkeeping

- `workspace.md` answers 2, 9 and 11, the docs commit.
- `design/rules.md`: six traps, the drawer's scroller, a root shorter than
  its pane, a key right after `goto`, the view after a resize, the undo's
  sync point, a mutant runner in place.
- `frontend/MAP.md` and `README.md`, in the code commit.
- At the landing: `roadmap.md`'s note under increment 8b, the pending
  bullet retired, the item "`j` and `k` in an unselected tree" retired, and
  "Keyboard paths and buttons" amended for what 8b changed.

## Out of scope

The accessibility sweep; the pin and its renames; Firefox's two
`leave.spec.ts` checks. Firefox and Safari take the Cmd-O check by hand in
the look, the sandbox starting neither.

## The cold review

One fresh high-tier reviewer in a scratch copy of the branch, from a clean
`npm ci`. It runs the four checks, writes its own reading of the rules
from `workspace.md` answers 2, 9 and 11 and compares it with the page key
by key and region by region, each gesture made twice. It reverts each
behavior alone to show a check goes red, probes what the checks leave
out, and reads the six screenshots against the answers. It does not read
the code for style, and an empty review is acceptable.

## The review's record

To be filled after the review.
