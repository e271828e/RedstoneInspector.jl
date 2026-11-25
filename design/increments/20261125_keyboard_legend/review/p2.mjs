import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
const outer = (page) => page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => (e.scrollTop || e.scrollLeft) && !e.matches(".tab-body, .body, .legend")).map((e) => e.localName + "." + e.className + ":" + e.scrollTop + "," + e.scrollLeft));
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  // S2 zz outer scrolls, per region
  await press(page, "q", "j", "j", "z", "z"); say("zz tree outer", await outer(page));
  await press(page, "Shift+G", "z", "z"); say("zz tree end", await outer(page));
  await page.locator('g.block[data-id="plant"]').click(); await press(page, "e", "Shift+G", "z", "z"); say("zz detail end", await cur(page), await outer(page));
  await press(page, "g", "g", "z", "z"); say("zz detail first", await cur(page), await outer(page));
  await press(page, "r", "g", "t", "g", "t", "Shift+G", "z", "z"); say("zz drawer last", await cur(page), await outer(page));
  // S7 menu
  await drop(page, "closed_loop");
  await page.locator("nav.tree .row").nth(2).click(); say("focus tree", await focusedRegion(page));
  const box = await page.locator("g.block rect.port").first().boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  say("menu", await page.locator(".menu").count(), "cursor", await cur(page), await focusedRegion(page));
  await press(page, "Escape"); say("after Escape cursor", await cur(page), "region", await focusedRegion(page), "sel", await page.locator("g.block.selected").count());
  // the menu, then q: menu stays?
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await press(page, "q"); say("menu after q", await page.locator(".menu").count(), await cur(page));
  await press(page, "Escape"); say("Escape after q: menu", await page.locator(".menu").count(), "cursor", await cur(page));
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await press(page, "l"); say("l under the menu: menu", await page.locator(".menu").count(), "selected", await page.evaluate(() => document.querySelector("g.block.selected")?.dataset.id), await cur(page));
  await press(page, "Shift+J"); await page.waitForTimeout(400); say("Shift-j under menu", await page.locator(".menu").count(), await cur(page), await page.evaluate(() => document.querySelector("svg.canvas").dataset.level));
  // trace by Enter: focus?
  await drop(page, "closed_loop");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await press(page, "Enter"); say("after Enter trace: cursor", await cur(page), "route", await page.locator("span.route").count(), "region", await focusedRegion(page));
  // a press elsewhere closes; focus
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await page.locator(".viewport").click({ position: { x: 400, y: 10 } }); say("after press elsewhere", await cur(page), await page.locator(".menu").count());
  // menu open, wheel closes
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await page.mouse.wheel(0, 10); await page.waitForTimeout(80); say("after wheel", await cur(page), await page.locator(".menu").count());
  // Space presses the entry
  await drop(page, "closed_loop");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" }); await page.waitForTimeout(80);
  await press(page, "z"); say("z on the menu", await pref(page)); await press(page, "Escape"); say("esc with menu+z: menu", await page.locator(".menu").count(), "prefix", await pref(page));
  // menu by right click with help etc. canvas collapse
});
