// The execution-order badges (workspace.md answers 7, 9 and 11): off at load, `o`
// and the breadcrumb's toggle turning them on, a leaf's position among the
// stage 2 rows and a closed assembly's ranges over the whole model, none on a
// leaf with stage 1 outputs alone and none on large, straddling the bottom edge
// at the left, kept per browser across a reload and a drop, none on a pin or a
// tag or on a model without an order, taking the pointer for its title and
// dimming with its block. The rate pill straddles the top edge at the left
// whatever `o` says (the second look's 2.3). The texts are the oracles'
// (`analysis.py`, `stage2.py`); the geometric pins are recomputed here from the DOM.
import { test, type Page } from "@playwright/test";
import { drop, dropOver, effectiveOpacity, expect, fixtureText, openPath, press, shot } from "./fixtures";

/** The canvas's `BADGE_INSET`, read back by the check: a pill's inset from the block's edge. */
const BADGE_INSET = 4;

const svg = (page: Page) => page.locator("svg.canvas");
const toggle = (page: Page) => page.locator("nav.breadcrumb .controls button.order-badges");
const badges = (page: Page) => page.locator("svg.canvas g.order-badge");
const badge = (page: Page, id: string) => page.locator(`svg.canvas g.block[data-id="${id}"] g.order-badge[data-id="${id}"] text.order`);
type Rect = { left: number; right: number; top: number; bottom: number };
/** The screen boxes of each badged block's shape, its order badge's rect and, when present, its rate pill's rect. */
const boxes = (page: Page) => page.evaluate(() => [...document.querySelectorAll<SVGGElement>("svg.canvas g.block:has(> g.order-badge)")].map((g) => {
  const r = (e: Element | null) => {
    if (!e) return undefined;
    const b = e.getBoundingClientRect();
    return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  };
  return { id: g.dataset.id!, block: r(g.querySelector(":scope > .shape"))!, order: r(g.querySelector(":scope > g.order-badge > rect"))!, pill: r(g.querySelector(":scope > g.badge-pill > rect")) };
}));
const overlaps = (a: Rect, b: Rect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
type Box = { x: number; y: number; width: number; height: number };
/**
 * Each block's shape with its rate pill's box and its order badge's, when drawn, in the block's own coordinates: the
 * world's units, a screen pixel each at scale 1.
 */
const pills = (page: Page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll<SVGGElement>("svg.canvas g.block:is(:has(> g.badge-pill), :has(> g.order-badge))")].map((g) => {
  const box = (e: Element | null) => {
    if (!e) return undefined;
    const b = (e as SVGGraphicsElement).getBBox();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  };
  return [g.dataset.id!, { block: box(g.querySelector(":scope > .shape"))!, pill: box(g.querySelector(":scope > g.badge-pill > rect")), order: box(g.querySelector(":scope > g.order-badge > rect")) }];
}))) as Promise<Record<string, { block: Box; pill?: Box; order?: Box }>>;
/** Expects a pill's left edge `BADGE_INSET` from its block's and its vertical middle on the block's top or bottom edge, to a unit. */
function expectPlace(id: string, block: Box, pill: Box, edge: "top" | "bottom") {
  expect(Math.abs(pill.x - (block.x + BADGE_INSET)), `${id} ${edge}`).toBeLessThanOrEqual(1);
  expect(Math.abs(pill.y + pill.height / 2 - (edge === "top" ? block.y : block.y + block.height)), `${id} ${edge}`).toBeLessThanOrEqual(1);
}

