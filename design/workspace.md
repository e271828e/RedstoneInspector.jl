# The workspace: axis 5 of the inspector's stage 1

The record of one session, on 2026-10-27, that fixed the page around the
diagram: the frame, the tree, navigation, selection and the detail pane,
search, the drawer, the analysis views, face routes, view state across
pushes, files and the hosted copy, the help page and the keyboard. It builds
on `initial_design.md`'s answers 8, 9 and 15 and on `visual_grammar.md`, and
never restates them; where it amends one, it says so. Like its parents it is
not normative. Stage 4 has settled that its cockpit is a docking layout over
this page, so what this record builds must rehost as dock nodes.

## Pending questions

Open items live in `pending.md`.

## Answered questions

1. **The frame: a fixed grid now, dock nodes later.** The tree on the left,
   the canvas at the center with the breadcrumb above it and a one-line
   status bar below, the detail pane on the right and the drawer at the
   bottom, in a grid with draggable splitters; each side pane collapses to
   a thin strip with its icon. The status bar carries the block and wire
   counts, the color mode and the connection state. No docking library in
   stage 1: the panes are self-contained components with no knowledge of
   their position, so stage 4's dock hosts them as nodes and replaces only
   the grid. Splitter positions and collapsed panes persist per browser in
   local storage, presentation state and never model state.
   *Amended 2026-10-28 (`live_session.md` answer 5): the connection state
   waited for stage 2.*
   *Why:* a dock carries its weight and upgrade exposure through two stages
   with nothing to dock, the spike's lesson on a dependency held for a later
   need; the grid is a few dozen lines to replace. Answer 12's refusal of
   saved layout is untouched, since no block position is stored.

