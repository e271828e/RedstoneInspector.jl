"""The builder's runner: one mutant applied in place to a file of FRONTEND from a saved copy, a command run there,
the file restored from the copy. OLD_TEXT_FILE and NEW_TEXT_FILE hold the text replaced and its replacement, as the
pairs in builder_mutants/ do. Nothing may read or edit the tree until it has restored the file (design/rules.md,
"A mutant runner in place").
Usage: python3 mutant_inplace.py FRONTEND FILE OLD_TEXT_FILE NEW_TEXT_FILE -- CMD..."""
import os, shutil, subprocess, sys
frontend, f, oldf, newf = sys.argv[1:5]
cmd = sys.argv[sys.argv.index("--") + 1:]
copy = f + ".mutant-save"
shutil.copyfile(f, copy)
try:
    s = open(f).read()
    old, new = open(oldf).read(), open(newf).read()
    assert s.count(old) == 1, f"old text found {s.count(old)} times"
    open(f, "w").write(s.replace(old, new))
    r = subprocess.run(cmd, cwd=frontend, capture_output=True, text=True)
    out = r.stdout + r.stderr
    print("\n".join([l for l in out.splitlines() if any(k in l for k in ("passed", "failed", "Tests ", "✓", "×", "FAIL"))][-8:]))
    print("EXIT", r.returncode)
finally:
    shutil.copyfile(copy, f)
    os.remove(copy)
