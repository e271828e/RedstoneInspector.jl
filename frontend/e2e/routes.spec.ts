// Face routes (workspace.md answers 8, 11, 9 and 3, visual_grammar.md answer 9):
// started by `t`, the pane's trace button or the canvas's right-click menu, drawn
// as casings with the origin's halo, the terminal ports marked and a badge beside each
// port crossed (the look pass, 1.4 and 2.1), the level dimmed, the status bar naming it;
// it survives navigation and selection, clears on Escape, the trace repeated or
// the clear control. Counts from the oracle (`overlay.py`'s `routes`); geometry
// read off the DOM. The polish batch: a push clearing a route that no longer
// resolves, `t` and the menu on a face with no producer, a level the route misses not dimmed.
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, dropOver, effectiveOpacity, expect, fixtureText, openPath, PILL_LIFT, pillByPort, press, readyLevel, shot, wirePoint } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const pane = (page: Page) => page.locator("aside.detail");
const statusRoute = (page: Page) => page.locator("footer.status span.route");
const routeBadge = (page: Page, id: string) => page.locator(`g.overlay g.badge[data-role="route"][data-id="${id}"]`);
const casings = (page: Page) => page.locator("g.casings path.casing.route").evaluateAll((ps) => ps.map((p) => p.getAttribute("data-wire")).sort());
const opacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
const tag = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`);
const routeRows = (page: Page) => page.locator('nav.tree .row:has(span.mark[data-mark="route"])').evaluateAll((rs) => rs.map((r) => r.getAttribute("data-path")).sort());
/** The status line as text, the backquotes of the oracle's spelling dropped. */
const plain = (s: string) => s.replaceAll("`", "");
/** Each route pill on the drawn level, its port, and where it stands by that port; one per port. */
async function routePills(page: Page) {
  const pills = page.locator('g.overlay g.badge[data-role="route"]');
  const out: Record<string, Awaited<ReturnType<typeof pillByPort>>> = {};
  for (let i = 0, n = await pills.count(); i < n; i++) {
    const port = (await pills.nth(i).getAttribute("data-port"))!;
    expect(out[port], `one pill at ${port}`).toBeUndefined();
    out[port] = await pillByPort(pills.nth(i));
  }
  return out;
}
/** The rule of visual_grammar.md answer 9 as amended by the look pass (1.4 and 2.1), at every pill on the level. */
async function expectBesidePorts(page: Page, ports: string[]) {
  const pills = await routePills(page);
  expect(Object.keys(pills).sort()).toEqual([...ports].sort());
  for (const [port, q] of Object.entries(pills)) {
    expect(q.above, `${port} above the wire`).toBe(true);
    expect(q.outside, `${port} outside the block or pin`).toBe(true);
    expect(q.near, `${port} beside its port, or past a label beside it`).toBe(true);
    expect(q.label, `${port} clear of the type labels`).toBe(false);
    expect(q.lift, `${port} PILL_LIFT above the wire`).toBeCloseTo(PILL_LIFT, 1);
  }
}
/** Whether the browser's menu would open: a `contextmenu` dispatched at the element's center, not prevented. */
const browserMenu = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => {
  const r = e.getBoundingClientRect();
  return e.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, button: 2 }));
});

