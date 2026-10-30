// Search (workspace.md answer 5, visual_grammar.md answer 9): `/` and Cmd-K focus
// the field; the results stand in the outline's place while it has focus; hits
// take the dashed halo on the open level and the rest dims; the tree's rows take
// the dashed marker with counts up collapsed rows. The counts are the oracle's.
import { test, type Page } from "@playwright/test";
import { drop, expect, press, readyLevel, shot } from "./fixtures";

const field = (page: Page) => page.locator("input.query");
const hitRows = (page: Page) => page.locator(".results .hit");
const groupCount = (page: Page, g: "nodes" | "faces") => page.locator(`.results .group[data-group="${g}"] .group-head .count`);
const canvas = (page: Page) => page.locator("svg.canvas");
const childHits = (page: Page) => page.locator("svg.canvas g.block:not(.pin).search-hit");
const under = (page: Page) => page.locator("svg.canvas g.block.search-under");
const portHits = (page: Page) => page.locator("svg.canvas rect.port.search-hit");
const rowHits = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"] .hits`);
const isFocused = (page: Page, sel: string) => page.evaluate((s) => document.activeElement === document.querySelector(s), sel);
async function search(page: Page, text: string) {
  await press(page, "/");
  await field(page).fill(text);
}

test("closed_loop: h listed, walked and picked; the markers; the other queries; Escape and the clear button", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "/");
  expect(await isFocused(page, "input.query")).toBe(true);
  await page.locator(".viewport").focus();
  await press(page, "Meta+k");
  expect(await isFocused(page, "input.query")).toBe(true);

  await field(page).fill("h");
  await expect(groupCount(page, "nodes")).toHaveText("4");
  await expect(groupCount(page, "faces")).toHaveText("9");
  await expect(hitRows(page)).toHaveCount(13);
  const first = hitRows(page).first();
  await expect(first).toHaveClass(/active/);
  await expect(first).toHaveAttribute("data-path", "sensing/noise");
  await expect(first).not.toHaveAttribute("data-face");
  const firstFace = page.locator('.results .group[data-group="faces"] .hit').first();
  await expect(firstFace).toHaveAttribute("data-path", "");
  await expect(firstFace).toHaveAttribute("data-side", "in");
  await expect(firstFace).toHaveAttribute("data-face", "h_ref");
  expect(await page.locator(".results .hit:not(:has(mark))").count()).toBe(0);
  await expect(canvas(page)).toHaveClass(/searching/);
  await expect(childHits(page)).toHaveCount(0);
  await expect(under(page)).toHaveCount(3);
  for (const id of ["sensing", "pid_controller", "selection"]) await expect(page.locator(`g.block.search-under[data-id="${id}"]`)).toHaveCount(1);
  await expect(portHits(page)).toHaveCount(8);
  await expect(page.locator('g.block.pin.search-hit[data-id="⟨in⟩h_ref"]')).toHaveCount(1);
  await expect(page.locator('g.block[data-id="⟨in⟩h_ref"] > .halo.dashed')).toHaveCount(1);
  await expect(page.locator('g.block[data-id="sensing"] > .halo.dashed')).toHaveCount(1);
  await expect(page.locator('rect.port-halo.dashed')).toHaveCount(8);
  // a hit stays opaque, the rest dims by opacity
  const opacity = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).opacity);
  expect(await opacity('g.block[data-id="sensing"] > .shape')).toBe("1");
  expect(await opacity('g.block[data-id="plant"] > .shape')).toBe("0.3");
  expect(await opacity('rect.port[data-port="plant|out|h"]')).toBe("1");
  await shot(page, "closed_loop", "", "search");

  // Down twice and Enter: the third row's node selected as a tree click does, focus on the canvas region, the outline back
  const third = hitRows(page).nth(2);
  await expect(third).toHaveAttribute("data-path", "selection/select_δe");
  await press(page, "ArrowDown");
  await press(page, "ArrowDown");
  await expect(third).toHaveClass(/active/);
  await press(page, "Enter");
  await page.locator(readyLevel("selection")).waitFor();
  await expect(page.locator("nav.breadcrumb")).toHaveAttribute("data-level-path", "selection");
  await expect(page.locator('g.block.selected[data-id="selection/select_δe"]')).toHaveCount(1);
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "leaf");
  expect(await isFocused(page, ".viewport")).toBe(true);
  await expect(page.locator(".results")).toHaveCount(0);
  await expect(page.locator('nav.tree .row.expanded[data-path="selection"]')).toHaveCount(1);
  await expect(rowHits(page, "selection")).toHaveCount(0);
  await expect(page.locator('nav.tree .row.hit[data-path="selection/select_δe"]')).toHaveCount(1);
  await expect(page.locator('nav.tree .row.hit[data-path="selection/select_δt"]')).toHaveCount(1);
  await expect(rowHits(page, "sensing")).toHaveText("1");
  await expect(rowHits(page, "pid_controller")).toHaveText("1");
  await expect(rowHits(page, "lqr_controller")).toHaveCount(0);
  await expect(page.locator('nav.tree .row.hit[data-path="lqr_controller"]')).toHaveCount(1);
  await page.locator('nav.tree .row[data-path="sensing"] button.chevron').click();
  await expect(page.locator('nav.tree .row.hit[data-path="sensing/noise"]')).toHaveCount(1);
  await expect(rowHits(page, "sensing")).toHaveCount(0);
  await shot(page, "closed_loop", "", "search-markers");
  await press(page, "Backspace");
  await page.locator(readyLevel("")).waitFor();
  await field(page).focus();
  await expect(hitRows(page)).toHaveCount(13);

  await field(page).fill("type:Junction");
  await expect(hitRows(page)).toHaveCount(26);
  await expect(under(page)).toHaveCount(2);
  await field(page).fill("path:sensing");
  await expect(page.locator('g.block.search-hit[data-id="sensing"]')).toHaveCount(1);
  await expect(under(page)).toHaveCount(0);
  await expect(portHits(page)).toHaveCount(2);
  await expect(page.locator('rect.port.search-hit[data-port="sensing|in|h"]')).toHaveCount(1);
  await expect(page.locator('rect.port.search-hit[data-port="sensing|out|h_meas"]')).toHaveCount(1);
  await field(page).fill("face:in1");
  await expect(page.locator('.results .group[data-group="faces"] .hit')).toHaveCount(8);
  await expect(page.locator('.results .group[data-group="nodes"]')).toHaveCount(0);
  // a face hit beneath a closed assembly marks its owner, so the assembly takes the dashed halo (reading 5); the
  // oracle's table counts node hits only beneath and reads none here
  await expect(under(page)).toHaveCount(3);
  await field(page).fill("path:plant face:h");
  await expect(hitRows(page)).toHaveCount(1);
  await expect(portHits(page)).toHaveCount(1);
  await field(page).fill("zzz");
  await expect(hitRows(page)).toHaveCount(0);
  await expect(canvas(page)).toHaveClass(/searching/);

  // Escape in the field
  await field(page).fill("h");
  await press(page, "Escape");
  await expect(field(page)).toHaveValue("");
  await expect(canvas(page)).not.toHaveClass(/searching/);
  await expect(page.locator("nav.tree .hits")).toHaveCount(0);
  await expect(page.locator("nav.tree .row.hit")).toHaveCount(0);
  expect(await isFocused(page, ".viewport")).toBe(true);
  // the clear button
  await search(page, "h");
  await page.locator(".search button.clear").click();
  await expect(field(page)).toHaveValue("");
  await expect(canvas(page)).not.toHaveClass(/searching/);
  await expect(page.locator("nav.tree .hits")).toHaveCount(0);
  expect(await isFocused(page, ".viewport")).toBe(true);
});

