import { each, open, drop, dropOver, press, cur, pref, focusedRegion, text, bye } from "./common.mjs";
const names = (process.argv[2] ?? "chromium,firefox,webkit").split(",");
for (const n of names) {
  for (const [w, h, f] of [[1100, 700, "large"], [1100, 400, "large"], [700, 300, "large"], [900, 260, "library_deployment"], [1400, 900, "closed_loop_deployment"], [1400, 900, "rates_deployment"]]) {
    const page = await open(n, { viewport: { width: w, height: h }, launch: n === "chromium" ? { ignoreDefaultArgs: ["--hide-scrollbars"] } : {} });
    const say = (...a) => console.log(n, f, w, h, ...a);
    await drop(page, f); await press(page, "c"); await page.waitForTimeout(150); await press(page, "0"); await page.waitForTimeout(100);
    const m = () => page.evaluate(() => { const l = document.querySelector(".legend"), v = document.querySelector(".viewport"); if (!l) return "none"; const r = l.getBoundingClientRect(), q = v.getBoundingClientRect();
      const line = l.querySelector("li:last-child .line").getBoundingClientRect();
      return { top: r.top - q.top, bottom: q.bottom - r.bottom, left: r.left - q.left, w: Math.round(r.width), h: r.height, client: [l.clientWidth, l.clientHeight], scroll: [l.scrollWidth, l.scrollHeight], bar: l.offsetWidth - l.clientWidth, vw: q.width, view: document.querySelector("svg.canvas").getAttribute("viewBox") }; });
    say(JSON.stringify(await m()));
    const l = await page.locator(".legend").boundingBox();
    if (l) {
      await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2);
      const v0 = (await m()).view;
      await page.mouse.wheel(0, -50); await page.waitForTimeout(100); const a = await m(); 
      for (let i = 0; i < 30; i++) await page.mouse.wheel(0, 100); await page.waitForTimeout(300);
      const bt = await page.evaluate(() => [document.querySelector(".legend").scrollTop, document.querySelector(".legend").scrollHeight - document.querySelector(".legend").clientHeight]);
      await page.mouse.wheel(0, 100); await page.waitForTimeout(100);
      const c = await m(); say("view unchanged by wheel at top/bottom:", a.view === v0, c.view === v0, "scroll", bt);
      // horizontal wheel
      await page.mouse.wheel(100, 0); await page.keyboard.down("Control"); await page.mouse.wheel(0, 50); await page.keyboard.up("Control"); await page.waitForTimeout(100); say("ctrl wheel", (await m()).view === v0);
      // drag on legend pans?
      await page.mouse.move(l.x + l.width / 2, l.y + 6); await page.mouse.down(); await page.mouse.move(l.x + l.width + 50, l.y + 60, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(80); say("drag from legend pans?", (await m()).view !== v0);
      // columns aligned; text overflow
      say("text", await page.evaluate(() => [...document.querySelectorAll(".legend li")].slice(0, 3).map((x) => x.innerText.replace(/\s+/g, " "))));
    }
    if (w === 1100 && h === 700) await page.screenshot({ path: `legend_${n}_${f}.png` });
    if (page.errs.length) say("ERR", page.errs);
    await page.b.close();
  }
}
bye();
