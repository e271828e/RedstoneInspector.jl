# Brief: increment 8, the second look's fixes

One commit on `increment-8` by one fixer, then one cold review and its fix,
then the merge. Drafted on 2026-11-12 at `06176a1` of the branch, checked
out in `~/.julia/dev/RedstoneInspector.jl-inc8`, after the docs commit on
`master` that carries this brief. No prototype: the second look ruled each
change, and `look2_inspector_08.md` holds the rulings under their entries
and the settled texts in its section 7. The user delegated the rest of the
arc on 2026-11-12; the coordinator's own rulings are in
`notes_inspector_08.md`, "The second look". Not normative: if a shape below
proves wrong at the keyboard, stop and report rather than deviate.

The records live on `master` in `~/.julia/dev/RedstoneInspector.jl/design/`
and are read there by absolute path. The branch has no `design/` folder. The
code, `frontend/MAP.md` and `README.md` are the branch's.

## What is settled

Each line cites the second look's entry, which holds the reason.

- **1.3** The feedthrough edge's title takes the text of 7.1.
- **1.8** In the three analysis tabs, a release that leaves a text selection
  inside a row selects nothing.
- **2.3** The rate pill straddles the top edge at the left and the order
  badge the bottom edge at the left, always.
- **2.4** Nothing yields. An overlay pill draws over an order badge it
  meets.
- **3.1** The open level's pane loses its line of counts. Its facts gain
  "wires", and the words "open level" stand where a closed assembly has its
  Open button.
- **3.2** The rate scopes follow the locations.
- **3.4** The pane states pinning on a primitive's own face alone, and a
  pin's or a port's line drops its kind word.
- **3.5** A location's label breaks after a slash and never inside the
  file's name or its line number.
- **4.4** The help page's badge drawing shows the clocks at the top-left.
- **4.9** The help page does not scroll sideways at a narrow window.
- **5.3** The README's status line takes the text of 7.2.

Amended on `master` with this brief: `workspace.md` answers 4, 6 and 7,
`visual_grammar.md` answers 4 and 6. Answer 4 of the grammar now says a
struct's wire is a double line, as the canvas draws it, so no canvas change
follows from 4.3.

## The shape built

Line numbers are from `git show 06176a1:<file>`, under `frontend/` unless
the path says otherwise.

- `src/frame/tabs/Order.svelte:13`. `PRESUMED` is 7.1, word for word.
- **The row click and a text selection**, the three tabs:
  `RootInputs.svelte:26`, `Timing.svelte:38`, `:65` and `:87`,
  `Order.svelte:28`, `:49` and `:62`. A click made by the pointer selects
  nothing when it finds a selection, not collapsed, that touches the row
  and differs from the selection its press began with: a drag made or
  changed it. A plain click, a click on text selected earlier, a click on a
  row while text is selected elsewhere, and the inner `button.row` pressed
  from the keyboard all select as today. One shared helper, not seven
  copies. Amended twice. At the fixer's stop: the rule first read the
  selection at the click alone, and Chromium keeps a selection through a
  click on it, so a plain click on selected text would have selected
  nothing. At the review: the rule then asked that the press begin with no
  selection touching the row, so a second drag in a row that already held
  one selected the row's target.
- `src/canvas/Canvas.svelte`, the rate pill (768 to 779) and the order
  badge (780 to 790), with the constants' comment at
  `src/canvas/size.ts:21` to `:27`. The two swap rows. The rate pill sits
  `BADGE_INSET` from the left edge on the top row, `y = BADGE_TOP`. The
  order badge sits `BADGE_INSET` from the left edge on the bottom row,
  `y = box.height - BADGE_HEIGHT - BADGE_TOP`, the overlay pills' row.
  Neither depends on a toggle or on the overlay. The yield goes: the test
  at 771 and `overlayLeft` (554 to 564) when nothing else reads it. The
  overlay's pills keep their place and their group, `g.overlay`, drawn
  after the blocks, so one paints over an order badge it meets. Titles,
  classes and the click on the order badge stay.