test("closed_loop: o shows the badges at the root and inside pid_controller, on the bottom edge at the left, the rate pill on the top edge, kept across a reload and a drop", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(badges(page)).toHaveCount(0);
  await expect(svg(page)).not.toHaveAttribute("data-order");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(toggle(page)).toHaveText("order");
  await expect(toggle(page)).toHaveAttribute("title", "Number every primitive with a stage 2 output by its position among the stage 2 calls");

  await press(page, "o");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  // the positions among the stage 2 rows; plant, with stage 1 outputs alone, carries none
  const texts = {
    sensing: "1", pid_controller: "2, 7, 9, 11", lqr_controller: "3–6, 8, 10, 12", selection: "13–14", actuators: "15–16",
  };
  for (const [id, text] of Object.entries(texts)) await expect(badge(page, id), id).toHaveText(text);
  await expect(badges(page)).toHaveCount(5);
  await expect(page.locator('g.order-badge[data-id="plant"]')).toHaveCount(0);
  await expect(page.locator("svg.canvas g.block.pin g.order-badge")).toHaveCount(0);
  await expect(page.locator('g.order-badge[data-id="pid_controller"] > title')).toHaveText("Stage 2 positions 2, 7, 9, 11 in the execution order: the primitives inside");
  // the badge straddles the block's bottom edge, its left edge by the block's
  for (const b of await boxes(page)) {
    expect(b.order.top, b.id).toBeLessThan(b.block.bottom);
    expect(b.order.bottom, b.id).toBeGreaterThan(b.block.bottom);
    expect(Math.abs(b.order.left - b.block.left), b.id).toBeLessThanOrEqual(6);
  }
  // the background fill and the text color, compared with the page's elements
  const bg = await page.locator(".viewport").evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await page.locator('g.order-badge[data-id="sensing"] > rect').evaluate((e) => getComputedStyle(e).fill)).toBe(bg);
  const segment = await page.locator('g.block[data-id="sensing"] text.segment').evaluate((e) => getComputedStyle(e).fill);
  expect(await badge(page, "sensing").evaluate((e) => getComputedStyle(e).fill)).toBe(segment);
  expect(await page.locator('g.order-badge[data-id="sensing"] > rect').evaluate((e) => getComputedStyle(e).stroke)).toBe(segment);
  // the badge takes the pointer for its title: its lower half, below the block, hits it
  const sensing = (await boxes(page)).find((b) => b.id === "sensing")!;
  const sensingBadge = page.locator('g.order-badge[data-id="sensing"]');
  expect(await sensingBadge.evaluate((e) => getComputedStyle(e).pointerEvents)).not.toBe("none");
  const x = (sensing.order.left + sensing.order.right) / 2;
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("g.order-badge")?.getAttribute("data-id"),
    [x, (sensing.order.bottom + sensing.block.bottom) / 2])).toBe("sensing");
  // a click on the badge's upper half, inside the block, selects the block
  await page.mouse.click(x, (sensing.block.bottom + sensing.order.top) / 2);
  await expect(page.locator("svg.canvas g.block.selected")).toHaveAttribute("data-id", "sensing");
  await page.keyboard.press("Escape");

  // in rate mode each assembly's rate pill straddles the top edge at the left and its order badge the bottom edge
  await press(page, "r");
  const withPills = (await boxes(page)).filter((b) => b.pill);
  expect(withPills.map((b) => b.id).sort()).toEqual(["actuators", "lqr_controller", "pid_controller", "selection", "sensing"]);
  for (const b of withPills) expect(overlaps(b.order, b.pill!), b.id).toBe(false);
  const on = await pills(page);
  await shot(page, "closed_loop", "", "order");
  expect(Object.keys(on).sort()).toEqual(withPills.map((b) => b.id).sort());
  for (const [id, { block, pill, order }] of Object.entries(on)) {
    expectPlace(id, block, pill!, "top");
    expectPlace(id, block, order!, "bottom");
  }
  // the rate pill's box the same with the badges off
  await press(page, "o");
  await expect(badges(page)).toHaveCount(0);
  const off = await pills(page);
  expect(Object.keys(off).sort()).toEqual(Object.keys(on).sort());
  for (const [id, { block, pill, order }] of Object.entries(off)) {
    expect([block, pill, order], id).toEqual([on[id].block, on[id].pill, undefined]);
  }
  await press(page, "o");
  await press(page, "r");

  await openPath(page, "pid_controller");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  await expect(badge(page, "pid_controller/h_ctl")).toHaveText("7");
  await expect(badge(page, "pid_controller/V_ctl")).toHaveText("2");
  await expect(page.locator('g.order-badge[data-id="pid_controller/free"]')).toHaveCount(0);
  await expect(page.locator("svg.canvas g.block.pin g.order-badge")).toHaveCount(0);
  await expect(page.locator('g.order-badge[data-id="pid_controller/h_ctl"] > title')).toHaveText("Stage 2 position 7 in the execution order");
  for (const [id, { block, order }] of Object.entries(await pills(page))) expectPlace(id, block, order!, "bottom");
  await shot(page, "closed_loop", "pid_controller", "order");

  await page.reload();
  await dropOver(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  // the hash keeps the level across the reload
  await expect(badge(page, "pid_controller/h_ctl")).toHaveText("7");

  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(svg(page)).not.toHaveAttribute("data-order");
  await expect(badges(page)).toHaveCount(0);
  await press(page, "o");
  await expect(badge(page, "pid_controller/V_ctl")).toHaveText("2");

  await dropOver(page, "closed_loop_deployment");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(badge(page, "pid_controller/h_ctl")).toHaveText("7");
});

