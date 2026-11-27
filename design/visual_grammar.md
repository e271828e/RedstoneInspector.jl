# The visual grammar: axis 3 of the inspector's stage 1

The record of one session, on 2026-10-27, that fixed how each model
concept is drawn, over
the real schema of `src/descriptor.json`, after axis 4's spike chose the
canvas (`design/prototypes/render_spike/report.md`). It builds on
`initial_design.md`'s answers 6, 9 and 15 and on `descriptor_design.md`,
and never restates them; where it amends one, it says so. Like its parents
it is not normative. A schema change it asks for lands as a minor bump,
docs commit first (D-433), and the client follows; the two it asked for,
the node `alias` and the envelope `name`, joined version one with no
bump, the package being unreleased.
*Amended 2026-10-27 (`alias` and `name` landed, `86ff8cc`): the two were
to land as a minor bump.*

The scope is the core tier's drawing and the overlay of answer 6: blocks,
ports, a level's boundary, wires, containers, color, library icons, the
diagnostics overlay, highlight states and text. Interaction is axis 5's;
layout tuning is axis 4's.

## Pending questions

Open items live in `pending.md`.

## Answered questions

1. **The block: the spike's frame, kept.** A rounded rectangle with two
   text lines: the node's segment in bold, then the display name, the
   last segment of the node's `alias` (question 7) when it carries one and
   of its type otherwise. Fill encodes tier, continuous and discrete in
   two colors, a closed assembly in a neutral gray with a double border,
   the cue that it opens. The timing
   triple is not printed; it drives the rate colors of question 6. The
   signature and the parameters never appear on the block. Where an icon
   applies it replaces the second line, never the frame, so the name and
   the ports sit in one place for every block. A primitive root draws as
   one block standing alone with its faces as the level's boundary around
   it, so the grammar has no special case and only the client's level
   builder does.
   *Amended 2026-10-27 (`alias` landed, `86ff8cc`): the display name was
   the type's last segment until the alias bump of question 7.*
   *Why:* the spike's picture already tells continuous from discrete with
   no legend, and gray alone reads as inert, hence the border. Keeping the
   frame under an icon keeps a library component's block and a user
   component's block aligned on the same ports.

2. **Faces as ports: squares on the edge, names inside.** Inputs on the
   west and outputs on the east in declaration order, each a small square
   with the face name inside the block beside it. A stage 1 output, joined
   from `outputs` by path, draws as an open square against the filled square
   of a stage 2 output, on by default and not a toggle. A pinned face adds a
   small mark beside its name, off the port. An unconnected face draws at
   full strength. Type and kind are not drawn on the port; they reach the
   user through the wire styles of question 4, the type-label toggle and the
   detail pane. A failure descriptor has no `outputs` section, so every
   output there is the filled square. A bare contract (D-437) is one port
   with the default face `u` or `y`, which the descriptor spells in `name`
   and in a wire endpoint's `port` as any other, format unchanged; it
   draws as any port, its square with the label `u` or `y` beside it, and
   the hover title and the detail pane spell `path/u` or `path/y`, as the
   core's renderers do.
   *Amended 2026-10-30 (D-437, superseding D-436): the bare port joined
   the answer, nothing else in the grammar changing.*
   *Why:* which output is state-derived is the one fact that explains why a
   feedback loop is legal, and the glyph costs no space. An unconnected
   input is refused by the build and an unconnected output is ordinary, so
   nothing needs dimming. *Rejected:* names outside the block beside the
   port, Simulink's way, which loses the self-contained block that ELK
   sizes from its own text.

3. **The level's boundary: pins, root inputs as tags.** Each boundary face
   of the opened level is a pin, a node carrying the face name with one
   port: input pins in the first layer with an output port on the east,
   output pins in the last layer with an input port on the west, stacked in
   declaration order as the tie-break. An inner level's pins and every
   output pin are outlined capsules with no fill. A root input pin is a tag,
   a capsule whose inner end is pointed into the model, filled with the
   external color at a light tint. Its outer end is a reserved slot, empty
   in stage 1: stage 2 puts the claim badge there, a device glyph with the
   device's name on hover, the inspector's own mark for its widget, nothing
   for an unclaimed input, and stage 3 hangs its input widget off the same
   end. A fan-out is several wires leaving the pin's one port; a group
   forwarding a face set whole is plain wires from pin to child. Selecting
   a pin shows the face in the detail pane, typed from `root_inputs` at the
   root and from the client's resolution (answer 18) inside.
   *Why:* a root input is the write surface, the one producer the build
   never sees (§11.3), and in stage 3 it is where live values are typed, so
   it earns a cue that survives zoom and weak color vision; shape and fill
   do, a thicker accent stroke does not. A root output is read by whoever
   binds to it and the diagram has nothing to say about readers. The
   binding state is a per-run fact fixed at `attach!`, which no descriptor
   can carry, so the slot is reserved and the data comes over the bridge.
   *Rejected:* drawing the opened assembly as one large frame with its
   ports on the frame's edge, which fights pan and zoom and a tall level and
   puts the faces on an edge ELK cannot place them along.

