// The text levels (visual_grammar.md answer 10): zoomed out past each floor of
// legibility one level of text drops, face names first, then the display name
// with its icon, the segment last; wires and port squares never drop. The floors
// are the look pass's (2026-11-27, 4.1), so library loads below the segment's.
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, press, shot } from "./fixtures";
import { detailAt, FLOOR_FACES, FLOOR_NAMES, FLOOR_SEGMENTS } from "../src/canvas/size";

const svg = (page: Page) => page.locator("svg.canvas");
/** The scale, screen pixels per world unit: the svg's width over the viewBox's. */
const scale = (page: Page) => svg(page).evaluate((s: SVGSVGElement) => s.clientWidth / s.viewBox.baseVal.width);
/** `-` pressed until the scale is below the floor. */
async function zoomBelow(page: Page, floor: number) {
  for (let i = 0; i < 40 && (await scale(page)) >= floor; i++) await press(page, "-");
  expect(await scale(page)).toBeLessThan(floor);
}
/** Each element's computed `display` under the selector. */
const displays = (page: Page, sel: string) => page.locator(`svg.canvas ${sel}`).evaluateAll((es) => es.map((e) => getComputedStyle(e).display));
const allShown = async (page: Page, sel: string) => {
  const d = await displays(page, sel);
  expect(d.length, sel).toBeGreaterThan(0);
  expect(d.every((x) => x !== "none"), `${sel} shown`).toBe(true);
};
const allHidden = async (page: Page, sel: string) => {
  const d = await displays(page, sel);
  expect(d.length, sel).toBeGreaterThan(0);
  expect(d.every((x) => x === "none"), `${sel} hidden`).toBe(true);
};

test("closed_loop: the three floors drop the face names, then the display names and icons, then the segments", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-detail", "full");
  expect(await scale(page)).toBeGreaterThanOrEqual(FLOOR_FACES);
  const wires = await page.locator("path.wire").count(), ports = await page.locator("rect.port").count();
  for (const sel of ["text.face", "text.segment", "text.display", "g.block.pin text"]) await allShown(page, sel);

  await zoomBelow(page, FLOOR_FACES);
  await expect(svg(page)).toHaveAttribute("data-detail", "no-faces");
  await allHidden(page, "text.face");
  for (const sel of ["text.segment", "text.display", "g.block.pin text"]) await allShown(page, sel);

  await zoomBelow(page, FLOOR_NAMES);
  await expect(svg(page)).toHaveAttribute("data-detail", "segments");
  for (const sel of ["text.face", "text.display"]) await allHidden(page, sel);
  for (const sel of ["text.segment", "g.block.pin text"]) await allShown(page, sel);

  await zoomBelow(page, FLOOR_SEGMENTS);
  await expect(svg(page)).toHaveAttribute("data-detail", "frames");
  for (const sel of ["text.face", "text.display", "text.segment"]) await allHidden(page, sel);
  // the drawing's skeleton stays: every wire and port square, and the pins' names
  await expect(page.locator("path.wire")).toHaveCount(wires);
  await expect(page.locator("rect.port")).toHaveCount(ports);
  for (const sel of ["path.wire", "rect.port", "g.block.pin text"]) await allShown(page, sel);
  await shot(page, "closed_loop", "", "zoom");

  await press(page, "0");
  await expect(svg(page)).toHaveAttribute("data-detail", "full");
  await allShown(page, "text.face");
});

test("closed_loop's sensing: the icons drop with the display names and stay dropped at frames", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "sensing");
  await allShown(page, "g.icon");
  await zoomBelow(page, FLOOR_FACES);
  await allShown(page, "g.icon");
  await zoomBelow(page, FLOOR_NAMES);
  await allHidden(page, "g.icon");
  await zoomBelow(page, FLOOR_SEGMENTS);
  await expect(svg(page)).toHaveAttribute("data-detail", "frames");
  await allHidden(page, "g.icon");
});

test("library: the fit lands below the segment's floor, so the root loads at the frames level, and each zoom step draws detailAt's level for its scale (the look pass, 4.1)", async ({ page }) => {
  await drop(page, "library");
  const fit = await scale(page);
  expect(fit).toBeLessThan(FLOOR_SEGMENTS);
  await expect(svg(page)).toHaveAttribute("data-detail", "frames");
  await page.locator(".viewport").focus();
  const seen = new Set<string>();
  for (let i = 0; i < 12 && !seen.has("full"); i++) {
    await press(page, "+");
    const d = detailAt(await scale(page));
    seen.add(d);
    await expect(svg(page)).toHaveAttribute("data-detail", d);
  }
  expect([...seen]).toEqual(["frames", "segments", "no-faces", "full"].filter((d) => seen.has(d)));
  expect(seen.has("full")).toBe(true);
});