test("closed_loop: h_ref traced by t, drawn across its levels by the badges, kept by selection, cleared by t, the pane and the clear control", async ({ page }) => {
  await drop(page, "closed_loop");
  await tag(page, "⟨in⟩h_ref").click();
  await press(page, "t");
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  await expect(page.locator("g.block.route-origin")).toHaveCount(1);
  await expect(tag(page, "⟨in⟩h_ref")).toHaveClass(/\broute-origin\b/);
  // the tag is selected too; the origin's halo stands without the selection, below
  expect(await casings(page)).toEqual(["lqr_controller|in|h_ref", "pid_controller|in|h_ref"]);
  // the casings opaque in a group faded once, so a shared trunk reads as the branches do
  expect(await opacity(page, 'path.casing.route[data-wire="pid_controller|in|h_ref"]')).toBe("1");
  expect(await effectiveOpacity(page, 'path.casing.route[data-wire="pid_controller|in|h_ref"]')).toBe(0.4);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(2);
  for (const id of ["pid_controller", "lqr_controller"]) await expect(routeBadge(page, id).locator("text.badge-text")).toHaveText("route");
  await expect(page.locator('rect.port.route-terminal')).toHaveCount(1);
  await expect(page.locator('rect.port.route-terminal[data-port="⟨in⟩h_ref|out|h_ref"]')).toHaveCount(1);
  expect(await opacity(page, 'g.block[data-id="plant"] > .shape')).toBe("0.35");
  expect(await opacity(page, 'g.block[data-id="pid_controller"] > .shape')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="pid_controller|in|h_ref"]')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="sensing|in|h"]')).toBe("0.35");
  expect(await effectiveOpacity(page, 'g.badge[data-id="pid_controller"]')).toBe(1);
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`: 2 consumers across 3 levels"));
  await expect(statusRoute(page).locator("code")).toHaveText("h_ref");
  await expect(statusRoute(page).locator("button.clear-route")).toHaveText("clear");
  // a child's pill stands left of the input port the route enters by, above its wire
  await expectBesidePorts(page, ["lqr_controller|in|h_ref", "pid_controller|in|h_ref"]);
  await expect(pane(page).locator("button.trace")).toHaveAttribute("aria-pressed", "true");
  await expect(pane(page).locator("button.trace")).toHaveAttribute("title", "Clear the route");
  // the tree's blue marks on the levels it crosses, the root's included
  expect(await routeRows(page)).toEqual(["", "lqr_controller", "pid_controller"]);
  await expect(page.locator('nav.tree .row[data-path="sensing"] span.mark')).toHaveCount(0);
  await expect(page.locator('nav.tree .row[data-path="pid_controller"] span.mark[data-mark="route"]')).toHaveAttribute("title", "on the route");
  await shot(page, "closed_loop", "", "routes");

  // pid_controller's badge opens it: one casing, the terminal, the pin badged past the point its wire leaves it
  await routeBadge(page, "pid_controller").click();
  await page.locator(readyLevel("pid_controller")).waitFor();
  expect(await casings(page)).toEqual(["pid_controller/h_ctl|in|r"]);
  await expect(page.locator('rect.port.route-terminal[data-port="pid_controller/h_ctl|in|r"]')).toHaveCount(1);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(1);
  await expect(routeBadge(page, "⟨in⟩h_ref").locator("text.badge-text")).toHaveText("route");
  await expect(routeBadge(page, "⟨in⟩h_ref").locator("title")).toHaveText("The route leaves this level here; go to the parent to follow it.");
  await expectBesidePorts(page, ["⟨in⟩h_ref|out|h_ref"]);
  await expect(page.locator("g.block.route-origin")).toHaveCount(0);
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`: 2 consumers across 3 levels"));
  await shot(page, "closed_loop", "pid_controller", "routes");

  // the pin's badge climbs, the child left selected, the route still drawn
  await routeBadge(page, "⟨in⟩h_ref").click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="pid_controller"]')).toHaveCount(1);
  expect(await casings(page)).toEqual(["lqr_controller|in|h_ref", "pid_controller|in|h_ref"]);
  await expect(tag(page, "⟨in⟩h_ref")).not.toHaveClass(/\bselected\b/);
  expect(Number(await opacity(page, 'g.block[data-id="⟨in⟩h_ref"] > .halo'))).toBeGreaterThan(0);

  // a selection elsewhere leaves it; t on a block does nothing
  await tag(page, "plant").click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await press(page, "t");
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  await expect(page.locator("path.casing.route")).toHaveCount(2);
  await expect(statusRoute(page)).toContainText("h_ref");

  // t on the tag again clears it
  await tag(page, "⟨in⟩h_ref").click();
  await press(page, "t");
  await expect(svg(page)).not.toHaveClass(/route-focus/);
  await expect(page.locator("path.casing.route")).toHaveCount(0);
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(0);
  await expect(page.locator('nav.tree span.mark[data-mark="route"]')).toHaveCount(0);

  // the pane's button traces it, the clear control clears it
  await expect(pane(page).locator("button.trace")).toHaveAttribute("aria-pressed", "false");
  await expect(pane(page).locator("button.trace")).toHaveAttribute("title", "Trace this value's route");
  await pane(page).locator("button.trace").click();
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  await expect(pane(page).locator("button.trace")).toHaveAttribute("aria-pressed", "true");
  await statusRoute(page).locator("button.clear-route").click();
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(pane(page).locator("button.trace")).toHaveAttribute("aria-pressed", "false");
});

