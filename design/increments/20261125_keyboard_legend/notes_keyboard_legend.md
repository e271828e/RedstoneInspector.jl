# The keyboard by family and the legend's line, notes

The record of the keyboard session, the user's design session of
2026-11-25, held before increment 10b. It opened on three tweaks, the
legend's line, the search's prefixes on the help page and Vim's keys, and
ended as one increment in two stages, the legend first. The rules stand
in `workspace.md` answers 5, 7, 9 and 11, `deployment_overlay.md` answer
13 and `visual_grammar.md` answer 6. This file holds their reasons, what
was rejected, and the probes that precede the prototype.

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
    relative moves under a third prefix; the digits.
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

## Out of scope

- Hints, Vimium's `f`, kept free (`pending.md`). They are the only path
  to wires, port squares and the legend's lines.
- A keyboard form for dragging, as before.
