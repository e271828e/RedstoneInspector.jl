# The polish batch, notes

The batch is the first bullet of `design/pending.md`'s work order as it
stood at `f29a031`: sixteen frontend items the landed increments left,
each ruled there. The user asked on 2026-11-17 for the core's increment
pipeline with this notes file and no brief unless the readings call for
one, so the loop row's contract lands in `frontend/MAP.md` and here.

The prototype is the branch `polish` in
`~/.julia/dev/RedstoneInspector_polish`, from `f29a031`.

## Rulings

The user ruled on the prototype's readings on 2026-11-17, taking every
recommendation. None of them called for a brief.

1. **The chevron is drawn**, an 11 px stroked path turning a quarter on
   an expanded row. The 18 px `▸` glyph stays the alternative for the
   look, which the item's ruling left the form to.
2. **The loop row links each declared hop.** A pair that crosses an
   assembly's boundary links both the parent's `local_wires` and the
   child's `input_wires` or `output_wires`, since one link per pair, to
   the lowest assembly holding both ends, drops the child's declaration.
   A member traced structurally reads "presumed". The row's contract is
   in `frontend/MAP.md`.
3. **No link into the core's own source.** Every fixture's assembly is a
   core `Group`, whose `types` row locates the `Group` accessors in the
   core's `library.jl`, not the user's `Group(...)` call. A hop whose
   declaration lies in the core's source shows its wires with no link,
   since a link that always leads to the wrong place is worse than none.
   Locating an assembly's construction call is a format bump for the
   core, entered in `pending.md`'s "Format bumps still open".
4. **The status bar's wording stands as prototyped**, open to the look.
5. **Three items reach past their rulings.** Every status bar segment
   ends in an ellipsis with its whole text as title, since at 1000 px the
   counts alone pushed the clear control off. The right-click menu's
   Trace says "nothing to trace" too, sharing `t`'s action. A focused
   diagnostic with nothing on the level dims nothing either, the same
   fault on `failure_probe`'s level `s`.
6. **The pin's loop badge climbs without focusing**, as the child block's
   `loop` badge opens without focusing.
7. **The `containers` fixture** gives `scale` the keyed container `taps =
   (c = Gain(10.0),)`, defined last in `scripts/synthetic.jl` so no other
   fixture's line numbers move.
8. **"The face's type" is the owner's type.** A `type:` term matches the
   owner node's type, so that is the type the row shows.
9. **The open level's mark stands with the primitive root selected too**,
   since the pane shows the same facts. An opened assembly's pane takes the
   mark with nothing selected, but with its own row selected it shows the
   open button and no mark, as it did before the batch; that difference is
   for the look.
10. **The collapsed tree needed no code.** A selection made while the
    pane is collapsed already scrolls into view on expanding, in both
    browsers, so the item lands as a check.
11. **The batch also takes four small changes the prototype found.** The
    two stale traps in `design/rules.md`, "`scrollIntoView` in a hidden
    pane" and "A row's text", are updated. A push that drops a route
    because its origin face is gone gives the same notice as one whose
    origin no longer resolves. The fallback note renders its backquoted
    text as code, as the other notices do. A type label drops its
    `<title>`, which cannot show once the label ignores the pointer.
12. **The core's source is told by the holder's type name**, the
    coordinator's ruling within ruling 3, for the user to strike. A
    holder whose qualified type is `Redstone` or under `Redstone.` gets
    no link. The location's `file` would serve as well only for one
    install: it differs between a depot copy, a dev checkout and the
    fixtures' `<depot>` labels.
13. **`frontend/MAP.md` past 700 lines** gets its own trim, an unordered
    item in `pending.md`, not part of the batch.
