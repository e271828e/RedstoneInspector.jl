import subprocess,sys,re,shutil,os
os.chdir(os.environ['FRONTEND'])
A='src/App.svelte'; P='src/lib/prefix.ts'; N='src/lib/navigate.ts'
U='unit'
M=[
('z repeat not ignored',P,'  if (name === "z" && repeat) return { next: p };\n','',U),
('Escape no cancel (passes on)',P,'  if (name === "Escape") return { next: undefined };','  if (name === "Escape") return undefined;',U),
('hold ends after one key',P,'next: p.held ? { ...p, used: true } : undefined','next: undefined',U),
('tapped prefix never ends',P,'next: p.held ? { ...p, used: true } : undefined','next: { ...p, used: true }',U),
('modifiers drop the prefix',P,'  if (["Shift", "Alt", "AltGraph", "CapsLock"].includes(name)) return undefined;\n','',U),
('keyup read in its case',P,'key.toLowerCase() !== "z"','key !== "z"',U),
('unused hold ends at keyup',P,'return p.used ? undefined : { ...p, held: false };','return undefined;',U),
('used hold waits on after keyup',P,'return p.used ? undefined : { ...p, held: false };','return { ...p, held: false };',U),
('g forgets T',P,'g: ["g", "t", "T"]','g: ["g", "t"]',U),
('j walks links',N,'stops.flatMap((s, i) => (s.depth < 2 ? [i] : []))','stops.map((_, i) => i)',U),
('k from a link goes to its row',N,'const from = walk.filter((i) => i <= at).length - 1;\n    const to = walk[from < 0 ? 0 : key === "j" ? from + 1 : from - 1];','const from = walk.filter((i) => i <= at).length - 1;\n    const to = walk[from < 0 ? 0 : key === "j" ? from + 1 : stops[at].depth === 2 ? from : from - 1];',U),
('h on a section row folds its heading',N,'return { focus: to };\n}','return stops[to].open ? { toggle: to } : { focus: to };\n}',U),
('l does not open a closed heading',N,'if (s.open === false) return { toggle: at };\n','',U),
('l walks past the last link',N,'return next && (next.depth > s.depth || next.depth === 2) ? { focus: at + 1 } : undefined;','return next ? { focus: at + 1 } : undefined;',U),
('none focused: nothing',N,'walk[from < 0 ? 0 : key','walk[from < 0 ? -1 : key',U),
('h never collapses',N,'  if (s.open) return { toggle: at };\n','',U),
('unknown key passes on',A,'      if (p.command) run(p.command);\n      return;','      if (p.command) { run(p.command); return; }','keys'),
('keyup ignored in a field',A,'onkeyup={(e) => (prefix = releasePrefix(prefix, e.key))}','onkeyup={(e) => { if (!typing(e.target)) prefix = releasePrefix(prefix, e.key); }}','keys'),
('blur ends no hold',A,'  onblur={() => { if (prefix?.held) prefix = undefined; }}\n','','keys'),
('blur drops a pending prefix',A,'if (prefix?.held) prefix = undefined;','prefix = undefined;','keys'),
('Cmd and Ctrl end nothing',A,'    if (modified) prefix = undefined;\n','','keys'),
('Tab under a prefix cycles',A,' && (!prefix || typing(e.target))) {',') {','keys'),
('prefix with no model',A,'const p = session.model && !modified','const p = !modified','keys'),
('Enter always opens',A,'handled = !focusedStop() && !document.activeElement?.closest(".menu") && openSelected()','handled = openSelected()','cursor'),
('Enter on the menu entry opens',A,' && !document.activeElement?.closest(".menu")','','cursor'),
('Enter never opens',A,'handled = !focusedStop() && !document.activeElement?.closest(".menu") && openSelected()','handled = false','cursor'),
('no click handler',A,'  onclickcapture={onclick}\n','','cursor'),
('no row mapping',A,' ?? t.closest("tr, .line, li.edge")?.querySelector("button.row")','','cursor'),
('row mapping misses .line',A,'"tr, .line, li.edge"','"tr, li.edge"','cursor'),
('closed sections walked',A,'\n      .filter((e) => e.checkVisibility())','','cursor'),
('face links walked',A,'"td.links a, li.diagnostic a, .swatch ~ .swatch"','"li.diagnostic a, .swatch ~ .swatch"','cursor'),
('diagnostic links walked',A,'"td.links a, li.diagnostic a, .swatch ~ .swatch"','"td.links a, .swatch ~ .swatch"','cursor'),
('swatches walked',A,'"td.links a, li.diagnostic a, .swatch ~ .swatch"','"td.links a, li.diagnostic a"','cursor'),
('rows in sections flat',A,': e.closest("details") ? 1 : 0 }',': 0 }','cursor'),
('links no stops',A,':is(summary, button, a[href])`',':is(summary, button)`','cursor'),
('tab buttons are stops',A,'"section.drawer .tab-body"} :is','"section.drawer"} :is','cursor'),
('r does not open the drawer',A,'    if (region === "drawer") openDrawer(session.drawer.tab);\n    else if (region','    if (region','cursor'),
('q e do not expand',A,'    else if (region !== "canvas" && prefs.collapsed[region]) toggleCollapsed(region);\n','','cursor'),
('own region key drops the cursor',A,'    if (session.focus === region && focusedStop()) return;\n','','cursor'),
('own region key keeps any control',A,'if (session.focus === region && focusedStop()) return;','if (session.focus === region) return;','cursor'),
('gt does not wrap',A,'TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length]','TABS[Math.max(0, Math.min(3, TABS.indexOf(tab) + step))]','cursor'),
('gt steps a closed drawer',A,'openDrawer(open ? TABS','openDrawer(true ? TABS','cursor'),
('gT as gt',A,'stepTab(command === "gt" ? 1 : -1)','stepTab(1)','cursor'),
('gg as G',A,'else if (command === "gg") toEnd(false);','else if (command === "gg") toEnd(true);','cursor'),
('G takes the last control',A,'const walk = walkOf(all.map(asStop));\n      focusStop(all[walk[last ? walk.length - 1 : 0]]);','focusStop(all[last ? all.length - 1 : 0]);','cursor'),
('tree gg G nothing',A,'if (region === "tree" && model?.tree) {','if (region === "tree" && false) {','cursor'),
('zz in the tree centres the canvas',A,'    if (region !== "canvas") {\n      const at = region === "tree"','    if (region !== "canvas" && region !== "tree") {\n      const at = region as any === "tree"','cursor'),
('zz nearest',A,'at?.scrollIntoView({ block: "center"','at?.scrollIntoView({ block: "nearest"','cursor'),
('zh pans from a pane',A,'    const region = session.focus ?? "canvas";\n    const box =','    const region = "canvas" as Region;\n    const box =','cursor'),
('d a whole page',A,'box.clientHeight / 2 : region','box.clientHeight : region','cursor keys'),
('pane step 48',A,'region === "canvas" ? PAN_STEP : SCROLL_STEP;','PAN_STEP;','cursor'),
('/ always the search',A,'focusFilter() || focusSearch()','focusSearch()','cursor'),
('/ goes to the filter from every region',A,'session.focus === "drawer" ? document','true ? document','cursor'),
('filter text not selected',A,'    input?.select();\n    return !!input;','    return !!input;','cursor'),
('filter Escape clears',"src/frame/Drawer.svelte",'    e.preventDefault();\n    e.currentTarget.closest','    e.currentTarget.closest','cursor'),
('filter Escape keeps the focus',"src/frame/Drawer.svelte",'    e.currentTarget.closest<HTMLElement>("section.drawer")?.focus();\n','','cursor'),
('open level its own branch',"src/frame/Detail.svelte",'    {#if "signature" in facts}\n','    {#if facts.kind === "level"}{@render header(facts.segment, facts.displayName, facts.path, false, false, true)}{@render node(facts)}\n    {:else if "signature" in facts}\n','cursor'),
('no face button',"src/frame/Detail.svelte",'<button class="row">{f.name}</button>','{f.name}','cursor'),
('ring on focus-visible',"src/frame/Frame.svelte",':is(summary, button, a):focus)',':is(summary, button, a):focus-visible)','cursor'),
('no ring on links and buttons',"src/frame/Frame.svelte",':is(summary, button, a):focus)',':is(summary):focus)','cursor'),
('swatch ring at 1 px',"src/frame/tabs/Chart.svelte",' --ring-offset: 3px;','','cursor'),
('no scroll margin',"src/frame/Frame.svelte",' scroll-margin: 8px;','','cursor'),
('stop not scrolled into view',A,'    e?.scrollIntoView({ block: "nearest", inline: "nearest" });\n','','cursor'),
('menu entry takes no focus',"src/canvas/Canvas.svelte",'    tick().then(() => menuEntry?.focus());\n','','cursor'),
('menu gives nothing back',"src/canvas/Canvas.svelte",'      if (beforeMenu instanceof HTMLElement) beforeMenu.focus();\n','','cursor'),
('help: no d u',A,'else if (name === "d" || name === "u") page.scrollBy','else if (name === "D") page.scrollBy','help'),
('help: no gg',A,'if (p.command === "gg") page.scrollTo(0, 0);','','help'),
('help: no G',A,'else if (name === "G") page.scrollTo(0, page.scrollHeight);','','help'),
('help: z a prefix',A,'prefix || name === "g" ? pressPrefix','prefix || name === "g" || name === "z" ? pressPrefix','help'),
('help open keeps the prefix',A,'      prefix = undefined;\n      if (shown)','      if (shown)','help'),
('status bar shows no prefix',A,' prefix={prefix?.key}','','keys'),
('arrows pan from panes',A,'else if (dir && (region === "detail"','else if (vim && (region === "detail"','cursor'),
('Shift-arrow in panes dropped',A,'const arrow: Direction | undefined = ARROWS[e.key];','const arrow: Direction | undefined = e.shiftKey ? undefined : ARROWS[e.key];','cursor'),
('Shift-j not from a stop',A,'else if (name === "J") openSelected();','else if (name === "J") !focusedStop() && openSelected();','cursor'),
('zi zo swapped',A,'else if (command === "zi") canvasView?.zoomBy(ZOOM_STEP);','else if (command === "zi") canvasView?.zoomBy(1 / ZOOM_STEP);','keys cursor'),
('no prefixes table',"src/frame/Help.svelte",'<table class="prefixes">','<table class="prefix">','help'),
('r also the color mode',A,'else if (name === "r") focusRegion("drawer");','else if (name === "r") { focusRegion("drawer"); setMode("rate"); }','keys'),
('X puts back one',A,'undrag(name === "X")','undrag(false)','drag'),
('c absent',A,'else if (name === "c") setMode','else if (name === "C") setMode','keys'),
('removal rule gone (focusout)',A,'if (!t.isConnected && (!a || a === document.body)) rootOf(region)?.focus','if (false && (!a || a === document.body)) rootOf(region)?.focus','cursor'),
('push takes the focus',A,'        if (!document.activeElement || document.activeElement === document.body) rootOf(held)?.focus();','        rootOf(held)?.focus();','cursor'),
('FF observer gone',A,'if (held && !held.el.isConnected && (!a','if (held && false && (!a','cursor'),
]
only=sys.argv[1:]
for name,f,a,b,route in M:
    if only and not any(o in name for o in only): continue
    s=open(f).read()
    if s.count(a)!=1: print('NOMATCH',s.count(a),name); continue
    shutil.copy(f,'/tmp/mut.bak')
    try:
        open(f,'w').write(s.replace(a,b))
        if route==U:
            r=subprocess.run('npx vitest run src/lib/prefix.test.ts src/lib/navigate.test.ts',shell=True,capture_output=True,text=True)
            fails=re.findall(r'(?:FAIL|×)\s+(.*)',r.stdout+r.stderr)
        else:
            bld=subprocess.run('npm run build',shell=True,capture_output=True,text=True)
            if bld.returncode: print('BUILD',name,bld.stderr[-300:]); continue
            r=subprocess.run('npx playwright test --project='+('firefox ' if 'FF' in name else 'chromium ')+' '.join(x+'.spec.ts' for x in route.split()),shell=True,capture_output=True,text=True)
            fails=sorted(set(re.findall(r'✘\s+\d+ \[\w+\] › (e2e/\S+? › .{0,70})',r.stdout)))
        print(('RED  ' if fails else 'SURVIVED ')+name+' :: '+' | '.join(x.strip()[:110] for x in fails[:3]),flush=True)
    finally:
        shutil.copy('/tmp/mut.bak',f)
