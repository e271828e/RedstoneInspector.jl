# The deployment overlay: the eighth record of the inspector's stage 1

The record of the design session of 2026-11-19 and 2026-11-20 that fixed
increment 10: what a
descriptor carries beyond version one's build, the notation the page uses
for a discrete component's timing, the timing tab, the detail pane's
timing, the hyperperiod chart, and the core work that comes first. It
builds on `descriptor_design.md`'s answers 2 and 9, on
`visual_grammar.md`'s answer 6 and on `workspace.md`'s answers 4, 6 and 7,
and says where it amends them. Like its parents it is not normative. Its
rulings on the format and the framework land in the core's spec and log
first, and the core's `Redstone.jl/design/pending.md` orders that work in
its first bullet.

The session widened the increment twice. The roadmap asked for a
`schedule` section "and nothing else", written before the frame period
existed (D-443). The session replaced that scope with a rule, answer 1,
and the rule brought in the deployment's parameters, the events and the
grid report. The user's wish for one notation, answer 3, then reached the
core's spec, its `show` and three of its fields. The second day added
the root input's pin to `show(::Structure)` and to the format, answer 14.

## Pending questions

Open items live in `pending.md`. Two questions the session raised belong
to the core and stand in its `pending.md`: whether `Period` and `Hz`
retire, and whether the build refuses a pool that admits no deployment.

## Answered questions

1. **The rule: parity with `show`.** The descriptor carries every fact
   `show` prints of a `Build` or a `Deployment`, or the facts from which a
   client derives it exactly, and no internals. The second clause covers
   what the client already derives, the feedthrough edges and the routes,
   and now the hyperperiod and the steps per frame. One printed thing
   stays out: the build's activation list, which is the state of a cache.
   The rule replaces §13.9's sentence that version one carries "what a
   client needs to draw and explain the component tree".
   *Why:* `initial_design.md` answer 5 already titles the content "the
   artifacts' facts plus instance context", and answer 9 has the page
   "turn what `show` prints today into something to navigate", so the
   events and the deployment's parameters were left out by staging and
   never by principle. The rule has a boundary, since initial states,
   cell layouts and compiled forms stay out as before. The core's suite
   can check it. A user who has read `show(deployment)` finds the same
   facts on the page under the same names. *Rejected:* "the `Model` as a
   whole", which has no boundary, a `Model` adding a scalar type, buffers
   and state; a `schedule` section alone, the roadmap's scope.

2. **The format stays at 1.0 until the first release.** It changes freely
   until then, and version 1.0 is the format as of that release. The
   schema requires the new sections. The page's loader refuses a
   deployment body without `schedule`, in the words it uses for a body
   without nodes, telling the reader to write the file again. The page
   keeps no path for an older file, so the timing tab's sentence on a
   deployment that "carries no schedule" goes.
   *Why:* D-433's annotation, D-434 and D-437 each added to version one
   unbumped, "no reader to protect while unreleased", and a rule replaces
   the repeated exception. A minor bump only adds fields, so a 1.1 schema
   would have had to leave every new section optional. *Rejected:* the
   bump to 1.1 the roadmap named.

