#!/bin/bash
# The second fixer's mutants of the user's rulings after the fixes (the checklist's 11.1 to 11.4), each on the scratch
# copy (mutant_scratch.py's environment); fix2_mutants/ holds the texts too long for a line.
D=$(dirname "$0")
M="python3 $D/mutant_scratch.py"
C=src/canvas/Canvas.svelte
E="e2e:e2e/overlay.spec.ts e2e/routes.spec.ts --project chromium"
$M 11.1-routebeforeloop $C "$(cat "$D/fix2_mutants/roworder.old")" "$(cat "$D/fix2_mutants/roworder.new")" "$E"
$M 11.2-outerend $C 'x: b.role === "in" ? right - w : left, y, w' 'x: b.role === "in" ? left : right - w, y, w' "$E"
$M 11.2-topedge $C 'x: b.role === "in" ? right - w : left, y, w' 'x: b.role === "in" ? right - w : left, y: box.y + BADGE_TOP, w' "$E"
$M 11.2-routenearest $C "$(cat "$D/fix2_mutants/pinorder.old")" "$(cat "$D/fix2_mutants/pinorder.new")" "$E"
$M 11.3-cutnoloop $C ' - (loop ? pillWidth(loop.text) + BADGE_GAP : 0);' ';' "$E"
$M 11.3-draworder $C "$(cat "$D/fix2_mutants/draworder.old")" "$(cat "$D/fix2_mutants/draworder.new")" "e2e:e2e/overlay.spec.ts e2e/colors.spec.ts --project chromium"
$M 11.3-nodimfocus $C '  :is(.legend-focus, .diagnostic-focus, .route-focus) .order-badge:not(.lit) { opacity: var(--dim); }
' '' "e2e:e2e/order.spec.ts --project chromium"
$M 11.3-nodimsearch $C '  .searching .order-badge:not(.search-hit):not(.search-under) { opacity: var(--dim); }
' '' "e2e:e2e/order.spec.ts --project chromium"
$M 11.4-blockpans $C '    if (e.target !== svg || e.button !== 0) return;' '    if (e.button !== 0) return;' "e2e:e2e/keys.spec.ts --project chromium"
$M 11.4-xacts src/App.svelte '    else if (e.key === "0") canvasView?.fit();' '    else if (e.key === "0" || name === "x") canvasView?.fit();' "e2e:e2e/keys.spec.ts --project chromium"
