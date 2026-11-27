# Compares two fixture folders as values: python3 -I valuediff.py <old> <new>
import json, os, sys, glob, re, collections
old, new = sys.argv[1], sys.argv[2]
kinds = collections.Counter(); details = []
def walk(a, b, path):
    if type(a) != type(b):
        kinds["STRUCTURAL type"] += 1; details.append(("STRUCT", path, a, b)); return
    if isinstance(a, dict):
        if set(a) != set(b):
            kinds["STRUCTURAL keys"] += 1; details.append(("KEYS", path, sorted(set(a)^set(b)), None))
        for k in set(a) & set(b): walk(a[k], b[k], path + "." + k)
    elif isinstance(a, list):
        if len(a) != len(b):
            kinds["STRUCTURAL length"] += 1; details.append(("LEN", path, len(a), len(b))); return
        for i, (x, y) in enumerate(zip(a, b)): walk(x, y, f"{path}[{i}]")
    elif a != b:
        leaf = path.rsplit(".", 1)[-1]
        if leaf == "file":
            na = re.sub(r"packages/Redstone(?:Examples)?/[^/]+/", "packages/Redstone/X/", a); nb = re.sub(r"packages/Redstone(?:Examples)?/[^/]+/", "packages/Redstone/X/", b)
            kinds["file: package dir only" if na == nb else "file: other"] += 1
            if na != nb: details.append(("FILE", path, a, b))
        elif leaf == "line": kinds["line"] += 1; details.append(("LINE", path, a, b))
        else: kinds[leaf] += 1; details.append(("VALUE", path, a, b))
for f in sorted(glob.glob(os.path.join(new, "*.json"))):
    n = os.path.basename(f); a = json.load(open(os.path.join(old, n))); b = json.load(open(f))
    before = sum(kinds.values()); walk(a, b, n[:-5])
    print(n, os.path.getsize(os.path.join(old, n)), "->", os.path.getsize(f), "diffs", sum(kinds.values()) - before)
print(dict(kinds))
for d in details:
    if d[0] in ("LINE",): continue
    print(d[0], d[1]); print("   old:", repr(d[2])[:3000]); print("   new:", repr(d[3])[:3000])
lines = [d for d in details if d[0] == "LINE"]
print("LINES", len(lines)); [print("  ", d[1], d[2], "->", d[3]) for d in lines]
