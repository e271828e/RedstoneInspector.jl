// Single selection and hover (workspace.md answer 4, visual_grammar.md answer 9)
// on closed_loop's root.
import { test } from "@playwright/test";
import { clickWire, drop, expect, selected, shot, wirePoint } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await drop(page, "closed_loop");
});

test("a block alone is selected, its incident wires cased", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await expect(selected(page)).toHaveCount(1);
  // the oracle's 11 wires at plant, and no casing on any other
  await expect(page.locator("path.casing.incident")).toHaveCount(11);
  await expect(page.locator("path.casing")).toHaveCount(11);
  await shot(page, "closed_loop", "", "select");
});

test("a wire is selected and its two port squares marked", async ({ page }) => {
  await clickWire(page, "sensing|in|h");
  await expect(page.locator('path.wire.selected[data-wire="sensing|in|h"]')).toHaveCount(1);
  await expect(page.locator("rect.port.marked")).toHaveCount(2);
  await expect(page.locator('rect.port.marked[data-port="plant|out|h"]')).toHaveCount(1);
  await expect(page.locator('rect.port.marked[data-port="sensing|in|h"]')).toHaveCount(1);
  // the wire and its casing
  await expect(page.locator("svg.canvas .selected")).toHaveCount(2);
  await expect(page.locator('path.casing.selected[data-wire="sensing|in|h"]')).toHaveCount(1);
});

test("a port square and a pin are each selected alone", async ({ page }) => {
  await page.locator('rect.port[data-port="plant|out|V"]').click();
  await expect(page.locator('rect.port.selected[data-port="plant|out|V"]')).toHaveCount(1);
  await expect(selected(page)).toHaveCount(1);
  await page.locator('g.block[data-id="⟨in⟩h_ref"]').click();
  await expect(page.locator('g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);
  await expect(selected(page)).toHaveCount(1);
});

test("Escape and a background click clear the selection", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  await expect(selected(page)).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(selected(page)).toHaveCount(0);
  // the pointer still rests on plant, whose wires keep only hover's half-strength casing
  await expect(page.locator("path.casing.incident")).toHaveCount(0);
  await expect(page.locator("path.casing.incident-hover")).toHaveCount(11);

  await page.locator('g.block[data-id="plant"]').click();
  await expect(selected(page)).toHaveCount(1);
  const box = (await page.locator("svg.canvas").boundingBox())!;
  await page.mouse.click(box.x + 6, box.y + 6);
  await expect(selected(page)).toHaveCount(0);
});

test("hovering a block marks it", async ({ page }) => {
  await page.locator('g.block[data-id="sensing"]').hover();
  await expect(page.locator('g.block.hover[data-id="sensing"]')).toHaveCount(1);
  await expect(page.locator("svg.canvas .hover")).toHaveCount(1);
});

test("hovering a wire marks it and its two port squares at half strength", async ({ page }) => {
  const at = await wirePoint(page, "sensing|in|h");
  await page.mouse.move(at.x, at.y);
  await expect(page.locator('path.wire.hover[data-wire="sensing|in|h"]')).toHaveCount(1);
  await expect(page.locator("path.wire.hover")).toHaveCount(1);
  await expect(page.locator("rect.port.marked-hover")).toHaveCount(2);
  await expect(page.locator('rect.port.marked-hover[data-port="plant|out|h"]')).toHaveCount(1);
  await expect(page.locator('rect.port.marked-hover[data-port="sensing|in|h"]')).toHaveCount(1);
  await expect(page.locator("rect.port.marked")).toHaveCount(0);
});

test("a child block's hover title is its path and qualified name on two lines", async ({ page }) => {
  // the qualified name is plant's `type`, as its `types` row names it
  expect(await page.locator('g.block[data-id="plant"] > title').textContent()).toBe("plant\nRedstoneExamples.Longitudinal");
});
