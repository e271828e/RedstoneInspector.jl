// The keyboard table (workspace.md answers 11 and 3) on closed_loop's root: h j k l
// move the selection by quadrant and center distance with the view following,
// the arrows pan, Shift-h and Shift-l walk the levels back and forward, Shift-j and
// Shift-k open and climb, z centres the selection, 0 + - fit and zoom, d toggles
// the drawer, Tab cycles the four regions with the ring for the keyboard only, the
// reserved keys do nothing, Escape clears the query before the selection. The
// geometric pins are recomputed here from the DOM, by the brief's rules.
import { test, type Page } from "@playwright/test";
import { blockBoxes, clickWire, drop, expect, hash, press, readyLevel, shot, viewBox } from "./fixtures";

type Box = { id: string; x: number; y: number; width: number; height: number };
type Dir = "h" | "j" | "k" | "l";

/** The check's own reading of `nearest`: the quadrant of the direction, the least center distance, ties by the lower id. */
function nearest(boxes: Box[], from: string, dir: Dir): string | undefined {
  const c = (b: Box) => [b.x + b.width / 2, b.y + b.height / 2];
  const [ox, oy] = c(boxes.find((b) => b.id === from)!);
  const unit = { h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0] }[dir];
  const ranked = boxes.filter((b) => b.id !== from).map((b) => {
    const [x, y] = c(b);
    const along = (x - ox) * unit[0] + (y - oy) * unit[1];
    const across = unit[0] !== 0 ? y - oy : x - ox;
    return { id: b.id, inQuadrant: along > Math.abs(across), d: Math.hypot(x - ox, y - oy) };
  }).filter((r) => r.inQuadrant).sort((a, b) => a.d - b.d || (a.id < b.id ? -1 : 1));
  return ranked[0]?.id;
}

const inside = (outer: { x: number; y: number; width: number; height: number }, b: Box) =>
  b.x >= outer.x && b.y >= outer.y && b.x + b.width <= outer.x + outer.width && b.y + b.height <= outer.y + outer.height;
/** Screen pixels per world unit. */
const scaleOf = async (page: Page) => (await page.locator("svg.canvas").evaluate((s) => s.clientWidth)) / (await viewBox(page)).width;
const selectedBlock = (page: Page) => page.locator("svg.canvas g.block.selected");

test.beforeEach(async ({ page }) => {
  await drop(page, "closed_loop");
});

test("h j k l from plant select the nearest block in each direction, the pane following", async ({ page }) => {
  const boxes = await blockBoxes(page);
  await page.locator('g.block[data-id="plant"]').click();
  let at = "plant";
  for (const dir of ["l", "j", "k", "h"] as Dir[]) {
    const to = nearest(boxes, at, dir) ?? at;
    await press(page, dir);
    await expect(selectedBlock(page), `${dir} from ${at}`).toHaveAttribute("data-id", to);
    await expect(selectedBlock(page)).toHaveCount(1);
    await expect(page.locator("aside.detail")).toHaveAttribute("data-id", to);
    expect(inside(await viewBox(page), boxes.find((b) => b.id === to)!), `${to} in view`).toBe(true);
    at = to;
  }
});

test("a block off-screen after zooming in is brought into view when l selects it", async ({ page }) => {
  for (let i = 0; i < 4; i++) await press(page, "+");
  const boxes = await blockBoxes(page);
  const view = await viewBox(page);
  // a child block, selected through its tree row, whose l-neighbour lies outside the view
  const children = boxes.filter((b) => !b.id.startsWith("⟨"));
  const from = children.find((b) => {
    const to = nearest(boxes, b.id, "l");
    return to !== undefined && !inside(view, boxes.find((x) => x.id === to)!);
  });
  expect(from, "a neighbour of a block off-screen").toBeDefined();
  const to = nearest(boxes, from!.id, "l")!;
  await page.locator(`nav.tree .row[data-path="${from!.id}"]`).click();
  await expect(selectedBlock(page)).toHaveAttribute("data-id", from!.id);
  // the tree holds the keyboard after the row's click, where l is the tree's; Tab hands it to the canvas
  await press(page, "Tab");
  await press(page, "l");
  await expect(selectedBlock(page)).toHaveAttribute("data-id", to);
  const after = await viewBox(page);
  expect(inside(after, boxes.find((b) => b.id === to)!)).toBe(true);
  // a pan, not a zoom
  expect(after.width).toBeCloseTo(view.width, 6);
});

test("with nothing selected l selects the first block; from a wire l moves from its consumer", async ({ page }) => {
  const first = await page.locator("svg.canvas g.block").first().getAttribute("data-id");
  await press(page, "l");
  await expect(selectedBlock(page)).toHaveAttribute("data-id", first!);

  const boxes = await blockBoxes(page);
  await clickWire(page, "sensing|in|h");
  await expect(page.locator('path.wire.selected[data-wire="sensing|in|h"]')).toHaveCount(1);
  await press(page, "l");
  await expect(selectedBlock(page)).toHaveAttribute("data-id", nearest(boxes, "sensing", "l")!);
});

