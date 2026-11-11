// The color modes (visual_grammar.md answer 6, workspace.md answers 1, 7, 9 and
// 11): tier by default, `r` and the breadcrumb's switch to rate mode, the steps
// in the model's palette order, the badges, the legend, the tree's dots, the
// mode kept per browser. Every count is the oracle's (`grammar.py`), the continuous
// line's the look fixer's (`continuous.py`); those the assembly rule of 2026-11-02
// changed, and the legend's order, read by hand off the fixtures' timings.
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, openPath, press, shot, status } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const block = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`);
const shape = (page: Page, id: string) => block(page, id).locator(".shape");
const badge = (page: Page, id: string) => block(page, id).locator("text.badge");
const badgeTitle = (page: Page, id: string) => block(page, id).locator("g.badge-pill > title");
/** The computed fill and stroke of a block's shape. */
const look = (page: Page, id: string) => shape(page, id).evaluate((e) => [getComputedStyle(e).fill, getComputedStyle(e).stroke]);
const legendLines = (page: Page) => page.locator(".viewport .legend li");
/** The canvas's pill constants, read back by the check: the inset from a block's edge, the gap between pills, a pill's side padding. */
const BADGE_INSET = 4, BADGE_GAP = 2, BADGE_PAD = 4;
/**
 * The rule recomputed from the DOM for each block named with its rate pill's text: the pill's width measured in the
 * badges' font, the overlay's pills drawn on the block, and whether the rate pill is drawn. The two meet when the
 * rate pill, the overlay's pills, the gaps and both insets exceed the block's width.
 */
const pillRule = (page: Page, texts: Record<string, string>) => page.evaluate(({ texts, INSET, GAP, PAD }) => {
  const ctx = document.createElement("canvas").getContext("2d")!;
  const font = document.querySelector<SVGTextElement>("svg.canvas text.badge-text, svg.canvas text.badge, svg.canvas text.order")!.style.font;
  return Object.fromEntries(Object.entries(texts).map(([id, text]) => {
    const g = document.querySelector(`svg.canvas g.block[data-id="${CSS.escape(id)}"]`)!;
    const width = (g.querySelector(":scope > .shape") as SVGGraphicsElement).getBBox().width;
    ctx.font = font;
    const rate = Math.ceil(ctx.measureText(text).width) + 2 * PAD;
    const drawn = g.querySelector(":scope > g.badge-pill > rect");
    const overlay = [...document.querySelectorAll(`svg.canvas g.overlay g.badge[data-id="${CSS.escape(id)}"] > rect`)].map((r) => Number(r.getAttribute("width")));
    const meets = overlay.length > 0 && rate + overlay.reduce((a, w) => a + w, 0) + overlay.length * GAP + 2 * INSET > width;
    return [id, { drawn: !!drawn, drawnWidth: drawn ? Number(drawn.getAttribute("width")) : undefined, rate, overlay: overlay.length, meets }];
  }));
}, { texts, INSET: BADGE_INSET, GAP: BADGE_GAP, PAD: BADGE_PAD });
/** Expects each block's rate pill drawn exactly when it does not meet an overlay pill, at the measured width. */
async function expectRule(page: Page, texts: Record<string, string>, meets: Record<string, boolean>) {
  const rule = await pillRule(page, texts);
  for (const [id, r] of Object.entries(rule)) {
    expect(r.meets, id).toBe(meets[id]);
    expect(r.drawn, id).toBe(!r.meets);
    if (r.drawn) expect(r.drawnWidth, id).toBe(r.rate);
  }
}
const modeButton = (page: Page, mode: string) => page.locator(`nav.breadcrumb .controls .mode button[data-mode="${mode}"]`);
const wireStroke = (page: Page, id: string) => page.locator(`path.wire[data-wire="${id}"]`).evaluate((w) => getComputedStyle(w).stroke);
/** The fill of the arrowhead a wire's line ends in: its own marker, or its core's for a struct. */
const arrowFill = (page: Page, id: string) => page.evaluate((id) => {
  const end = [...document.querySelectorAll(`[data-wire="${CSS.escape(id)}"]`)].map((p) => p.getAttribute("marker-end")).find(Boolean)!;
  return getComputedStyle(document.querySelector(`${end.slice(4, -1)} path`)!).fill;
}, id);

test("closed_loop: tier at load, r to rate mode with two assemblies on their leaves' triple and three gray, the badges and the legend", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  await expect(status(page).locator(".mode")).toHaveText("tier colors");
  await expect(status(page).locator(".mode")).toHaveAttribute("data-mode", "tier");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "true");
  await expect(modeButton(page, "rate")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".legend")).toHaveCount(0);
  await expect(page.locator("svg.canvas .shape[data-step]")).toHaveCount(0);
  await expect(page.locator("text.badge")).toHaveCount(0);
  const mixed = ["pid_controller", "selection", "actuators"];
  const tierLook = await look(page, "pid_controller");

  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await expect(status(page).locator(".mode")).toHaveText("rate colors");
  await expect(modeButton(page, "rate")).toHaveAttribute("aria-pressed", "true");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("g.block.assembly .shape")).toHaveCount(5);
  // an assembly whose discrete leaves share one triple takes its step: sensing's noise anchor 1, lqr's tracker 6
  await expect(shape(page, "sensing")).toHaveAttribute("data-step", "0");
  await expect(shape(page, "lqr_controller")).toHaveAttribute("data-step", "5");
  // one whose leaves tick on several is the assembly gray, tier mode's, not the continuous color
  for (const id of mixed) {
    await expect(shape(page, id), id).not.toHaveAttribute("data-step");
    expect(await look(page, id), id).toEqual(tierLook);
  }
  expect(await look(page, "plant")).not.toEqual(tierLook);
  // the clock count on every assembly with a discrete leaf beneath, its title telling one clock from several
  const clocks = { sensing: "1 clock", pid_controller: "4 clocks", lqr_controller: "1 clock", selection: "2 clocks", actuators: "2 clocks" };
  for (const [id, text] of Object.entries(clocks)) await expect(badge(page, id), id).toHaveText(text);
  await expect(page.locator("text.badge")).toHaveCount(5);
  await expect(badgeTitle(page, "sensing")).toHaveText("Every discrete primitive inside ticks on this one clock.");
  await expect(badgeTitle(page, "pid_controller")).toHaveText(/^Multi-rate: .*4 clocks/);
  await expect(shape(page, "plant")).not.toHaveAttribute("data-step");
  await expect(badge(page, "plant")).toHaveCount(0);
  // first the continuous line, unnumbered, in plant's colors; then the two colored assemblies' steps and those the
  // wires carry, in palette order, none an extra
  await expect(legendLines(page)).toHaveCount(7);
  const first = legendLines(page).first();
  await expect(first).toHaveClass(/\bcontinuous\b/);
  await expect(first).not.toHaveAttribute("data-step");
  await expect(first.locator(".text")).toHaveText("continuous");
  await expect(page.locator(".legend li.continuous")).toHaveCount(1);
  const swatch = await first.locator(".swatch").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor]);
  expect(swatch).toEqual(await look(page, "plant"));
  for (const [i, a] of [1, 4, 5, 6, 7, 8].entries()) {
    await expect(legendLines(page).nth(i + 1)).toHaveAttribute("data-step", String(a - 1));
    await expect(legendLines(page).nth(i + 1).locator(".text")).toHaveText(`anchor ${a} (1/50 s)`);
  }
  await expect(page.locator(".legend li .number")).toHaveCount(0);
  // the tree's dot follows the canvas: a colored assembly's stroke, a mixed one's gray
  for (const id of ["sensing", "pid_controller"]) {
    const dot = await page.locator(`nav.tree .row[data-path="${id}"] .dot`).evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(dot, id).toBe((await look(page, id))[1]);
  }
  await shot(page, "closed_loop", "", "colors");
});

test("closed_loop: pid_controller's four steps and seven lines, actuators' extras and wires in their producers' fills, the tree's dot, the mode kept across a reload", async ({ page }) => {
  await drop(page, "closed_loop");
  const gray = await wireStroke(page, "sensing|in|h");
  await press(page, "r");
  // a root input's wires stay gray in rate mode
  for (const id of ["pid_controller|in|V_ref", "lqr_controller|in|V_ref"]) expect(await wireStroke(page, id), id).toBe(gray);
  await openPath(page, "pid_controller");
  const controllers = ["h_ctl", "θ_ctl", "q_ctl", "V_ctl"].map((c) => `pid_controller/${c}`);
  const fills = new Set<string | null>();
  for (const [i, id] of controllers.entries()) {
    await expect(shape(page, id), id).toHaveAttribute("data-step", String(i + 1));
    fills.add(await shape(page, id).getAttribute("fill"));
  }
  expect(fills.size).toBe(4);
  await expect(legendLines(page)).toHaveCount(7);
  await expect(legendLines(page).first().locator(".text")).toHaveText("continuous");
  for (const [i, a] of [2, 3, 4, 5, 7, 8].entries()) {
    await expect(legendLines(page).nth(i + 1)).toHaveAttribute("data-step", String(a - 1));
    await expect(legendLines(page).nth(i + 1).locator(".text")).toHaveText(`anchor ${a} (1/50 s)`);
  }
  // the tree's dot follows the mode
  const colorsOf = (id: string) => page.evaluate((id) => ({
    dot: getComputedStyle(document.querySelector(`nav.tree .row[data-path="${id}"] .dot`)!).backgroundColor,
    stroke: getComputedStyle(document.querySelector(`g.block[data-id="${id}"] .shape`)!).stroke,
  }), id);
  const h = await colorsOf("pid_controller/h_ctl");
  expect(h.dot).toBe(h.stroke);
  await shot(page, "closed_loop", "pid_controller", "colors");
  // an icon's color never follows the mode
  const iconColor = () => page.locator("g.icon").first().evaluate((e) => getComputedStyle(e).color);
  const inRate = await iconColor();
  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  expect(await iconColor()).toBe(inRate);
  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");

  await page.locator('nav.breadcrumb a[data-path=""]').click();
  await openPath(page, "actuators");
  for (const [id, n] of [["actuators/δe_limiter", "#9"], ["actuators/δt_limiter", "#10"]]) {
    await expect(block(page, id)).toHaveClass(/\bextra\b/);
    await expect(badge(page, id)).toHaveText(n);
  }
  await expect(page.locator(".legend li .number")).toHaveText(["#9", "#10"]);
  // the first four extras take their own colors (answer 6 as amended): the two limiters' fills differ from each
  // other, from the lags' and from the shared neutral the number pills keep; each legend swatch matches its block
  const lookAt = (sel: string) => page.locator(sel).first().evaluate((e) => {
    const c = getComputedStyle(e);
    return e instanceof SVGElement ? [c.fill, c.stroke] : [c.backgroundColor, c.borderTopColor];
  });
  const shared = (await lookAt(".legend li .number"))[0];
  const limiters = [await look(page, "actuators/δe_limiter"), await look(page, "actuators/δt_limiter")];
  const lag = await look(page, "actuators/δe_lag");
  expect(limiters[0][0]).not.toBe(limiters[1][0]);
  for (const [fill] of limiters) expect([shared, lag[0]]).not.toContain(fill);
  for (const [i, n] of ["9", "10"].entries()) {
    const li = `.legend li[data-step="${Number(n) - 1}"]`;
    await expect(page.locator(`${li} .number`)).toHaveText(`#${n}`);
    expect(await lookAt(`${li} .swatch`), `#${n}`).toEqual(limiters[i]);
  }
  for (const id of ["actuators/δe_lag", "actuators/δt_lag"]) await expect(shape(page, id)).not.toHaveAttribute("data-step");
  // a wire takes its producer's fill, each limiter's its own; a continuous producer's wires one color of their own,
  // neither the lag's fill nor the gray, and the same out of either lag
  for (const [i, id] of ["actuators/δe_lag|in|u", "actuators/δt_lag|in|u"].entries()) expect(await wireStroke(page, id), id).toBe(limiters[i][0]);
  const fromLag = await wireStroke(page, "⟨out⟩δe|in|δe");
  expect(await wireStroke(page, "⟨out⟩δt|in|δt")).toBe(fromLag);
  expect([lag[0], lag[1], gray, ...limiters.flat()]).not.toContain(fromLag);
  for (const id of ["actuators/δe_lag|in|u", "⟨out⟩δe|in|δe"]) expect(await arrowFill(page, id), id).toBe(await wireStroke(page, id));

  await page.reload();
  await dropOver(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await modeButton(page, "tier").click();
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".legend")).toHaveCount(0);
});

