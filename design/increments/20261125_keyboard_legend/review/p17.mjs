import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  const box = await page.locator('rect.port[data-port="plant|out|V"]').boundingBox();
  await page.mouse.click(box.x + 2, box.y + 2, { button: "right" }); await page.waitForTimeout(80);
  await page.locator(".menu button.trace").click(); await page.waitForTimeout(80);
  say("left click on the entry: route", await page.locator("span.route").count(), "menu", await page.locator(".menu").count(), "cursor", await cur(page));
  await page.mouse.click(box.x + 2, box.y + 2, { button: "right" }); await page.waitForTimeout(80);
  await page.locator(".menu button.trace").click({ button: "right" }); await page.waitForTimeout(80);
  say("right click on the entry: menu", await page.locator(".menu").count(), "cursor", await cur(page));
  await page.mouse.click(box.x + 2, box.y + 2, { button: "right" }); await page.waitForTimeout(80);
  await page.evaluate(() => window.dispatchEvent(new Event("blur"))); await page.waitForTimeout(50); say("window blur: menu", await page.locator(".menu").count());
  await page.locator("nav.tree .row").nth(1).click(); await page.waitForTimeout(80); say("tree click with menu: menu", await page.locator(".menu").count(), await cur(page));
  // cursor on a pane stop, click a breadcrumb link
  await page.evaluate(() => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === "sensing").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await page.locator("aside.detail summary").first().focus();
  await press(page, "Shift+J"); await page.waitForTimeout(300); await page.locator("aside.detail summary").first().focus();
  await page.locator('nav.breadcrumb a[data-path=""]').click(); await page.waitForTimeout(300); say("breadcrumb click from a stop:", await cur(page), JSON.stringify(await focusedRegion(page)));
});
