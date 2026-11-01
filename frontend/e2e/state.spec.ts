// The second and third lifetimes (workspace.md answers 3 and 9): the open level
// in the URL's hash with back and forward, each visited level's view kept for the
// session and its layout not run again, a selection pushing no history entry, the
// hash winning on load, and a drop over a loaded model rekeying by path, the query
// surviving it.
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, fixtureText, hash, press, readyLevel, rows, shot, status, viewBox } from "./fixtures";

const levelPath = (page: Page) => page.locator("nav.breadcrumb[data-level-path]");
const expectView = async (page: Page, want: { x: number; y: number; width: number; height: number }) => {
  const v = await viewBox(page);
  for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(v[k] - want[k]), k).toBeLessThan(0.01);
};
/** Zooms with the wheel at a point inside the canvas, and waits for the change. */
async function wheelZoom(page: Page) {
  const before = await viewBox(page);
  const box = (await page.locator("svg.canvas").boundingBox())!;
  await page.mouse.move(box.x + 300, box.y + 200);
  await page.mouse.wheel(0, -240);
  await expect.poll(async () => (await viewBox(page)).width).not.toBeCloseTo(before.width, 3);
  return viewBox(page);
}

test("closed_loop: the hash follows the open level, back and forward move between levels", async ({ page }) => {
  await drop(page, "closed_loop");
  expect(await hash(page)).toBe("");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  expect(await hash(page)).toBe("#level=sensing");
  await page.goBack();
  await page.locator(readyLevel("")).waitFor();
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  expect(await hash(page)).toBe("");
  await page.goForward();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "sensing");
  expect(await hash(page)).toBe("#level=sensing");
});

test("rates: the hash names a level two deep", async ({ page }) => {
  await drop(page, "rates");
  await page.locator('g.block[data-id="fast"]').dblclick();
  await page.locator(readyLevel("fast")).waitFor();
  expect(await hash(page)).toBe("#level=fast");
  await page.locator('g.block[data-id="fast/outer"]').dblclick();
  await page.locator(readyLevel("fast/outer")).waitFor();
  expect(await hash(page)).toBe("#level=fast/outer");
  await press(page, "Backspace");
  await page.locator(readyLevel("fast")).waitFor();
  expect(await hash(page)).toBe("#level=fast");
});

test("closed_loop: a revisited level keeps its view and is not laid out again", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  const zoomed = await wheelZoom(page);
  // every time data-ready goes absent from here on is a layout run
  await page.evaluate(() => {
    const svg = document.querySelector("svg.canvas")!;
    (window as any).__layouts = 0;
    new MutationObserver((ms) => {
      for (const m of ms) if (m.attributeName === "data-ready" && !svg.hasAttribute("data-ready")) (window as any).__layouts++;
    }).observe(svg, { attributes: true });
  });
  await press(page, "Backspace");
  await page.locator(readyLevel("")).waitFor();
  expect(await hash(page)).toBe("");
  await page.locator('nav.tree .row[data-path="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await expectView(page, zoomed);
  expect(await page.evaluate(() => (window as any).__layouts)).toBe(0);
});

test("closed_loop: a selection pushes no history entry", async ({ page }) => {
  await drop(page, "closed_loop");
  const before = await page.evaluate(() => history.length);
  for (const id of ["plant", "sensing", "⟨in⟩h_ref"]) {
    await page.locator(`g.block[data-id="${id}"]`).click();
    await expect(page.locator(`g.block.selected[data-id="${id}"]`)).toHaveCount(1);
  }
  expect(await page.evaluate(() => history.length)).toBe(before);
  expect(await hash(page)).toBe("");
});

test("closed_loop: a hash naming a level wins when the model arrives, fitted", async ({ page }) => {
  await drop(page, "closed_loop", undefined, "/#level=sensing");
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "sensing");
  const v = await viewBox(page);
  await press(page, "0");
  await expectView(page, v);
});

test("closed_loop: a drop over the model rekeys the session by path, a refusal unloads it", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await page.locator('g.block[data-id="sensing/noise"]').click();
  const zoomed = await wheelZoom(page);
  await page.locator('nav.tree .row[data-path="actuators"] button.chevron').click();
  await expect(page.locator('nav.tree .row.expanded[data-path="actuators"]')).toHaveCount(1);
  await press(page, "/");
  await page.locator("input.query").fill("h");
  await page.locator(".viewport").focus();

  await dropOver(page, "closed_loop_deployment");
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "sensing");
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
  await expectView(page, zoomed);
  await expect(page.locator('nav.tree .row.expanded[data-path="actuators"]')).toHaveCount(1);
  await expect(status(page)).toHaveAttribute("data-kind", "deployment");
  await expect(page.locator("input.query")).toHaveValue("h");
  await expect(page.locator("footer.status .fallback")).toHaveCount(0);
  // the new canvas holds the focus the old one had
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);

  await dropOver(page, "rates");
  await page.locator(readyLevel("")).waitFor();
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  const fallback = page.locator("footer.status .fallback");
  await expect(fallback).toContainText("sensing");
  await expect(fallback).toContainText("the root");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  // nothing selected: the detail shows the root level
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "level");
  await expect(page.locator("aside.detail")).toHaveAttribute("data-id", "");
  // the root's facts, not the fallback an unresolved selection also tags as level ""
  await expect(page.locator("aside.detail .facts").first()).toContainText("open level");
  await expect(page.locator("input.query")).toHaveValue("h");
  expect(await hash(page)).toBe("");
  await shot(page, "rates", "", "fallback");

  const major2 = JSON.parse(fixtureText("descent"));
  major2.format_version = { major: 2, minor: 0 };
  await dropOver(page, "descent", JSON.stringify(major2));
  await expect(page.locator(".landing pre.outcome")).toContainText("format 2.0");
  await expect(rows(page)).toHaveCount(0);

  await dropOver(page, "closed_loop");
  await expect(levelPath(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("footer.status .fallback")).toHaveCount(0);
  await expect(rows(page)).toHaveCount(7);
});
