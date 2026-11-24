// The pane's frames table (deployment_overlay.md answer 10, amending workspace.md answer 4 and visual_grammar.md
// answer 6): a discrete primitive's timing is one table in the section TIMING, a row per frame of answer 3 with the
// period and phase columns and no sentence, a build's without the base grid row; the scope row derived against the
// nearest enclosing rate scope, the root's in base ticks, none for a component with its own anchor, whose name is
// titled with the declaring key and scope; the chain line under it, none on an empty chain; a keyed assembly's the same
// section with no chain line, as the open level and as a block; the heading's title, the word alone; the narrowest
// pane with no sideways scroll. Figures from increment 10's oracle (`oracle/<fixture>.txt`, "frames tables").
import { test, type Page } from "@playwright/test";
import { drop, expect, openPath, openSection, readyLevel, section, shot } from "./fixtures";

const pane = (page: Page) => page.locator("aside.detail");
const timing = (page: Page) => section(page, "timing");
/** TIMING's heading, its text in the case drawn. */
const heading = (page: Page) => timing(page).locator("summary");
/** The section's rows as `[frame, rest]`, the rest the row's cells but the head joined by one space. */
const frames = (scope: ReturnType<typeof timing>) => scope.locator("table.frames tbody tr").evaluateAll((trs) => trs.map((tr) => [
  (tr as HTMLElement).dataset.frame!, [...tr.children].map((c) => c.textContent!.replace(/\s+/g, " ").trim()).filter((t) => t).join(" | "),
]));
async function selectBlock(page: Page, id: string) {
  await page.locator(`g.block[data-id="${id}"]`).click();
  await expect(pane(page)).toHaveAttribute("data-id", id);
}
/** Opens one level below the open one. */
async function openPathFrom(page: Page, path: string) {
  await page.locator(`g.block[data-id="${path}"]`).dblclick();
  await page.locator(readyLevel(path)).waitFor();
}
/** Stores the detail pane's width in the prefs, read at the next load. */
const paneWidth = (page: Page, detail: number) => page.evaluate((detail) => localStorage.setItem("redstone-inspector/prefs",
  JSON.stringify({ version: 1, sizes: { tree: 280, detail, drawer: 200 }, collapsed: { tree: false, detail: false } })), detail);
/** How far the pane's body scrolls sideways. */
const over = (page: Page) => page.locator('.pane[data-pane="detail"] .body').evaluate((e) => e.scrollWidth - e.clientWidth);

test("timing_deployment's fast/outer/hold: the section TIMING, collapsed at first under its word alone, is answer 10's table, the period and phase heads, four frames with their titles, no sentence, and the chain under it", async ({ page }) => {
  await drop(page, "timing_deployment");
  await openPath(page, "fast/outer");
  await selectBlock(page, "fast/outer/hold");
  // no rate fact; the heading is the word alone, collapsed or open, with its title
  await expect(pane(page).locator('dl.facts dd[data-fact="rate"]')).toHaveCount(0);
  await expect(timing(page).locator("table.frames")).toBeHidden();
  await expect(heading(page)).toHaveText(/^timing$/);
  await expect(heading(page)).toHaveAttribute("title", "When the discrete primitive or the rate scope ticks, in each of its frames down to seconds.");
  await openSection(page, "timing");
  await expect(heading(page)).toHaveText(/^timing$/);
  await expect(timing(page).locator("table.frames")).toBeVisible();
  expect(await frames(timing(page))).toEqual([
    ["scope", "scope fast/outer | Dₛ = 3 | Φₛ = 1 | ticks of fast/outer"],
    ["anchor", "anchor A₂ (fast) | Dₐ = 6 | Φₐ = 3 | ticks of A₂"],
    ["base grid", "base grid | D₀ = 36 | Φ₀ = 18 | base ticks"],
    ["seconds", "seconds | Δt = 3/25 s | τ = 3/50 s"],
  ]);
  await expect(timing(page).locator("table.frames thead th")).toHaveText(["", "period", "phase", ""]);
  // each frame's head is titled with its pair and unit, the three counts told apart by their subscripts
  for (const [f, title] of [["scope", "Its rate scope: Dₛ and Φₛ in ticks of the enclosing scope, as declared"], ["anchor", "Its anchor: Dₐ and Φₐ in ticks of the anchor"],
    ["base grid", "The base grid: D₀ and Φ₀ in base ticks, the deployment's"], ["seconds", "Seconds: Δt and τ"]]) {
    await expect(timing(page).locator(`tr[data-frame="${f}"] th.frame`)).toHaveAttribute("title", title);
  }
  // the anchor's name carries its own title, the rest of the row's head the frame's
  await expect(timing(page).locator('tr[data-frame="anchor"] .name')).toHaveAttribute("title", "fast at the root");
  await expect(timing(page).locator('tr[data-frame="scope"] .name')).not.toHaveAttribute("title");
  // the table and the chain line are the section's whole content under its heading
  expect(await timing(page).evaluate((dd) => [...dd.children].slice(1).map((c) => `${c.tagName.toLowerCase()}.${c.className.split(" ")[0]}`)))
    .toEqual(["table.frames", "p.chain"]);
  await expect(timing(page).locator("p.chain")).toHaveText("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → hold = Relative(3, 1)");
  await shot(page, "timing_deployment", "fast/outer", "frames");
});

