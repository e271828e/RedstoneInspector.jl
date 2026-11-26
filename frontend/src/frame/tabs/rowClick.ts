// An analysis row's click (workspace.md answer 6): a pointer's click selects nothing when it finds a selection, not
// collapsed, that touches the row and differs from the one its press began with, so a drag that made or changed it is
// blocked (the second look's 1.8). Chromium keeps a selection through a click on it, so a plain click leaves it as it
// was and acts. A key's click on the row's button has `detail` 0 and always acts.

/** The selection standing at the last pointer press, read before the press's own default changes it. */
let pressed: Range | undefined;
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", () => {
    const s = document.getSelection();
    pressed = s && !s.isCollapsed && s.rangeCount > 0 ? s.getRangeAt(0).cloneRange() : undefined;
  }, { capture: true });
}

/** Two ranges with the same boundary points. */
const same = (a: Range, b: Range | undefined) => !!b && a.startContainer === b.startContainer && a.startOffset === b.startOffset
  && a.endContainer === b.endContainer && a.endOffset === b.endOffset;

/** A pointer's click that finds a selection on the row other than its press's: the drag made or changed it. */
export function dragged(e: MouseEvent, row: Node): boolean {
  const s = window.getSelection();
  const now = e.detail > 0 && s && !s.isCollapsed && s.rangeCount > 0 ? s.getRangeAt(0) : undefined;
  return !!now?.intersectsNode(row) && !same(now, pressed);
}

/** The row's click handler, `act` run unless the pointer's drag left a text selection on the row. */
export function rowClick(act: () => void): (e: MouseEvent) => void {
  return (e) => {
    if (!dragged(e, e.currentTarget as Node)) act();
  };
}
