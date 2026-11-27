"""draw.spec.ts's per-level counts for one fixture, from the descriptor alone.

Usage: python3 draw_oracle.py <frontend dir> <fixture>

Per assembly level: blocks (children plus pins), wires, input pins, output pins,
closed assemblies, open squares (a primitive child's stage 1 outputs), pinned
marks (a primitive child's pinned faces, and at the root a pinned root input's tag).
"""
import json
import sys
from pathlib import Path

d = json.loads((Path(sys.argv[1]) / "fixtures" / f"{sys.argv[2]}.json").read_text())
b = d["deployment"]["build"] if d["kind"] == "deployment" else d.get("build") or d["failure"]
s = b["structure"]
nodes = {n["path"]: n for n in s["nodes"]}
outs = b.get("outputs")
stage1 = {c["path"]: set(c["stage1"]) for c in outs["components"]} if outs else {}


def parent(p):
    # the parent is the longest proper prefix that is a node
    parts = p.split("/")
    for i in range(len(parts) - 1, 0, -1):
        q = "/".join(parts[:i])
        if q in nodes:
            return q
    return ""


for path, n in nodes.items():
    if n["class"] != "assembly":
        continue
    kids = [m for p, m in nodes.items() if p != "" and p != path and parent(p) == path]
    pinned = sum(f.get("pinned", False) for m in kids if m["class"] == "primitive" for f in m["inputs"] + m["outputs"])
    if path == "":
        pinned += sum(r["pinned"] for r in s["root_inputs"])
    row = dict(
        blocks=len(kids) + len(n["inputs"]) + len(n["outputs"]),
        wires=len(n["wires"]),
        inPins=len(n["inputs"]),
        outPins=len(n["outputs"]),
        closed=sum(m["class"] == "assembly" for m in kids),
        stage1=sum(len(stage1.get(m["path"], ())) for m in kids if m["class"] == "primitive"),
        pinned=pinned,
    )
    print(repr(path), row)