4. **Wires: gray right angles, kind by line, the client resolves.** A
   wire is a right-angle polyline in neutral gray with one arrowhead at the
   consumer end. Color stays free for the overlay and the highlight; the
   kind marker is drawn as line weight and pattern:

   | kinds | line |
   |---|---|
   | `integer`, `float`, `number` | thin solid |
   | `boolean`, `enum`, `symbol` | thin dashed |
   | `vector`, any shape | thick solid |
   | `struct` | double line |
   | `opaque` | thin dotted, gray |

   A vector of structs is thick: the outer kind wins. At a primitive
   endpoint the kind is on the face; at an assembly endpoint, a closed
   child's face or the level's own pin, the client's resolution of answer 18
   supplies it, and `AssemblyFace` gains no `type` or `kind`. A fan-out
   draws as one trunk that branches, a filled dot at each branch; the
   mechanism, ELK's edge merging, is axis 4's. A feedback wire gets no
   special style, since the port glyph of answer 2 shows where the loop is
   legal. The type-label toggle, off by default, writes the type once per
   producer port with its module qualifiers dropped, `SVector{5, Float64}`
   for `StaticArraysCore.SVector{5, Float64}`, uncut, at the port's own wire
   start, just below the wire, the full string in the hover title and the
   detail pane. The label is an ELK edge label placed at the tail and
   present in every layout, overlay on or off, so the layout reserves its
   room and no block moves with the toggle, at the cost of wider layer
   gaps; the kind marker is never written out. A wire's key is its
   consumer endpoint, unique within a level because a consumer port has
   one producer and a fan-out is one wire per target; the selection and
   the keyed loops use it across pushes.
   *Amended 2026-11-01 (`workspace.md` answer 9): ELK's position hints were
   among the key's users. Amended 2026-11-02 (increment 6's look pass): the
   label was the full type string cut with an ellipsis at a fixed width.
   Amended 2026-11-03 (increment 6's type-label probe): the label sat on
   the longest horizontal segment among the port's wires, cut to that
   segment's length and drawn above the blocks. Amended 2026-11-12
   (increment 8's second look, 4.3): the struct's line was a triple line,
   Simulink's bus, which the canvas never drew.*
   *Why:* the dashed discrete-valued kinds tell the mode, the flags and the
   stop requests from the data path at a glance, which is what the closed
   loop needs. Answer 18 already commits the client to resolve every face
   once on load and names the assembly face's marker as the first thing
   that serves; the fields would be the redundancy it rejected, and the
   resolution always ends at a primitive face because the build refuses an
   assembly input that reaches none. Whether the rate-color mode tints
   wires is question 6's.

5. **Containers: a region for a keyed one, nothing for a transparent one.**
   A keyed container's elements draw inside a region, a thin dashed rounded
   rectangle captioned with the field name in its upper-left corner, each
   block inside labelled by its key alone, so caption and label together
   read as the segment `field/key`. The region holds even one element; an
   empty container draws nothing; ELK's compound node is axis 4's
   mechanism. A name-transparent container draws no region, its elements
   plain blocks labelled by bare key, and the membership shows in the
   detail pane from `field` and `key`. The tree of axis 5 agrees: a keyed
   container is a folder named by its field, a transparent one is flattened.
   *Why:* the elements are contiguous in walk order, so the region never
   fights the layout, and transparency is the author's statement that the
   field name is not part of the naming; in the common case, a `Group`, a
   region would frame the whole level, which answer 3 rejected. *Rejected:*
   regions for both kinds; `field/key` labels with no region, which repeat
   the field on every block. *Coupling:* the `sample_times` sugar of §8.7
   keys one rate for all of a container's elements, so a container region
   and a rate scope often coincide, an argument for rates by color in
   question 6.

6. **Color: tier mode by default, rate mode by clock, no regions.** Tier
   mode is the spike's: one color for continuous primitives, one for
   discrete, neutral gray for a closed assembly, wires gray. Rate mode, a
   toggle, keys a discrete primitive's color on its full timing triple, the
   compiled clock against the nearest anchor: same triple, same tick
   instants under every deployment; the authored chain of `Relative` entries
   colors nothing, the detail pane's frames table showing the pair the
   author wrote, and where an anchored clock lands on the base grid is the
   deployment overlay's fact, not the build's. Continuous primitives keep
   the continuous color. The palette is categorical, at most eight steps,
   constructed rather than searched: eight hues evenly spread round the
   OKLCh hue circle at one chroma, the fills alternating two lightness bands
   by step and light enough for the text at AA contrast, each stroke its
   fill's hue darkened, step 0 a warm peach opposite the continuous blue,
   a place in the palette and no clock's own color.
   The steps are distinct under normal vision and never identical under
   simulated weak color vision, the legend focus telling any two apart.
   The fills, which also color the wires, keep their distance from the
   error, warning and highlight colors and the wire gray under every
   vision, and the strokes, borders only, follow their fills. Colors are
   assigned fastest first with anchor 0 first. A model with more triples
   than colors gets a text badge on the extra blocks, its number in the
   model's order; the first four extras take colors distinct under normal
   vision only, the number telling them apart for every reader, and the
   rest a shared neutral. A closed assembly takes the one triple its
   discrete primitives share, the assembly gray when they tick on several,
   and the continuous color with none; whenever a discrete primitive lies
   beneath it, it wears a clock-count badge on its top edge at the left,
   where an extra's number also sits, "1 clock" on a colored one, the count
   on a gray one. Its `scopes` row colors nothing: an
   assembly ticks on nothing, the row is the frame its `Relative` children
   compose against, and the detail pane lists it. Wires take their
   terminal producer's fill, a continuous producer's wires a blue of their
   own since the continuous fill is too pale for a line, and a root input
   pin leaves its wires neutral, so a rate transition shows as a color
   change at a block's input and a wire names the block it leaves. A
   legend in a canvas corner lists first a line for the continuous color
   when a continuous primitive, an assembly with no discrete primitive or a
   continuous producer's wire is visible, then every triple visible on the
   open level, on a block or a wire, each a short line, a build's its
   `Δt`, `τ` and anchor and a deployment's its `D₀`, `Φ₀`, `Δt` and
   anchor, the rest in the line's tooltip; the fit leaves the legend's
   box free, and a legend taller than the viewport scrolls
   (`deployment_overlay.md` answers 3 and 13). A
   click on a legend line focuses its triple, the continuous line
   its color: the blocks on it, the closed assemblies with a primitive of it
   beneath and the wires it tints are lit, the rest dimmed as for a
   search, and the tree marks its rows with counts up collapsed ones. A
   second click, Escape or leaving rate mode clears the focus; it holds
   across levels and across a push that keeps the triple, and while a
   query also stands the canvas shows the legend's focus and the tree the
   search's markers.
   *Amended 2026-11-02 (increment 6's look pass): every extra took the
   shared neutral and its badge's number was unstated; the legend listed
   closed assemblies' triples but no wire's and no continuous line, and
   none of its lines could be focused; the whole palette kept off red and
   the halo hue. Amended the same day (the pass's second round): the
   palette was searched for eight steps distinct under weak color vision;
   a closed assembly took its scope triple's color, with a multi-rate
   badge when its primitives ticked otherwise; wires took their producer's
   color at a lighter tint; the continuous line came last in the legend;
   and the strokes, not the fills, kept off the reserved hues. Amended
   2026-11-12 (increment 8's second look, 2.3): the badge's place was "one
   corner", built at the top edge's right and moved to the bottom edge's
   left by the first look. Amended 2026-11-20 (`deployment_overlay.md`
   answers 3, 10 and 13): the authored chain was shown nowhere; a legend
   line read "anchor 1 (1/10 s) × 2, phase 1" and was to gain the concrete
   `Δt` and `(D, Φ)`; the legend could sit over the drawing; and the peach
   was taken for the base grid's color. Amended 2026-11-24
   (`deployment_overlay.md` answer 3, the pin bump to the core's
   `fcd3660`, the user away): a line read `m` and `c`, and its tooltip `D`
   and `Φ`. Amended 2026-11-25 (`deployment_overlay.md` answer 13, the
   keyboard session): a line read `A₁ (noise) · Dₐ 2 · Φₐ 1` and its `Δt`
   on a build and a deployment alike, with `D₀`, `Φ₀` and `τ` in its
   tooltip, and a tall legend did not scroll.*
   *Why:* two blocks under different anchors are two clocks by design, and
   a color keyed on the deployment's `(D, Φ)` would merge or split them per
   deployment. An assembly ticks on nothing, so its scope row is a frame,
   not a clock; coloring a closed box by its frame put two facts in one channel and left
   the badge to patch the gap. A color now means one thing on every block,
   every discrete tick beneath is on that triple, gray with a count means
   several, and the count on every closed box tells a colored one from a
   primitive. Eight light fills distinct under weak color vision do not
   exist, the capacity search showed, so the bar is normal vision with the
   legend focus as the guarantee, and nameable hues of even weight beat a
   palette that clears a threshold everywhere and reads nowhere. *Rejected:*
   rate scopes as regions, since a scope is declared for one child key and
   its region would be that child's own block, and the container case
   already has answer 5's region; keying color on the period alone with the
   phase as a mark, since phased blocks never share an instant.

7. **Library icons: keyed on the alias, then the type.** A monochrome
   glyph or short math text in the text color, at the second line's height
   and a fixed width, replacing the display name, which moves to the hover
   title and the detail pane; the ports and the sizing rule are untouched.
   The key is the node's `alias` when present and its `type` otherwise, so
   the four `const` aliases of `Junction` draw apart. The `alias` is an
   optional node field, in version one, holding the qualified name of the
   most specific `const` type binding in the type's own parent module that
   the instance's type is a subtype of, other than the base type; a
   `Junction` over a user function and an alias defined elsewhere carry
   none. The roster:

   | component | icon |
   |---|---|
   | `SumJunction`; `Or`, `And` | circle with Σ; circle with ∨, with ∧ |
   | `Fn` | f(u) |
   | `Pack`, `Unpack` | n lines merging into one, and its mirror |
   | `Fields` | `Unpack`'s fan with a double line in, a struct wire's line |
   | `Integrator`, `LimitedIntegrator` | 1/s, and between two limit bars |
   | `LimitedDoubleIntegrator` | 1/s² between two limit bars |
   | `DiscreteIntegrator`, `DiscreteLimitedIntegrator` | the same pair over a staircase |
   | `UnitDelay`, `Delay` | z⁻¹, z⁻ᴷ (`K` is a type parameter; the signature gives it) |
   | `FirstOrderLag` | 1/(τs+1) |
   | `StateSpace` family, `TransferFunction` family | ẋ=Ax+Bu; N(s)/D(s) or N(z)/D(z) |
   | `Constant` | its `value` summary cut short; a frame glyph when the output's kind is `opaque` (D-344, D-364) |
   | `Step`, `Sequence` | a step line; a staircase up and down |
   | `Source`, `GaussianWhiteNoise` | f(t), a noise squiggle |
   | `Switch`, `Select` | a lever pivoting on the right over two contacts on the left; over three |
   | `Relay`, `Backlash`, `RateLimiter` | the hysteresis loop, the backlash parallelogram, the slope line |
   | `Comparator` | u≥c |
   | `Freeze`; `StopRequest` | a struck-through gradient; an octagon |
   | `PID`, `DiscretePID`; `LQRTracker`, `DiscreteLQRTracker` | PID; LQR |
   | `Group` | none, a closed assembly |

   A user type gets no icon and shows its type's last segment; author
   icons stay refused (answer 15). The icon never changes with tier or
   rate, which are the fill's.
   *Amended 2026-10-27 (`alias` landed, `86ff8cc`): the answer asked for
   the field as the alias bump. Amended 2026-11-16 (the pin to the core's
   `6afd6fb` and the icons' look pass): the roster gained `Backlash`, `Comparator`, `Fields`, `Fn`,
   `LimitedDoubleIntegrator`, `Select` and `Sequence`, and `Switch`'s lever
   turned to face its inputs, as `Select`'s does.*
   *Why:* six of the closed loop's blocks read "Junction" with only the
   signature's `typeof(+)` to tell them apart, the parsing the format
   exists to avoid. *Rejected:* a `display_name` trait on the library
   types, a drawing concern made core API when the alias search reaches
   the same result from facts the core has.

8. **The diagnostics overlay: one error hue, drawn where the attribution
   points, loops as chains.** A diagnostic naming a node puts a halo and a
   corner badge on the block, one naming a port marks the port square, one
   naming a consumer endpoint draws that wire heavier in the error hue on
   top; the badge opens the text and the drawer lists every diagnostic with
   the type's source location. The badge sits on the bottom edge at the
   right. A text too long for the block is cut with an ellipsis, so the
   badge ends at the block's left inset, or short of the order badge while
   those show. The badge's hover title opens with its whole text, the
   message's first line on the next line. A probe failure is the node case, the badge
   carrying the function name from the probe chain. An `AlgebraicCycle`
   halos its members; its wires are terminal pairs, which the client maps
   onto the chain of declared wires between the two primitives by answer
   18's resolution in reverse, drawn on every level the chain touches. A
   badge stands beside each port where the chain crosses a closed child's
   edge, chosen as answer 9 chooses a route's: each input port by which it
   enters a closed child, and each output port by which it leaves a closed
   child it enters by none. Off the root one stands beside a pin where the
   chain leaves the level. Each is placed as answer 9 places a route's
   badge. A child's badge opens it, a pin's
   climbs to the parent with the chain lit, and each such level takes a
   red dot in the tree. The verdict is text, not a second color. A
   dead hop is a dashed chord across its member from the input square to the
   output square with a cross at its middle, shown under either verdict. No
   dimming by default; a dimmed state exists for axis 5's focus. Warnings
   take a second reserved hue, amber, same mechanics, once a descriptor
   carries them. The rate palette's fills, the wires' colors too, keep
   their distance from red, amber and the highlight hue (answer 6).
   A structure-step failure has no diagram, only the list (answer 6).
   *Amended 2026-11-02 (increment 6's look pass, both rounds): the whole
   palette kept off the reserved hues, then its strokes alone. Amended
   2026-11-17 (the polish batch): a pin the chain leaves through took no
   badge, the reader climbing by the breadcrumb. Amended 2026-11-27 (the
   look pass, 1.4, 2.1 and 6.1): the badges stacked from the bottom edge's
   right end, the chain's after the diagnostic's, and a pin's straddled
   its top edge from its outer end; a long diagnostic badge ran past the
   block's left corner, and its title was the message's first line
   alone. The look pass's first wording put the chain's badge only at a
   port where the chain crossed into a child (its cold review, F5).*
   *Why:* the two questions a loop raises, where it closes and which hop is
   false, become things seen rather than reconstructed from slash paths:
   the chord names the member whose contract to question and the wire into
   its input is the one the ladder's first rung re-examines, or the cut the
   second rung makes (§5.4, D-140); a loop across levels is where the text
   is hardest to follow. Both verdicts are refused builds, so a color per
   verdict would spend the warning hue on an error. *Rejected:* straight
   overlay lines between the terminal primitives, which show a wire that
   does not exist and nothing on a crossed level.

9. **Highlight states: one hue, a halo for shapes, a casing for lines, dim
   beneath.** One reserved highlight hue, a blue outside the rate palette.
   Selection is one element: a block or pin shows a halo, a soft wide
   outline just outside its shape; a wire shows a casing, a wider
   translucent band under it, its two port squares marked; a port square a
   small halo of its own; a selected block's incident wires take a light
   casing. Hover is the same at half strength. A face route, from a root
   pin or any face, is the chain of answer 18's resolution drawn as the loop
   chain of answer 8 in the highlight hue: casings on the open level, the
   origin's halo, a badge at each port where the route crosses into a
   closed child or through a pin, the terminal port marked, a dot per level
   in the tree. A badge stands outside its block or pin, above the wire and
   clear of the wire's type label below it: left of each input port by
   which the route enters a closed child, right of each output port by
   which it leaves a closed child it enters by none, the one holding its
   producer, and, off the root, past the point where the wire leaves an
   input pin or short of the point where it reaches an output pin. Each
   port takes one route badge; where a loop's badge stands at the same
   port, the loop's is nearer. A badge that would meet a drawn type label,
   the one under the wire of the port above, moves outward along its wire
   past it, within the half of the wire's end segment nearest its port, so
   the move never carries it onto the badge at the wire's other end or
   onto the far block. Where no place in that half clears the label, the
   badge stands unmoved. Search hits take a dashed halo, the
   selected hit the solid one. Focus on a diagnostic, a route, a legend line or a search
   dims everything uninvolved by opacity, never by color; a level on which
   the focus lights nothing does not dim, the status bar saying why.
   Composition from
   bottom to top: dim, normal, route casing, selection halo, error overlay,
   so the error hue always wins; a dragged block draws above its neighbours
   with its halo on; the keyboard focus ring is the halo.
   *Amended 2026-11-02 (increment 6's look pass): a legend line's focus
   joined the dimming foci. Amended 2026-11-17 (the polish batch): a focus
   with nothing on the open level dimmed the whole level. Amended
   2026-11-27 (the look pass, 1.4 and 2.1): a closed child entered took
   one badge at its bottom edge's right end, which read as a mark on the
   block and covered the order badge, and a pin's straddled its top edge
   from its outer end. The look pass's first wording let a badge's move
   past a label run on to another block or badge (its cold review, F1).*
   *Why:* a halo composes with a tier fill, a filled root tag and an
   outlined pin alike, which a fill or stroke change does not; a route and
   a selection differ in shape, a chain with an origin against one element,
   so a second hue would buy nothing. One mechanism draws the loop chain and
   the route.

10. **Text: one system sans, user names verbatim, three levels that drop
    in order.** One system sans-serif stack for the whole canvas, no bundled
    or web font, text icons in the same face with Unicode superscripts and
    operators. A block has three text levels: the segment in bold, the face
    names regular and smaller, the display name lighter. User-chosen names,
    the segment, the face names, a region's caption and a pin's label, are
    set verbatim in their own case and script and never truncated, the
    block sizing to them; a name holding `.` or `[` is shown as is and never
    parsed (D-418). The display name, the alias's last segment then the
    type's, is cut with an ellipsis at a fixed width, its qualified form in
    the hover title and the detail pane; a `Constant`'s value cuts shorter,
    a wire type label at answer 4's width; the signature is never on the
    canvas and parameter summaries appear as the writer cut them. Below a
    legibility floor the levels drop in order, face names first, then the
    display name with its icon, the segment last; wires and port squares
    never drop. Paths print in slash form verbatim; the root's label is the
    envelope's `name` when present, else a dropped or picked file's base
    name, else the root type's display name; the `name` field is written by
    `inspect` and `write_descriptor` and never by `descriptor`. Rationals
    print as `1/10 s`, multiples and phases as integers. Every element
    carries a hover title with its full text.
    *Amended 2026-10-27 (`workspace.md` answer 10): the file's base name
    joined between the two.*
    *Why:* layout is computed per client, so a system font costs nothing in
    sameness and removes the spike's measurement-before-fonts risk; the
    names the author wrote are the text the diagram exists to show, and a
    type name is not. *Rejected:* a monospace face, which reads as code and
    widens every block; truncating user names for uniform blocks.

11. **State events: a count on the top edge at the right.** A primitive
    that declares state events carries a pill on its top edge at the
    right, in the rate pill's shape, reading `1 event` or `4 events`. A
    closed assembly carries the count of the events its primitives
    declare beneath it. The pill shows in both color modes and is no
    toggle. It has the background fill and the text color's stroke. Its
    title lists a primitive's events in priority order, each with its
    number and whether it is localized, and on an assembly gives the count
    and the number of primitives that declare them. The pill takes no
    click of its own, so a press selects the block. Like every badge it
    never drops with the zoom. The rate pill keeps the left of the edge,
    so each pill has one place in both modes. A block that carries the
    events pill is at least as wide as its top edge's pills with their
    insets and the gap between them, whatever the mode. A failure
    descriptor carries no events and draws none. No legend line, tree
    mark or search prefix names an event: the detail pane and the
    drawer's events tab carry the rest (`workspace.md` answers 4 and 6).
    *Added 2026-11-27 (increment 10b's design session,
    `increments/inspector_10b_events/notes_inspector_10b.md`).*
    *Why:* events are rare, and they answer which blocks can cut a step,
    so the mark earns its place without a toggle, as the stage 1 square
    does. Events are continuous-only, so a primitive never carries both
    pills and only an assembly needs the two corners. The width is
    reserved in every mode because a level's layout outlives a change of
    mode. The stroke is neutral because the rate pill's stroke is its
    clock's color, and events belong to no clock. *Rejected:* a glyph
    beside the display name, which gives no count and has no place on an
    icon block; no canvas mark; a legend line, the legend being rate
    mode's and about colors; on a narrow assembly the right pill drawn
    over the left, the bottom edge's rule, which hides the clock count;
    both pills stacked from the left, where the events pill jumps on a
    change of mode; one joined pill, which puts the events inside the
    clock's stroke.

## Design axes

This session closed axis 3; what it handed on has landed or stands in
`roadmap.md`'s staging.

## Glossary

Terms are defined in `glossary.md`.
