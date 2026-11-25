// The keyboard table (workspace.md answers 11 and 3) on closed_loop's root: h j k l
// move the selection by quadrant and center distance with the view following,
// the arrows pan, Shift-h and Shift-l walk the levels back and forward, Shift-j and
// Shift-k open and climb, zz centres the selection, z with h j k l pans and zi zo zoom,
// d and u pan by half a page, 0 + - fit and zoom, Shift-r toggles the drawer, the
// prefixes z and g wait in the status bar and a held z keeps acting, the retired keys
// do nothing, Tab cycles the four regions, the ring on a focused pane's box for the
// mouse and the keyboard and on the canvas for the keyboard only, t with nothing
// selected does nothing, Escape clears the query before the selection; ? is
// help.spec.ts's, the cursor in the panes is cursor.spec.ts's, the tree's keys tree.spec.ts's. The geometric pins are recomputed here from the
// DOM, by the brief's rules.
import { test, type Page } from "@playwright/test";
import { blockBoxes, clickWire, cursor, drop, dropOver, expect, hash, press, pressAll, readyLevel, shot, viewBox } from "./fixtures";

type Box = { id: string; x: number; y: number; width: number; height: number };
type Dir = "h" | "j" | "k" | "l";

/** The check's own reading of `nearest`: centers beyond the origin's far edge, the least edge gap plus twice the perpendicular center offset, ties by the lower id. */
function nearest(boxes: Box[], from: string, dir: Dir): string | undefined {
  const c = (b: Box) => [b.x + b.width / 2, b.y + b.height / 2];
  const o = boxes.find((b) => b.id === from)!;
  const [ox, oy] = c(o);
  const ranked = boxes.filter((b) => b.id !== from).map((b) => {
    const [x, y] = c(b);
    const beyond = dir === "l" ? x >= o.x + o.width : dir === "h" ? x <= o.x : dir === "j" ? y >= o.y + o.height : y <= o.y;
    const along = dir === "l" ? b.x - (o.x + o.width) : dir === "h" ? o.x - (b.x + b.width) : dir === "j" ? b.y - (o.y + o.height) : o.y - (b.y + b.height);
    const across = dir === "h" || dir === "l" ? Math.abs(y - oy) : Math.abs(x - ox);
    return { id: b.id, beyond, score: Math.max(along, 0) + 2 * across };
  }).filter((r) => r.beyond).sort((a, b) => a.score - b.score || (a.id < b.id ? -1 : 1));
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

test("zz centres the selected block, port or wire at the current zoom; with nothing selected it does nothing", async ({ page }) => {
  const centreOf = (sel: string) => page.locator(sel).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  });
  for (let i = 0; i < 3; i++) await press(page, "+");
  const zoomed = await viewBox(page);
  await pressAll(page, "z", "z");
  expect(await viewBox(page)).toEqual(zoomed);
  for (const [select, sel] of [
    ['g.block[data-id="plant"]', 'g.block[data-id="plant"] > .shape'],
    ['rect.port[data-port="sensing|in|h"]', 'rect.port[data-port="sensing|in|h"]'],
  ]) {
    await press(page, "0");
    await page.locator(select).click();
    for (let i = 0; i < 3; i++) await press(page, "+");
    for (let i = 0; i < 6; i++) await press(page, "ArrowRight");
    await pressAll(page, "z", "z");
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
  await pressAll(page, "z", "z");
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

test("Shift-r opens the drawer on its tab and closes it", async ({ page }) => {
  const drawer = page.locator("section.drawer");
  await expect(drawer).toHaveAttribute("data-open", "false");
  await press(page, "Shift+R");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect(drawer).toHaveAttribute("data-tab", "diagnostics");
  await shot(page, "closed_loop", "", "keys");
  await press(page, "Shift+R");
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

test("t with nothing selected leaves the view and the drawer as they were", async ({ page }) => {
  await press(page, "+");
  const before = { view: await viewBox(page), drawer: await page.locator("section.drawer").getAttribute("data-open") };
  await press(page, "t");
  await expect(page.locator("svg.canvas")).not.toHaveClass(/route-focus/);
  await expect(page.locator("footer.status span.route")).toHaveCount(0);
  expect(await viewBox(page)).toEqual(before.view);
  expect(await page.locator("section.drawer").getAttribute("data-open")).toBe(before.drawer);
  await expect(page.locator("nav.breadcrumb")).toHaveAttribute("data-level-path", "");
});

test("c toggles the color mode and y the type labels, each alone, leaving the selection and the view", async ({ page }) => {
  const svg = page.locator("svg.canvas");
  await page.locator('g.block[data-id="plant"]').click();
  const before = await viewBox(page);
  await expect(svg).toHaveAttribute("data-mode", "tier");
  await press(page, "c");
  await expect(svg).toHaveAttribute("data-mode", "rate");
  await expect(svg).not.toHaveAttribute("data-labels");
  await press(page, "y");
  await expect(svg).toHaveAttribute("data-labels", "");
  await expect(svg).toHaveAttribute("data-mode", "rate");
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  expect(await viewBox(page)).toEqual(before);
  await press(page, "c");
  await expect(svg).toHaveAttribute("data-mode", "tier");
  await expect(svg).toHaveAttribute("data-labels", "");
  await press(page, "y");
  await expect(svg).not.toHaveAttribute("data-labels");
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

/** Where the ring shows: each pane's box by name, the canvas's root, and how many of the other three roots carry one. */
const rings = (page: Page) => page.evaluate(() => {
  const on = (e: Element) => getComputedStyle(e).outlineStyle !== "none";
  const pane = (p: string) => on(document.querySelector(`.pane[data-pane="${p}"]`)!);
  return {
    tree: pane("tree"), detail: pane("detail"), drawer: pane("drawer"), canvas: on(document.querySelector(".viewport")!),
    roots: [...document.querySelectorAll("nav.tree, aside.detail, section.drawer")].filter(on).length,
  };
});
const ringOn = (where?: "tree" | "detail" | "drawer" | "canvas") =>
  ({ tree: where === "tree", detail: where === "detail", drawer: where === "drawer", canvas: where === "canvas", roots: 0 });

test("the ring outlines the tree's, the detail pane's and the drawer's box after a click and after Tab, the canvas only after Tab", async ({ page }) => {
  await press(page, "Shift+R");
  await page.locator('nav.tree .row[data-path="plant"] .segment').click();
  expect(await rings(page), "a row's click").toEqual(ringOn("tree"));
  await shot(page, "closed_loop", "", "ring-tree");
  await page.locator("aside.detail h2").click();
  expect(await rings(page), "the pane's text clicked").toEqual(ringOn("detail"));
  await shot(page, "closed_loop", "", "ring-detail");
  await page.locator("section.drawer .tab-body").click({ position: { x: 400, y: 60 } });
  expect(await rings(page), "the drawer's body clicked").toEqual(ringOn("drawer"));
  await shot(page, "closed_loop", "", "ring-drawer");
  const canvas = (await page.locator("svg.canvas").boundingBox())!;
  await page.mouse.click(canvas.x + 5, canvas.y + canvas.height - 5);
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await rings(page), "the canvas pressed").toEqual(ringOn());
  for (const where of ["detail", "drawer", "tree", "canvas"] as const) {
    await press(page, "Tab");
    expect(await rings(page), `Tab to ${where}`).toEqual(ringOn(where));
  }
  await shot(page, "closed_loop", "", "ring-canvas");
});

test("a click below the tree's rows or a pin's short facts in the detail pane, past their last element, focuses that region", async ({ page }) => {
  // closed_loop's seven rows and a pin's pane are short at any font, and the click's point is checked to lie below them
  await page.locator('g.block[data-id="⟨in⟩mode"]').click();
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "pin");
  for (const [pane, root] of [["tree", "nav.tree"], ["detail", "aside.detail"]] as const) {
    const body = (await page.locator(`.pane[data-pane="${pane}"] .body`).boundingBox())!;
    const y = body.y + body.height - 4;
    const last = await page.locator(root).evaluate((r) => Math.max(...[...r.children].map((c) => c.getBoundingClientRect().bottom)));
    expect(last, `${pane}'s content ends above the click`).toBeLessThan(y - 20);
    await expect(page.locator(`${root}.focused`), `${pane} not yet focused`).toHaveCount(0);
    await page.mouse.click(body.x + body.width / 2, y);
    await expect(page.locator(`${root}.focused`), pane).toHaveCount(1);
  }
});

test("a click on a non-focusable place outside every region, the status bar's text or the other pane's head, clears the tree's or the detail pane's focus, and j then acts on the canvas", async ({ page }) => {
  const boxes = await blockBoxes(page);
  const below = nearest(boxes, "plant", "j")!;
  const cases: [string, () => Promise<void>, string][] = [
    ["tree", () => page.locator('nav.tree .row[data-path="plant"] .segment').click(), "footer.status .counts"],
    ["tree", () => page.locator('nav.tree .row[data-path="plant"] .segment').click(), '.pane[data-pane="detail"] .head .title'],
    ["detail", () => page.locator("aside.detail h2").click(), "footer.status .counts"],
    ["detail", () => page.locator("aside.detail h2").click(), '.pane[data-pane="tree"] .head .title'],
  ];
  for (const [region, enter, away] of cases) {
    const what = `${region}, then ${away}`;
    await page.locator('g.block[data-id="plant"]').click();
    await enter();
    expect(await rings(page), `${what}: entered`).toEqual(ringOn(region as "tree" | "detail"));
    await page.locator(away).click();
    await expect(page.locator(".focused"), what).toHaveCount(0);
    expect(await rings(page), what).toEqual(ringOn());
    await press(page, "j");
    await expect(selectedBlock(page), what).toHaveAttribute("data-id", below);
  }
});

const prefix = (page: Page) => page.locator("footer.status span.prefix");
/** The view's travel in screen pixels from `start`. */
async function travel(page: Page, start: { x: number; y: number }): Promise<[number, number]> {
  const v = await viewBox(page), k = await scaleOf(page);
  return [Math.round((v.x - start.x) * k), Math.round((v.y - start.y) * k)];
}

test("z with h j k l pans the canvas by a step with no region focused or the canvas, the selection staying; zi and zo zoom; d and u pan by half its height", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  for (const focus of ["w", undefined]) {
    if (focus) await press(page, focus);
    else await page.locator("footer.status .counts").click();
    const start = await viewBox(page);
    for (const [key, at] of [["l", [48, 0]], ["j", [48, 48]], ["h", [0, 48]], ["k", [0, 0]]] as const) {
      await pressAll(page, "z", key);
      expect(await travel(page, start), `z ${key}`).toEqual(at);
      await expect(prefix(page)).toHaveCount(0);
    }
    const half = (await page.locator(".viewport").evaluate((e) => e.clientHeight)) / 2;
    await press(page, "d");
    expect(Math.abs((await travel(page, start))[1] - half)).toBeLessThanOrEqual(1);
    await press(page, "u");
    expect(await travel(page, start)).toEqual([0, 0]);
    await pressAll(page, "z", "i");
    expect((await viewBox(page)).width).toBeCloseTo(start.width / 1.25, 3);
    await pressAll(page, "z", "o");
    expect((await viewBox(page)).width).toBeCloseTo(start.width, 3);
    await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
    await press(page, "0");
  }
});

test("a pending z or g shows in the status bar and waits without a timeout; a second key it does not know is dropped with it, Escape cancels it before anything else, and a modifier alone leaves it", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  await page.clock.install();
  for (const key of ["z", "g"]) {
    await press(page, key);
    await expect(prefix(page)).toHaveText(`${key} …`);
    await page.clock.runFor(60_000);
    await expect(prefix(page), "no timeout").toHaveCount(1);
    if (key === "z") await shot(page, "closed_loop", "", "prefix");
    // dropped: none of these acts
    for (const [dropped, unmoved] of [["y", "data-labels"], ["c", ""], ["Tab", ""], ["/", ""], ["?", ""], ["Shift+J", ""], ["Backspace", ""], ["Enter", ""], ["ArrowDown", ""]]) {
      if (!(await prefix(page).count())) await press(page, key);
      const view = await viewBox(page);
      await press(page, dropped);
      await expect(prefix(page), `${key} ${dropped}`).toHaveCount(0);
      if (unmoved) await expect(page.locator("svg.canvas")).not.toHaveAttribute(unmoved);
      expect(await viewBox(page), `${key} ${dropped}`).toEqual(view);
    }
    await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "tier");
    await expect(page.locator("article.help")).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);
    await press(page, key);
    await press(page, "Escape");
    await expect(prefix(page)).toHaveCount(0);
    await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  }
  // Shift is down before the T of gT
  await press(page, "g");
  await page.keyboard.down("Shift");
  await expect(prefix(page)).toHaveCount(1);
  await page.keyboard.press("T");
  await page.keyboard.up("Shift");
  await expect(page.locator("section.drawer")).toHaveAttribute("data-open", "true");
  await press(page, "Escape");
  await expect(selectedBlock(page)).toHaveCount(0);
});

