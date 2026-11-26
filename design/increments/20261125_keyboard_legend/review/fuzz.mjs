import { each, drop, dropOver, press, cur, pref, focusedRegion } from "./common.mjs";
const browsers = (process.argv[2] ?? "chromium,firefox").split(","), N = +(process.argv[3] ?? 600), seed0 = +(process.argv[4] ?? 1);
let seed = seed0; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; const pick = (a) => a[Math.floor(rnd() * a.length)];
const plain = ["q","w","e","r","Shift+Q","Shift+E","Shift+R","Tab","Shift+Tab","h","j","k","l","h","j","k","l","j","l","ArrowLeft","ArrowDown","ArrowUp","ArrowRight","Shift+ArrowDown","Enter","Shift+H","Shift+L","Shift+J","Shift+K","Backspace","z","z","z","z","d","u","0","+","-","=","i","o","g","g","g","Shift+G","t","Shift+T","/","n","Shift+N","c","y","x","Shift+X","Escape","Escape","?","m","i","s","f","Space","Alt+ArrowUp","Control+a","Meta+c","PageDown","Home"];
const fixtures = ["closed_loop","library_deployment","containers","failure_probe","failure_structure","primitive","failure_nested","timing_deployment"];
// oracle of the prefix outside help and text fields
const SECOND = { z: ["z","h","j","k","l","i","o"], g: ["g","t","T"] };
await each(browsers, async (page, n) => {
  seed = seed0; await drop(page, "closed_loop"); let oracle = ""; const log = []; let bad = 0;
  const st = () => page.evaluate(() => { const a = document.activeElement; const R = [["nav.tree","tree"],[".viewport","canvas"],["aside.detail","detail"],["section.drawer","drawer"]];
    const typing = a instanceof HTMLInputElement; const reg = R.find(([s]) => a.closest(s))?.[1] ?? "";
    const foc = R.filter(([s]) => document.querySelector(s + ".focused")).map((r) => r[1]).join();
    const scrolled = []; for (let e of [document.scrollingElement, document.body, ...document.querySelectorAll("main, .under, .frame, .center, .canvas-area, .viewport, section.drawer, .pane, .waiting")]) if (e.scrollTop || e.scrollLeft) scrolled.push(e.className || e.localName);
    return { typing, reg, foc, body: a === document.body, help: !!document.querySelector("article.help"), prefix: document.querySelector("span.prefix kbd")?.textContent ?? "", scrolled, model: !!document.querySelector(".frame"), overf: document.scrollingElement.scrollWidth > innerWidth, ae: a.localName + "." + a.className }; });
  for (let i = 0; i < N; i++) {
    const before = await st(); let op; const r = rnd();
    if (r < 0.03) { op = "drop:" + pick(fixtures); await dropOver(page, op.slice(5)).catch((e) => log.push("drop timeout")); }
    else if (r < 0.10) { const sel = pick(["aside.detail summary","aside.detail a","section.drawer .tab","section.drawer .tab-body button","g.block","nav.tree .row","path.hit","button.collapse","nav.breadcrumb a, nav.breadcrumb button","button.line", "aside.detail tr"]);
      op = "click:" + sel; const els = page.locator(sel); const c = await els.count(); if (c && !before.help) await els.nth(Math.floor(rnd() * c)).click({ timeout: 800 }).catch(() => {}); else continue; }
    else if (r < 0.12) { op = "rclick"; const els = page.locator("g.block rect.port, path.hit"); const c = await els.count(); if (c && !before.help) await els.nth(Math.floor(rnd() * c)).click({ button: "right", timeout: 800 }).catch(() => {}); else continue; }
    else { op = pick(plain); if (op === "Meta+c" && n === "firefox") continue; await page.keyboard.press(op); await page.evaluate(() => new Promise((r) => setTimeout(r, 12))); }
    const s = await st(); log.push(op);
    // oracle
    const key = op.replace("Shift+", "").replace(/^Space$/, " "); const name = op.startsWith("Shift+") && key.length === 1 ? key.toUpperCase() : key;
    if (!/^(drop|click|rclick)/.test(op)) {
      if (/Control|Meta/.test(op)) oracle = "";
      else if (before.help) { if (oracle) oracle = ""; else if (name === "g" ) oracle = "g"; }
      else if (before.typing) { if (op !== "Tab") {} }
      else if (!before.model) {}
      else if (op === "Alt+ArrowUp" && oracle) oracle = "";
      else if (oracle) oracle = name === oracle && false ? "" : "";
      else if (name === "z" || name === "g") oracle = name;
    }
    if (before.help !== s.help) oracle = "";
    const p = []; 
    if (s.model && !s.help && s.prefix !== oracle) p.push(`prefix shown '${s.prefix}' oracle '${oracle}'`);
    if (s.reg !== s.foc && !s.help) p.push(`focus in '${s.reg}' (${s.ae}) page says '${s.foc}'`);
    if (s.scrolled.length) p.push("scrolled " + s.scrolled);
    if (s.overf) p.push("page overflow");
    if (!before.body && s.body && !s.help && !/^click|^drop|Escape/.test(op) && s.model) p.push(`focus lost to body after ${op} from ${before.ae}`);
    if (p.length && bad++ < 12) console.log(n, i, log.slice(-5).join(" | "), "=>", p.join("; "));
    oracle = s.model && !s.help ? s.prefix : oracle;
    if (page.errs.length) { console.log(n, i, "ERR", log.slice(-4).join("|"), page.errs.splice(0).join(" / ").slice(0, 300)); }
  }
  console.log(n, "done", N, "bad", bad, await cur(page));
});
