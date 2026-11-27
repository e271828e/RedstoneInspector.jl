import { writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { drop, cursor } from "<worktree>/frontend/e2e/fixtures.ts";
test("a plain click on a later row: where the cursor goes", async ({ page }, info) => {
  const log: any[] = [];
  await drop(page, "events_deployment");
  await page.locator('button.tab[data-tab="events"]').click();
  for (const [g, r, c] of [["heater", 3, "td.name"], ["heater", 2, "td.localized"], ["nest/step", 1, "td.name"], ["heater", 1, "td.position"]]) {
    const cell = page.locator(`tbody.group[data-path="${g}"] tr.event[data-position="${r}"] ${c}`);
    await cell.scrollIntoViewIfNeeded();
    await cell.click();
    log.push([g, r, c, await cursor(page), await page.evaluate(() => document.querySelector("aside.detail")!.getAttribute("data-id")),
      await page.evaluate(() => [...document.querySelectorAll("table.events tbody.group")].filter((x) => getComputedStyle(x).outlineStyle !== "none").map((x) => (x as HTMLElement).dataset.path))]);
  }
  const cell = page.locator('tbody.group[data-path="nest/deep/ball"] tr.event td.name');
  await cell.click();
  const c2 = page.locator('tbody.group[data-path="heater"] tr.event[data-position="3"] td.name');
  await c2.click();
  await page.keyboard.press("k");
  log.push(["k after a click on heater row 3", await cursor(page)]);
  writeFileSync(`out/focus-${info.project.name}.json`, JSON.stringify(log));
});
