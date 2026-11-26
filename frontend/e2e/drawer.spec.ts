// The drawer's diagnostics tab (workspace.md answers 6 and 2): one row per
// diagnostic and warning, errors first, with kind, path, message and the type's
// location; the filter; a row's click focusing it and selecting what it names
// on its level; the empty states; the tree's propagated marks; a push dropping
// the focus. Counts from the oracle (`overlay.py`). The drawer's view keys,
// z with h j k l, and Shift-s closing it with the focus; its cursor is cursor.spec.ts's.
// The polish batch: the location under the message, a loop's wires linked to their
// declarations and its presumed members (the oracle `loop_row.py`), and a focused
// diagnostic with nothing on the level dimming nothing.
import { test, type Page } from "@playwright/test";
import { drop, dropOver, expect, expectScrollKeys, fixtureText, press, readyLevel, shot, viewBox, widen } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const rowsOf = (page: Page) => page.locator("section.drawer .tab-body ul.diagnostics > li.diagnostic");
const row = (page: Page, i: number) => page.locator(`li.diagnostic[data-index="${i}"]`);
const svg = (page: Page) => page.locator("svg.canvas");
const treeRow = (page: Page, path: string) => page.locator(`nav.tree .row[data-path="${path}"]`);

test("failure_probe: two rows, error first, the filter, a click focusing and selecting, a second click and Escape clearing", async ({ page }) => {
  await drop(page, "failure_probe");
  const d = JSON.parse(fixtureText("failure_probe")).failure.structure;
  const line = d.types.find((t: any) => t.name === d.nodes.find((n: any) => n.path === "t").type).locations[0].line;
  await expect(rowsOf(page)).toHaveCount(2);
  expect(await rowsOf(page).evaluateAll((ls) => ls.map((l) => [l.getAttribute("data-index"), l.getAttribute("data-severity")]))).toEqual([
    ["0", "error"], ["1", "warning"],
  ]);
  await expect(row(page, 0).locator(".kind")).toHaveText("UserCodeFraming");
  await expect(row(page, 0).locator(".path")).toHaveText("t");
  await expect(row(page, 0).locator("span.message")).toContainText("cause: boom");
  expect(await row(page, 0).locator("a.location").textContent()).toMatch(new RegExp(`:${line}$`));
  await expect(row(page, 1).locator(".path")).toHaveText("s/g");
  await shot(page, "failure_probe", "", "drawer");

  // the filter: kind, path and message, case-insensitive
  const filter = drawer(page).locator("input.filter");
  await expect(filter).toHaveAttribute("placeholder", "Filter by kind, path or message");
  await filter.fill("Empty");
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 1)).toHaveCount(1);
  await filter.fill("s/G");
  await expect(rowsOf(page)).toHaveCount(1);
  await filter.fill("boom");
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 0)).toHaveCount(1);
  await filter.fill("");
  await expect(rowsOf(page)).toHaveCount(2);
  await filter.fill("zzz");
  await expect(rowsOf(page)).toHaveCount(0);
  await expect(drawer(page).locator("p.empty")).toHaveText("No row matches the filter.");
  await filter.fill("");

  // a click focuses the row and selects its node on its level
  await row(page, 0).locator("span.message").click();
  await expect(row(page, 0)).toHaveClass(/\bcurrent\b/);
  await expect(page.locator('g.block.selected[data-id="t"]')).toHaveCount(1);
  await expect(page.locator('aside.detail[data-kind="primitive"]')).toHaveAttribute("data-id", "t");
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await row(page, 1).locator(".kind").click();
  await page.locator(readyLevel("s")).waitFor();
  await expect(page.locator('g.block.selected[data-id="s/g"]')).toHaveCount(1);
  await expect(row(page, 1)).toHaveClass(/\bcurrent\b/);
  await expect(row(page, 0)).not.toHaveClass(/\bcurrent\b/);
  await expect(svg(page)).toHaveAttribute("data-focus", "1");
  // a second click clears the focus and keeps the selection
  await row(page, 1).locator(".kind").click();
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(page.locator('g.block.selected[data-id="s/g"]')).toHaveCount(1);

  // Escape clears the focus before a standing query
  await press(page, "ControlOrMeta+k");
  await page.keyboard.type("h");
  await press(page, "Tab");
  await row(page, 0).locator(".kind").click();
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await press(page, "Escape");
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(page.locator("input.query")).toHaveValue("h");
});

