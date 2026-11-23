// The drawer's analysis tabs (workspace.md answer 6, the pending bullet): the
// execution order's two groups with their stage ports and the presumed
// feedthrough edges, the root inputs with their consumers one to a line, the
// timing tables with the rate swatches, the period sort and the schedule note;
// every row's click selecting on its level, the whole row taking it (look pass
// 1.1, 1.2, 1.4, 1.7, 1.8), a drag leaving a text selection in the row selecting
// nothing (the second look's 1.8); the empty states. Counts from the oracles
// (`analysis.py`, `stage2.py`).
import { test, type Locator, type Page } from "@playwright/test";
import { drop, dropOver, expect, readyLevel, shot } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const body = (page: Page) => page.locator("section.drawer .tab-body");
const group = (page: Page, stage: 1 | 2) => body(page).locator(`section.order-group[data-stage="${stage}"]`);
/** A stage 2 row by its position. */
const step = (page: Page, position: number) => group(page, 2).locator(`li.step[data-position="${position}"]`);
/** A stage 1 row by its path. */
const step1 = (page: Page, path: string) => group(page, 1).locator(`li.step[data-path="${path}"]`);
const cursor = (l: Locator) => l.evaluate((e) => getComputedStyle(e).cursor);
const selected = (page: Page) => page.locator("svg.canvas g.block.selected");
/** The edge's title, the second look's 7.1. */
const PRESUMED = "A stage 2 output wired into this component. This component's stage 2 output may read it in the same sweep, so the producer runs first. Presumed: the build knows the wiring and the stages, not which inputs each output reads.";
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

