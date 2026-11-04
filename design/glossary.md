# Glossary

The terms the inspector's records coin, one entry each, in alphabetical
order. Each entry ends with the record and answer that rule the thing,
and the answer wins where the two disagree. The core's terms, component,
face, root input, descriptor, kind marker and the rest, are defined in
`Redstone.jl/design/spec.md`'s Appendix D, which is normative, and get
no entry here.

- **Artifact.** In `build_release.md`, Pkg's sense: the bundle
  `Artifacts.toml` names by its tree hash and fetches from the release's
  tarball; the other records use the core's sense. A file CI hands between
  jobs is a *job output* (`build_release.md` answers 1 and 6).
- **Authored panel.** A component's own panel, given by a method on its
  type that returns a panel description, or by a custom front-end panel
  keyed by the type's name (`initial_design.md` stage 4, Settled).
- **Badge.** A small mark in a block's corner or at a pin's end carrying a
  fact: a diagnostic, a loop or route continuing inside a closed child or
  leaving through a pin, a closed assembly's clock count, an extra
  triple's number, an execution-order position, and from stage 2 a root
  input's claim (`visual_grammar.md` answers 3, 6 and 8, `workspace.md`
  answers 7 and 8).
- **Base path.** The prefix a built page puts before its own files'
  addresses; `./` makes them relative to the page, so one build serves two
  addresses (`build_release.md` answer 7).
- **Body.** The object under the key named by the descriptor's `kind`: the
  build body, the deployment body that embeds a build body, and the
  failure body that embeds a `structure` section when the carrier holds
  one (`descriptor_design.md` answers 1 and 2, `failure_descriptor.md`
  answer 1).
- **Breadcrumb.** The open level's path as links above the canvas, the
  root labelled as the tree labels it (`workspace.md` answer 3).
- **Bridge.** Stage 2: an ordinary device hosting the handle serialized
  over a socket, so a client outside the process can follow and command a
  run (`initial_design.md` stage 2, Settled).
- **Build descriptor.** The descriptor of a `Build`. Its timing is
  anchor-relative (`initial_design.md` answer 5).
- **Bundle.** The inspector's built front end: a few static files that run
  in any browser with nothing installed. Not the core's bundle, the views
  a component function receives (`initial_design.md` answer 10).
- **Bundle directory.** The folder the server serves the page from: the
  artifact Pkg unpacked on install, or the `bundle_dir` preference's
  folder in the development loop (`live_session.md` answer 8).
- **Casing.** The highlight of a line: a wider translucent band under a
  wire in the highlight hue (`visual_grammar.md` answer 9).
- **Channel.** The server's record for one name: the name, the latest
  descriptor text pushed to it, and the sockets of the browser tabs that
  greeted with it. The default channel's name is `""` (`live_session.md`
  answer 4).
- **Checker.** `svelte-check`, which reads the TypeScript annotations
  before the code runs and is the cheapest reviewer of code read rarely
  (`build_release.md` answer 4).
- **Chord.** A dead hop drawn inside its member, a dashed line from an
  input square to an output square with a cross at its middle
  (`visual_grammar.md` answer 8).
- **Cockpit.** Stage 4: the page with panels that command the model over
  the bridge (`initial_design.md` stage 4).
- **Control message.** A text frame carrying a JSON object with a `type`
  field: `hello` and `open_location` in stage 1, stage 2's verbs later
  (`live_session.md` answer 5).
- **Cycle section.** The `cycle` object an `AlgebraicCycle` diagnostic
  carries: members, wires as terminal pairs, the classification, the dead
  hops and the tracing modes (`failure_descriptor.md` answer 2).
- **Deployment descriptor.** The descriptor of a `Deployment`. Its body
  embeds the build body it deploys and holds nothing else until the
  deployment overlay's bump adds the schedule and grid facts
  (`initial_design.md` answer 5, `descriptor_design.md` answer 13).
- **Descriptor frame.** A text frame carrying the pretty-printed envelope
  as its own bytes, told from a control message by its `format_version`
  key (`live_session.md` answer 5).
- **Dim.** The opacity state of everything uninvolved while a diagnostic,
  a route, a legend line or a search is focused; never a color change
  (`visual_grammar.md` answer 9).
- **Display name.** A block's second text line: the alias's last segment,
  else the type's, replaced by an icon where one applies
  (`visual_grammar.md` answers 1 and 7).
