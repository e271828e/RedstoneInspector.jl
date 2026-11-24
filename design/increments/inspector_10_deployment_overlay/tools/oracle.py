# Increment 10's oracle: every derivation the page makes of a deployment's timing, repeated over the
# committed fixtures by the record's definitions (deployment_overlay.md answers 3, 5, 6, 8 to 11, 13 to 16),
# independent of the page's modules, and checked against the core's own text in show/ (crosscheck.jl).
#   python3 -I oracle.py <worktree>
# Writes <fixture>.txt per fixture, links.txt, draw.txt and checks.txt beside itself.
import glob, json, os, re, sys
from fractions import Fraction
from math import gcd, lcm, ceil, floor

REPO = sys.argv[1]
FIX = os.path.join(REPO, "frontend", "fixtures")
HERE = os.path.dirname(os.path.abspath(__file__))
SHOW = os.path.join(HERE, "show")
THRESHOLD, PITCH = 1000, 6
checks = []


def check(cond, what):
    checks.append(("ok  " if cond else "FAIL") + " " + what)


def check_show(shown, cond, what):
    """A comparison with the core's text, skipped where the core printed none (a failed build)."""
    if shown is not None: check(cond, what)


fr = lambda r: Fraction(r["num"], r["den"])
SUB = "₀₁₂₃₄₅₆₇₈₉"
SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹"
sub = lambda k: "".join(SUB[int(c)] for c in str(k))
sup = lambda p: "" if p == 1 else "".join(SUP[int(c)] for c in str(p))


def secs(q):
    """Seconds as the page prints them: 0, 1/50 s, 3 s."""
    if q == 0: return "0"
    return f"{q.numerator} s" if q.denominator == 1 else f"{q.numerator}/{q.denominator} s"


def base_mult(n):
    """A multiple of the symbolic base tick: 0, Δt_base, 2·Δt_base."""
    return "0" if n == 0 else "Δt_base" if n == 1 else f"{n}·Δt_base"


def jl(q):
    """A Rational as Julia prints it."""
    return f"{q.numerator}//{q.denominator}"


def frac_lcm(a, b):
    """The least common multiple of two positive fractions in lowest terms."""
    return Fraction(lcm(a.numerator, b.numerator), gcd(a.denominator, b.denominator))


def structure_of(d):
    k = d["kind"]
    if k == "build": return d["build"]["structure"]
    if k == "deployment": return d["deployment"]["build"]["structure"]
    return d["failure"].get("structure")


def parent_of(path):
    return None if path == "" else path.rsplit("/", 1)[0] if "/" in path else ""


def strict_ancestors(path):
    out, p = [], parent_of(path)
    while p is not None:
        out.append(p); p = parent_of(p)
    return out  # nearest first


def anchor_label(s, k):
    return f"A{sub(k)} (base)" if k == 0 else f"A{sub(k)} ({s['anchors'][k - 1]['key']})"


def scope_label(path):
    return "the root" if path == "" else path


def entry_text(link):
    if "K" in link: return f"{link['key']} = Relative({link['K']}, {link['phi']})"
    return f"{link['key']} = Absolute({jl(fr(link['dt']))}, {jl(fr(link['tau']))})"


def terminal_consumers(s, byp, face_path, port, side):
    """The terminal consumers fed from a face: primitive inputs and root outputs (walk over the wires)."""
    out = []
    # the level the face feeds into: an input face of an assembly feeds its own level; an output face feeds its parent's
    if side == "in":
        level, src = face_path, {"path": face_path, "port": port}
    else:
        level, src = parent_of(face_path), {"path": face_path, "port": port}
        if level is None: return [("", port, "root-output")]
    node = byp[level]
    for w in node["wires"]:
        if w["from"] != src: continue
        to = w["to"]
        if to["path"] == level:  # the level's own output
            if level == "": out.append(("", to["port"], "root-output"))
            else: out += terminal_consumers(s, byp, level, to["port"], "out")
        else:
            child = byp[to["path"]]
            if child["class"] == "primitive": out.append((to["path"], to["port"], "primitive"))
            else: out += terminal_consumers(s, byp, to["path"], to["port"], "in")
    return out


