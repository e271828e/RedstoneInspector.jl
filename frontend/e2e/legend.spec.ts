// The legend's line, its box and the fit around it (deployment_overlay.md answer 13, amending visual_grammar.md answer
// 6): a build's line is the swatch, `Δt · τ` and the anchor, a deployment's `D₀ · Φ₀`, `Δt` and the anchor, the anchor's
// key and scope, `Dₐ`, `Φₐ` and a deployment's `τ` in the line's tooltip; a deployment's lines by `D₀` and `Φ₀`, the
// palette's order the build's alone. The box stops at the viewport's height less its insets and scrolls inside. The fit
// leaves it clear, taking the larger of two candidates, its height free at the bottom or its width free at the left: a
// rule each check recomputes from the DOM. Lines from increment 10's oracle ("legend lines").
import { test, type Page } from "@playwright/test";
import { drop, expect, press, shot, viewBox } from "./fixtures";

const lines = (page: Page) => page.locator(".viewport .legend li");
/** Each line's step, its cells joined by a bar, and its tooltip. */
const read = (page: Page) => lines(page).evaluateAll((ls) => ls.map((l) => [
  (l as HTMLElement).dataset.step ?? "",
  [...l.querySelectorAll("button > span:not(.marks)")].map((e) => e.textContent).join(" | "), l.getAttribute("title"),
]));
/** The legend's inset from the viewport's edges. */
const INSET = 8;
/** The fit's padding, `FIT_PADDING` of `Canvas.svelte`, and its largest scale. */
const PADDING = 24;
const MAX_SCALE = 2;

test("library and library_deployment: a build's line Δt · τ and the anchor, a deployment's D₀ · Φ₀, Δt and the anchor by D₀ then Φ₀, the steps the build's, the key, scope, Dₐ, Φₐ and a deployment's τ in the tooltip (answer 13)", async ({ page }) => {
  await drop(page, "library");
  await press(page, "r");
  expect(await read(page)).toEqual([
    ["", "continuous", expect.stringMatching(/^No rate/)],
    ["0", "Δt_base | · τ 0 | A₀", "the base grid; Dₐ 1 · Φₐ 0"],
    ["1", "2·Δt_base | · τ 0 | A₀", "the base grid; Dₐ 2 · Φₐ 0"],
    ["2", "2·Δt_base | · τ Δt_base | A₀", "the base grid; Dₐ 2 · Φₐ 1"],
    ["3", "1/50 s | · τ 0 | A₂", "dss at the root; Dₐ 1 · Φₐ 0"],
    ["4", "1/10 s | · τ 0 | A₁", "noise at the root; Dₐ 1 · Φₐ 0"],
  ]);
  await shot(page, "library", "", "legend");
  // the mode is kept per browser, so the deployment opens in rate mode
  await drop(page, "library_deployment");
  expect(await read(page)).toEqual([
    ["", "continuous", expect.stringMatching(/^No rate/)],
    ["0", "D₀ 1 | · Φ₀ 0 | 1/100 s | A₀", "the base grid; Dₐ 1 · Φₐ 0 · τ 0"],
    ["1", "D₀ 2 | · Φ₀ 0 | 1/50 s | A₀", "the base grid; Dₐ 2 · Φₐ 0 · τ 0"],
    ["3", "D₀ 2 | · Φ₀ 0 | 1/50 s | A₂", "dss at the root; Dₐ 1 · Φₐ 0 · τ 0"],
    ["2", "D₀ 2 | · Φ₀ 1 | 1/50 s | A₀", "the base grid; Dₐ 2 · Φₐ 1 · τ 1/100 s"],
    ["4", "D₀ 10 | · Φ₀ 0 | 1/10 s | A₁", "noise at the root; Dₐ 1 · Φₐ 0 · τ 0"],
  ]);
  await shot(page, "library_deployment", "", "legend");
});

test("timing_deployment: no word of the line names a quantity, the pair's, Δt's and the anchor's columns aligned across the lines", async ({ page }) => {
  await drop(page, "timing_deployment");
  await press(page, "r");
  expect((await read(page)).map((l) => l[1])).toEqual([
    "continuous", "D₀ 6 | · Φ₀ 0 | 1/50 s | A₂", "D₀ 12 | · Φ₀ 6 | 1/25 s | A₂", "D₀ 24 | · Φ₀ 18 | 2/25 s | A₂",
    "D₀ 30 | · Φ₀ 1 | 1/10 s | A₁", "D₀ 36 | · Φ₀ 18 | 3/25 s | A₂",
  ]);
  for (const cell of [".period", ".phase", ".dt", ".anchor"]) {
    const lefts = await page.locator(`.viewport .legend ${cell}`).evaluateAll((es) => es.map((e) => e.getBoundingClientRect().left));
    expect(lefts, cell).toHaveLength(5);
    expect(Math.max(...lefts) - Math.min(...lefts), cell).toBeLessThan(0.5);
  }
  // a line's cells stand on one row
  const heights = await lines(page).evaluateAll((ls) => ls.map((l) => l.getBoundingClientRect().height));
  expect(new Set(heights).size, `heights ${heights}`).toBe(1);
  for (const t of await lines(page).evaluateAll((ls) => ls.map((l) => `${l.textContent} ${l.getAttribute("title")}`))) {
    expect(t).not.toMatch(/\b(phase|offset|multiple|anchor|base grid ×)\b/);
  }
  await shot(page, "timing_deployment", "", "legend");
});

