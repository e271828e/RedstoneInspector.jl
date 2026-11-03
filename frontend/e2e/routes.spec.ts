// Face routes (workspace.md answers 8, 11, 9 and 3, visual_grammar.md answer 9):
// started by `t`, the pane's trace button or the canvas's right-click menu, drawn
// as casings with the origin's halo, the terminal ports marked and a badge on each
// child entered and each pin crossed, the level dimmed, the status bar naming it;
// it survives navigation and selection, clears on Escape, the trace repeated or
// the clear control. Counts from the oracle (`overlay.py`'s `routes`); geometry
// read off the DOM.
import { test, type Page } from "@playwright/test";
import { blockBoxes, drop, expect, press, readyLevel, shot, wirePoint } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const pane = (page: Page) => page.locator("aside.detail");
const statusRoute = (page: Page) => page.locator("footer.status span.route");
const routeBadge = (page: Page, id: string) => page.locator(`g.overlay g.badge[data-role="route"][data-id="${id}"]`);
const casings = (page: Page) => page.locator("g.casings path.casing.route").evaluateAll((ps) => ps.map((p) => p.getAttribute("data-wire")).sort());
const opacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
const tag = (page: Page, id: string) => page.locator(`g.block[data-id="${id}"]`);
/** The status line as text, the backquotes of the oracle's spelling dropped. */
const plain = (s: string) => s.replaceAll("`", "");
/** A badge's pill in level units, beside its block's or pin's box. */
async function badgeGeometry(page: Page, id: string) {
  const rect = await routeBadge(page, id).locator("rect").evaluate((r: SVGRectElement) => ({ x: r.x.baseVal.value, y: r.y.baseVal.value, width: r.width.baseVal.value, height: r.height.baseVal.value }));
  const box = (await blockBoxes(page)).find((b) => b.id === id)!;
  return { rect, box };
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
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(2);
  for (const id of ["pid_controller", "lqr_controller"]) await expect(routeBadge(page, id).locator("text.badge-text")).toHaveText("route");
  await expect(page.locator('rect.port.route-terminal')).toHaveCount(1);
  await expect(page.locator('rect.port.route-terminal[data-port="⟨in⟩h_ref|out|h_ref"]')).toHaveCount(1);
  expect(await opacity(page, 'g.block[data-id="plant"] > .shape')).toBe("0.3");
  expect(await opacity(page, 'g.block[data-id="pid_controller"] > .shape')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="pid_controller|in|h_ref"]')).toBe("1");
  expect(await opacity(page, 'path.wire[data-wire="sensing|in|h"]')).toBe("0.3");
  expect(await opacity(page, 'g.badge[data-id="pid_controller"]')).toBe("1");
  await expect(statusRoute(page)).toContainText(plain("tracing `h_ref`: 2 consumers across 3 levels"));
  await expect(statusRoute(page).locator("code")).toHaveText("h_ref");
  await expect(statusRoute(page).locator("button.clear-route")).toHaveText("clear");
  // a child's badge straddles its bottom edge at the right
  {
    const { rect, box } = await badgeGeometry(page, "pid_controller");
    expect(rect.y).toBeLessThan(box.y + box.height);
    expect(rect.y + rect.height).toBeGreaterThan(box.y + box.height);
    expect(rect.x + rect.width).toBeLessThanOrEqual(box.x + box.width);
    expect(rect.x + rect.width).toBeGreaterThan(box.x + box.width / 2);
  }
  await expect(pane(page).locator("button.trace")).toHaveAttribute("aria-pressed", "true");
  await expect(pane(page).locator("button.trace")).toHaveAttribute("title", "Clear the route");
  await shot(page, "closed_loop", "", "routes");

  // pid_controller's badge opens it: one casing, the terminal, the pin badged at its top outer end
  await routeBadge(page, "pid_controller").click();
  await page.locator(readyLevel("pid_controller")).waitFor();
  expect(await casings(page)).toEqual(["pid_controller/h_ctl|in|r"]);
  await expect(page.locator('rect.port.route-terminal[data-port="pid_controller/h_ctl|in|r"]')).toHaveCount(1);
  await expect(page.locator('g.badge[data-role="route"]')).toHaveCount(1);
  await expect(routeBadge(page, "⟨in⟩h_ref").locator("text.badge-text")).toHaveText("route");
  await expect(routeBadge(page, "⟨in⟩h_ref").locator("title")).toHaveText("The route leaves this level here; go to the parent to follow it.");
  {
    const { rect, box } = await badgeGeometry(page, "⟨in⟩h_ref");
    expect(rect.y).toBeLessThan(box.y);
    expect(rect.y + rect.height).toBeGreaterThan(box.y);
    expect(rect.x).toBeGreaterThanOrEqual(box.x);
    expect(rect.x).toBeLessThan(box.x + box.width / 2);
  }
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
