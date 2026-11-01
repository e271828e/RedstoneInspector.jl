// A block or a pin dragged to untangle a view (initial_design.md answer 12, the
// spike's local router): the box moves by the drag in world units, only its wires
// are re-routed, it is drawn last and selected; the place lasts across a level
// change and a drop of the same structure, and not across a reload.
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, dropOver, expect, fixtureText, readyLevel, shot, viewBox } from "./fixtures";

type Box = { id: string; x: number; y: number; width: number; height: number };
const boxOf = async (page: Page, id: string) => (await blockBoxes(page)).find((b) => b.id === id)!;
const wires = (page: Page) => page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll<SVGPathElement>("svg.canvas path.wire")].map((p) => [p.dataset.wire!, p.getAttribute("d")!])));
const points = (d: string) => d.split(/[ML]/).filter((s) => s.trim()).length;
/** Screen pixels per world unit. */
const scaleOf = async (page: Page) => (await page.locator("svg.canvas").evaluate((s) => s.clientWidth)) / (await viewBox(page)).width;

/** Presses on the block's header, left of its middle, and drags by (dx, dy) screen pixels. */
async function dragBlock(page: Page, id: string, dx: number, dy: number) {
  const r = (await page.locator(`g.block[data-id="${id}"] > .shape`).boundingBox())!;
  const at = { x: r.x + r.width / 2, y: r.y + 10 };
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await page.mouse.move(at.x + dx, at.y + dy, { steps: 8 });
  await page.mouse.up();
}

type End = { path: string; port: string };
/** The root wires of a fixture matching a test, by their ids: the consumer's port id, a root output's pin. */
function rootWires(fixture: string, test: (w: { from: End; to: End }) => boolean): Set<string> {
  const root = JSON.parse(fixtureText(fixture)).build.structure.nodes.find((n: { path: string }) => n.path === "");
  const id = (to: End) => (to.path === "" ? `⟨out⟩${to.port}|in|${to.port}` : `${to.path}|in|${to.port}`);
  return new Set(root.wires.filter(test).map((w: { to: End }) => id(w.to)));
}
/** The root wires touching a child block. */
const touching = (fixture: string, block: string) => rootWires(fixture, (w) => w.from.path === block || w.to.path === block);

test("closed_loop: plant dragged moves alone with its wires, raised and selected; a small drag stays, a pin drags", async ({ page }) => {
  await drop(page, "closed_loop");
  const before = await blockBoxes(page);
  const wiresBefore = await wires(page);
  const scale = await scaleOf(page);

  await dragBlock(page, "plant", 0, 120);
  const moved = await boxOf(page, "plant");
  const was = before.find((b) => b.id === "plant")!;
  expect(Math.abs(moved.y - (was.y + 120 / scale))).toBeLessThan(1);
  expect(Math.abs(moved.x - was.x)).toBeLessThan(1e-6);
  const after = await wires(page);
  const mine = touching("closed_loop", "plant");
  expect(mine.size).toBeGreaterThan(0);
  for (const [id, d] of Object.entries(after)) {
    if (mine.has(id)) expect(d, `${id} re-routed`).not.toBe(wiresBefore[id]);
    else expect(d, `${id} kept`).toBe(wiresBefore[id]);
  }
  expect(await page.locator("svg.canvas g.blocks > g.block").last().getAttribute("data-id")).toBe("plant");
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  for (const b of await blockBoxes(page)) if (b.id !== "plant") expect(b, b.id).toEqual(before.find((x) => x.id === b.id));
  await shot(page, "closed_loop", "", "drag");

  // a drag under the slop is a click
  const settled = await blockBoxes(page);
  await dragBlock(page, "sensing", 2, 0);
  expect(await blockBoxes(page)).toEqual(settled);
  await expect(page.locator('g.block.selected[data-id="sensing"]')).toHaveCount(1);

  // a pin drags as a block does
  const pin = await page.locator('g.block[data-id="⟨in⟩h_ref"] > .shape').boundingBox();
  await page.mouse.move(pin!.x + pin!.width / 2, pin!.y + pin!.height / 2);
  await page.mouse.down();
  await page.mouse.move(pin!.x + pin!.width / 2, pin!.y + pin!.height / 2 + 120, { steps: 8 });
  await page.mouse.up();
  const tag = settled.find((b) => b.id === "⟨in⟩h_ref")!;
  expect(Math.abs((await boxOf(page, "⟨in⟩h_ref")).y - (tag.y + 120 / scale))).toBeLessThan(1);
  for (const b of await blockBoxes(page)) if (b.id !== "⟨in⟩h_ref") expect(b, b.id).toEqual(settled.find((x) => x.id === b.id));
});

