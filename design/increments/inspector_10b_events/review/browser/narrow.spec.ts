// Probe: long event names, the 240 px pane, a short drawer, a primitive root that declares events, a folder's pane,
// the section's state across selections, the row's text-selection guard.
import { writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { drop, press, pressAll, fixtureText, cursor, shot } from "<worktree>/frontend/e2e/fixtures.ts";

const OUT = "<probes>/browser/out";
const LONG = "heat_on_when_the_room_temperature_falls_below_the_lower_threshold_of_the_band";

function longCopy(): string {
  const d = JSON.parse(fixtureText("events_deployment"));
  const h = d.deployment.build.events.components.find((c: any) => c.path === "heater");
  h.events[0].name = LONG;
  h.events[2].name = "trip_" + "x".repeat(50);
  h.bundle = ["x", "m", "u", "y", "t", "a_very_long_bundle_field_name_for_the_probe", "another_long_one_here"];
  return JSON.stringify(d);
}

const overflow = (page: any, sel: string) => page.evaluate((s: string) => {
  const e = document.querySelector(s) as HTMLElement | null;
  if (!e) return null;
  return { scrollW: e.scrollWidth, clientW: e.clientWidth, scrollH: e.scrollHeight, clientH: e.clientHeight };
}, sel);

test("long names at 240 px and in the drawer; the pill's title", async ({ page }, info) => {
  const log: any[] = [];
  await page.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { sessionStorage.setItem("probe", "1"); localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, sizes: { detail: 240, drawer: 80 } })); } } catch {} });
  await drop(page, "events_deployment", longCopy());
  await page.locator('g.block[data-id="heater"]').click();
  log.push(["pane width", await page.evaluate(() => document.querySelector(".pane[data-pane=detail]")!.getBoundingClientRect().width)]);
  log.push(["aside.detail overflow", await overflow(page, "aside.detail")]);
  log.push(["pane body overflow", await overflow(page, '.pane[data-pane="detail"] .body')]);
  log.push(["events section", await page.evaluate(() => {
    const s = document.querySelector('details.section[data-section="events"]') as HTMLElement;
    const t = s.querySelector("table")!.getBoundingClientRect();
    const b = s.querySelector("p.bundle")!.getBoundingClientRect();
    const aside = document.querySelector("aside.detail")!.getBoundingClientRect();
    return { table: [t.left, t.right], bundle: [b.left, b.right], aside: [aside.left, aside.right], sectionScrollW: s.scrollWidth, sectionClientW: s.clientWidth,
      cells: [...s.querySelectorAll("td")].map((c) => { const r = c.getBoundingClientRect(); return [c.className, Math.round(r.left), Math.round(r.right), (c as HTMLElement).scrollWidth > (c as HTMLElement).clientWidth]; }) };
  })]);
  await shot(page, "events_deployment", "root", "probe-long-240");
  log.push(["pill title", await page.locator('g.block[data-id="heater"] g.events-pill title').textContent()]);
  // the drawer at 80 px on the events tab
  await page.locator('button.tab[data-tab="events"]').click();
  log.push(["drawer", await page.evaluate(() => document.querySelector(".pane[data-pane=drawer]")!.getBoundingClientRect().height), await overflow(page, ".tab-body")]);
  await press(page, "s");
  const vis: any[] = [];
  for (let i = 0; i < 6; i++) {
    await press(page, "j");
    vis.push(await page.evaluate(() => {
      const b = document.querySelector(".tab-body")!.getBoundingClientRect();
      const a = document.activeElement!.getBoundingClientRect();
      const g = document.activeElement!.closest("tbody")?.getBoundingClientRect();
      return [document.activeElement!.textContent!.slice(0, 20), Math.round(a.top - b.top), Math.round(b.bottom - a.bottom), g ? Math.round(b.bottom - g.bottom) : null];
    }));
  }
  log.push(["j in a short drawer: [stop, stopTop-bodyTop, bodyBottom-stopBottom, bodyBottom-groupBottom]", vis]);
  await shot(page, "events_deployment", "root", "probe-long-drawer80");
  // widen the drawer and read the table's overflow sideways
  log.push(["tab body overflow", await overflow(page, ".tab-body")]);
  writeFileSync(`${OUT}/narrow-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("a primitive root that declares events: pill, pane, tab path cell", async ({ page }, info) => {
  const log: any[] = [];
  const d = JSON.parse(fixtureText("primitive"));
  d.build.events.components[0].events = [{ name: "cross", policy: "localized" }, { name: "latch", policy: "non_localized" }];
  d.build.events.components[0].bundle = ["x", "t"];
  await drop(page, "primitive", JSON.stringify(d));
  log.push(["pills", await page.evaluate(() => [...document.querySelectorAll("svg.canvas g.events-pill")].map((p) => [(p.closest("g.block") as HTMLElement).dataset.id, p.textContent]))]);
  log.push(["pane", await page.evaluate(() => [document.querySelector("aside.detail")!.getAttribute("data-kind"), [...document.querySelectorAll("aside.detail details.section")].map((s) => (s as HTMLElement).dataset.section), [...document.querySelectorAll("aside.detail dd[data-fact]")].map((x) => (x as HTMLElement).dataset.fact + "=" + x.textContent)])]);
  await page.locator('button.tab[data-tab="events"]').click();
  log.push(["tab", await page.evaluate(() => [...document.querySelectorAll("table.events tbody.group")].map((g) => [(g as HTMLElement).dataset.path, g.querySelector("td.path")?.textContent, (g as HTMLElement).innerText]))]);
  log.push(["tab count", await page.locator('button.tab[data-tab="events"] .count').textContent()]);
  await page.locator("table.events tbody.group button.row").click();
  log.push(["after click", await page.evaluate(() => [document.querySelector("aside.detail")!.getAttribute("data-kind"), document.querySelector("aside.detail")!.getAttribute("data-id"), document.querySelector("svg.canvas g.block.selected")?.getAttribute("data-id")])]);
  await shot(page, "primitive", "root", "probe-primitive-root-events");
  writeFileSync(`${OUT}/root-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("folder pane, keyed member pane, section state across selections, the guard", async ({ page }, info) => {
  const log: any[] = [];
  await drop(page, "events_deployment");
  // the pods region's caption selects the folder
  await page.locator('nav.tree .row[data-path="pods"] .segment').click();
  log.push(["folder", await page.evaluate(() => [document.querySelector("aside.detail")!.getAttribute("data-kind"), document.querySelector("aside.detail")!.textContent!.replace(/\s+/g, " ").slice(0, 200)])]);
  await page.locator('g.block[data-id="pods/a"]').click();
  log.push(["pods/a facts", await page.evaluate(() => [...document.querySelectorAll("aside.detail dl.facts dt")].map((dt) => dt.textContent + "=" + dt.nextElementSibling?.textContent + " [" + dt.getAttribute("title") + "]"))]);
  // collapse EVENTS on heater, select nest/step via the tree, check the state
  await page.locator('g.block[data-id="heater"]').click();
  await page.locator('details.section[data-section="events"] summary').click();
  log.push(["heater events open after collapse", await page.locator('details.section[data-section="events"]').evaluate((e) => (e as HTMLDetailsElement).open)]);
  await page.locator('nav.tree .row[data-path="nest"] button.chevron').click();
  await page.locator('nav.tree .row[data-path="nest/step"] .segment').click();
  log.push(["nest/step events open", await page.locator('details.section[data-section="events"]').evaluate((e) => (e as HTMLDetailsElement).open), await page.evaluate(() => document.querySelector("aside.detail")!.getAttribute("data-id"))]);
  await page.locator('details.section[data-section="events"] summary').click();
  // the drawer's row guard: a drag selecting text on a later row selects nothing
  await page.locator('button.tab[data-tab="events"]').click();
  await page.locator('nav.tree .row[data-path="pods/a"] .segment').click();
  const cell = page.locator('tbody.group[data-path="heater"] tr.event[data-position="3"] td.name');
  await cell.scrollIntoViewIfNeeded();
  const box = (await cell.boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  log.push(["after drag-select on heater row 3", await page.evaluate(() => [document.querySelector("aside.detail")!.getAttribute("data-id"), String(getSelection())])]);
  await page.mouse.click(box.x + 4, box.y + box.height / 2);
  log.push(["after plain click", await page.evaluate(() => document.querySelector("aside.detail")!.getAttribute("data-id")), await cursor(page)]);
  writeFileSync(`${OUT}/misc-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("the threshold: event names of 16, 20, 24, 32 characters at 240 and 360 px", async ({ page }, info) => {
  const out: any[] = [];
  for (const width of [240, 360]) {
    for (const n of [16, 20, 24, 32]) {
      const d = JSON.parse(fixtureText("events_deployment"));
      const h = d.deployment.build.events.components.find((c: any) => c.path === "heater");
      h.events[0].name = ("heat_on_" + "abcdefghijklmnopqrstuvwxyz0123456789").slice(0, n);
      await page.goto("/");
      await page.evaluate((w) => localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, sizes: { detail: w } })), width);
      await drop(page, "events_deployment", JSON.stringify(d));
      await page.locator('g.block[data-id="heater"]').click();
      out.push([width, n, await overflow(page, "aside.detail")]);
    }
  }
  writeFileSync(`${OUT}/threshold-${info.project.name}.json`, JSON.stringify(out));
});
