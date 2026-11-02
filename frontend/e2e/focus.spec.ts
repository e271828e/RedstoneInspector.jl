// The legend's focus (visual_grammar.md answers 6 and 9, workspace.md answer 11,
// as amended in increment 6's look pass): a legend line lights its blocks, the
// closed assemblies with a leaf of it beneath and the wires it tints, dims the
// rest as a search does and marks the tree; a second click, Escape and tier mode
// clear it; it holds across levels and a push that keeps the triple; with a query
// standing the canvas shows the focus and the tree the query's marks. The lit
// sets are the look fixer's oracle's (`continuous.py <fixtures> <key> closed_loop`);
// the legend's steps, renumbered by the assembly rule of 2026-11-02, read by hand.
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, openPath, press, readyLevel, shot } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const line = (page: Page, sel: string) => page.locator(`.viewport .legend li${sel} button.line`);
const litBlocks = (page: Page) => page.locator("svg.canvas g.block.lit").evaluateAll((gs) => gs.map((g) => g.getAttribute("data-id")).sort());
const litWires = (page: Page) => page.locator("svg.canvas path.wire.lit").evaluateAll((ps) => ps.map((p) => p.getAttribute("data-wire")).sort());
const opacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
const row = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);

test("closed_loop: anchor 4's line lights the gray pid_controller and its wire, dims the rest, marks the tree; a second click clears it", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "r");
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
  await line(page, '[data-step="3"]').click();
  await expect(svg(page)).toHaveClass(/\blegend-focus\b/);
  await expect(svg(page)).toHaveAttribute("data-focus", "4,1,0");
  await expect(line(page, '[data-step="3"]')).toHaveAttribute("aria-pressed", "true");
  await expect(line(page, '[data-step="0"]')).toHaveAttribute("aria-pressed", "false");
  await expect(line(page, ".continuous")).toHaveAttribute("aria-pressed", "false");
  expect(await litBlocks(page)).toEqual(["pid_controller"]);
  expect(await litWires(page)).toEqual(["selection|in|δe_pid"]);
  // the search's dimming: the rest at the palette's 0.3, the lit at 1; no pin lit
  expect(await opacity(page, 'g.block[data-id="plant"] > .shape')).toBe("0.3");
  expect(await opacity(page, 'g.block[data-id="⟨in⟩h_ref"] > .shape')).toBe("0.3");
  expect(await opacity(page, 'g.block[data-id="pid_controller"] > .shape')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="selection|in|δe_pid"]')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="sensing|in|h"]')).toBe("0.3");
  // the tree: q_ctl, the one row on anchor 4, counted up its collapsed parent, marked once expanded
  await expect(row(page, "pid_controller").locator(".hits")).toHaveText("1");
  await expect(page.locator("nav.tree .row .hits")).toHaveCount(1);
  await row(page, "pid_controller").locator("button.chevron").click();
  await expect(row(page, "pid_controller/q_ctl")).toHaveClass(/\bhit\b/);
  await expect(page.locator("nav.tree .row.hit")).toHaveCount(1);
  await shot(page, "closed_loop", "", "focus");

  // it holds on another level
  await openPath(page, "pid_controller");
  await expect(svg(page)).toHaveAttribute("data-focus", "4,1,0");
  expect(await litBlocks(page)).toEqual(["pid_controller/q_ctl"]);
  expect(await litWires(page)).toEqual(["pid_controller/θ_ctl|in|saturation", "⟨out⟩δe|in|δe"]);
  await line(page, '[data-step="3"]').click();
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
  await expect(svg(page)).not.toHaveAttribute("data-focus");
  await expect(page.locator("svg.canvas .lit")).toHaveCount(0);
  await expect(page.locator("nav.tree .row.hit")).toHaveCount(0);
  expect(await opacity(page, 'g.block[data-id="pid_controller/h_ctl"] > .shape')).toBe("1");
});

test("closed_loop: the continuous line lights plant, the assemblies with a continuous leaf beneath and plant's 17 wires", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "r");
  await line(page, ".continuous").click();
  await expect(svg(page)).toHaveAttribute("data-focus", "continuous");
  expect(await litBlocks(page)).toEqual(["actuators", "lqr_controller", "pid_controller", "plant", "selection", "sensing"]);
  const wires = await litWires(page);
  expect(wires).toHaveLength(17);
  expect(wires).toContain("sensing|in|h");
  expect(wires).not.toContain("pid_controller|in|V_ref");
  await expect(row(page, "plant")).toHaveClass(/\bhit\b/);
  await expect(row(page, "sensing")).not.toHaveClass(/\bhit\b/);
  await expect(row(page, "sensing").locator(".hits")).toHaveText("1");
  await expect(row(page, "lqr_controller").locator(".hits")).toHaveText("7");
});

test("closed_loop: Escape clears the focus before the query, tier mode clears it, a push keeps or drops it", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "r");
  // with a query standing the canvas shows the focus, the tree the query's marks
  await press(page, "/");
  await page.keyboard.type("h");
  await press(page, "Tab");
  await expect(svg(page)).toHaveClass(/\bsearching\b/);
  await line(page, '[data-step="3"]').click();
  await expect(svg(page)).toHaveClass(/\blegend-focus\b/);
  await expect(svg(page)).not.toHaveClass(/\bsearching\b/);
  await expect(page.locator("svg.canvas .search-hit")).toHaveCount(0);
  await expect(row(page, "sensing").locator(".hits")).toHaveText("1");
  await expect(row(page, "selection").locator(".hits")).toHaveText("2");
  await press(page, "Escape");
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
  await expect(svg(page)).toHaveClass(/\bsearching\b/);
  await expect(page.locator("input.query")).toHaveValue("h");
  await press(page, "Escape");
  await expect(page.locator("input.query")).toHaveValue("");

  // tier mode clears it; back in rate mode nothing is focused
  await line(page, '[data-step="0"]').click();
  await expect(svg(page)).toHaveAttribute("data-focus", "1,1,0");
  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
  await press(page, "r");
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
  await expect(line(page, '[data-step="0"]')).toHaveAttribute("aria-pressed", "false");

  // a push that keeps the triple keeps it; one that does not drops it
  await line(page, '[data-step="3"]').click();
  await dropOver(page, "closed_loop_deployment");
  await expect(svg(page)).toHaveAttribute("data-focus", "4,1,0");
  expect(await litBlocks(page)).toEqual(["pid_controller"]);
  await dropOver(page, "rates");
  await page.locator(readyLevel("")).waitFor();
  await expect(svg(page)).not.toHaveClass(/legend-focus/);
});