test("rates: fast gray with two clocks whatever its scope row, slow on its leaf's triple with one, the legend's lines at the root and in fast", async ({ page }) => {
  await drop(page, "rates");
  const tierLook = await look(page, "fast");
  await modeButton(page, "rate").click();
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  // fast's scope row names anchor 1 and its leaves tick on two clocks: gray; slow's leaf ticks on anchor 2: step 2
  await expect(shape(page, "fast")).not.toHaveAttribute("data-step");
  expect(await look(page, "fast")).toEqual(tierLook);
  await expect(shape(page, "slow")).toHaveAttribute("data-step", "2");
  await expect(badge(page, "fast")).toHaveText("2 clocks");
  await expect(badge(page, "slow")).toHaveText("1 clock");
  await expect(badgeTitle(page, "slow")).toHaveText("Every discrete primitive inside ticks on this one clock.");
  await expect(badgeTitle(page, "fast")).toHaveText(/^Multi-rate: .*2 clocks/);
  await expect(legendLines(page).locator(".text")).toHaveText(["continuous", "anchor 1 (1/50 s)", "anchor 1 (1/50 s) × 2", "anchor 2 (1/10 s)"]);
  await openPath(page, "fast");
  const inner = await shape(page, "fast/inner").getAttribute("data-step");
  const outer = await shape(page, "fast/outer").getAttribute("data-step");
  expect([inner, outer]).toEqual(["0", "1"]);
  // no continuous block on fast: its line comes from the wires out of src
  await expect(page.locator("g.block:not(.pin) .shape:not([data-step])")).toHaveCount(0);
  await expect(legendLines(page).locator(".text")).toHaveText(["continuous", "anchor 1 (1/50 s)", "anchor 1 (1/50 s) × 2"]);
});

