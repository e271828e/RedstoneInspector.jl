// The drawer's diagnostics tab (workspace.md answers 6 and 2): one row per
// diagnostic and warning, errors first, with kind, path, message and the type's
// location; the filter; a row's click focusing it and selecting what it names
// on its level; the empty states; the tree's propagated marks; a push dropping
// the focus. Counts from the oracle (`overlay.py`).
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, fixtureText, press, readyLevel, shot } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const rowsOf = (page: Page) => page.locator("section.drawer .tab-body ul.diagnostics > li.diagnostic");
const row = (page: Page, i: number) => page.locator(`li.diagnostic[data-index="${i}"]`);
const svg = (page: Page) => page.locator("svg.canvas");
const treeRow = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);

test("failure_probe: two rows, error first, the filter, a click focusing and selecting, a second click and Escape clearing", async ({ page }) => {
  await drop(page, "failure_probe");
  const d = JSON.parse(fixtureText("failure_probe")).failure.structure;
  const line = d.types.find((t: any) => t.name === d.nodes.find((n: any) => n.path === "t").type).locations[0].line;
  await expect(rowsOf(page)).toHaveCount(2);
  expect(await rowsOf(page).evaluateAll((ls) => ls.map((l) => [l.getAttribute("data-index"), l.getAttribute("data-severity")]))).toEqual([
    ["0", "error"], ["1", "warning"],
  ]);
  await expect(row(page, 0).locator(".kind")).toHaveText("UserCodeFraming");
  await expect(row(page, 0).locator(".path")).toHaveText("t");
  await expect(row(page, 0).locator("span.message")).toContainText("cause: boom");
  expect(await row(page, 0).locator("a.location").textContent()).toMatch(new RegExp(`:${line}$`));
  await expect(row(page, 1).locator(".path")).toHaveText("s/g");
  await shot(page, "failure_probe", "", "drawer");

  // the filter: kind, path and message, case-insensitive
  const filter = drawer(page).locator("input.filter");
  await expect(filter).toHaveAttribute("placeholder", "Filter by kind, path or message");
  await filter.fill("Empty");
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 1)).toHaveCount(1);
  await filter.fill("s/G");
  await expect(rowsOf(page)).toHaveCount(1);
  await filter.fill("boom");
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 0)).toHaveCount(1);
  await filter.fill("");
  await expect(rowsOf(page)).toHaveCount(2);
  await filter.fill("zzz");
  await expect(rowsOf(page)).toHaveCount(0);
  await expect(drawer(page).locator("p.empty")).toHaveText("No row matches the filter.");
  await filter.fill("");

  // a click focuses the row and selects its node on its level
  await row(page, 0).locator("span.message").click();
  await expect(row(page, 0)).toHaveClass(/\bcurrent\b/);
  await expect(page.locator('g.block.selected[data-id="t"]')).toHaveCount(1);
  await expect(page.locator('aside.detail[data-kind="leaf"]')).toHaveAttribute("data-id", "t");
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await row(page, 1).locator(".kind").click();
  await page.locator(readyLevel("s")).waitFor();
  await expect(page.locator('g.block.selected[data-id="s/g"]')).toHaveCount(1);
  await expect(row(page, 1)).toHaveClass(/\bcurrent\b/);
  await expect(row(page, 0)).not.toHaveClass(/\bcurrent\b/);
  await expect(svg(page)).toHaveAttribute("data-focus", "1");
  // a second click clears the focus and keeps the selection
  await row(page, 1).locator(".kind").click();
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(page.locator('g.block.selected[data-id="s/g"]')).toHaveCount(1);

  // Escape clears the focus before a standing query
  await press(page, "/");
  await page.keyboard.type("h");
  await press(page, "Tab");
  await row(page, 0).locator(".kind").click();
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await press(page, "Escape");
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(page.locator("input.query")).toHaveValue("h");
});

test("failure_nested: the loop's row carries no location and selects its first member, plant, on the root", async ({ page }) => {
  await drop(page, "failure_nested");
  await expect(row(page, 0).locator("a.location")).toHaveCount(0);
  await page.locator('g.block[data-id="ctl"]').dblclick();
  await page.locator(readyLevel("ctl")).waitFor();
  await row(page, 0).locator(".kind").click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
  await expect(row(page, 0).locator(".path")).toHaveText("plant");
});

test("failure_cycle: the row selects plant", async ({ page }) => {
  await drop(page, "failure_cycle");
  await row(page, 0).click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
});

test("failure_structure: two rows with no canvas, a click focusing the row alone", async ({ page }) => {
  await drop(page, "failure_structure");
  await expect(rowsOf(page)).toHaveCount(2);
  await expect(row(page, 0).locator(".kind")).toHaveText("UnknownPort");
  await expect(row(page, 0).locator("a.location")).toHaveCount(0);
  await row(page, 1).click();
  await expect(row(page, 1)).toHaveClass(/\bcurrent\b/);
  await expect(svg(page)).toHaveCount(0);
});

test("closed_loop: the tab opened by its button says it is empty", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await drawer(page).locator('button.tab[data-tab="diagnostics"]').click();
  await expect(drawer(page).locator("p.empty")).toHaveText("No diagnostics or warnings.");
  await expect(drawer(page).locator("input.filter")).toHaveCount(0);
});

test("warning: one amber row, g's tree row marked with a warning, the root's beneath", async ({ page }) => {
  await drop(page, "warning");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("1");
  await drawer(page).locator('button.tab[data-tab="diagnostics"]').click();
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 0)).toHaveAttribute("data-severity", "warning");
  await expect(treeRow(page, "g").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  await expect(treeRow(page, "").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
  await expect(page.locator('nav.tree span.mark[data-mark="error"]')).toHaveCount(0);
});

test("failure_probe: the tree's counts, red on the root for one error and one warning, s amber beneath", async ({ page }) => {
  await drop(page, "failure_probe");
  await expect(treeRow(page, "").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error, 1 warning, beneath");
  await expect(treeRow(page, "t").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error");
  await expect(treeRow(page, "s").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
  await treeRow(page, "s").locator("button.chevron").click();
  await expect(treeRow(page, "s/g").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  await expect(treeRow(page, "s/src").locator("span.mark")).toHaveCount(0);
});

test("failure_probe with its error at the root: the root's row red for its own error and the warning, t's row bare", async ({ page }) => {
  const d = JSON.parse(fixtureText("failure_probe"));
  d.failure.diagnostics[0].path = "";
  await drop(page, "failure_probe", JSON.stringify(d));
  await expect(treeRow(page, "").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error, 1 warning");
  await expect(treeRow(page, "t").locator("span.mark")).toHaveCount(0);
  await expect(treeRow(page, "s").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
});

test("a push drops the focused diagnostic and keeps the drawer open on diagnostics", async ({ page }) => {
  await drop(page, "failure_probe");
  await row(page, 0).click();
  await expect(row(page, 0)).toHaveClass(/\bcurrent\b/);
  await dropOver(page, "closed_loop");
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("0");
  await expect(drawer(page).locator("p.empty")).toHaveText("No diagnostics or warnings.");
});