- **Drawer.** The bottom pane: diagnostics, root inputs, timing and
  execution order as tabs, collapsed to its tab strip unless a diagnostic
  exists (`workspace.md` answer 6).
- **Drift check.** A CI step that regenerates a committed derived file,
  the fixtures and the schema copy, and fails when the result differs
  (`build_release.md` answer 6).
- **Endpoint.** One end of a wire, `{"path", "port"}` in full paths, the
  level's own path on a boundary face and `""` for a root input
  (`descriptor_design.md` answer 5).
- **Envelope.** The top-level object: `format_version`,
  `redstone_version`, `kind`, the optional `name` and the body
  (`descriptor_design.md` answer 1).
- **Face object.** A face as the node carries it: a *leaf face* with
  `name`, `type`, `kind` and `pinned`, or an *assembly face* with `name`
  alone (`descriptor_design.md` answer 4).
- **Failure body.** The object under `failure`: `policy`, `structure` when
  held, `diagnostics` and `warnings` (`failure_descriptor.md` answer 1).
- **Failure descriptor.** The descriptor of a carrier exception, a failed
  build's or a service's: its diagnostics and warnings, plus the
  `Structure` projection when the carrier holds one (`initial_design.md`
  answer 6, `failure_descriptor.md` answers 1 and 3).
- **Field and key.** On a node, the field that contributed it to its
  parent and, for a container element, its key within the container.
  Together with the path they fix the membership: component field, keyed
  container or name-transparent container (`descriptor_design.md`
  answer 4).
- **Folder row.** A keyed container's row in the tree, named by the field,
  no node: it highlights the region and shows the field (`workspace.md`
  answer 2).
- **Format version.** The descriptor format's own version, independent of
  Redstone's: the envelope's `format_version`, a `{"major", "minor"}`
  object. A minor bump only adds fields, which a reader ignores when it
  does not know them; a major bump may break readers, and a reader refuses
  a major it does not know (`initial_design.md` answer 7,
  `descriptor_design.md` answer 1).
- **Frame.** The grid of tree, canvas, detail pane and drawer with its
  splitters, replaced by stage 4's dock while the panes stay. Not the
  core's frame, one iteration of the loop (`workspace.md` answer 1).
- **Generator.** A program that writes code from a description, here the
  TypeScript declarations from the schema copy (`build_release.md`
  answer 4).
- **Generic panel.** The panel the client derives from a component's faces
  and kind markers when no authored panel exists; also embeddable by an
  authored one (`initial_design.md` stage 4, Settled).
- **Greeting.** The page's first message after the handshake, `hello` with
  its channel name and the format major its bundle reads; the server
  answers with the channel's stored text if any (`live_session.md`
  answer 4).
- **Halo.** The highlight of a shape: a soft wide outline just outside a
  block, a pin or a port square (`visual_grammar.md` answer 9).
- **Handle-only rule.** The bridge reaches the framework through the
  device handle alone, so that what it needs is what every client needs
  (`initial_design.md` Scope).
- **Handshake.** The HTTP request that asks a server to open a WebSocket
  at `/ws`. Accepted by the inspector's server when the `Origin` is its
  own, refused by GitHub Pages, which is how the page learns whether it is
  live (`live_session.md` answers 5 and 6).
- **Headless browser.** A real Chrome started with no window and driven by
  a script, which is what Playwright runs the checks in
  (`build_release.md` answer 5).
- **Hosted copy.** The bundle published on GitHub Pages. It opens
  descriptor files locally and uploads nothing (`initial_design.md`
  answer 10, `workspace.md` answer 10).
- **Hosted page, live page.** The same bundle loaded from GitHub Pages,
  with no socket, or from the inspector's server, with one
  (`live_session.md` answer 5).
- **Hue, reserved.** Red for errors, amber for warnings, blue for
  highlight. The rate palette's fills, and the wires with them, keep their
  distance from all three under every vision (`visual_grammar.md`
  answers 6, 8 and 9).
- **`$id`.** A JSON Schema's own name as a URL, its identity for readers
  and validators (`build_release.md` answer 7).
- **Inspector.** The browser client, at whichever stage. Static, it
  explains a model's structure from descriptors; live, it shows a run on
  the diagram; as the cockpit, it commands the run (`initial_design.md`
  Scope).