test("the arrows pan by 48 screen pixels; Shift with h j k l does not", async ({ page }) => {
  const scale = await scaleOf(page);
  const step = 48 / scale;
  const start = await viewBox(page);
  const expectAt = async (dx: number, dy: number, what: string) => {
    const v = await viewBox(page);
    expect(Math.abs(v.x - (start.x + dx * step)), `${what} x`).toBeLessThan(0.01);
    expect(Math.abs(v.y - (start.y + dy * step)), `${what} y`).toBeLessThan(0.01);
    expect(v.width, what).toBeCloseTo(start.width, 6);
  };
  await press(page, "ArrowRight");
  await expectAt(1, 0, "Right");
  await press(page, "ArrowLeft");
  await expectAt(0, 0, "Left");
  await press(page, "ArrowDown");
  await expectAt(0, 1, "Down");
  await press(page, "ArrowUp");
  await expectAt(0, 0, "Up");
  // at the root with nothing selected, Shift with h j k l has nothing to walk, open or climb, and no longer pans
  for (const k of ["Shift+H", "Shift+J", "Shift+K", "Shift+L"]) {
    await press(page, k);
    await expectAt(0, 0, k);
  }
  // panning moves no selection
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
});

test("Shift-h and Shift-l walk back and forward through this load's levels and never leave the page", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", (d) => { dialogs.push(d.type()); d.accept(); });
  const url = page.url();
  const level = page.locator("nav.breadcrumb");
  const settle = () => page.waitForTimeout(300);
  // the first entry this load made: nothing before it
  await press(page, "Shift+H");
  await settle();
  expect(page.url()).toBe(url);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await press(page, "Shift+H");
  await expect(level).toHaveAttribute("data-level-path", "");
  expect(await hash(page)).toBe("");
  await press(page, "Shift+L");
  await expect(level).toHaveAttribute("data-level-path", "sensing");
  expect(await hash(page)).toBe("#level=sensing");
  // nothing after the last entry
  await press(page, "Shift+L");
  await settle();
  await expect(level).toHaveAttribute("data-level-path", "sensing");
  await press(page, "Shift+H");
  await expect(level).toHaveAttribute("data-level-path", "");
  await press(page, "Shift+H");
  await settle();
  expect(page.url()).toBe(url);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  expect(dialogs).toEqual([]);
});

test("Shift-j opens the selected assembly as Enter does, Shift-k climbs as Backspace does", async ({ page }) => {
  const level = page.locator("nav.breadcrumb");
  await page.locator('g.block[data-id="sensing"]').click();
  await press(page, "Shift+J");
  await expect(level).toHaveAttribute("data-level-path", "sensing");
  await press(page, "Shift+K");
  await expect(level).toHaveAttribute("data-level-path", "");
  await page.locator('g.block[data-id="actuators"]').click();
  await press(page, "Enter");
  await expect(level).toHaveAttribute("data-level-path", "actuators");
});

test("z centres the selected block, port or wire at the current zoom; with nothing selected it does nothing", async ({ page }) => {
  const centreOf = (sel: string) => page.locator(sel).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  });
  for (let i = 0; i < 3; i++) await press(page, "+");
  const zoomed = await viewBox(page);
  await press(page, "z");
  expect(await viewBox(page)).toEqual(zoomed);
  for (const [select, sel] of [
    ['g.block[data-id="plant"]', 'g.block[data-id="plant"] > .shape'],
    ['rect.port[data-port="sensing|in|h"]', 'rect.port[data-port="sensing|in|h"]'],
  ]) {
    await press(page, "0");
    await page.locator(select).click();
    for (let i = 0; i < 3; i++) await press(page, "+");
    for (let i = 0; i < 6; i++) await press(page, "ArrowRight");
    await press(page, "z");
    const [cx, cy] = await centreOf("svg.canvas");
    const [x, y] = await centreOf(sel);
    expect(Math.abs(x - cx), `${sel} x`).toBeLessThan(0.5);
    expect(Math.abs(y - cy), `${sel} y`).toBeLessThan(0.5);
    expect((await viewBox(page)).width, "the zoom kept").toBeCloseTo(zoomed.width, 6);
  }
  await press(page, "0");
  await clickWire(page, "sensing|in|h");
  for (let i = 0; i < 3; i++) await press(page, "+");
  for (let i = 0; i < 6; i++) await press(page, "ArrowDown");
  const before = await viewBox(page);
  await press(page, "z");
  const [cx, cy] = await centreOf("svg.canvas");
  const [x, y] = await centreOf('path.wire[data-wire="sensing|in|h"]');
  expect(Math.abs(x - cx), "wire x").toBeLessThan(0.5);
  expect(Math.abs(y - cy), "wire y").toBeLessThan(0.5);
  expect((await viewBox(page)).width).toBeCloseTo(before.width, 6);
});