test("failure_nested: the loop's row carries no location and selects its first member, plant, on the root", async ({ page }) => {
  await drop(page, "failure_nested");
  await expect(row(page, 0).locator("a.location")).toHaveCount(0);
  await page.locator('g.block[data-id="ctl"]').dblclick();
  await page.locator(readyLevel("ctl")).waitFor();
  await row(page, 0).locator(".kind").click();
  await page.locator(readyLevel("")).waitFor();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
  await expect(row(page, 0).locator(".path")).toHaveText("plant");
});

test("failure_nested: the loop's row lists each wire under its message, each declared wire linked to its holder's declaration, the structural member presumed", async ({ page }) => {
  await drop(page, "failure_nested");
  const r = row(page, 0);
  const wires = r.locator(".under.loop ul.loop-wires > li.loop-wire");
  expect(await wires.evaluateAll((ls) => ls.map((l) => [l.getAttribute("data-from"), l.getAttribute("data-to")]))).toEqual([
    ["plant/power", "ctl/pi/y"], ["ctl/pi/y", "plant/u"],
  ]);
  // each pair's declared wires, producer first: the holder, its declaring method, the link's line (loop_row.py)
  const hops = await wires.evaluateAll((ls) => ls.map((l) => [...l.querySelectorAll("li.hop")].map((h) =>
    [h.getAttribute("data-level"), h.getAttribute("data-declaration"), h.querySelector("a.declaration")?.textContent?.replace(/^.*:/, "")])));
  // every holder is a Group, whose declaring methods lie in the core's source: no link
  expect(hops).toEqual([
    [["", "local_wires", undefined], ["ctl", "input_wires", undefined]],
    [["ctl", "output_wires", undefined], ["", "local_wires", undefined]],
  ]);
  // the members: plant traced globally, ctl/pi structurally and so presumed
  expect(await r.locator("p.members span.member").evaluateAll((ms) => ms.map((m) => [m.getAttribute("data-path"), m.getAttribute("data-mode"), !!m.querySelector(".presumed")]))).toEqual([
    ["plant", "global", false], ["ctl/pi", "structural", true],
  ]);
  await expect(r.locator(".presumed")).toHaveAttribute("title", /^Traced structurally/);
  // under the message, outside the row's button, and no type location
  await expect(r.locator("a.location")).toHaveCount(0);
  await expect(r.locator("button.row .loop-wires")).toHaveCount(0);
  const [message, under] = [(await r.locator("span.message").boundingBox())!, (await r.locator(".under").boundingBox())!];
  expect(under.y).toBeGreaterThanOrEqual(message.y + message.height - 0.5);
  await drawer(page).evaluate((d) => { d.closest<HTMLElement>(".pane")!.style.height = "320px"; });
  await shot(page, "failure_nested", "", "loop-row");
});

test("failure_probe: a row's location link sits under its message, left-aligned with it", async ({ page }) => {
  await drop(page, "failure_probe");
  const r = row(page, 0);
  const [message, link] = [(await r.locator("span.message").boundingBox())!, (await r.locator("a.location").boundingBox())!];
  expect(link.y).toBeGreaterThanOrEqual(message.y + message.height - 0.5);
  expect(Math.abs(link.x - message.x)).toBeLessThanOrEqual(1);
});

/** failure_nested with ctl of a user type whose output_wires has a location of the user's. */
const userCtl = () => {
  const d = JSON.parse(fixtureText("failure_nested"));
  d.failure.structure.nodes.find((n: any) => n.path === "ctl").type = "Main.User.Ctl";
  d.failure.structure.types.push({ name: "Main.User.Ctl", locations: [{ function: "output_wires", file: "<repo>/ctl.jl", line: 7 }] });
  return JSON.stringify(d);
};

