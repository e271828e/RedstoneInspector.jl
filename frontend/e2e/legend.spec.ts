// The legend's short line and the fit around it (deployment_overlay.md answer 13, amending visual_grammar.md answer
// 6): a line is the swatch, `Aₖ (key) · m · c` and the `Δt`, a deployment changing only the `A₀` lines' `Δt` from
// symbolic to concrete, `D`, `Φ` and `τ` in the line's tooltip; the palette's order the build's alone. The fit leaves
// the legend's box clear, taking the larger of two candidates, the box's height free at the bottom or its width free
// at the left: a rule each check recomputes from the DOM. Lines from increment 10's oracle ("legend lines").
import { test, type Page } from "@playwright/test";
import { drop, expect, press, shot } from "./fixtures";

const lines = (page: Page) => page.locator(".viewport .legend li");
/** Each line's step, text, `Δt` and tooltip. */
const read = (page: Page) => lines(page).evaluateAll((ls) => ls.map((l) => [
  (l as HTMLElement).dataset.step ?? "", l.querySelector(".text")!.textContent, l.querySelector(".dt")!.textContent, l.getAttribute("title"),
]));
/** The fit's padding, `FIT_PADDING` of `Canvas.svelte`, and its largest scale. */
const PADDING = 24;
const MAX_SCALE = 2;

test("library and library_deployment: the short line, the A₀ lines' Δt symbolic then concrete and nothing else changed, D Φ τ in the tooltip, the steps the build's", async ({ page }) => {
  await drop(page, "library");
  await press(page, "r");
  const build = await read(page);
  expect(build).toEqual([
    ["", "continuous", "", expect.stringMatching(/^No rate/)],
    ["0", "A₀ (base) · m 1 · c 0", "Δt_base", "τ 0; the base grid"],
    ["1", "A₀ (base) · m 2 · c 0", "2·Δt_base", "τ 0; the base grid"],
    ["2", "A₀ (base) · m 2 · c 1", "2·Δt_base", "τ Δt_base; the base grid"],
    ["3", "A₂ (dss) · m 1 · c 0", "1/50 s", "τ 0; dss at the root"],
    ["4", "A₁ (noise) · m 1 · c 0", "1/10 s", "τ 0; noise at the root"],
  ]);
  await shot(page, "library", "", "legend");
  // the mode is kept per browser, so the deployment opens in rate mode
  await drop(page, "library_deployment");
  const deployed = await read(page);
  expect(deployed.map((l) => [l[0], l[2], l[3]])).toEqual([
    ["", "", expect.stringMatching(/^No rate/)],
    ["0", "1/100 s", "D 1 · Φ 0 · τ 0; the base grid"],
    ["1", "1/50 s", "D 2 · Φ 0 · τ 0; the base grid"],
    ["2", "1/50 s", "D 2 · Φ 1 · τ 1/100 s; the base grid"],
    ["3", "1/50 s", "D 2 · Φ 0 · τ 0; dss at the root"],
    ["4", "1/10 s", "D 10 · Φ 0 · τ 0; noise at the root"],
  ]);
  // the deployment keeps the build's steps and texts; only an A₀ line's Δt moves
  for (const [i, b] of build.entries()) {
    expect(deployed[i].slice(0, 2), b[1]!).toEqual(b.slice(0, 2));
    if (!b[1]!.startsWith("A₀")) expect(deployed[i][2], b[1]!).toBe(b[2]);
  }
  await shot(page, "library_deployment", "", "legend");
});

test("timing_deployment: no word of the line names a quantity, the Δt column aligned across the lines", async ({ page }) => {
  await drop(page, "timing_deployment");
  await press(page, "r");
  expect((await read(page)).map((l) => [l[1], l[2]])).toEqual([
    ["continuous", ""], ["A₂ (fast) · m 1 · c 0", "1/50 s"], ["A₂ (fast) · m 2 · c 1", "1/25 s"], ["A₂ (fast) · m 4 · c 3", "2/25 s"],
    ["A₁ (staggered) · m 1 · c 0", "1/10 s"], ["A₂ (fast) · m 6 · c 3", "3/25 s"],
  ]);
  const lefts = await lines(page).evaluateAll((ls) => ls.map((l) => l.querySelector(".dt")!.getBoundingClientRect().left));
  expect(Math.max(...lefts) - Math.min(...lefts)).toBeLessThan(0.5);
  for (const t of await lines(page).evaluateAll((ls) => ls.map((l) => `${l.textContent} ${l.getAttribute("title")}`))) {
    expect(t).not.toMatch(/\b(phase|offset|multiple|anchor|base grid ×)\b/);
  }
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
