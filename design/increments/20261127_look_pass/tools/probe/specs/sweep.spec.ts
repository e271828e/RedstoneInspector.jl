// Every producer port on every fixture's root and each closed child of the root, traced with the labels on and
// rate mode on: what each level's overlay pills meet.
import { test } from "@playwright/test";
import { drop, log, openPath, pillReport, press, readyLevel, reset } from "./h";

const FIXTURES = ["aircraft", "approach_deployment", "closed_loop", "closed_loop_deployment", "containers", "descent", "events_deployment",
  "failure_cycle", "failure_dead", "failure_nested", "failure_probe", "kinds", "library", "primitive", "rates", "rates_deployment", "timing",
  "timing_deployment", "warning"];

for (const f of FIXTURES) {
  test(`sweep ${f}`, async ({ page }, info) => {
    test.setTimeout(600000);
    const file = `sweep.${info.project.name}.txt`;
    if (f === FIXTURES[0]) reset(file);
    await drop(page, f);
    await press(page, "y");
    await press(page, "c");
    const children = await page.locator("svg.canvas g.blocks > g.block.assembly").evaluateAll((bs) => bs.map((b) => b.getAttribute("data-id")!));
    for (const level of ["", ...children]) {
      if (level !== "") {
        await drop(page, f);
        await openPath(page, level);
      }
      await page.locator(readyLevel(level)).waitFor();
      const ports = await page.locator('svg.canvas rect.port[data-port*="|out|"]').evaluateAll((ps) => ps.map((p) => p.getAttribute("data-port")!));
      let traced = 0, pills = 0;
      const issues = new Map<string, number>();
      for (const port of ports.slice(0, 120)) {
        await page.locator(`rect.port[data-port="${port}"]`).dispatchEvent("click");
        await press(page, "t");
        const routed = await page.locator("g.route-casings path.casing.route").count();
        if (!routed) { await press(page, "Escape"); continue; }
        traced++;
        const r = await pillReport(page);
        pills += r.n;
        for (const i of r.issues) {
          const key = `${i}  [traced ${port}]`;
          issues.set(key, (issues.get(key) ?? 0) + 1);
        }
        await press(page, "Escape");
      }
      log(file, `${f} level="${level}" ports=${ports.length} traced=${traced} pills=${pills} issues=${issues.size}`);
      for (const k of issues.keys()) log(file, `   ${k}`);
    }
  });
}
