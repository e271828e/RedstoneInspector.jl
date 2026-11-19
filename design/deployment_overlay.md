# The deployment overlay: the eighth record of the inspector's stage 1

**Draft. The session of 2026-11-19 is still open, and the questions under
"Pending questions" are not ruled.**

The record of the design session that fixed increment 10: what a
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
core's spec, its `show` and three of its fields.

## Pending questions

Each with the recommendation made in the session where one was made.

- **A root input's seedability.** Whether the root-inputs tab shows it,
  and whether the client derives it or the format carries it. The core
  decides it at a `Dual` activation by asking each consumer's entry
  (`Redstone.jl/src/linearize.jl`, `_seeded_tap`), a discrete consumer
  pins by tier, and only a `Float64` leaf is seedable at all.
- **The `@ref` rule's edges.** What the writer does with a name the
  type's module imports from outside `Redstone`, and what the page links.
  At the core's tip every bare `@ref` in the 42 component docstrings
  resolves, 112 into the type's own module and 9 from `Library` into
  `Redstone`.
- **The fixtures.** Which deployments are committed, since
  `closed_loop_deployment` has ten rows on one `(D, Φ)`, and what the pin
  bump does about `descent()`, which left the core's examples.
- **The events section's shape.** Answer 7 gives the proposed one.
- **When 10b runs**: before the look pass, as recommended, or after the
  release.
- **The spec and log homes, and the order of the commits.**

Two questions the session raised belong to the core and stand in its
`pending.md`: whether `Period` and `Hz` retire, and whether the build
refuses a pool that admits no deployment.

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
     "primes": [{"prime": 2, "power": 1, "suppliers": [0, 1]},
                {"prime": 5, "power": 2, "suppliers": [0]}]
   }
   ```

   A pool entry names its anchor by index and says whether it is the
   period or the offset. Its value, scope and key are that anchor's row.
   `alternatives` appears on an entry that has some. A model with no
   anchors has an empty pool and no `admissible`. In the core,
   `show(::Structure)` derives the report and prints it under the anchor
   table, and `Deployment` drops its `grid` field. The refusal's message,
   the derivation line and `GridUtilization` stay the deployment's and
   keep the report in their payloads. So a build's page shows the report,
   a failure past the structure step shows it, and a deployment adds one
   comparison, its `Δt_base` against the coarsest admissible one.
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
   joins the declarations a `types` row locates. The proposed shape, one
   row per component that declares an event, as `show` prints, here the
   core's `approach` example:

   ```json
   "events": [{"path": "gear",
               "events": [{"name": "touchdown", "policy": "localized"}],
               "bundle": ["m", "u", "y", "t"]}]
   ```

   Increment 10 draws none of it. Increment 10b draws the events after a
   short design session of its own, and decides there where
   `firing_budget`, `localization_tol` and `localization_budget` show.
   *Why:* one change to the format, one spec edit, one log entry and one
   pin bump serve what answer 1 treats as one gap, and a reader ignores
   fields it does not use. How an event is drawn is a question of the
   visual grammar, a mark on a block, rows in the pane, a legend line,
   and wants its own look. *Rejected:* the events in a later change to
   the format with their own increment, tidier per increment and twice
   the pin moves and fixture rounds. *Cost accepted:* the section is
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
    chart and the legend. Increment 10b draws the events.
    *Why:* the timing tab is rebuilt in this increment and the format is
    free until the release, so the page is built once against the final
    shape.

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

## Design axes

What this record hands on.

- **The core's four parts**, in `Redstone.jl/design/pending.md`'s first
  bullet, each with its spec edit and, where an alternative lost, its log
  entry.
- **Increment 10**, the inspector's half, briefed against the core's
  landed tree.
- **Increment 10b**, the events, after its own design session.
- **The amendments this record owes its parents** when it lands, each a
  dated note: `workspace.md` answers 4, 6 and 7, `visual_grammar.md`
  answer 6, `descriptor_design.md` answers 2 and 9, and the roadmap's
  entry for increment 10 with a new one for 10b.

## Glossary

Draft entries, to move to `glossary.md` when the record lands.

- **Frames table.** The detail pane's rendering of a discrete
  primitive's timing: one row per frame, its rate scope, its anchor, the
  base grid and seconds, each with a period and a phase (answer 10).
- **Joint period.** The shortest time after which both the schedule and
  the frame tops repeat: the least common multiple of the hyperperiod and
  `Δt_frame`, taken in time. It is the span of the chart's timeline when
  the frame tops are drawn (answer 11).
- **Parity rule.** The descriptor carries every fact `show` prints of a
  `Build` or a `Deployment`, or the facts from which a client derives it
  exactly, and no internals (answer 1).
- **`τ`, a component's.** A discrete component's phase in seconds,
  `Φ·Δt_base`, the time of its first tick after `t₀`; equal to
  `τₖ + c·Δtₖ`, so a build knows it for a component on an anchor other
  than `A₀`. The anchor's own is `τₖ` (answer 3).
