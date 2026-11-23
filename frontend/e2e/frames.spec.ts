// The pane's frames table (deployment_overlay.md answer 10, amending workspace.md answer 4 and visual_grammar.md
// answer 6): a discrete primitive's rate fact is one table, a row per frame of answer 3 with the period and phase
// columns and no sentence, a build's without the base grid row; the scope row derived against the nearest enclosing
// rate scope, the root's in base ticks, a component opening its own anchor naming where; the chain line under it,
// none on an empty chain; the open level's rate scopes in the same table with no chain line. Figures from increment
// 10's oracle (`oracle/<fixture>.txt`, "frames tables").
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, shot } from "./fixtures";

const pane = (page: Page) => page.locator("aside.detail");
const rate = (page: Page) => pane(page).locator('dl.facts dd[data-fact="rate"]');
/** The rate fact's rows as `[frame, rest]`, the rest the row's cells but the head joined by one space. */
const frames = (scope: ReturnType<typeof rate>) => scope.locator("table.frames tbody tr").evaluateAll((trs) => trs.map((tr) => [
  (tr as HTMLElement).dataset.frame!, [...tr.children].map((c) => c.textContent!.replace(/\s+/g, " ").trim()).filter((t) => t).join(" | "),
]));
async function selectBlock(page: Page, id: string) {
  await page.locator(`g.block[data-id="${id}"]`).click();
  await expect(pane(page)).toHaveAttribute("data-id", id);
}

test("timing_deployment's fast/outer/hold: the rate fact is answer 10's table, the period and phase heads, four frames with their titles, no sentence, and the chain under it", async ({ page }) => {
  await drop(page, "timing_deployment");
  await openPath(page, "fast/outer");
  await selectBlock(page, "fast/outer/hold");
  expect(await frames(rate(page))).toEqual([
    ["scope", "scope fast/outer | K = 3 | φ = 1 | ticks of fast/outer"],
    ["anchor", "anchor A₂ (fast) | m = 6 | c = 3 | ticks of A₂"],
    ["base grid", "base grid | D = 36 | Φ = 18 | base ticks"],
    ["seconds", "seconds | Δt = 3/25 s | τ = 3/50 s"],
  ]);
  await expect(rate(page).locator("table.frames thead th")).toHaveText(["", "period", "phase", ""]);
  // each frame's head is titled with its pair and unit, φ and Φ told apart by the row
  for (const [f, pair] of [["scope", "K and φ"], ["anchor", "m and c"], ["base grid", "D and Φ"], ["seconds", "Δt and τ"]]) {
    await expect(rate(page).locator(`tr[data-frame="${f}"] th.frame`)).toHaveAttribute("title", new RegExp(pair));
  }
  // the table and the chain line are the fact's whole content
  expect(await rate(page).evaluate((dd) => [...dd.children].map((c) => `${c.tagName.toLowerCase()}.${c.className.split(" ")[0]}`)))
    .toEqual(["table.frames", "p.chain"]);
  await expect(rate(page).locator("p.chain")).toHaveText("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → hold = Relative(3, 1)");
  await shot(page, "timing_deployment", "fast/outer", "frames");
});

test("timing, a build: no base grid row; staggered opens A₁ at the root with no K and φ; same's explicit Relative(1) kept in its chain", async ({ page }) => {
  await drop(page, "timing");
  await selectBlock(page, "staggered");
  expect(await frames(rate(page))).toEqual([
    ["scope", "scope | opens A₁ at the root"],
    ["anchor", "anchor A₁ (staggered) | m = 1 | c = 0 | ticks of A₁"],
    ["seconds", "seconds | Δt = 1/10 s | τ = 1/300 s"],
  ]);
  await expect(rate(page).locator("p.chain")).toHaveText("staggered = Absolute(1//10, 1//300)");
  await shot(page, "timing", "", "frames");
  await openPath(page, "fast/outer");
  await selectBlock(page, "fast/outer/same");
  expect((await frames(rate(page))).map((r) => r[0])).toEqual(["scope", "anchor", "seconds"]);
  await expect(rate(page).locator("p.chain")).toHaveText("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → same = Relative(1, 0)");
});

test("library and library_deployment: d_pid on A₀ under no keyed assembly reads the root in base ticks, its build's seconds m·Δt_base and c·Δt_base, its deployment's exact; d_lqr's empty chain has no line", async ({ page }) => {
  await drop(page, "library");
  await selectBlock(page, "d_pid");
  expect(await frames(rate(page))).toEqual([
    ["scope", "scope the root | K = 2 | φ = 1 | base ticks"],
    ["anchor", "anchor A₀ (base) | m = 2 | c = 1 | base ticks"],
    ["seconds", "seconds | Δt = 2·Δt_base | τ = Δt_base"],
  ]);
  await expect(rate(page).locator("p.chain")).toHaveText("d_pid = Relative(2, 1)");
  await shot(page, "library", "", "frames");
  await selectBlock(page, "d_lqr");
  await expect(rate(page).locator("table.frames")).toHaveCount(1);
  await expect(rate(page).locator("p.chain")).toHaveCount(0);
  await drop(page, "library_deployment");
  await selectBlock(page, "d_pid");
  expect(await frames(rate(page))).toEqual([
    ["scope", "scope the root | K = 2 | φ = 1 | base ticks"],
    ["anchor", "anchor A₀ (base) | m = 2 | c = 1 | base ticks"],
    ["base grid", "base grid | D = 2 | Φ = 1 | base ticks"],
    ["seconds", "seconds | Δt = 1/50 s | τ = 1/100 s"],
  ]);
  await shot(page, "library_deployment", "", "frames");
});

test("timing_deployment's open levels: scope deep's table derived against fast/outer, fast's opening A₂ at the root, neither with a chain line", async ({ page }) => {
  await drop(page, "timing_deployment");
  await openPath(page, "fast/outer/deep");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  const deep = pane(page).locator('.scopes li[data-key="deep"]');
  expect(await frames(deep)).toEqual([
    ["scope", "scope fast/outer | K = 2 | φ = 1 | ticks of fast/outer"],
    ["anchor", "anchor A₂ (fast) | m = 4 | c = 3 | ticks of A₂"],
    ["base grid", "base grid | D = 24 | Φ = 18 | base ticks"],
    ["seconds", "seconds | Δt = 2/25 s | τ = 3/50 s"],
  ]);
  await expect(pane(page).locator(".scopes p.chain")).toHaveCount(0);
  await shot(page, "timing_deployment", "fast/outer/deep", "frames");
  // the nested component's own table derives against deep, its nearest scope
  await selectBlock(page, "fast/outer/deep/hold");
  expect((await frames(rate(page)))[0]).toEqual(["scope", "scope fast/outer/deep | K = 1 | φ = 0 | ticks of fast/outer/deep"]);
  // the default pane is narrow (360 px): the longest names still fit without a sideways scroll
  expect(await page.locator('.pane[data-pane="detail"] .body').evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
  await page.locator('nav.breadcrumb a[data-path=""]').click();
  await page.locator('svg.canvas[data-level=""][data-ready]').waitFor();
  await page.locator('g.block[data-id="fast"]').dblclick();
  await page.locator('svg.canvas[data-level="fast"][data-ready]').waitFor();
  expect((await frames(pane(page).locator('.scopes li[data-key="fast"]')))[0]).toEqual(["scope", "scope | opens A₂ at the root"]);
});