3. **One notation: two pairs in two units, and the symbol is the name.**
   A discrete component's timing is a period and a phase, stated in four
   frames:

   ```
   its rate scope   (K, φ)     ticks of the enclosing scope, as declared
   its anchor       (m, c)     ticks of anchor k
   the base grid    (D, Φ)     base ticks, the deployment's
   seconds          (Δt, τ)
   ```

   An anchor has the same two pairs, `(Δtₖ, τₖ)` in seconds and
   `(Dₖ, Φₖ)` in base ticks, and anchor 0 is `Δt₀ = Δt_base`, `D₀ = 1`.
   One law composes them in each unit:

   ```
   in seconds:      Δt = m · Δtₖ     τ = τₖ + c · Δtₖ     a build knows both when k ≥ 1
   in base ticks:   D  = m · Dₖ      Φ = Φₖ + c · Dₖ      the deployment's
   linked by:       Δtₖ = Dₖ · Δt_base      τₖ = Φₖ · Δt_base
   hence:           Δt  = D · Δt_base       τ  = Φ · Δt_base
   ```

   Wherever the page names one of these quantities it uses its symbol:
   the timing tab, the pane, the legend, the tooltips and the status bar.
   The words "phase", "offset" and "multiple" leave those surfaces, and
   the help page defines each symbol once. An anchor reads `Aₖ (key)`,
   the key of the `sample_times` entry that declares it, and the base
   grid reads `A₀ (base)`. The subscript is the identity, since two
   scopes can declare the same key, and the tooltip gives the declaring
   scope.

   `τ` without a subscript, a component's phase in seconds, is the page's
   coinage. `Φ·Δt_base` is the time of the component's first tick after
   `t₀`, and it lies inside the first hyperperiod since `0 ≤ Φ < D`. The
   spec has no letter for it. It gives `τ` to an `Absolute` entry's offset
   in seconds, which the coinage extends.

   The core takes the notation first, so that the page and the REPL
   agree: `Δtₖ` where the spec and `show(::Structure)` say `T`,
   `Absolute`'s first argument named `Δt` where it was `q`, the fields
   `Anchor.T` and `Absolute.T` renamed `Δt`, and the anchor's JSON key
   `T` renamed `dt`. `Period.T` keeps its name until the core rules on
   retiring `Period` and `Hz`.
   *Why:* the page printed `c` as "phase" in the legend and as "offset"
   in the pane, while the core gives "phase" to `Φ` and calls `τ` the
   anchor's offset: one quantity under two words, and each word on two
   quantities. With `Δtₖ` the equations hold for every `k` with no special
   case, and `T` stops doubling as the scalar type's letter. An
   `Absolute` entry puts its child at `(Aₖ, 1, 0)`, so `Absolute(Δt, τ)`
   declares exactly the `Δt` and `τ` the child's seconds row shows.
   *Rejected:* symbols in the tables and words elsewhere, which leaves the
   reader translating between the legend and the tab; the page renaming
   alone. *Cost accepted:* a parameter named `τ`, as `FirstOrderLag`'s,
   shows beside a timing `τ`; `c`, `m`, `K` and `D` meet the same clash,
   and the section a letter stands in tells them apart. `φ` and `Φ` look
   alike at small sizes, so the row labels must tell them apart.

4. **The deployment body: flat, in the order of the `Deployment`'s
   fields.**

   ```json
   "deployment": {
     "build":     { … },
     "dt_frame":  {"num": 1, "den": 100},
     "dt_base":   {"num": 1, "den": 100},
     "h_max":     {"num": 1, "den": 100},
     "h_min":     {"num": 1, "den": 100000},
     "algorithm": {"text": "BS3(reltol = 1.0e-6, abstol = 1.0e-9)", "proposes": true},
     "firing_budget": 4,
     "localization_tol": 1.0e-6,
     "localization_budget": 8,
     "attempt_budget": 7,
     "schedule":  { … },
     "warnings":  []
   }
   ```

   `h_max` is the resolved bound. `h_min` is present only when set. The
   algorithm is the text its `show` prints and one flag, `proposes`, which
   decides whether the steps per frame are a count or a range. `warnings`
   holds the deployment's own, encoded as the build's are, an empty array
   when there are none.
   *Why:* the two periods are the `Deployment`'s fields, where the
   `Schedule` holds neither. The frame positions the frame tops against
   the schedule, which the chart draws. The algorithm, the step bounds
   and the budgets decide how the model behaves, so the rule of answer 1
   brings them in. A tolerance inside the text never changes the format
   when a new method arrives. *Rejected:* the schedule and the base tick
   alone; the step's parameters waiting for stage 2's connect payload,
   the session's first recommendation, which the user overruled; the
   parameters grouped under two keys, since the artifact is flat and
   `show` prints one line.

