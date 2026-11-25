import { each, open, drop, dropOver, press, cur, pref, focusedRegion, text, bye } from "./common.mjs";
for (const n of (process.argv[2] ?? "chromium,firefox,webkit").split(",")) {
  const say = (...a) => console.log(n, ...a);
  const scr = (page) => page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => (e.scrollTop || e.scrollLeft) && !e.matches(".tab-body, .body")).map((e) => e.localName + "." + e.className + ":" + e.scrollTop + "," + e.scrollLeft));
  let page = await open(n, { viewport: { width: 760, height: 700 } });
  await drop(page, "library_deployment"); await press(page, "c"); await press(page,'g','t','g','t','g','t'); await page.waitForTimeout(100);
  say("canvas width", await page.evaluate(() => document.querySelector(".viewport").clientWidth), "legend", await page.evaluate(() => document.querySelector(".legend")?.offsetWidth));
  await page.locator("button.swatch").last().evaluate((e) => e.click()); await page.waitForTimeout(150); say("narrow canvas, swatch pressed: scrolled", await scr(page));
  await page.b.close();
  // a focused line while the level changes: held focus, line in view at the new level's legend?
  page = await open(n, { viewport: { width: 1100, height: 400 } });
  await drop(page, "large"); await press(page, "c"); await page.waitForTimeout(200);
  const view = () => page.evaluate(() => { const l = document.querySelector(".legend"), b = l?.querySelector('[aria-pressed="true"]'); if (!b) return "no line"; const r = b.getBoundingClientRect(), q = l.getBoundingClientRect(); return { in: r.top >= q.top - 1 && r.bottom <= q.bottom + 1, st: l.scrollTop }; });
  await page.locator(".legend .line").last().evaluate((e) => e.click()); await page.waitForTimeout(100); say("last line focused", await view());
  await page.evaluate(() => document.querySelector(".legend").scrollTop = 0);
  // tier off/on clears focus; resizing the window
  await page.setViewportSize({ width: 1100, height: 320 }); await page.waitForTimeout(150); say("after a lower window", await view(), await scr(page));
  await page.b.close();
  // first press in tier mode
  page = await open(n, { viewport: { width: 1100, height: 520 } });
  await drop(page, "timing_deployment"); await press(page,'g','t','g','t','g','t'); await page.locator("button.swatch").last().evaluate((e) => e.click()); await page.waitForTimeout(200); say("tier mode swatch", await view(), await scr(page));
  await page.b.close();
}
bye();
