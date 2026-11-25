# The keyboard's probes

Copy the folder outside the tree, beside a `package.json` of
`{"type": "module"}` and a `node_modules` symlink to a worktree's
`frontend/node_modules`. Build that worktree, then run

    FRONTEND=<worktree>/frontend npx playwright test

The config's server is `vite preview` on port 4329 over its `dist/`. The
lines go to `out.txt`. The `webkit` project needs Playwright's WebKit.
`hand.html` opens in a browser by itself and is run by hand.
