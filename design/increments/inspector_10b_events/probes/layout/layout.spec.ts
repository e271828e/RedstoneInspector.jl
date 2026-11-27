// C2's figure: every committed fixture's every level laid out by the baseline bundle (HEAD, port 4320) and by the
// increment's (port 4321), its blocks' places and sizes and its wires' routes compared whole.
import { test, expect, type Page } from "@playwright/test";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const dir = process.env.FIXTURES! + "/";
const names = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();

function levels(text: string): string[] {
  const d = JSON.parse(text);
  const b = d.kind === "deployment" ? d.deployment.build : d.kind === "build" ? d.build : d.failure;
  if (!b.structure) return [];
  return b.structure.nodes.filter((n: { class: string; path: string }) => n.class === "assembly" || n.path === "").map((n: { path: string }) => n.path);
}

async function geometry(page: Page, url: string, name: string, text: string, level: string) {
  await page.goto(url);
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.locator('svg.canvas[data-level=""][data-ready]').waitFor();
  if (level) {
    const segs = level.split("/");
    for (let i = 1; i <= segs.length; i++) {
      const p = segs.slice(0, i).join("/");
      if (i < segs.length && !(await page.locator(`g.block[data-id="${p}"]`).count())) continue;
      await page.locator(`g.block[data-id="${p}"]`).dblclick();
      await page.locator(`svg.canvas[data-level="${p}"][data-ready]`).waitFor();
    }
  }
  return page.evaluate(() => ({
    blocks: [...document.querySelectorAll("svg.canvas g.blocks > g.block")].map((g) => {
      const s = g.querySelector(":scope > .shape")!;
      return `${(g as SVGGElement).dataset.id} ${g.getAttribute("transform")} ${s.getAttribute("width")}x${s.getAttribute("height")} ${s.getAttribute("d") ?? ""}`;
    }),
    wires: [...document.querySelectorAll("svg.canvas path.wire")].map((w) => `${(w as SVGPathElement).dataset.wire} ${w.getAttribute("d")}`),
  }));
}

for (const name of names) {
  test(name, async ({ page }, info) => {
    const text = readFileSync(`${dir}${name}.json`, "utf8");
    const out: string[] = [];
    for (const level of levels(text)) {
      if (name === "failure_structure") continue;
      const a = await geometry(page, "http://localhost:4320/", name, text, level);
      const b = await geometry(page, "http://localhost:4321/", name, text, level);
      const same = JSON.stringify(a) === JSON.stringify(b);
      out.push(`${name} ${level || "/"}: ${a.blocks.length} blocks, ${a.wires.length} wires, ${same ? "same" : "DIFFERENT"}`);
      expect(b, `${name} ${level}`).toEqual(a);
    }
    writeFileSync(`out/${info.project.name}.${name}.txt`, out.join("\n") + "\n");
  });
}
