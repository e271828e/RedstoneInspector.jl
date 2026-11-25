// The focus a click leaves on each kind of stop, before the page sets it; and focus-visible once the page does.
import { test, type Page } from "@playwright/test";
import { active, drop, say } from "./common";
async function at(page: Page, sel: string, name: string) {
  const el = page.locator(sel).first();
  if (!(await el.count())) return say(`${name}: absent`);
  await page.locator("nav.tree").focus();
  await el.scrollIntoViewIfNeeded();
  const b = (await el.boundingBox())!;
  await page.mouse.move(b.x + Math.min(b.width / 2, 12), b.y + b.height / 2);
  await page.mouse.down(); const down = await active(page);
  await page.mouse.up(); await page.waitForTimeout(150);
  say(`${name}: press ${down} ; click ${await active(page)}`);
  const el2 = page.locator(sel).first();
  if (await el2.count()) { await el2.evaluate((e: HTMLElement) => e.focus()); say(`   then focus() by the page: ${await active(page)}`); }
}
test("click", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.evaluate(() => document.addEventListener("click", (e) => { if ((e.target as Element).closest("a[target=_blank]")) e.preventDefault(); }, true));
  await at(page, 'details[data-section="docstring"] summary', "section heading");
  await at(page, "aside.detail button.copy", "copy button");
  await page.evaluate(() => { for (const d of document.querySelectorAll<HTMLDetailsElement>("aside.detail details")) d.open = true; });
  await at(page, "aside.detail button.location", "location button");
  await at(page, "aside.detail .docstring a", "docstring link");
  await at(page, "aside.detail tr[data-port] .face-name", "face row");
  await page.evaluate(() => { for (const d of document.querySelectorAll<HTMLDetailsElement>("aside.detail details")) d.open = true; });
  await at(page, "aside.detail a.producer, aside.detail a.consumer", "face link");
  for (const [tab, sel] of [["order", "li.step button.row"], ["order", "li.step .ports li"], ["timing", "button.sort-period"], ["root-inputs", "button.row"]] as const) {
    await page.evaluate((t) => { const d = document.querySelector<HTMLElement>("section.drawer")!; if (d.dataset.tab !== t || d.dataset.open !== "true") document.querySelector<HTMLElement>(`button.tab[data-tab="${t}"]`)!.click(); }, tab);
    await page.waitForTimeout(150);
    await at(page, `section.drawer ${sel}`, `drawer ${tab} ${sel}`);
  }
  await at(page, 'button.tab[data-tab="timing"]', "drawer tab");
  await drop(page, "timing_deployment");
  await page.evaluate(() => { const d = document.querySelector<HTMLElement>("section.drawer")!; if (d.dataset.tab !== "timing" || d.dataset.open !== "true") document.querySelector<HTMLElement>('button.tab[data-tab="timing"]')!.click(); });
  await page.waitForTimeout(200);
  await at(page, "section.drawer button.swatch", "chart swatch");
  await at(page, "section.drawer tr.component button.row", "timing row");
  await at(page, ".legend button.line", "legend line");
  await drop(page, "failure_cycle");
  await at(page, "li.diagnostic button.row", "diagnostics row");
  await at(page, "li.diagnostic a", "diagnostics link");
  await at(page, "g.block.pin", "canvas pin, for comparison");
});