5. **The `schedule` section: the rows as the artifact holds them, and
   the anchors' rows.**

   ```json
   "schedule": {
     "anchors": [{"D": 4, "phi": 0}, {"D": 20, "phi": 0}],
     "rows":    [{"path": "fast/inner", "D": 4, "phi": 0}, … ],
     "scopes":  [{"path": "fast", "key": "fast", "D": 4, "phi": 0}, … ]
   }
   ```

   `anchors` follows the order of `structure.anchors`, anchor 0 without a
   row as everywhere else. A component's row has no `anchor`, which its
   node's `timing` holds, no chain of `sample_times` links, which is a
   build fact whose home would be the node, and no float `Δt`, which the
   page computes exact as `D` times `dt_base`. The writer computes each
   anchor's `Dₖ` and `Φₖ` as `Δtₖ / Δt_base` and `τₖ / Δt_base`. In
   `structure.anchors` the key `T` becomes `dt`, which amends
   `descriptor_design.md` answer 9.
   *Why:* `descriptor_design.md` answer 2 has each section project one
   artifact, and §9.2 calls the `Schedule` the single source of truth for
   `Δt`. Binding is exact rational division, and a JavaScript number is
   exact only below `2^53`. The file's rows are also the oracle the
   frontend's checks need. The anchors' rows are what the notation shows
   as the link between `(m, c)` and `(D, Φ)`, and a client cannot solve
   them back from a component row for an anchor with no discrete
   primitive beneath it. *Rejected:* the base tick alone, the client
   resolving, which would put a second implementation of binding in the
   page; the anchors' `Dₖ` and `Φₖ` stored on the `Schedule`, against
   D-261, which keeps derived values out of an artifact.

