// Pan, zoom and fit (workspace.md answer 3) on closed_loop's root, read through
// the SVG's own coordinate transform.
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, expect, openPath, shot, viewBox } from "./fixtures";
/** A client point's world coordinates under the SVG's current transform. */
const toWorld = (page: Page, x: number, y: number) => page.evaluate(([x, y]) => {
  const svg = document.querySelector<SVGSVGElement>("svg.canvas")!;
  const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!.inverse());
  return { x: p.x, y: p.y };
}, [x, y]);
/** A world point's client coordinates under the SVG's current transform. */
const toClient = (page: Page, x: number, y: number) => page.evaluate(([x, y]) => {
  const svg = document.querySelector<SVGSVGElement>("svg.canvas")!;
  const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!);
  return { x: p.x, y: p.y };
}, [x, y]);

type Box = { x: number; y: number; width: number; height: number };
const expectContains = (outer: Box, boxes: (Box & { id?: string })[]) => {
  for (const b of boxes) {
    expect(b.x, b.id).toBeGreaterThanOrEqual(outer.x);
    expect(b.y, b.id).toBeGreaterThanOrEqual(outer.y);
    expect(b.x + b.width, b.id).toBeLessThanOrEqual(outer.x + outer.width);
    expect(b.y + b.height, b.id).toBeLessThanOrEqual(outer.y + outer.height);
  }
};

test("closed_loop: fit contains every block, the wheel zooms about the pointer, a drag pans, the button fits", async ({ page }) => {
  await drop(page, "closed_loop");
  const fitted = await viewBox(page);

  // every block's box, in world units, inside the fitted viewBox
  const boxes = await blockBoxes(page);
  expect(boxes).toHaveLength(9);
  expectContains(fitted, boxes);

  // the wheel: the world point under the pointer stays within 1 px of the pointer
  const svgBox = (await page.locator("svg.canvas").boundingBox())!;
  const pointer = { x: svgBox.x + 700, y: svgBox.y + 400 };
  const world = await toWorld(page, pointer.x, pointer.y);
  await page.mouse.move(pointer.x, pointer.y);
  await page.mouse.wheel(0, 240);
  await expect.poll(async () => (await viewBox(page)).width).not.toBeCloseTo(fitted.width, 3);
  const zoomed = await viewBox(page);
  const back = await toClient(page, world.x, world.y);
  expect(Math.abs(back.x - pointer.x)).toBeLessThan(1);
  expect(Math.abs(back.y - pointer.y)).toBeLessThan(1);

  // a background drag shifts the viewBox by the drag in world units
  const scale = svgBox.width / zoomed.width;
  const start = { x: svgBox.x + 6, y: svgBox.y + 6 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 120, start.y + 80, { steps: 8 });
  await page.mouse.up();
  const panned = await viewBox(page);
  expect(Math.abs(panned.x - (zoomed.x - 120 / scale))).toBeLessThan(1 / scale);
  expect(Math.abs(panned.y - (zoomed.y - 80 / scale))).toBeLessThan(1 / scale);
  expect(panned.width).toBeCloseTo(zoomed.width, 6);
  await shot(page, "closed_loop", "", "view");

  // the fit button restores the fitted viewBox
  await page.locator("button.fit").click();
  const refit = await viewBox(page);
  for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(refit[k] - fitted[k]), k).toBeLessThan(1);
});

test("closed_loop: opening lqr_controller fits it", async ({ page }) => {
  await drop(page, "closed_loop");
  const root = await viewBox(page);
  await openPath(page, "lqr_controller");
  const fitted = await viewBox(page);
  const boxes = await blockBoxes(page);
  expect(boxes).toHaveLength(21);
  expectContains(fitted, boxes);
  // the level's own fit, not the root's
  expect(fitted).not.toEqual(root);
});