test("failure_nested with ctl of a user type: its output_wires linked, the root's Group wires not", async ({ page }) => {
  await drop(page, "failure_nested", userCtl());
  await expect(row(page, 0).locator("a.declaration")).toHaveCount(1);
  await expect(row(page, 0).locator('li.hop[data-level="ctl"][data-declaration="output_wires"] a.declaration')).toHaveText("<repo>/ctl.jl:7");
  await expect(row(page, 0).locator('li.hop[data-level=""] a.declaration')).toHaveCount(0);
});

test("failure_nested with ctl of a user type: a click on a declaration copies its file label, and leaves the row unfocused", async ({ page, context, browserName }) => {
  test.skip(browserName === "firefox", "clipboard permissions are Chromium's");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await drop(page, "failure_nested", userCtl());
  const link = row(page, 0).locator('li.hop[data-declaration="output_wires"] a.declaration');
  await expect(link).toHaveAttribute("title", "Copy the file label of the wire's declaration, output_wires of ctl");
  const label = (await link.textContent())!;
  await link.click();
  await expect(row(page, 0).locator(".copied")).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(label);
  await expect(row(page, 0)).not.toHaveClass(/\bcurrent\b/);
});

test("failure_probe: the error on t focused, the level s holds none of it and dims nothing, the status bar saying why", async ({ page }) => {
  await drop(page, "failure_probe");
  await row(page, 0).locator(".kind").click();
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await page.locator('g.block[data-id="s"]').dblclick();
  await page.locator(readyLevel("s")).waitFor();
  await expect(row(page, 0)).toHaveClass(/\bcurrent\b/);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(page.locator("svg.canvas .lit")).toHaveCount(0);
  await expect(page.locator("footer.status span.focus-note")).toHaveText("the focused diagnostic has nothing on this level, so nothing dims");
});

test("failure_cycle: the row selects plant", async ({ page }) => {
  await drop(page, "failure_cycle");
  // the row's button, above the wires and members listed under it
  await row(page, 0).locator("button.row").click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
});

test("failure_structure: two rows with no canvas, a click focusing the row alone", async ({ page }) => {
  await drop(page, "failure_structure");
  await expect(rowsOf(page)).toHaveCount(2);
  await expect(row(page, 0).locator(".kind")).toHaveText("UnknownPort");
  await expect(row(page, 0).locator("a.location")).toHaveCount(0);
  await row(page, 1).click();
  await expect(row(page, 1)).toHaveClass(/\bcurrent\b/);
  await expect(svg(page)).toHaveCount(0);
});

test("closed_loop: the tab opened by its button says it is empty", async ({ page }) => {
  await drop(page, "closed_loop");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await drawer(page).locator('button.tab[data-tab="diagnostics"]').click();
  await expect(drawer(page).locator("p.empty")).toHaveText("No diagnostics or warnings.");
  await expect(drawer(page).locator("input.filter")).toHaveCount(0);
});

test("warning: one amber row, g's tree row marked with a warning, the root's beneath", async ({ page }) => {
  await drop(page, "warning");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("1");
  await drawer(page).locator('button.tab[data-tab="diagnostics"]').click();
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 0)).toHaveAttribute("data-severity", "warning");
  await expect(treeRow(page, "g").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  await expect(treeRow(page, "").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
  await expect(page.locator('nav.tree span.mark[data-mark="error"]')).toHaveCount(0);
});

