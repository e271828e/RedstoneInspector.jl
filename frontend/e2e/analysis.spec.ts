// The drawer's analysis tabs (workspace.md answer 6, the pending bullet): the
// execution order with its stage ports and the presumed feedthrough edges, the
// root inputs with their consumers, the timing tables with the rate swatches,
// the period sort and the schedule note; every row's click selecting on its
// level; the empty states. Counts from the oracle (`analysis.py`).
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, readyLevel, shot } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const body = (page: Page) => page.locator("section.drawer .tab-body");
const step = (page: Page, position: number) => body(page).locator(`ol.order li.step[data-position="${position}"]`);
const component = (page: Page, path: string) => body(page).locator(`table.components tr.component[data-path="${path}"]`);
const componentPaths = (page: Page) => body(page).locator("table.components tr.component").evaluateAll((rs) => rs.map((r) => r.getAttribute("data-path")));

/** Opens the drawer on a tab, unless it already shows it. */
async function openTab(page: Page, tab: string): Promise<void> {
  const d = drawer(page);
  if ((await d.getAttribute("data-open")) !== "true" || (await d.getAttribute("data-tab")) !== tab) {
    await d.locator(`button.tab[data-tab="${tab}"]`).click();
  }
  await expect(d).toHaveAttribute("data-open", "true");
  await expect(d).toHaveAttribute("data-tab", tab);
}

test("closed_loop: the order's 24 rows and 16 presumed edges, the root inputs, the timing tables, every kind of row selecting", async ({ page }) => {
  // a taller drawer for the screenshots
  await page.addInitScript(() => localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, sizes: { drawer: 420 } })));
  await drop(page, "closed_loop");

  // the execution order
  await openTab(page, "order");
  await expect(body(page).locator("li.step")).toHaveCount(24);
  const first = body(page).locator("li.step").first();
  await expect(first).toHaveAttribute("data-position", "1");
  await expect(first).toHaveAttribute("data-path", "plant");
  await expect(first.locator('li.port[data-stage="1"]')).toHaveCount(6);
  await expect(first.locator('li.port[data-stage="2"]')).toHaveCount(0);
  await expect(first.locator("button.row .position")).toHaveText("1");
  await expect(first.locator("button.row code.path")).toHaveText("plant");
  await expect(step(page, 15).locator('li.port[data-stage="1"]')).toHaveText(["saturated"]);
  await expect(step(page, 15).locator('li.port[data-stage="2"]')).toHaveText(["u", "u_raw"]);
  await expect(step(page, 15).locator('li.port[data-stage="1"]')).toHaveAttribute("title", "published from stage 1");
  // the stage-1 ports first
  expect(await step(page, 15).locator("li.port").evaluateAll((ps) => ps.map((p) => p.getAttribute("data-stage")))).toEqual(["1", "2", "2"]);
  await expect(body(page).locator("li.edge")).toHaveCount(16);
  await expect(step(page, 18).locator("ul.edges li.edge")).toHaveCount(5);
  const edge = step(page, 17).locator('li.edge[data-from="pid_controller/h_ctl/u"]');
  await expect(edge).toHaveCount(1);
  await expect(edge).toHaveAttribute("data-to", "pid_controller/θ_ctl/r");
  await expect(edge.locator("span.presumed")).toHaveText("presumed");
  await expect(edge.locator("button.row")).toContainText("pid_controller/h_ctl/u → r");
  await expect(edge).toHaveAttribute("title", /^Presumed from the stage lists/);
  await shot(page, "closed_loop", "", "analysis-order");

  // a leaf's row selects it on its level; an edge's the consumer's input port on the consumer's level
  await step(page, 24).locator("> button.row").click();
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(page.locator('g.block.selected[data-id="actuators/δt_limiter"]')).toHaveCount(1);
  await edge.locator("button.row").click();
  await page.locator(readyLevel("pid_controller")).waitFor();
  await expect(page.locator('rect.port.selected[data-port="pid_controller/θ_ctl|in|r"]')).toHaveCount(1);
  await expect(page.locator('aside.detail[data-kind="port"]')).toHaveAttribute("data-id", "pid_controller/θ_ctl|in|r");

  // the root inputs
  await openTab(page, "root-inputs");
  const inputs = body(page).locator("table.root-inputs tr.root-input");
  await expect(inputs).toHaveCount(3);
  const mode = body(page).locator('tr.root-input[data-name="mode"]');
  await expect(mode.locator("td.consumers code")).toHaveCount(7);
  await expect(body(page).locator('tr.root-input[data-name="h_ref"] td.consumers')).toHaveText("pid_controller/h_ctl/r, lqr_controller/z_ref_pack/in1");
  await expect(mode.locator("td.pinned")).toHaveText("");
  await expect(mode.locator("td.kind")).toHaveText("boolean");
  await expect(mode.locator("td.type code")).toHaveText("Bool");
  await expect(body(page).locator("table.root-inputs th[title]")).toHaveAttribute("title", /^A pinned face/);
  await body(page).locator('tr.root-input[data-name="h_ref"] td.name button.row').click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);

  // the timing tables
  await openTab(page, "timing");
  const anchors = body(page).locator("table.anchors tr.anchor");
  await expect(anchors).toHaveCount(11);
  await expect(anchors.first()).toHaveAttribute("data-index", "0");
  await expect(anchors.first()).toContainText("base grid");
  await expect(anchors.first().locator("button.row")).toHaveCount(0);
  const a1 = body(page).locator('tr.anchor[data-index="1"]');
  await expect(a1.locator("td.scope")).toHaveText("sensing");
  await expect(a1.locator("td.key")).toHaveText("noise");
  await expect(a1.locator("td.T")).toHaveText("1/50 s");
  await expect(body(page).locator("table.scopes")).toHaveCount(0);
  await expect(body(page).locator("p.empty")).toHaveText(["No rate scopes."]);
  await expect(body(page).locator("table.components tr.component")).toHaveCount(10);
  await expect(body(page).locator("table.components tr.component span.swatch[data-step]")).toHaveCount(10);
  await expect(body(page).locator("p.schedule-note")).toContainText("need a deployment");
  await shot(page, "closed_loop", "", "analysis-timing");
  await a1.locator("button.row").click();
  await expect(page.locator('g.block.selected[data-id="sensing"]')).toHaveCount(1);

  // the swatch is the leaf's rate fill in either mode
  const swatch = () => component(page, "sensing/noise").locator("span.swatch").evaluate((e) => getComputedStyle(e).backgroundColor);
  const tier = await swatch();
  await component(page, "sensing/noise").locator("button.row").click();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
  await page.locator('nav.breadcrumb .controls .mode button[data-mode="rate"]').click();
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "rate");
  const fill = await page.locator('g.block[data-id="sensing/noise"] .shape').evaluate((e) => getComputedStyle(e).fill);
  expect(await swatch()).toBe(fill);
  expect(tier).toBe(fill);
});