test("closed_loop: the order's two groups, 13 and 16, and 16 presumed edges, the root inputs, the timing tables, every kind of row selecting", async ({ page }) => {
  // a taller drawer for the screenshots
  await page.addInitScript(() => localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, sizes: { drawer: 420 } })));
  await drop(page, "closed_loop");

  // the execution order: stage 1 unnumbered, then stage 2 numbered from 1
  await openTab(page, "order");
  await expect(body(page).locator("section.order-group")).toHaveCount(2);
  await expect(group(page, 1).locator("h3")).toHaveText("Stage 1, any order");
  await expect(group(page, 2).locator("h3")).toHaveText("Stage 2, in order");
  await expect(group(page, 1).locator("li.step")).toHaveCount(13);
  await expect(group(page, 2).locator("li.step")).toHaveCount(16);
  await expect(group(page, 1).locator('li.step[data-stage="1"]')).toHaveCount(13);
  await expect(group(page, 2).locator('li.step[data-stage="2"]')).toHaveCount(16);
  await expect(group(page, 1).locator("li.step[data-position], .position")).toHaveCount(0);
  expect(await group(page, 2).locator("li.step").evaluateAll((rs) => rs.map((r) => r.getAttribute("data-position")))).toEqual(
    Array.from({ length: 16 }, (_, i) => `${i + 1}`),
  );
  await expect(group(page, 2).locator("li.step .position")).toHaveText(Array.from({ length: 16 }, (_, i) => `${i + 1}`));
  const first = group(page, 1).locator("li.step").first();
  await expect(first).toHaveAttribute("data-path", "plant");
  await expect(first.locator('li.port[data-stage="1"]')).toHaveCount(6);
  await expect(first.locator("button.row code.path")).toHaveText("plant");
  await expect(step(page, 1)).toHaveAttribute("data-path", "sensing/altimeter");
  await expect(step(page, 16)).toHaveAttribute("data-path", "actuators/δt_limiter");
  // a row in both groups shows that group's ports alone
  await expect(step1(page, "pid_controller/h_ctl").locator("li.port")).toHaveText(["saturated"]);
  await expect(step1(page, "pid_controller/h_ctl").locator('li.port[data-stage="1"]')).toHaveAttribute("title", "published from stage 1");
  await expect(step(page, 7)).toHaveAttribute("data-path", "pid_controller/h_ctl");
  await expect(step(page, 7).locator("li.port")).toHaveText(["u", "u_raw"]);
  await expect(step(page, 7).locator('li.port[data-stage="2"]')).toHaveCount(2);
  // the edges under their consumers' stage 2 rows, none in the first group
  await expect(body(page).locator("li.edge")).toHaveCount(16);
  await expect(group(page, 1).locator("li.edge")).toHaveCount(0);
  await expect(step(page, 10)).toHaveAttribute("data-path", "lqr_controller/tracker");
  await expect(step(page, 10).locator("ul.edges li.edge")).toHaveCount(5);
  const edge = step(page, 9).locator('li.edge[data-from="pid_controller/h_ctl/u"]');
  await expect(edge).toHaveCount(1);
  await expect(edge).toHaveAttribute("data-to", "pid_controller/θ_ctl/r");
  await expect(edge.locator("span.presumed")).toHaveText("presumed");
  await expect(edge.locator("button.row")).toContainText("pid_controller/h_ctl/u → r");
  await expect(edge).toHaveAttribute("title", PRESUMED);
  await shot(page, "closed_loop", "", "analysis-order");

  // the whole line takes the click: a stage 2 row's port selects its primitive on its level, a stage 1 row's port too
  expect(await cursor(step(page, 16).locator(".line"))).toBe("pointer");
  await step(page, 16).locator("li.port").first().click();
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(page.locator('g.block.selected[data-id="actuators/δt_limiter"]')).toHaveCount(1);
  await step1(page, "plant").locator("li.port").last().click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  // an edge's the consumer's input port on the consumer's level
  expect(await cursor(edge)).toBe("pointer");
  // at the line's right end, past the button
  const ebox = (await edge.boundingBox())!;
  await edge.click({ position: { x: ebox.width - 4, y: ebox.height / 2 } });
  await page.locator(readyLevel("pid_controller")).waitFor();
  await expect(page.locator('rect.port.selected[data-port="pid_controller/θ_ctl|in|r"]')).toHaveCount(1);
  await expect(page.locator('aside.detail[data-kind="port"]')).toHaveAttribute("data-id", "pid_controller/θ_ctl|in|r");
  // the button is there for the keyboard: Space on it selects the row's primitive
  await step(page, 2).locator("button.row").focus();
  await page.keyboard.press("Space");
  await expect(page.locator('g.block.selected[data-id="pid_controller/V_ctl"]')).toHaveCount(1);

  // the root inputs: four columns, mode's seven consumers on seven lines, the type cell's click selecting the tag
  await openTab(page, "root-inputs");
  const inputs = body(page).locator("table.root-inputs tr.root-input");
  await expect(inputs).toHaveCount(3);
  await expect(body(page).locator("table.root-inputs th")).toHaveText(["name", "type", "kind", "pinned", "terminal consumers"]);
  await expect(body(page).locator("table.root-inputs td.pinned")).toHaveText(["◆", "◆", ""]);
  const mode = body(page).locator('tr.root-input[data-name="mode"]');
  await expect(mode.locator("td.consumers code")).toHaveCount(7);
  const tops = await mode.locator("td.consumers code").evaluateAll((cs) => cs.map((c) => c.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++) expect(tops[i], `consumer ${i}`).toBeGreaterThan(tops[i - 1]);
  await expect(body(page).locator('tr.root-input[data-name="h_ref"] td.consumers code')).toHaveText(["pid_controller/h_ctl/r", "lqr_controller/z_ref_pack/in1"]);
  await expect(mode.locator("td.kind")).toHaveText("boolean");
  await expect(mode.locator("td.type code")).toHaveText("Bool");
  await shot(page, "closed_loop", "", "analysis-root-inputs");
  expect(await cursor(mode)).toBe("pointer");
  await mode.locator("td.type").click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="⟨in⟩mode"]')).toHaveCount(1);
  await body(page).locator('tr.root-input[data-name="h_ref"] td.name button.row').click();
  await expect(page.locator('g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);

  // the timing tables
  await openTab(page, "timing");
  const anchors = body(page).locator("table.anchors tr.anchor");
  await expect(anchors).toHaveCount(11);
  await expect(anchors.first()).toHaveAttribute("data-index", "0");
  await expect(anchors.first()).toContainText("base grid");
  await expect(anchors.first().locator("button.row")).toHaveCount(0);
  await expect(body(page).locator("table.anchors th")).toHaveText(["index", "T", "tau", "declared in", "key"]);
  const a1 = body(page).locator('tr.anchor[data-index="1"]');
  await expect(a1.locator("td.scope")).toHaveText("sensing");
  await expect(a1.locator("td.key")).toHaveText("noise");
  await expect(a1.locator("td.T")).toHaveText("1/50 s");
  await expect(body(page).locator("table.scopes")).toHaveCount(0);
  await expect(body(page).locator("p.empty")).toHaveText(["No assembly is keyed in sample_times; every key names a primitive."]);
  await expect(body(page).locator("p.empty code")).toHaveText("sample_times");
  await expect(body(page).locator("table.components tr.component")).toHaveCount(10);
  await expect(body(page).locator("table.components tr.component span.swatch[data-step]")).toHaveCount(10);
  await expect(body(page).locator("p.schedule-note")).toContainText("need a deployment");
  await shot(page, "closed_loop", "", "analysis-timing");
  await a1.locator("button.row").click();
  await expect(page.locator('g.block.selected[data-id="sensing"]')).toHaveCount(1);
  // the base grid's row takes no click and shows no pointer; an anchor row's key cell selects its scope's node
  expect(await cursor(anchors.first())).not.toBe("pointer");
  expect(await cursor(a1)).toBe("pointer");
  await body(page).locator('tr.anchor[data-index="2"] td.key').click();
  await expect(selected(page)).toHaveAttribute("data-id", "pid_controller");
  await anchors.first().locator("td.key").click();
  await expect(selected(page)).toHaveAttribute("data-id", "pid_controller");

  // the swatch is the primitive's rate fill in either mode
  const swatch = () => component(page, "sensing/noise").locator("span.swatch").evaluate((e) => getComputedStyle(e).backgroundColor);
  const tier = await swatch();
  expect(await cursor(component(page, "sensing/noise"))).toBe("pointer");
  await component(page, "sensing/noise").locator("td.period").click();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
  await page.locator('nav.breadcrumb .controls .mode button[data-mode="rate"]').click();
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-mode", "rate");
  const fill = await page.locator('g.block[data-id="sensing/noise"] .shape').evaluate((e) => getComputedStyle(e).fill);
  expect(await swatch()).toBe(fill);
  expect(tier).toBe(fill);
});

