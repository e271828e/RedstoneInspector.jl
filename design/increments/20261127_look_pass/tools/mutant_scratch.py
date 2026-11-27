"""The review's runner: one mutant on a scratch copy of the frontend, never the worktree. It replaces OLD with NEW
in FILE, relative to MUTANT_SCRATCH, runs each command there, then restores FILE from MUTANT_SOURCE, the worktree's
frontend. A command 'e2e:<args>' builds first, then runs Playwright with those args. Each result is appended to
MUTANT_LOG.
Environment: MUTANT_SCRATCH, a copy of the frontend folder with node_modules linked in; MUTANT_SOURCE; MUTANT_LOG.
Usage: python3 mutant_scratch.py NAME FILE OLD NEW CMD [CMD...]"""
import os, shutil, subprocess, sys
S, W, LOG = os.environ["MUTANT_SCRATCH"], os.environ["MUTANT_SOURCE"], os.environ["MUTANT_LOG"]
name, f, old, new, *cmds = sys.argv[1:]
path = f"{S}/{f}"
s = open(path).read()
n = s.count(old)
assert n >= 1, f"{name}: old text found {n} times"
open(path, "w").write(s.replace(old, new))
out_lines = [f"== {name}: {f} ({n} replaced)"]
try:
    for c in cmds:
        if c.startswith("e2e:"):
            b = subprocess.run("npm run build", shell=True, cwd=S, capture_output=True, text=True)
            if b.returncode:
                out_lines.append("BUILD FAILED " + b.stdout[-400:] + b.stderr[-400:])
                continue
            c = "npx playwright test " + c[4:]
        r = subprocess.run(c, shell=True, cwd=S, capture_output=True, text=True)
        text = r.stdout + r.stderr
        keep = [l for l in text.splitlines() if any(k in l for k in (" passed", " failed", "Tests ", "✘", " FAIL ", "×"))]
        out_lines.append(f"$ {c}\n  " + "\n  ".join(keep[-14:]) + f"\n  EXIT {r.returncode}")
finally:
    shutil.copyfile(f"{W}/{f}", path)
msg = "\n".join(out_lines)
print(msg)
open(LOG, "a").write(msg + "\n")
