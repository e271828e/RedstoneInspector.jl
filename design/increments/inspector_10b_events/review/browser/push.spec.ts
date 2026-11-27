// Probe: the events tab across pushes and drops, and under failures.
import { writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { drop, dropOver, press, pressAll, cursor, fixtureText } from "<worktree>/frontend/e2e/fixtures.ts";

const OUT = "<probes>/browser/out";

const drawer = (page: any) => page.evaluate(() => {
  const d = document.querySelector("section.drawer") as HTMLElement;
  const tab = d?.querySelector('button.tab[data-tab="events"]');
  const body = d?.querySelector(".tab-body") as HTMLElement | null;
  return {
    open: d?.dataset.open, tab: d?.dataset.tab,
    eventsCount: tab?.querySelector(".count")?.textContent ?? null,
    tabs: [...(d?.querySelectorAll("button.tab") ?? [])].map((b) => (b as HTMLElement).dataset.tab + ":" + (b.querySelector(".count")?.textContent ?? "")),
    body: body?.innerText.slice(0, 300) ?? null,
    groups: [...document.querySelectorAll("table.events tbody.group")].map((g) => (g as HTMLElement).dataset.path),
    head: [...document.querySelectorAll("section.drawer dl.head .item")].map((i) => (i as HTMLElement).innerText.replace(/\s+/g, " ")),
    active: document.activeElement?.outerHTML.slice(0, 120),
    region: document.querySelector(".focused")?.className,
    ringGroups: [...document.querySelectorAll("table.events tbody.group")].filter((g) => getComputedStyle(g).outlineStyle !== "none").map((g) => (g as HTMLElement).dataset.path),
  };
});

test("push from events to none and back, tab open, group focused", async ({ page }, info) => {
  const log: any[] = [];
  await drop(page, "events_deployment");
  await page.locator('button.tab[data-tab="events"]').click();
  await page.locator('tbody.group[data-path="heater"] button.row').click();
  await page.locator('tbody.group[data-path="heater"] button.row').focus();
  log.push(["before", await drawer(page), await cursor(page)]);
  await dropOver(page, "closed_loop_deployment");
  await page.waitForTimeout(300);
  log.push(["closed_loop_deployment", await drawer(page), await cursor(page)]);
  await press(page, "j");
  log.push(["after j on empty", await drawer(page), await cursor(page)]);
  await dropOver(page, "events_deployment");
  await page.waitForTimeout(300);
  log.push(["back to events", await drawer(page), await cursor(page)]);
  await press(page, "s");
  await press(page, "j");
  log.push(["s j", await drawer(page), await cursor(page)]);
  // the same group focused, then a push of the same model: is the group's focus kept?
  await page.locator('tbody.group[data-path="nest/step"] button.row').click();
  log.push(["click nest/step", await drawer(page), await cursor(page)]);
  await dropOver(page, "events_deployment");
  await page.waitForTimeout(300);
  log.push(["same model pushed", await drawer(page), await cursor(page)]);
  // a model where the focused group's path is gone but others stay: library_deployment
  await dropOver(page, "library_deployment");
  await page.waitForTimeout(300);
  log.push(["library_deployment", await drawer(page), await cursor(page)]);
  await dropOver(page, "failure_cycle");
  await page.waitForTimeout(300);
  log.push(["failure_cycle", await drawer(page), await cursor(page)]);
  await page.locator('button.tab[data-tab="events"]').click();
  log.push(["failure_cycle events tab", await drawer(page), await cursor(page)]);
  await dropOver(page, "failure_structure");
  await page.waitForTimeout(300);
  await page.locator('button.tab[data-tab="events"]').click();
  log.push(["failure_structure events tab", await drawer(page), await cursor(page)]);
  await pressAll(page, "s", "j", "k", "g", "g", "G");
  log.push(["failure_structure keys", await drawer(page), await cursor(page)]);
  await dropOver(page, "events_deployment");
  await page.waitForTimeout(300);
  log.push(["back from structureless", await drawer(page), await cursor(page)]);
  writeFileSync(`${OUT}/push-${info.project.name}.json`, JSON.stringify(log, null, 1));
});

test("keys on the events tab", async ({ page }, info) => {
  const log: any[] = [];
  await drop(page, "library_deployment");
  log.push(["start", await drawer(page)]);
  for (const k of ["gt", "gt", "gt", "gt", "gt", "gT", "gT"]) {
    await pressAll(page, "g", k === "gT" ? "Shift+T" : "t");
    log.push([k, (await drawer(page)).tab, (await drawer(page)).open, await cursor(page)]);
  }
  // to the events tab
  while ((await drawer(page)).tab !== "events") await pressAll(page, "g", "t");
  await press(page, "s");
  log.push(["s", await cursor(page)]);
  await press(page, "j");
  log.push(["j", await cursor(page)]);
  await press(page, "Shift+G");
  const scrollG = await page.evaluate(() => { const b = document.querySelector(".tab-body")!; const br = b.getBoundingClientRect(); const g = document.activeElement!.closest("tbody")!.getBoundingClientRect(); return [b.scrollTop, b.scrollHeight, b.clientHeight, "groupBottom", g.bottom, "bodyBottom", br.bottom]; });
  log.push(["G", await cursor(page), scrollG]);
  await press(page, "k");
  log.push(["k", await cursor(page)]);
  await pressAll(page, "g", "g");
  log.push(["gg", await cursor(page), await page.evaluate(() => document.querySelector(".tab-body")!.scrollTop)]);
  for (let i = 0; i < 3; i++) await press(page, "j");
  await page.evaluate(() => document.querySelector(".tab-body")!.scrollTop = 0);
  await pressAll(page, "z", "z");
  const zz = await page.evaluate(() => {
    const b = document.querySelector(".tab-body")!.getBoundingClientRect();
    const a = document.activeElement!.getBoundingClientRect();
    const g = document.activeElement!.closest("tbody")!.getBoundingClientRect();
    return { bodyMid: (b.top + b.bottom) / 2, stopMid: (a.top + a.bottom) / 2, groupMid: (g.top + g.bottom) / 2, scrollTop: document.querySelector(".tab-body")!.scrollTop };
  });
  log.push(["zz", await cursor(page), zz]);
  await press(page, "l");
  log.push(["l", await cursor(page)]);
  await press(page, "h");
  log.push(["h", await cursor(page)]);
  await press(page, "Enter");
  const sel = await page.evaluate(() => [document.querySelector("aside.detail")?.getAttribute("data-id"), document.querySelector("svg.canvas g.block.selected")?.getAttribute("data-id")]);
  log.push(["Enter", await cursor(page), sel]);
  // gt from the events tab with focus on a group: focus stays?
  await pressAll(page, "g", "t");
  log.push(["gt from events with group focused", (await drawer(page)).tab, await cursor(page)]);
  await pressAll(page, "g", "Shift+T");
  log.push(["gT back", (await drawer(page)).tab, await cursor(page)]);
  // closed drawer: gt opens on current tab
  await press(page, "S");
  log.push(["S", (await drawer(page)).open]);
  await pressAll(page, "g", "t");
  log.push(["gt closed", (await drawer(page)).open, (await drawer(page)).tab]);
  writeFileSync(`${OUT}/keys-${info.project.name}.json`, JSON.stringify(log, null, 1));
});