- `src/lib/detail.ts`. An assembly's node facts gain `wires`, the count of
  its own level's wires, beside `children` (130, 202), for a closed
  assembly and for the open level alike, so `LevelFacts` no longer adds it
  (220). `FACT_TITLES` (86) gains `wires`: "How many wires the assembly
  declares on its own level." `levelLine` (210 to 212) goes. `faceFacts`
  (171): `pinned` is defined only for a primitive's own face that is not a
  root input, and is undefined for every assembly face.
- `src/frame/Detail.svelte`.
  - The facts list (110 to 133) shows `wires` right under `children`,
    `dd[data-fact="wires"]`.
  - The level branch (175 to 182). The header's path line carries
    `span.level-mark` reading "open level" right after `button.copy`,
    where `button.open-level` stands on a closed assembly. The line
    `p.facts` goes. The rate scopes, their `h3` and `ul.scopes` unchanged,
    move between the locations and the parameters. Since the node snippet
    draws both, the scopes pass into it; a closed assembly and a primitive
    show none, as today.
  - The pin's and the port's line (206) holds the stage, when the face has
    one, and "pinned" or "not pinned", when `pinned` is defined, joined by
    " · ". The kind word goes. With neither, no `p.facts` is drawn.
  - The faces table (89) needs no edit of its own: an assembly's rows lose
    the ◆ through `faceFacts`.
  - A location's label (152, 255). The text is unchanged, `file:line`, and
    so is what a click copies. It may break after any slash. The last path
    segment with `:line` never breaks while it fits the pane on a line of
    its own. `overflow-wrap: anywhere` stays for a segment wider than the
    pane.
- `src/frame/Help.svelte`. The badge sample (32 to 36, 85 to 91) draws its
  clock pill on the top edge at the left, as the canvas now does. The About
  section's addresses (`dl.about dd`, 242) and the Vimium paragraph's
  patterns (`p.vimium code`, 195) may break anywhere. At a viewport 360 px
  wide `article.help` does not scroll sideways. If something else then
  sets a floor above 360 px, report it and fix it the same way.
- `README.md`, at the repository's root. Line 9 is 7.2. The sentence at 172
  to 173 on the open level drops "under the level's counts". The sentence
  at 182 to 185 says where the rate badge and the order badge sit and
  drops the yield.
- `frontend/MAP.md`. The rows that follow the code: `detail.ts`'s layout
  row (28) and its test line (266), the rate pill (338 to 341), the wires'
  "where answer 4 says triple" (348), the bottom badges (390), the order
  badge (393), the contract rows for the rate pill (437), the header (542),
  the facts (543), the lists (545) and the faces (546), and
  `colors.spec.ts`'s line (658). A changed row replaces the old one, and
  the file stays under about 700 lines.

## Readings the coordinator took

Ruled on 2026-11-12 under the user's delegation, each in the notes.

1. A closed assembly's facts gain "wires" too, so the open level and the
   closed assembly differ by the button and the mark alone.
2. The selection guard reads the pointer's click alone and asks that the
   selection touch the row, so a selection left elsewhere blocks nothing
   and the keyboard's path is untouched. It compares the selection at the
   press with the one at the click, so a drag that makes or changes a
   selection is blocked and a click that leaves it as it was is not.
3. A location's label keeps the file's name with its line number, since
   that pair is what a reader copies or looks for.
4. The help page holds at 360 px, the narrowest phone width in common use.
5. A pin's or a port's line with nothing to say is not drawn.

## What the tests pin, by property

- **The edge's title** (1.3): the literal of 7.1 on an edge row of
  `closed_loop`'s `lqr_controller/tracker`.
- **A text selection blocks the row's click** (1.8). On `closed_loop`'s
  root inputs tab, a pointer drag across the text of `mode`'s type cell
  leaves a selection and selects nothing; a plain click on the same cell
  then selects the tag. One more row kind of another tab the same way.
  Mutant: the guard removed.