6. **The grid report: data, in `structure`, derived from the anchors.**

   ```json
   "grid": {
     "admissible": {"num": 1, "den": 50},
     "pool":   [{"anchor": 1, "kind": "period", "factor": 5},
                {"anchor": 2, "kind": "period", "factor": 1}],
     "primes": [{"prime": 2, "power": 1, "suppliers": [1, 2]},
                {"prime": 5, "power": 2, "suppliers": [1]}]
   }
   ```

   A pool entry names its anchor by index and says whether it is the
   period or the offset. Its value, scope and key are that anchor's row.
   A prime's suppliers name pool entries by position, counted from 1 as
   every stored position in the file is.
   `alternatives` appears on an entry that has some. A model with no
   anchors has an empty pool and no `admissible`. In the core,
   `show(::Structure)` derives the report and prints it under the anchor
   table, and `Deployment` drops its `grid` field. The refusal's message,
   the derivation line and `GridUtilization` stay the deployment's and
   keep the report in their payloads. So a build's page shows the report,
   a failure past the structure step shows it, and a deployment adds one
   comparison, its `Δt_base` against the coarsest admissible one.
   *Amended 2026-11-21 (the core's D-467, commit 1537538): the example
   counted the suppliers from 0.*
   *Why:* the report is a pure function of the anchors, and it answers
   which base ticks a model admits, which a user wants before choosing
   one. With the anchor index the page puts each factor beside the value
   it belongs to. D-261 rules that what follows from an artifact's facts
   is derived where it is used, as the feedthrough line is. *Rejected:*
   the text block `show` prints, which could only sit in a block of its
   own; the report on the deployment body, where D-254 placed it in one
   bundle with the three things that do depend on the deployment; the
   field moved to the `Build`. *Cost accepted:* an unfactored cofactor
   can pass `2^53`, the display-only limit `pending.md` already records.

7. **The events: carried now, drawn in 10b.** The build body gains an
   `events` section that mirrors the `Events` artifact, and `state_events`
   joins the declarations a `types` row locates. The section holds the
   artifact's one field, `components`, one row per primitive in walk
   order, so one index addresses it and `outputs.components` alike. Here
   the one declaring row among the 19 of the core's `approach` example:

   ```json
   "events": {"components": [
     …,
     {"path": "gear",
      "events": [{"name": "touchdown", "policy": "localized"}],
      "bundle": ["m", "u", "y", "t"]}]}
   ```

   A primitive that declares no event has `"events": []` and `"bundle":
   []`. A row's events stand in declaration order, which is their priority
   order. A policy is `localized` or `non_localized`, the artifact's
   symbols as `show` prints them. Increment 10 draws none of it. Increment
   10b draws the events after a short design session of its own, and
   decides there where `firing_budget`, `localization_tol` and
   `localization_budget` show.
   *Why:* one change to the format, one spec edit, one log entry and one
   pin bump serve what answer 1 treats as one gap, and a reader ignores
   fields it does not use. How an event is drawn is a question of the
   visual grammar, a mark on a block, rows in the pane, a legend line,
   and wants its own look. The rows are the artifact's rows, as in every
   other section: `structure.anchors`, `outputs.components` and
   `schedule.rows` each hold what their artifact holds. A missing row is
   then an error a reader can detect, and the empty rows cost about 9 kB
   of `large`'s 368. The section is not a field on the node because a
   policy comes from the nominal probe, which a failure descriptor never
   has, `descriptor_design.md` answer 8's reason for the output stages.
   *Rejected:* the events in a later change to the format with their own
   increment, tidier per increment and twice the pin moves and fixture
   rounds; one row per declaring component, as `show` prints and as the
   session first proposed, the one section whose rows would follow
   `show`'s selection and not the artifact's; the `Events` type itself
   retired for a bare vector, which the session weighed and the user
   declined, the type giving `build.events` its table and its documented
   name. *Cost accepted:* the section is
   designed before its drawing, bounded by mirroring the artifact; what
   the drawing later wants, the guard and handler locations among it, is
   a further change.

8. **The hyperperiod: derived by the client.** The page computes the
   least common multiple of the rows' `D` with `BigInt` and shows it in
   base ticks and in seconds.
   *Why:* the core holds it as a `BigInt`, since coprime periods take it
   past `Int`, and a JSON number is exact in JavaScript only below
   `2^53`. The derivation is one lcm over integers the file holds, and
   `show` itself computes it from the rows and stores it nowhere.
   *Rejected:* a field on `schedule`, the format's only number in a
   string.

9. **The timing tab: the notation's home, a deployment filling the
   tables in.** At the head, for a deployment, a short list: `Δt_frame`,
   `Δt_base`, `h_max`, `h_min` when set, the algorithm, `attempt_budget`
   and the steps per frame with the rows that split frames. The three
   event parameters are not shown until 10b. The equations of answer 3
   stand above the tables as their caption, so each column head is one of
   their terms. A deployment adds columns to the tables a build has and
   no table of its own:

   ```
   build                                    deployment, Δt_base = 1/100 s
   k           Δtₖ       τₖ                 k           Δtₖ       τₖ   Dₖ   Φₖ
   A₀ (base)   Δt_base   0                  A₀ (base)   1/100 s   0    1    0
   A₁ (noise)  1/10 s    0                  A₁ (noise)  1/10 s    0    10   0
   A₂ (dss)    1/50 s    0                  A₂ (dss)    1/50 s    0    2    0

   path    k  m  c   Δt          τ          path    k  m  c   D   Φ   Δt       τ
   noise   1  1  0   1/10 s      0          noise   1  1  0   10  0   1/10 s   0
   dss     2  1  0   1/50 s      0          dss     2  1  0   2   0   1/50 s   0
   d_pid   0  2  1   2·Δt_base   Δt_base    d_pid   0  2  1   2   1   1/50 s   1/100 s
   ```

   The anchors table keeps its "declared in" column and shows each pool
   entry's factor beside the value it belongs to, with a line above it
   for the coarsest admissible base tick. The rate scopes' table takes
   the same columns as the components'. The steps per frame are derived:
   a fixed-step method takes `⌈Δt_frame / h_max⌉`, a proposing one from
   that count up to `⌊Δt_frame / h_min⌋`. This amends `workspace.md`
   answer 6.
   *Why:* the build's `2·Δt_base` and the deployment's `1/50 s` are one
   cell before and after binding, which is the relation the notation
   exists to show. The list sits beside what depends on it: `Δt_base` is
   in the caption, `Δt_frame` drives the chart's frame tops, and the
   steps per frame read against the chart. *Rejected:* a separate table
   of schedule rows; a fifth drawer tab for the deployment, one more
   thing for the keyboard and the map; a section in the root's pane,
   which changes with the open level.

10. **The pane's timing: a frames table.** A discrete primitive's rate
    fact is one small table, a row per frame of answer 3 with the same
    two columns, and no sentence:

    ```
                          period         phase
    scope  fast/outer     K  = 3         φ = 1          ticks of fast/outer
    anchor A₁ (fast)      m  = 6         c = 2          ticks of A₁
    base grid             D  = 24        Φ = 8          base ticks
    seconds               Δt = 3/25 s    τ = 1/25 s
    ```

    A build shows it without the base grid row, and a component on `A₀`
    shows `m·Δt_base` in the seconds row. The scope row is derived
    against the nearest enclosing rate scope's row, whose own pair is
    `(mₛ, cₛ)`: `K = m / mₛ` and `φ = (c − cₛ) / mₛ`. A component whose
    own entry is `Absolute` has no `(K, φ)`, and its first row reads
    "opens `A₁` at the root". The open level's pane shows a rate scope
    with the same table. This amends `workspace.md` answer 4, and
    `visual_grammar.md` answer 6, whose "the authored chain is not shown"
    now holds for color alone.
    *Why:* the seconds row holds everything the pane's sentence said, and
    the column heads give the words. The scope pair is what the author
    wrote, so it links the pane to the source, and it needs no change to
    the format. *Rejected:* the sentence kept above the table; the scope
    pair inside the sentence. *To check at the prototype:* in `rates` and
    `closed_loop` a keyed assembly has a scope row and a keyed primitive
    has none, so at most one link lies between a primitive and its
    nearest scope row; the fold's code was not read, and the oracle
    compares against the core's own rate links.

11. **The chart: one row per distinct `(D, Φ)`, whole or omitted, the
    frame tops over the joint period.** A row is everything that ticks
    together under this deployment: its `D` and `Φ`, the swatch of every
    triple that lands on it, the count of primitives, and a mark at each
    base tick where it is due. The rows run fastest first, by `D` and
    then `Φ`. Each swatch is a button with the legend's focus, and the
    row itself takes no click. For `library` at `Δt_base = 1/100 s`:

    ```
    D 1  · Φ 0    ■      9 primitives    ●●●●●●●●●●
    D 2  · Φ 0    ■ ■    2 primitives    ●·●·●·●·●·
    D 2  · Φ 1    ■      1 primitive     ·●·●·●·●·●
    D 10 · Φ 0    ■      1 primitive     ●·········
    ```

    The timeline is drawn whole or not at all. Up to a threshold it fits
    the tab's width when a tick then gets a minimum pitch, and scrolls
    sideways at that pitch otherwise. Past the threshold it is omitted,
    one line gives the length in base ticks and in seconds, and the rows
    stay. The two constants are the look pass's, starting at 1000 base
    ticks and 6 px.

    Vertical lines mark the frame tops at their exact positions, which
    can fall between base ticks. The timeline then spans the joint
    period, the least common multiple of the hyperperiod and `Δt_frame`
    taken in time, and the threshold applies to that span. The lines
    are drawn only when some base tick is not a frame top. By default
    `Δt_base` is `Δt_frame`, and the caption says that every base tick is
    a frame top. Each row says whether its ticks all land on frame tops
    or split frames, as `show` does. This amends `workspace.md` answer 7,
    which had a row per triple.
    *Why:* §9.2 has the schedule answer "what coincides with what", and
    `visual_grammar.md` answer 6 keys color on the triple because where
    an anchored clock lands is the deployment's fact, which a row per
    `(D, Φ)` shows directly. `closed_loop` is one row with ten swatches
    where a row per triple gives ten identical rows. The components table
    keeps one row per primitive, so nothing is lost. A partial timeline
    is a sample: rows with `D = 7` and `D = 11` meet again only at tick
    77. The lines show where a frame is cut and into how many spans,
    which the text cannot. *Rejected:* a row per component, as `show`
    prints; a row per triple; a window of the first ticks; a zoomable
    timeline; the frame as text alone; the lines over one hyperperiod
    when the pattern does not close there. *Cost accepted:* the frame
    tops go beyond `show`, the rule of answer 1 setting the minimum.

12. **The staging.** The core's work comes first, in four parts its
    `pending.md` orders: the notation; the grid report derived from the
    structure; the descriptor, with the writer's qualified `@ref` links
    and the schema's record path; and `show(::Deployment)` in the
    notation, which the inspector does not wait on. Increment 10 then
    moves the pin and draws the timing tab, the pane's frames table, the
    chart and the legend. Increment 10b draws the events, and runs before
    the look pass and the release: 10, 10b, the look pass, 11.
    *Why:* the timing tab is rebuilt in this increment and the format is
    free until the release, so the page is built once against the final
    shape. 10b comes before the release because its design session may
    still change the format, which is free only until then (answer 2).
    It comes before the look pass because an event mark changes the
    canvas the pass judges. The release then ships at the parity of
    answer 1, and the README's images show the events. *Rejected:* 10b
    after the release, the soonest release, with a page that omits
    printed facts, a format frozen before its drawing is designed, and a
    second capture and release; 10b between the look pass and the
    release, the same delay with the marks judged twice. *Cost accepted:*
    the release waits for 10b.

13. **The legend: a short line, room in the fit, the peach as step 0.**
    A line keeps what a color needs, which clock it is and how fast it
    runs:

    ```
    ■ A₀ (base)  · m 1 · c 0     Δt_base
    ■ A₀ (base)  · m 2 · c 1     2·Δt_base
    ■ A₂ (dss)   · m 1 · c 0     1/50 s
    ■ A₁ (noise) · m 1 · c 0     1/10 s
    ```

    A deployment changes only the `Δt` of the `A₀` lines, from symbolic
    to concrete. `D`, `Φ` and `τ` go to the line's tooltip. The fit
    avoids the legend's box: it computes two candidates, one leaving the
    legend's height free at the bottom and one leaving its width free at
    the left, and takes the larger scale. What the type labels cost the
    fit scale, and the text levels' floors that depend on it, stay the
    look pass's. The peach is step 0 of the palette and nothing more,
    and the palette order stays a function of the build alone, so a
    model keeps its colors when it is deployed. The palette's comment,
    which calls the peach the base grid's color, is corrected. This
    amends `visual_grammar.md` answer 6 and the roadmap's ruling that a
    line gains the concrete `Δt` and `(D, Φ)`.
    *Why:* the full line, `A₁ (fast) · m 2 · c 0 · D 8 · Φ 0 · Δt 1/25 s
    · τ 0`, is too long for a canvas corner, and `closed_loop` has ten
    lines. The timing tab and the chart show `D`, `Φ` and `τ` in full,
    and the chart's swatches carry the legend's focus. Every line names
    its anchor, so a color needs no fixed meaning. *Rejected:* the
    concrete `(D, Φ)` on every line; the legend overlaying the drawing
    and collapsing to a chip; the legend leaving the canvas for the
    frame; the peach reserved for `A₀ · m 1 · c 0`, which costs
    `closed_loop` a color it is already short of.

14. **A root input's `pinned`: the meet's.** The writer computes D-168's
    meet for each root input and writes it in the row's existing `pinned`
    field. It is true when some consumer's entry refuses the root
    input's type walked to a `Dual`: a continuous consumer by its
    `Pinned` marker or by an abstract entry that admits no `Dual`, a
    discrete one by tier. The meet needs no `Dual` activation, since a
    consumer's entry at a scalar is a function of its declaration, its
    tier and the scalar (`Redstone.jl/src/declare.jl`, `contract_at`).
    The row also gains `pinned_by`, the consumers whose entries refuse,
    each an endpoint, an empty array when none:

    ```json
    {"name": "h_ref", "type": "Float64", "kind": {"kind": "float"}, "pinned": true,
     "pinned_by": [{"path": "autopilot/alt_hold", "port": "h_ref"}]}
    ```

    The cause has no key: a consumer on the discrete tier pins by tier,
    one on the continuous tier by declaration. In the core,
    `show(::Structure)` marks each input route that ends at a pinning
    consumer, "pinned by tier" or "pinned by declaration", from the list
    `linearize`'s refusal already builds. The root-inputs tab shows the
    pinned mark again and marks those consumers among a root input's
    terminal consumers, with the cause. The page states no verdict on
    seedability. §14.10's type rule,
    a `Float64` leaf reached by at most one index step, shows in the
    type and kind columns, and the help page states it once. This amends
    `workspace.md` answer 6, whose note of 2026-11-11 dropped the mark.
    *Why:* the field was `false` in every file, the writer reading the
    type the wire pass had stripped of its marker, so the ruling corrects
    a field. §8.2 gives the word: "the root input pins at every
    activation if any consumer's entry pins". The input routes list each
    terminal consumer of each root input, the set the meet runs over, so
    a mark there names the consumer and the cause where the user already
    reads. The cause decides the remedy (§14.10): a declared pin can be
    promoted, a pin by tier cannot. With the mark in `show`, the parity
    rule brings the consumers into the format, and the page's marks are
    exact. The build refuses a marker below the top of an entry (D-265),
    so a face's flag covers every declared pin, and the one pin a client
    could not see for itself is the abstract entry's, which subtyping
    decides. *Rejected:* the tab silent, the user learning at
    `linearize`'s refusal; the client deriving the pin from the
    consumers' flags and tiers, a second implementation of the meet that
    misses the abstract entry; a `seedable` verdict in the format, which
    would be per tap, a vector input having one per component; `show`
    unchanged, the page alone carrying the fact; the word "pinned" beside
    the name on `show`'s heading, which says the input is frozen and not
    by whom or why; a root-inputs table in `show` with the types, which
    the user wrote. *To check when the core's part is built:* that an `AbstractFloat` entry pins, which
    was read off `_accepts_wire` and not run.

15. **The `@ref` links: the writer adds the target, the page reads it.**
    The writer rewrites each bare link whose name, an identifier or a
    dotted path of identifiers, resolves from the type's module to a
    binding its owner exports. It adds the owner as the target and keeps
    the text, so `` [`Pinned`](@ref) `` in a `Library` docstring becomes
    `` [`Pinned`](@ref Redstone.Pinned) ``. A name that resolves to a
    module takes the module as its target. Any other link stays as
    written, a macro's or an operator's among them. The page links a target under
    `Redstone.` to the core's API page, whatever the type's module, and
    shows every other link as its text, a bare one included. A glossary
    id links only in the docstring of a type under `Redstone.`. This
    amends `descriptor_design.md` answer 10 and the roadmap's ruling
    that the page keeps its module-joining as a fallback.
    *Amended 2026-11-21 (the core's D-467, commits 81d6b76 and fb4c3dc):
    the rule named neither the form of a name nor a module's target, and
    a module's own name took the target `MyPkg.MyPkg`. The core's run
    counted 124 bare links in 45 component docstrings, where the session
    counted 121 in 42 below. The checks below came back as follows. No
    bare link names an exported binding, since the core exports nothing
    until its export audit (D-226), so the pass rewrites none of them.
    The docs build's check lists `Redstone` alone (`docs/make.jl`,
    `modules = [Redstone]`) and leaves `Redstone.Library` outside it.*
    *Why:* the page joined a bare name to the type's module, so the 9
    bare links from `Library` into `Redstone` were dead, `Pinned` and
    `Group`'s `local_wires` among them. At the core's tip the 42
    component docstrings hold 277 glossary links, 112 bare links into
    the type's own module, those 9 and 2 links qualified as written, and
    every bare one is a plain identifier that resolves. The core's docs
    build checks that every exported name with a docstring stands on the
    API page (`checkdocs = :exports`), so a link to an exported name has
    its anchor by construction. After the writer's pass a bare link is
    one that did not resolve, and joining it to a module makes a dead
    link. A rule on the target lets a user's docstring reach the core's
    API page. *Rejected:* the module-joining kept as a fallback;
    `which(mod, name)` alone, which also qualifies an internal name with
    no anchor; the text qualified with the target, which changes what the
    author wrote; a glossary id linked from a user's docstring, a user's
    `g-…` id not being the core's. *To check when the core's part is
    built:* that the 121 bare links all name exported bindings, and that
    the docs build's check covers `Redstone.Library`.

16. **The fixtures: three more deployments, `descent` rebuilt, and one
    model for the cases that need the writer.** At the pin bump the
    script builds `descent` itself, the plant with a `GroundContact` and
    a `StopRequest`, the core's examples having dropped it, and the tests
    that read `descent.json` stay as they are. Three deployments join
    `closed_loop_deployment`:

    | fixture | what it shows |
    |---|---|
    | `closed_loop_deployment`, kept | ten rows on one `(D, Φ)`: one chart row with ten swatches |
    | `library_deployment`, `Δt_frame = 1//100` | 13 rows on 4 distinct `(D, Φ)`, `(2, 1)` among them and `(2, 0)` from two triples; a grid report with two pool entries; a base tick finer than the coarsest admissible `1//50`; events |
    | `rates_deployment`, `Δt_frame = 1//100`, `Δt_base = 1//200` | the one model with rate scopes, 3 rows and a hyperperiod of 40; a frame of two base ticks, so the frame tops are drawn |
    | `approach_deployment` | the tutorial's model on two clocks, 11 rows, and the examples' one event, `gear`'s `touchdown`, which 10b draws |

    A case no model shows is served in one of two ways. An inline copy,
    a committed deployment with one field edited in the test, serves
    where one independent field decides the case: a frame that is not a
    whole number of base ticks, and a proposing algorithm with `h_min`.
    The writer's output serves where sections must agree: an anchor with
    a nonzero `τₖ`, a pool entry with alternatives, and a root input
    pinned by declaration. A new synthetic model, `timing`, holds those
    three, in the pattern of `kinds` and `library`. The timeline past
    the threshold needs no file: a unit test passes a small threshold.
    *Why:* `descent` has three primitives and about twenty test files
    read it, where `approach` has 19 under a child `vehicle`, so the move
    would rewrite every assertion on a path or a count for nothing. Each
    deployment shows what no other does. A hand edit that must keep two
    sections in agreement tests the test's arithmetic and not the
    writer's, and a hand edit of one independent field cannot make a file
    disagree with itself. *Rejected:* the tests moved to a fixture of
    `approach`; `autopilot` committed, 8 rows on the two clocks
    `approach` already has; an inline copy for a nonzero `τₖ`, which
    moves every row beneath the anchor. *Cost accepted:* about 300 kB of
    new fixtures beside 870. *To check at the pin bump:* that
    `closed_loop`'s `h_ref` is pinned by tier, which gives the tab its
    first pinned root input; and what makes a pool entry carry
    alternatives, the case leaving `timing` for `pending.md` if it is
    costly to provoke.

17. **The core's homes and the order of the work.** Five log entries
    carry the session's rulings on the framework and the format, each
    with its spec edit, the next five numbers of the core's log:

    | entry | position | annotates | spec |
    |---|---|---|---|
    | the notation | an anchor's period is `Δtₖ`; `Anchor.T` and `Absolute.T` become `Δt`; `Absolute(Δt, τ)`; a component's phase in seconds is `τ` | D-261's `(T, τ)` | §9.2, §10.5, the glossary's anchor and phase entries |
    | the grid report's placement | the report is derived from the anchors; `show(::Structure)` prints it; `Deployment` drops `grid` | D-254, under D-261 | §9.2 |
    | the descriptor's content | the parity rule; the format at 1.0 and free until the release; the flat deployment body; `schedule` with the anchors' rows; `events`; `grid` in `structure`; the key `dt`; the `@ref` targets | D-432's third bullet, D-433's docstring bullet | §13.9 |
    | a root input's pin, shown and carried | `show(::Structure)` marks each input route that ends at a pinning consumer; the descriptor's `pinned` is the meet's and `pinned_by` lists the consumers | D-433's bullet on a root input's `pinned`, D-257 | §9.2, §13.9, with a pointer from §14.10 |
    | `show(::Deployment)` in the notation | one row per component with `m`, `c`, `D`, `Φ`, `Δt` and `τ`; the anchors' `Dₖ` and `Φₖ`; the chart with the frame tops | D-257's chart | §9.2 |

    When 10b runs and which fixtures are committed earn no entry. The
    work runs in this order: this record's close, with its parents'
    notes, the roadmap and `pending.md`; the core's `pending.md`; the
    core's parts one to three, each as a spec and log commit followed by
    its code, the descriptor's part landing two entries; the push, on the
    user's word and no earlier than part three; increment 10, from the
    pin bump. Part four and the tutorial's loose change come before the
    push or run beside increment 10. The user expects to run both first,
    and increment 10 then beside the tutorial's next increments.
    *Why:* the core's `design/rules/log_rules.md` gives an entry to a
    design ruling with rejected alternatives and, by D-314 and D-448, to
    a rename, and none to the order of work. The root input's pin stands
    apart from the descriptor's content because it changes `show` and
    rests on §8.2's meet. The record lands before the spec because it is
    the session's minutes and not normative; `AGENTS.md`'s "lands there
    first" binds the page's code, which waits for the pin. The inspector
    reads the descriptor and never `show`'s text, so it needs parts one
    to three alone. *Rejected:* one entry for the descriptor with the
    root input's pin inside it; the record kept a draft until the spec
    lands.

## Design axes

What this record hands on stands in `roadmap.md`'s staging, increments
10 and 10b, and in the first bullet of `Redstone.jl/design/pending.md`,
the core's four parts.

## Glossary

Terms are defined in `glossary.md`.
