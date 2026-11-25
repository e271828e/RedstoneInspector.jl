import subprocess, sys, re, os
F = os.environ["FRONTEND"]
A, C, D, DR, FR, SB, CH, HE, NA, PR, RA, TI, SE = [f"src/{x}" for x in ("App.svelte","canvas/Canvas.svelte","frame/Detail.svelte","frame/Drawer.svelte","frame/Frame.svelte","frame/StatusBar.svelte","frame/tabs/Chart.svelte","frame/Help.svelte","lib/navigate.ts","lib/prefix.ts","lib/rates.ts","lib/timing.ts","frame/Search.svelte")]
K = "cursor keys help"; L = "legend focus timing overlay"
M = [
("enter presses the stop", A, "handled = !focusedStop() && !document", "handled = !document", K),
("enter presses the menu entry", A, "&& !document.activeElement?.closest(\".menu\") && openSelected()", "&& openSelected()", K),
("qwer keeps a cursor there", A, "    if (session.focus === region && focusedStop()) return;\n", "", K),
("r opens a closed drawer", A, "    if (region === \"drawer\") openDrawer(session.drawer.tab);\n    else if", "    if", K),
("q e expand a collapsed pane", A, "else if (region !== \"canvas\" && prefs.collapsed[region]) toggleCollapsed(region);", "", K+" frame"),
("/ filter", A, "focusFilter() || focusSearch()", "focusSearch()", K),
("/ filter only with the drawer focused", A, "session.focus === \"drawer\" ? document.querySelector<HTMLInputElement>(\"section.drawer input.filter\") : null", "document.querySelector<HTMLInputElement>(\"section.drawer input.filter\")", K+" drawer"),
("filter's text selected", A, "    input?.select();\n    return !!input", "    return !!input", K),
("gt opens a closed drawer on its tab", A, "openDrawer(open ? TABS[(", "openDrawer(true ? TABS[(", K),
("gt wraps", A, "(TABS.indexOf(tab) + step + TABS.length) % TABS.length", "Math.max(0, Math.min(TABS.length - 1, TABS.indexOf(tab) + step))", K),
("d u half", A, "box.clientHeight / 2 :", "box.clientHeight :", K),
("view acts on canvas with nothing focused", A, "const region = session.focus ?? \"canvas\";\n    const box", "const region = session.focus ?? \"tree\";\n    const box", K),
("zz centres in the pane", A, "block: \"center\", inline", "block: \"nearest\", inline", K),
("zz in the tree takes the row", A, "region === \"tree\" ? document.querySelector(\"nav.tree .row.selected\") : focusedStop()", "focusedStop()", K),
("help toggling drops a prefix", A, "      prefix = undefined;\n      if (shown)", "      if (shown)", K),
("cmd drops a prefix", A, "    if (modified) prefix = undefined;\n", "", K),
("a pending prefix takes Tab", A, "&& (!prefix || typing(e.target))) {", ") {", K),
("Tab leaves a field with a prefix pending", A, "(!prefix || typing(e.target))", "!prefix", K),
("no prefix without a model", A, "const p = session.model && !modified", "const p = !modified", K),
("no new prefix with Alt", A, "(prefix || !e.altKey) ? press", "true ? press", K),
("a pending prefix drops an Alt key", A, "(prefix || !e.altKey) ? press", "!e.altKey ? press", K),
("blur ends a hold alone", A, "if (prefix?.held) prefix = undefined;", "prefix = undefined;", K),
("blur ends a hold", A, "onblur={() => { if (prefix?.held) prefix = undefined; }}", "", K),
("keyup ends a hold", A, "onkeyup={(e) => (prefix = releasePrefix(prefix, e.key))}", "", K),
("click on the row elsewhere", A, " ?? t.closest(\"tr, .line, li.edge\")?.querySelector(\"button.row\")", "", K),
("click on an edge's row", A, "t.closest(\"tr, .line, li.edge\")", "t.closest(\"tr, .line\")", K),
("click focus moves no scroll", A, "stopsOf(region).find((s) => s === at)?.focus({ preventScroll: true });", "stopsOf(region).find((s) => s === at)?.focus();", K),
("the stop scrolls into view", A, "    e?.scrollIntoView({ block: \"nearest\", inline: \"nearest\" });\n", "", K),
("closed sections hold no stops", A, ".filter((e) => e.checkVisibility())", "", K),
("face links depth 2", A, "td.links a, li.diagnostic a", "li.diagnostic a", K),
("diagnostic links depth 2", A, "td.links a, li.diagnostic a, ", "td.links a, ", K),
("swatches depth 2", A, ", .swatch ~ .swatch\"", "\"", K),
("drawer stops of the tab body alone", A, "\"section.drawer .tab-body\"} :is", "\"section.drawer\"} :is", K),
("G takes the last walked", A, "focusStop(all[walk[last ? walk.length - 1 : 0]]);", "focusStop(all[last ? all.length - 1 : 0]);", K),
("gg G nothing on the canvas", A, "    if (region === \"tree\" && model?.tree) {\n      const rows", "    if (region !== \"detail\" && region !== \"drawer\" && model?.tree) {\n      const rows", K),
("held z's repeat", PR, "  if (name === \"z\" && repeat) return { next: p };\n", "", K),
("modifiers leave a prefix", PR, "  if ([\"Shift\", \"Alt\", \"AltGraph\", \"CapsLock\"].includes(name)) return undefined;\n", "", K),
("Escape cancels a prefix", PR, "  if (name === \"Escape\") return { next: undefined };\n", "", K),
("an unused hold waits", PR, "p.used ? undefined : { ...p, held: false }", "undefined", K),
("a used hold ends", PR, "p.used ? undefined : { ...p, held: false }", "{ ...p, held: false }", K),
("keyup in either case", PR, "key.toLowerCase() !== \"z\"", "key !== \"z\"", K),
("unknown second key dropped", PR, "  return { next: p.held ?", "  if (!SECOND[p.key].includes(name)) return undefined;\n  return { next: p.held ?", K),
("caps lock", PR, "e.shiftKey ? e.key.toUpperCase() : e.key.toLowerCase()", "e.key", K),
("j from a link goes on from its row", NA, "walk.filter((i) => i <= at).length - 1", "walk.indexOf(at)", K),
("l along links", NA, "(next.depth > s.depth || next.depth === 2)", "next.depth > s.depth", K),
("h collapses an open heading", NA, "  if (s.open) return { toggle: at };\n", "", K),
("h from a row to its heading", NA, "while (s.depth === 1 && stops[to].depth > 0) to--;", "", K),
("menu entry takes focus", C, "    tick().then(() => menuEntry?.focus());\n", "", K),
("menu gives focus back", C, "      if (beforeMenu instanceof HTMLElement) beforeMenu.focus();\n", "", K),
("legend line scrolls into view", C, "?.scrollIntoView({ block: \"nearest\" });\n  });\n\n  const viewBox", ";\n  });\n\n  const viewBox", L),
("legend capped", C, "max-height: calc(100% - 16px); overflow: auto;", "", L),
("legend dt on a deployment alone", C, "{#if deployed}<span class=\"dt\">", "{#if true}<span class=\"dt\">", L),
("deployment order", RA, "(a.at && b.at ? a.at.D - b.at.D || a.at.phi - b.at.phi : 0) || ", "", L),
("order by phi", RA, "a.at.D - b.at.D || a.at.phi - b.at.phi", "a.at.D - b.at.D", L),
("tooltip tau on a deployment alone", TI, "${counts ? ` · τ ${tau}` : \"\"}", " · τ ${tau}", L),
("tooltip anchor title first", TI, "title: `${anchorTitle(s, anchor)}; Dₐ", "title: `Dₐ", L),
("basePair phi law", TI, "phi: A.phi + phi * A.D", "phi: A.phi + phi", L),
("filter Escape keeps text", DR, "    e.preventDefault();\n    e.currentTarget.closest", "    e.currentTarget.closest", K),
("filter Escape to the drawer", DR, "    e.currentTarget.closest<HTMLElement>(\"section.drawer\")?.focus();\n", "", K),
("ring on :focus", FR, ":is(summary, button, a):focus)", ":is(summary, button, a):focus-visible)", K),
("scroll margin", FR, " scroll-margin: 8px;", "", K),
("prefix shown", SB, "{#if prefix}", "{#if false}", K),
("open level and block one branch", D, "{#if \"signature\" in facts}", "{#if facts.kind === \"level\"}{@render header(facts.segment, facts.displayName, facts.path, false, false, true)}{@render node(facts)}{:else if \"signature\" in facts}", K),
("face name button", D, "<td class=\"face-name\"><button class=\"row\">{f.name}</button></td>", "<td class=\"face-name\">{f.name}</td>", K),
("pressed swatch ring apart", CH, "cursor: pointer; --ring-offset: 3px;", "cursor: pointer;", K),
("pressed swatch shadow", CH, "box-shadow: 0 0 0 1px var(--bg), 0 0 0 3px var(--highlight);", "", K+" timing"),
("x undrags", A, "name === \"x\" || name === \"X\"", "name === \"u\" || name === \"U\"", "keys drag"),
("R toggles on its tab", A, "else if (name === \"R\") toggleDrawerKey();", "", "keys drawer"),
("help d u", A, "else if (name === \"d\" || name === \"u\") page.scrollBy(0, ((name", "else if (name === \"D\") page.scrollBy(0, ((name", K),
("help gg by the machine's repeat arg", A, "pressPrefix(prefix, name, e.repeat) : undefined;\n      if (p)", "pressPrefix(prefix, name) : undefined;\n      if (p)", K),
("help takes no z", A, "prefix || name === \"g\" ?", "prefix || name === \"g\" || name === \"z\" ?", K),
("shift-arrow as arrow", A, "const arrow: Direction | undefined = ARROWS[e.key];", "const arrow: Direction | undefined = e.shiftKey ? undefined : ARROWS[e.key];", K),
("Alt-arrow no cursor", A, "else if (e.altKey) handled = false;\n", "", K),
("search title", SE, " title=\"Search paths, types and face names; path:, type: or face: before a term narrows it to one of them\"", "", K),
("zz on canvas nothing from a pane", A, "    const region = session.focus ?? \"canvas\";\n    if (region !== \"canvas\") {\n      const at", "    const region = session.focus ?? \"canvas\";\n    if (region !== \"canvas\") { if (drawn) canvasView?.centre(drawn);\n      const at", K),
]
sel = sys.argv[1:]
def sh(c): return subprocess.run(c, shell=True, cwd=F, capture_output=True, text=True)
def run_tests(specs, proj):
    r = sh("npx playwright test --project=%s --max-failures=1 %s 2>&1" % (proj, " ".join(f"e2e/{s}.spec.ts" for s in specs.split())))
    m = re.findall(r"^\s*(?:\d+\)|✘)\s+(.*)$", r.stdout, re.M); return r.returncode, (m[-1] if m else r.stdout[-200:])
for i, (name, f, old, new, specs) in enumerate(M):
    if sel and str(i) not in sel: continue
    p = f"{F}/{f}"; src = open(p).read()
    if src.count(old) != 1: print(i, name, "NOMATCH", src.count(old), flush=True); continue
    if old == new: continue
    open(p, "w").write(src.replace(old, new))
    try:
        u = sh("npx vitest run 2>&1")
        um = re.findall(r"FAIL\s+(.*)", u.stdout)
        b = sh("npx vite build 2>&1")
        if b.returncode: print(i, name, "BUILD FAILS", b.stdout[-300:], flush=True); continue
        if um: print(i, name, "|", "unit: "+um[0][:120], "| red", flush=True); continue
        rc, m = run_tests(specs, "chromium"); fx = ""
        if rc == 0: rc, fx = run_tests(specs, "firefox"); m = "FIREFOX " + fx if rc else "-"
        print(i, name, "|", "unit: " + um[0][:120] if um else "unit -", "|", "e2e RED: " + m[:200] if rc else "e2e green both", "|", "SURVIVES" if rc == 0 and not um else "red", flush=True)
    finally: open(p, "w").write(src)