test("+ and - zoom by 1.25 about the center, = is +, 0 restores the fit", async ({ page }) => {
  const fitted = await viewBox(page);
  const center = (v: typeof fitted) => [v.x + v.width / 2, v.y + v.height / 2];
  const expectCenter = async (what: string) => {
    const v = await viewBox(page);
    const [cx, cy] = center(v), [fx, fy] = center(fitted);
    expect(Math.abs(cx - fx), `${what} center x`).toBeLessThan(0.01);
    expect(Math.abs(cy - fy), `${what} center y`).toBeLessThan(0.01);
    return v;
  };
  // the pointer rests off-center over the canvas: the keys still zoom about the center
  const canvas = (await page.locator("svg.canvas").boundingBox())!;
  await page.mouse.move(canvas.x + canvas.width * 0.2, canvas.y + canvas.height * 0.3);
  await press(page, "+");
  expect(Math.abs((await expectCenter("+")).width - fitted.width / 1.25)).toBeLessThan(0.01);
  await press(page, "=");
  expect(Math.abs((await expectCenter("=")).width - fitted.width / 1.25 ** 2)).toBeLessThan(0.01);
  await press(page, "-");
  await press(page, "-");
  await press(page, "-");
  expect(Math.abs((await expectCenter("-")).width - fitted.width * 1.25)).toBeLessThan(0.01);
  await press(page, "0");
  const refit = await viewBox(page);
  for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(refit[k] - fitted[k]), k).toBeLessThan(0.01);
  // a second time, after a pan
  await press(page, "ArrowRight");
  await press(page, "0");
  const again = await viewBox(page);
  for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(again[k] - fitted[k]), k).toBeLessThan(0.01);
});

test("d opens the drawer on its tab and closes it", async ({ page }) => {
  const drawer = page.locator("section.drawer");
  await expect(drawer).toHaveAttribute("data-open", "false");
  await press(page, "d");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect(drawer).toHaveAttribute("data-tab", "diagnostics");
  await shot(page, "closed_loop", "", "keys");
  await press(page, "d");
  await expect(drawer).toHaveAttribute("data-open", "false");
});

test("the focus ring shows for the keyboard's focus, not after a mouse press on the canvas", async ({ page }) => {
  const ring = () => page.locator(".viewport").evaluate((el) => getComputedStyle(el).outlineStyle);
  await press(page, "Tab");
  await press(page, "Tab");
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await ring()).toBe("solid");
  await page.locator("nav.tree .row").first().click();
  const canvas = (await page.locator("svg.canvas").boundingBox())!;
  await page.mouse.click(canvas.x + 5, canvas.y + canvas.height - 5);
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);
  expect(await ring()).toBe("none");
});

test("Tab and Shift-Tab cycle the four regions, each the one focused", async ({ page }) => {
  const order = ["nav.tree", ".viewport", "aside.detail", "section.drawer", "nav.tree"];
  const expectFocused = async (sel: string) => {
    await expect(page.locator(".focused")).toHaveCount(1);
    await expect(page.locator(`${sel}.focused`)).toHaveCount(1);
    expect(await page.evaluate((s) => document.activeElement === document.querySelector(s), sel), sel).toBe(true);
  };
  await expect(page.locator(".focused")).toHaveCount(0);
  for (const sel of order) {
    await press(page, "Tab");
    await expectFocused(sel);
  }
  for (const sel of [...order].reverse().slice(1)) {
    await press(page, "Shift+Tab");
    await expectFocused(sel);
  }
});

test("t o and ? leave the selection, the view and the drawer as they were", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  await press(page, "+");
  const before = { view: await viewBox(page), drawer: await page.locator("section.drawer").getAttribute("data-open") };
  for (const key of ["t", "o", "?"]) await press(page, key);
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  expect(await viewBox(page)).toEqual(before.view);
  expect(await page.locator("section.drawer").getAttribute("data-open")).toBe(before.drawer);
  await expect(page.locator("nav.breadcrumb")).toHaveAttribute("data-level-path", "");
});

test("r toggles the color mode, leaving the selection and the view", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  const before = await viewBox(page);
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "tier");
  await press(page, "r");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "rate");
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  expect(await viewBox(page)).toEqual(before);
  await press(page, "r");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "tier");
});

test("Escape clears a standing query first, leaving the selection, then the selection", async ({ page }) => {
  await press(page, "/");
  await page.locator("input.query").fill("h");
  await page.locator('g.block[data-id="plant"]').click();
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  await expect(page.locator("svg.canvas")).toHaveClass(/searching/);
  await press(page, "Escape");
  await expect(page.locator("input.query")).toHaveValue("");
  await expect(page.locator("svg.canvas")).not.toHaveClass(/searching/);
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  await press(page, "Escape");
  await expect(selectedBlock(page)).toHaveCount(0);
});