test("a held z acts on every h j k l i o under it, its own repeats doing nothing, until its keyup, Shift down or the search field focused (rulings 14 and 27)", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  const start = await viewBox(page);
  await page.keyboard.down("z");
  for (let i = 0; i < 4; i++) await page.keyboard.down("z");
  await expect(prefix(page)).toHaveCount(1);
  expect(await viewBox(page), "the repeats centre nothing").toEqual(start);
  for (const k of ["l", "l", "j"]) await press(page, k);
  // a direction held under it repeats, as a held arrow does
  await page.keyboard.down("l");
  await page.keyboard.down("l");
  await page.keyboard.up("l");
  await page.keyboard.down("z");
  expect(await travel(page, start)).toEqual([4 * 48, 48]);
  await press(page, "i");
  await press(page, "o");
  // a key it does not know is dropped and the hold goes on
  await press(page, "y");
  await expect(page.locator("svg.canvas")).not.toHaveAttribute("data-labels");
  await press(page, "h");
  expect(await travel(page, start)).toEqual([3 * 48, 48]);
  await expect(selectedBlock(page)).toHaveAttribute("data-id", "plant");
  await page.keyboard.up("z");
  await expect(prefix(page)).toHaveCount(0);
  await press(page, "l");
  await expect(selectedBlock(page)).not.toHaveAttribute("data-id", "plant");

  // its keyup reads Z while Shift is down
  await page.keyboard.down("z");
  await press(page, "l");
  await page.keyboard.down("Shift");
  await page.keyboard.up("z");
  await page.keyboard.up("Shift");
  await expect(prefix(page)).toHaveCount(0);
  // and goes to the search field once that is clicked
  await page.keyboard.down("z");
  await press(page, "l");
  await page.locator("input.query").click();
  await page.keyboard.up("z");
  await expect(prefix(page)).toHaveCount(0);
  // a z released before any second key is one press, which waits
  await page.locator(".viewport").focus();
  await page.keyboard.down("z");
  await page.keyboard.up("z");
  await expect(prefix(page)).toHaveCount(1);
  const before = await viewBox(page);
  await press(page, "l");
  expect(await travel(page, before)).toEqual([48, 0]);
  await expect(prefix(page)).toHaveCount(0);
});

