import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop"); await page.locator('button.tab[data-tab="root-inputs"]').click(); await page.waitForTimeout(100);
  const sel = () => page.evaluate(() => getSelection().toString());
  const pane = () => page.evaluate(() => document.querySelector("aside.detail").dataset.id);
  for (const [what, loc] of [["type cell", page.locator("tr.root-input td.type code").first()], ["consumer", page.locator("tr.root-input span.consumer code").first()]]) {
    await page.locator("footer.status .counts").click(); await press(page, "Escape", "Escape"); await page.evaluate(() => getSelection().removeAllRanges());
    const b = await loc.boundingBox(); await page.mouse.move(b.x + 1, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width - 2, b.y + b.height / 2, { steps: 8 }); const mid = await sel(); await page.mouse.up(); await page.waitForTimeout(80);
    say(what, "during", JSON.stringify(mid), "after", JSON.stringify(await sel()), "pane", await pane(), "cursor", await cur(page));
  }
  // a location in the detail pane
  await page.evaluate(() => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === "plant").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await page.evaluate(() => document.querySelector("aside.detail details[data-section=docstring]").open = true); await page.waitForTimeout(80);
  await page.locator("aside.detail summary").first().click(); await page.locator("aside.detail summary").first().click(); // cursor on the heading
  const p = await page.locator("div.docstring p").first().boundingBox(); await page.mouse.move(p.x + 2, p.y + 8); await page.mouse.down(); await page.mouse.move(p.x + 150, p.y + 8, { steps: 6 }); await page.mouse.up(); say("docstring drag", JSON.stringify(await sel()), await cur(page)); await press(page, "j"); say("then j", await cur(page), JSON.stringify(await sel()));
});
