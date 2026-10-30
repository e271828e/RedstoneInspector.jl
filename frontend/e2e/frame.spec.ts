// The frame (workspace.md answers 1, 6 and 10): the status bar's kind and totals,
// the drawer's strip, counts and open rule, the splitters and the collapsed panes
// kept per browser across a reload and a new drop.
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, shot, status } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const tab = (page: Page, t: string) => drawer(page).locator(`button.tab[data-tab="${t}"]`);
const treePane = (page: Page) => page.locator('.pane[data-pane="tree"]');
const detailPane = (page: Page) => page.locator('.pane[data-pane="detail"]');

test("closed_loop: the status bar reads the kind and the model's totals", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(status(page)).toHaveAttribute("data-kind", "build");
  await expect(status(page)).toContainText("build");
  const counts = status(page).locator(".counts");
  for (const t of ["24 leaves", "6 assemblies", "94 wires"]) await expect(counts).toContainText(t);
  await expect(status(page).locator(".note")).toHaveCount(0);
});

test("closed_loop: the drawer stays closed with its counts readable, and a tab opens and closes it", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(tab(page, "root-inputs").locator(".count")).toHaveText("3");
  await expect(tab(page, "order").locator(".count")).toHaveText("24");
  await expect(tab(page, "diagnostics").locator(".count")).toHaveText("0");
  await expect(tab(page, "timing").locator(".count")).toHaveCount(0);
  await expect(drawer(page).locator(".tab-body")).toHaveCount(0);
  await tab(page, "root-inputs").click();
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "root-inputs");
  await expect(drawer(page).locator(".tab-body")).toContainText("increment 8");
  await tab(page, "root-inputs").click();
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
});

test("closed_loop: the tree splitter's drag is kept across a reload and a new drop", async ({ page }) => {
  await drop(page, "closed_loop");
  const before = (await treePane(page).boundingBox())!.width;
  const s = (await page.locator('.splitter[data-pane="tree"]').boundingBox())!;
  const y = s.y + s.height / 2, x = s.x + s.width / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 50, y, { steps: 4 });
  await page.mouse.move(x + 100, y, { steps: 4 });
  await page.mouse.up();
  const after = (await treePane(page).boundingBox())!.width;
  expect(Math.abs(after - before - 100)).toBeLessThanOrEqual(2);
  await page.reload();
  await drop(page, "descent");
  expect(Math.abs((await treePane(page).boundingBox())!.width - after)).toBeLessThanOrEqual(1);
});

test("closed_loop: the detail pane collapses to its strip, kept across a reload, and expands", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(detailPane(page)).not.toHaveClass(/\bcollapsed\b/);
  await page.locator('button.collapse[data-pane="detail"]').click();
  await expect(detailPane(page)).toHaveClass(/\bcollapsed\b/);
  await expect(page.locator("aside.detail")).toHaveCount(0);
  await page.reload();
  await drop(page, "closed_loop");
  await expect(detailPane(page)).toHaveClass(/\bcollapsed\b/);
  await shot(page, "closed_loop", "", "frame-collapsed");
  await page.locator('button.collapse[data-pane="detail"]').click();
  await expect(detailPane(page)).not.toHaveClass(/\bcollapsed\b/);
  await expect(page.locator("aside.detail")).toHaveCount(1);
});

test("closed_loop_deployment reads deployment", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");
  await expect(status(page)).toContainText("deployment");
});

test("failure_cycle reads failure and opens the drawer on its one diagnostic", async ({ page }) => {
  await drop(page, "failure_cycle");
  await expect(status(page)).toHaveAttribute("data-kind", "failure");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(tab(page, "diagnostics").locator(".count")).toHaveText("1");
  await expect(tab(page, "order").locator(".count")).toHaveCount(0);
});

test("a minor 1 copy of descent shows the note in the status bar", async ({ page }) => {
  const d = JSON.parse(fixtureText("descent"));
  d.format_version = { major: 1, minor: 1 };
  await drop(page, "descent", JSON.stringify(d));
  await expect(status(page).locator(".note")).toContainText("format 1.1");
});
