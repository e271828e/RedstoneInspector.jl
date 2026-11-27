// Probe helpers, copied in spirit from the harness. PROBE_ROOT is the frontend folder under probe, its fixtures read
// from there; PROBE_OUT the folder the logs and the screenshots, under shots/, go to.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { test, type Page } from "@playwright/test";

export const W = process.env.PROBE_ROOT!;
export const P = process.env.PROBE_OUT!;
export const fixtureText = (name: string) => readFileSync(`${W}/fixtures/${name}.json`, "utf8");
export const readyLevel = (level: string) => `svg.canvas[data-level="${level}"][data-ready]`;

export async function drop(page: Page, name: string, text = fixtureText(name)) {
  await page.goto("/");
  await page.locator("button.open-file").first().waitFor();
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForFunction(() => document.querySelector("svg.canvas[data-ready]") || document.querySelector("pre.outcome"));
}

export async function press(page: Page, key: string) {
  await page.keyboard.press(key);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

export async function openPath(page: Page, path: string) {
  const segments = path.split("/");
  for (let i = 1; i <= segments.length; i++) {
    const p = segments.slice(0, i).join("/");
    if (i < segments.length && !(await page.locator(`g.block[data-id="${p}"]`).count())) continue;
    await page.locator(`g.block[data-id="${p}"]`).dblclick();
    await page.locator(readyLevel(p)).waitFor();
  }
}

export async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${P}/shots/${name}.${test.info().project.name}.png` });
}

export const log = (file: string, line: string) => appendFileSync(`${P}/${file}`, line + "\n");
export const reset = (file: string) => writeFileSync(`${P}/${file}`, "");

/** Every overlay pill on the drawn level and what it meets, in client pixels. */
export const pillReport = (page: Page) => page.evaluate(() => {
  const rect = (e: Element) => e.getBoundingClientRect();
  const meet = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const pills = [...document.querySelectorAll("g.overlay g.badge")].map((g) => ({
    id: g.getAttribute("data-id")!, port: g.getAttribute("data-port"), role: g.getAttribute("data-role")!, r: rect(g.querySelector("rect")!),
    text: g.querySelector("text")!.textContent,
  }));
  const blocks = [...document.querySelectorAll("g.blocks > g.block")].map((b) => ({ id: b.getAttribute("data-id")!, r: rect(b.querySelector(".shape")!) }));
  const svg = document.querySelector<SVGSVGElement>("svg.canvas")!, vb = svg.viewBox.baseVal, at = svg.getBoundingClientRect(), scale = svg.clientWidth / vb.width;
  const labels = [...document.querySelectorAll<SVGTextElement>("text.type-label")].map((t) => {
    const x = t.x.baseVal.getItem(0).value, b = t.getBBox();
    const cx = (u: number) => at.left + (u - vb.x) * scale, cy = (u: number) => at.top + (u - vb.y) * scale;
    return { port: t.getAttribute("data-port"), r: new DOMRect(cx(x), cy(b.y), t.getComputedTextLength() * scale, b.height * scale) };
  });
  const legend = document.querySelector("div.legend");
  const lr = legend ? rect(legend) : undefined;
  const ports = [...document.querySelectorAll("rect.port")].map((p) => ({ id: p.getAttribute("data-port")!, r: rect(p) }));
  const out: string[] = [];
  for (const [i, p] of pills.entries()) {
    for (const q of pills.slice(i + 1)) if (meet(p.r, q.r)) out.push(`pill/pill ${p.role}@${p.port ?? p.id} ${q.role}@${q.port ?? q.id}`);
    for (const b of blocks) if (meet(p.r, b.r)) out.push(`pill/block ${p.role}@${p.port ?? p.id} meets ${b.id}`);
    for (const l of labels) if (meet(p.r, l.r)) out.push(`pill/label ${p.role}@${p.port ?? p.id} meets label ${l.port}`);
    for (const o of ports) if (meet(p.r, o.r)) out.push(`pill/port ${p.role}@${p.port ?? p.id} meets port ${o.id}`);
    if (lr && meet(p.r, lr)) out.push(`pill/legend ${p.role}@${p.port ?? p.id}`);
    if (p.r.left < at.left || p.r.right > at.right || p.r.top < at.top || p.r.bottom > at.bottom) out.push(`pill/outside-svg ${p.role}@${p.port ?? p.id}`);
  }
  return { n: pills.length, issues: out, scale };
});
