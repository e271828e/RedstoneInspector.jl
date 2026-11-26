import os, subprocess, shutil, re, sys
os.chdir(os.environ["FRONTEND"])
C='src/canvas/Canvas.svelte'; R='src/lib/rates.ts'; T='src/lib/timing.ts'; H='src/frame/tabs/Chart.svelte'
M=[("order by step alone",R,"(a.at && b.at ? a.at.D - b.at.D || a.at.phi - b.at.phi : 0) || ",""),
("order by D0 alone",R,"a.at.D - b.at.D || a.at.phi - b.at.phi","a.at.D - b.at.D"),
("ties against the palette",R,"|| a.l.step - b.l.step","|| b.l.step - a.l.step"),
("continuous line last",R,"lines.unshift({ key","lines.push({ key"),
("no anchor on the line",C,'              <span class="anchor">{t.anchor}</span>\n',""),
("dt cell on a build too",C,'{#if deployed}<span class="dt">{t.dt}</span>{/if}','<span class="dt">{t.dt}</span>'),
("no dt on a deployment",C,'{#if deployed}<span class="dt">{t.dt}</span>{/if}',''),
("tooltip drops Da Phia",T,"; Dₐ ${D} · Φₐ ${phi}",";"),
("tooltip tau on a build",T,"${counts ? ` · τ ${tau}` : \"\"}","${` · τ ${tau}`}"),
("phase ignores the anchor's",T,"phi: A.phi + phi * A.D","phi: phi * A.D"),
("no height cap",C," max-height: calc(100% - 16px);",""),
("no inner scroll",C,"overflow: auto;\n    background: color-mix(in srgb, var(--bg) 90%","overflow: hidden;\n    background: color-mix(in srgb, var(--bg) 90%"),
("overflow visible, box capped",C,"overflow: auto;\n    background: color-mix(in srgb, var(--bg) 90%","\n    background: color-mix(in srgb, var(--bg) 90%"),
("wheel over the legend zooms",C,'el.addEventListener("wheel", wheel, { passive: false });','el.parentElement!.addEventListener("wheel", wheel, { passive: false });'),
("no scroll into view",C,'''querySelector('[aria-pressed="true"]')?.scrollIntoView''','''querySelector('[aria-pressed="none"]')?.scrollIntoView'''),
("fit ignores the box",C,"{ width, height }, FIT_PADDING, FIT_MAX_SCALE, box)","{ width, height }, FIT_PADDING, FIT_MAX_SCALE, undefined)"),
("four columns on a deployment",C,".legend.deployed ul { grid-template-columns: repeat(5, auto); }",""),
("swatch title without the triple",H," · Dₐ {D} · Φₐ {phi}",""),
]
for name,f,a,b in M:
    s=open(f).read(); assert s.count(a)==1,(name,s.count(a))
    shutil.copy(f,'/tmp/mut.bak')
    try:
        open(f,'w').write(s.replace(a,b))
        u=subprocess.run("npx vitest run src/lib 2>&1 | grep -E '^ *(FAIL|×)' | head -3",shell=True,capture_output=True,text=True).stdout
        subprocess.run("npm run build >/dev/null 2>&1",shell=True)
        e=subprocess.run("npx playwright test --project=chromium legend 2>&1 | grep -E '^  *\\[chromium\\]' | cut -c1-110",shell=True,capture_output=True,text=True).stdout
    finally: shutil.copy('/tmp/mut.bak',f)
    print("##",name,"\nU:",u.strip(),"\nE:",e.strip(),flush=True)
subprocess.run("npm run build >/dev/null 2>&1",shell=True)
