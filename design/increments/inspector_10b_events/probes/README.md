# Increment 10b's probes

Playwright probes that ran outside the tree. Each folder needs a
`node_modules` symlink to a worktree's `frontend/node_modules` beside it
and a `package.json` of `{"type": "module"}` (`design/rules.md`, "A
Playwright probe outside the tree").

- `ring/`: reading R1. Four ways to draw a ring around a table's row
  group, each read back pixel by pixel in Chromium and Firefox.
- `layout/`: ruling C2's figure. `layout.spec.ts` compares every level of
  every committed fixture between a baseline bundle and the increment's.
  `pills.spec.ts` measures the pills. `BASE_FRONTEND` names the baseline's
  `frontend/`, built, with the increment's `dist/` copied to `new_dist`
  two folders above it. `FIXTURES` names a `fixtures/` folder.