def palette_order(s, byp, children):
    """tripleOrder by its definition: every drawn block's triple, anchor 0 first, then exact period, anchor, m, c."""
    def clocks(path):
        n = byp[path]
        if n["class"] == "primitive":
            return [(n["timing"]["anchor"], n["timing"]["m"], n["timing"]["c"])] if n["tier"] == "discrete" else []
        out = []
        for c in children.get(path, []): out += clocks(c)
        return out
    seen = set()
    for n in s["nodes"]:
        if n["path"] == "" and n["class"] != "primitive": continue
        cs = set(clocks(n["path"]))
        if n["class"] == "primitive":
            if cs: seen |= cs
        elif len(cs) == 1: seen |= cs
    def period(t):
        return Fraction(-1) if t[0] == 0 else fr(s["anchors"][t[0] - 1]["dt"]) * t[1]
    return sorted(seen, key=lambda t: (period(t), t[0], t[1], t[2]))


def link_classes(s):
    rows = []
    for t in s["types"]:
        core = t["name"].startswith("Redstone.")
        module = t["name"][: t["name"].rfind(".")]
        for m in re.finditer(r"\[([^\]]+)\]\(@ref(?:\s+([^)\s]+))?\s*\)", t.get("docstring", "")):
            text, target = m.group(1), m.group(2)
            if target is not None and target.startswith("Redstone."):
                rows.append((t["name"], text, target, "target read", f"api/#{target}"))
            elif target is not None and target.startswith("g-") and core:
                rows.append((t["name"], text, target, "glossary", f"glossary/#{target}"))
            elif target is None and core:
                name = text.strip("`")
                rows.append((t["name"], text, "", "joined", f"api/#{name if '.' in name else module + '.' + name}"))
            else:
                rows.append((t["name"], text, target or "", "text", ""))
    return rows


def show_text(name):
    p = os.path.join(SHOW, name + ".txt")
    return open(p).read() if os.path.exists(p) else None


def squash(line):
    return re.sub(r"\s+", " ", line.strip())