test("the window losing the focus, an Alt key or a key with Cmd or Ctrl ends a hold of z whose keyup never comes; a z that is only pending waits through the blur and an Alt key (ruling 27)", async ({ page }) => {
  const ends: Record<string, () => Promise<unknown>> = {
    blur: () => page.evaluate(() => window.dispatchEvent(new Event("blur"))),
    Control: () => page.keyboard.press("Control+b"),
    Meta: () => page.keyboard.press("Meta"),
    // macOS may report z's keyup under Alt as another character
    Alt: () => page.keyboard.press("Alt"),
  };
  for (const [what, end] of Object.entries(ends)) {
    await page.locator('g.block[data-id="plant"]').click();
    const view = await viewBox(page);
    await page.keyboard.down("z");
    await expect(prefix(page), what).toHaveCount(1);
    await end();
    await expect(prefix(page), what).toHaveCount(0);
    await press(page, "l");
    await expect(selectedBlock(page), what).not.toHaveAttribute("data-id", "plant");
    expect(await viewBox(page), what).toEqual(view);
    await page.keyboard.up("z");
    await expect(prefix(page), what).toHaveCount(0);
  }
  await press(page, "z");
  await ends.blur();
  await ends.Alt();
  await expect(prefix(page)).toHaveCount(1);
  await press(page, "Escape");
  // an Alt key in the search field ends a hold too
  await page.keyboard.down("z");
  await press(page, "l");
  await page.locator("input.query").click();
  await ends.Alt();
  await expect(prefix(page)).toHaveCount(0);
  await page.keyboard.up("z");
});

