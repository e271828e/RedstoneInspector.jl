// Delta probe for d9e5d0b: F1, F2, the group's scroll, the heads' titles, the help clause, and the click handler's
// reach over every pane's stops, compared with 3d5bc26 (port 4331).
import { writeFileSync } from "node:fs";
import { test, type Page } from "@playwright/test";
import { fixtureText, cursor } from "<worktree>/frontend/e2e/fixtures.ts";

const OUT = "<probes>/browser/out";
const frame = () => new Promise((r) => setTimeout(r, 30));

async function dropAt(page: Page, port: number, name: string, text = fixtureText(name), prefs?: object) {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate((p) => { localStorage.clear(); if (p) localStorage.setItem("redstone-inspector/prefs", JSON.stringify(p)); }, prefs ?? null);
  await page.reload();
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForSelector("svg.canvas[data-ready], pre.outcome");
}
const state = (page: Page) => page.evaluate(() => ({
  id: document.querySelector("aside.detail")?.getAttribute("data-id"),
  ring: [...document.querySelectorAll("table.events tbody.group")].filter((x) => getComputedStyle(x).outlineStyle !== "none").map((x) => (x as HTMLElement).dataset.path),
}));

test("F1: long names at 240 and 360", async ({ page }, info) => {
  const out: any[] = [];
  for (const width of [240, 360]) for (const n of [16, 20, 24, 32, 76]) {
    const d = JSON.parse(fixtureText("events_deployment"));
    const h = d.deployment.build.events.components.find((c: any) => c.path === "heater");
    h.events[0].name = ("heat_on_" + "abcdefghijklmnopqrstuvwxyz0123456789".repeat(3)).slice(0, n);
    await dropAt(page, 4330, "events_deployment", JSON.stringify(d), { version: 1, sizes: { detail: width } });
    await page.locator('g.block[data-id="heater"]').click();
    out.push([width, n, await page.evaluate(() => {
      const a = document.querySelector("aside.detail") as HTMLElement;
      const loc = [...document.querySelectorAll('details.section[data-section="events"] td.localized')].map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
      const ar = a.getBoundingClientRect();
      const pos = [...document.querySelectorAll('details.section[data-section="events"] td.position')].map((c) => (c as HTMLElement).getBoundingClientRect().height);
      return { scrollW: a.scrollWidth, clientW: a.clientWidth, localizedInside: loc.every(([l, r]) => l >= ar.left && r <= ar.right), aside: [Math.round(ar.left), Math.round(ar.right)], rowHeights: pos.map(Math.round) };
    })]);
  }
  writeFileSync(`${OUT}/delta-f1-${info.project.name}.json`, JSON.stringify(out));
});