/** The legend's box against the viewport's, and how far it can scroll. */
const box = (page: Page) => page.evaluate(() => {
  const vp = document.querySelector(".viewport")!.getBoundingClientRect(), el = document.querySelector<HTMLElement>(".viewport .legend")!;
  const r = el.getBoundingClientRect();
  return { top: r.top - vp.top, bottom: vp.bottom - r.bottom, over: el.scrollHeight - el.clientHeight, side: el.scrollWidth - el.clientWidth, at: el.scrollTop };
});

test("large at 1100 by 700: the legend stops at the viewport's height less its insets, a wheel over it scrolls it and zooms nothing, and the fit leaves its box free at the left (answer 13)", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await drop(page, "large");
  await press(page, "r");
  const b = await box(page);
  expect([b.top, b.bottom]).toEqual([INSET, INSET]);
  expect(b.over).toBeGreaterThan(0);
  expect(b.side).toBe(0);
  await press(page, "0");
  expect(await expectFit(page)).toBe("left");
  const view = await viewBox(page);
  await lines(page).nth(3).hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(async () => (await box(page)).at).toBeGreaterThan(0);
  expect(await viewBox(page)).toEqual(view);
  await shot(page, "large", "", "legend-scrolled");
});

test("library_deployment in a low window: a chart swatch's press scrolls its line into the legend's view (answer 13)", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 330 });
  await drop(page, "library_deployment");
  await press(page, "r");
  await page.locator('section.drawer button.tab[data-tab="timing"]').click();
  // the canvas is lower than the six lines now
  await expect.poll(async () => (await box(page)).over).toBeGreaterThan(0);
  const last = lines(page).last().locator("button.line");
  const inView = () => last.evaluate((e) => {
    const r = e.getBoundingClientRect(), l = e.closest(".legend")!.getBoundingClientRect();
    return r.top >= l.top && r.bottom <= l.bottom;
  });
  expect(await inView()).toBe(false);
  const swatch = page.locator('section.drawer button.swatch[data-step="4"]');
  // the chart's row states the pair, so the swatch's tooltip names the triple
  await expect(swatch).toHaveAttribute("title", "A₁ (noise) · Dₐ 1 · Φₐ 0 · Δt 1/10 s; focus this rate on the canvas");
  // dispatched, so no pointer moves and nothing else scrolls
  await swatch.dispatchEvent("click");
  await expect(last).toHaveAttribute("aria-pressed", "true");
  expect(await inView()).toBe(true);
});

/**
 * The fit's rule read off the DOM: the drawing, every block's outline and region frame, lies inside one candidate's
 * region with the padding, and at the drawn scale overflows the other's, so the other candidate's scale is smaller;
 * the max scale stands in for a level that fits both. Returns which candidate holds the drawing.
 */
async function expectFit(page: Page): Promise<"bottom" | "left"> {
  const m = await page.evaluate(() => {
    const vp = document.querySelector<HTMLElement>(".viewport")!.getBoundingClientRect();
    const lg = document.querySelector<HTMLElement>(".viewport .legend")!.getBoundingClientRect();
    const svg = document.querySelector<SVGSVGElement>("svg.canvas")!;
    const shapes = [...document.querySelectorAll("svg.canvas g.block .shape, svg.canvas g.region rect.shape")].map((e) => e.getBoundingClientRect());
    return {
      W: vp.width, H: vp.height, bw: lg.right - vp.left, bh: vp.bottom - lg.top, scale: svg.clientWidth / svg.viewBox.baseVal.width,
      left: Math.min(...shapes.map((r) => r.left)) - vp.left, right: Math.max(...shapes.map((r) => r.right)) - vp.left,
      top: Math.min(...shapes.map((r) => r.top)) - vp.top, bottom: Math.max(...shapes.map((r) => r.bottom)) - vp.top,
    };
  });
  const e = 0.5;
  const inside = (x0: number, y1: number) =>
    m.left >= x0 + PADDING - e && m.right <= m.W - PADDING + e && m.top >= PADDING - e && m.bottom <= y1 - PADDING + e;
  const bottom = inside(0, m.H - m.bh), left = inside(m.bw, m.H);
  // the drawing clears the legend's box
  expect(bottom || left).toBe(true);
  if (m.scale < MAX_SCALE - 1e-6) expect(bottom && left).toBe(false);
  return bottom ? "bottom" : "left";
}

test("large in rate mode: the fit leaves the legend's tall box free at the left, the drawing right of it and too tall for the bottom's room", async ({ page }) => {
  await drop(page, "large");
  await press(page, "r");
  await press(page, "0");
  expect(await expectFit(page)).toBe("left");
  await shot(page, "large", "", "legend-fit");
});

test("library_deployment in rate mode: the fit leaves the legend's wide box free at the bottom, the drawing above it and too wide for the left's room", async ({ page }) => {
  await drop(page, "library_deployment");
  await press(page, "r");
  await press(page, "0");
  expect(await expectFit(page)).toBe("bottom");
  await shot(page, "library_deployment", "", "legend-fit");
});

test("large dropped in rate mode: the first fit already leaves the legend's box free, the same view as 0's", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, mode: "rate" })));
  await drop(page, "large");
  expect(await expectFit(page)).toBe("left");
  const vb = () => page.evaluate(() => {
    const v = document.querySelector<SVGSVGElement>("svg.canvas")!.viewBox.baseVal;
    return [v.x, v.y, v.width, v.height];
  });
  const first = await vb();
  await press(page, "0");
  const refit = await vb();
  for (const [i, x] of first.entries()) expect(Math.abs(refit[i] - x)).toBeLessThan(0.5);
});