test("the rate pill yields where it meets the overlay's pills: failure_nested's ctl under its loop pill, rates' fast and slow under a route and back after it, closed_loop's two controllers keeping both", async ({ page }) => {
  // failure_nested: ctl, 60 wide, carries "1 clock" and the loop's pill; the two meet
  await drop(page, "failure_nested");
  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await expect(page.locator('g.overlay g.badge[data-id="ctl"][data-role="continues"]')).toHaveCount(1);
  await expectRule(page, { ctl: "1 clock" }, { ctl: true });

  // rates: both pills drawn with no overlay, gone while the route from src enters fast and slow, back once it is cleared
  await dropOver(page, "rates");
  const clocks = { fast: "2 clocks", slow: "1 clock" };
  for (const [id, text] of Object.entries(clocks)) await expect(badge(page, id), id).toHaveText(text);
  await expectRule(page, clocks, { fast: false, slow: false });
  await page.locator('rect.port[data-port="src|out|out"]').click();
  await press(page, "t");
  await expect(page.locator('g.overlay g.badge[data-role="route"]')).toHaveCount(2);
  await expectRule(page, clocks, { fast: true, slow: true });
  await press(page, "Escape");
  await expect(page.locator('g.overlay g.badge[data-role="route"]')).toHaveCount(0);
  await expectRule(page, clocks, { fast: false, slow: false });

  // closed_loop: the route from h_ref enters both controllers, wide enough for both pills
  await dropOver(page, "closed_loop");
  await block(page, "⟨in⟩h_ref").click();
  await press(page, "t");
  await expect(page.locator('g.overlay g.badge[data-role="route"]')).toHaveCount(2);
  await expectRule(page, { pid_controller: "4 clocks", lqr_controller: "1 clock" }, { pid_controller: false, lqr_controller: false });
});