def oracle(name, d):
    out = []
    w = out.append
    s = structure_of(d)
    shown = show_text(name)
    shown_lines = [squash(x) for x in shown.splitlines()] if shown else []
    w(f"# {name} ({d['kind']})")
    # diagnostics: a failure's, then the build's warnings, then a deployment's own (answer 4)
    diag = []
    if d["kind"] == "failure":
        diag += [("failure", x) for x in d["failure"]["diagnostics"]] + [("failure", x) for x in d["failure"]["warnings"]]
    else:
        b = d["build"] if d["kind"] == "build" else d["deployment"]["build"]
        diag += [("build", x) for x in b["warnings"]]
    if d["kind"] == "deployment": diag += [("deployment", x) for x in d["deployment"]["warnings"]]
    w(f"diagnostics: {len(diag)} rows, {sum(x['severity'] == 'error' for _, x in diag)} errors")
    for i, (src, x) in enumerate(diag):
        lines = x["message"].split("\n")
        w(f"  [{i}] {src} {x['severity']} {x['kind']} at {scope_label(x['path'])}: {lines[0]} ({len(lines)} lines)")
    if s is None:
        w("no structure"); return out
    byp = {n["path"]: n for n in s["nodes"]}
    children = {}
    for n in s["nodes"]:
        if n["path"] != "": children.setdefault(parent_of(n["path"]), []).append(n["path"])
    dep = d["deployment"] if d["kind"] == "deployment" else None
    base = fr(dep["dt_base"]) if dep else None
    frame = fr(dep["dt_frame"]) if dep else None
    sch = dep["schedule"] if dep else None
    counts = [(1, 0)] + [(a["D"], a["phi"]) for a in sch["anchors"]] if dep else None

    # the head list (answer 9)
    if dep:
        hmax = fr(dep["h_max"]); hmin = fr(dep["h_min"]) if "h_min" in dep else None
        lower = ceil(frame / hmax)
        steps = f"{lower} to {max(lower, floor(frame / hmin))}, as proposed" if dep["algorithm"]["proposes"] else f"{lower}"
        split = [r["path"] for r in sch["rows"] if (r["D"] * base / frame).denominator != 1 or (r["phi"] * base / frame).denominator != 1]
        w("head:")
        w(f"  Δt_frame {secs(frame)}; Δt_base {secs(base)}; h_max {secs(hmax)}" + (f"; h_min {secs(hmin)}" if hmin else "")
          + f"; algorithm {dep['algorithm']['text']}; attempt_budget {dep['attempt_budget']}")
        label = "steps per unsplit frame" if split else "steps per frame"
        w(f"  {label}: {steps}" + (f"; rows that split frames: {', '.join(split)}" if split else ""))
        core = f"{label}: {steps}" + (f"; due instants of {', '.join(p or 'root' for p in split)} split frames" if split else "")
        check_show(shown, squash("steps: " + core) in shown_lines, f"{name}: the steps line is show's: {core}")
    # the anchors table with the pool's factors (answers 6 and 9)
    g = s["grid"]
    period_factor = {e["anchor"]: e["factor"] for e in g["pool"] if e["kind"] == "period"}
    offset_factor = {e["anchor"]: e["factor"] for e in g["pool"] if e["kind"] == "offset"}
    w("anchors:")
    if "admissible" in g:
        adm = fr(g["admissible"])
        if dep:
            k = adm / base
            check(k.denominator == 1, f"{name}: Δt_base divides the coarsest admissible")
            line = f"Δt_base: {secs(base)}, the coarsest admissible" + ("" if k == 1 else f" {secs(adm)} divided by {k}")
            core = f"Δt_base: {jl(base)}, the coarsest admissible" + ("" if k == 1 else f" {jl(adm)} divided by {k}")
            check_show(shown, squash("admissible line: " + core) in shown_lines, f"{name}: the comparison is show's: {core}")
        else:
            line = f"coarsest admissible Δt_base: {secs(adm)}"
        w(f"  line: {line}")
    w(f"  A₀ (base) | Δtₖ {secs(base) if dep else 'Δt_base'} | τₖ 0" + (" | Dₖ 1 | Φₖ 0" if dep else "") + " | declared in —")
    for k, a in enumerate(s["anchors"], 1):
        dt, tau = fr(a["dt"]), fr(a["tau"])
        cells = f"{anchor_label(s, k)} | Δtₖ {secs(dt)} ×{period_factor[k]} | τₖ {secs(tau)}" + (f" ×{offset_factor[k]}" if k in offset_factor else "")
        if dep:
            D, phi = counts[k]
            check(dt == D * base and tau == phi * base, f"{name}: A{k}'s counts are Δtₖ/Δt_base and τₖ/Δt_base")
            cells += f" | Dₖ {D} | Φₖ {phi}"
            check_show(shown, any(squash(f"A{sub(k)} {jl(dt)} {jl(tau)} {D} {phi}") == x for x in shown_lines), f"{name}: A{k}'s row is show's")
        w(f"  {cells} | declared in {scope_label(a['scope'])}, key {a['key']}")
    # the grid report's lines under the table
    report = []
    for i, e in enumerate(g["pool"], 1):
        if "alternatives" in e:
            alts = " or ".join(secs(fr(x)) for x in e["alternatives"])
            report.append(f"{anchor_label(s, e['anchor'])}: declaring τ{sub(e['anchor'])} = {alts} keeps {secs(e['factor'] * fr(g['admissible']))}")
            core = "declaring " + " or ".join(jl(fr(x)) for x in e["alternatives"]) + f" keeps {jl(e['factor'] * fr(g['admissible']))}"
            check_show(shown, any(x.endswith(squash(core)) for x in shown_lines), f"{name}: pool entry {i}'s alternatives are show's")
    if g["primes"]:
        pw = [f"{p['prime']} unfactored" if p.get("unfactored") else f"{p['prime']}{sup(p['power'])}" for p in g["primes"]]
        report.append(f"primes: {fr(g['admissible']).denominator} = {'·'.join(pw)}")
        check_show(shown, squash(f"primes: {fr(g['admissible']).denominator} = {'·'.join(pw)}") in shown_lines, f"{name}: the primes line is show's")
        for p, txt in zip(g["primes"], pw):
            sups = []
            for j in p["suppliers"]:
                e = g["pool"][j - 1]
                sups.append(f"{'Δt' if e['kind'] == 'period' else 'τ'}{sub(e['anchor'])} ({s['anchors'][e['anchor'] - 1]['key']})")
            report.append(f"  {txt}: {', '.join(sups)}")
            core = txt + " " + ", ".join(f"{s['anchors'][g['pool'][j - 1]['anchor'] - 1]['key']} {g['pool'][j - 1]['kind']}" for j in p["suppliers"])
            check_show(shown, squash(core) in shown_lines, f"{name}: the prime row {txt} is show's")
    elif "admissible" in g:
        check(fr(g["admissible"]).denominator == 1, f"{name}: no primes only on a whole-second grid")
    w("grid report:" + ("" if report else " none"))
    for x in report: w(f"  {x}")

    # the components and scopes tables (answers 3, 5 and 9)
    def cells(t, D=None, phi=None):
        k, m, c = t["anchor"], t["m"], t["c"]
        row = f"{anchor_label(s, k)} | m {m} | c {c}"
        if dep:
            Dk, Pk = counts[k]
            check(D == m * Dk and phi == Pk + c * Dk and 0 <= phi < D, f"{name}: D = m·Dₖ, Φ = Φₖ + c·Dₖ, 0 ≤ Φ < D")
            return row + f" | D {D} | Φ {phi} | Δt {secs(D * base)} | τ {secs(phi * base)}"
        if k == 0: return row + f" | Δt {base_mult(m)} | τ {base_mult(c)}"
        a = s["anchors"][k - 1]
        return row + f" | Δt {secs(m * fr(a['dt']))} | τ {secs(fr(a['tau']) + c * fr(a['dt']))}"
    rows = {r["path"]: r for r in sch["rows"]} if dep else {}
    srows = {(r["path"], r["key"]): r for r in sch["scopes"]} if dep else {}
    discrete = [n for n in s["nodes"] if n["class"] == "primitive" and n["tier"] == "discrete"]
    if dep:
        check(sorted(rows) == sorted(n["path"] for n in discrete), f"{name}: the rows join every discrete primitive by path")
        check(sorted(srows) == sorted((x["path"], x["key"]) for x in s["scopes"]), f"{name}: the scope rows join by path and key")
    w(f"components: {len(discrete)}")
    for n in discrete:
        r = rows.get(n["path"], {})
        w(f"  {n['path'] or '(root)'} | " + cells(n["timing"], r.get("D"), r.get("phi")))
        if dep:
            core = f"{n['path'] or 'root'} {anchor_label(s, n['timing']['anchor']).split(' ')[0]} {n['timing']['m']} {n['timing']['c']} {r['D']} {r['phi']} {jl(r['D'] * base)} {jl(r['phi'] * base)}"
            check_show(shown, squash(core) in shown_lines, f"{name}: {n['path']}'s row is show's")
    w(f"scopes: {len(s['scopes'])}")
    for x in s["scopes"]:
        r = srows.get((x["path"], x["key"]), {})
        w(f"  {x['path']} | key {x['key']} | " + cells(x["timing"], r.get("D"), r.get("phi")))

    # hyperperiod, joint period, frame lines, the chart's rows and the threshold (answers 8 and 11)
    if dep:
        if not sch["rows"]:
            w("hyperperiod: none; chart: none")
        else:
            H = lcm(*[r["D"] for r in sch["rows"]])
            m = re.search(r"hyperperiod: (\S+)", shown or "")
            check(m is not None and int(m.group(1)) == H, f"{name}: the hyperperiod {H} is the core's")
            joint = frac_lcm(H * base, frame)
            ticks, frames = joint / base, joint / frame
            check(ticks.denominator == 1 and frames.denominator == 1, f"{name}: the joint period is whole in ticks and frames")
            w(f"hyperperiod: {H} base ticks, {secs(H * base)}")
            w(f"joint period: {secs(joint)}, {ticks} base ticks, {frames} frames")
            unit = Fraction(gcd(base.numerator * frame.denominator, frame.numerator * base.denominator), base.denominator * frame.denominator)
            core = f"{joint / unit} column{'s' if joint / unit != 1 else ''} of {jl(unit)} s over {ticks} base tick{'s' if ticks != 1 else ''} and {frames} frame{'s' if frames != 1 else ''}"
            check_show(shown, any(core in x for x in (shown or "").splitlines()), f"{name}: the joint period is show's chart extent: {core}")
            lines = (base / frame).denominator != 1
            w(f"frame lines: {'drawn' if lines else 'not drawn'}" + ("" if lines else f"; caption: {base / frame} frame{'s' if base / frame != 1 else ''} in one base tick"))
            finer = "frame" if frame < base else "base tick"
            n_finer = max(ticks, frames)
            verdict = "omitted" if ticks > THRESHOLD or frames > THRESHOLD else "drawn"
            w(f"threshold at {THRESHOLD}: {verdict}; finer unit the {finer}, {n_finer} of them over the span; minimum span width {n_finer * PITCH} px at {PITCH} px")
            if verdict == "omitted": w(f"  omitted line: {ticks} base ticks, {secs(joint)}")
            order = palette_order(s, byp, children)
            step = {t: i for i, t in enumerate(order)}
            chart = {}
            for r in sch["rows"]:
                t = byp[r["path"]]["timing"]
                e = chart.setdefault((r["D"], r["phi"]), {"triples": set(), "count": 0})
                e["triples"].add((t["anchor"], t["m"], t["c"])); e["count"] += 1
            w(f"chart rows: {len(chart)}")
            for (D, phi), e in sorted(chart.items()):
                ts = sorted(e["triples"], key=lambda t: step[t])
                splits = (D * base / frame).denominator != 1 or (phi * base / frame).denominator != 1
                marks = "".join("●" if k % D == phi else "·" for k in range(min(H, 40)))
                w(f"  D {D} · Φ {phi} | {' '.join(f'#{step[t]}{list(t)}' for t in ts)} | {e['count']} primitive{'s' if e['count'] != 1 else ''} | {'splits frames' if splits else 'on frame tops'} | {marks}{'…' if H > 40 else ''}")

    # the frames table of every discrete primitive and every rate scope, and the chain line (answer 10)
    scope_rows = {x["path"]: x for x in s["scopes"]}

    def enclosing(path):
        for p in strict_ancestors(path):
            if p in scope_rows: return p, scope_rows[p]["timing"]
        return "", {"anchor": 0, "m": 1, "c": 0}

    def frames_table(path, t, sched):
        sp, st = enclosing(path)
        lines = []
        if t["anchor"] != st["anchor"]:
            a = s["anchors"][t["anchor"] - 1]
            lines.append(f"scope: opens A{sub(t['anchor'])} at {scope_label(a['scope'])}")
            check(a["scope"] == parent_of(path), f"{name}: {path} opens an anchor its parent declares")
        else:
            K, rK = divmod(t["m"], st["m"]); phi, rP = divmod(t["c"] - st["c"], st["m"])
            check(rK == 0 and rP == 0 and phi >= 0, f"{name}: {path}'s scope pair is whole")
            lines.append(f"scope {scope_label(sp)}: K = {K}, φ = {phi}, " + ("base ticks" if sp == "" else f"ticks of {sp}"))
        k = t["anchor"]
        lines.append(f"anchor {anchor_label(s, k)}: m = {t['m']}, c = {t['c']}, " + ("base ticks" if k == 0 else f"ticks of A{sub(k)}"))
        if dep:
            lines.append(f"base grid: D = {sched['D']}, Φ = {sched['phi']}, base ticks")
            lines.append(f"seconds: Δt = {secs(sched['D'] * base)}, τ = {secs(sched['phi'] * base)}")
        elif k == 0:
            lines.append(f"seconds: Δt = {'Δt_base' if t['m'] == 1 else str(t['m']) + '·Δt_base'}, τ = {base_mult(t['c'])}")
        else:
            a = s["anchors"][k - 1]
            lines.append(f"seconds: Δt = {secs(t['m'] * fr(a['dt']))}, τ = {secs(fr(a['tau']) + t['c'] * fr(a['dt']))}")
        return lines

    w("frames tables:")
    for n in discrete:
        w(f"  {n['path'] or '(root)'}")
        for x in frames_table(n["path"], n["timing"], rows.get(n["path"])): w(f"    {x}")
        own = n["rates"][-1] if n["rates"] and n["rates"][-1]["scope"] == parent_of(n["path"]) else None
        sp, st = enclosing(n["path"])
        if own and "K" in own:
            K, phi = n["timing"]["m"] // st["m"], (n["timing"]["c"] - st["c"]) // st["m"]
            check((own["K"], own["phi"]) == (K, phi), f"{name}: {n['path']}'s derived pair is its own entry")
        if n["rates"]:
            chain = " → ".join(entry_text(x) for x in n["rates"])
            w(f"    chain: {chain}")
            check_show(shown, any(x.endswith(squash(chain)) and x.startswith(squash(n["path"] or "root")) for x in shown_lines), f"{name}: {n['path']}'s chain is show's")
        else:
            w("    chain: none")
    for x in s["scopes"]:
        w(f"  scope {x['path']} ({x['key']})")
        for y in frames_table(x["path"], x["timing"], srows.get((x["path"], x["key"]))): w(f"    {y}")

    # the legend's lines (answer 13), over every triple a drawn block takes
    order = palette_order(s, byp, children)
    w(f"legend lines: {len(order)}")
    for i, t in enumerate(order):
        k, m, c = t
        if k == 0: dt = secs(m * base) if dep else ("Δt_base" if m == 1 else f"{m}·Δt_base")
        else: dt = secs(m * fr(s["anchors"][k - 1]["dt"]))
        if dep:
            Dk, Pk = counts[k]; D, phi = m * Dk, Pk + c * Dk
            tip = f"D {D} · Φ {phi} · τ {secs(phi * base)}"
        else:
            tau = base_mult(c) if k == 0 else secs(fr(s["anchors"][k - 1]["tau"]) + c * fr(s["anchors"][k - 1]["dt"]))
            tip = f"τ {tau}"
        w(f"  #{i} {anchor_label(s, k)} · m {m} · c {c} | {dt} | {tip}")

    # the root inputs (answer 14)
    w(f"root inputs: {len(s['root_inputs'])}")
    for r in s["root_inputs"]:
        cons = terminal_consumers(s, byp, "", r["name"], "in") if byp[""]["class"] == "assembly" else []
        pins = {(e["path"], e["port"]): ("by tier" if byp[e["path"]]["tier"] == "discrete" else "by declaration") for e in r["pinned_by"]}
        check(r["pinned"] == bool(r["pinned_by"]), f"{name}: {r['name']}'s pinned is the meet over pinned_by")
        if byp[""]["class"] == "assembly":
            check(set(pins) <= {(p, q) for p, q, _ in cons}, f"{name}: {r['name']}'s pinning consumers are terminal consumers")
        w(f"  {r['name']}: {'pinned' if r['pinned'] else 'not pinned'}; consumers " +
          ", ".join(f"{p}/{q}" + (f" (pins {pins[(p, q)]})" if (p, q) in pins else "") for p, q, _ in cons)
          + ("" if byp[""]["class"] == "assembly" else f"; pinned_by {sorted(pins.items())}"))
        for (p, q), cause in pins.items():
            if shown:
                routes = [x for x in shown_lines if x.startswith(squash(r["name"]) + " →") and x.endswith(f"{p}/{q} pinned {cause}")]
                check(len(routes) >= 1, f"{name}: show marks the route {r['name']} → {p}/{q} pinned {cause}")
    # the docstring links (answer 15)
    lc = link_classes(s)
    tally = {}
    for x in lc: tally[x[3]] = tally.get(x[3], 0) + 1
    w("links: " + ", ".join(f"{v} {k}" for k, v in sorted(tally.items())) if lc else "links: none")
    return out


