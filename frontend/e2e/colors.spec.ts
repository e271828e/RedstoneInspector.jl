// The color modes (visual_grammar.md answer 6, workspace.md answers 1, 7, 9 and
// 11): tier by default, `r` and the breadcrumb's switch to rate mode, the steps
// in the model's palette order, the badges, the legend, the tree's dots, the
// mode kept per browser. Every count is the oracle's (`grammar.py`).
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, openPath, press, shot, status } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const block = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`);
const shape = (page: Page, id: string) => block(page, id).locator(".shape");
const badge = (page: Page, id: string) => block(page, id).locator("text.badge");
const legendLines = (page: Page) => page.locator(".viewport .legend li");
const modeButton = (page: Page, mode: string) => page.locator(`nav.breadcrumb .controls .mode button[data-mode="${mode}"]`);
const wireStroke = (page: Page, id: string) => page.locator(`path.wire[data-wire="${id}"]`).evaluate((w) => getComputedStyle(w).stroke);
/** The fill of the arrowhead a wire's line ends in: its own marker, or its core's for a struct. */
const arrowFill = (page: Page, id: string) => page.evaluate((id) => {
  const end = [...document.querySelectorAll(`[data-wire="${CSS.escape(id)}"]`)].map((p) => p.getAttribute("marker-end")).find(Boolean)!;
  return getComputedStyle(document.querySelector(`${end.slice(4, -1)} path`)!).fill;
}, id);

test("closed_loop: tier at load, r to rate mode with the base grid on every assembly, the badges and the legend", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  await expect(status(page).locator(".mode")).toHaveText("tier colors");
  await expect(status(page).locator(".mode")).toHaveAttribute("data-mode", "tier");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "true");
  await expect(modeButton(page, "rate")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".legend")).toHaveCount(0);
  await expect(page.locator("svg.canvas .shape[data-step]")).toHaveCount(0);
  await expect(page.locator("text.badge")).toHaveCount(0);

  await press(page, "r");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await expect(status(page).locator(".mode")).toHaveText("rate colors");
  await expect(modeButton(page, "rate")).toHaveAttribute("aria-pressed", "true");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "false");
  const assemblies = page.locator("g.block.assembly .shape");
  await expect(assemblies).toHaveCount(5);
  for (const s of await assemblies.all()) await expect(s).toHaveAttribute("data-step", "0");
  // the oracle's clock counts: each assembly's leaves tick off the base grid
  const clocks = { sensing: "1 clock", pid_controller: "4 clocks", lqr_controller: "1 clock", selection: "2 clocks", actuators: "2 clocks" };
  for (const [id, text] of Object.entries(clocks)) await expect(badge(page, id), id).toHaveText(text);
  await expect(page.locator("text.badge")).toHaveCount(5);
  await expect(shape(page, "plant")).not.toHaveAttribute("data-step");
  await expect(badge(page, "plant")).toHaveCount(0);
  await expect(legendLines(page)).toHaveCount(1);
  await expect(page.locator('.legend li[data-step="0"]')).toHaveText("base grid");
  await shot(page, "closed_loop", "", "colors");
});

test("closed_loop: pid_controller's four steps and lines, actuators' extras and wires, the tree's dot, the mode kept across a reload", async ({ page }) => {
  await drop(page, "closed_loop");
  const gray = await wireStroke(page, "sensing|in|h");
  await press(page, "r");
  // a root input's wires stay gray in rate mode
  for (const id of ["pid_controller|in|V_ref", "lqr_controller|in|V_ref"]) expect(await wireStroke(page, id), id).toBe(gray);
  await openPath(page, "pid_controller");
  const controllers = ["h_ctl", "θ_ctl", "q_ctl", "V_ctl"].map((c) => `pid_controller/${c}`);
  const fills = new Set<string | null>();
  for (const [i, id] of controllers.entries()) {
    await expect(shape(page, id), id).toHaveAttribute("data-step", String(i + 2));
    fills.add(await shape(page, id).getAttribute("fill"));
  }
  expect(fills.size).toBe(4);
  await expect(legendLines(page)).toHaveCount(4);
  for (const [i, a] of [2, 3, 4, 5].entries()) {
    await expect(legendLines(page).nth(i)).toHaveAttribute("data-step", String(a));
    await expect(legendLines(page).nth(i).locator(".text")).toHaveText(`anchor ${a} (1/50 s)`);
  }
  // the tree's dot follows the mode
  const colorsOf = (id: string) => page.evaluate((id) => ({
    dot: getComputedStyle(document.querySelector(`nav.tree .row[data-path="${id}"] .dot`)!).backgroundColor,
    stroke: getComputedStyle(document.querySelector(`g.block[data-id="${id}"] .shape`)!).stroke,
  }), id);
  const h = await colorsOf("pid_controller/h_ctl");
  expect(h.dot).toBe(h.stroke);
  await shot(page, "closed_loop", "pid_controller", "colors");

  await page.locator('nav.breadcrumb a[data-path=""]').click();
  await openPath(page, "actuators");
  for (const [id, n] of [["actuators/δe_limiter", "#10"], ["actuators/δt_limiter", "#11"]]) {
    await expect(block(page, id)).toHaveClass(/\bextra\b/);
    await expect(badge(page, id)).toHaveText(n);
  }
  await expect(page.locator(".legend li .number")).toHaveText(["#10", "#11"]);
  // the extras share the neutral fill, never a palette step's again
  const extraFill = await shape(page, "actuators/δe_limiter").getAttribute("fill");
  await expect(shape(page, "actuators/δt_limiter")).toHaveAttribute("fill", extraFill!);
  expect(extraFill).not.toBe(await shape(page, "actuators/δe_lag").getAttribute("fill"));
  for (const id of ["actuators/δe_lag", "actuators/δt_lag"]) await expect(shape(page, id)).not.toHaveAttribute("data-step");
  // the wires take their producer's tint, the extra's out of the limiter, the continuous one out of the lag
  const fromLimiter = await wireStroke(page, "actuators/δe_lag|in|u"), fromLag = await wireStroke(page, "⟨out⟩δe|in|δe");
  expect(fromLimiter).not.toBe(fromLag);
  expect([fromLimiter, fromLag]).not.toContain(gray);
  expect(fromLimiter).not.toBe(await shape(page, "actuators/δe_limiter").evaluate((r) => getComputedStyle(r).stroke));
  for (const id of ["actuators/δe_lag|in|u", "⟨out⟩δe|in|δe"]) expect(await arrowFill(page, id), id).toBe(await wireStroke(page, id));

  await page.reload();
  await dropOver(page, "closed_loop");
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await modeButton(page, "tier").click();
  await expect(svg(page)).toHaveAttribute("data-mode", "tier");
  await expect(modeButton(page, "tier")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".legend")).toHaveCount(0);
});

test("rates: fast badged with two clocks, slow not, the legend's lines at the root and in fast", async ({ page }) => {
  await drop(page, "rates");
  await modeButton(page, "rate").click();
  await expect(svg(page)).toHaveAttribute("data-mode", "rate");
  await expect(badge(page, "fast")).toHaveText("2 clocks");
  await expect(badge(page, "slow")).toHaveCount(0);
  await expect(legendLines(page).locator(".text")).toHaveText(["anchor 1 (1/50 s)", "anchor 2 (1/10 s)"]);
  await openPath(page, "fast");
  const inner = await shape(page, "fast/inner").getAttribute("data-step");
  const outer = await shape(page, "fast/outer").getAttribute("data-step");
  expect([inner, outer]).toEqual(["0", "1"]);
  await expect(legendLines(page).nth(1).locator(".text")).toHaveText("anchor 1 (1/50 s) × 2");
});