test("timing, a build: no base grid row; staggered, with its own anchor, no scope row, its anchor's name titled; frozen, continuous, no section; same's explicit Relative(1) kept in its chain", async ({ page }) => {
  await drop(page, "timing");
  await selectBlock(page, "staggered");
  await openSection(page, "timing");
  expect(await frames(timing(page))).toEqual([
    ["anchor", "anchor A₁ (staggered) | Dₐ = 1 | Φₐ = 0 | ticks of A₁"],
    ["seconds", "seconds | Δt = 1/10 s | τ = 1/300 s"],
  ]);
  await expect(timing(page).locator('tr[data-frame="anchor"] .name')).toHaveAttribute("title", "staggered at the root");
  await expect(timing(page).locator("p.chain")).toHaveText("staggered = Absolute(1//10, 1//300)");
  await shot(page, "timing", "", "frames");
  await selectBlock(page, "frozen");
  await expect(timing(page)).toHaveCount(0);
  await openPath(page, "fast/outer");
  await selectBlock(page, "fast/outer/same");
  expect((await frames(timing(page))).map((r) => r[0])).toEqual(["scope", "anchor", "seconds"]);
  await expect(timing(page).locator("p.chain")).toHaveText("fast = Absolute(1//50, 0//1) → outer = Relative(2, 1) → same = Relative(1, 0)");
});

test("library and library_deployment: d_pid on A₀ under no keyed assembly reads the root in base ticks, its build's seconds Dₐ·Δt_base and Φₐ·Δt_base, its deployment's exact; d_lqr's empty chain has no line", async ({ page }) => {
  await drop(page, "library");
  await selectBlock(page, "d_pid");
  await openSection(page, "timing");
  expect(await frames(timing(page))).toEqual([
    ["scope", "scope the root | Dₛ = 2 | Φₛ = 1 | base ticks"],
    ["anchor", "anchor A₀ (base) | Dₐ = 2 | Φₐ = 1 | base ticks"],
    ["seconds", "seconds | Δt = 2·Δt_base | τ = Δt_base"],
  ]);
  await expect(timing(page).locator("p.chain")).toHaveText("d_pid = Relative(2, 1)");
  await shot(page, "library", "", "frames");
  await selectBlock(page, "d_lqr");
  await expect(timing(page).locator("table.frames")).toHaveCount(1);
  await expect(timing(page).locator("p.chain")).toHaveCount(0);
  await drop(page, "library_deployment");
  await selectBlock(page, "d_pid");
  await openSection(page, "timing");
  expect(await frames(timing(page))).toEqual([
    ["scope", "scope the root | Dₛ = 2 | Φₛ = 1 | base ticks"],
    ["anchor", "anchor A₀ (base) | Dₐ = 2 | Φₐ = 1 | base ticks"],
    ["base grid", "base grid | D₀ = 2 | Φ₀ = 1 | base ticks"],
    ["seconds", "seconds | Δt = 1/50 s | τ = 1/100 s"],
  ]);
  await shot(page, "library_deployment", "", "frames");
});

