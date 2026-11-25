# The cold review's probes

The reviewer's probes and mutant runners of 2026-11-25, with the fixer's
`p15.mjs`, `ph1.mjs` and `mutants_fix.py`. The `.out` files are their runs.

A probe serves `dist/` beside it, so copy a worktree's built
`frontend/dist` here, with a `node_modules` symlink to the worktree's and a
`package.json` of `{"type": "module"}`. Then

    FRONTEND=<worktree>/frontend node p11.mjs chromium,firefox

WebKit takes `PLAYWRIGHT_BROWSERS_PATH` naming a folder with Playwright's
WebKit. The runners `mutants_review.py` and `mutants_fix.py` read
`FRONTEND`; `reverts_delta.py` runs from inside `frontend/`.
