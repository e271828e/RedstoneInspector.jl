"""The reviewer's own oracle of increment 10b's events, from the records.

visual_grammar.md answer 11, workspace.md answers 4 and 6, the notes'
rulings 1 to 14 and C4 to C7. Usage: python3 oracle.py <fixtures dir> <out.json>
"""
import json, sys, glob, os


def body_of(d):
    k = d["kind"]
    b = d[k]
    if k == "deployment":
        return k, b["build"], b
    if k == "failure":
        return k, None, None
    return k, b, None


def nodes_of(d):
    k = d["kind"]
    b = d[k]
    s = b["build"]["structure"] if k == "deployment" else b.get("structure")
    return s["nodes"] if s else []


def beneath(path, p):
    if path == "":
        return True
    return p.startswith(path + "/")


def facts(d):
    kind, build, dep = body_of(d)
    nodes = nodes_of(d)
    out = {"kind": kind}
    if build is None:
        out.update(events={}, beneath={}, groups=[], tab=0, head=None, walk_ok=None)
        return out
    comps = build["events"]["components"]
    prims = [n["path"] for n in nodes if n["class"] == "primitive"]
    out["walk_ok"] = [c["path"] for c in comps] == prims
    ev = {}
    for c in comps:
        if c["events"]:
            ev[c["path"]] = [[i + 1, e["name"], e["policy"] == "localized"] for i, e in enumerate(c["events"])]
    out["events"] = ev
    out["bundles"] = {c["path"]: c["bundle"] for c in comps if c["events"]}
    bn = {}
    for n in nodes:
        if n["class"] != "assembly":
            continue
        cnt = sum(len(v) for p, v in ev.items() if beneath(n["path"], p))
        prim = sum(1 for p in ev if beneath(n["path"], p))
        bn[n["path"]] = [cnt, prim]
    out["beneath"] = bn
    out["groups"] = [p for p in prims if p in ev]
    out["tab"] = sum(len(v) for v in ev.values())
    if dep is None:
        out["head"] = None
    else:
        items = []
        if out["tab"] > 0:
            items.append(["firing_budget", dep["firing_budget"]])
        if any(e[2] for v in ev.values() for e in v):
            items.append(["localization_tol", dep["localization_tol"]])
            items.append(["localization_budget", dep["localization_budget"]])
        out["head"] = items
    # pill text and titles, per the notes' C4
    def word(n):
        return f"{n} event" if n == 1 else f"{n} events"
    pills = {}
    for p, v in ev.items():
        pills[p] = [word(len(v)), "\n".join(f"{e[0]} {e[1]}, {'localized' if e[2] else 'not localized'}" for e in v)]
    for p, (c, m) in bn.items():
        if c > 0:
            pills[p] = [word(c), f"{word(c)} on {m} primitive{'s' if m != 1 else ''} inside"]
    out["pills"] = pills
    return out


def main():
    res = {}
    for f in sorted(glob.glob(os.path.join(sys.argv[1], "*.json"))):
        res[os.path.basename(f)[:-5]] = facts(json.load(open(f)))
    json.dump(res, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
    for k, v in res.items():
        print(k, v["kind"], "tab", v["tab"], "groups", len(v["groups"]), "root", v["beneath"].get(""), "walk_ok", v["walk_ok"], "head", v["head"])


main()
