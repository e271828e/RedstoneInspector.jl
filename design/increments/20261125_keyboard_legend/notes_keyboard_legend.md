# The keyboard by family and the legend's line, notes

The record of the keyboard session, the user's design session of
2026-11-25, held before increment 10b. It opened on three tweaks, the
legend's line, the search's prefixes on the help page and Vim's keys, and
ended as one increment in two stages, the legend first. The rules stand
in `workspace.md` answers 5, 7, 9 and 11, `deployment_overlay.md` answer
13 and `visual_grammar.md` answer 6. This file holds their reasons, what
was rejected, and the probes that precede the prototype.

*The increment merged on 2026-11-26 at `d191c9c`. The worktrees, the
branch and the folders under `RedstoneInspector.jl-worktrees/` that this
file names were local to one machine and are gone, deleted that day. What
the record rests on is in `probes/`, `tools/` and `review/` beside this
file.*

## Rulings on the legend

1. **A deployment's line reads `D₀ · Φ₀`, then `Δt`, then the bare
   anchor.** It is the chart row's label, so the legend and the chart
   read alike. This reverses answer 13's rejection of the concrete pair
   on every line, whose reason was length: the anchor's key, `Dₐ` and
   `Φₐ` leave the line for the tooltip, and the line comes out shorter
   than the one it replaces.
2. **A build's line reads `Δt · τ`, then the anchor.** A build has no
   `D₀` or `Φ₀`, which are the deployment's counts. It knows the seconds
   pair, exact on an anchor and a multiple of `Δt_base` on `A₀`.
   Rejected: the build's line left as it was, two shapes for one legend.
