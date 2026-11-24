# Reverts each change of the notation bump alone and says whether a check turns red.
#   python3 -I mutants.py <scratch copy of frontend/>
# The copy needs src, e2e, fixtures, schema, the configs, index.html, public, MAP.md, a node_modules
# symlink, and the repo's Project.toml beside it. Never run it on the tree itself.
import os, re, subprocess, sys

os.chdir(sys.argv[1])
UNIT = [
('src/lib/timing.ts','baseMultiple(t.D), tau: baseMultiple(t.phi)','baseMultiple(t.phi), tau: baseMultiple(t.D)'),
('src/lib/timing.ts','dt: seconds(mul(q(t.D), dt))','dt: seconds(mul(q(t.D + 1), dt))'),
('src/lib/timing.ts','Da: t.D, phia: t.phi','Da: t.phi, phia: t.D'),
('src/lib/timing.ts','D0: counts.D, phi0: counts.phi,','D0: counts.phi, phi0: counts.D,'),
('src/lib/timing.ts','(${anchorName(e.anchor)})`','${subscript(e.anchor)}`'),
('src/lib/timing.ts','label: `D₀ ${r.D} · Φ₀','label: `D ${r.D} · Φ'),
('src/lib/timing.ts','`Dₛ = ${D}`','`D = ${D}`'),
('src/lib/timing.ts','`Φₛ = ${phi}`','`φ = ${phi}`'),
('src/lib/timing.ts','`Dₐ = ${t.D}`','`m = ${t.D}`'),
('src/lib/timing.ts','`Φₐ = ${t.phi}`','`c = ${t.phi}`'),
('src/lib/timing.ts','`D₀ = ${counts.D}`','`D = ${counts.D}`'),
('src/lib/timing.ts','`Φ₀ = ${counts.phi}`','`Φ = ${counts.phi}`'),
('src/lib/timing.ts','(t.phi - enc.timing.phi) / enc.timing.D','(t.phi - enc.timing.phi) / enc.timing.phi'),
('src/lib/timing.ts','"D" in link ? `${link.key} = Relative(${link.D}','"K" in link ? `${link.key} = Relative(${(link as any).K}'),
('src/lib/timing.ts','Dₐ ${D} · Φₐ ${phi}`','m ${D} · c ${phi}`'),
('src/lib/timing.ts','phi: A.phi + phi * A.D','phi: A.phi + phi'),
('src/lib/timing.ts','title: `D₀ ${counts.D} · Φ₀','title: `D ${counts.D} · Φ'),
('src/lib/timing.ts','due: (n) => n % D === phi','due: (n) => n % D === 0n'),
('src/lib/rates.ts','[t.anchor, t.D, t.phi]','[t.anchor, t.phi, t.D]'),
('src/lib/focus.ts','[n.timing.anchor, n.timing.D, n.timing.phi]','[n.timing.anchor, n.timing.phi, n.timing.D]'),
('src/lib/focus.ts','tripleKey([anchor, D, phi])','tripleKey([anchor, phi, D])'),
('src/lib/timing.ts','n.timing.anchor, n.timing.D, n.timing.phi]','n.timing.anchor, n.timing.phi, n.timing.D]'),
('src/lib/timing.ts','scope: "Its rate scope: Dₛ and Φₛ','scope: "Its rate scope: K and φ'),
('src/lib/timing.ts','timing: { anchor: 0, D: 1, phi: 0 } };','timing: { anchor: 0, D: 2, phi: 0 } };'),
]
BROWSER = [
('src/frame/tabs/Timing.svelte','<th>anchor</th><th>Dₐ</th><th>Φₐ</th>','<th>k</th><th>m</th><th>c</th>'),
('src/frame/tabs/Timing.svelte','<th>anchor</th><th>Δt</th><th>τ</th>','<th>k</th><th>Δtₖ</th><th>τₖ</th>'),
('src/frame/tabs/Timing.svelte','<td class="Da">{r.Da}</td>','<td class="Da">{r.phia}</td>'),
('src/frame/tabs/Timing.svelte','<td class="D0">{a.D}</td>','<td class="D0">{a.phi}</td>'),
('src/frame/tabs/Chart.svelte','cx={tickX(n, fit)}','cx={tickX(n + 1n, fit)}'),
('src/frame/tabs/Chart.svelte','data-n={n}','data-k={n}'),
('src/lib/help.ts','period: "Δt(i) = Dₐ(i) · Δt(a)"','period: "Δt(i) = Dₐ(i) · Δtₖ"'),
('src/lib/help.ts','["`Dₛ`, `Φₛ`"','["`K`, `φ`"'),
('src/lib/help.ts','`A₁ (key) · Dₐ · Φₐ`, and its','`Aₖ (key) · m · c`, and its'),
('src/lib/help.ts','compiled as `(a, Dₐ, Φₐ)`','compiled as `(Aₖ, m, c)`'),
('src/lib/timing.ts','scope: "Its rate scope: Dₛ and Φₛ','scope: "Its rate scope: K and φ'),
('src/frame/Help.svelte','<p>{@render text(LAW_LEAD)}</p>','<p>{LAW_LEAD}</p>'),
('src/frame/Help.svelte','"A₀ (base) · Dₐ 1 · Φₐ 0"','"A₀ (base) · m 1 · c 0"'),
]
UNIT_RUN = [["npx", "vitest", "run"]]
BROWSER_RUN = [["npx", "vite", "build"], ["npx", "playwright", "test", "timing.spec", "help.spec", "frames.spec", "analysis.spec", "--project=chromium"]]
for mutants, commands, count in [(UNIT, UNIT_RUN, r"Tests\s+(.*)"), (BROWSER, BROWSER_RUN, r"(?m)^\s+(\d+ (?:passed|failed))")]:
    for path, old, new in mutants:
        source = open(path).read()
        if source.count(old) != 1:
            print("BAD MUTANT", source.count(old), old); continue
        open(path, "w").write(source.replace(old, new))
        for command in commands: o = subprocess.run(command, capture_output=True, text=True)
        open(path, "w").write(source)
        found = re.findall(count, re.sub(r"\x1b\[[0-9;]*m", "", o.stdout + o.stderr))
        # a run that printed no count ran nothing, which is no survivor
        verdict = "NO RUN" if not found else "KILLED" if any("failed" in x for x in found) else "SURVIVED"
        print(verdict, old[:44], "=>", new[:34], found)
