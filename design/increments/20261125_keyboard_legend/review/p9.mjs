import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "closed_loop");
  console.log(n, await page.evaluate(() => JSON.stringify(localStorage)));
  // narrow the detail pane by dragging its splitter
  const narrow = async () => { const s = await page.locator('.splitter[data-pane="detail"]').boundingBox(); await page.mouse.move(s.x + 2, 300); await page.mouse.down(); await page.mouse.move(1390, 300, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(80); };
  await narrow(); say("pane", await page.evaluate(() => document.querySelector('.pane[data-pane="detail"]').offsetWidth));
  const t = text("closed_loop").replaceAll('"δe_prev"', '"a_rather_long_face_name_that_wraps_somewhere_in_the_pane"');
  for (const [f, tx] of [["closed_loop", t], ["kinds", undefined], ["library_deployment", undefined], ["containers", undefined]]) {
    await dropOver(page, f, tx ?? text(f)); 
    const ids = await page.evaluate(() => [...document.querySelectorAll("g.block:not(.pin)")].map((b) => b.dataset.id)); let worst = 0, ring = [];
    for (const id of ids) { await page.evaluate((id) => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === id).dispatchEvent(new MouseEvent("click", { bubbles: true })), id); await page.evaluate(() => document.querySelectorAll("aside.detail details").forEach((d) => d.open = true)); await page.waitForTimeout(15);
      const o = await page.evaluate(() => { const b = document.querySelector('.pane[data-pane="detail"] .body'); return [b.scrollWidth - b.clientWidth, [...document.querySelectorAll("aside.detail td.face-name button")].filter((e) => e.getBoundingClientRect().right > b.getBoundingClientRect().left + b.clientWidth).length]; });
      if (o[0] > 0 || o[1]) worst = Math.max(worst, o[0]), ring.push(id + ":" + o); }
    say(f, ids.length, "overflow", worst, ring.slice(0, 6).join(" "));
  }
  // rings clipped: every stop walked in the narrow pane, outline within the body
  await dropOver(page, "closed_loop", t); await page.evaluate(() => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === "lqr_controller").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await press(page, "e"); const clip = []; let last = "";
  for (let i = 0; i < 40; i++) { await press(page, "j"); const c = await cur(page); if (c === last && i > 3) break; last = c; const r = await page.evaluate(() => { const b = document.querySelector('.pane[data-pane="detail"] .body').getBoundingClientRect(), e = document.activeElement.getBoundingClientRect(); return [e.left - 3 - b.left, b.right - e.right - 3, e.top - 3 - b.top, b.bottom - e.bottom - 3].map((v) => Math.round(v)); }); if (r.some((v) => v < 0)) clip.push(c + r); }
  say("clipped rings", clip.length, clip.slice(0, 4));
  // push while the menu is open
  const px = await page.locator("g.block rect.port").nth(4).boundingBox(); await page.mouse.click(px.x + 2, px.y + 2, { button: "right" }); await page.waitForTimeout(60); say("menu", await cur(page)); await dropOver(page, "closed_loop_deployment"); await page.waitForTimeout(80); say("push with the menu open", await cur(page), await focusedRegion(page), await page.locator(".menu").count());
  // structureless: Q from tree, E from detail, R from drawer
  for (const [a, b] of [["q", "Shift+Q"], ["e", "Shift+E"], ["r", "Shift+R"]]) { await drop(page, "failure_structure"); await press(page, a, b); await page.waitForTimeout(60); say("failure_structure", a, b, await cur(page), JSON.stringify(await focusedRegion(page))); await press(page, b); }
  // help page: pending g, status bar visible?
  await drop(page, "closed_loop"); await press(page, "?"); await page.waitForTimeout(100); await press(page, "g"); say("pending on help: on top at status bar", await page.evaluate(() => { const r = document.querySelector("footer.status").getBoundingClientRect(); return document.elementFromPoint(r.left + 20, r.top + 5)?.closest("article.help") ? "help covers it" : "visible"; }));
});