/**
 * Drags the pointer across a cell's first text, from the left half of its character `from` to the right half of the
 * one before `to`, the whole text by default, and returns the selected text.
 */
async function dragAcross(page: Page, cell: Locator, from = 0, to?: number): Promise<string> {
  await cell.scrollIntoViewIfNeeded();
  const r = await cell.evaluate((e, [from, to]) => {
    const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT).nextNode()!;
    const range = document.createRange();
    range.setStart(t, from!);
    range.setEnd(t, to ?? t.textContent!.length);
    const b = range.getBoundingClientRect();
    return { left: b.left, right: b.right, y: (b.top + b.bottom) / 2 };
  }, [from, to]);
  await page.mouse.move(r.left + 1, r.y);
  await page.mouse.down();
  await page.mouse.move(r.right - 1, r.y, { steps: 5 });
  await page.mouse.up();
  return page.evaluate(() => window.getSelection()?.toString() ?? "");
}

test("closed_loop: a drag that makes or changes a text selection in a row selects nothing, a plain click and the row's button under a selection then select; on the root inputs, order and timing tabs", async ({ page }) => {
  await drop(page, "closed_loop");
  await openTab(page, "root-inputs");
  const type = body(page).locator('tr.root-input[data-name="mode"] td.type code');
  expect(await dragAcross(page, type)).toBe("Bool");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "level");
  await type.click();
  await expect(page.locator('g.block.selected[data-id="⟨in⟩mode"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  // a second drag in the same row changes the selection: nothing selected either time
  const kind = body(page).locator('tr.root-input[data-name="mode"] td.kind');
  expect(await dragAcross(page, kind, 0, 3)).toBe("boo");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  expect(await dragAcross(page, kind, 4, 7)).toBe("ean");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  // the row's button from the keyboard selects, the selection standing
  await body(page).locator('tr.root-input[data-name="mode"] button.row').focus();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("ean");
  await page.keyboard.press("Enter");
  await expect(page.locator('g.block.selected[data-id="⟨in⟩mode"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);

  // a stage 2 row's port: the drag selects its name and nothing on the canvas; a click selects the primitive on its level
  await openTab(page, "order");
  const port = step(page, 7).locator("li.port").last();
  expect(await dragAcross(page, port)).toBe("u_raw");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-level", "");
  await port.click();
  await page.locator(readyLevel("pid_controller")).waitFor();
  await expect(page.locator('g.block.selected[data-id="pid_controller/h_ctl"]')).toHaveCount(1);

  // a component's period: the drag selects nothing, a click selects the primitive on its level
  await openTab(page, "timing");
  const period = component(page, "sensing/noise").locator("td.period");
  expect(await dragAcross(page, period)).toBe(await period.textContent());
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-level", "pid_controller");
  await expect(page.locator('g.block.selected[data-id="pid_controller/h_ctl"]')).toHaveCount(1);
  await period.click();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(page.locator('g.block.selected[data-id="sensing/noise"]')).toHaveCount(1);
});

test("closed_loop_deployment: the schedule note says the page does not draw the schedule yet", async ({ page }) => {
  await drop(page, "closed_loop_deployment");
  await openTab(page, "timing");
  await expect(body(page).locator("p.schedule-note")).toContainText("does not draw");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(11);
});

test("rates: three scopes with their triples, a scope row selecting its assembly, the periods", async ({ page }) => {
  await drop(page, "rates");
  await openTab(page, "timing");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(3);
  await expect(body(page).locator('tr.anchor[data-index="1"] td.scope')).toHaveText("the root");
  await expect(body(page).locator('tr.anchor[data-index="1"] button.row')).toHaveCount(0);
  expect(await cursor(body(page).locator('tr.anchor[data-index="1"]'))).not.toBe("pointer");
  await expect(body(page).locator("table.scopes tr.scope")).toHaveCount(3);
  const outer = body(page).locator('tr.scope[data-path="fast/outer"]');
  await expect(outer).toHaveAttribute("data-key", "outer");
  await expect(outer.locator("td.triple")).toHaveText("anchor 1 (1/50 s) × 2");
  await expect(body(page).locator("td.period")).toHaveText(["1/50 s", "1/25 s", "1/10 s"]);
  await outer.locator("td.triple").click();
  await page.locator(readyLevel("fast")).waitFor();
  await expect(page.locator('g.block.selected[data-id="fast/outer"]')).toHaveCount(1);
});

test("library: 13 components in walk order, the period sort and back, the sort kept across a tab switch", async ({ page }) => {
  await drop(page, "library");
  await openTab(page, "timing");
  await expect(body(page).locator("table.components tr.component")).toHaveCount(13);
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
  await expect(group(page, 1).locator("li.step")).toHaveCount(25);
  await expect(group(page, 2).locator("li.step")).toHaveCount(18);
  await expect(body(page).locator("li.edge")).toHaveCount(16);
  // the tabs share one scrolling body, and a tab opens at its top
  await body(page).evaluate((b) => (b.scrollTop = b.scrollHeight));
  expect(await body(page).evaluate((b) => b.scrollTop)).toBeGreaterThan(0);
  await openTab(page, "timing");
  expect(await body(page).evaluate((b) => b.scrollTop)).toBe(0);
  await expect(body(page).locator("button.sort-period")).toHaveAttribute("aria-pressed", "true");
  paths = await componentPaths(page);
  expect(paths[0]).toBe("unit_delay");
});

test("containers and large: an empty first group, then an empty second group", async ({ page }) => {
  await drop(page, "containers");
  await openTab(page, "order");
  await expect(group(page, 1).locator("p.empty")).toHaveText("No stage 1 outputs.");
  await expect(group(page, 1).locator("li.step")).toHaveCount(0);
  await expect(group(page, 2).locator("li.step")).toHaveCount(6);
  await expect(group(page, 2).locator("p.empty")).toHaveCount(0);
  await dropOver(page, "large");
  await expect(group(page, 2).locator("p.empty")).toHaveText("No stage 2 outputs, so nothing is ordered.");
  await expect(group(page, 2).locator("li.step")).toHaveCount(0);
  await expect(group(page, 1).locator("li.step")).toHaveCount(160);
  await expect(group(page, 1).locator("p.empty")).toHaveCount(0);
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
  await expect(body(page).locator("p.schedule-note")).toContainText("does not draw");
  await expect(drawer(page)).toHaveAttribute("data-tab", "timing");
});

// deployment_overlay.md answer 14: the pinned mark again, and the pinning consumers marked with the cause
test("closed_loop: h_ref's PID consumer marked pinned by tier, its LQR consumer and mode unmarked, the mark titled by its cause", async ({ page }) => {
  await drop(page, "closed_loop");
  await openTab(page, "root-inputs");
  const h = body(page).locator('tr.root-input[data-name="h_ref"]');
  await expect(h.locator("td.pinned")).toHaveAttribute("title", "pinned: by tier");
  await expect(h.locator("td.consumers .consumer")).toHaveText(["pid_controller/h_ctl/rpinned by tier", "lqr_controller/z_ref_pack/in1"]);
  await expect(h.locator('td.consumers .consumer[data-cause="tier"] code')).toHaveText("pid_controller/h_ctl/r");
  await expect(body(page).locator('tr.root-input[data-name="mode"] td.pinned')).not.toHaveAttribute("title");
  await expect(body(page).locator('tr.root-input[data-name="mode"] .cause')).toHaveCount(0);
});

test("timing: u pinned by tier through five consumers, ref by declaration through frozen's Pinned entry", async ({ page }) => {
  await drop(page, "timing");
  await openTab(page, "root-inputs");
  const u = body(page).locator('tr.root-input[data-name="u"]');
  await expect(u.locator(".cause")).toHaveText(Array(5).fill("pinned by tier"));
  const ref = body(page).locator('tr.root-input[data-name="ref"]');
  await expect(ref.locator("td.pinned")).toHaveAttribute("title", "pinned: by declaration");
  await expect(ref.locator('.consumer[data-cause="declaration"] code')).toHaveText("frozen/in");
  await expect(ref.locator(".cause")).toHaveText("pinned by declaration");
  await shot(page, "timing", "", "analysis-root-inputs");
});

test("timing: the mark is the tab's alone, the root tags and the pin's pane showing none", async ({ page }) => {
  await drop(page, "timing");
  await page.locator('g.block[data-id="⟨in⟩ref"]').click();
  await expect(page.locator("aside.detail")).toHaveAttribute("data-kind", "pin");
  await expect(page.locator("aside.detail")).not.toContainText("pinned by");
  await expect(page.locator('g.block[data-id="⟨in⟩ref"] .pinned')).toHaveCount(0);
});
