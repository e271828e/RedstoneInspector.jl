# The pin to the core's `6afd6fb`, notes

The pin carries the core's class value `"primitive"` (`c894949`), its
module `Redstone.Library` (D-453, ratified) and `Δt_frame` (D-443). The
target is the core's pushed `origin/master`, `6afd6fb`; its local
`b37c018` was an unpushed docs commit. The prototype is the branch
`pin-library` in `~/.julia/dev/RedstoneInspector_pin`, from `bfb622e`.

## Rulings

The user ruled on the prototype's readings on 2026-11-16.

1. **"primitive" in the code as well as the descriptor.** The prototype
   kept this repo's word "leaf" for a child's role, a tree row's class and
   the pane's kind, translating the descriptor's class at three sites.
   The user ruled for one word: the internal types, the DOM contract, the
   tests and the map read "primitive". The core retired "leaf" as a class
   name because the spec's leaf is the value leaf, which stage 2's values
   on the diagram bring into this repo.
2. **The records are amended in place.** The bullet cited a rule on frozen
   records that exists in neither repo. `design/rules.md`'s "Amending a
   record" governs: the answer states the current name, with one trailing
   dated note. Applied to `descriptor_design.md` answers 3 and 4,
   `build_release.md` answers 4 and 7 and `initial_design.md` answer 17.
   Landed briefs, notes, the spike and the roadmap's increment facts stay
   as written.
3. **Fixture content beyond the rename is accepted.** The library's
   `types` rows moved in `file`, `line` and `docstring`, and the
   integrators and `Delay` gained a trailing `Bool` type parameter. The
   Integrator row's link counts moved with its docstring, so
   `docstring.test.ts` and `detail.spec.ts` take the new counts.
4. **The new components' icons head the work order.** Seven library
   components arrived after `035aa95` with no icon; the user put the item
   first in `pending.md`'s work order.
5. **The prototype's two steps past its instructions stand.** It renamed
   the identifiers and internal tags (`isLeaf` to `isPrimitive`,
   `"leaf-output"` to `"primitive-output"`, about 40 sites) and swept all
   15 lines of `frontend/MAP.md` that said "leaf". Both are what
   "primitive" in the code means.
6. **The prose sweep joins this pin.** The records already change here,
   and one cold review covers both. The records, the README and
   `scripts/synthetic.jl` drop "leaf" for a primitive node and "block" for
   a library component; "block" for a box on the level stays
   (`glossary.md`). Mid-tier agents classify every occurrence before the
   brief, by the user's choice over `brief_rules.md`'s high-tier.
7. **No amendment notes for the sweep.** The user bent "Amending a
   record" for this case alone: the old words are erased with no dated
   note per answer, since a note saying the current term is "primitive"
   adds only noise. This ruling is the trace; landed briefs, notes, the
   spike and the roadmap's increment facts keep the old words. The word
   stays where a *Why* or *Rejected* paragraph argues about the word
   itself, and in quotations, so the decision log and the quotes stay
   true.

## The coordinator's adjudications of the sweep

Five mid-tier agents classified about 330 occurrences at `f14a846`; no
*Why* or *Rejected* paragraph argues about either word, and none quotes
it. The borderline rows were ruled as follows.

- An existing amendment note that names a primitive as "leaf" is
  rewritten (`workspace.md` 222, 247, 248; `visual_grammar.md` 219): it
  names the concept, not the word.
- The format notes of ruling 2 keep `"leaf"`, `LeafFace`, `LeafNode` and
  `Redstone.Blocks`: they record the format's old values, not the term.
- The roadmap's landed entries keep both words; its increment 10 staging
  and its facts list are live text and follow.
- "Library block and user block" (`visual_grammar.md` answer 1's *Why*)
  becomes "a library component's block and a user component's block",
  since the sentence is about the box.
- "Leaf" stays where it is neither sense: the type inside `Pinned`
  (`initial_design.md` 291) and an opaque value leaf (376). "Block" stays
  for Svelte's, Julia's and Markdown's blocks, CSS's inline-block and a
  control block.
- `scripts/synthetic.jl`'s `ContinuousBlock` and `DiscreteBlock` become
  `ContinuousPrimitive` and `DiscretePrimitive`, with the locals
  `blocks`, `block_names` and `N_BLOCKS` following.
