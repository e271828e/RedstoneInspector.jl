// The page's modules dumped in look_reading.py's form (vitest.config.mjs): DIRS the folders, joined by ":", OUT the file.
import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { test } from "vitest";
const L = `${process.env.FRONTEND}/src/lib/`;
const T = await import(L + "timing.ts"); const D = await import(L + "detail.ts");
const LD = await import(L + "loader.ts"); const MD = await import(L + "model.ts");
test("dump", () => {
  const out: string[] = [];
  for (const dir of process.env.DIRS!.split(":")) for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const name = f.slice(0, -5);
    const emit = (a: string, k: string, v: unknown) => out.push(`${name}|${a}|${k}|${v}`);
    const loaded = LD.parseDescriptor(readFileSync(`${dir}/${f}`, "utf8"), f);
    if (!loaded.ok) { emit("refused", "-", loaded.reason); continue; }
    const m = MD.loadModel(loaded), s = m.structure;
    if (!s || !m.tree) { emit("structure", "-", "none"); continue; }
    const head = T.headList(m);
    head?.forEach((l: any[], i: number) => emit("head", `${i + 1}`, l.map((h) => `${h.label}: ${h.values.join(", ")}`).join("   ")));
    if (head) {
      const j = T.jointPeriod(m);
      if (!j) emit("hyper", "-", "none");
      else {
        emit("hyper", "-", T.hyperperiodLine(j)); emit("joint", "-", T.jointLine(j) ?? "none");
        const fit = T.chartFit(j, T.frameLines(m), 1200);
        emit("omitted", "-", fit.kind === "omitted" ? fit.line : "none");
      }
    }
    emit("grid", "first", T.coarsestLine(m) ?? "none");
    const g = T.gridReport(m);
    if (g) {
      g.entries.forEach((e: string, i: number) => emit("grid", `entry${i + 1}`, e));
      if (g.primes) emit("grid", "primes", g.primes);
      g.attribution.forEach((a: any, i: number) => emit("grid", `prime${i + 1}`, `${a.power}: ${a.suppliers.map((x: any) => x.text).join(", ")}`));
    }
    for (const n of s.nodes) for (const facts of [D.nodeFacts, D.levelFacts]) {
      const x = facts(m, n.path), p = n.path || "/", S: string[] = [];
      if (x.signature !== x.type) S.push("signature");
      if (x.docstring) S.push("docstring");
      if (x.locations.length) S.push("locations");
      if (x.timing) S.push("timing");
      if (x.parameters.length) S.push("parameters");
      if (x.inputs.length + x.outputs.length) S.push("faces");
      const tag = facts === D.nodeFacts ? "" : "@level";
      emit("sections" + tag, p, S.join(" "));
      emit("timing" + tag, p, x.timing ? x.timing.table.rows.map((r: any) => [r.frame, r.name, r.period, r.phase, r.unit].filter(Boolean).join(" ") + (r.nameTitle ? ` [${r.nameTitle}]` : "")).join(" | ") : "none");
      if (x.timing) { emit("chain" + tag, p, x.timing.chain ?? "none"); }
    }
  }
  writeFileSync(process.env.OUT!, out.join("\n") + "\n");
});
