import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  await press(page, "/"); await page.keyboard.type("path:_controller type:group"); await press(page, "Enter"); await page.waitForTimeout(60);
  const id = () => page.evaluate(() => document.querySelector("aside.detail").dataset.id);
  say("pane", await id()); 
  await press(page, "e"); for (let i = 0; i < 30 && !(await cur(page)).startsWith("button.row h_ref"); i++) await press(page, "j");
  say("cursor", await cur(page), await focusedRegion(page));
  await press(page, "n"); await page.waitForTimeout(60); say("n ->", await id(), "cursor", await cur(page), "region", JSON.stringify(await focusedRegion(page)));
  // keys after: j, and a click outside every region
  const sel = () => page.evaluate(() => document.querySelector("g.block.selected")?.dataset.id);
  const s0 = await sel(); await page.locator("footer.status .counts").click(); say("after a click on the status bar: region", JSON.stringify(await focusedRegion(page))); await press(page, "j"); say("j then: selected", s0, "->", await sel(), "cursor", await cur(page));
});
