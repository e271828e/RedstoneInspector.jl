# Increment 10's tools

Each was run from here on 2026-11-24, at `5fdec7f`.

- **The oracle**, `oracle.py`, derives every timing fact of the fixtures by
  the record's definitions as of the build, so the look's amendments are
  not in it. `crosscheck.jl` writes the core's own text for it to compare
  with, under `show/`. Both write beside themselves, so copy them out of
  the tree first, then run `crosscheck.jl` and `oracle.py` as their heads
  say. 567 checks, none failed.
- **The look's reading**, `look_reading.py`, derives what the page shows
  since the look. `look_modules.test.ts` dumps what the modules give, run
  through `vitest.config.mjs`, and `look_compare.py` compares the two.
  2037 facts over the 21 fixtures, none disagreeing.

The before and after comparison of the page is
`../../20261123_pin_7ea3600/tools/`.
