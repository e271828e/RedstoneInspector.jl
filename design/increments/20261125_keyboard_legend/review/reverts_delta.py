import subprocess,re
A="src/App.svelte"; C="src/canvas/Canvas.svelte"
M=[("F1 effect refocus",A,"      if (stop.isConnected && document.activeElement === document.body) stop.focus({ preventScroll: true });\n","","cursor"),
("F1 push refocus",A,"        if (stop?.isConnected) stop.focus({ preventScroll: true });\n        else rootOf(held)?.focus();","        rootOf(held)?.focus();","cursor"),
("F2 drag return",A,"    if (!stop && row && dragged(e, row)) return;\n","","cursor analysis"),
("F4 own scroll",C,"    if (top < box.scrollTop) box.scrollTop = top;\n    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;","    line.scrollIntoView({ block: \"nearest\" });","legend"),
("F5 menu blur",C," onblur={menuBlur}","","cursor"),
("F3 refusal",A,"      refusal = r.reason;\n      prefix = undefined;","      refusal = r.reason;","keys"),
("tree gg scroll",A,"      tick().then(() => document.querySelector(\"nav.tree .row.selected\")?.scrollIntoView({ block: \"nearest\" }));\n","","cursor")]
for n,f,a,b,s in M:
    src=open(f).read(); assert src.count(a)==1,n
    open(f,"w").write(src.replace(a,b))
    try:
        subprocess.run("npx vite build",shell=True,capture_output=True)
        out=""
        for proj in ["chromium","firefox"]:
            r=subprocess.run("npx playwright test --project=%s %s"%(proj," ".join("e2e/%s.spec.ts"%x for x in s.split())),shell=True,capture_output=True,text=True)
            fails=sorted(set(re.findall(r"✘\s+\d+ \[\w+\] › (e2e/\S+? › .{0,80})",r.stdout)))
            out+=" [%s] %s"%(proj,("RED "+" | ".join(fails[:2])) if fails else "green")
        print(n,"::",out,flush=True)
    finally: open(f,"w").write(src)
