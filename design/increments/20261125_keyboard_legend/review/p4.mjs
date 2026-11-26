import { each, drop, dropOver, press, cur, pref, focusedRegion, text } from "./common.mjs";
await each((process.argv[2] ?? "chromium,firefox,webkit").split(","), async (page, n) => {
  const say = (...a) => console.log(n, ...a);
  for (const f of ["failure_structure", "primitive"]) {
    await drop(page, f);
    const out = [];
    for (const k of ["q","w","e","r","q","j","G","g","e","j","k","h","l","d","u","z","r","j","k","l","h","Shift+G","g","g","g","t","Shift+J","Enter","Shift+K","0","+","z","z","c","y","o","x","Shift+X","t","n","/","Escape","w","j","d","Shift+Q","Shift+Q","Shift+E","Shift+E","Shift+R","Shift+R"]) { await press(page, k); out.push(k + ":" + (await cur(page)).slice(0, 24) + (await pref(page) ? "[" + await pref(page) + "]" : "")); }
    say(f, out.join("  "));
  }
  // each stop kind: collapse, level change, push, tab switch
  const kinds = { summary: "aside.detail details[data-section=faces] summary", facerow: "aside.detail td.face-name button.row", link: "aside.detail td.links a", copy: "aside.detail button.copy", open: "aside.detail button.open-level", loc: "aside.detail button.location" };
  for (const [k, sel] of Object.entries(kinds)) {
    const r = [];
    const go = async () => { await drop(page, "closed_loop"); await page.locator('g.block[data-id="lqr_controller"]').click(); await page.evaluate(() => document.querySelectorAll("aside.detail details").forEach((d) => d.open = true)); await page.waitForTimeout(60); await page.locator(sel).first().focus(); };
    await go(); await press(page, "Shift+E"); r.push("E:" + await cur(page));
    await press(page, "e"); r.push("e:" + await cur(page));
    await go(); await press(page, "Shift+J"); await page.waitForTimeout(400); r.push("J:" + await cur(page));
    await go(); await press(page, "Escape"); await page.waitForTimeout(60); r.push("Esc:" + await cur(page));
    await go(); await dropOver(page, "closed_loop_deployment"); r.push("push:" + await cur(page));
    await go(); await dropOver(page, "failure_structure"); await page.waitForTimeout(60); r.push("pushF:" + await cur(page) + "/" + await focusedRegion(page));
    await go(); await dropOver(page, "primitive"); await page.waitForTimeout(60); r.push("pushP:" + await cur(page));
    await go(); await page.evaluate(() => document.querySelector('nav.tree .row:nth-child(1)') ); await page.evaluate(() => [...document.querySelectorAll("g.block")].find((b) => b.dataset.id === "plant").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await page.waitForTimeout(60); r.push("plant:" + await cur(page));
    say(k, r.join(" | "));
  }
  // drawer stops
  const d = { row: ["timing", "tr.component button.row"], swatch: ["timing", "button.swatch"], sort: ["timing", "button.sort-period"], order: ["order", "li.edge button.row"], rin: ["root-inputs", "button.row"] };
  for (const [k, [tab, sel]] of Object.entries(d)) {
    const r = [];
    const go = async () => { await drop(page, "closed_loop_deployment"); await page.locator(`button.tab[data-tab="${tab}"]`).click(); await page.locator("section.drawer " + sel).first().focus(); };
    await go(); await press(page, "Shift+R"); r.push("R:" + await cur(page)); await press(page, "r"); r.push("r:" + await cur(page));
    await go(); await press(page, "g", "t"); r.push("gt:" + await cur(page) + "/" + await focusedRegion(page));
    await go(); await dropOver(page, "closed_loop_deployment"); r.push("push:" + await cur(page));
    await go(); await dropOver(page, "closed_loop"); r.push("pushbuild:" + await cur(page));
    await go(); await dropOver(page, "failure_structure"); await page.waitForTimeout(60); r.push("pushF:" + await cur(page) + "/" + await focusedRegion(page));
    await go(); await press(page, "Enter"); await page.waitForTimeout(250); r.push("Enter:" + await cur(page) + " lvl " + await page.evaluate(() => document.querySelector("svg.canvas").dataset.level));
    say(k, r.join(" | "));
  }
});
