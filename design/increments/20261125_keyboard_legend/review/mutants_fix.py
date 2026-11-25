# Reverts each fix alone, rebuilds, runs its checks; restores every file. Run from anywhere.
import subprocess, shutil, sys, os
F = __import__("os").environ["FRONTEND"]
A, C, P = "src/App.svelte", "src/canvas/Canvas.svelte", "src/lib/prefix.ts"
M = [
 ("F1 n: the effect", A, "    const stop = paneFocus();\n    if (stop) tick().then(() => {", "    const stop = undefined as HTMLElement | undefined;\n    if (stop) tick().then(() => {", "e2e/cursor.spec.ts", "a face's row keeps the cursor"),
 ("F1 push: accept", A, "        if (stop?.isConnected) stop.focus({ preventScroll: true });\n        else rootOf(held)?.focus();", "        rootOf(held)?.focus();", "e2e/cursor.spec.ts", "a face's row keeps the cursor"),
 ("F2 the click's guard", A, "    if (!stop && row && dragged(e, row)) return;\n", "", "e2e/analysis.spec.ts", "a drag that makes"),
 ("F3 refusal", A, "      refusal = r.reason;\n      prefix = undefined;\n", "      refusal = r.reason;\n", "e2e/keys.spec.ts", "a refusal unloading"),
 ("F4 legend scroll", C, "    if (top < box.scrollTop) box.scrollTop = top;\n    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;", "    line.scrollIntoView({ block: \"nearest\" }); void top; void bottom;", "e2e/legend.spec.ts", "scroll|narrower"),
 ("F5 menu blur", C, " onblur={menuBlur}", "", "e2e/cursor.spec.ts", "right-click menu's entry"),
 ("F7 n by name", A, "else if (name === \"n\" || name === \"N\") stepSearch(name === \"N\" ? -1 : 1);", "else if (e.key === \"n\" || e.key === \"N\") stepSearch(e.key === \"N\" ? -1 : 1);", "e2e/search.spec.ts", "n and N walk"),
 ("F8 Alt ends a hold", P, "  if (endsHold(p, name)) return { next: undefined };\n", "", "e2e/keys.spec.ts", "an Alt key or a key with Cmd"),
 ("F8 Alt in a field", A, "      if (endsHold(prefix, name)) prefix = undefined;\n", "", "e2e/keys.spec.ts", "an Alt key or a key with Cmd"),
 ("tree gg G", A, "      tick().then(() => document.querySelector(\"nav.tree .row.selected\")?.scrollIntoView({ block: \"nearest\" }));\n", "", "e2e/cursor.spec.ts", "gg and G scroll the tree"),
 ("17 Tab in a field", A, "(!prefix || typing(e.target))", "!prefix", "e2e/keys.spec.ts", "Tab in the search field"),
 ("19 Alt starts no prefix", A, "(prefix || !e.altKey) ? press", "true ? press", "e2e/keys.spec.ts", "Alt with z or g"),
 ("20 Alt key under a prefix", A, "(prefix || !e.altKey) ? press", "!e.altKey ? press", "e2e/keys.spec.ts", "Alt with z or g"),
 ("25 li.edge", A, "t.closest(\"tr, .line, li.edge\")", "t.closest(\"tr, .line\")", "e2e/cursor.spec.ts", "a click puts the cursor"),
 ("26 preventScroll", A, "stopsOf(region).find((s) => s === at)?.focus({ preventScroll: true });", "stopsOf(region).find((s) => s === at)?.focus();", "e2e/cursor.spec.ts", "a click puts the cursor"),
 ("72 Alt arrows", A, "    else if (e.altKey) handled = false;\n", "", "e2e/keys.spec.ts", "Alt with z or g"),
]
only = sys.argv[1:]
for name, f, a, b, spec, grep in M:
    if only and not any(o in name for o in only): continue
    path = os.path.join(F, f); bak = path + ".mutbak"
    shutil.copy(path, bak)
    try:
        s = open(path).read()
        assert s.count(a) == 1, (name, s.count(a))
        open(path, "w").write(s.replace(a, b))
        r = subprocess.run("npm run build", shell=True, cwd=F, capture_output=True, text=True)
        if r.returncode: print(name, "| BUILD FAILED", r.stderr[-300:], flush=True); continue
        r = subprocess.run(["npx", "playwright", "test", spec, "-g", grep], cwd=F, capture_output=True, text=True)
        tail = [l for l in r.stdout.splitlines() if " passed" in l or " failed" in l]
        print(name, "|", "RED" if r.returncode else "GREEN (survives)", "|", " ".join(x.strip() for x in tail), flush=True)
    finally:
        shutil.move(bak, path)
subprocess.run("npm run build", shell=True, cwd=F, capture_output=True)
print("restored", flush=True)