test("closed_loop: the right-click menu traces a port square and a wire, on those targets alone; Escape clears the route, then the selection", async ({ page }) => {
  await drop(page, "closed_loop");
  await tag(page, "plant").click();
  // the browser's menu stays on the background and a block, and is prevented on a port square
  expect(await browserMenu(page, 'g.block[data-id="plant"] > .shape')).toBe(true);
  expect(await browserMenu(page, "svg.canvas")).toBe(true);
  await expect(page.locator(".viewport div.menu")).toHaveCount(0);
  expect(await browserMenu(page, 'rect.port[data-port="plant|out|V"]')).toBe(false);
  await expect(page.locator(".viewport div.menu button.trace")).toHaveText("Trace");
  // Escape closes the menu alone, the selection kept
  await press(page, "Escape");
  await expect(page.locator(".viewport div.menu")).toHaveCount(0);
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);

  await page.locator('rect.port[data-port="plant|out|V"]').click({ button: "right" });
  await expect(page.locator(".viewport div.menu")).toHaveCount(1);
  // a press elsewhere closes it
  await page.locator("footer.status").click();
  await expect(page.locator(".viewport div.menu")).toHaveCount(0);
  await page.locator('rect.port[data-port="plant|out|V"]').click({ button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(page.locator(".viewport div.menu")).toHaveCount(0);
  await expect(statusRoute(page)).toContainText(plain("tracing `plant/V`: 3 consumers across 3 levels"));
  await expect(page.locator('rect.port.route-origin[data-port="plant|out|V"]')).toHaveCount(1);
  await expect(page.locator("rect.port.route-origin")).toHaveCount(1);
  await expect(page.locator("g.block.route-origin")).toHaveCount(0);
  expect(await page.locator('rect.port[data-port="plant|out|V"]').evaluate((r) => r.previousElementSibling!.classList.contains("on"))).toBe(true);
  expect(await casings(page)).toEqual(["lqr_controller|in|V", "pid_controller|in|V"]);
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);

  // a wire's menu traces its producer face, replacing the route
  const at = await wirePoint(page, "sensing|in|h");
  await page.mouse.click(at.x, at.y, { button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(statusRoute(page)).toContainText("tracing plant/h:");
  await expect(page.locator('rect.port.route-origin[data-port="plant|out|h"]')).toHaveCount(1);
  await expect(page.locator('path.casing.route[data-wire="sensing|in|h"]')).toHaveCount(1);
  // a consumer's port traces from itself: the origin its square, not the producer's
  await page.locator('rect.port[data-port="sensing|in|h"]').click({ button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(statusRoute(page)).toContainText("tracing sensing/h:");
  await expect(page.locator("rect.port.route-origin")).toHaveCount(1);
  await expect(page.locator('rect.port.route-origin[data-port="sensing|in|h"]')).toHaveCount(1);
  await expect(page.locator('rect.port.route-terminal[data-port="plant|out|h"]')).toHaveCount(1);
  // the wheel closes the menu
  await page.mouse.click(at.x, at.y, { button: "right" });
  await expect(page.locator(".viewport div.menu")).toHaveCount(1);
  await page.mouse.wheel(0, 40);
  await expect(page.locator(".viewport div.menu")).toHaveCount(0);

  await press(page, "Escape");
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await press(page, "Escape");
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
});

test("a push keeps a route whose origin the new model declares, recomputed, and drops one it does not", async ({ page }) => {
  await drop(page, "closed_loop");
  await tag(page, "⟨in⟩h_ref").click();
  await press(page, "t");
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`: 2 consumers across 3 levels"));
  await dropOver(page, "closed_loop_deployment");
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`: 2 consumers across 3 levels"));
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  expect(await casings(page)).toEqual(["lqr_controller|in|h_ref", "pid_controller|in|h_ref"]);
  expect(await routeRows(page)).toEqual(["", "lqr_controller", "pid_controller"]);
  await dropOver(page, "rates");
  await page.locator(readyLevel("")).waitFor();
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(page.locator("footer.status span.notice")).toHaveText("the route from h_ref no longer resolves in this model; cleared");
  await expect(svg(page)).not.toHaveClass(/route-focus/);
  await expect(page.locator("path.casing.route")).toHaveCount(0);
  await expect(page.locator('nav.tree span.mark[data-mark="route"]')).toHaveCount(0);
});

/** closed_loop with the root's wire into plant's δe removed: the face declared, fed by nothing. */
const unfed = () => {
  const d = JSON.parse(fixtureText("closed_loop"));
  const root = d.build.structure.nodes[0];
  root.wires = root.wires.filter((w: any) => !(w.to.path === "plant" && w.to.port === "δe"));
  return JSON.stringify(d);
};
const notice = (page: Page) => page.locator("footer.status span.notice");

test("a push that keeps the origin but no longer feeds it clears the route, the status bar saying so until the next selection", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('rect.port[data-port="plant|in|δe"]').click();
  await press(page, "t");
  await expect(statusRoute(page)).toContainText(plain("tracing `plant/δe`"));
  await dropOver(page, "closed_loop", unfed());
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/route-focus/);
  await expect(page.locator("path.casing.route")).toHaveCount(0);
  await expect(notice(page)).toHaveText("the route from plant/δe no longer resolves in this model; cleared");
  await expect(notice(page).locator("code")).toHaveText("plant/δe");
  await shot(page, "closed_loop", "", "route-cleared");
  await page.locator('g.block[data-id="sensing"]').click();
  await expect(notice(page)).toHaveCount(0);
});

test("a face with no producer: the pane offers no trace, and t and the right-click menu say there is nothing to trace", async ({ page }) => {
  await drop(page, "closed_loop", unfed());
  await page.locator('rect.port[data-port="plant|in|δe"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  await expect(pane(page).locator("button.trace")).toHaveCount(0);
  await press(page, "t");
  await expect(notice(page)).toHaveText("nothing to trace: plant/δe has no producer");
  await expect(statusRoute(page)).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/route-focus/);
  await shot(page, "closed_loop", "", "nothing-to-trace");
  // the right-click menu's Trace says so too, after a selection cleared the notice
  await page.locator('g.block[data-id="plant"]').click();
  await expect(notice(page)).toHaveCount(0);
  await page.locator('rect.port[data-port="plant|in|δe"]').click({ button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(notice(page)).toHaveText("nothing to trace: plant/δe has no producer");
  await expect(statusRoute(page)).toHaveCount(0);
  // a face with a producer still traces, the message gone
  await page.locator('rect.port[data-port="plant|in|δt"]').click();
  await expect(notice(page)).toHaveCount(0);
  await press(page, "t");
  await expect(statusRoute(page)).toContainText(plain("tracing `plant/δt`"));
});

test("a face with no producer: the pane's fed-by line reads nothing, and an output face, its own producer, still reads itself", async ({ page }) => {
  await drop(page, "closed_loop", unfed());
  const fedBy = pane(page).locator('h3:text-is("Fed by") + p');
  await page.locator('rect.port[data-port="plant|in|δe"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "plant|in|δe");
  await expect(fedBy).toHaveText("nothing");
  await page.locator('rect.port[data-port="plant|out|h"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "plant|out|h");
  await expect(fedBy).toHaveText("itself");
});

test("closed_loop: on a level the route does not cross nothing dims, the status bar saying why; the levels it crosses dim", async ({ page }) => {
  await drop(page, "closed_loop");
  await tag(page, "⟨in⟩h_ref").click();
  await press(page, "t");
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  await openPath(page, "sensing");
  await expect(svg(page)).not.toHaveClass(/route-focus/);
  await expect(svg(page)).not.toHaveAttribute("data-focus");
  await expect(page.locator("svg.canvas .lit")).toHaveCount(0);
  for (const id of ["sensing/noise", "sensing/altimeter"]) expect(await effectiveOpacity(page, `g.block[data-id="${id}"] > .shape`)).toBe(1);
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`"));
  await expect(page.locator("footer.status span.focus-note")).toHaveText("the route does not cross this level, so nothing dims");
  await shot(page, "closed_loop", "sensing", "route-not-here");
  await press(page, "Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(svg(page)).toHaveClass(/\broute-focus\b/);
  await expect(page.locator("footer.status span.focus-note")).toHaveCount(0);
  expect(await effectiveOpacity(page, 'g.block[data-id="sensing"] > .shape')).toBeCloseTo(0.35, 5);
});

test("rates: src/out traced from the menu, fast and slow badged, fast opened by its badge with fast/outer badged and inner's input terminal", async ({ page }) => {
  await drop(page, "rates");
  await page.locator('rect.port[data-port="src|out|out"]').click({ button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(statusRoute(page)).toContainText(plain("tracing `src/out`: 3 consumers across 4 levels"));
  expect(await page.locator('rect.port.route-origin[data-port="src|out|out"]').evaluate((r) => r.previousElementSibling!.classList.contains("on"))).toBe(true);
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(2);
  await expect(routeBadge(page, "fast")).toHaveCount(1);
  await expect(routeBadge(page, "slow")).toHaveCount(1);
  await routeBadge(page, "fast").click();
  await page.locator(readyLevel("fast")).waitFor();
  await expect(routeBadge(page, "fast/outer")).toHaveCount(1);
  await expect(routeBadge(page, "⟨in⟩in")).toHaveCount(1);
  await expect(page.locator('rect.port.route-terminal[data-port="fast/inner|in|in"]')).toHaveCount(1);
  expect(await casings(page)).toEqual(["fast/inner|in|in", "fast/outer|in|in"]);
  // the four levels marked in the tree once fast is open, its row expanded
  expect(await routeRows(page)).toEqual(["", "fast", "fast/outer", "slow"]);
});

test("the route's pills, the type labels on: beside each port it crosses, a child's input, a child's output, an input pin's and an output pin's, above the wire, outside the block or pin and clear of every label (visual_grammar.md answer 9 as amended by the look pass, 1.4 and 2.1)", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "y");
  await expect(svg(page)).toHaveAttribute("data-labels", "");
  await page.locator('rect.port[data-port="plant|out|V"]').click();
  await press(page, "t");
  await expectBesidePorts(page, ["lqr_controller|in|V", "pid_controller|in|V"]);
  await shot(page, "closed_loop", "", "route-pills");
  // a move past a label: selection's engaged inside approach_deployment's vehicle
  await drop(page, "approach_deployment");
  await openPath(page, "vehicle");
  await page.locator('rect.port[data-port="vehicle/selection|out|engaged"]').dispatchEvent("click");
  await press(page, "t");
  await expectBesidePorts(page, ["vehicle/cascade|in|engaged", "vehicle/selection|out|engaged"]);
  expect((await pillByPort(page.locator('g.badge[data-role="route"][data-port="vehicle/selection|out|engaged"]'))).gap, "moved past a label").toBeGreaterThan(4);
  // the output forms: rates' root output, its producer inside fast/outer, the label at each output port drawn; at the
  // root the pill moves past inner's label, the port above's
  await drop(page, "rates");
  await page.locator('g.block[data-id="⟨out⟩outer"]').click();
  await press(page, "t");
  await expect(page.locator('text.type-label[data-port="fast|out|outer"]')).toHaveCount(1);
  await expectBesidePorts(page, ["fast|out|outer"]);
  expect((await pillByPort(page.locator('g.badge[data-role="route"][data-port="fast|out|outer"]'))).gap, "moved past a label").toBeGreaterThan(4);
  await openPath(page, "fast");
  await expect(page.locator('text.type-label[data-port="fast/outer|out|out"]')).toHaveCount(1);
  await expectBesidePorts(page, ["fast/outer|out|out", "⟨out⟩outer|in|outer"]);
  await shot(page, "rates", "fast", "route-pills");
  // the short pin of 2.1: fast's in, src/out traced
  await drop(page, "rates");
  await page.locator('rect.port[data-port="src|out|out"]').click();
  await press(page, "t");
  await openPath(page, "fast");
  await expect(page.locator('text.type-label[data-port="⟨in⟩in|out|in"]')).toHaveCount(1);
  await expectBesidePorts(page, ["fast/outer|in|in", "⟨in⟩in|out|in"]);
  await shot(page, "rates", "fast", "route-pin");
});

test("rates' fast, outer dragged left of every box: the fit covers the route's pill left of outer's input, as it covers the boxes (the look pass, 1.4)", async ({ page }) => {
  await drop(page, "rates");
  await page.locator('rect.port[data-port="src|out|out"]').click();
  await press(page, "t");
  await openPath(page, "fast");
  const r = (await page.locator('g.block[data-id="fast/outer"] > .shape').boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 10);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 - 600, r.y + 10, { steps: 8 });
  await page.mouse.up();
  await page.locator(".viewport").focus();
  await press(page, "0");
  const pill = page.locator('g.overlay g.badge[data-role="route"][data-port="fast/outer|in|in"]');
  // the case: the pill's left end lies left of every box
  const left = await pill.locator("rect").evaluate((q: SVGRectElement) => q.x.baseVal.value);
  expect(Math.min(...(await blockBoxes(page)).map((b) => b.x))).toBeGreaterThan(left);
  await expect.poll(async () => {
    const [p, v] = await Promise.all([pill.locator("rect").evaluate((q) => q.getBoundingClientRect().left), svg(page).evaluate((e) => e.getBoundingClientRect().left)]);
    return p >= v;
  }).toBe(true);
});

test("primitive: the u tag traced reads 0 consumers across 0 levels, the tag the origin, no casing", async ({ page }) => {
  await drop(page, "primitive");
  await tag(page, "⟨in⟩u").click();
  await press(page, "t");
  await expect(statusRoute(page)).toContainText(plain("tracing `u`: 0 consumers across 0 levels"));
  await expect(tag(page, "⟨in⟩u")).toHaveClass(/\broute-origin\b/);
  await expect(page.locator("path.casing.route")).toHaveCount(0);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(0);
});

test("closed_loop: a route inside pid_controller marks its row and the root's as its ancestor", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "pid_controller");
  await page.locator('rect.port[data-port="pid_controller/h_ctl|out|u"]').click({ button: "right" });
  await page.locator(".viewport div.menu button.trace").click();
  await expect(statusRoute(page)).toContainText(plain("tracing `pid_controller/h_ctl/u`: 1 consumer across 1 level"));
  expect(await routeRows(page)).toEqual(["", "pid_controller"]);
  await expect(page.locator('nav.tree .row[data-path="pid_controller"] span.mark[data-mark="route"]')).toHaveAttribute("title", "on the route");
  await expect(page.locator('nav.tree .row[data-path=""] span.mark[data-mark="route"]')).toHaveAttribute("title", "on the route, beneath");
});
