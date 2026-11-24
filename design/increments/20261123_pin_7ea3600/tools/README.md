# The before and after comparison

`capture.mjs` captures the page on every fixture of a built checkout, and
`compare.mjs` compares two such folders. Their heads say how to run them.
Each was run from here on 2026-11-24, at `5fdec7f`, and again at the pin
to the core's `fcd3660`. Run each against a folder outside the tree.

Since increment 10's look the pane's sections open on request, and since
the pin to `fcd3660` `capture.mjs` opens every one, so its screenshots and
its text hold their content.