test("primitive, rates and failure_cycle: the root's own leaf badged, the scopes' ranges, no badge without an order", async ({ page }) => {
  await drop(page, "primitive");
  await press(page, "o");
  await expect(badges(page)).toHaveCount(1);
  await expect(badge(page, "")).toHaveText("1");

  await dropOver(page, "rates");
  await expect(badge(page, "fast")).toHaveText("1–2");
  await expect(badge(page, "slow")).toHaveText("3");
  await expect(page.locator('g.order-badge[data-id="src"]')).toHaveCount(0);
  await openPath(page, "fast");
  await expect(badge(page, "fast/outer")).toHaveText("2");

  await dropOver(page, "failure_cycle");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(badges(page)).toHaveCount(0);
  await press(page, "o");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await press(page, "o");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(badges(page)).toHaveCount(0);
});

test("closed_loop: under a search the badge dims with its block, a hit's badge stays full", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "o");
  await press(page, "/");
  await page.locator("input.query").fill("actuators");
  await expect(page.locator('g.block.search-hit[data-id="actuators"]')).toHaveCount(1);
  await expect(svg(page)).toHaveClass(/searching/);
  const badgeOf = (id: string) => effectiveOpacity(page, `g.order-badge[data-id="${id}"]`);
  const shape = await effectiveOpacity(page, 'g.block[data-id="sensing"] > .shape');
  expect(shape).toBeLessThan(1);
  expect(await badgeOf("sensing")).toBeCloseTo(shape, 5);
  expect(await badgeOf("actuators")).toBe(1);
});

test("large: with o, no badge anywhere, every primitive having stage 1 outputs alone", async ({ page }) => {
  await drop(page, "large");
  await press(page, "o");
  await expect(svg(page)).toHaveAttribute("data-order", "");
  const nodes = JSON.parse(fixtureText("large")).build.structure.nodes as { path: string; class: string }[];
  const levels = nodes.filter((n) => n.class === "assembly").map((n) => n.path);
  expect(levels.length).toBeGreaterThan(1);
  for (const level of levels) {
    const at = level === "" ? "/" : `/#level=${encodeURIComponent(level).replace(/%2F/g, "/")}`;
    await drop(page, "large", undefined, at);
    await expect(svg(page)).toHaveAttribute("data-level", level);
    await expect(svg(page)).toHaveAttribute("data-order", "");
    await expect(page.locator("svg.canvas g.block:not(.pin)").first()).toBeAttached();
    await expect(badges(page), level || "/").toHaveCount(0);
  }
});