def draw_counts(s, outputs):
    """The drawing check's per-level counts: blocks (pins plus children), wires, pins, closed assemblies, open squares, pinned marks."""
    byp = {n["path"]: n for n in s["nodes"]}
    stage1 = {c["path"]: set(c["stage1"]) for c in (outputs or {}).get("components", [])}
    children = {}
    for n in s["nodes"]:
        if n["path"] != "": children.setdefault(parent_of(n["path"]), []).append(n["path"])
    out = {}
    for level, n in byp.items():
        if n["class"] != "assembly": continue
        kids = [byp[c] for c in children.get(level, [])]
        prim = [k for k in kids if k["class"] == "primitive"]
        out[level] = (len(n["inputs"]) + len(n["outputs"]) + len(kids), len(n["wires"]), len(n["inputs"]), len(n["outputs"]),
                      len(kids) - len(prim), sum(len([o for o in k["outputs"] if o["name"] in stage1.get(k["path"], set())]) for k in prim),
                      sum(f["pinned"] for k in prim for f in k["inputs"] + k["outputs"]))
    return out


def main():
    names = sorted(os.path.basename(f)[:-5] for f in glob.glob(FIX + "/*.json"))
    fixtures = {n: json.load(open(os.path.join(FIX, n + ".json"))) for n in names}
    for n, d in fixtures.items():
        open(os.path.join(HERE, n + ".txt"), "w").write("\n".join(oracle(n, d)) + "\n")
    # links, per fixture and class, with the URL each gets
    with open(os.path.join(HERE, "links.txt"), "w") as f:
        for n, d in fixtures.items():
            s = structure_of(d)
            if s is None: continue
            for t, text, target, cls, url in link_classes(s):
                if cls != "glossary": f.write(f"{n} | {t} | {text} | {target or '(bare)'} | {cls} | {url}\n")
    # the drawing check's table, every level of every structure
    with open(os.path.join(HERE, "draw.txt"), "w") as f:
        for n, d in fixtures.items():
            s = structure_of(d)
            if s is None: continue
            outputs = d["build"]["outputs"] if d["kind"] == "build" else d["deployment"]["build"]["outputs"] if d["kind"] == "deployment" else None
            for level, c in sorted(draw_counts(s, outputs).items()):
                f.write(f"{n} | {level or '(root)'} | row{c}\n")
    # answer 16's table, figure by figure
    def sched(n): return fixtures[n]["deployment"]["schedule"]
    def st(n): return structure_of(fixtures[n])
    def distinct(n): return sorted({(r["D"], r["phi"]) for r in sched(n)["rows"]})
    check(len(sched("closed_loop_deployment")["rows"]) == 10 and len(distinct("closed_loop_deployment")) == 1, "a16 closed_loop_deployment: ten rows on one (D, Φ)")
    check(sorted(r["name"] for r in st("closed_loop_deployment")["root_inputs"] if r["pinned"]) == ["V_ref", "h_ref"], "a16 closed_loop_deployment: h_ref and V_ref pinned")
    lib = fixtures["library_deployment"]["deployment"]
    check(len(sched("library_deployment")["rows"]) == 13 and len(distinct("library_deployment")) == 4 and (2, 1) in distinct("library_deployment"), "a16 library_deployment: 13 rows on 4 (D, Φ), (2, 1) among them")
    s = st("library_deployment"); byp = {x["path"]: x for x in s["nodes"]}
    check(len({(byp[r["path"]]["timing"]["anchor"], byp[r["path"]]["timing"]["m"], byp[r["path"]]["timing"]["c"]) for r in sched("library_deployment")["rows"] if (r["D"], r["phi"]) == (2, 0)}) == 2, "a16 library_deployment: (2, 0) from two triples")
    check(len(s["grid"]["pool"]) == 2 and fr(s["grid"]["admissible"]) == Fraction(1, 50) and fr(lib["dt_base"]) < Fraction(1, 50), "a16 library_deployment: two pool entries, a base tick finer than 1/50")
    check(sum(bool(e["events"]) for e in lib["build"]["events"]["components"]) > 0, "a16 library_deployment: events")
    r = fixtures["rates_deployment"]["deployment"]
    H = lcm(*[x["D"] for x in r["schedule"]["rows"]])
    check(len(r["schedule"]["rows"]) == 3 and len(r["schedule"]["scopes"]) == 3 and H == 40 and fr(r["dt_frame"]) / fr(r["dt_base"]) == 2, "a16 rates_deployment: 3 rows, 3 scopes, hyperperiod 40, frame of two base ticks")
    a = fixtures["approach_deployment"]["deployment"]; s = st("approach_deployment")
    check(len(a["schedule"]["rows"]) == 11 and len(s["anchors"]) == 11, "a16 approach_deployment: 11 rows on 11 anchors")
    ev = [(e["path"], [x["name"] for x in e["events"]]) for e in a["build"]["events"]["components"] if e["events"]]
    check(ev == [("vehicle/gear", ["touchdown"])] or [x[1] for x in ev] == [["touchdown"]], f"a16 approach_deployment: one event, {ev}")
    t = fixtures["timing_deployment"]["deployment"]; s = st("timing_deployment")
    check(t["schedule"]["anchors"] == [{"D": 30, "phi": 1}, {"D": 6, "phi": 0}] and fr(t["dt_frame"]) / fr(t["dt_base"]) == 3, "a16 timing_deployment: an anchor with Φₖ = 1, a frame of three base ticks")
    check([w["kind"] for w in t["warnings"]] == ["GridUtilization"] and t["warnings"][0]["path"] == "" and len(t["warnings"][0]["message"].split("\n")) == 10, "a16 timing_deployment: one GridUtilization at the root, ten lines")
    check(any("alternatives" in e and e["factor"] == 6 and [fr(x) for x in e["alternatives"]] == [0, Fraction(1, 50)] for e in s["grid"]["pool"]), "a16 timing: an offset of factor 6 with alternatives 0 and 1/50")
    pins = {x["name"]: [byp2["tier"] for byp2 in [next(n for n in s["nodes"] if n["path"] == e["path"]) for e in x["pinned_by"]]] for x in s["root_inputs"]}
    check(pins == {"u": ["discrete"] * 5, "ref": ["continuous"]}, f"a16 timing: u by tier through five, ref by declaration through one: {pins}")
    sc = {x["path"]: (x["key"], x["timing"]) for x in s["scopes"]}
    check(sc.get("fast/outer") == ("outer", {"anchor": 2, "m": 2, "c": 1}) and sc.get("fast/outer/deep") == ("deep", {"anchor": 2, "m": 4, "c": 3}), "a16 timing: outer = Relative(2, 1) under fast, deep at (4, 3)")
    nodes = {x["path"]: x for x in s["nodes"]}
    check(nodes["fast/outer/hold"]["rates"][-1] == {"scope": "fast/outer", "key": "hold", "K": 3, "phi": 1} and nodes["fast/outer/same"]["rates"][-1] == {"scope": "fast/outer", "key": "same", "K": 1, "phi": 0}, "a16 timing: hold = Relative(3, 1) and an explicit Relative(1)")
    check(fixtures["timing"]["kind"] == "build", "a16 timing: committed as a build too")
    with open(os.path.join(HERE, "checks.txt"), "w") as f:
        f.write("\n".join(checks) + "\n")
    bad = [c for c in checks if c.startswith("FAIL")]
    print(f"{len(checks)} checks, {len(bad)} failed")
    for c in bad: print(c)


main()
