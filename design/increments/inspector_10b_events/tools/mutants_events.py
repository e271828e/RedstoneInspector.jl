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
BACKUP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mutant.bak")
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
A = "src/App.svelte"
U = "unit"
UNIT = "npx vitest run src/lib/events.test.ts src/canvas/size.test.ts src/lib/detail.test.ts src/lib/rates.test.ts src/state/session.test.ts"

M = [
    # events.ts
    ("a failure has a section", E, 'if (d.kind === "deployment") return d.deployment.build.events;\n  return undefined;',
     'if (d.kind === "deployment") return d.deployment.build.events;\n  return { components: [] };', U),
    ("groups keep silent rows", E, '.components.filter((c) => c.events.length).map(groupOf)', '.components.map(groupOf)', U),
    ("numbers from 0", E, "position: i + 1,", "position: i,", U),
    ("policy read inverted", E, 'localized: e.policy === "localized"', 'localized: e.policy !== "localized"', U),
    ("the root counts nothing", E, 'path === "" || g.path === path', 'g.path === path', U),
    ("beneath unaligned to segments", E, 'g.path.startsWith(path + "/")', "g.path.startsWith(path)", U),
    ("a primitive's own not counted", E, '(g) => path === "" || g.path === path || ', '(g) => path === "" || ', U),
    ("a failure counts 0", E, "(eventsSection(model) ? eventsBeneath(model, \"\").events : undefined)", 'eventsBeneath(model, "").events', U),
    ("pill text always plural", E, 'text: count(g.events.length, "event", "events")', 'text: count(g.events.length, "events", "events")', U),
    ("pill title the format's word", E, '"not localized"', '"non_localized"', U),
    ("assembly title no primitives", E, '{ text, title: `${text} on ${count(b.primitives, "primitive", "primitives")} inside` }', "{ text, title: text }", U),
    ("assembly pill inverted", E, "if (!b.events) return undefined;", "if (b.events) return undefined;", U),
    ("firing_budget always", E, '...(groups.length ? [item("firing_budget", `${firing_budget}`)] : [])', 'item("firing_budget", `${firing_budget}`)', U),
    ("tolerance on any event", E, "...(groups.some((g) => g.events.some((e) => e.localized))", "...(groups.length", U),
    ("tolerance in fixed form", E, "localization_tol.toExponential()", "String(localization_tol)", U),
    # detail.ts
    ("no events fact", D, "    if (beneath) facts.events = beneath;\n", "", U),
    ("events fact at zero", D, "if (beneath) facts.events = beneath;", "facts.events = beneath;", U),
    ("no events table", D, "    if (events) facts.eventTable = events;\n", "", U),
    # session
    ("EVENTS collapsed at first", SE, 'new Set(["events", "parameters", "faces"])', 'new Set(["parameters", "faces"])', U),
    ("gt order: events before order", SE, '["diagnostics", "root-inputs", "timing", "order", "events"]', '["diagnostics", "root-inputs", "timing", "events", "order"]', "cursor"),
    # rates.ts
    ("extra past the ninth", R, "if (step !== undefined && step >= STEPS) {\n    text.push", "if (step !== undefined && step > STEPS) {\n    text.push", U),
    # size.ts
    ("no reservation", S, "body + 2 * PAD + GUTTER, topPillsWidth(top)));", "body + 2 * PAD + GUTTER));", "unit events"),
    ("reservation without the rate pill", S, "(top.rate === undefined ? 0 : pillWidth(top.rate) + BADGE_GAP)", "0", "unit events"),
    ("reservation without the gap", S, "pillWidth(top.rate) + BADGE_GAP)", "pillWidth(top.rate))", "unit events"),
    ("a rate pill alone reserves", S, "top.events === undefined ? 0 :", "top.events === undefined && top.rate === undefined ? 0 :", U),
    ("sizeLevel passes no pills", S, 'b.role === "in" || b.role === "out" ? {} : topPills(model, b.path)', "{}", "unit events"),
    ("topPills drops the rate pill", S, "rate: ratePill(model, path)?.text,", "rate: undefined,", "unit events"),
    # Canvas
    ("events pill in rate mode alone", C, "{@const events = eventsPill(model, b.path)}", '{@const events = mode === "rate" ? eventsPill(model, b.path) : undefined}', "events"),
    ("events pill at the left", C, "{@const x = box.width - BADGE_INSET - w}", "{@const x = BADGE_INSET}", "events"),
    ("events pill below the edge", C, "<rect x={x} y={BADGE_TOP} width={w}", "<rect x={x} y={0} width={w}", "events"),
    # Detail.svelte
    ("EVENTS after PARAMETERS", DE, '  {#if f.eventTable}{@render section("events", events)}{/if}\n  {#if f.parameters.length}{@render section("parameters", parameters)}{/if}\n',
     '  {#if f.parameters.length}{@render section("parameters", parameters)}{/if}\n  {#if f.eventTable}{@render section("events", events)}{/if}\n', "events"),
    ("no bundle line", DE, '<p class="bundle"', '<p class="bundl"', "events"),
    ("events fact before wires", DE, '    {#if f.events !== undefined}\n      <dt title={FACT_TITLES.events}>events</dt>\n      <dd data-fact="events">{f.events}</dd>\n    {/if}\n', "", "events"),
    # Drawer
    ("events tab before order", DR, '    { tab: "order", label: "Execution order" },\n    { tab: "events", label: "Events" },', '    { tab: "events", label: "Events" },\n    { tab: "order", label: "Execution order" },', "events"),
    ("count at zero", DR, "events: events ? events : undefined,", "events,", "events"),
    # Events.svelte
    ("ring on the button", T, "  table.events tbody.group button.row:focus { outline: none; }\n", "", "events"),
    ("no ring on the group", T, "  tbody.group:has(button.row:focus) { outline: 2px solid var(--highlight); outline-offset: 1px; }\n", "", "events"),
    ("a stop per row", T, "{#if e.position === 1}<button", "{#if true}<button", "events"),
    ("later rows take no click", T, '<tbody class="group" data-path={g.path} onclick={s && rowClick(() => onrow(s))}>',
     '<tbody class="group" data-path={g.path}>', "events"),
    ("the empty states swapped", T, "No events: the build did not reach them.", "No state events.", "events"),
    ("no head", T, "  {#if head?.length}<HeadList lines={[head]} />{/if}\n", "", "events"),
    # help
    ("no help term", H, '    key: "events", term: "events pill", sample: "events",', '    key: "events-gone", term: "events pill", sample: "events",', "help events"),
    # the fixer's: the review's F1, F2, F3 to F6, R6 and the group's scroll
    ("fix: long names unbroken", DE, "  .events .name { overflow-wrap: anywhere; min-width: 8ch; }\n", "", "events"),
    ("fix: a later row's click focuses nothing", A, 'const row = t.closest("tbody.group") ?? t.closest("tr, .line, li.edge");',
     'const row = t.closest("tr, .line, li.edge");', "events"),
    ("fix: the button scrolled, not the group", A, '(e?.closest("tbody.group") ?? e)?.scrollIntoView(', "e?.scrollIntoView(", "events"),
    ("fix: the pane's localized head untitled", DE, "<th title={LOCALIZED_TITLE}>localized</th>", "<th>localized</th>", "events"),
    ("fix: the tab's localized head untitled", T, "<th title={LOCALIZED_TITLE}>localized</th>", "<th>localized</th>", "events"),
    ("fix: the pill takes its own click", C, '<g class="events-pill">', '<g class="events-pill" role="none" onclick={(e) => e.stopPropagation()}>', "events"),
    ("fix: the pill hidden at frames", C, ".events-pill rect { fill: var(--bg); stroke: var(--text); stroke-width: 1; }",
     '.events-pill rect { fill: var(--bg); stroke: var(--text); stroke-width: 1; }\n  svg[data-detail="frames"] .events-pill { display: none; }', "events"),
    ("fix: the pill never dims", C, '<g class="events-pill">', '<g class="events-pill" style="opacity: 1">', "events"),
    ("fix: the root's path blank", T, '{g.path || "/"}', '{g.path || ""}', "events"),
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
