// A block or a pin dragged to untangle a view (initial_design.md answer 12, the
// spike's local router): the box moves by the drag in world units, only its wires
// are re-routed, it is drawn last and selected; the place lasts across a level
// change and a drop of the same structure, and not across a reload; Shift keeps
// the move to one axis (as amended in increment 6's look pass). `u` puts the last
// drag back in its computed place, `U` and the undo button every one, the view kept
// (increment 8b): the computed place is ELK's at load, which no other drag moves.
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, dropOver, expect, fixtureText, press as pressKey, readyLevel, shot, viewBox } from "./fixtures";

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

/** The pointer at the block's header, pressed. */
async function press(page: Page, id: string): Promise<{ x: number; y: number }> {
  const r = (await page.locator(`g.block[data-id="${id}"] > .shape`).boundingBox())!;
  const at = { x: r.x + r.width / 2, y: r.y + 10 };
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  return at;
}

test("closed_loop: Shift keeps a drag to its axis of greater travel, pressed at the start or midway, and releasing it frees the move", async ({ page }) => {
  await drop(page, "closed_loop");
  const scale = await scaleOf(page);
  const was = await boxOf(page, "plant");
  const near = (a: number, b: number) => Math.abs(a - b) < 1;

  // held from the press: (100, 30) moves along x alone
  await page.keyboard.down("Shift");
  let at = await press(page, "plant");
  await page.mouse.move(at.x + 100, at.y + 30, { steps: 8 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  let b = await boxOf(page, "plant");
  expect([near(b.x, was.x + 100 / scale), near(b.y, was.y)]).toEqual([true, true]);

  // pressed midway with no pointer move: the diagonal place snaps to the y axis, the greater travel
  const from = await boxOf(page, "plant");
  at = await press(page, "plant");
  await page.mouse.move(at.x + 40, at.y + 120, { steps: 8 });
  b = await boxOf(page, "plant");
  expect([near(b.x, from.x + 40 / scale), near(b.y, from.y + 120 / scale)]).toEqual([true, true]);
  await page.keyboard.down("Shift");
  await expect.poll(async () => (await boxOf(page, "plant")).x).toBeCloseTo(from.x, 3);
  b = await boxOf(page, "plant");
  expect(near(b.y, from.y + 120 / scale)).toBe(true);
  // released: free again at the pointer's place
  await page.keyboard.up("Shift");
  await expect.poll(async () => (await boxOf(page, "plant")).x).toBeCloseTo(from.x + 40 / scale, 3);
  await page.mouse.up();
  b = await boxOf(page, "plant");
  expect([near(b.x, from.x + 40 / scale), near(b.y, from.y + 120 / scale)]).toEqual([true, true]);

  // a root tag too: (-20, 90) with Shift keeps to y
  const tag = await boxOf(page, "⟨in⟩h_ref");
  await page.keyboard.down("Shift");
  at = await press(page, "⟨in⟩h_ref");
  await page.mouse.move(at.x - 20, at.y + 90, { steps: 8 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  b = await boxOf(page, "⟨in⟩h_ref");
  expect([near(b.x, tag.x), near(b.y, tag.y + 90 / scale)]).toEqual([true, true]);
});

/** A key pressed, then the level drawn again: an undo clears `data-ready` while ELK runs. */
async function undo(page: Page, key: "x" | "Shift+X") {
  await pressKey(page, key);
  await page.locator(readyLevel("")).waitFor();
}
const lastDrawn = (page: Page) => page.locator("svg.canvas g.blocks > g.block").last().getAttribute("data-id");
const undoButton = (page: Page) => page.locator(".viewport .tools button.undo-drags");

test("closed_loop: x puts the last dragged block back in its place at load, the other drag, the view and the selection kept; x again the one before; with no drag x and X lay nothing out", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  const at = (id: string) => elk.find((b) => b.id === id)!;
  const wiresAtLoad = await wires(page);
  await dragBlock(page, "plant", 0, 120);
  await dragBlock(page, "sensing", 80, 0);
  const plant = await boxOf(page, "plant");
  expect(plant).not.toEqual(at("plant"));
  expect(await boxOf(page, "sensing")).not.toEqual(at("sensing"));
  await page.locator('g.block[data-id="lqr_controller"]').click();
  await pressKey(page, "+");
  const view = await viewBox(page);

  await undo(page, "x");
  for (const b of await blockBoxes(page)) expect(b, b.id).toEqual(b.id === "plant" ? plant : at(b.id));
  expect(await viewBox(page)).toEqual(view);
  await expect(page.locator("svg.canvas g.block.selected")).toHaveAttribute("data-id", "lqr_controller");
  expect(await lastDrawn(page)).toBe("plant");
  await expect(undoButton(page)).toHaveCount(1);

  await undo(page, "x");
  expect(await blockBoxes(page)).toEqual(elk);
  expect(await wires(page)).toEqual(wiresAtLoad);
  expect(await viewBox(page)).toEqual(view);
  await expect(undoButton(page)).toHaveCount(0);

  // nothing left: neither key runs a layout, which would clear data-ready
  await page.evaluate(() => {
    const svg = document.querySelector("svg.canvas")!;
    (window as any).__cleared = 0;
    new MutationObserver(() => { if (!svg.hasAttribute("data-ready")) (window as any).__cleared++; })
      .observe(svg, { attributes: true, attributeFilter: ["data-ready"] });
  });
  await pressKey(page, "x");
  await pressKey(page, "Shift+X");
  await pressKey(page, "0");
  expect(await page.evaluate(() => (window as any).__cleared)).toBe(0);
  expect(await blockBoxes(page)).toEqual(elk);
});

test("closed_loop: a block dragged twice counts once and is the last; a drag after an undo joins the list; X puts every one back", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  const at = (id: string) => elk.find((b) => b.id === id)!;
  const wiresAtLoad = await wires(page);
  await dragBlock(page, "plant", 0, 120);
  await dragBlock(page, "sensing", 80, 0);
  await dragBlock(page, "plant", 40, 0);
  const sensing = await boxOf(page, "sensing");
  await undo(page, "x");
  expect(await boxOf(page, "plant")).toEqual(at("plant"));
  expect(await boxOf(page, "sensing")).toEqual(sensing);
  expect(await lastDrawn(page)).toBe("sensing");

  await dragBlock(page, "lqr_controller", 0, 80);
  await undo(page, "x");
  expect(await boxOf(page, "lqr_controller")).toEqual(at("lqr_controller"));
  expect(await boxOf(page, "sensing")).toEqual(sensing);

  await dragBlock(page, "plant", 0, 120);
  await undo(page, "Shift+X");
  expect(await blockBoxes(page)).toEqual(elk);
  expect(await wires(page)).toEqual(wiresAtLoad);
});

test("closed_loop: x during a drag does nothing, the drag landing where released", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  const scale = await scaleOf(page);
  const r = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
  const from = { x: r.x + r.width / 2, y: r.y + 10 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, from.y + 60, { steps: 4 });
  await pressKey(page, "x");
  await pressKey(page, "Shift+X");
  await page.mouse.move(from.x, from.y + 120, { steps: 4 });
  await page.mouse.up();
  const was = elk.find((b) => b.id === "plant")!;
  expect(Math.abs((await boxOf(page, "plant")).y - (was.y + 120 / scale))).toBeLessThan(1);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await undo(page, "x");
  expect(await boxOf(page, "plant")).toEqual(was);
});

test("closed_loop: after an undo a push keeps the remaining drag in its place, and x then puts it back", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  const at = (id: string) => elk.find((b) => b.id === id)!;
  await dragBlock(page, "plant", 0, 120);
  await dragBlock(page, "sensing", 80, 0);
  const plant = await boxOf(page, "plant");
  await undo(page, "x");
  await dropOver(page, "closed_loop_deployment");
  expect(await boxOf(page, "plant")).toEqual(plant);
  expect(await boxOf(page, "sensing")).toEqual(at("sensing"));
  await expect(undoButton(page)).toHaveCount(1);
  await undo(page, "x");
  expect(await boxOf(page, "plant")).toEqual(at("plant"));
  await expect(undoButton(page)).toHaveCount(0);
});