- **The pills' places** (2.3). In rate mode on `closed_loop`'s root with
  `o` on, for each assembly: the rate pill's left edge is `BADGE_INSET`
  from the block's left edge and its vertical middle is on the block's top
  edge; the order badge's left edge is `BADGE_INSET` from the left edge
  and its vertical middle is on the bottom edge; each to a pixel's
  tolerance at scale 1, recomputed from the DOM. The rate pill's box is
  the same with `o` off. Mutant: the two rows swapped back.
- **Nothing yields** (2.4). `failure_nested`'s root in rate mode: `ctl`
  shows its clock pill and its loop pill together. `rates` with a route
  traced from `src`'s output, rate mode and `o` on: `fast` and `slow` keep
  their clock pills and their order badges while the route stands. The
  overlay's group follows the blocks' group in the svg, which the contract
  already states. Mutant: the yield put back.
- **The level's pane** (3.1, 3.2). At `closed_loop`'s root with nothing
  selected: `span.level-mark` reads "open level" and follows `button.copy`;
  no `p.facts`; `dd[data-fact="children"]` reads 6 and
  `dd[data-fact="wires"]` 30, in that order. On `rates`' `fast`: the
  scopes' heading follows the locations' list and precedes the parameters'
  heading when there is one. `sensing` selected at the root: a closed
  assembly shows `wires` too, with its Open button and no mark. Mutant:
  the old line kept.
- **Pinning on a primitive's own face alone** (3.4), unit and browser.
  `kinds`' root output faces, each fed by a pinned primitive output, carry
  no `pinned`, and the root's faces table shows no ◆. The pin `⟨out⟩i` of
  `kinds` draws no `p.facts`. The pin `h_ref` inside `pid_controller` and
  the port `θ` on `pid_controller` at the root say nothing of pinning.
  `pid_controller/free`'s port `y` reads "stage 1 · pinned"; a primitive's
  unpinned output reads "stage N · not pinned" with its own stage. No
  line opens with "pin" or "port". Mutant: an assembly's face reading its
  terminal producer's flag.
- **A location's label** (3.5). At `closed_loop`'s root with nothing
  selected, at pane widths 240, 360, 380 and 420 px: for each of the five
  labels, the characters of the last path segment and its line number
  share one line, read from each character's client rect. Mutant: the
  label left to break anywhere.
- **The help page at 360 px** (4.9): `article.help`'s `scrollWidth` equals
  its `clientWidth`. Mutant: the addresses unbreakable.
- **The badge sample** (4.4): the sample's pill straddles its box's top
  edge, recomputed from the sample's own rects.
- The checks that pinned the old behavior are rewritten, not deleted:
  `colors.spec.ts`'s yield test (219), `order.spec.ts`'s place test (40),
  `detail.spec.ts`'s level and pin tests (38, 43, 210 to 234, 349, 351),
  `state.spec.ts:131`, and `detail.test.ts`'s cases at 166 to 186 and 245
  to 246.

Screenshots, saved by the checks under `e2e/screenshots/`:
`order.closed_loop__root` in rate mode with the badges on,
`order.closed_loop__pid_controller` with the badges on,
`detail-level.closed_loop__root`, and `help.none__root`.

## The stage

One fresh high-tier fixer in the worktree. It runs, from `frontend/`:
`npm run check`, `npm test`, `npm run build`, then
`npm run e2e -- --project=chromium`, all green before its commit. It
commits once, with one sentence and no trailer, staging explicit paths. It
hands its notes back in its final message: what it built, the DOM contract
it changed, its departures with reasons, and what it saw in the
screenshots, the order badge against the face names on a primitive's
bottom edge inside `pid_controller` above all.

## Routing

- `frontend/MAP.md` whole, on the branch.
- `design/rules.md` on `master`, the sections "Frontend increments" and
  "Frontend traps".
- This brief, and `look2_inspector_08.md` for the entries it cites and
  section 7.
- `workspace.md` answers 4, 6 and 7 and `visual_grammar.md` answers 4 and
  6 on `master`, as amended.

## Bookkeeping

