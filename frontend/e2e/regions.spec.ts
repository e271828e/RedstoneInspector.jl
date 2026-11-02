// Regions for keyed containers (visual_grammar.md answer 5, workspace.md answer
// 2): a dashed frame captioned with the field around the elements, each labelled
// by its key, the frame derived from its members' boxes, the region the tree's
// folder selected both ways. From the oracle (`grammar.py`).
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, expect, press, shot } from "./fixtures";

const region = (page: Page, path: string) => page.locator(`g.region[data-path="${path}"]`);
const row = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);
/** A region's frame in world units, read off its `rect.shape`. */
const frame = (page: Page, path: string) => region(page, path).locator("rect.shape").evaluate((r) => {
  const a = (n: string) => Number(r.getAttribute(n));
  return { x: a("x"), y: a("y"), width: a("width"), height: a("height") };
});
type Box = { x: number; y: number; width: number; height: number };
const inside = (b: Box, f: Box) => b.x >= f.x && b.y >= f.y && b.x + b.width <= f.x + f.width && b.y + b.height <= f.y + f.height;
const overlaps = (b: Box, f: Box) => b.x < f.x + f.width && f.x < b.x + b.width && b.y < f.y + f.height && f.y < b.y + b.height;

test("containers: the two regions, their members by key inside, the rest outside", async ({ page }) => {
  await drop(page, "containers");
  await expect(page.locator("g.region")).toHaveCount(2);
  expect(await page.locator("g.region").evaluateAll((gs) => gs.map((g) => g.getAttribute("data-path")))).toEqual(["gains", "pair"]);
  await expect(region(page, "gains").locator("text.caption")).toHaveText("gains");
  await expect(region(page, "pair").locator("text.caption")).toHaveText("pair");
  for (const [p, key, r] of [["gains/a", "a", "gains"], ["gains/b", "b", "gains"], ["pair/1", "1", "pair"]]) {
    const b = page.locator(`g.block[data-id="${p}"]`);
    await expect(b).toHaveAttribute("data-region", r);
    await expect(b.locator("text.segment")).toHaveText(key);
  }
  for (const p of ["s1", "s2", "scale"]) await expect(page.locator(`g.block[data-id="${p}"]`)).not.toHaveAttribute("data-region");
  await expect(page.locator('g.block[data-id="s1"] text.segment')).toHaveText("s1");
  // the dashed frame, rounded
  expect(await region(page, "gains").locator("rect.shape").evaluate((r) => getComputedStyle(r).strokeDasharray)).not.toBe("none");
  await expect(region(page, "gains").locator("rect.shape")).toHaveAttribute("rx", "6");
  // members inside their region's frame, the others outside both
  const boxes = await blockBoxes(page);
  const box = (id: string) => boxes.find((b) => b.id === id)!;
  const gains = await frame(page, "gains"), pair = await frame(page, "pair");
  for (const p of ["gains/a", "gains/b"]) expect(inside(box(p), gains), p).toBe(true);
  expect(inside(box("pair/1"), pair)).toBe(true);
  for (const p of ["s1", "s2", "scale"]) for (const f of [gains, pair]) expect(overlaps(box(p), f), p).toBe(false);
  // regions draw before the blocks
  expect(await page.locator("g.regions").evaluate((g) => !!(g.compareDocumentPosition(document.querySelector("g.blocks")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await shot(page, "containers", "", "regions");
});

test("containers: the folder selected from the tree and from the region's caption, the frame following a dragged member", async ({ page }) => {
  await drop(page, "containers");
  await row(page, "gains").click();
  await expect(region(page, "gains")).toHaveClass(/\bselected\b/);
  await expect(region(page, "pair")).not.toHaveClass(/\bselected\b/);
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "folder");

  await region(page, "pair").locator("text.caption").click();
  await expect(region(page, "pair")).toHaveClass(/\bselected\b/);
  await expect(region(page, "gains")).not.toHaveClass(/\bselected\b/);
  await expect(row(page, "pair")).toHaveClass(/\bselected\b/);
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "folder");
  await expect(page.locator("aside.detail .facts")).toContainText("field pair");

  // a click on the frame's edge selects too: the top edge, near its right end, clear of the wires, in the middle of
  // the band the stroke and its halo take, 5.5 world units above the edge to 0.5 below, at the current scale
  const g = (await region(page, "gains").locator("rect.shape").boundingBox())!;
  const scale = await page.locator("svg.canvas").evaluate((s: SVGSVGElement) => s.clientWidth / s.viewBox.baseVal.width);
  await page.mouse.click(g.x + g.width - 16, g.y - 2.5 * scale);
  await expect(region(page, "gains")).toHaveClass(/\bselected\b/);

  // gains/b dragged 100 down: gains' frame grows to hold it, pair's stays
  const before = { gains: await frame(page, "gains"), pair: await frame(page, "pair") };
  const r = (await page.locator('g.block[data-id="gains/b"] > .shape').boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 10);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2, r.y + 110, { steps: 8 });
  await page.mouse.up();
  const after = { gains: await frame(page, "gains"), pair: await frame(page, "pair") };
  expect(after.pair).toEqual(before.pair);
  expect(after.gains.height).toBeGreaterThan(before.gains.height);
  const b = (await blockBoxes(page)).find((x) => x.id === "gains/b")!;
  expect(inside(b, after.gains)).toBe(true);
  expect(b.y).toBeGreaterThan(before.gains.y + before.gains.height - 12);

  await press(page, "Escape");
  await expect(page.locator("g.region.selected")).toHaveCount(0);
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
});

test("closed_loop: a level with no keyed container draws no region", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(page.locator("g.region")).toHaveCount(0);
});
