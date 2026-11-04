# Rules

The inspector's own rules, read after the core's: `Redstone.jl/design/rules/code_rules.md`, `brief_rules.md` and `increment_rules.md` apply here first, and this file adds what the frontend's increments taught. A rule that holds for the core too goes there.

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