2. **The tree: the node list as an outline, selection and opening apart.**
   One row per node in walk order, nested by the parent rule; the root row
   labelled by the envelope `name`, else the root type's display name; an
   assembly row expands, a primitive row does not; a keyed container's
   elements sit under a folder row named by the field, which is no node and
   on a click highlights the region and shows the field in the detail pane,
   and which expands with its node, under the root or below it;
   a transparent container's elements sit under the parent. Root inputs are
   faces and stay in the drawer; a primitive root is one row. A row shows a
   color dot following the canvas's mode, the segment and the display name
   in lighter text, a chevron on an assembly, no icon. Selection is shared:
   a click on a block selects its row and scrolls to it, a click on a row
   selects the node and makes the canvas show its parent's level, opening
   it if need be. Opening is the double-click on an assembly row or the
   chevron's affordance, the same gesture as on its block; the open level's
   row is bold with a marker. Expansion state is kept by path across
   pushes, the root expanded one level by default. Dots propagate upward: a
   red dot on a row whose subtree holds a diagnostic, amber for a warning,
   blue for a level a route passes, counts on hover; search hits take the
   dashed marker; the tree never filters. With the tree focused, `j` and
   `k` move the selection one row, `l` expands an assembly row or, when it
   is expanded, steps to its first child, `h` collapses a row or, when it
   is collapsed or a primitive, steps to its parent's row, and `Shift+j`
   opens the selected assembly, the canvas following as for a click. The
   arrows do there what `h j k l` do, and with no row selected `j`, `k`,
   Down and Up each take the first row.
   *Amended 2026-11-01 (increment 5's look pass): the tree had no keys of
   its own. Amended 2026-11-12 (increment 8b, the user's rulings): the
   arrows panned the canvas from the tree, and no rule covered a tree with
   no row selected. Amended 2026-11-17 (the polish batch): a folder under a
   non-root node started collapsed when its node expanded.*
   *Why:* the tree is the descriptor's node list, so it costs nothing to
   derive and always agrees with the canvas; selecting a closed assembly to
   read its detail must not force opening it. *Rejected:* root inputs as
   pseudo-rows under the root, which would read as components; a single
   click opening an assembly, Simulink's model browser, for the reason
   above.

3. **Navigation: one gesture to open, the breadcrumb and the URL hash to
   move.** A closed assembly opens by double-click on its block or its tree
   row, by the chevron's affordance, by Enter when selected, or by the
   badge a loop chain or a route leaves on it, which opens the child with
   the chain still highlighted. A level fits to view when first opened and
   restores its own zoom and pan when revisited, kept per path for the
   session. The breadcrumb spells the open level's path as links, the root
   labelled as the tree labels it; Backspace or Alt-Up goes to the parent.
   Any move to an ancestor of the level left, by these keys, the
   breadcrumb, back or forward, or a double-click on its tree row, selects the
   ancestor's child on the path, so the keyboard continues from it. The
   open level is the page's URL hash,
   `#level=aircraft/loops`, so back and forward move between levels, a
   reload reopens the level and a level is linkable in the hosted copy; the file is never in the URL. On load
   the root opens, fitted, the tree one level deep, nothing selected; a
   failure descriptor opens the same way with the drawer on its
   diagnostics. After a push the open level stays by path and otherwise
   falls back to its longest prefix that is still an assembly, the root at
   worst, noted in the status bar; a surviving level keeps its view, a
   fallback fits. Drag pans, the wheel zooms about the pointer, a corner
   button and `0` fit, `+` and `-` zoom.
   *Amended 2026-11-02 (increment 6's look pass): the selection of the
   ancestor's child on a move up joined. Amended 2026-11-17 (the user's
   ruling on `pending.md`'s open items): the rule named the keys, the
   breadcrumb and back alone, where the page applies it to every move up.*
   *Why:* a single click must select, including a closed assembly, so
   opening needs a second gesture everywhere. *Rejected:* a history entry
   per selection, which turns the back button into an undo of clicks.

4. **Selection and the detail pane: one element, the level when none.**
   Selection is single: a block, a region's folder, a wire, a pin or a
   port square, Escape clearing it. With nothing selected the pane shows
   the open level as it shows a closed assembly, with the words "open
   level" where the open button stands, and a face row selecting the
   level's pin; the root so gains its
   docstring, locations and parameters. A primitive root's level is the
   primitive itself, so its pane shows the primitive's layout with the same
   words "open level" beside the copy button. A primitive block shows, in order:
   - the header: segment, display name and path, a copy button and, on an
     assembly, the open button beside it;
   - a short list of labelled facts, each label carrying a hover title
     that says what it means: the qualified type with the alias beside it;
     the class and tier; and, when `key` is present, the membership with
     its container's kind written out, "transparent container `children`,
     key `plant`" or "keyed container `gains`, key `a`";
   - six collapsible sections under capitalized headings, each shown only
     when it has content: SIGNATURE, DOCSTRING, LOCATIONS and TIMING,
     which start collapsed, then PARAMETERS and FACES, which start open.
     A section keeps its state across selections and levels (answer 9);
   - the signature in monospace, wrapped;
   - the docstring, rendered from Markdown by a bundled renderer, a
     Documenter `@ref` link rendered as its code text, linking being axis
     7's;
   - the locations, one per declaration, a click opening the file in the
     editor through the server in the live session (axis 6) and copying
     the path in the hosted copy;
   - the timing as a frames table, a row per frame with its period and
     its phase, and the chain of `sample_times` links on a line under it
     (`deployment_overlay.md` answer 10), and no section for a continuous primitive, which no rate gates;
   - the parameters as a name and summary table, each summary under its
     name when the pane is narrow;
   - the faces, inputs then outputs, each with name, type, the kind marker
     as a short phrase, "vector 3 of float" or "struct {x, y}", the pinned
     mark and an output's stage; an input names its terminal producer and
     an output its consumers as clickable paths, a row click selects the
     port, and each face's facts stack when the pane is narrow.

   A closed assembly shows the same without tier, with timing only when
   it is a rate scope and then no chain, with its
   child and wire counts, its faces typed through the resolution with no
   pinned mark, and an open button.
   A folder shows its field, count and keys as links. A wire shows its
   declared endpoints, the terminal primitive port behind an assembly face,
   the type and kind phrase from the terminal producer, and its level. A pin
   or a port shows its face's facts, what feeds it, the `root_inputs` row
   and later the claim for a root input, and a trace button starting the
   route of question 8. Its facts name an output's stage and whether the
   face is pinned on a primitive's own face alone: an assembly's face
   declares neither, and the header already says pin or port.
   *Amended 2026-11-01 (increment 5's look pass): the header had the copy
   button alone; the facts were one line with the timing read out, the
   alias and qualified type below it; the signature was collapsed with no
   title and the docstring shown open. Amended 2026-11-02 (increment 6's
   look pass): the membership did not name its container's kind, the
   docstring's title carried its first line, and the narrow pane stacked
   nothing. Amended 2026-11-11 (increment 8's look pass, 3.5): the open
   level showed its path, display name, counts, faces and scope timing
   alone, so a root's docstring was out of reach. Amended 2026-11-12
   (increment 8's second look, 3.1, 3.2 and 3.4): the open level stood
   under a line of its counts with its rate scopes above the facts; a
   closed assembly showed no wire count; an assembly's face read its
   terminal producer's pinned flag, "not pinned" for one a root input
   feeds; and a pin's or a port's line opened with the word "pin" or
   "port". Amended 2026-11-17 (the polish batch): a primitive root's pane
   with nothing selected carried no "open level" mark, the same as with the
   primitive selected. Amended 2026-11-20 (`deployment_overlay.md` answer
   10): the rate was read out as a phrase, "every 4th base tick, offset
   1" or "every tick of `q_ctl`, 1/50 s", with the anchor, `m` and `c` in
   its hover title, and a rate scope had no table. Amended 2026-11-23
   (`deployment_overlay.md` answer 10, the record at the new pin, the
   user away): the pane showed no chain, which the core now carries on
   the node as `rates`. Amended 2026-11-24 (increment 10's look, 8.1):
   the rate was a fact of the list, and the open level's rate scopes a
   section after the locations, where a keyed assembly selected as a
   block showed no timing. The signature and the docstring alone
   collapsed, under lowercase titles, and collapsed again at each
   selection. The faces table's stage column was headed "st.".*
   *Why:* everything here is in the descriptor or in the resolution the
   client already does; an empty pane teaches nothing. *Rejected:*
   multi-selection, with no reader until stage 4's panels; a pane following
   hover, which fights reading.

5. **Search: a substring over path, type and face names, on the tree.** A
   field at the top of the tree pane, focused by `/` or Cmd-K; while it has
   focus and a query stands, its results stand in the outline's place, and
   the outline comes back with its markers when focus leaves. The match is
   a case-insensitive substring over the whole model's paths, types with
   their aliases and face names, never a regular expression and never a
   parse of a name (D-418); a bare query matches all three fields, the
   prefixes `path:`, `type:` and `face:` narrow to one, space-separated
   terms all match. One row per hit grouped under nodes and faces, the
   matched text emphasised, the count in the group header, capped at a
   hundred rows with a refine note; arrows move, Enter selects as a tree
   click does and returns focus to the canvas, Escape clears; while a query
   stands, `n` and `N` on the canvas select the next and the previous hit
   in the list's order, opening its level and the view following; a prefix
   with no text after it is no term, so `face:` alone lists nothing until a
   character follows; the query survives a push. Hits take the dashed halo
   on the open level, blocks for nodes and port squares for faces, the rest
   of the level dimming; tree rows take the dashed marker with the count
   propagating up collapsed subtrees; the tree never filters. Docstrings
   and parameter summaries are not searched in stage 1; a `doc:` prefix can
   join later. Diagnostics have the drawer's own filter. With the drawer
   focused on its diagnostics tab and the filter showing, `/` goes to that
   filter, where Escape gives the focus back to the drawer and keeps the
   text; Cmd-K is the model's search from everywhere.
   *Amended 2026-11-01 (increment 5's look pass): Enter's return of focus
   to the canvas, `n` and `N`, and the empty prefix's rule joined. Amended
   2026-11-04 (the records' pass, to the page increment 5 built): the
   results replaced the outline whenever a query was active. Amended
   2026-11-25 (the keyboard session,
   `increments/20261125_keyboard_legend/notes_keyboard_legend.md`): `/`
   went to the model's search from the drawer too, and the filter had no
   key.*
   *Why:* a face named `q` matches half a model without a prefix; the block
   searched for is usually on a level the user cannot see. *Rejected:* a
   fuzzy matcher, which ranks guesses where the user typed a name they
   know; searching the open level only.

6. **The drawer: four tabs, collapsed unless something is wrong.**
   Diagnostics: one row per diagnostic with kind, attributed path and
   message, the error hue and amber, a text filter, the count on the tab, a
   click selecting the element and navigating to it, a loop opening its
   first member's level with the chain lit; a deployment's own warnings
   follow its build's (`deployment_overlay.md` answer 4); the empty state
   says so. Root
   inputs: name, type, kind phrase, the pinned mark, terminal consumers
   one to a line, those that pin marked with the cause
   (`deployment_overlay.md` answer 14), and, from stage 2, the claiming
   writer, a row selecting the root pin; the home of stage 3's input
   widgets. Timing, in the notation of `deployment_overlay.md` answer 3:
   anchors as `A₁ (key)` with `Δt`, `τ` and the declaring scope, `A₀` as
   the base grid; a section on the base grid with the coarsest
   admissible tick, the pool entries that refine it, their alternatives
   and the prime attribution; scopes and components in the same columns, every
   discrete primitive in walk order with its anchor, `Dₐ`, `Φₐ`, `Δt` and
   `τ`,
   sortable by period, with its rate-mode swatch. A deployment heads the
   tab with its parameters and the steps per frame, adds `D₀` and `Φ₀` to
   the anchors, the scopes and the components, and draws
   the hyperperiod chart, which a build descriptor says needs a
   deployment (`deployment_overlay.md` answers 9 and 11). Execution
   order: two
   groups, as the core's §5.3 runs a sweep. The first lists every primitive
   with a stage 1 port, unnumbered, since stage 1 runs in any order. The
   second lists every primitive with a stage 2 port in `outputs.order`'s
   order, numbered from 1 over that group, and under a row the feedthrough
   edges into it, labelled presumed. A primitive with both stages stands in
   both groups, each time with that stage's ports. The drawer opens on load
   only when a diagnostic exists, on that tab, and otherwise stays
   collapsed to its tab strip with the counts readable; a push or a
   replacement leaves it as it stands, opening it on the diagnostics when
   the new model carries one; its height is a remembered splitter; every
   row in
   every tab selects on the canvas and navigates as a tree click does, a
   release that leaves a text selection inside an analysis row excepted;
   each tab is a self-contained component for stage 3's panels and stage
   4's dock.
   *Amended 2026-11-11 (increment 8's look pass, 1.1 and 1.7): the root
   inputs carried a pinned mark, dropped because a root input's `pinned` is
   false in version 1 of the format, the wire pass having stripped the
   marker, with the question of seedability handed to `pending.md`; and the
   execution order was `outputs.order` numbered in one list, each row with
   both stages' ports, which gave a primitive with stage 1 outputs alone a
   position that orders nothing. Amended 2026-11-12 (increment 8's second
   look, 1.8): a drag selecting a row's text also selected the row's
   target. Amended 2026-11-17 (the user's ruling on `pending.md`'s open
   items): the drawer on a push or a replacement was unstated. Amended
   2026-11-20 (`deployment_overlay.md` answers 3, 9, 11 and 14): the
   timing tab listed anchors with index, `T` and `tau`, and scopes and
   components with their triples, and waited for the overlay's schedule
   rows as a table of their own; the root inputs had no pinned mark,
   their `pinned` being false in every file. Amended 2026-11-23
   (`deployment_overlay.md` answers 4 and 9, the record at the new pin,
   the user away): the diagnostics tab listed the warnings of a
   deployment's build and not the deployment's own, and the timing tab
   gave the pool's alternatives and the prime attribution no place.
   Amended 2026-11-24 (`deployment_overlay.md` answer 9, increment 10's
   look): the equations were the tables' caption, and each pool entry's
   factor stood in the anchors table. Amended 2026-11-24
   (`deployment_overlay.md` answer 3, the pin bump to the core's `fcd3660`,
   the user away): the timing columns read `k`, `m`, `c`, `D` and `Φ`, and
   an anchor's `Δtₖ`, `τₖ`, `Dₖ` and `Φₖ`.*
   *Why:* the tables are a second navigator, not a listing, and a quarter
   of the canvas's height is too much to spend on tables most sessions
   never open. *Rejected:* one mixed log instead of tabs; the drawer open
   by default.

7. **The analysis views: three controls, global order badges.** At the
   right end of the breadcrumb row a segmented switch for the color mode,
   a toggle for the type labels and a toggle for the execution-order
   badges, nothing else; the fit button and the legend stay in the canvas
   corner, and the port-class glyphs are not a toggle. The settings persist
   per browser and survive a push. With the badges on, every primitive block
   with a stage 2 output carries its position among the stage 2 calls, in
   `outputs.order`'s order, on its bottom edge at the left, numbered over
   the whole model, and a closed assembly the range or ranges of those
   positions beneath it, "3–5, 8"; a primitive with stage 1 outputs alone
   carries none; the badges use the text color, and the overlay's pills on
   that edge draw over a badge they meet. A
   deployment descriptor turns the legend's lines to the base grid's
   pair, in its order, and adds the hyperperiod chart to the drawer's
   timing tab: a
   row per distinct `(D₀, Φ₀)` with the swatch of every triple on it and a
   mark per tick, the timeline whole or omitted, and the frame tops over
   the joint period (`deployment_overlay.md` answers 11 and 13).
   *Amended 2026-11-11 (increment 8's look pass, 1.7): every primitive
   carried its position in `outputs.order`, stage 1 primitives among them,
   though the core runs stage 1 in any order. Amended 2026-11-12 (increment
   8's second look, 2.3 and 2.4): the badge sat in the top-left corner, and
   the rate pill on the bottom edge was left out where it met the overlay's
   pills. Amended 2026-11-20 (`deployment_overlay.md` answers 11 and 13):
   the legend was to gain the concrete `Δt` and `(D, Φ)` on every line,
   and the chart was a timeline over one hyperperiod with a row per
   triple, both waiting on a bump of the format.
   Amended 2026-11-24 (`deployment_overlay.md` answer 3, the pin bump to
   the core's `fcd3660`, the user away): the pair was written `(D, Φ)`. Amended 2026-11-25
   (`deployment_overlay.md` answer 13, the keyboard session): a
   deployment made the `Δt` of the legend's `A₀` lines concrete and
   changed nothing else of a line.*
   *Why:* the order is global and the badge's question, whether this block
   runs before that one, crosses levels. *Rejected:* badges numbered per
   level; a toolbar carrying every toggle the page has.

8. **Face routes: the value's whole path, started on purpose.** A face's
   route runs upstream to its one terminal producer, a primitive output or a
   root input pin, and downstream through every fan-out to every terminal
   consumer, a primitive input or a root output pin, crossing boundary
   faces: a tree with one root, what `face_routes` derives in the core and
   the client derives from the same wires. It starts only by the detail
   pane's trace button, a "trace" entry on the right-click menu of a pin, a
   port square or a wire, or `t` with one selected, a wire's route being its
   producer face's; one route at a time. It draws as `visual_grammar.md`'s
   answer 9 says, and in addition a pin the route leaves the level through
   gets the badge, a click on it going to the parent with the route lit,
   and the status bar names the route, "tracing `aircraft/δe`: 3 consumers
   across 2 levels", with a clear control. It survives navigation and a
   push whose descriptor still has its origin and still resolves it,
   recomputed; a push that drops the origin or no longer resolves it clears
   the route, the status bar saying so. It clears on Escape, on the trace
   action repeated or on another route; selecting something else leaves it
   standing. A face with no producer has no route: the pane shows no trace
   button, and `t` or the menu's trace entry says in the status bar that
   there is nothing to trace. This amends `initial_design.md`'s answer 9,
   whose "selecting a root face highlights its chain" becomes an explicit
   trigger.
   *Amended 2026-11-17 (the polish batch): a push that kept the origin but
   no longer resolved it left the route standing undrawn, and `t` on a face
   with no producer said nothing.*
   *Why:* a route dims the level, which must not fire on every click near
   its edge; the route belongs to the value, not to the end clicked.
   *Rejected:* tracing on selection; half routes by the face's side.

9. **View state: three lifetimes, keyed by path and name, never by
   index.** Per browser, in local storage: the splitters and collapsed
   panes, the color mode, the two toggles, the drawer's height. Per tab for
   the session, in memory: the open level in the URL hash, each visited
   level's zoom and pan, the tree's expansion, the selection, the standing
   route, the search query, the drawer's open state and tab, which of the
   detail pane's sections are open, one state for every node, and each
   level's block positions, the layout's output plus drags. Per push,
   everything in the second group is rekeyed against the new descriptor
   and what has no key is dropped, the open level's fallback noted in the
   status bar. The keys: a level and a node by path; a wire by its level's
   path and consumer endpoint; a pin by level path, side and face name; a
   port by node path, side and face name; a route by its origin's key;
   positions by level and block, a node by path and a pin by side and face
   name. On a relayout after a push ELK runs with the declaration-order
   steering and no position hints, and a dragged block or pin keeps its
   dragged place: ELK honors hints only with the model-order steering off,
   and then moves blocks nobody dragged (probed 2026-10-30, increment 5's
   reading 1). A drag lasts until it is undone or the page reloads: `x`
   puts the last dragged block or pin of the open level back in its
   computed place, the one dragged before it on the next press, and `X`,
   or the button beside Fit that shows while the level holds a drag, puts
   back every one. The undo is the push's relayout with a shorter list of
   dragged ids, and the view stays. A surviving level keeps its view only
   when its set of blocks is unchanged, and fits otherwise, so a different
   model pushed over another is never drawn through the old one's view. A
   push of a different model otherwise follows the same rules, since the
   session cannot tell a rebuild from a same-shaped model. A second tab is
   a second session: `inspect(world; name = "variant")` pushes to the tab
   bound to that name, opening one if none is, the unnamed call to the
   default tab; axis 6 owns the API.
   *Amended 2026-11-01 (increment 5's look pass): a push sent the previous
   positions to ELK as hints, positions were keyed by level and node path,
   and the rule keeping a level's view only for an unchanged set of blocks
   joined. Amended 2026-11-12 (increment 8b, the user's ruling, with the
   rejected undo per gesture in `roadmap.md`'s entry): only a reload undid
   a drag. Amended 2026-11-24 (increment 10's look, 8.1): the pane's two
   sections that collapsed kept no state. Amended 2026-11-25 (the keyboard
   session, `increments/20261125_keyboard_legend/notes_keyboard_legend.md`):
   the two keys were `u` and `U`.*
   *Why:* a renamed block is a different node to the format, so losing its
   selection is the honest outcome. *Rejected:* persisting session state
   across reloads, which resurrects a selection into a descriptor that may
   have changed with no push to rekey against; any index key, the spike's
   wire index being the motivating case.

10. **Files and the hosted copy: drop or pick, check the header, one model
    per tab.** A `.json` file opens by drop anywhere on the page or by the
    open control at the left end of the breadcrumb row; before a model is
    loaded the canvas shows a landing panel with the privacy statement, the
    open control, a drop hint and the help link. The page parses the JSON
    and reads the header: another `format_version.major` is refused naming
    both versions, a higher minor loads with unknown fields ignored and a
    status note, a missing body or a body without `structure.nodes` is
    refused naming what is missing, and so is a file from an older core,
    told by a structure without `grid` or a deployment without
    `schedule` (`deployment_overlay.md` answer 2); the schema itself is
    never validated at runtime. The label is the envelope `name`, else the file's base name
    for a dropped or picked file, else the root type's display name, one
    step more than `visual_grammar.md`'s answer 10. A second file in a tab
    replaces the model under answer 9's rules; two models are two tabs. The
    status bar names the kind; a failure descriptor opens with the drawer
    on its diagnostics and the overlay lit. The live tab offers a download
    of the current descriptor named after the model. While a model opened
    from a dropped or picked file is loaded, the page asks before it
    unloads, so a back past the first level, a reload or a closed tab does
    not lose it silently; the live tab does not ask, its channel serving
    the model again, nor does the development server. The privacy
    statement, on the landing panel and the help page: the file is read
    inside the browser and never uploaded, and the page loads nothing from
    any other site.
    *Amended 2026-11-01 (increment 5's look pass): the leave prompt joined,
    and the statement's last clause read "loads nothing from the
    network". Amended 2026-11-23 (`deployment_overlay.md` answer 2, the
    record at the new pin, the user away): a file from an older core
    loaded, the header saying 1.0 in both, and its anchors broke the
    readers.*
    *Why:* a wrong file should fail in words, and the structural check is
    the cheapest thing that does it; the hosted copy and the live session
    share one bundle, so the statement holds for both. *Rejected:* a
    recent-files list, which stores contents in the browser; a URL naming a
    local file.

11. **The help page and the keyboard: five sections, Vim's cursor on the
    diagram.** A page in the bundle at `#help`, reached from the landing
    panel, `?` and a status-bar link, shown over the frame, which stays
    mounted and inert beneath it so the close returns focus where it was.
    Its five sections:
    - reading the diagram, a lead paragraph on the level, the order in
      which text drops when zooming out and the computed layout, then a
      legend of `visual_grammar.md`'s terms that name a drawn thing, each
      with its drawing and one line;
    - timing and root inputs, the notation of `deployment_overlay.md`
      answer 3 with its equations, and answer 14's type rule;
    - the keyboard, with the search's prefixes in a table under the keys;
    - coming from Simulink, the vocabulary map as a table, Simulink's term
      first: block and primitive, subsystem and assembly, block port and
      face, signal and port, signal line and wire, the Inport and Outport
      blocks and an assembly's faces, data type and the face's type, the
      line styles and the kind marker, continuous and discrete sample
      times and the tier, sample time and the triple, the sample time
      colors and legend against rate mode and the legend, direct
      feedthrough and a stage 2 output, sorted execution order and the
      execution order, algebraic loop and a loop diagnostic, Sum or the
      logical operators and `Junction`, Mux and Demux against `Pack` and
      `Unpack`, Bus Selector and `Fields`, the highlight to source and
      destination and a face route, the model browser and the tree;
    - about, with the privacy statement, the bundle and format versions
      and the links.

    The keys, single or in pairs and outside text fields but for Cmd-O,
    Ctrl-O, Cmd-K and Ctrl-K. They fall in families, and a family means the same in every
    region. Each region has a cursor. The canvas and the tree share one,
    the selection. The detail pane and the drawer each have their own, the
    browser's focus on a stop. A stop is a control the cursor can rest on:
    in the detail pane the header's buttons, each section's heading and,
    in an open section, its rows that act when pressed with their links,
    and a docstring's links, so a parameter's row and a timing row are
    none; in the drawer the current tab's rows and the further controls
    on a row, a chart row's swatches among them.

    | key | action |
    |---|---|
    | `q` `w` `e` `s` | focus the tree, the canvas, the detail pane, the drawer, a collapsed pane expanding and a closed drawer opening first |
    | `Q` `E` `S` | collapse or expand the tree, the detail pane, the drawer |
    | Tab | move focus between the tree, the canvas, the detail pane and the drawer |
    | `h` `j` `k` `l` | the cursor: on the canvas or with nothing focused, the nearest block, pin or root input in that direction, the view following; in the tree, answer 2's row keys; in the detail pane and the drawer, the stops, as below |
    | arrows | on the canvas or with nothing focused, pan the canvas; elsewhere what `h j k l` do; with Shift, the same |
    | Enter | press the focused stop; with none, open the selected assembly |
    | Shift with `h`, `l` | back, forward between the levels opened since the page loaded; nothing before the first or past the last |
    | Shift with `j` | open the selected assembly |
    | Shift with `k`, Backspace or Alt-Up | go to the parent |
    | `z`, then `h` `j` `k` `l` | the view: pan the canvas, or scroll the focused pane, the cursor staying |
    | `zz` | bring the cursor to the middle of its region: the selected block at the current zoom, the selected row, the focused stop |
    | `d`, `u` | half the region's height down, up: a pane scrolls, the canvas pans |
    | `0`, `+` or `zi`, `-` or `zo` | fit, zoom in, zoom out, the canvas's from every region |
    | `gg`, `G` | the region's first, last stop; in the tree the first, last visible row; nothing on the canvas |
    | `gt`, `gT` | the drawer's next, previous tab from any region, the focus staying; a closed drawer opens on its current tab |
    | `/`, Cmd-K | focus search; `/` with the drawer focused on a tab that shows a filter, that filter |
    | `n` `N` | the next, the previous search hit |
    | `t` | trace the selected face or wire |
    | `c` `y` `o` | the color mode, type labels, order badges |
    | `?` | the help page |
    | Cmd-O, Ctrl-O | open a file |
    | `x`, `X` | put the last dragged block or pin of the open level back in its computed place, every one (answer 9) |
    | Escape | close the right-click menu, else cancel a pending `z` or `g`, else clear the route, then the focused diagnostic, then the legend's focus, then the search, then the selection |

    The detail pane's stops form an outline, as the tree's rows do. `j`
    and `k` walk every visible stop, a row's links apart. `l` opens a
    closed heading, steps from an open one to its first row, and from a
    row along its links. `h` steps back along the links to the row, from a
    row to its heading, and collapses an open heading. In the drawer `j`
    and `k` walk the rows, and `h` and `l` the controls on one. With no
    stop focused, `j` and `k` take the first. A click on a stop puts the
    cursor there, the page setting the focus itself. Enter presses the
    focused stop as a click does. The right-click menu's entry takes the
    focus when the menu opens, and Escape gives it back.

    `z` and `g` are prefixes. The status bar shows one while it waits for
    its second key, a key it does not know is dropped, and there is no
    timeout and no count. While `z` stays held, every `h`, `j`, `k`, `l`,
    `i` and `o` acts under it; a held `z`'s own repeats do nothing, and the
    window losing the focus, an Alt key or a key with Cmd or Ctrl ends the
    hold. On the help page `j`, `k`, `d`, `u`, `gg`
    and `G` scroll, beside `?` and Escape.

    Focus shows as a ring in the halo's hue. The tree, the detail pane and
    the drawer show it on the pane's box whenever they hold the focus, the
    mouse's or the keyboard's, since `h j k l` and the arrows change meaning
    there; the canvas shows it for the keyboard only, its keys meaning what
    they mean with nothing focused. A click leaves the canvas without it,
    and the first key after the click turns it on, the keyboard then
    driving the canvas. A focused stop shows the ring on itself too, the
    mouse's or the keyboard's. A stop keeps the cursor when the pane shows
    another node or the open level, while the new pane has it; else the
    cursor falls to the pane. Every control is a real button or link;
    a push keeps focus in the region that held it. Cmd-O and Ctrl-O take
    the browser's own binding on purpose and wherever the page shows, in
    the search field, on the landing panel and under the help page, where
    the model loads beneath as a drop's does: the browser's would open the
    file in place of the page. Cmd-K and Ctrl-K reach the model's search
    from a text field too. Every other key with Ctrl or Cmd stays the
    browser's.
    Dragging has no keyboard form in stage 1. The keyboard section says
    that Vimium owns many of these keys by default and that the user
    excludes the inspector's origins, `localhost` on the server's port and
    the hosted address, or uses its insert mode; the live session printing
    the pattern once is axis 6's.
    *Amended 2026-11-01 (increment 5's look pass): Shift with `h j k l`
    panned like the arrows, Enter and Backspace or Alt-Up alone opened and
    went up, Shift with `h` and `l`, `z`, `n`, `N` and the tree's own keys
    did not exist, and focus had neither its keyboard-only ring nor its
    rule across a push. Amended 2026-11-02 (increment 6's look pass):
    Escape's chain gained the legend's focus. Amended 2026-11-03
    (increment 7, `roadmap.md`'s landed note): it gained the focused
    diagnostic. Amended 2026-11-11 (increment 8's look pass, 4.2, 4.5,
    4.6 and 4.10): the page had five sections and replaced the frame; the
    legend listed every term, drawn or not; the vocabulary map was thirteen
    pairs, several of them wrong, `Group` against virtual subsystem, rate
    scope against sample time and kind marker against data type among
    them; and a section stated the refusals and what is not here yet,
    which the README now states. Amended 2026-11-12 (increment 8b, the
    user's rulings of increment 8's look pass, 4.7 and the additional
    comment, and of 2026-11-12): `h j k l` jumped on the canvas and the
    arrows panned it whatever held the focus, the tree's `h j k l` apart;
    `m`, `i`, Cmd-O, Ctrl-O, `u` and `U` did not exist; and the ring showed
    for the keyboard only in every region. Amended 2026-11-15 (increment
    8b's look, 1.8 and 2.2): Shift with an arrow was unruled, and the
    canvas's ring after a click and a key was unstated. Amended 2026-11-17
    (the user's ruling on `pending.md`'s open items): Shift with `l` had no
    bound, where the page stops it at the deepest level the load opened.
    Amended 2026-11-24 (increment 10's look, 7.1): the page had no section
    on timing and root inputs, and the Simulink one stood before the
    keyboard's. Amended 2026-11-25 (the keyboard session,
    `increments/20261125_keyboard_legend/notes_keyboard_legend.md`):
    `h j k l` and the arrows scrolled the detail pane and the drawer,
    which had no cursor, and Enter opened the selected assembly whatever
    held the focus; `z` alone centred the selection on the canvas from
    every region; `d` toggled the drawer, `m` and `i` the side panes and
    `r` the color mode, and `u` and `U` put drags back; Tab alone moved
    between the regions; the view had no keys but the arrows, `0`, `+`
    and `-`; `/` went to the model's search from the drawer too; the
    menu's entry took no focus; and the help page listed no search
    prefixes and scrolled by `j` and `k` alone. Amended 2026-11-25 (that
    increment's probes, the notes' rulings 24 to 28): every row of an open
    section was a stop, a stop's ring was unstated, the open level's pane
    and a block's shared no cursor, and the end of a held `z` was
    unstated. Amended 2026-11-25 (the cold review's F8, the coordinator
    with the user away): an Alt key did not end a hold. Amended 2026-11-26
    (the user's review of that increment): `r` and `R` took the drawer,
    Cmd-K and Ctrl-K did nothing in a text field, and Escape's chain did
    not name the menu.*
    *Why:* the selection is the diagram's cursor, so `h j k l` move it and
    the view follows, as in Vim, with panning the secondary action; the
    arrows keep the view on familiar keys for everyone else. *Rejected:* a
    guided tour, a second help page that interrupts; modifier-heavy
    shortcuts, which collide with the browser's and with Vim-style
    extensions.

## Design axes

This session closed axis 5; what it handed on has landed or stands in
`roadmap.md`'s staging.

## Glossary

Terms are defined in `glossary.md`.
