// Whether :focus-visible holds on a stop the page focuses: after a click, from a key after that click, and after a key
// that moves nothing; and what Enter and Space do on a heading, a button and a link, no page handler in the way.
import { test, type Page } from "@playwright/test";
import { active, drop, say } from "./common";
const sec = (n: string) => `aside.detail details[data-section="${n}"] summary`;
const opens = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>("aside.detail details[open]")].map((d) => d.dataset.section).join(","));
test("ring", async ({ page }) => {
  await drop(page, "closed_loop");
  // f focuses the second heading from a key handler, as j would
  await page.evaluate((s) => window.addEventListener("keydown", (e) => { if (e.key === "f") document.querySelector<HTMLElement>(s)!.focus(); }, true), sec("faces"));
  await page.locator(sec("docstring")).click();
  await page.locator(sec("docstring")).evaluate((e: HTMLElement) => e.focus());
  say("ring: clicked, focused by the page: " + await active(page));
  await page.keyboard.press("F2"); say("ring: a key that moves nothing: " + await active(page));
  await page.keyboard.press("f"); say("ring: focus() from a key: " + await active(page));
  await page.locator(sec("docstring")).evaluate((e: HTMLElement) => e.focus()); say("ring: focus() by the page after the key: " + await active(page));
  // a click handler that focuses, as ruling 21's page would
  await page.evaluate((s) => document.querySelector(s)!.addEventListener("click", (e) => (e.currentTarget as HTMLElement).focus()), sec("docstring"));
  await page.locator("nav.tree").focus(); await page.locator(sec("docstring")).click(); say("ring: a click handler that focuses: " + await active(page));
  // Enter and Space on a focused stop, nothing selected
  for (const key of ["Enter", "Space"]) {
    await page.locator(sec("faces")).focus(); const a = await opens(page); await page.keyboard.press(key); await page.waitForTimeout(150);
    say(`press: ${key} on a heading: "${a}" -> "${await opens(page)}" ${await active(page)}`);
    await page.evaluate(() => (document.querySelector<HTMLDetailsElement>('aside.detail details[data-section="faces"]')!.open = true));
    await page.waitForTimeout(100);
    // the root's pane has no face link; a primitive selected has one and is nothing Enter opens
    await page.evaluate(() => document.querySelector('g.block[data-id="plant"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(150);
    await page.evaluate(() => (document.querySelector<HTMLDetailsElement>('aside.detail details[data-section="faces"]')!.open = true));
    await page.locator("aside.detail a.producer, aside.detail a.consumer").first().focus();
    await page.keyboard.press(key); await page.waitForTimeout(200);
    say(`press: ${key} on a face link: pane ${await page.locator("aside.detail").getAttribute("data-kind")}`);
    await drop(page, "closed_loop"); // the link opened another level
    // an assembly selected while a stop has the focus: the shell's Enter today
    await page.evaluate(() => document.querySelector('g.block[data-id="sensing"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(150);
    await page.locator(sec("faces")).focus(); const c = await opens(page); await page.keyboard.press(key); await page.waitForTimeout(400);
    say(`press: ${key} on a heading, assembly selected: "${c}" -> "${await opens(page)}", level ${await page.locator("svg.canvas").getAttribute("data-level")}`);
    await drop(page, "closed_loop");
  }
});
