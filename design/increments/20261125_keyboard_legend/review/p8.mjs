import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  await drop(page, "large");
  // cost
  const cost = async (what, key, N = 40) => { const t = await page.evaluate(async ([key, N]) => { const out = []; for (let i = 0; i < N; i++) { const t0 = performance.now(); document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })); void document.body.offsetHeight; out.push(performance.now() - t0); await new Promise((r) => requestAnimationFrame(r)); } out.sort((a, b) => a - b); return [out[Math.floor(N / 2)].toFixed(1), out[N - 1].toFixed(1)]; }, [key, N]); say("cost", what, key, "median/max ms", t.join("/")); };
  await press(page, "q", "j"); await cost("tree", "j");
  await press(page, "e"); await cost("detail level (heads)", "j", 30);
  await page.locator('button.tab[data-tab="order"]').click(); await press(page, "r"); await cost("order", "j"); await press(page, "Shift+G"); await cost("order up", "k");
  await page.locator('button.tab[data-tab="timing"]').click(); await press(page, "r"); await cost("timing", "j");
  say("order stops", await page.evaluate(() => document.querySelectorAll("section.drawer .tab-body :is(summary,button,a[href])").length));
  // gg/G tree already selected, view scrolled away
  await press(page, "q", "g", "g", "d", "d"); const st = () => page.evaluate(() => document.querySelector('.pane[data-pane="tree"] .body').scrollTop); const s0 = await st(); await press(page, "g", "g"); say("tree gg with root selected, scrolled", s0, "->", await st());
  // same in detail pane
  await press(page, "e", "g", "g", "d"); const d = () => page.evaluate(() => document.querySelector('.pane[data-pane="detail"] .body').scrollTop); const d0 = await d(); await press(page, "g", "g"); say("detail gg on first", d0, "->", await d());
  // tree j after scrolling away scrolls back
  // held z: random
  await drop(page, "closed_loop"); await press(page, "w");
  let bad = 0; let held = false; const ks = ["h","j","k","l","i","o","g","x","e","q","r","w","Shift+Q","Shift+Q","/","d","ArrowDown","Enter","Escape","z"]; let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let t = 0; t < 60; t++) { await page.keyboard.down("z"); const k0 = 1 + Math.floor(rnd() * 4); const seq = []; let esc = false; for (let i = 0; i < k0; i++) { const k = ks[Math.floor(rnd() * ks.length)]; if (k === "z") { await page.keyboard.down("z"); seq.push("z(rep)"); } else { seq.push(k); if (k === "Escape") esc = true; await page.keyboard.press(k); } if (esc) break; }
    const during = await pref(page); await page.keyboard.up("z"); const after = await pref(page); const used = seq.some((s) => s !== "z(rep)");
    const exp = esc ? "" : "z …"; const expA = esc ? "" : used ? "" : "z …"; if (during !== exp || after !== expA) { bad++; say("held", seq.join(" "), "during", during, "after", after, "expected", exp, "/", expA); }
    if (after) await press(page, "Escape"); await press(page, "w"); const p = await pref(page); if (p) { bad++; say("left pending", p); } if (await page.evaluate(() => document.activeElement.matches("input"))) await press(page, "Escape"); }
  say("held fuzz bad", bad, await page.evaluate(() => document.querySelector("svg.canvas").dataset.level));
});