test("closed_loop: the undo button shows beside Fit only while the drawn level holds a drag, and puts back every one", async ({ page }) => {
  await drop(page, "closed_loop");
  const elk = await blockBoxes(page);
  await expect(undoButton(page)).toHaveCount(0);
  await dragBlock(page, "plant", 0, 120);
  await dragBlock(page, "sensing", 80, 0);
  await expect(undoButton(page)).toHaveCount(1);
  const [u, fit] = [(await undoButton(page).boundingBox())!, (await page.locator("button.fit").boundingBox())!];
  expect(u.x + u.width, "left of Fit").toBeLessThanOrEqual(fit.x);
  expect(Math.abs(u.y - fit.y), "on Fit's line").toBeLessThan(2);
  await shot(page, "closed_loop", "", "undo-button");
  // another level holds no drag
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(undoButton(page)).toHaveCount(0);
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(undoButton(page)).toHaveCount(1);
  const view = await viewBox(page);
  await undoButton(page).click();
  await page.locator(readyLevel("")).waitFor();
  expect(await blockBoxes(page)).toEqual(elk);
  expect(await viewBox(page)).toEqual(view);
  await expect(undoButton(page)).toHaveCount(0);
});

test("closed_loop: the undo button's click, which unmounts it, leaves the focus on the canvas, so Tab goes on to the detail pane", async ({ page }) => {
  await drop(page, "closed_loop");
  await dragBlock(page, "plant", 0, 120);
  await undoButton(page).click();
  await page.locator(readyLevel("")).waitFor();
  await expect(undoButton(page)).toHaveCount(0);
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);
  await pressKey(page, "Tab");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
});

test("closed_loop: x pressed while another level lays out leaves that level to draw, the root's drag kept", async ({ page }) => {
  await drop(page, "closed_loop");
  await dragBlock(page, "plant", 0, 120);
  const plant = await boxOf(page, "plant");
  // the double-click starts sensing's layout; the key comes one task later, while the canvas still shows the root
  await page.evaluate(() => {
    document.querySelector('svg.canvas g.block[data-id="sensing"]')!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "x", bubbles: true })), 0);
  });
  await page.locator(readyLevel("sensing")).waitFor({ timeout: 5000 });
  await expect(page.locator("nav.breadcrumb")).toHaveAttribute("data-level-path", "sensing");
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  expect(await boxOf(page, "plant")).toEqual(plant);
});
