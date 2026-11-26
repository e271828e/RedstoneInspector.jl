import { appendFileSync, readFileSync } from "node:fs";
import { test, type Page } from "@playwright/test";
export const fixture = (n: string) => readFileSync(`${process.env.FRONTEND}/fixtures/${n}.json`, "utf8");
export const say = (s: string) => appendFileSync(new URL("out.txt", import.meta.url), `[${test.info().project.name}] ${s}\n`);
export async function drop(page: Page, name: string, go = true) {
  if (go) await page.goto("/");
  await page.evaluate(({ text, file }) => {
    for (const el of document.querySelectorAll("svg.canvas")) (el as any).__before = true;
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text: fixture(name), file: `${name}.json` });
  await page.waitForFunction(() => { const s = document.querySelector("svg.canvas[data-ready]") as any; return s && !s.__before; });
  await page.waitForTimeout(150);
}
/** A one-line name of the focused element. */
export const active = (page: Page) => page.evaluate(() => {
  const a = document.activeElement as HTMLElement | null;
  if (!a) return "null";
  const t = a === document.body ? "" : (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
  return `${a.tagName.toLowerCase()}${a.className ? "." + String(a.className).replace(/ ?s(velte)?-[\w-]+/g, "").trim().replace(/\s+/g, ".") : ""} "${t}" fv=${a.matches(":focus-visible")}`;
});
