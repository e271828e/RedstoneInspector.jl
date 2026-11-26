import { each, drop, press } from "./common.mjs";
// which key under the help page leaves the second ? unable to close it, in each browser
const KEYS = ["j", "k", "h", "l", "d", "u", "g", "g", "Shift+G", "r", "e", "Shift+Q", "Shift+E", "Shift+R", "c", "o", "y", "t", "0", "x", "Shift+X", "g", "t", "z", "h", "Enter", "Backspace"];
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const st = () => page.evaluate(() => ({ help: !!document.querySelector("article.help"), hash: location.hash, active: document.activeElement?.localName + "." + document.activeElement?.className, hist: history.length }));
  for (const k of KEYS) {
    await drop(page, "closed_loop");
    await press(page, "?");
    const a = await st();
    await page.evaluate(() => { window.__pop = 0; addEventListener("popstate", () => window.__pop++); addEventListener("hashchange", () => window.__pop += 100); });
    await press(page, k); await page.waitForTimeout(80);
    const b = await st(); const pop = await page.evaluate(() => window.__pop);
    await press(page, "?"); await page.waitForTimeout(80);
    const c = await st();
    if (c.help || !b.help || pop) console.log(n, k, "before", JSON.stringify(a), "after key", JSON.stringify(b), "pop", pop, "after ?", JSON.stringify(c));
  }
  console.log(n, "done");
});
