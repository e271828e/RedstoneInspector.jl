#!/bin/bash
# The fixer's mutants of the cold review's fixes, each on the scratch copy (mutant_scratch.py's environment).
M="python3 $(dirname "$0")/mutant_scratch.py"
C=src/canvas/Canvas.svelte
$M F1-nobound $C '        if (edge !== unmoved && (east ? edge + w - at.x : at.x - (edge - w)) > reach) edge = unmoved;
' '' "e2e:e2e/pills.spec.ts e2e/routes.spec.ts -g 'closed_loop:|failure_nested:|timing:|route.s pills, the type labels on' --project chromium"
$M F1-wholewire $C 'Math.abs(east ? r[1].x - r[0].x : r.at(-1)!.x - r.at(-2)!.x)' 'Math.abs(r.at(-1)!.x - r[0].x)' "e2e:e2e/pills.spec.ts e2e/routes.spec.ts -g 'closed_loop:|failure_nested:|timing:|route.s pills, the type labels on' --project chromium"
$M E3b-nomoveatall $C 'const hit = typeLabels.find(' 'const hit = ([] as typeof typeLabels).find(' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
$M F2-threshold src/canvas/router.ts 'if (b.x - a.x >= 2 * STUB) {' 'if (b.x - a.x >= from + STUB) {' "npx vitest run src/canvas/router.test.ts"
$M F3-labelsaside src/canvas/router.ts 'producerStub(labels ? g.labels.get(portId(w.from.block, "out", w.from.port)) : undefined)' 'producerStub(g.labels.get(portId(w.from.block, "out", w.from.port)))' "npx vitest run src/canvas/router.test.ts" "e2e:e2e/drag.spec.ts -g 'F3' --project chromium"
$M F3-notoggle $C '      shown = { ...shown, geometry: rerouteDragged(shown.geometry, shown.level, shown.sizes, dragged) };
      onlayout?.(shown.geometry, dragged);
' '' "e2e:e2e/drag.spec.ts -g 'F3' --project chromium"
$M F3-heldstale $C 'draw(level, sizes, rerouteDragged(saved.geometry, level, sizes, saved.dragged), saved.dragged, v)' 'draw(level, sizes, saved.geometry, saved.dragged, v)' "e2e:e2e/drag.spec.ts -g 'F3' --project chromium"
$M F4-lift3 $C 'const PILL_LIFT = 4;' 'const PILL_LIFT = 3;' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
$M F4-float $C 'const y = at.y - PILL_LIFT - BADGE_HEIGHT;' 'const y = at.y - PILL_LIFT - BADGE_HEIGHT - 10;' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
$M F4-routenearer $C 'list.push({ ...q, block: parsePortId(port).block, port });' 'list[q.role === "route" ? "unshift" : "push"]({ ...q, block: parsePortId(port).block, port });' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
$M F4-helpcross src/frame/Help.svelte 'd="M{60 - CROSS},{24 - CROSS} L{60 + CROSS},{24 + CROSS} M{60 - CROSS},{24 + CROSS} L{60 + CROSS},{24 - CROSS}"' 'd="M57,21 L63,27 M57,27 L63,21"' "e2e:e2e/help.spec.ts --project chromium"
