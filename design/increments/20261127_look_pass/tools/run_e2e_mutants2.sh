#!/bin/bash
# The review's mutants of the look pass, each on the scratch copy (mutant_scratch.py's environment).
M="python3 $(dirname "$0")/mutant_scratch.py"
$M E3b-nomoveatall src/canvas/Canvas.svelte 'const hit = typeLabels.find(' 'const hit = ([] as typeof typeLabels).find(' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
$M E17-float src/canvas/Canvas.svelte 'const y = at.y - PILL_LIFT - BADGE_HEIGHT;' 'const y = at.y - PILL_LIFT - BADGE_HEIGHT - 10;' "e2e:e2e/routes.spec.ts e2e/overlay.spec.ts --project chromium"