- **Job, workflow.** GitHub Actions' units: a workflow is one file run on
  a trigger, a job one machine's sequence of steps inside it, and `needs`
  orders jobs (`build_release.md` answer 6).
- **`kind`.** Three senses in the format, told apart by where the field
  sits. The envelope's `kind` names its body: `build`, `deployment` or
  `failure`. A leaf face's `kind` holds its kind marker, whose own first
  field `kind` names the marker's class: `boolean`, `enum`, `symbol`,
  `integer`, `float`, `number`, `vector`, `struct` or `opaque`. A
  diagnostic's `kind` is its Julia type's name, the core's sense of the
  word (`descriptor_design.md` answers 1 and 6, `failure_descriptor.md`
  answer 2).
- **Landing panel.** What the canvas shows before a model is loaded: the
  privacy statement, the open control, a drop hint, the help link
  (`workspace.md` answer 10).
- **Legend.** The canvas-corner list in rate mode: a line for the
  continuous color when anything continuous is visible, then every triple
  visible on the open level's blocks and wires, each read out, the overlay
  bump adding its concrete `Δt`. A click on a line focuses it
  (`visual_grammar.md` answer 6).
- **Level.** What the canvas draws at a time: an assembly's children as
  blocks, its own faces as pins, its wires (`visual_grammar.md` answer 3).
- **Live inspector.** Stage 3: the page connected to the bridge, showing
  runtime data on the diagram (`initial_design.md` stage 3).
- **Live session.** The inspector package's local web server and the tab
  it feeds, updated by explicit `inspect` calls and, from stage 2, by the
  bridge (`initial_design.md` answer 8, `live_session.md` answer 3).
- **Liveness table.** The port-view table of D-270, baked once at run
  start: one view per port of every component, with its terminal producer,
  the live-or-read-only verdict of §11.7, its staging slot and its
  incumbent writer. A run-start fact on the bridge (`initial_design.md`
  stage 2, Settled).
- **Location.** A declaration method's `{"function", "file", "line"}` in a
  type's row (`descriptor_design.md` answer 10).
- **Lock file.** `package-lock.json`, the exact versions of every Node
  dependency, committed so that `npm ci` installs the same set everywhere
  (`build_release.md` answer 3).
- **Loopback.** The interface `127.0.0.1`, reachable only from the machine
  itself. The server binds it and nothing else (`live_session.md`
  answer 3).
- **Mark.** A port or a wire a diagnostic names beyond its path, where the
  overlay draws; `marks` holds them as two arrays (`failure_descriptor.md`
  answer 2).
- **Named array.** The format's rule for a collection keyed by data: an
  array of objects each carrying `name`, never an object with data keys
  (`descriptor_design.md` answer 11).
- **Node.** One component of the walk, leaf or assembly, keyed by its path
  (`initial_design.md` answer 17, `descriptor_design.md` answer 4).
- **Omission.** The format's rule that a field which does not apply is
  left out rather than written as `null`; an empty collection that applies
  is an empty array (`descriptor_design.md` answer 4).
- **Origin.** The scheme, host and port a page was loaded from, which the
  browser puts in every handshake and the page's code cannot alter
  (`live_session.md` answer 6).
- **Parameter summary.** A node's inert fields, those that are not
  components or containers, each as its compact `repr` cut at 80
  characters, shown in the detail pane and never on the block. It is
  display text for a human, never a serialization a program rebuilds
  values from (`descriptor_design.md` answer 10, `visual_grammar.md`
  answer 1).
- **Parent rule.** The client's rule for a node's parent: the longest node
  path that is a proper prefix of its path, which skips a container's
  non-node path (`descriptor_design.md` answer 4).
- **Pending map.** The client's one record of what it has staged and not
  yet seen applied, keyed by root-input face, the mirror of the staging
  cell (`initial_design.md` stage 2, Settled).
- **Per-node view state.** State a panel keeps between ticks, keyed by the
  node's path and owned by the client (`initial_design.md` stage 4,
  Pending questions).
- **Pin.** Two senses. On the canvas, a boundary face of the open level
  drawn as a node with one port: an outlined capsule, or a tag for a root
  input (`visual_grammar.md` answer 3). In the build, the one fact that
  says which Redstone the fixtures and tests are built against: a commit
  revision before the core's first release, after it the release's tag
  with an equality bound in `scripts/` (`build_release.md` answer 2).
