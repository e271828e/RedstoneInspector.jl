import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  // rings: every stop of the drawer tabs at default, clipped at tab-body's left edge?
  for (const tab of ["root-inputs", "timing", "order", "diagnostics"]) {
    await drop(page, tab === "diagnostics" ? "failure_probe" : "library_deployment"); if (tab !== "diagnostics") await page.locator(`button.tab[data-tab="${tab}"]`).click(); await press(page, "r"); const clip = []; let last = "", N = 0;
    for (let i = 0; i < 60; i++) { await press(page, "j"); const c = await cur(page); const r = await page.evaluate(() => { const e0 = document.activeElement, b0 = document.querySelector("section.drawer .tab-body"), b = b0.getBoundingClientRect(), e = e0.getBoundingClientRect(), off = parseFloat(getComputedStyle(e0).outlineOffset) + 2; return [e.left - off - b.left, b.left + b0.clientWidth - e.right - off, e.top - off - b.top, b.top + b0.clientHeight - e.bottom - off].map((v) => Math.round(v)); }); N++; if (r.some((v) => v < 0)) clip.push(c.slice(0, 30) + r); if (c === last) break; last = c; }
    say(tab, N, "clipped", clip.length, clip.slice(0, 3));
  }
  // stop inside pre? a wide location; order row ring vs path wrap
  // filter: / twice; z pending then "/" dropped; g t from filter types
  await drop(page, "failure_probe"); await press(page, "r", "/"); await page.keyboard.type("gt"); say("filter value", await page.locator("input.filter").inputValue(), "tab", await page.evaluate(() => document.querySelector("section.drawer").dataset.tab)); await press(page, "Tab"); say("Tab from filter", await cur(page));
  // Cmd-O with pending (picker)
  // Enter held on row: repeat
  // Space on a link scrolls?
  // gg in empty tab
  await drop(page, "closed_loop"); await press(page, "r", "g", "g", "Shift+G", "j", "k", "h", "l", "z", "z", "d"); say("empty diagnostics tab", await cur(page));
  // d at the drawer closed
  await press(page, "Shift+R"); await page.evaluate(() => document.querySelector("section.drawer").focus()); await press(page, "d", "z", "j", "g", "g", "Shift+G", "z", "z", "Enter"); say("closed drawer", await cur(page), await focusedRegion(page), await page.evaluate(() => document.querySelector("section.drawer").dataset.open));
  // R with the focus on tab strip when open from closed drawer focused
  await press(page, "Shift+R"); say("R opening a focused closed drawer", await cur(page));
  // caps lock n
  await press(page, "/"); await page.keyboard.type("path:lqr"); await press(page, "Enter");
  const id = () => page.evaluate(() => document.querySelector("aside.detail").dataset.id); const i0 = await id(); await page.evaluate(() => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "N", shiftKey: false, bubbles: true, cancelable: true }))); await page.waitForTimeout(60); const i1 = await id(); await press(page, "n"); await page.waitForTimeout(60); say("Caps n (key N, no Shift):", i0, "->", i1, "then n ->", await id());
});
