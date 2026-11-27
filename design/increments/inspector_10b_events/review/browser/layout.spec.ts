// Probe: every level of every committed fixture but the new one, baseline a07df11 (port 4331) against 3d5bc26 (4330),
// in tier and in rate mode: every block's transform and size and every wire's path.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { test } from "@playwright/test";

const OUT = "<probes>/browser/out";
const FIX = "<worktree>/frontend/fixtures/";
const names = readdirSync(FIX).filter((f) => f.endsWith(".json") && f !== "events_deployment.json").map((f) => f.slice(0, -5));

function levels(text: string): string[] {
  const d = JSON.parse(text);
  const b = d[d.kind];
  const s = d.kind === "deployment" ? b.build.structure : b.structure;
  if (!s) return [];
  return s.nodes.filter((n: any) => n.class === "assembly").map((n: any) => n.path);
}

async function capture(page: any, port: number, name: string, text: string, level: string, mode: string) {
  await page.goto(`http://localhost:${port}/${level ? "#level=" + encodeURIComponent(level).replace(/%2F/g, "/") : ""}`);
  await page.evaluate((m: string) => { localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, mode: m })); }, mode);
  await page.reload();
  await page.evaluate(({ text, file }: any) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForSelector(`svg.canvas[data-level="${level}"][data-ready]`, { timeout: 30000 });
  return page.evaluate(() => ({
    mode: document.querySelector("svg.canvas")!.getAttribute("data-mode"),
    blocks: [...document.querySelectorAll("svg.canvas g.blocks > g.block")].map((b) => {
      const s = (b.querySelector(".shape") as SVGGraphicsElement).getBBox();
      return `${(b as HTMLElement).dataset.id} ${b.getAttribute("transform")} ${s.x.toFixed(2)} ${s.y.toFixed(2)} ${s.width.toFixed(2)} ${s.height.toFixed(2)}`;
    }),
    wires: [...document.querySelectorAll("svg.canvas path.wire")].map((w) => `${(w as HTMLElement).dataset.wire} ${w.getAttribute("d")}`),
    pills: document.querySelectorAll("svg.canvas g.events-pill").length,
  }));
}

test("no committed layout moved", async ({ page }, info) => {
  test.setTimeout(900000);
  const diffs: any[] = [];
  let n = 0;
  for (const name of names) {
    const text = readFileSync(FIX + name + ".json", "utf8");
    for (const level of levels(text)) {
      for (const mode of ["tier", "rate"]) {
        const a = await capture(page, 4331, name, text, level, mode);
        const b = await capture(page, 4330, name, text, level, mode);
        n++;
        if (a.mode !== mode || b.mode !== mode) diffs.push({ name, level, mode, why: "mode not applied", a: a.mode, b: b.mode });
        const ba = JSON.stringify(a.blocks), bb = JSON.stringify(b.blocks), wa = JSON.stringify(a.wires), wb = JSON.stringify(b.wires);
        if (ba !== bb || wa !== wb) {
          const changed = a.blocks.filter((x: string, i: number) => x !== b.blocks[i]).map((x: string, i: number) => [x, b.blocks[a.blocks.indexOf(x)]]);
          diffs.push({ name, level, mode, pills: b.pills, blocksSame: ba === bb, wiresSame: wa === wb, changed: a.blocks.map((x: string, i: number) => x === b.blocks[i] ? null : [x, b.blocks[i]]).filter(Boolean) });
        }
      }
    }
  }
  writeFileSync(`${OUT}/layout-${info.project.name}.json`, JSON.stringify({ compared: n, diffs }, null, 1));
});