- **Policy.** `fail-fast` or `collected`, the carrier's type parameter
  read out: whether the list is the first failure alone or everything a
  step found (`failure_descriptor.md` answer 1).
- **Preference.** A per-machine setting read through Preferences.jl:
  `port`, `open_browser` and `bundle_dir` in stage 1 (`live_session.md`
  answers 3, 4 and 8).
- **Push.** A new descriptor arriving in a tab from the live session,
  after which every piece of session state is rekeyed by path and name and
  what has no key is dropped (`workspace.md` answer 9).
- **Qualified base name.** A type's `parentmodule` and `typename` joined,
  the node's `type` and the `types` table's key, with type parameters
  stripped (`descriptor_design.md` answer 3).
- **Rate mode, tier mode.** The two color modes: by timing triple, the
  compiled clock, or by continuous against discrete. Tier mode is the
  default (`visual_grammar.md` answer 6).
- **Raw view.** The generic panel shown for a component that has an
  authored panel, for debugging (`initial_design.md` stage 4, Pending
  questions).
- **Region.** A keyed container's elements framed in a thin dashed rounded
  rectangle captioned with the field name (`visual_grammar.md` answer 5).
- **Round trip.** The core test's path: the Julia value encoded to JSON
  text, parsed back into generic dictionaries, and validated, so that the
  bytes a client reads are what conforms (`descriptor_design.md`
  answer 12).
- **Route.** A face's value path, upstream to its terminal producer and
  downstream to every terminal consumer, drawn across levels once started
  on purpose (`workspace.md` answer 8).
- **Schema of record.** `Redstone.jl/src/descriptor.json`, shipped with
  the core: the exact shape of the format, draft 7, strict about the
  writer's output, cited from §13.9 and never restated field by field in
  prose (`descriptor_design.md` answer 12).
- **Section.** A top-level key of a body: `structure`, `outputs` and
  `warnings` in the build body, and `policy`, `structure`, `diagnostics`
  and `warnings` in the failure body (`descriptor_design.md` answer 2,
  `failure_descriptor.md` answer 1).
- **Semantic zoom.** The fixed order in which a block's text levels drop
  below the legibility floor: face names, display name and icon, segment
  (`visual_grammar.md` answer 10).
- **Session state.** What a tab keeps for its lifetime: the open level,
  each level's view and positions, the expansion, the selection, the
  route, the query, the drawer's state; against the browser's preferences
  and the model's data (`workspace.md` answer 9).
- **Signature.** A node's full printed concrete type, beside its qualified
  base name, untruncated (`descriptor_design.md` answer 3).
- **Spawned task.** A task created with `Threads.@spawn`, free to run on
  any thread, against an `@async` task pinned to the thread that made it
  (`live_session.md` answer 3).
- **Subscription.** A client's declaration of the paths it displays and
  the rate it wants them at, so bandwidth scales with the screen, not the
  model (`initial_design.md` stage 2).
- **Tab by name.** A browser tab bound to an envelope `name`, which
  `inspect` pushes to by that name (`workspace.md` answer 9,
  `live_session.md` answer 4).
- **Tag.** A root input's pin: a capsule pointed into the model, filled
  with the external color, its outer end a slot for the claim badge
  (`visual_grammar.md` answer 3).
- **Tag-absent rule.** The release trigger: on a push to master, release
  the version `Project.toml` claims if no tag of that version exists
  (`build_release.md` answer 6).
- **Timing.** A leaf node's or a scope's `{"anchor", "m", "c"}`: the
  anchor it hangs from, its period multiple and its phase in that anchor's
  ticks. The grammar and the frontend's code call it the triple, the
  compiled clock rate mode keys its colors on (`descriptor_design.md`
  answer 9, `visual_grammar.md` answer 6).
- **Trace.** The action that starts a route: the detail pane's button, the
  right-click entry or `t`. Not the core's trace, a session's record
  (`workspace.md` answer 8).
- **Tree hash.** The git-style hash of an unpacked directory's contents,
  which Pkg uses to name and verify an artifact (`build_release.md`
  answer 1).
- **Triple.** The timing, as the grammar and the frontend's code name it;
  see Timing (`visual_grammar.md` answer 6).
- **Types table.** `structure.types`, one row per qualified base name with
  the docstring and the locations, so a repeated type is described once
  (`descriptor_design.md` answers 3 and 10).