The coordinator's, on `master`, after the review: `rules.md`'s trap "Pills
sharing an edge", which the swap rewrites; `notes_inspector_08.md`; the
roadmap's landed note for increment 8; `pending.md`'s first bullet, retired
at the merge.

## Out of scope

- The pane's face rows and the tree's rows under a text selection; the
  ruling names the analysis tabs.
- A third look. The user delegated the arc to the merge.
- Increment 8b and the pin (`pending.md`).

## The cold review

One independent high-tier reviewer over `06176a1..` the fixer's commit. It
runs the four checks from a clean `npm ci` in a scratch worktree. It walks
each entry of "What is settled" against the running page on `closed_loop`,
`rates`, `kinds`, `failure_nested` and `primitive`. It reverts each change
alone on a scratch copy to show a check goes red, the mutants above first.
It reads the four screenshots against the rulings, and looks for an order
badge covering a face name or a display name on any level of
`closed_loop`. A surviving mutant is a missing check or an acceptable
survivor named with its reason. Empty is acceptable.

## The review's record

The fixer stopped once, having committed nothing, on the selection guard's
rule against its own check, was resumed with the ruling, and landed the
brief as `41ffedd`: the type check with no error, 511 unit tests, 210
browser checks. Every mutant this brief names turned its check red. Its
departures, accepted: the guard is a new file,
`src/frame/tabs/rowClick.ts`, since it touches the DOM and `src/lib/`
stays pure; `MAP.md` stands at 704 lines; two stale comments were
corrected, `size.ts:19` and the wire styles' in `Canvas.svelte`.

One independent reviewer covered `06176a1..41ffedd` from a clean `npm ci`
in a scratch worktree, at the same tallies. Every entry of "What is
settled" held on the running page, and each literal matched its source.
Its sweeps: a location's label breaks only after a slash at every pane
width from 240 to 800 px on three fixtures; the help page does not scroll
sideways from 310 px up, `table.keys` setting that floor; no pill covers a
face name, a display name, an icon, a port square or a segment's ink on
any level of four fixtures; on `closed_loop`, a route traced from a root
input puts `lqr_controller`'s route pill over its order badge, the overlay
on top.

Six findings, five accepted:

1. **A second drag in a row that already held a selection selected the
   row's target** (medium). The brief's rule let it through. The guard now
   compares the selection at the press with the one at the click, and the
   brief's rule is amended.
2. **No check pinned the row's button pressed from the keyboard under a
   standing selection** (medium). A check presses Enter on it.
3. **No drag check ran on the timing tab** (low). One runs on a component's
   period cell.
4. **The "wires" fact's title was unpinned** (low). Its literal is pinned.
5. **`src/lib/wires.ts:9` still said "the triple line"** (low). Corrected.
6. **The README's sentence on a row's click omits the exception** (low).
   Not accepted: the exception is too fine for the README.

The fixer landed the five as `6323d80`, at the same tallies. The reviewer,
resumed, verified the delta from a clean install: each finding held, every
case that must still select did, a Shift-click that extends a selection
inside the row selects nothing, as the ruling reads, and its mutants for
the five turned a check red. Survivors, all accepted and named:

- **Either half of the label's guard removed alone**, the `<wbr>` after
  each slash or the file name's inline block. Each alone keeps the name
  whole at every width swept; both removed turns the check red.
- **The guard without its test that the selection touches the row.** In
  Chromium a press elsewhere collapses the selection first.
- **The guard bypassed on an edge row.** Its text is inside a button, which
  Chromium does not let a drag select.
- **The ranges compared by their start alone.** The one case it misses, a
  second drag from the old selection's start, begins on selected text,
  where Chromium starts a drag-and-drop and no selection.
- **A root input given a pinned flag**, in the browser checks alone; the
  unit test pins it.

Two observations left as they are: the rate pill sits 0.8 to 2 units above
the segment's ink, where the order badge sat before the swap; and a
primitive root's pane shows no "open level" mark, an item of `pending.md`.

The branch was rebased onto `master` with no conflict, the two commits
becoming `50cd2db` and `af55fe5`, and `master` fast-forwarded to it.
