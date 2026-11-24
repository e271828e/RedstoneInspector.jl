# The before and after comparison

`capture.mjs` captures the page on every fixture of a built checkout, and
`compare.mjs` compares two such folders. Their heads say how to run them.
Each was run from here on 2026-11-24, at `5fdec7f`. Run each against a
folder outside the tree.

Since increment 10's look the pane's sections open on request, so
`capture.mjs` shows the pane with SIGNATURE, DOCSTRING, LOCATIONS and TIMING
collapsed, and its text leaves their content out. A run that must compare
them opens them first.
