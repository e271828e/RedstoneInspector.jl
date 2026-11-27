"""The events' facts of every fixture, as an oracle independent of the page.

Usage: python3 fixture_facts.py <frontend dir>

Per fixture: the declaring components with their events and policies, the
count beneath every assembly (the root's included) with the number of
declaring primitives, and the deployment's three event parameters.
"""
import json
import sys
from pathlib import Path

frontend = Path(sys.argv[1])


def body(d):
    if d["kind"] == "build":
        return d["build"]
    if d["kind"] == "deployment":
        return d["deployment"]["build"]
    return None


for f in sorted((frontend / "fixtures").glob("*.json")):
    d = json.loads(f.read_text())
    b = body(d)
    if b is None:
        print(f"{f.stem}: failure, events section {'events' in d['failure']}")
        continue
    rows = b["events"]["components"]
    nodes = b["structure"]["nodes"]
    prims = [n["path"] for n in nodes if n["class"] == "primitive"]
    # every primitive has a row, in walk order
    assert [r["path"] for r in rows] == prims, f.stem
    declaring = [r for r in rows if r["events"]]
    n_events = sum(len(r["events"]) for r in declaring)
    print(f"{f.stem}: {n_events} events over {len(declaring)} components")
    for r in declaring:
        ev = ", ".join(f"{e['name']}={e['policy']}" for e in r["events"])
        print(f"  {r['path'] or '/'}: {ev}; bundle {r['bundle']}")
    for n in nodes:
        if n["class"] != "assembly":
            continue
        p = n["path"]
        under = [r for r in declaring if p == "" or r["path"].startswith(p + "/")]
        if under:
            print(f"  beneath {p or '/'}: {sum(len(r['events']) for r in under)} events on {len(under)} primitives")
    if d["kind"] == "deployment":
        dep = d["deployment"]
        print(f"  firing_budget {dep['firing_budget']}, localization_tol {dep['localization_tol']}, localization_budget {dep['localization_budget']}")
