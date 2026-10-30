// Opening and climbing (workspace.md answer 3): double-click or Enter opens a
// closed assembly, Backspace goes to the parent, a leaf does not open.
import { test } from "@playwright/test";
import { drop, expect, readyLevel, shot } from "./fixtures";

const levelLine = (page: import("@playwright/test").Page) => page.locator("[data-level-path]");

test("closed_loop: double-click and Enter open, Backspace climbs", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "sensing");
  await expect(levelLine(page)).toContainText("sensing");
  await expect(page.locator("g.block")).toHaveCount(4);

  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(9);

  await page.locator('g.block[data-id="actuators"]').click();
  await page.keyboard.press("Enter");
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "actuators");
  await shot(page, "closed_loop", "actuators", "open");
});

test("closed_loop: a double-click on a leaf leaves the level as it is", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').dblclick();
  await page.waitForTimeout(300);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(9);
});

test("rates: two deep and two Backspaces back", async ({ page }) => {
  await drop(page, "rates");
  await page.locator('g.block[data-id="fast"]').dblclick();
  await page.locator(readyLevel("fast")).waitFor();
  await page.locator('g.block[data-id="fast/outer"]').dblclick();
  await page.locator(readyLevel("fast/outer")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "fast/outer");
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("fast")).waitFor();
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(6);
  await shot(page, "rates", "", "open");
});
