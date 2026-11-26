// Whether a focused stop of the detail pane survives a new selection, and where the focus goes when it does not.
import { test, type Page } from "@playwright/test";
import { active, drop, say } from "./common";
const kind = (page: Page) => page.evaluate(() => { const a = document.querySelector<HTMLElement>("aside.detail")!; return `${a.dataset.kind}:${a.dataset.id || "/"}`; });
const focusStop = (page: Page, sel: string) => page.evaluate((s) => {
  const e = document.querySelector<HTMLElement>(`aside.detail ${s}`);
  if (!e) return false;
  for (const x of document.querySelectorAll("*")) delete (x as any).__mark;
  (e as any).__mark = true; e.focus({ preventScroll: true });
  return document.activeElement === e;
}, sel);
const after = (page: Page) => page.evaluate(() => {
  const a = document.activeElement as any;
  const alive = [...document.querySelectorAll("*")].some((x) => (x as any).__mark);
  const focused = [...document.querySelectorAll(".focused")].map((x) => x.className.toString().split(" ")[0]).join(",");
  return `element ${alive ? "survives" : "replaced"}, focus ${a?.__mark ? "kept" : "moved to"} ${a?.tagName.toLowerCase()}.${String(a?.className).split(" ")[0]}; region ${focused || "none"}`;
});
/** A canvas block selected with no press, so no focus moves. */
const click = (page: Page, id: string) => page.evaluate((id) => {
  document.querySelector(`g.block[data-id="${id}"]`)!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}, id);
test("redraw", async ({ page }) => {
  await drop(page, "closed_loop");
  const blocks = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("g.block")].map((g) => `${g.dataset.id}:${g.classList.contains("assembly") ? "A" : g.classList.contains("primitive") ? "P" : "pin"}`));
  say("blocks " + blocks.join(" "));
  const A = blocks.filter((b) => b.endsWith(":A")).map((b) => b.slice(0, -2)), P = blocks.filter((b) => b.endsWith(":P")).map((b) => b.slice(0, -2)), pin = blocks.find((b) => b.endsWith(":pin"))?.slice(0, -4);
  const go = async (from: string | undefined, sel: string, act: () => Promise<any>, name: string) => {
    if (from !== undefined) await click(page, from); else { await page.keyboard.press("Escape"); await page.keyboard.press("Escape"); }
    await page.waitForTimeout(120);
    const before = await kind(page);
    if (!(await focusStop(page, sel))) return say(`${name}: ${sel} not focusable at ${before}`);
    await act(); await page.waitForTimeout(300);
    say(`${name} (${sel}): ${before} -> ${await kind(page)}: ${await after(page)}`);
  };
  for (const s of ["faces", "parameters", "locations", "docstring"]) await page.evaluate((s) => document.querySelector<HTMLElement>(`aside.detail details[data-section="${s}"] summary`)?.click(), s);
  for (const sel of ['details[data-section="faces"] summary', 'details[data-section="locations"] summary', "button.copy"]) {
    await go(A[0], sel, () => click(page, A[1]), "assembly to assembly");
    await go(A[0], sel, () => click(page, P[0] ?? A[1]), "assembly to primitive");
    await go(A[0], sel, () => click(page, pin!), "assembly to pin");
    await go(undefined, sel, () => click(page, A[0]), "level to assembly");
    await go(A[0], sel, async () => { await page.keyboard.press("Escape"); }, "assembly to level by Escape");
    await go(A[0], sel, async () => { await page.keyboard.press("Shift+J"); await page.waitForTimeout(400); }, "opened by Shift-j");
    await page.keyboard.press("Shift+K"); await page.waitForTimeout(500);
    await go(A[0], sel, () => drop(page, "closed_loop_deployment", false), "a push");
    await go(A[0], sel, () => drop(page, "closed_loop", false), "a push back");
  }
  await page.evaluate(() => document.querySelector<HTMLDetailsElement>('aside.detail details[data-section="faces"]')!.open = true);
  await go(A[0], "a.producer, a.consumer", () => page.evaluate(() => (document.activeElement as HTMLElement).click()), "a face link pressed");
  await go(A[0], "a.producer, a.consumer", () => click(page, A[1]), "a face link, another assembly");
});
