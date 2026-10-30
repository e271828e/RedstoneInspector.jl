// The model tree (workspace.md answer 2): rows and folders, the default
// expansion, selection shared both ways, the chevron expanding, the double-click
// opening, the open level's row.
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, readyLevel, rows, shot } from "./fixtures";

const row = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);
const levelPath = (page: Page) => page.locator("nav.breadcrumb");
const pane = (page: Page) => page.locator("aside.detail");

test("closed_loop: rows, selection and opening", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(rows(page)).toHaveCount(7);
  await expect(row(page, "")).toHaveClass(/\bopen\b/);
  await expect(row(page, "").locator(".segment")).toHaveText("closed_loop");
  await expect(row(page, "").locator(".name")).toHaveCount(0);
  await expect(page.locator("nav.tree .row.selected")).toHaveCount(0);

  // the chevron expands and leaves the level alone
  await row(page, "sensing").locator("button.chevron").click();
  await expect(row(page, "sensing")).toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(9);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await shot(page, "closed_loop", "", "tree");

  // a click selects a closed assembly without opening it
  await row(page, "sensing").click();
  await expect(row(page, "sensing")).toHaveClass(/\bselected\b/);
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await expect(pane(page)).toHaveAttribute("data-kind", "assembly");

  // a click on a deeper row shows its parent's level with its block selected
  await row(page, "sensing/noise").click();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
  await expect(row(page, "sensing/noise")).toHaveClass(/\bselected\b/);
  await expect(pane(page)).toHaveAttribute("data-kind", "leaf");

  // a block click selects its row
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await page.locator('g.block[data-id="plant"]').click();
  await expect(row(page, "plant")).toHaveClass(/\bselected\b/);
  await expect(page.locator("nav.tree .row.selected")).toHaveCount(1);

  // a double-click on an assembly row opens it
  await row(page, "actuators").dblclick();
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(row(page, "actuators")).toHaveClass(/\bopen\b/);
  await expect(row(page, "")).not.toHaveClass(/\bopen\b/);
  await expect(page.locator("nav.tree .row.open")).toHaveCount(1);

  // the chevron collapses sensing: its two rows go
  const before = await rows(page).count();
  await row(page, "sensing").locator("button.chevron").click();
  await expect(row(page, "sensing")).not.toHaveClass(/\bexpanded\b/);
  await expect(rows(page)).toHaveCount(before - 2);
  await expect(row(page, "sensing/noise")).toHaveCount(0);
});

test("containers: the folder rows and the keyed rows under them", async ({ page }) => {
  await drop(page, "containers");
  await expect(rows(page)).toHaveCount(9);
  for (const f of ["gains", "pair"]) {
    await expect(row(page, f)).toHaveClass(/\bfolder\b/);
    await expect(row(page, f)).toHaveAttribute("data-depth", "1");
  }
  for (const p of ["gains/a", "gains/b", "pair/1"]) {
    await expect(row(page, p)).toHaveClass(/\bnode\b/);
    await expect(row(page, p)).toHaveAttribute("data-depth", "2");
  }
  for (const p of ["s1", "s2", "scale"]) await expect(row(page, p)).toHaveAttribute("data-depth", "1");
  const order = await rows(page).evaluateAll((rs) => rs.map((r) => (r as HTMLElement).dataset.path));
  expect(order).toEqual(["", "gains", "gains/a", "gains/b", "pair", "pair/1", "s1", "s2", "scale"]);

  await row(page, "gains").click();
  await expect(pane(page)).toHaveAttribute("data-kind", "folder");
  await expect(pane(page).locator(".facts")).toContainText("field gains");
  await expect(pane(page).locator(".keys a")).toHaveCount(2);
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
});

test("rates: opening and selecting on the canvas expands, selects and marks the rows", async ({ page }) => {
  await drop(page, "rates");
  await expect(rows(page)).toHaveCount(4);
  await openPath(page, "fast/outer");
  await page.locator('g.block[data-id="fast/outer/hold"]').click();
  await expect(row(page, "fast")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer")).toHaveClass(/\bexpanded\b/);
  await expect(row(page, "fast/outer/hold")).toHaveClass(/\bselected\b/);
  await expect(row(page, "fast/outer")).toHaveClass(/\bopen\b/);
  await expect(row(page, "fast/outer/hold")).toHaveAttribute("data-depth", "3");
});

test("the root row reads the label: primitive alone, aircraft by its file name", async ({ page }) => {
  await drop(page, "primitive");
  await expect(rows(page)).toHaveCount(1);
  await expect(row(page, "").locator(".segment")).toHaveText("primitive");
  await expect(row(page, "").locator(".name")).toHaveCount(0);
  await drop(page, "aircraft");
  await expect(row(page, "").locator(".segment")).toHaveText("aircraft");
});

test("large: 151 rows at load", async ({ page }) => {
  await drop(page, "large");
  await expect(rows(page)).toHaveCount(151);
});
