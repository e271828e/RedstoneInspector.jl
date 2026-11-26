import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').click(); await page.waitForTimeout(100);
  // S6 double-click selects word in a face name? and drag
  const b = page.locator("td.face-name button.row").nth(3); const bx = await b.boundingBox();
  await page.mouse.move(bx.x + 1, bx.y + bx.height / 2); await page.mouse.down(); await page.mouse.move(bx.x + bx.width - 1, bx.y + bx.height / 2, { steps: 6 });
  say("drag over face name selects:", JSON.stringify(await page.evaluate(() => getSelection().toString())), "user-select", await b.evaluate((e) => getComputedStyle(e).userSelect)); await page.mouse.up(); await page.waitForTimeout(100);
  say(" after up pane kind", await page.evaluate(() => document.querySelector("aside.detail").dataset.kind));
  // whole row drag from type into name
  await page.locator('g.block[data-id="plant"]').click(); await page.waitForTimeout(100);
  const ty = await page.locator("td.face-type").nth(2).boundingBox();
  await page.mouse.move(ty.x + 1, ty.y + ty.height / 2); await page.mouse.down(); await page.mouse.move(ty.x + 40, ty.y + ty.height / 2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100);
  say("drag over a type cell then kind:", await page.evaluate(() => document.querySelector("aside.detail").dataset.kind), JSON.stringify(await page.evaluate(() => getSelection().toString())));
  // location select: drag
  // drawer: drag on an analysis row that keeps a text selection; the cursor?
  await page.locator('g.block[data-id="plant"]').click();
  await page.locator('button.tab[data-tab="root-inputs"]').click(); await page.waitForTimeout(100);
  const kd = await page.locator("tr.root-input td.type").nth(1).boundingBox();
  await page.mouse.move(kd.x + 2, kd.y + kd.height / 2); await page.mouse.down(); await page.mouse.move(kd.x + 40, kd.y + kd.height / 2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100);
  say("drag on a drawer row: selection", JSON.stringify(await page.evaluate(() => getSelection().toString())), "cursor", await cur(page), "pane", await page.evaluate(() => document.querySelector("aside.detail").dataset.id));
  // folder pane, wire pane, pin pane rows; select all ids with stops: list depth 
  // gT etc from search
  // a typing with a pending prefix
  await press(page, "g"); await page.locator("input.query").click(); say("pending in field", await pref(page)); await page.keyboard.type("pl"); await press(page, "Enter"); say("after Enter", await pref(page), await cur(page));
  await press(page, "j"); say("j then", JSON.stringify(await pref(page)));
  // held z, focus a text field, release, all ok (tested)
  // Enter on the tab strip button
  await press(page, "Escape","Escape","Escape");
  await page.locator('g.block[data-id="sensing"]').click();
  await page.locator('button.tab[data-tab="order"]').click(); say("tab button", await cur(page)); await press(page, "Enter"); await page.waitForTimeout(300);
  say("Enter on a focused tab button: level", await page.evaluate(() => document.querySelector("svg.canvas").dataset.level), "drawer open", await page.evaluate(() => document.querySelector("section.drawer").dataset.open));
  await press(page, "Shift+K"); await page.waitForTimeout(300);
  await page.locator("button.tab[data-tab=order]").click(); await page.waitForTimeout(50); // closes maybe
  // legend line focus Enter
  await press(page, "w", "c"); await page.locator("button.line").nth(1).click(); say("line", await cur(page)); await page.locator('g.block[data-id="sensing"]').evaluate((e) => e.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await press(page, "Enter"); await page.waitForTimeout(300); say("Enter on a legend line: level", await page.evaluate(() => document.querySelector("svg.canvas").dataset.level));
});
