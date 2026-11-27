// The overlay's pills against the drawing (visual_grammar.md answer 9 as amended by the look pass's cold review,
// F1): every producer port traced in turn on every fixture's root and on each closed child of the root, the type
// labels on and off, no pill meets a block, a port square or another pill, a diagnostic's own block aside.
import { readdirSync } from "node:fs";
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, press, readyLevel } from "./fixtures";

const FIXTURES = readdirSync(new URL("../fixtures/", import.meta.url)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();

/** What the drawn level's overlay pills meet, in client pixels, half a pixel of touching allowed. */
const meetings = (page: Page) => page.evaluate(() => {
  const meet = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const pills = [...document.querySelectorAll("g.overlay g.badge")].map((g) => ({
    name: `${g.getAttribute("data-role")}@${g.getAttribute("data-port") ?? g.getAttribute("data-id")}`,
    own: g.getAttribute("data-role") === "diagnostic" ? g.getAttribute("data-id") : undefined, r: g.querySelector("rect")!.getBoundingClientRect(),
  }));
  const blocks = [...document.querySelectorAll("g.blocks > g.block")].map((b) => ({ id: b.getAttribute("data-id")!, r: b.querySelector(":scope > .shape")!.getBoundingClientRect() }));
  const ports = [...document.querySelectorAll("rect.port")].map((p) => ({ id: p.getAttribute("data-port")!, r: p.getBoundingClientRect() }));
  const out: string[] = [];
  for (const [i, p] of pills.entries()) {
    for (const q of pills.slice(i + 1)) if (meet(p.r, q.r)) out.push(`${p.name} meets ${q.name}`);
    for (const b of blocks) if (b.id !== p.own && meet(p.r, b.r)) out.push(`${p.name} meets block ${b.id}`);
    for (const o of ports) if (meet(p.r, o.r)) out.push(`${p.name} meets port ${o.id}`);
  }
  return out;
});

for (const f of FIXTURES) {
  test(`${f}: every producer port traced on the root and on each closed child of the root, the labels on and off, no overlay pill meets a block, a port square or another pill`, async ({ page }) => {
    test.setTimeout(180_000);
    await drop(page, f);
    if (!(await page.locator("svg.canvas").count())) return;
    const children = await page.locator("svg.canvas g.blocks > g.block.assembly").evaluateAll((bs) => bs.map((b) => b.getAttribute("data-id")!));
    const found: string[] = [];
    for (const level of ["", ...children]) {
      if (level !== "") {
        await drop(page, f);
        await openPath(page, level);
      }
      await page.locator(readyLevel(level)).waitFor();
      const ports = await page.locator('svg.canvas rect.port[data-port*="|out|"]').evaluateAll((ps) => ps.map((p) => p.getAttribute("data-port")!));
      for (const port of ["", ...ports]) {
        // a new trace replaces the standing route; the toggle alternates, so each trace is read in both states
        if (port) {
          await page.locator(`rect.port[data-port="${port}"]`).dispatchEvent("click");
          await press(page, "t");
        }
        for (const _ of [0, 1]) {
          const labels = await page.locator("svg.canvas").evaluate((e) => e.hasAttribute("data-labels"));
          for (const m of await meetings(page)) found.push(`level "${level}", ${port ? `${port} traced` : "no trace"}, labels ${labels ? "on" : "off"}: ${m}`);
          await press(page, "y");
        }
      }
    }
    expect([...new Set(found)]).toEqual([]);
  });
}