test("a refusal unloading the model drops a pending prefix, which the next model does not show", async ({ page }) => {
  await press(page, "z");
  await expect(prefix(page)).toHaveCount(1);
  await dropOver(page, "bad", "{}");
  await expect(page.locator("pre.outcome")).toHaveCount(1);
  await dropOver(page, "closed_loop");
  await expect(page.locator("footer.status")).toHaveCount(1);
  await expect(prefix(page)).toHaveCount(0);
});

test("Alt with z or g starts no prefix, a key with Alt under a pending one is dropped with it, and Alt with an arrow stays the browser's", async ({ page }) => {
  await page.locator('g.block[data-id="plant"]').click();
  for (const k of ["Alt+z", "Alt+g"]) {
    await press(page, k);
    await expect(prefix(page), k).toHaveCount(0);
  }
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await press(page, "g");
  await press(page, "Alt+ArrowUp");
  await expect(prefix(page)).toHaveCount(0);
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-level", "sensing");
  // Alt-Left and Alt-Right are the browser's back and forward: not prevented, and neither pans nor moves a cursor
  await page.evaluate(() => {
    (window as any).__prevented = [];
    window.addEventListener("keydown", (e) => {
      if (!e.key.startsWith("Arrow")) return;
      (window as any).__prevented.push(e.defaultPrevented);
      e.preventDefault();
    });
  });
  const view = await viewBox(page);
  await pressAll(page, "Alt+ArrowLeft", "Alt+ArrowRight");
  expect(await viewBox(page)).toEqual(view);
  await page.locator("aside.detail").focus();
  await press(page, "j");
  const at = await cursor(page);
  await pressAll(page, "Alt+ArrowLeft", "Alt+ArrowRight", "Alt+ArrowDown");
  expect(await cursor(page)).toBe(at);
  expect(await page.evaluate(() => (window as any).__prevented)).toEqual([false, false, false, false, false]);
});