test("timing_deployment's keyed assemblies: fast/outer's TIMING selected as a block and as the open level, deep's derived against fast/outer, fast's with no scope row, none with a chain line; the root, unkeyed, has no section", async ({ page }) => {
  await drop(page, "timing_deployment");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  await expect(timing(page)).toHaveCount(0);
  await expect(pane(page)).not.toContainText("Rate scopes");
  await openPath(page, "fast");
  await selectBlock(page, "fast/outer");
  await expect(pane(page)).toHaveAttribute("data-kind", "assembly");
  await openSection(page, "timing");
  const outer = [
    ["scope", "scope fast | Dₛ = 2 | Φₛ = 1 | ticks of fast"],
    ["anchor", "anchor A₂ (fast) | Dₐ = 2 | Φₐ = 1 | ticks of A₂"],
    ["base grid", "base grid | D₀ = 12 | Φ₀ = 6 | base ticks"],
    ["seconds", "seconds | Δt = 1/25 s | τ = 1/50 s"],
  ];
  expect(await frames(timing(page))).toEqual(outer);
  await expect(timing(page).locator("table.frames")).toBeVisible();
  await expect(timing(page).locator("p.chain")).toHaveCount(0);
  await shot(page, "timing_deployment", "fast", "frames");
  await openPathFrom(page, "fast/outer");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  expect(await frames(timing(page))).toEqual(outer);
  await expect(timing(page).locator("table.frames")).toBeVisible();
  await expect(timing(page).locator("p.chain")).toHaveCount(0);
  await openPathFrom(page, "fast/outer/deep");
  expect(await frames(timing(page))).toEqual([
    ["scope", "scope fast/outer | Dₛ = 2 | Φₛ = 1 | ticks of fast/outer"],
    ["anchor", "anchor A₂ (fast) | Dₐ = 4 | Φₐ = 3 | ticks of A₂"],
    ["base grid", "base grid | D₀ = 24 | Φ₀ = 18 | base ticks"],
    ["seconds", "seconds | Δt = 2/25 s | τ = 3/50 s"],
  ]);
  await shot(page, "timing_deployment", "fast/outer/deep", "frames");
  // the nested component's own table derives against deep, its nearest scope
  await selectBlock(page, "fast/outer/deep/hold");
  expect((await frames(timing(page)))[0]).toEqual(["scope", "scope fast/outer/deep | Dₛ = 1 | Φₛ = 0 | ticks of fast/outer/deep"]);
  // the default pane is narrow (360 px): the longest names still fit without a sideways scroll
  expect(await over(page)).toBeLessThanOrEqual(0);
  await page.locator('nav.breadcrumb a[data-path=""]').click();
  await page.locator('svg.canvas[data-level=""][data-ready]').waitFor();
  await openPathFrom(page, "fast");
  expect((await frames(timing(page))).map((r) => r[0])).toEqual(["anchor", "base grid", "seconds"]);
  await expect(timing(page).locator('tr[data-frame="anchor"] .name')).toHaveAttribute("title", "fast at the root");
});

test("the narrowest pane, 240 px: staggered, fast/outer and library's d_pid with a build's seconds, every section open and every one collapsed, fit without a sideways scroll", async ({ page }) => {
  for (const [name, level, id] of [
    ["timing_deployment", "", "staggered"], ["timing_deployment", "fast", "fast/outer"], ["timing_deployment", "fast/outer/deep", "fast/outer/deep/hold"],
    ["library", "", "d_pid"], ["closed_loop", "pid_controller", "pid_controller/h_ctl"],
  ]) {
    await drop(page, name);
    await paneWidth(page, 240);
    await drop(page, name);
    if (level) await openPath(page, level);
    await selectBlock(page, id);
    expect(await pane(page).evaluate((e) => e.getBoundingClientRect().width)).toBe(240);
    const all = pane(page).locator("details.section");
    const names = await all.evaluateAll((ds) => ds.map((d) => (d as HTMLElement).dataset.section!));
    for (const n of names) if (await section(page, n).getAttribute("open") !== null) await section(page, n).locator("summary").click();
    await expect(pane(page).locator("details.section[open]")).toHaveCount(0);
    expect(await over(page), `${id} collapsed`).toBeLessThanOrEqual(0);
    for (const n of names) await openSection(page, n);
    await expect(pane(page).locator("details.section:not([open])")).toHaveCount(0);
    expect(await over(page), `${id} open`).toBeLessThanOrEqual(0);
  }
  await shot(page, "closed_loop", "pid_controller", "frames-narrow");
});