3. **The anchor stays on the line.** A color belongs to a triple, and
   two triples can land on one `(D₀, Φ₀)`, as `library_deployment`'s
   `(2, 0)` does. Without the anchor those two lines would read the same.
   Rejected: the user's first form, `D₀ = 8 (Δt = 1/25 s) · Φ₀ = 0
   (τ = 0 s)` with the anchor in the tooltip, which is longer than the
   old line and states `Φ₀` twice.
4. **A deployment's lines go by `(D₀, Φ₀)`, fastest first, and the
   colors keep the palette's order.** The chart's rows and the timing
   tab's sort already run fastest first. The palette stays a function of
   the build, so a model keeps its colors when it is deployed (answer
   13). Cost accepted: an extra's number can stand out of order down the
   legend. A build's lines keep the palette's order, since `2·Δt_base`
   and `1/50 s` cannot be compared.
5. **The continuous line stays first.** It has no period to sort by, and
   first reads as the limit of fast.
6. **A tall legend scrolls inside.** Its height is capped at the
   viewport's less its insets, which cures `large`'s legend, 714 px tall
   at 1100 by 700 and cut at the top (increment 10's review). The wheel's
   listener sits on the SVG, so a wheel over the legend scrolls it and
   zooms nothing, and `fitBeside` already fits a level beside a
   full-height box. A line focused from elsewhere scrolls into view.
   Rejected: a key that scrolls the legend, a special case for one box
   when no key reaches a legend line at all. That gap is the hints'
   (`pending.md`).

## Rulings on the keyboard

7. **Four families, each with one meaning in every region.** The user's
   aim is Vim's and Vimium's: the hands stay on the home row. They asked
   for a design that coheres over a key for each request. `h j k l` are
   the cursor, Shift with them the level, `z` the view and `g` go.
8. **Every region has a cursor, and a pane's is the browser's focus on a
   stop.** This answers the sweep's open question, whether Tab enters a
   region or each region gets a row cursor. Real focus brings the ring
   and Space for free, and the drawer's rows already hold a `button.row`.
   Tab keeps cycling the four roots and never enters one. The tree's
   cursor stays the selection, so a row still takes no focus.
9. **The detail pane is an outline under the tree's rule.** `j` and `k`
   walk every visible stop, `l` goes inward, and `h` comes back out and
   folds only at the heading. Rejected: `j` and `k` on the headings
   alone, the user's first request, which leaves the rows out of reach;
   and `h` on a row collapsing its section in one press, since the
   session keeps one set of open sections for every node and an
   overshoot by one from a row's links would close a section everywhere.
   Cost accepted: passing an open section takes `h h j` and leaves it
   closed.
10. **A docstring's links are stops.** A stop is any control, and one
    kind left out would stay unreachable. DOCSTRING starts collapsed, so
    the links cost nothing until it is opened, and `h h` closes it again.
    Only a rendered link counts. Two links on one line are consecutive
    stops, so `j` moves along the line in reading order.
11. **In the drawer `h` and `l` move along a row's controls**, a chart
    row's swatches among them. The chart's timeline has no stops, so its
    sideways scroll is the view's, `z` with `h` or `l`.
12. **Enter presses the focused stop, and Shift with `j` always opens.**
    Until now Enter opened the selected assembly whatever held the
    focus, which the sweep listed.
13. **The level's keys stay the same in every region.** Rejected: Shift
    with `h` and `l` for the drawer's tabs, the user's first request. A
    diagnostics row can open another level while the focus stays in the
    drawer, and Shift with `h` must then go back. `gt` and `gT` are Vim's
    own, act from any region and leave the focus where it is.
14. **The view is under `z`.** `zz` centres the cursor in its region,
    `z` with `h j k l` pans or scrolls, `zi` and `zo` zoom from the home
    row, and a held `z` keeps acting. A held direction repeats by the
    keyboard's own repeat, as a held arrow does today. Rejected: Shift
    with `h j k l`, given to the level on 2026-11-01; Ctrl and Alt, the
    browser's; a pan on each animation frame, smoother and with
    diagonals, at the price of a second path beside the arrows and of
    time-based checks, kept for the look pass if the stepping bothers.
    Cost accepted: centring goes from `z` to `zz`, and `zz` from the tree
    centres the row and not the block.
15. **`d` and `u` scroll half a page, as in Vimium.** Rejected: Ctrl
    with `d` and `u`, which are the browser's on Windows and Linux; and
    scoping by region, since the drawer's toggle must work from inside
    the drawer. The undrag moves to `x` and `X`. Its key matters least,
    a drag being a mouse act with a button of its own.
16. **`gg` and `G` reach a region's first and last stop**, and do
    nothing on the canvas, where no block is first or last.
17. **`q w e r` focus the four regions, and Shift folds a pane.** One
    press each, on the left hand while the right stays on `h j k l`, and
    a hidden region shows first. Each pane then has one key, lower case
    to go there and upper case to fold it, which retires `m`, `i` and
    `d`. The user tried `qwer` against `qwes`, the screen's layout on the
    keys and the coordinator's recommendation, and chose `qwer`. The
    color mode moves to `c` to free `r`. Rejected: `gh gj gk gl`, two
    presses and a `gk` that reads as "up" from the drawer alone;
    relative moves under a third prefix; the digits. *Reversed 2026-11-26
    by the user's review: `q w e s`, the screen's layout, and `Q E S`.*
18. **`/` in the drawer goes to the tab's filter.** Vim's `/` searches
    the window one is in. Rejected: the filter as the tab's first stop.
    Keys type inside a text field, so a held `k` or `gg` would land in
    the field and type.
19. **A prefix shows in the status bar and waits without a timeout.** A
    second key it does not know is dropped, as in Vim, and Escape cancels
    it first. There are no counts, and `0` stays the fit.
20. **The arrows follow `h j k l` outside the canvas**, as they do in the
    tree, so they walk the stops. Scrolling keeps `d`, `u` and `z`.
21. **A click on a stop puts the cursor there**, the page setting the
    focus, since Safari focuses no button on a click. The right-click
    menu's entry takes the focus on opening. It needs no key to open it,
    `t` doing what its one entry does.
22. **The help page lists the search's prefixes**, in a table under the
    keys, and the search field gains a `title` naming them. Neither the
    page nor the README named them.
23. **The increment precedes 10b and the release.** It moves seven keys
    that the help page and the README document, so it lands before the
    release fixes them. This reverses the ruling of 2026-11-17.

## The probes

Run on 2026-11-25 on the page built from `b366e09`, in Playwright's
Chromium, Firefox and WebKit, by the specs in `probes/` beside this file.
Every line agreed in the three but where a browser is named. Playwright's
WebKit stands in for Safari, which was not driven.

- **The held `z`.** Its repeats come as `keydown` marked `repeat`. A
  direction pressed under it sends its own `keydown`, repeats and `keyup`,
  and `z`'s `keyup` comes last. That `keyup` goes to whatever holds the
  focus, the search field after `z` and `/`, and reads `Z` while Shift is
  down. So the page ignores a repeated `z`, and listens for the `keyup`
  ahead of its check for a text field, in lower case.
- **Not probed**, synthetic keys sending none of it: a real window's blur,
  the system's own key repeat, and whether macOS withholds `z`'s `keyup`
  while Cmd is down. A headless tab brought to the back keeps
  `document.hasFocus()` and fires no blur. `probes/hand.html` logs all
  three from a real keyboard, Safari's click focus too; the user has yet to
  run it. Ruling 27 does not wait on it.
- **The cursor across a redraw.** A heading's element survives a change
  between two blocks, assembly or primitive, and a push. It is replaced
  between the open level's pane and a block's, which `Detail.svelte` draws
  in two branches, and between a block's pane and a pin's, so Shift with
  `j` and Escape lose it. A face link pressed shows a port's pane, so it
  loses it too. A replaced stop gives the focus to `aside.detail` in the
  three browsers, by the removal rule already there.
- **The focus a click leaves.** Chromium and Firefox focus the pressed
  heading, button or link. WebKit focuses a heading and gives a button's or
  a link's press to the region's root. A face row, a bare `tr`, takes no
  focus in any. A `focus()` from the page works in the three. The
  diagnostics tab's location link was absent from the fixture used and is
  untested.
- **The ring.** `:focus-visible` is false on a stop after a click, whether
  the browser or the page focused it. The next key turns it on in Chromium
  and WebKit even when it moves nothing, and in Firefox only once a key
  moves the focus.
- **Enter and Space.** Both press a heading and a button, and Enter presses
  a link, where Space does nothing. Today's Enter on a focused heading
  opens the selected assembly, as the sweep said.

## Rulings on what the probes found

The user's, of 2026-11-25, on the probes' report.

24. **A stop's ring is on `:focus`**, not `:focus-visible`, in the detail
    pane and the drawer, so a click shows it as a key does. Ruling 8's
    "real focus brings the ring for free" holds for the keyboard alone.
25. **The open level's pane and a block's are one branch**, so the cursor
    stays on its heading through Shift with `j`, Shift with `k`, Escape and
    a new selection. A pin's, a wire's and a folder's panes stay apart, and
    the cursor falls to the pane there, as the probe's rule says.
26. **A row with no action is no stop**, PARAMETERS' and TIMING's rows
    among them. Answer 11 said every row and the glossary a control. `d`
    and `u` scroll through them.
27. **A hold of `z` ends at its `keyup`, at a blur of the window and at a
    key with Cmd or Ctrl.** The last two cover a `keyup` that never comes.
28. **A face row's control is a `button.row` on the face's name**, as the
    drawer's rows have. Space stays the browser's: it presses a heading or
    a button, and Enter presses every stop.

The user then left and asked for the rest to go on without them, with the
findings and the decisions recorded for their review. The branch
`keyboard-legend-proto` stays unmerged and nothing is pushed.

## For the user's review

The run of 2026-11-25 and 26, with the user away, stopped before the merge.
The branch `keyboard-legend-proto` holds, from `b366e09`: the probes'
record (`bab037d`), the legend (`f328827`), its readings (`572e044`), the
keyboard (`bd53f23`), the record (`bf4faaf`), the review's fixes
(`01a7952`) and the closing docs commit. Nothing is pushed or merged.

- **To rule:** Cmd-K in a text field (after reading 50), F6 and F9 (the
  review's record). Ruled on 2026-11-26, rulings 51 to 55.
- **To check, the coordinator's calls:** readings 29 to 50. Reading 50 is
  amended by F2, and F8 amends answer 11.
- **To look at:** `large`'s legend, the rings, the status bar's `z …` and
  the help page's keyboard section. `npm run dev` on the branch shows them,
  and the screenshots of the last e2e run are in the worktree's
  `frontend/e2e/screenshots/`.
- **To run:** `probes/hand.html` on your keyboard, now seven steps with
  Alt, and in Safari.
- **Then:** the merge, the roadmap's entry with the landed facts, and the
  removal of the worktrees `keyboard-legend` and `keyboard-legend-review`,
  the folders `keyboard-legend-probes`, `keyboard-legend-review-probes` and
  `keyboard-legend-fix-probes`, and the three notes files beside them.

## The user's review

On 2026-11-26 the user kept readings 29 to 50 and the coordinator's calls,
looked at `large`, ran `probes/hand.html` in Safari 27, and ruled:

51. **Cmd-K and Ctrl-K reach the model's search from a text field too**,
    the search field and the diagnostics filter included.
52. **F6 as recommended.** With the menu open, Escape closes the menu
    alone, and answer 11's chain names it first.
53. **F9 stands.** A `g` pending on the help page shows nowhere, and that
    is acceptable.
54. **`q w e s` focus the regions, and `Q E S` fold them**, reversing ruling
    17's choice of `qwer`. Shift-`w` stays unbound, since the canvas cannot
    be hidden. `c` stays the color mode, and `r` is free.
55. **Keys that resize the panes** go to a session of their own, a bullet in
    `pending.md`.
56. **No `[` and `]` for the regions.** The user weighed them beside Tab or
    in its place and set them aside as not worth it now. Tab stays the one
    relative move, and the only one out of a text field. Many layouts,
    Spanish among them, reach the brackets only with Option or AltGr, which
    the shell's dispatch drops.

The look's pass landed at `1bda2e5`: `s` and `S` take the drawer, `r` and
`R` do nothing, Cmd-K and Ctrl-K reach the search from a text field, and
the help page's Escape row names the menu first. Each change's check went
red with the change reverted alone. The gate: 629 unit tests, the checker
clean, 698 browser checks passed and 4 skipped.

The hand run in Safari 27 agreed with every rule. A held `z` repeats with
`repeat` set and its `keyup` arrives; `l` and `i` repeat under it, the
accent menu holding nothing back outside a text field. Under Cmd, `z`'s
`keyup` never came, and `z` went on repeating with Cmd set, the lost
`keyup` ruling 27 guards against. Under Alt, `z` became `Ω` and was
released as `Ω`, finding F8. Across Cmd-Tab, Safari delivered `z`'s `keyup`
while the window was blurred. A click focused the body for a button and a
link, and the element itself for a `tabindex` span and a heading, as
Playwright's WebKit did. Chrome and Firefox were not run by hand.

## Readings, stage 1

The prototyper's, kept by the coordinator with the user away, for their
review. Stage 1 landed on the branch at `f328827`.

29. **The tooltip reads in answer 13's order**, `dss at the root; Dₐ 1 ·
    Φₐ 0 · τ 0`, with `τ` on a deployment alone and no `A₂`, which the line
    has. *Rejected:* the counts first, as before.
30. **A chart swatch's tooltip keeps its words**, `A₁ (noise) · Dₐ 1 · Φₐ 0
    · Δt 1/10 s; focus this rate on the canvas`. It was built from the old
    line. *Rejected:* the new line, which repeats the row's own label.
31. **The legend's cells align in columns**, the dot at the head of the
    phase's cell, where the chart's label is one string. *Rejected:* one
    cell, where `D₀ 10` pushes its phase out of line.
32. **A focused line scrolls into view when the focus changes and when the
    legend appears**, `nearest`, and not when the level changes under a
    standing focus. A press on the legend's own line runs it too, moving
    the list only for a line cut at an edge. *Rejected:* on every change of
    the lines, which a block's drag makes on each move, so the list would
    jump back under a scrolling user.
33. **The capped box is plain `overflow: auto`.** With classic scrollbars in
    Chromium it grows from 157 to 172 px and overflows nothing. Firefox with
    a classic scrollbar is unprobed.
34. **The help page's sample shows the pair alone**, `D₀ 1 · Φ₀ 0` and
    `D₀ 2 · Φ₀ 1`, the whole line shrinking in its 120 px.

Two points for the user's look. `large`'s 43 lines all read `1/50 s · τ 0`
and differ by their anchor alone, whose subscript is small at 11 px. And
ruling 23 says the README documents the moved keys, but it names `?` alone,
so it needs no change.

## Readings, stage 2

The prototyper's, kept by the coordinator with the user away, for their
review. Stage 2 landed on the branch at `bd53f23`.

35. **Cmd or Ctrl drops any prefix, a blur only a hold.** A tapped `z`
    waits through a blur. *Rejected:* a blur dropping everything, a timeout
    of a kind; Cmd sparing a tapped prefix, where `z`, Cmd-K and Enter
    leave `z` waiting.
36. **An unknown second key is dropped whole**, Tab outside a text field,
    Enter, `?`, `/`, the arrows and Shift with a letter among them. Shift,
    Alt and Caps Lock alone leave the prefix standing. Under a held `z` the
    key is dropped and the hold goes on.
37. **The second `z` of `zz` starts no hold**, so `zz` then `j` moves the
    cursor. `g` repeats under the keyboard's own repeat, as in Vim, so a
    held `g` runs `gg` again and can leave a `g` pending. `z` tapped and
    `j` held scrolls once and then moves the cursor. Vim does the same.
38. **`q w e r` keep a cursor already in the region**, and from another
    control in it, a tab button or Fit, they go to the root. No stop is
    remembered for a region left. *Rejected:* always the root.
39. **`gg` and `G` take the first and last stop that `j` and `k` walk**, so
    `G` never lands on a row's last link.
40. **From a row's link, `j` and `k` go on from its row.** *Rejected:* `k`
    to the link's own row.
41. **A chart row's first swatch is its row**, the others its further
    controls, and "by Δt" is a row of the drawer. The filter and the tab
    buttons are no stops. A pressed swatch's ring is now a shadow, and its
    cursor ring sits 3 px out, since the two were pixel-identical.
42. **The wire's, pin's, port's and folder's panes are flat**: `j` and `k`
    walk their links, and `h` and `l` do nothing.
43. **`gt` and `gT` wrap**, as in Vim.
44. **A focused stop has an 8 px scroll margin**, so its ring stays whole.
45. **`/` selects the filter's text**, and Escape goes to the drawer's root,
    not the stop held before, since the rows may have changed.
46. **The menu gives the focus back to what held it at its opening**, the
    canvas after a right press, since the press itself moves the focus.
47. **The help page runs the same machine for `g`.** Opening or closing it
    drops a prefix. `z` is none of its keys.
48. **The status bar shows `z …`** after its other texts, unshrinking.
49. **Enter on a control that is no stop**, a tab button or Fit, keeps the
    old rule: it opens the selected assembly, else the browser presses.
50. **A click that only left a text selection still moves the cursor** to
    its row's button. The row does not act.

**For the user to rule.** *Cmd-K in a text field.* It is dead there, the
diagnostics filter included, as before. Answer 11 excepts Cmd-O and Ctrl-O
alone from "outside text fields", and answer 5 says Cmd-K is the model's
search "from everywhere". The build took "everywhere" for every region. The
change would move one check ahead of the text-field check.

Known limits, which the rulings cause. A face's name is a button, so a drag
selects none of its text. The
panes' stops are told by `checkVisibility()`, believed to need Safari 17.4.
The trap "Enter on a drawer button" in `design/rules.md` is stale, and the
closing docs commit drops it.

## The shape built

- `src/lib/timing.ts`, `rates.ts`, `Canvas.svelte`: the legend's line, its
  order, its cells and its scroll. `Chart.svelte` composes its tooltip.
- `src/lib/prefix.ts`, new: the prefixes' state machine. `navigate.ts`:
  `stopStep`, the outline's `h j k l`, and `walkOf`.
- `src/App.svelte`: the prefix state, the `keyup`, the blur and the click
  that places the cursor, `stopsOf`, and the dispatch by `keyName`.
- `Detail.svelte`: the open level's pane and a block's are one branch, and a
  face's name is a button. `Drawer.svelte`, `Frame.svelte`, `StatusBar`,
  `Search`, `Help.svelte`, `help.ts`, `Canvas.svelte`'s menu.
- Checks: `cursor.spec.ts`, new, with 22 in each browser; `keys.spec.ts`
  gains 6, `help.spec.ts` 2. Every check of an old key moved to its new
  one, none deleted. `frontend/MAP.md` stands at 786 lines.

## Measurements

The gate at `bd53f23`: 627 unit tests, 613 at the baseline; the checker
clean; 684 browser checks passed and 4 skipped, 620 and 4 at the baseline.
Playwright's WebKit, outside the config, passes 60 of the 61 checks of
`cursor`, `keys` and `help`. Its failure, the help page's second `?` at
`help.spec.ts:246`, also fails on stage 1's build, and nobody looked into it.

## What the tests pin

100 mutants, all red: 18 on the legend and 82 on the keyboard, the runners
in `tools/`, run with `FRONTEND` naming a worktree's `frontend/`. Three
survived at first and their checks were tightened. The rules on keys and on
the outline are unit-tested in `prefix.test.ts` and `navigate.test.ts`, and
those on the DOM are in `cursor.spec.ts` and `keys.spec.ts`.

## The cold review's charter

An independent agent reads the records' answers, then the code and the
page. It runs the gate and reverts each rule alone. It drives what the
builders did not: long sequences of prefixes across regions, pushes and
drops with a cursor standing, hidden and narrow panes, the removal rule in
Firefox, and a fixture of each kind. It reads the screenshots against the
answers.

## The review's record

The cold review of 2026-11-25 ran on `bf4faaf`. The gate stood as stage 2
left it. Its probes drove the page in Chromium, Firefox and Playwright's
WebKit: 75 mutants of its own, 68 red, and random runs of 700 steps over
the regions, pushes and drops, clean but for what follows. The coordinator
ruled on each finding with the user away.

- **F1, fixed.** A cursor on a face's row or link fell to the body when the
  next node held the same face in another order. The keyed rows move, a
  browser blurs a moved focused element, and the removal rule saw it still
  connected. In Firefox and WebKit the page then still named the detail
  pane as focused. A heading never moves, so no check caught it.
- **F2, fixed.** In WebKit alone a drag that selected text in an analysis
  row lost its selection and ran the row. The click's capture handler
  focused the row's button first, and WebKit's `focus()` cleared the
  selection. Reading 50 is turned: such a click moves no cursor to the
  row's button. The press has already given the focus to the region's root
  in Chromium and Firefox, so the cursor ends there, not on a stop held
  before. Putting it back would need the `focus()` that clears the
  selection in WebKit.
- **F3, fixed.** A prefix outlived a refused file and waited, unshown, for
  the next model.
- **F4, fixed.** The legend's scroll into view also scrolled the canvas
  sideways when the canvas was narrower than the legend.
- **F5, fixed.** The menu stayed drawn after `q`, `e` or `r` took the focus,
  and a later Escape pulled the focus to the canvas. Reading 46 now holds
  only while the menu holds the focus. The menu prevents its `mousedown`,
  since WebKit gave a pressed entry's focus to the canvas, which closed the
  menu before the click. Only WebKit shows it, so no check in the gate
  pins that line.
- **F6, for the user.** With the menu open and a prefix pending, Escape
  closes the menu and leaves the prefix, as MAP.md says, where answer 11's
  chain puts the prefix first. Either order serves. The coordinator
  recommends the menu first, since it is what the user sees, with answer
  11 naming it.
- **F7, fixed.** `n` under Caps Lock acted as `N`. It is read like every
  other letter now.
- **F8, fixed.** A held `z` released under Alt stuck, since macOS's `keyup`
  then reads another character. An Alt key ends a hold too, which extends
  ruling 27 by its own reason, and answer 11 says so. `probes/hand.html`
  gains that step.
- **F9, for the user.** A `g` pending on the help page shows nowhere, the
  page covering the status bar, so the next Escape or `?` is swallowed once.
- **F10.** The help page's and MAP.md's stale lines are fixed in code. The
  traps in `design/rules.md` naming `u` for the undo and `r` for the color
  mode, and "Enter on a drawer button", go in the closing docs commit.
- **F11, fixed.** Checks for the review's survivors: Tab under a prefix in a
  text field, Alt and the prefixes, a stage 2 edge's row in the click's
  mapping, and Alt with an arrow left to the browser.
- **The tree's `gg` and `G`** now scroll their row into view when it is
  already selected, as the detail pane's do. The known limit above is gone.
- **The delta check** of the fixes at `01a7952` found every ruled finding
  fixed, each check red without its fix in both browsers, and no new fault.
  The gate there: 629 unit tests, the checker clean, 696 browser checks
  passed and 4 skipped. The probes and runners of the review and the fixes
  are in `review/` beside this file. In Playwright's WebKit, outside the
  config, 7 checks fail at `01a7952`, the same 7 as at `bf4faaf`: four on
  the clipboard, `regions.spec.ts:47` on a timeout, `help.spec.ts:251` on
  WebKit's Backspace, and `analysis.spec.ts:186`, whose own `focus()`
  clears the selection there.
- **Older than the increment, left:** a long face name overflows the 240 px
  pane by up to 222 px; `Q` or `E` on a structureless failure drops the
  focus to the body; `/` then Escape there leaves it in the search field.

## Out of scope

- Hints, Vimium's `f`, kept free (`pending.md`). They are the only path
  to wires, port squares and the legend's lines.
- A keyboard form for dragging, as before.
