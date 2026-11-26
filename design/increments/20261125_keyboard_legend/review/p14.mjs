import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
// drawer: stops under sort by the keyboard, a keyed reorder elsewhere; Timing anchors; docstring innerHTML; wire pane to wire pane; port to port; folder
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "library_deployment"); await press(page, "g", "t", "g", "t", "g", "t", "r", "Shift+G");
  say("timing last", await cur(page));
  for (let i = 0; i < 40 && !(await cur(page)).includes("by Δt"); i++) await press(page, "k");
  say(await cur(page)); await press(page, "Space"); say("space sort", await cur(page), await page.evaluate(() => document.querySelector("button.sort-period").getAttribute("aria-pressed"))); await press(page, "Enter"); say("enter sort", await cur(page), await page.evaluate(() => document.querySelector("button.sort-period").getAttribute("aria-pressed")));
  // pin -> pin, via h j k l? the pane's cursor on Trace, then n among faces
  await drop(page, "closed_loop"); await press(page, "/"); await page.keyboard.type("face:h_ref"); await press(page, "Enter"); await page.waitForTimeout(60);
  await press(page, "e", "j", "j"); const out = [await cur(page)]; for (let i = 0; i < 4; i++) { await press(page, "n"); await page.waitForTimeout(80); out.push(await page.evaluate(() => document.querySelector("aside.detail").dataset.kind + ":" + document.querySelector("aside.detail").dataset.id) + " " + await cur(page)); } say(out.join(" | "));
  // docstring link with node change
  await drop(page, "library_deployment"); const pick = (id) => page.evaluate((id) => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === id).dispatchEvent(new MouseEvent("click", { bubbles: true })), id);
  await pick("integrator"); await page.waitForTimeout(40); await page.evaluate(() => document.querySelector("aside.detail details[data-section=docstring]").open = true); await page.waitForTimeout(60);
  await page.locator("div.docstring a").nth(2).focus(); await pick("lag"); await page.waitForTimeout(60); say("docstring link, other node", await cur(page), await focusedRegion(page));
  // links: Enter opens where? target
  say("link target", await page.evaluate(() => document.querySelector("div.docstring a")?.target + " " + document.querySelector("div.docstring a")?.rel));
  // a primitive with fewer faces (removal in Firefox of focused face row) covered
  // level change by breadcrumbs, hash typed: hashchange with cursor
  await drop(page, "closed_loop"); await pick("sensing"); await page.waitForTimeout(40); await page.locator("aside.detail summary").first().focus(); await page.evaluate(() => { location.hash = "#level=sensing"; }); await page.waitForTimeout(400); say("hash typed", await cur(page), await page.evaluate(() => document.querySelector("svg.canvas").dataset.level));
  await page.goBack(); await page.waitForTimeout(300); say("back", await cur(page));
});