test("closed_loop_deployment: the schedule note says the format carries none", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await openTab(page, "timing");
  await expect(body(page).locator("p.schedule-note")).toContainText("carries no schedule");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(11);
});

test("rates: three scopes with their triples, a scope row selecting its assembly, the periods", async ({ page }) => {
  await drop(page, "rates");
  await openTab(page, "timing");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(3);
  await expect(body(page).locator('tr.anchor[data-index="1"] td.scope')).toHaveText("the root");
  await expect(body(page).locator('tr.anchor[data-index="1"] button.row')).toHaveCount(0);
  await expect(body(page).locator("table.scopes tr.scope")).toHaveCount(3);
  const outer = body(page).locator('tr.scope[data-path="fast/outer"]');
  await expect(outer).toHaveAttribute("data-key", "outer");
  await expect(outer.locator("td.triple")).toHaveText("anchor 1 (1/50 s) × 2");
  await expect(body(page).locator("td.period")).toHaveText(["1/50 s", "1/25 s", "1/10 s"]);
  await outer.locator("button.row").click();
  await page.locator(readyLevel("fast")).waitFor();
  await expect(page.locator('g.block.selected[data-id="fast/outer"]')).toHaveCount(1);
});

test("library: 12 components in walk order, the period sort and back, the sort kept across a tab switch", async ({ page }) => {
  await drop(page, "library");
  await openTab(page, "timing");
  await expect(body(page).locator("table.components tr.component")).toHaveCount(12);
  expect((await componentPaths(page))[0]).toBe("noise");
  const sort = body(page).locator("button.sort-period");
  await expect(sort).toHaveText("by period");
  await expect(sort).toHaveAttribute("aria-pressed", "false");
  await sort.click();
  await expect(sort).toHaveAttribute("aria-pressed", "true");
  let paths = await componentPaths(page);
  expect([paths[0], paths.at(-1)]).toEqual(["unit_delay", "noise"]);
  await sort.click();
  await expect(sort).toHaveAttribute("aria-pressed", "false");
  expect((await componentPaths(page))[0]).toBe("noise");
  await sort.click();
  await openTab(page, "order");
  await expect(body(page).locator("li.step")).toHaveCount(32);
  await expect(body(page).locator("li.edge")).toHaveCount(14);
  // the tabs share one scrolling body, and a tab opens at its top
  await body(page).evaluate((b) => (b.scrollTop = b.scrollHeight));
  expect(await body(page).evaluate((b) => b.scrollTop)).toBeGreaterThan(0);
  await openTab(page, "timing");
  expect(await body(page).evaluate((b) => b.scrollTop)).toBe(0);
  await expect(body(page).locator("button.sort-period")).toHaveAttribute("aria-pressed", "true");
  paths = await componentPaths(page);
  expect(paths[0]).toBe("unit_delay");
});

test("kinds: no root inputs, one component", async ({ page }) => {
  await drop(page, "kinds");
  await openTab(page, "root-inputs");
  await expect(body(page).locator("p.empty")).toHaveText("No root inputs.");
  await expect(body(page).locator("table.root-inputs")).toHaveCount(0);
  await openTab(page, "timing");
  await expect(body(page).locator("table.components tr.component")).toHaveCount(1);
});

test("failure_cycle: no execution order, two anchor rows", async ({ page }) => {
  await drop(page, "failure_cycle");
  await openTab(page, "order");
  await expect(body(page).locator("p.empty")).toContainText("did not reach it");
  await expect(body(page).locator("ol.order")).toHaveCount(0);
  await openTab(page, "timing");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(2);
});

test("failure_structure: every tab shows its empty state", async ({ page }) => {
  await drop(page, "failure_structure");
  for (const tab of ["root-inputs", "timing", "order"]) {
    await openTab(page, tab);
    await expect(body(page).locator("p.empty"), tab).toHaveCount(1);
    await expect(body(page).locator("table, ol"), tab).toHaveCount(0);
  }
});

test("a push keeps the open tab and redraws it from the new model", async ({ page }) => {
  await drop(page, "closed_loop");
  await openTab(page, "timing");
  await expect(body(page).locator("p.schedule-note")).toContainText("need a deployment");
  await dropOver(page, "closed_loop_deployment");
  await expect(body(page).locator("p.schedule-note")).toContainText("carries no schedule");
  await expect(drawer(page)).toHaveAttribute("data-tab", "timing");
});
