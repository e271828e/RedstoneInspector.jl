// An analysis row's click (workspace.md answer 6): a pointer's click selects nothing when its press began with no
// selection touching the row and the click finds one there, so only the drag that made it is blocked (the second
// look's 1.8). Chromium collapses a selection pressed inside only after the click, hence the press is read too. A
// key's click on the row's button has `detail` 0 and always acts.

/** The selection standing at the last pointer press, read before the press's own default changes it. */
let pressed: Range | undefined;
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", () => {
    const s = document.getSelection();
    pressed = s && !s.isCollapsed && s.rangeCount > 0 ? s.getRangeAt(0).cloneRange() : undefined;
  }, { capture: true });
}

/** The row's click handler, `act` run unless the pointer's drag left a text selection on the row. */
export function rowClick(act: () => void): (e: MouseEvent) => void {
  return (e) => {
    const s = window.getSelection();
    const row = e.currentTarget as Node;
    const now = e.detail > 0 && s && !s.isCollapsed && s.rangeCount > 0 && s.getRangeAt(0).intersectsNode(row);
    if (now && !pressed?.intersectsNode(row)) return;
    act();
  };
}
