import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  // S1 refused file while pending
  await drop(page, "closed_loop"); await press(page, "z"); say("S1 pending", await pref(page));
  await dropOver(page, "bad", "{}", false); await page.waitForTimeout(200);
  say("S1 landing", await page.evaluate(() => !document.querySelector(".frame")), "status", await pref(page));
  await dropOver(page, "closed_loop"); say("S1 after reload of a model: prefix", JSON.stringify(await pref(page)));
  await press(page, "Escape");
  // held z, refused
  // S3 alt with z released
  await page.keyboard.down("z"); await page.keyboard.press("j");
  await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Alt", altKey: true, bubbles: true })); window.dispatchEvent(new KeyboardEvent("keyup", { key: "Ω", code: "KeyZ", altKey: true, bubbles: true })); window.dispatchEvent(new KeyboardEvent("keyup", { key: "Alt", bubbles: true })); });
  say("S3 after release under Alt", await pref(page));
  await page.keyboard.up("z"); say("S3 after true keyup", JSON.stringify(await pref(page)));
  // S4 caps n
  // S5 z then Space on a focused stop
  await page.locator('g.block[data-id="plant"]').click(); await press(page, "e", "j"); say("S5 cur", await cur(page));
  await press(page, "j"); const open0 = await page.evaluate(() => document.activeElement.parentElement.open);
  await press(page, "z"); await press(page, "Space"); say("S5 summary toggled by z Space:", open0, "->", await page.evaluate(() => document.activeElement.parentElement.open), JSON.stringify(await pref(page)));
  await press(page, "k"); // copy button
  await page.evaluate(() => { window.__clicks = 0; document.addEventListener("click", () => window.__clicks++, true); });
  await press(page, "z"); await press(page, "Space"); say("S5 button clicks by z Space:", await page.evaluate(() => window.__clicks));
  await press(page, "z"); await press(page, "Enter"); say("S5 button clicks by z Enter:", await page.evaluate(() => window.__clicks));
  await press(page, "Space"); say("Space alone clicks", await page.evaluate(() => window.__clicks));
});
