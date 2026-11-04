# Rules

The inspector's own rules, read after the core's: `Redstone.jl/design/rules/code_rules.md`, `brief_rules.md` and `increment_rules.md` apply here first, and this file adds the frontend's pipeline, what the frontend's increments taught, and how a record is amended. A rule that holds for the core too goes there.

## The pipeline for the frontend

What changes for a frontend increment, and only that; the Julia
increments run the pipeline unchanged.

- **The repo.** All eleven increments land in `RedstoneInspector.jl`, a
  separate repo with the layout of `build_release.md`'s answer 3. A
  prototype runs in a worktree of that repo, with `npm ci` run there and
  the committed fixtures at hand. The core repo gains nothing from stage
  1 beyond the `$id` commit already landed and increment 10's core half.
- **The map.** Increment 2 wrote `frontend/MAP.md`. Every later brief
  routes reading through it, and every increment extends it in its last
  stage. It holds the layout table, the vocabulary, what is built once on
  load, the stores, the DOM contract as tables of selectors, the
  keyboard, the live tab and the generated types. It holds no test
  inventory, since the test names carry what each test pins; no traps,
  which live in this file; no open items, which live in `pending.md`; and
  no changelog preamble, which git holds. It is read whole before a
  frontend change and kept under about 700 lines.
- **The brief's checks.** Beside its bookkeeping a frontend brief lists
  the unit tests and Playwright checks the increment adds, each named
  with the answer it pins, and the screenshots it must produce. The cold
  reviewer runs the checker, the tests and the browser checks, reverts
  each fix alone to show a check goes red, and reads the screenshots
  against the answers; it does not read the code for style.
- **The look-and-adjust pass.** After the review, before the increment is
  called done, the user looks: the screenshots from the CI run, and
  `npm run dev` in `frontend/` on the fixtures, which is the whole of
  the user's own frontend loop. What the user asks to change goes to the
  fixer as findings, with a cap of one pass per increment; what needs
  more is a note in the next brief.
- **Routing for the agent.** The prototype prompt names the records'
  answers and the map's sections, never whole records; test output goes
  through `tail`, Vite's and Playwright's output being verbose; ELK's
  bundle and `node_modules/` are never read. The notes-file and
  milestone rules of the delegation pipeline apply unchanged.
- **Versions.** The spike's `package.json` fixes the dependency versions
  the first frontend increment starts from: Svelte 5.57, Vite 8.3, ELK
  0.12, Playwright 1.64, TypeScript 6.0, svelte-check 4.7, ajv 8.20.

## Frontend increments

- No reader judges the code, so the pins come from an independent oracle:
  a Python script over the committed fixtures repeating the derivations,
  cross-checked against the core's functions on the same models through
  the inspector's `scripts` project. The reviewer compares oracle, a
  scratch Vitest file and the modules, and writes a third reading of its
  own from the records; a disagreement is a finding. An oracle column is
  computed by the same definition the brief gives the module, and a rule
  over nodes is checked at the root path (a tree row but no block) before
  it enters either, since an oracle and a module written from one brief
  share one slip; the root case is pinned on a synthetic descriptor
  dropped as text.
- Before pinning a property on a fixture, check the fixture exhibits it;
  otherwise the test needs an inline synthetic structure, and a frontend
  check a copy of a fixture's text with the fact edited in.
- Probe the type generator and `tsc --strict` on a probe file outside the
  tree before the brief: the schema's idioms decide whether a core commit
  must precede launch.
- A mechanism a record calls untested (a layout engine's position hints,
  edge labels) is probed in the worktree before the brief, a scratch
  Vitest file over the real modules; what the probe rules out becomes a
  reading with the evidence, never a shape the builder discovers.
- Before launch, walk each check's narrative against the brief's own
  prose and the oracle's definitions; a builder follows the check.
- A geometric pin (nearest block, a pan) is a rule the check recomputes
  from the DOM; the brief states the rule, not numbers. An opacity pin
  reads the effective opacity, the product up to the svg, wherever a
  record says something "never dims" or "always wins": an element's own
  value misses a dim set on an ancestor group.

## Amending a record

- An answer's text states the rule as it stands now.
- One trailing italic note per answer, after its text and before its
  *Why* paragraph, collects the amendments in date order, each with its
  date, its source and what changed: *Amended 2026-11-02 (increment 6's
  look pass): the fill was neutral gray.* The reason stays where the
  source gave it.
- No parenthetical amendment sits mid-sentence; the sentence keeps the
  current rule in plain prose.
- The *Why* and *Rejected* paragraphs are the inspector's decision log
  and stay whole.
- Answer numbers never change: code comments, the map and the briefs
  cite them, so an answer is never renumbered, merged or split.
