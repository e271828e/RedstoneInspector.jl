// The pills' measured widths and the margin of each events-pill block over what its top pills need, in the increment's bundle.
import { test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
const dir = process.env.FIXTURES! + "/";
const CASES: [string, string][] = [["approach_deployment", ""], ["descent", ""], ["library_deployment", ""], ["events_deployment", ""], ["events_deployment", "nest"]];
test("pills", async ({ page }, info) => {
  const out: string[] = [];
  for (const [name, level] of CASES) {
    await page.goto("http://localhost:4321/");
    await page.evaluate(({ text, file }) => {
      localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, mode: "rate" }));
      const dt = new DataTransfer();
      dt.items.add(new File([text], file, { type: "application/json" }));
      window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    }, { text: readFileSync(`${dir}${name}.json`, "utf8"), file: `${name}.json` });
    await page.locator('svg.canvas[data-level=""][data-ready]').waitFor();
    if (level) { await page.locator(`g.block[data-id="${level}"]`).dblclick(); await page.locator(`svg.canvas[data-level="${level}"][data-ready]`).waitFor(); }
    const rows = await page.evaluate(() => [...document.querySelectorAll("g.block")].filter((g) => g.querySelector(":scope > g.events-pill")).map((g) => {
      const w = (sel: string) => { const r = g.querySelector(`:scope > ${sel} rect`); return r ? Number(r.getAttribute("width")) : 0; };
      const t = (sel: string) => g.querySelector(`:scope > ${sel} text`)?.textContent ?? "";
      const width = Number(g.querySelector(":scope > .shape")!.getAttribute("width"));
      const need = 8 + w("g.events-pill") + (w("g.badge-pill") ? w("g.badge-pill") + 2 : 0);
      return `${(g as SVGGElement).dataset.id}: block ${width}, events "${t("g.events-pill")}" ${w("g.events-pill")}, rate "${t("g.badge-pill")}" ${w("g.badge-pill")}, need ${need}, margin ${width - need}`;
    }));
    out.push(`${name} ${level || "/"}`, ...rows.map((r) => "  " + r));
  }
  writeFileSync(`out/pills.${info.project.name}.txt`, out.join("\n") + "\n");
});