test("Tab in the search field with a prefix pending moves to the next region, the prefix left waiting", async ({ page }) => {
  await press(page, "z");
  await page.locator("input.query").click();
  await press(page, "Tab");
  expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);
  await expect(prefix(page)).toHaveCount(1);
});

test("with no model a z or a g waits for nothing", async ({ page }) => {
  await page.goto("/");
  for (const key of ["z", "g"]) {
    await pressAll(page, key, "?");
    await expect(page.locator("article.help"), key).toHaveCount(1);
    await press(page, "?");
    await expect(page.locator("article.help"), key).toHaveCount(0);
  }
});

test("the retired keys act no more: z alone centres nothing, d, m and i toggle no pane, u and Shift-u put no drag back, r leaves the colors", async ({ page }) => {
  const at = () => page.locator('g.block[data-id="plant"]').getAttribute("transform");
  const box = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 20, box.y + 70, { steps: 4 });
  await page.mouse.up();
  const placed = await at();
  await expect(page.locator("button.undo-drags")).toHaveAttribute("title", "Put every dragged component and pin back in its computed place (X)");
  await press(page, "+");
  const view = await viewBox(page);
  await pressAll(page, "z", "Escape", "m", "i", "d", "u", "Shift+U", "Shift+D", "Shift+M", "Shift+I", "Shift+Z");
  expect(await viewBox(page)).toEqual(view);
  await expect(page.locator(".pane.side.collapsed")).toHaveCount(0);
  await expect(page.locator("section.drawer")).toHaveAttribute("data-open", "false");
  await press(page, "r");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "tier");
  expect(await at()).toBe(placed);
  await expect(page.locator("button.undo-drags")).toHaveCount(1);
  await press(page, "x");
  await page.locator(readyLevel("")).waitFor();
  expect(await at()).not.toBe(placed);
});
