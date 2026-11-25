import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  const faces = () => page.evaluate(() => [...document.querySelectorAll("aside.detail td.face-name")].map((e) => e.textContent));
  const pick = (id) => page.evaluate((id) => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === id).dispatchEvent(new MouseEvent("click", { bubbles: true })), id);
  await pick("lqr_controller"); await page.waitForTimeout(30); const A = await faces(); await pick("pid_controller"); await page.waitForTimeout(30); const B = await faces();
  say("lqr", A.join(" ")); say("pid", B.join(" "));
  await page.locator("input.query").fill("path:_controller"); await page.waitForTimeout(50); await press(page, "w");
  for (const [from, list] of [["lqr_controller", A], ["pid_controller", B]]) for (let i = 0; i < list.length; i++) {
    await pick(from); await page.waitForTimeout(30);
    await page.locator("aside.detail td.face-name button.row").nth(i).focus();
    const c0 = await cur(page);
    await pick(from === "lqr_controller" ? "pid_controller" : "lqr_controller"); await page.waitForTimeout(40);
    const id = await page.evaluate(() => document.querySelector("aside.detail").dataset.id);
    const now = await faces(); const has = now.includes(list[i]); const c = await cur(page), r = await focusedRegion(page);
    if (c === "BODY" || (has && !c.startsWith("button.row " + list[i]))) say(from, "->", id, "stop", list[i], "in new pane:", has, "cursor", c, "region", JSON.stringify(r));
  }
});
