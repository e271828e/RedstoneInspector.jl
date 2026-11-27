"""Increment 10b's mutants: one per rule the checks pin, each expected red.

Usage: python3 mutants_events.py <frontend dir> [name substrings...]

Each mutant swaps one exact text in one file, runs its route (the unit files, or
a build and the named Playwright specs in Chromium), prints RED or SURVIVED, and
restores the file from a copy kept beside this script, never from git.
"""
import os
import re
import shutil
import subprocess
import sys

FRONTEND = sys.argv[1]
ONLY = sys.argv[2:]
BACKUP = "<probes>/mutants/mutant.bak"
os.chdir(FRONTEND)

E = "src/lib/events.ts"
D = "src/lib/detail.ts"
S = "src/canvas/size.ts"
R = "src/lib/rates.ts"
C = "src/canvas/Canvas.svelte"
T = "src/frame/tabs/Events.svelte"
DR = "src/frame/Drawer.svelte"
DE = "src/frame/Detail.svelte"
SE = "src/state/session.svelte.ts"
H = "src/lib/help.ts"
U = "unit"
UNIT = "npx vitest run src/lib/events.test.ts src/canvas/size.test.ts src/lib/detail.test.ts src/lib/rates.test.ts src/state/session.test.ts"

M = [
    ("R pill takes its own click", C, '<g class="events-pill">', '<g class="events-pill" role="none" onclick={(e) => e.stopPropagation()} ondblclick={(e) => e.stopPropagation()}>', "events"),
    ("R pill drops at frames", C, 'svg[data-detail="frames"] text.segment { display: none; }', 'svg[data-detail="frames"] :is(text.segment, g.events-pill) { display: none; }', "events draw"),
    ("R pill stroke a wire color", C, '.events-pill rect { fill: var(--bg); stroke: var(--text);', '.events-pill rect { fill: var(--bg); stroke: var(--wire);', "events draw"),
    ("R pill no title", C, '<title>{events.title}</title>\n', '', "events"),
    ("R pill no right inset", C, '{@const x = box.width - BADGE_INSET - w}', '{@const x = box.width - w}', "events"),
    ("R pill not dimmed", C, '<g class="events-pill">', '<g class="events-pill" style="opacity: 1 !important">', "events"),
    ("R pane rows are stops", DE, '<td class="name"><code>{e.name}</code></td>', '<td class="name"><button class="row"><code>{e.name}</code></button></td>', "events"),
    ("R yes no swapped", E, '(localized ? "yes" : "no")', '(localized ? "no" : "yes")', "unit events"),
    ("R empty section on silent primitives", E, 'return c?.events.length ? groupOf(c) : undefined;', 'return c ? groupOf(c) : undefined;', "unit events"),
    ("R fact title empty", D, 'events: "State events declared by the primitives inside",', 'events: "",', "unit events"),
    ("R root path blank in tab", T, '<code>{g.path || "/"}</code>', '<code>{g.path}</code>', "events"),
    ("R bundle joined bare", DE, '.bundle.join(", ")', '.bundle.join(",")', "events"),
    ("R head tol first", E,
     '    ...(groups.length ? [item("firing_budget", `${firing_budget}`)] : []),\n    ...(groups.some((g) => g.events.some((e) => e.localized))\n      ? [item("localization_tol", `${localization_tol.toExponential()} of Δt_frame`), item("localization_budget", `${localization_budget}`)]\n      : []),',
     '    ...(groups.some((g) => g.events.some((e) => e.localized))\n      ? [item("localization_tol", `${localization_tol.toExponential()} of Δt_frame`), item("localization_budget", `${localization_budget}`)]\n      : []),\n    ...(groups.length ? [item("firing_budget", `${firing_budget}`)] : []),',
     "unit events"),
    ("R tol without its unit", E, '`${localization_tol.toExponential()} of Δt_frame`', '`${localization_tol.toExponential()}`', "unit events"),
    ("R reservation one inset", S, '2 * BADGE_INSET + pillWidth(top.events)', 'BADGE_INSET + pillWidth(top.events)', "unit events"),
    ("R tab path on every row", T, '{#if e.position === 1}<button class="row" title="Select the primitive"><code>{g.path || "/"}</code></button>{/if}',
     '{#if e.position === 1}<button class="row" title="Select the primitive"><code>{g.path || "/"}</code></button>{:else}<code>{g.path || "/"}</code>{/if}', "events"),
    ("R tab not walk order", E, '.components.filter((c) => c.events.length).map(groupOf)', '.components.filter((c) => c.events.length).map(groupOf).reverse()', "unit events"),
]


for name, f, a, b, route in M:
    if ONLY and not any(o in name for o in ONLY):
        continue
    s = open(f).read()
    if s.count(a) != 1:
        print("NOMATCH", s.count(a), name, flush=True)
        continue
    shutil.copy(f, BACKUP)
    try:
        open(f, "w").write(s.replace(a, b))
        fails = []
        if "unit" in route.split():
            r = subprocess.run(UNIT, shell=True, capture_output=True, text=True)
            fails += re.findall(r"(?:FAIL|×)\s+(.*)", r.stdout + r.stderr)
        specs = [x for x in route.split() if x != "unit"]
        if specs and not fails:
            bld = subprocess.run("npm run build", shell=True, capture_output=True, text=True)
            if bld.returncode:
                print("BUILD", name, bld.stderr[-300:], flush=True)
                continue
            r = subprocess.run("npx playwright test --project=chromium " + " ".join(f"e2e/{x}.spec.ts" for x in specs),
                               shell=True, capture_output=True, text=True)
            fails += sorted(set(re.findall(r"✘\s+\d+ \[\w+\] › (e2e/\S+? › .{0,80})", r.stdout)))
        print(("RED  " if fails else "SURVIVED ") + name + " :: " + " | ".join(x.strip()[:120] for x in fails[:3]), flush=True)
    finally:
        shutil.copy(BACKUP, f)
# the bundle left behind is the last mutant's: build the restored sources
subprocess.run("npm run build", shell=True, capture_output=True, text=True)
print("done", flush=True)