test("failure_probe: the tree's counts, red on the root for one error and one warning, s amber beneath", async ({ page }) => {
  await drop(page, "failure_probe");
  await expect(treeRow(page, "").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error, 1 warning, beneath");
  await expect(treeRow(page, "t").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error");
  await expect(treeRow(page, "s").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
  await treeRow(page, "s").locator("button.chevron").click();
  await expect(treeRow(page, "s/g").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  await expect(treeRow(page, "s/src").locator("span.mark")).toHaveCount(0);
});

test("failure_probe with its error at the root: the root's row red for its own error and the warning, t's row bare", async ({ page }) => {
  const d = JSON.parse(fixtureText("failure_probe"));
  d.failure.diagnostics[0].path = "";
  await drop(page, "failure_probe", JSON.stringify(d));
  await expect(treeRow(page, "").locator('span.mark[data-mark="error"]')).toHaveAttribute("title", "1 error, 1 warning");
  await expect(treeRow(page, "t").locator("span.mark")).toHaveCount(0);
  await expect(treeRow(page, "s").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning, beneath");
});

test("a push drops the focused diagnostic and keeps the drawer open on diagnostics", async ({ page }) => {
  await drop(page, "failure_probe");
  await row(page, 0).click();
  await expect(row(page, 0)).toHaveClass(/\bcurrent\b/);
  await dropOver(page, "closed_loop");
  await expect(drawer(page).locator("li.current")).toHaveCount(0);
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("0");
  await expect(drawer(page).locator("p.empty")).toHaveText("No diagnostics or warnings.");
});

test("large: with the drawer focused, z with j k scrolls its body by the step, with h l sideways; closed, h j k l, the arrows and z with them do nothing; Shift-s closing it moves the focus to the canvas", async ({ page }) => {
  await drop(page, "large");
  const state = async () => ({ view: await viewBox(page), selected: await page.locator("svg.canvas .selected").count(), id: await page.locator("aside.detail").getAttribute("data-id") });
  const tab = page.locator('button.tab[data-tab="order"]');
  await tab.click();
  const body = page.locator("section.drawer .tab-body");
  await widen(body);
  // the strip's empty end: the drawer's root takes the focus
  const strip = (await page.locator("section.drawer .strip").boundingBox())!;
  await page.mouse.click(strip.x + strip.width - 10, strip.y + strip.height / 2);
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
  const before = await state();
  await expectScrollKeys(page, body);
  expect(await state(), "open").toEqual(before);
  // closed by its tab, the tab keeping the focus: nothing to scroll, and the canvas's keys stay out
  await tab.click();
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
  // the canvas grew, its view with it once its size is read back
  await expect.poll(() => svg(page).evaluate((s: SVGSVGElement) => {
    const v = s.viewBox.baseVal;
    const box = s.parentElement!;
    return Math.abs(v.width / v.height - box.clientWidth / box.clientHeight) < 1e-6;
  })).toBe(true);
  const closed = await state();
  for (const key of ["j", "k", "h", "l", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "z", "j", "z", "l", "z", "z", "d", "u", "g", "g", "Shift+G"]) await press(page, key);
  expect(await state(), "closed").toEqual(closed);
  // Shift-s opens it, the focus kept; closing it while it holds the focus moves the focus to the canvas
  await press(page, "Shift+S");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(page.locator("section.drawer.focused")).toHaveCount(1);
  await press(page, "Shift+S");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(page.locator(".viewport.focused")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement?.classList.contains("viewport"))).toBe(true);
  // with the focus elsewhere it stays there
  await page.locator("aside.detail h2").click();
  await press(page, "Shift+S");
  await press(page, "Shift+S");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
});

// deployment_overlay.md answer 4: a deployment's own warnings after its build's, under the same rules
test("timing_deployment: its own GridUtilization the one amber row, counted, the drawer closed, the root's tree row marked, the message whole", async ({ page }) => {
  await drop(page, "timing_deployment");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("1");
  await drawer(page).locator('button.tab[data-tab="diagnostics"]').click();
  await expect(rowsOf(page)).toHaveCount(1);
  await expect(row(page, 0)).toHaveAttribute("data-severity", "warning");
  await expect(row(page, 0).locator(".kind")).toHaveText("GridUtilization");
  await expect(treeRow(page, "").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  // the message's ten lines stand whole, each on its own line
  const text = await row(page, 0).locator("span.message").innerText();
  expect(text.split("\n")).toHaveLength(10);
  expect(text).toContain("declaring 0//1 or 1//50 keeps 1//50");
  await shot(page, "timing_deployment", "", "drawer-deployment-warning");
});

test("timing_deployment with its warning moved to fast: fast amber on the canvas and in the tree", async ({ page }) => {
  const d = JSON.parse(fixtureText("timing_deployment"));
  d.deployment.warnings[0].path = "fast";
  await drop(page, "timing_deployment", JSON.stringify(d));
  await expect(page.locator('rect.mark-halo[data-id="fast"][data-severity="warning"]')).toHaveCount(1);
  await expect(treeRow(page, "fast").locator('span.mark[data-mark="warning"]')).toHaveAttribute("title", "1 warning");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
});