test("F2, G's scroll, heads' titles, help clause, a selection on a group", async ({ page }, info) => {
  const log: any[] = [];
  const push = (x: any) => { log.push(x); writeFileSync(`${OUT}/delta-f2-${info.project.name}.json`, JSON.stringify(log, null, 1)); };
  await dropAt(page, 4330, "events_deployment");
  await page.locator('button.tab[data-tab="events"]').click();
  for (const [g, r, c] of [["heater", 3, "td.name"], ["heater", 2, "td.localized"], ["heater", 3, "td.position"], ["heater", 2, "td.path"]] as const) {
    const cell = page.locator(`tbody.group[data-path="${g}"] tr.event[data-position="${r}"] ${c}`);
    await cell.scrollIntoViewIfNeeded();
    await cell.click();
    push(["click", g, r, c, await cursor(page), await state(page)]);
  }
  await page.locator('tbody.group[data-path="nest/deep/ball"] td.name').click();
  await page.locator('tbody.group[data-path="heater"] tr.event[data-position="3"] td.name').click();
  await page.keyboard.press("k"); await frame();
  push(["k after heater row 3", await cursor(page)]);
  // a drag selecting text on a group's later row: nothing selected, the cursor unmoved
  await page.locator('tbody.group[data-path="pods/a/ball"] td.name').click();
  const cell = page.locator('tbody.group[data-path="heater"] tr.event[data-position="3"] td.name');
  await cell.scrollIntoViewIfNeeded();
  const b = (await cell.boundingBox())!;
  await page.mouse.move(b.x + 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width - 2, b.y + b.height / 2, { steps: 4 }); await page.mouse.up();
  push(["drag-select heater row 3", await cursor(page), await state(page), await page.evaluate(() => String(getSelection()))]);
  // the same on the first row's name
  const c1 = page.locator('tbody.group[data-path="nest/step"] tr.event[data-position="1"] td.name');
  const b1 = (await c1.boundingBox())!;
  await page.mouse.move(b1.x + 2, b1.y + b1.height / 2); await page.mouse.down();
  await page.mouse.move(b1.x + b1.width - 2, b1.y + b1.height / 2, { steps: 4 }); await page.mouse.up();
  push(["drag-select nest/step row 1", await cursor(page), await state(page), await page.evaluate(() => String(getSelection()))]);
  // a second plain click on the selected text, as a user would
  await page.mouse.click(b.x + 4, b.y + b.height / 2);
  push(["click on heater row 3 after a selection elsewhere", await cursor(page), await state(page)]);
  push(["titles", await page.evaluate(() => [...document.querySelectorAll("table.events th")].map((t) => [t.textContent, t.getAttribute("title")]))]);
  push(["pane titles", await page.evaluate(() => [...document.querySelectorAll("aside.detail table.events th")].map((t) => [t.textContent, t.getAttribute("title")]))]);
  // G on library_deployment in the default and in an 80 px drawer
  for (const drawer of [200, 80]) {
    await dropAt(page, 4330, "library_deployment", undefined, { version: 1, sizes: { drawer } });
    await page.locator('button.tab[data-tab="events"]').click();
    await page.keyboard.press("s"); await frame();
    const seq: any[] = [];
    for (const k of ["j", "Shift+G", "k", "k", "g g", "j", "j", "j"]) {
      for (const kk of k.split(" ")) { await page.keyboard.press(kk); await frame(); }
      await page.waitForTimeout(80);
      seq.push([k, await cursor(page), await page.evaluate(() => {
        const body = document.querySelector(".tab-body")!.getBoundingClientRect();
        const g = document.activeElement!.closest("tbody")?.getBoundingClientRect();
        return g ? [Math.round(g.top - body.top), Math.round(body.bottom - g.bottom), Math.round(body.height), Math.round(g.height)] : null;
      })]);
    }
    push([`library drawer ${drawer}: [key, cursor, [groupTop-bodyTop, bodyBottom-groupBottom, bodyH, groupH]]`, seq]);
  }
  await page.goto("http://localhost:4330/#help");
  await page.waitForSelector("article.help");
  push(["help", await page.locator('li[data-term="events"]').innerText()]);
  writeFileSync(`${OUT}/delta-f2-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

// The other panes' stops: the same clicks on 3d5bc26 (4331) and d9e5d0b (4330), the cursor and selection compared.
type Click = [string, string, string?];
const CLICKS: Click[] = [
  ["timing_deployment", "root-inputs|tr.root-input td.type"],
  ["timing_deployment", "root-inputs|tr.root-input td.name"],
  ["timing_deployment", "timing|table.components tr.component td.dt"],
  ["timing_deployment", "timing|table.components tr.component span.swatch"],
  ["timing_deployment", "timing|table.anchors tr.anchor td.tau"],
  ["timing_deployment", "timing|table.scopes tr.scope td.dt"],
  ["timing_deployment", "timing|div.chart button.swatch"],
  ["timing_deployment", "timing|button.sort-period"],
  ["closed_loop", "order|li.step div.line code.path"],
  ["closed_loop", "order|li.step ul.ports li.port"],
  ["closed_loop", "order|li.edge"],
  ["failure_cycle", "diagnostics|li.diagnostic span.message"],
  ["failure_cycle", "diagnostics|li.diagnostic li.hop a.declaration"],
  ["failure_cycle", "diagnostics|li.diagnostic span.member"],
  ["closed_loop", "detail|table.faces tr td.face-type"],
  ["closed_loop", "detail|table.faces tr td.face-name button.row"],
  ["closed_loop", "detail|table.faces a.consumer"],
  ["closed_loop", "detail|details.section summary"],
  ["closed_loop", "detail|table.parameters td.param-value"],
  ["closed_loop", "detail|button.copy"],
];

async function probeClick(page: Page, port: number, [name, spec]: Click) {
  const [where, sel] = spec.split("|");
  await dropAt(page, port, name);
  if (where === "detail") {
    // a primitive with faces and parameters on the root level
    const id = await page.evaluate(() => [...document.querySelectorAll("svg.canvas g.block.primitive")].map((b) => (b as HTMLElement).dataset.id)[0]);
    await page.locator(`g.block[data-id="${id}"]`).click();
  } else if (where !== "diagnostics") {
    await page.locator(`button.tab[data-tab="${where}"]`).click();
  } else if ((await page.locator("section.drawer").getAttribute("data-open")) !== "true") {
    await page.locator('button.tab[data-tab="diagnostics"]').click();
  }
  const root = where === "detail" ? "aside.detail" : ".tab-body";
  const loc = page.locator(`${root} ${sel}`).nth(1).or(page.locator(`${root} ${sel}`).first()).first();
  if (!(await loc.count())) return "absent";
  await loc.scrollIntoViewIfNeeded();
  const box = (await loc.boundingBox())!;
  await page.mouse.click(box.x + Math.min(4, box.width / 2), box.y + box.height / 2);
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement;
    return { active: a.tagName + "." + (a.className.split(" ")[0] || "") + " " + (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40),
      selected: document.querySelector("aside.detail")?.getAttribute("data-kind") + ":" + document.querySelector("aside.detail")?.getAttribute("data-id"),
      level: document.querySelector("svg.canvas")?.getAttribute("data-level"), focusClass: document.querySelector("svg.canvas")?.getAttribute("data-focus") };
  });
}

test("other panes' stops unchanged against 3d5bc26", async ({ page }, info) => {
  test.setTimeout(600000);
  const rows: any[] = [];
  for (const c of CLICKS) {
    const before = await probeClick(page, 4331, c);
    const after = await probeClick(page, 4330, c);
    rows.push({ click: c.join(" "), same: JSON.stringify(before) === JSON.stringify(after), before, after });
  }
  writeFileSync(`${OUT}/delta-others-${info.project.name}.json`, JSON.stringify(rows, null, 1));
});

test("a drag selecting text on other tabs' rows still selects nothing, both builds", async ({ page }, info) => {
  const rows: any[] = [];
  for (const port of [4331, 4330]) {
    for (const [name, tab, sel] of [["timing_deployment", "timing", "table.components tr.component td.dt"], ["closed_loop", "order", "li.step code.path"], ["timing_deployment", "root-inputs", "tr.root-input td.type"]]) {
      await dropAt(page, port, name);
      await page.locator(`button.tab[data-tab="${tab}"]`).click();
      const cell = page.locator(`.tab-body ${sel}`).nth(1);
      await cell.scrollIntoViewIfNeeded();
      const b = (await cell.boundingBox())!;
      const before = await page.evaluate(() => document.querySelector("aside.detail")?.getAttribute("data-id"));
      await page.mouse.move(b.x + 1, b.y + b.height / 2); await page.mouse.down();
      await page.mouse.move(b.x + b.width - 1, b.y + b.height / 2, { steps: 4 }); await page.mouse.up();
      await page.waitForTimeout(100);
      rows.push([port, tab, before, await page.evaluate(() => document.querySelector("aside.detail")?.getAttribute("data-id")), await page.evaluate(() => String(getSelection())), await cursor(page)]);
    }
  }
  writeFileSync(`${OUT}/delta-guard-${info.project.name}.json`, JSON.stringify(rows));
});
