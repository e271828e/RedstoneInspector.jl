import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
const state = (page) => page.evaluate(() => { const q = (s) => document.querySelector(s); const vb = q("svg.canvas").viewBox.baseVal; const a = document.activeElement;
  return { cur: a === document.body ? "BODY" : a.matches("[tabindex='0']") ? a.className.split(" ")[0] + a.localName : a.localName + "." + a.className.split(" ")[0] + (a.textContent || "").trim().slice(0, 16), sel: (q("g.block.selected") ?? q("nav.tree .row.selected"))?.dataset.id ?? q("nav.tree .row.selected")?.dataset.path ?? "", lvl: q("svg.canvas").dataset.level,
  view: [vb.x, vb.y].map((v) => Math.round(v)).join(), zoom: Math.round(vb.width), tree: q('.pane[data-pane="tree"] .body')?.scrollTop, det: q('.pane[data-pane="detail"] .body')?.scrollTop, dr: q("section.drawer .tab-body")?.scrollTop ?? "closed", tab: q("section.drawer").dataset.tab, tc: !!q('.pane[data-pane="tree"].collapsed'), dc: !!q('.pane[data-pane="detail"].collapsed'), mode: q(".status .mode")?.dataset.mode, lab: q("button.type-labels")?.getAttribute("aria-pressed"), ord: q("button.order-badges, button.order")?.getAttribute("aria-pressed"), help: !!q("article.help"), pre: q("span.prefix kbd")?.textContent ?? "", rows: document.querySelectorAll("nav.tree .row").length, det2: [...document.querySelectorAll("aside.detail details")].map((d) => +d.open).join("") }; });
const regions = { none: [], tree: ["q"], canvas: ["w"], detRoot: ["e"], detStop: ["e", "j", "j"], drRoot: ["r"], drStop: ["r", "j", "j"] };
const keys = [["h"],["j"],["k"],["l"],["ArrowLeft"],["ArrowDown"],["ArrowUp"],["ArrowRight"],["Shift+ArrowDown"],["Shift+ArrowRight"],["Enter"],["Shift+H"],["Shift+L"],["Shift+J"],["Shift+K"],["Backspace"],["Alt+ArrowUp"],["z","h"],["z","j"],["z","k"],["z","l"],["z","z"],["z","i"],["z","o"],["d"],["u"],["0"],["+"],["-"],["g","g"],["Shift+G"],["g","t"],["g","Shift+T"],["/"],["Control+k"],["Meta+k"],["n"],["Shift+N"],["t"],["c"],["y"],["o"],["?"],["x"],["Shift+X"],["Escape"],["Shift+Q"],["Shift+E"],["Shift+R"],["q"],["w"],["e"],["r"],["Tab"],["Shift+Tab"],["m"],["i"],["s"],["f"],["a"],["b"],["v"],["p"],["Shift+U"],["Shift+D"],["Shift+Z"],["Shift+W"],["Shift+C"],["Shift+Y"],["Shift+O"],["z","x"],["g","x"],["Space"]];
await each(["chromium"], async (page, n) => {
  await page.setViewportSize({ width: 1200, height: 620 });
  for (const [reg, pre] of Object.entries(regions)) {
    for (const k of keys) {
      await drop(page, "closed_loop"); await page.evaluate(() => localStorage.clear()); 
      await drop(page, "closed_loop");
      await press(page, "g", "t", "g", "t", "g", "t"); // drawer open on timing
      await page.waitForTimeout(60);
      await page.evaluate(() => document.querySelector('g.block[data-id="lqr_controller"]').dispatchEvent(new MouseEvent("click", { bubbles: true })));
      await press(page, ...pre); await page.waitForTimeout(30);
      const a = await state(page); await press(page, ...k); await page.waitForTimeout(k[0] === "Enter" || /Shift\+[JKHL]|Back|Alt/.test(k[0]) ? 250 : 40); const b = await state(page);
      const d = Object.keys(a).filter((x) => a[x] !== b[x]).map((x) => `${x}: ${a[x]}→${b[x]}`);
      console.log(reg, k.join(""), "::", d.join("; ") || "-");
    }
  }
});
