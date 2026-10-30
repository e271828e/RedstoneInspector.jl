// The detail pane (workspace.md answer 4): each layout read field by field on
// closed_loop, the links and face rows that select, the copy button; rates' scope
// line and containers' folder keys.
import { test, type Page } from "@playwright/test";
import { clickWire, drop, expect, openPath, readyLevel, shot } from "./fixtures";

const pane = (page: Page) => page.locator("aside.detail");
const faceRow = (page: Page, port: string) => pane(page).locator(`table.faces tr[data-port="${port}"]`);
const link = (page: Page, cls: "producer" | "consumer", path: string, port: string) =>
  pane(page).locator(`a.${cls}[data-path="${path}"][data-port="${port}"]`);

test.describe("closed_loop", () => {
  test.beforeEach(async ({ page }) => {
    await drop(page, "closed_loop");
  });

  test("the level layout at load", async ({ page }) => {
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
    await expect(pane(page)).toHaveAttribute("data-id", "");
    await expect(pane(page).locator("h2 .segment")).toHaveText("closed_loop");
    await expect(pane(page).locator("h2 .name")).toHaveText("Group");
    await expect(pane(page).locator(".path")).toHaveText("/");
    await expect(pane(page).locator(".facts")).toContainText("6 children");
    await expect(pane(page).locator(".facts")).toContainText("30 wires");
    await expect(pane(page).locator("table.faces tr.in .face-name")).toHaveText(["h_ref", "V_ref", "mode"]);
    await expect(pane(page).locator("table.faces tr.out")).toHaveCount(0);
  });

  test("plant: the leaf layout", async ({ page }) => {
    await page.locator('g.block[data-id="plant"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "leaf");
    await expect(pane(page)).toHaveAttribute("data-id", "plant");
    await expect(pane(page).locator("h2 .segment")).toHaveText("plant");
    await expect(pane(page).locator("h2 .name")).toHaveText("Longitudinal");
    await expect(pane(page).locator(".path")).toHaveText("plant");
    const facts = pane(page).locator(".facts");
    for (const t of ["leaf", "continuous", "the base grid, m 1, c 0", "transparent in field children, key plant"]) {
      await expect(facts).toContainText(t);
    }
    await expect(pane(page).locator(".alias")).toHaveCount(0);
    await expect(pane(page).locator(".type")).toHaveText("RedstoneExamples.Longitudinal");
    await expect(pane(page).locator("details.signature")).toHaveCount(0);
    await expect(pane(page).locator(".parameters tr")).toHaveCount(14);
    await expect(pane(page).locator(".locations li")).toHaveCount(3);
    const docstring = pane(page).locator("details.docstring");
    await expect(docstring).toHaveCount(1);
    await expect(docstring).not.toHaveAttribute("open");
    // raw textContent: the summary is the first non-empty line without its leading spaces
    const doc = (await docstring.locator("pre.docstring").textContent())!;
    const summary = (await docstring.locator("summary").textContent())!;
    expect(summary).toMatch(/^Longitudinal\(/);
    expect(summary).toBe(doc.split("\n").find((l) => l.trim())!.trimStart());
    await expect(pane(page).locator("table.faces tr.in .face-name")).toHaveText(["δe", "δt"]);
    await expect(pane(page).locator("table.faces tr.out .face-name")).toHaveText(["V", "γ", "θ", "q", "h", "α"]);
    await expect(pane(page).locator("table.faces tr[data-port] .face-type")).toHaveText(Array(8).fill("Float64"));
    await expect(pane(page).locator("table.faces tr[data-port] .face-kind")).toHaveText(Array(8).fill("float"));
    await expect(pane(page).locator("table.faces tr.out .stage")).toHaveText(Array(6).fill("1"));
    await expect(faceRow(page, "plant|out|V").locator(".stage")).toHaveText("1");
    await expect(faceRow(page, "plant|in|δe").locator("a.producer")).toHaveCount(1);
    await expect(link(page, "producer", "actuators/δe_lag", "y")).toHaveCount(1);
    await expect(link(page, "producer", "actuators/δt_lag", "y")).toHaveCount(1);
    const h = faceRow(page, "plant|out|h").locator("a.consumer");
    await expect(h).toHaveCount(2);
    await expect(faceRow(page, "plant|out|h").locator('a.consumer[data-path="sensing/altimeter"][data-port="in1"]')).toHaveCount(1);
    await expect(faceRow(page, "plant|out|h").locator('a.consumer[data-path="lqr_controller/state_pack"][data-port="in5"]')).toHaveCount(1);
    await expect(faceRow(page, "plant|out|α").locator("a.consumer")).toHaveCount(0);
    await shot(page, "closed_loop", "", "detail-leaf");
    await docstring.locator("summary").click();
    await expect(docstring).toHaveAttribute("open");
    await expect(docstring.locator("pre.docstring")).toBeVisible();
  });

  test("a consumer link selects that port on its level", async ({ page }) => {
    await page.locator('g.block[data-id="plant"]').click();
    await link(page, "consumer", "sensing/altimeter", "in1").click();
    await page.locator(readyLevel("sensing")).waitFor();
    await expect(page.locator('rect.port.selected[data-port="sensing/altimeter|in|in1"]')).toHaveCount(1);
    await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
    await expect(link(page, "producer", "plant", "h")).toHaveCount(1);
  });

  test("a producer link selects that port on its level", async ({ page }) => {
    await openPath(page, "sensing");
    await page.locator('g.block[data-id="sensing/altimeter"]').click();
    await link(page, "producer", "plant", "h").click();
    await page.locator(readyLevel("")).waitFor();
    await expect(page.locator('rect.port.selected[data-port="plant|out|h"]')).toHaveCount(1);
    await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
  });

  test("sensing/altimeter: the alias against the type", async ({ page }) => {
    await openPath(page, "sensing");
    await page.locator('g.block[data-id="sensing/altimeter"]').click();
    await expect(pane(page).locator("h2 .name")).toHaveText("SumJunction");
    await expect(pane(page).locator(".alias")).toHaveText("Redstone.Blocks.SumJunction");
    await expect(pane(page).locator(".type")).toHaveText("Redstone.Blocks.Junction");
    const signature = pane(page).locator("details.signature");
    await expect(signature).not.toHaveAttribute("open");
    await expect(signature.locator("code")).toHaveText("Redstone.Blocks.Junction{Float64, Float64, 2, typeof(+)}");
    await expect(faceRow(page, "sensing/altimeter|in|in1").locator('a.producer[data-path="plant"][data-port="h"]')).toHaveCount(1);
  });

  test("sensing: the closed assembly layout and its open button", async ({ page }) => {
    await openPath(page, "sensing");
    await page.keyboard.press("Backspace");
    await page.locator(readyLevel("")).waitFor();
    await page.locator('g.block[data-id="sensing"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "assembly");
    await expect(pane(page).locator("h2 .name")).toHaveText("Group");
    await expect(pane(page).locator(".facts")).toContainText("2 children");
    await expect(pane(page).locator(".facts")).not.toContainText("continuous");
    await expect(pane(page).locator("table.faces tr.in .face-name")).toHaveText(["h"]);
    await expect(pane(page).locator("table.faces tr.out .face-name")).toHaveText(["h_meas"]);
    await expect(pane(page).locator("table.faces .stage")).toHaveCount(0);
    await pane(page).locator("button.open-level").click();
    await page.locator(readyLevel("sensing")).waitFor();
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
  });

  test("the root wire into sensing|in|h: the wire layout", async ({ page }) => {
    await clickWire(page, "sensing|in|h");
    await expect(pane(page)).toHaveAttribute("data-kind", "wire");
    await expect(pane(page)).toHaveAttribute("data-id", "sensing|in|h");
    await expect(pane(page).locator(".endpoints")).toContainText("plant/h");
    await expect(pane(page).locator(".endpoints")).toContainText("sensing/h");
    await expect(pane(page).locator("a.producer")).toHaveCount(1);
    await expect(link(page, "producer", "plant", "h")).toHaveCount(1);
    await expect(pane(page).locator("a.consumer")).toHaveCount(1);
    await expect(link(page, "consumer", "sensing/altimeter", "in1")).toHaveCount(1);
    await expect(pane(page).locator(".type")).toContainText("Float64");
    await expect(pane(page).locator(".type")).toContainText("float");
    await expect(pane(page).locator(".facts")).toContainText("level /");
    await shot(page, "closed_loop", "", "detail-wire");
  });

  test("the pin h_ref: the pin layout with its two consumers", async ({ page }) => {
    await page.locator('g.block[data-id="⟨in⟩h_ref"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "pin");
    await expect(pane(page).locator(".type")).toContainText("Float64");
    await expect(pane(page).locator(".type")).toContainText("float");
    await expect(pane(page).locator(".facts")).toContainText("not pinned");
    await expect(pane(page).locator(".root-input")).toContainText("h_ref");
    await expect(pane(page).locator("a.consumer")).toHaveCount(2);
    await expect(link(page, "consumer", "pid_controller/h_ctl", "r")).toHaveCount(1);
    await expect(link(page, "consumer", "lqr_controller/z_ref_pack", "in1")).toHaveCount(1);
  });

  test("a face row selects its port on the canvas", async ({ page }) => {
    await page.locator('g.block[data-id="plant"]').click();
    // on the name cell: the row's middle may be a consumer link
    await faceRow(page, "plant|out|V").locator(".face-name").click();
    await expect(page.locator('rect.port.selected[data-port="plant|out|V"]')).toHaveCount(1);
    await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
    await expect(pane(page).locator(".facts")).toHaveText("port · stage 1 · not pinned");
  });

  test("the copy button writes the path to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('g.block[data-id="plant"]').click();
    await pane(page).locator("button.copy").click();
    await expect(pane(page).locator("button.copy")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("plant");
  });

  test("a location click writes its file label to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('g.block[data-id="plant"]').click();
    const first = pane(page).locator(".locations li").first();
    const label = (await first.locator(".file").textContent())!;
    await first.locator("button.location").click();
    await expect(first.locator(".copied")).toHaveCount(1);
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toMatch(/:\d+$/);
    expect(text).toContain(label);
  });

  test("lqr_controller/tracker: the long face types wrap, the pane does not scroll sideways", async ({ page }) => {
    await openPath(page, "lqr_controller");
    await page.locator('g.block[data-id="lqr_controller/tracker"]').click();
    await expect(pane(page)).toHaveAttribute("data-id", "lqr_controller/tracker");
    const body = page.locator('.pane[data-pane="detail"] .body');
    const widths = () => body.evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
    const wide = await widths();
    expect(wide.scroll).toBe(wide.client);
    // The same at the pane's narrowest width, through the stored prefs, so the fonts of the machine decide nothing.
    await page.evaluate(() => localStorage.setItem("redstone-inspector/prefs",
      JSON.stringify({ version: 1, sizes: { tree: 280, detail: 240, drawer: 200 }, collapsed: { tree: false, detail: false } })));
    await drop(page, "closed_loop");
    await openPath(page, "lqr_controller");
    await page.locator('g.block[data-id="lqr_controller/tracker"]').click();
    await expect(pane(page)).toHaveAttribute("data-id", "lqr_controller/tracker");
    const narrow = await widths();
    expect(narrow.client).toBeLessThan(wide.client);
    expect(narrow.scroll).toBe(narrow.client);
  });
});

test("rates: level fast's scope line", async ({ page }) => {
  await drop(page, "rates");
  await openPath(page, "fast");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  const scopes = pane(page).locator(".scopes li");
  await expect(scopes).toHaveCount(1);
  for (const t of ["fast", "anchor fast", "T 1/50", "m 1"]) await expect(scopes).toContainText(t);
});

test("containers: the folder's keys select their nodes", async ({ page }) => {
  await drop(page, "containers");
  await page.locator('nav.tree .row[data-path="gains"]').click();
  await expect(pane(page).locator(".keys a")).toHaveText(["a", "b"]);
  await pane(page).locator('.keys a[data-path="gains/a"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "leaf");
  await expect(pane(page)).toHaveAttribute("data-id", "gains/a");
  await expect(pane(page).locator("details.signature")).toHaveCount(0);
  await expect(page.locator('nav.tree .row.selected[data-path="gains/a"]')).toHaveCount(1);
  await expect(page.locator('g.block.selected[data-id="gains/a"]')).toHaveCount(1);
});

test("the level facts count in the singular: aircraft's one child, kinds' one wire", async ({ page }) => {
  await drop(page, "aircraft");
  await expect(pane(page).locator(".facts")).toHaveText("open level · 1 child · 2 wires");
  await drop(page, "kinds");
  await expect(pane(page).locator(".facts")).toHaveText("open level · 9 children · 1 wire");
});