test("closed_loop: the h_ref tag dragged re-routes its two wires alone, raised, kept across a level change and a push", async ({ page }) => {
  await drop(page, "closed_loop");
  const wiresBefore = await wires(page);
  const scale = await scaleOf(page);
  const was = await boxOf(page, "⟨in⟩h_ref");
  const r = (await page.locator('g.block[data-id="⟨in⟩h_ref"] > .shape').boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 - 60, r.y + r.height / 2 + 90, { steps: 8 });
  await page.mouse.up();
  const dragged = await boxOf(page, "⟨in⟩h_ref");
  expect(Math.abs(dragged.x - (was.x - 60 / scale))).toBeLessThan(1);
  expect(Math.abs(dragged.y - (was.y + 90 / scale))).toBeLessThan(1);
  const mine = rootWires("closed_loop", (w) => w.from.path === "" && w.from.port === "h_ref");
  expect(mine.size).toBe(2);
  for (const [id, d] of Object.entries(await wires(page))) {
    if (mine.has(id)) expect(d, `${id} re-routed`).not.toBe(wiresBefore[id]);
    else expect(d, `${id} kept`).toBe(wiresBefore[id]);
  }
  expect(await page.locator("svg.canvas g.blocks > g.block").last().getAttribute("data-id")).toBe("⟨in⟩h_ref");
  await expect(page.locator('g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);

  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  expect(await boxOf(page, "⟨in⟩h_ref")).toEqual(dragged);
  await dropOver(page, "closed_loop_deployment");
  expect(await boxOf(page, "⟨in⟩h_ref")).toEqual(dragged);
  expect(await page.locator("svg.canvas g.blocks > g.block").last().getAttribute("data-id")).toBe("⟨in⟩h_ref");
});

test("closed_loop: the dragged place survives a level change and a drop of the same structure, not a reload", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  const scale = await scaleOf(page);
  await dragBlock(page, "plant", 0, 120);
  const dragged = await boxOf(page, "plant");
  expect(Math.abs(dragged.y - (elk.find((b) => b.id === "plant")!.y + 120 / scale))).toBeLessThan(1);

  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  expect(await boxOf(page, "plant")).toEqual(dragged);

  await dropOver(page, "closed_loop_deployment");
  expect(await boxOf(page, "plant")).toEqual(dragged);
  expect(await boxOf(page, "sensing")).toEqual(elk.find((b) => b.id === "sensing"));
  expect(await page.locator("svg.canvas g.blocks > g.block").last().getAttribute("data-id")).toBe("plant");

  await page.reload();
  await dropOver(page, "closed_loop");
  expect(await boxOf(page, "plant")).toEqual(elk.find((b) => b.id === "plant"));
});

test("descent: plant's wires take the router's forward and backward forms, stop's wire stays", async ({ page }) => {
  await drop(page, "descent");
  const before = await wires(page);
  // plant down: gear still lies right of it, a forward route of four points
  await dragBlock(page, "plant", 0, 120);
  let after = await wires(page);
  expect(points(before["gear|in|h"])).toBe(2);
  expect(points(after["gear|in|h"])).toBe(4);
  expect(after["stop|in|u"]).toBe(before["stop|in|u"]);
  // plant past gear: a backward route of six points, run below both boxes
  const scale = await scaleOf(page);
  const gear = await boxOf(page, "gear");
  const plant = await boxOf(page, "plant");
  await dragBlock(page, "plant", (gear.x + gear.width - plant.x) * scale, 0);
  after = await wires(page);
  expect(points(after["gear|in|h"])).toBe(6);
  const ys = after["gear|in|h"].split(/[ML]/).filter((s) => s.trim()).map((p) => Number(p.split(",")[1]));
  const bottom = Math.max(...[await boxOf(page, "plant"), gear].map((b) => b.y + b.height));
  expect(Math.max(...ys)).toBeGreaterThan(bottom);
  expect(after["stop|in|u"]).toBe(before["stop|in|u"]);
  await shot(page, "descent", "", "drag");
});