test("closed_loop: a node row picked by a click selects as a tree click does", async ({ page }) => {
  await drop(page, "closed_loop");
  await search(page, "plant");
  await expect(hitRows(page)).toHaveCount(1);
  await expect(page.locator('g.block.search-hit[data-id="plant"]')).toHaveCount(1);
  await page.locator('.results .hit[data-path="plant"]').click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "leaf");
  // the selected hit's halo is solid
  await expect(page.locator('g.block[data-id="plant"] > .halo.dashed')).toHaveCount(0);
});

test("large: b lists 100 rows and the refine note", async ({ page }) => {
  await drop(page, "large");
  await search(page, "b");
  await expect(hitRows(page)).toHaveCount(100);
  await expect(groupCount(page, "nodes")).toHaveText("171");
  await expect(page.locator(".results .refine")).toHaveText("171 hits; showing 100, refine the query");
});

test("rates: hold marks fast and slow with one beneath each, and fast/outer once fast expands", async ({ page }) => {
  await drop(page, "rates");
  await search(page, "hold");
  await expect(hitRows(page)).toHaveCount(2);
  await page.locator(".viewport").focus();
  await expect(rowHits(page, "fast")).toHaveText("1");
  await expect(rowHits(page, "slow")).toHaveText("1");
  await expect(page.locator('g.block.search-under[data-id="fast"]')).toHaveCount(1);
  await expect(page.locator('g.block.search-under[data-id="slow"]')).toHaveCount(1);
  await page.locator('nav.tree .row[data-path="fast"] button.chevron').click();
  await expect(rowHits(page, "fast/outer")).toHaveText("1");
  await expect(rowHits(page, "fast")).toHaveCount(0);
  await page.locator('g.block[data-id="fast"]').dblclick();
  await page.locator(readyLevel("fast")).waitFor();
  await expect(page.locator('g.block.search-under[data-id="fast/outer"]')).toHaveCount(1);
});
