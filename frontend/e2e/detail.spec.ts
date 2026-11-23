// The detail pane (workspace.md answer 4): each layout read field by field on
// closed_loop, the labelled facts with their titles, the open button beside the copy
// button, the links and face rows that select, the copy button; rates' scope line and
// rate row, containers' folder keys and keyed member; the narrow pane's stacked rows;
// the docstring rendered from Markdown with the `@ref` link rule (build_release.md
// answer 7), its code blocks scrolling sideways (the look pass's 3.2), a hostile
// source's HTML, image and script link inert; the open level in the assembly
// layout (answer 4 as amended by the look pass's 3.5), "open level" where a closed
// assembly has its Open button, its wires among the facts and its rate scopes after
// the locations (the second look's 3.1 and 3.2); pinning stated on a primitive's own
// face alone (3.4); a location's file name kept whole with its line number (3.5);
// the pane's own keys, h j k l and the arrows scrolling it (increment 8b); a primitive
// root's "open level" mark (answer 4 as amended by the polish batch).
import { test, type Page } from "@playwright/test";
import { clickWire, drop, expect, expectScrollKeys, fixtureText, openPath, paneRing, press, readyLevel, shot, viewBox, widen } from "./fixtures";

/** The docs constant of `src/lib/docstring.ts`, read back by the check. */
const DOCS_URL = "https://e271828e.github.io/Redstone.jl/dev/";

const pane = (page: Page) => page.locator("aside.detail");
const faceRow = (page: Page, port: string) => pane(page).locator(`table.faces tr[data-port="${port}"]`);
const link = (page: Page, cls: "producer" | "consumer", path: string, port: string) =>
  pane(page).locator(`a.${cls}[data-path="${path}"][data-port="${port}"]`);
const fact = (page: Page, name: string) => pane(page).locator(`dl.facts dd[data-fact="${name}"]`);
/** The facts list's labels in order, and that each carries a one-sentence hover title. */
async function expectLabels(page: Page, labels: string[]) {
  const dts = pane(page).locator("dl.facts dt");
  await expect(dts).toHaveText(labels);
  for (const t of await dts.evaluateAll((els) => els.map((e) => e.getAttribute("title") ?? ""))) expect(t).toMatch(/^[A-Z].+\.$/);
}

test.describe("closed_loop", () => {
  test.beforeEach(async ({ page }) => {
    await drop(page, "closed_loop");
  });

  test("at load the pane shows the root level: its label, display name, path, the open level's mark, its counts and the root inputs as faces", async ({ page }) => {
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
    await expect(pane(page)).toHaveAttribute("data-id", "");
    await expect(pane(page).locator("h2 .segment")).toHaveText("closed_loop");
    await expect(pane(page).locator("h2 .name")).toHaveText("Group");
    await expect(pane(page).locator(".path")).toHaveText("/");
    await expect(pane(page).locator(".path-line button.copy + span.level-mark")).toHaveText("open level");
    await expect(pane(page).locator("p.facts")).toHaveCount(0);
    await expect(pane(page).locator('dl.facts dd[data-fact="children"] ~ dd[data-fact="wires"]')).toHaveCount(1);
    await expect(fact(page, "children")).toHaveText("6");
    await expect(fact(page, "wires")).toHaveText("30");
    await expect(pane(page).locator("table.faces tr.in .face-name")).toHaveText(["h_ref", "V_ref", "mode"]);
    await expect(pane(page).locator("table.faces tr.out")).toHaveCount(0);
  });

  test("the open level takes the assembly layout: the mark where the open button stands, the root's facts with its wires, docstring, locations and parameters", async ({ page }) => {
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
    await expect(pane(page)).toHaveAttribute("data-id", "");
    await expect(pane(page).locator("button.open-level")).toHaveCount(0);
    await expect(pane(page).locator(".path-line button.copy + span.level-mark")).toHaveCount(1);
    await expect(pane(page).locator("p.facts")).toHaveCount(0);
    await expectLabels(page, ["type", "class", "children", "wires"]);
    await expect(fact(page, "type").locator(".type")).toHaveText("Redstone.Group");
    await expect(fact(page, "class")).toHaveText("assembly");
    await expect(fact(page, "children")).toHaveText("6");
    await expect(fact(page, "wires")).toHaveText("30");
    await expect(pane(page).locator("details.signature")).toHaveCount(1);
    await expect(pane(page).locator("details.docstring div.docstring")).toHaveCount(1);
    await expect(pane(page).locator(".locations li")).toHaveCount(5);
    await expect(pane(page).locator(".parameters tr")).toHaveCount(4);
    // the mark in the header, then the assembly's facts, signature, docstring, locations, parameters and faces
    const order = await pane(page).evaluate((aside) => ["span.level-mark", "dl.facts", "details.signature", "details.docstring", ".locations", ".parameters", "table.faces"]
      .map((s) => [...aside.querySelectorAll("*")].indexOf(aside.querySelector(s)!)));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // the faces carry the assembly layout's links column; a root input has no producer to name
    await expect(pane(page).locator("table.faces td.links")).toHaveCount(3);
    await expect(pane(page).locator("table.faces a.producer")).toHaveCount(0);
    await shot(page, "closed_loop", "", "detail-level");
  });

  test("inside pid_controller with nothing selected, a face row selects the level's pin and the row links its producer", async ({ page }) => {
    await openPath(page, "pid_controller");
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
    await expect(pane(page)).toHaveAttribute("data-id", "pid_controller");
    await expect(pane(page).locator("h2 .segment")).toHaveText("pid_controller");
    await expect(fact(page, "member")).toHaveText("transparent container children, key pid_controller");
    await expect(faceRow(page, "pid_controller|in|h_ref").locator('a.producer[data-path=""][data-port="h_ref"]')).toHaveCount(1);
    await faceRow(page, "pid_controller|in|h_ref").locator(".face-name").click();
    await expect(page.locator('svg.canvas g.block.selected[data-id="⟨in⟩h_ref"]')).toHaveCount(1);
    await expect(page.locator(readyLevel("pid_controller"))).toHaveCount(1);
    await expect(pane(page)).toHaveAttribute("data-kind", "pin");
  });

  test("plant: the primitive layout's header, facts without a rate row, closed docstring, parameters, locations, and faces with stages and links", async ({ page }) => {
    await page.locator('g.block[data-id="plant"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "primitive");
    await expect(pane(page)).toHaveAttribute("data-id", "plant");
    await expect(pane(page).locator("h2 .segment")).toHaveText("plant");
    await expect(pane(page).locator("h2 .name")).toHaveText("Longitudinal");
    await expect(pane(page).locator(".path")).toHaveText("plant");
    // the labelled facts: a continuous primitive has no rate row
    await expectLabels(page, ["type", "class", "member"]);
    await expect(fact(page, "class")).toHaveText("primitive, continuous");
    await expect(fact(page, "rate")).toHaveCount(0);
    await expect(fact(page, "member")).toHaveText("transparent container children, key plant");
    await expect(fact(page, "member")).toHaveAttribute("title", /^Transparent: /);
    await expect(pane(page).locator(".alias")).toHaveCount(0);
    await expect(fact(page, "type").locator(".type")).toHaveText("RedstoneExamples.Longitudinal");
    await expect(pane(page).locator("button.open-level")).toHaveCount(0);
    await expect(pane(page).locator("details.signature")).toHaveCount(0);
    await expect(pane(page).locator(".parameters tr")).toHaveCount(14);
    await expect(pane(page).locator(".locations li")).toHaveCount(3);
    const docstring = pane(page).locator("details.docstring");
    await expect(docstring).toHaveCount(1);
    await expect(docstring).not.toHaveAttribute("open");
    // the summary: the title alone, the call form left to the body
    await expect(docstring.locator("summary")).toHaveText("docstring");
    await expect(docstring.locator("summary .title")).toHaveText("docstring");
    await expect(docstring.locator("div.docstring")).toContainText("Longitudinal(");
    await expect(docstring.locator("div.docstring a")).toHaveCount(0);
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
    await shot(page, "closed_loop", "", "detail-primitive");
    await docstring.locator("summary").click();
    await expect(docstring).toHaveAttribute("open");
    await expect(docstring.locator("div.docstring")).toBeVisible();
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
    await expect(fact(page, "type").locator(".alias")).toHaveText("Redstone.Library.SumJunction");
    await expect(fact(page, "type").locator(".type")).toHaveText("Redstone.Library.Junction");
    const signature = pane(page).locator("details.signature");
    await expect(signature).not.toHaveAttribute("open");
    await expect(signature.locator("summary")).toHaveText("signature");
    // below the header: the facts, the signature, the docstring, the locations
    const order = await pane(page).evaluate((aside) => ["dl.facts", "details.signature", "details.docstring", ".locations"]
      .map((s) => [...aside.querySelectorAll("*")].indexOf(aside.querySelector(s)!)));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    await expect(signature.locator("code")).toHaveText("Redstone.Library.Junction{Float64, Float64, 2, typeof(+)}");
    await expect(faceRow(page, "sensing/altimeter|in|in1").locator('a.producer[data-path="plant"][data-port="h"]')).toHaveCount(1);
  });

  test("sensing: the closed assembly layout and its open button", async ({ page }) => {
    await openPath(page, "sensing");
    await page.keyboard.press("Backspace");
    await page.locator(readyLevel("")).waitFor();
    await page.locator('g.block[data-id="sensing"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "assembly");
    await expect(pane(page).locator("h2 .name")).toHaveText("Group");
    await expectLabels(page, ["type", "class", "children", "wires", "member"]);
    await expect(fact(page, "class")).toHaveText("assembly");
    await expect(fact(page, "children")).toHaveText("2");
    await expect(fact(page, "wires")).toHaveText("3");
    await expect(pane(page).locator('dl.facts dt:text-is("wires")')).toHaveAttribute("title", "How many wires the assembly declares on its own level.");
    // the open button stands beside the copy button on the path line, and no mark
    await expect(pane(page).locator(".path-line button.copy + button.open-level")).toHaveCount(1);
    await expect(pane(page).locator("span.level-mark")).toHaveCount(0);
    await expect(pane(page).locator("table.faces tr.in .face-name")).toHaveText(["h"]);
    await expect(pane(page).locator("table.faces tr.out .face-name")).toHaveText(["h_meas"]);
    await expect(pane(page).locator("table.faces .stage")).toHaveCount(0);
    await pane(page).locator("button.open-level").click();
    await page.locator(readyLevel("sensing")).waitFor();
    await expect(pane(page)).toHaveAttribute("data-kind", "level");
  });

  test("pid_controller/q_ctl: a discrete primitive's rate row, its timing in the title", async ({ page }) => {
    await openPath(page, "pid_controller");
    await page.locator('g.block[data-id="pid_controller/q_ctl"]').click();
    await expectLabels(page, ["type", "class", "rate", "member"]);
    await expect(fact(page, "class")).toHaveText("primitive, discrete");
    await expect(fact(page, "rate")).toHaveText("every tick of q_ctl, 1/50 s");
    await expect(fact(page, "rate")).toHaveAttribute("title", "anchor q_ctl (T 1/50 s, tau 0/1 s), m 1, c 0");
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

  test("pinning on a primitive's own face alone: the root's pin h_ref, the port θ on pid_controller and the pin h_ref inside it say nothing; free's y and plant's V say so", async ({ page }) => {
    await page.locator('g.block[data-id="⟨in⟩h_ref"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "pin");
    await expect(pane(page).locator(".type")).toContainText("Float64");
    await expect(pane(page).locator(".type")).toContainText("float");
    await expect(pane(page).locator("p.facts")).toHaveCount(0);
    await expect(pane(page).locator(".root-input")).toHaveText("root input: h_ref Float64");
    await expect(pane(page)).not.toContainText(/pinned/i);
    await expect(pane(page).locator("a.consumer")).toHaveCount(2);
    await expect(link(page, "consumer", "pid_controller/h_ctl", "r")).toHaveCount(1);
    await expect(link(page, "consumer", "lqr_controller/z_ref_pack", "in1")).toHaveCount(1);
    // a closed assembly's port, fed by plant's output
    await page.locator('rect.port[data-port="pid_controller|in|θ"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
    await expect(pane(page)).toHaveAttribute("data-id", "pid_controller|in|θ");
    await expect(pane(page).locator("p.facts")).toHaveCount(0);
    await expect(pane(page)).not.toContainText(/pinned/i);
    // the level's pin inside it, fed by the root input
    await openPath(page, "pid_controller");
    await page.locator('g.block[data-id="⟨in⟩h_ref"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "pin");
    await expect(pane(page)).toHaveAttribute("data-id", "⟨in⟩h_ref");
    await expect(pane(page).locator("p.facts")).toHaveCount(0);
    await expect(pane(page)).not.toContainText(/pinned/i);
    // a primitive's own output, pinned, with its stage and no kind word
    await page.locator('rect.port[data-port="pid_controller/free|out|y"]').click();
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
    await expect(pane(page).locator("p.facts")).toHaveText("stage 1 · pinned");
  });

  test("a face row selects its port on the canvas", async ({ page }) => {
    await page.locator('g.block[data-id="plant"]').click();
    // on the name cell: the row's middle may be a consumer link
    await faceRow(page, "plant|out|V").locator(".face-name").click();
    await expect(page.locator('rect.port.selected[data-port="plant|out|V"]')).toHaveCount(1);
    await expect(page.locator("svg.canvas .selected")).toHaveCount(1);
    await expect(pane(page)).toHaveAttribute("data-kind", "port");
    await expect(pane(page).locator("p.facts")).toHaveText("stage 1 · not pinned");
  });

  test("the copy button writes the path to the clipboard", async ({ page, context, browserName }) => {
    test.skip(browserName === "firefox", "clipboard permissions are Chromium's");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator('g.block[data-id="plant"]').click();
    await pane(page).locator("button.copy").click();
    await expect(pane(page).locator("button.copy")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("plant");
  });

  test("a location click writes its file label to the clipboard", async ({ page, context, browserName }) => {
    test.skip(browserName === "firefox", "clipboard permissions are Chromium's");
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

test("rates: level fast's scope line, its heading after the locations and before the parameters", async ({ page }) => {
  await drop(page, "rates");
  await openPath(page, "fast");
  await expect(pane(page)).toHaveAttribute("data-kind", "level");
  const scopes = pane(page).locator(".scopes li");
  await expect(scopes).toHaveCount(1);
  const heads = await pane(page).evaluate((aside) => {
    const all = [...aside.querySelectorAll("*")];
    const h3 = (t: string) => all.findIndex((e) => e.tagName === "H3" && e.textContent === t);
    return { locations: all.indexOf(aside.querySelector("ul.locations")!), scopes: h3("Rate scopes"), parameters: h3("Parameters"), list: all.indexOf(aside.querySelector("ul.scopes")!) };
  });
  expect(heads.locations).toBeGreaterThanOrEqual(0);
  expect(heads.scopes).toBeGreaterThan(heads.locations);
  expect(heads.list).toBeGreaterThan(heads.scopes);
  expect(heads.parameters).toBeGreaterThan(heads.list);
  for (const t of ["fast", "anchor fast", "T 1/50", "m 1"]) await expect(scopes).toContainText(t);
  await page.locator('g.block[data-id="fast/outer"]').dblclick();
  await page.locator(readyLevel("fast/outer")).waitFor();
  await page.locator('g.block[data-id="fast/outer/hold"]').click();
  await expect(fact(page, "rate")).toHaveText("every 2nd tick of fast, 1/50 s");
});

test("containers: the folder's keys select their nodes", async ({ page }) => {
  await drop(page, "containers");
  await page.locator('nav.tree .row[data-path="gains"]').click();
  await expect(pane(page).locator(".keys a")).toHaveText(["a", "b"]);
  await pane(page).locator('.keys a[data-path="gains/a"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "primitive");
  await expect(pane(page)).toHaveAttribute("data-id", "gains/a");
  await expect(pane(page).locator("details.signature")).toHaveCount(0);
  await expect(page.locator('nav.tree .row.selected[data-path="gains/a"]')).toHaveCount(1);
  await expect(page.locator('g.block.selected[data-id="gains/a"]')).toHaveCount(1);
  await expect(fact(page, "member")).toHaveText("keyed container gains, key a");
  await expect(fact(page, "member")).toHaveAttribute("title", /^Keyed: /);
});

/** The client boxes of a row's cells, by class. */
const cells = (page: Page, row: string, classes: string[]) => pane(page).locator(row).first().evaluate((tr, classes) =>
  Object.fromEntries(classes.map((c) => {
    const r = tr.querySelector(`.${c}`)!.getBoundingClientRect();
    return [c, { left: r.left, top: r.top, bottom: r.bottom, width: r.width }];
  })), classes);
/** Stores the detail pane's width in the prefs and drops closed_loop with plant selected. */
async function plantAt(page: Page, detail: number) {
  await drop(page, "closed_loop");
  await page.evaluate((detail) => localStorage.setItem("redstone-inspector/prefs",
    JSON.stringify({ version: 1, sizes: { tree: 280, detail, drawer: 200 }, collapsed: { tree: false, detail: false } })), detail);
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').click();
  await expect(pane(page)).toHaveAttribute("data-id", "plant");
}

test("a narrow pane stacks each parameter's summary under its name and each face's facts; a wide one keeps the rows", async ({ page }) => {
  await plantAt(page, 240);
  const width = await pane(page).locator("table.parameters").evaluate((t) => t.getBoundingClientRect().width);
  const p = await cells(page, "table.parameters tr", ["param-name", "param-value"]);
  expect(p["param-value"].top).toBeGreaterThanOrEqual(p["param-name"].bottom - 1);
  for (const c of ["param-name", "param-value"]) expect(p[c].width, c).toBeGreaterThan(width - 2);
  const f = await cells(page, 'table.faces tr[data-port="plant|out|V"]', ["face-name", "face-kind", "face-type", "stage", "links"]);
  expect(Math.abs(f["face-kind"].top - f["face-name"].top)).toBeLessThan(2);
  expect(f["face-kind"].left).toBeGreaterThan(f["face-name"].left);
  expect(f["face-type"].top).toBeGreaterThanOrEqual(f["face-name"].bottom - 1);
  for (const c of ["stage", "links"]) expect(f[c].top, c).toBeGreaterThanOrEqual(f["face-type"].bottom - 1);
  await expect(pane(page).locator("table.faces thead")).toBeHidden();
  await expect(pane(page).locator(".parameters tr")).toHaveCount(14);
  await shot(page, "closed_loop", "", "detail-narrow");

  await plantAt(page, 600);
  const q = await cells(page, "table.parameters tr", ["param-name", "param-value"]);
  expect(Math.abs(q["param-value"].top - q["param-name"].top)).toBeLessThan(2);
  const g = await cells(page, 'table.faces tr[data-port="plant|out|V"]', ["face-name", "face-type", "stage"]);
  expect(Math.abs(g["face-type"].top - g["face-name"].top)).toBeLessThan(2);
  expect(Math.abs(g.stage.top - g["face-name"].top)).toBeLessThan(2);
  await expect(pane(page).locator("table.faces thead")).toBeVisible();
});

test("the level's facts count its children and wires: aircraft's one child and two wires, kinds' nine and ten", async ({ page }) => {
  await drop(page, "aircraft");
  await expect(fact(page, "children")).toHaveText("1");
  await expect(fact(page, "wires")).toHaveText("2");
  await drop(page, "kinds");
  await expect(fact(page, "children")).toHaveText("9");
  await expect(fact(page, "wires")).toHaveText("10");
});

test("kinds: the root's output faces, fed by pinned primitives, carry no pinned mark, nor does the pin ⟨out⟩i; the primitive's own port does", async ({ page }) => {
  await drop(page, "kinds");
  await expect(pane(page).locator("table.faces tr.out")).toHaveCount(9);
  await expect(pane(page).locator("table.faces td.pinned")).toHaveText(Array(9).fill(""));
  await page.locator('g.block[data-id="⟨out⟩i"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "pin");
  await expect(pane(page).locator("p.facts")).toHaveCount(0);
  await expect(pane(page)).not.toContainText(/pinned/i);
  await page.locator('rect.port[data-port="i|out|y"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  await expect(pane(page).locator("p.facts")).toHaveText(/^stage \d · pinned$/);
});

test("closed_loop: a location's file name stays on one line with its line number at pane widths 240, 360, 380 and 420", async ({ page }) => {
  for (const detail of [240, 360, 380, 420]) {
    await drop(page, "closed_loop");
    await page.evaluate((detail) => localStorage.setItem("redstone-inspector/prefs",
      JSON.stringify({ version: 1, sizes: { tree: 280, detail, drawer: 200 }, collapsed: { tree: false, detail: false } })), detail);
    await drop(page, "closed_loop");
    await expect(pane(page).locator(".locations li")).toHaveCount(5);
    // the tops of the characters from the last slash's successor to the line number's end, read from each one's rect
    const lines = await pane(page).locator(".locations .file").evaluateAll((files) => files.map((file) => {
      const text = file.textContent!;
      const tops = new Set<number>();
      const walker = document.createTreeWalker(file, NodeFilter.SHOW_TEXT);
      let offset = 0, start = text.lastIndexOf("/") + 1;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const len = n.textContent!.length;
        for (let i = Math.max(0, start - offset); i < len; i++) {
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + 1);
          tops.add(Math.round(r.getBoundingClientRect().top));
        }
        offset += len;
      }
      return { text, lines: tops.size };
    }));
    expect(lines.length).toBe(5);
    for (const l of lines) expect(l.lines, `${detail}: ${l.text}`).toBe(1);
  }
});

test("library: integrator's docstring rendered, the signature a code block, fourteen @ref links opening the core's docs in a new tab", async ({ page }) => {
  await drop(page, "library");
  await page.locator('g.block[data-id="integrator"]').click();
  const docstring = pane(page).locator("details.docstring");
  await docstring.locator("summary").click();
  await expect(docstring).toHaveAttribute("open");
  const body = docstring.locator("div.docstring");
  await expect(body.locator('a[target="_blank"][rel="noopener"]')).toHaveCount(14);
  await expect(body.locator("a")).toHaveCount(14);
  await expect(body.locator(`a[href^="${DOCS_URL}glossary/#g-"]`)).toHaveCount(11);
  await expect(body.locator('a[href$="api/#Redstone.Library.LimitedIntegrator"]')).toHaveCount(1);
  await expect(body.locator("pre code").first()).toHaveText("Integrator(; x0 = 0.0, reset::Bool = false) -> Integrator");
  await expect(body).not.toContainText("@ref");
});

test("library: lqr's long signatures stay on their lines, the code block scrolling sideways at the default pane", async ({ page }) => {
  await drop(page, "library");
  await page.locator('g.block[data-id="lqr"]').click();
  const docstring = pane(page).locator("details.docstring");
  await docstring.locator("summary").click();
  await expect(docstring).toHaveAttribute("open");
  const pre = docstring.locator("div.docstring pre").first();
  const m = await pre.evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth, space: getComputedStyle(e).whiteSpace, overflow: getComputedStyle(e).overflowX }));
  expect(m.space).toBe("pre");
  expect(m.overflow).toBe("auto");
  expect(m.scroll).toBeGreaterThan(m.client);
  // the pane itself does not scroll sideways
  const body = await page.locator('.pane[data-pane="detail"] .body').evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
  expect(body.scroll).toBe(body.client);
});

test("a hostile docstring: raw HTML shown as text, the image as its text, the script link as text", async ({ page }) => {
  const d = JSON.parse(fixtureText("primitive"));
  d.build.structure.types[0].docstring = "a <b>x</b> and <script>alert(1)</script>\n\n![alt](https://x/y.png) [x](javascript:alert(1))";
  await drop(page, "primitive", JSON.stringify(d));
  await page.locator('g.block[data-id=""]').click();
  const docstring = pane(page).locator("details.docstring");
  await docstring.locator("summary").click();
  const body = docstring.locator("div.docstring");
  await expect(body).toContainText("<b>x</b>");
  await expect(body).toContainText("<script>alert(1)</script>");
  await expect(body.locator("code")).toHaveText("alt");
  for (const tag of ["b", "img", "script", "a"]) await expect(body.locator(tag), tag).toHaveCount(0);
});

test("large: with the detail pane focused, j k and the vertical arrows scroll its body by the step, h l and the horizontal ones sideways; the view and the selection stay", async ({ page }) => {
  await drop(page, "large");
  const body = page.locator('.pane[data-pane="detail"] .body');
  await widen(pane(page));
  await pane(page).locator("h2").click();
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
  const state = async () => ({ view: await viewBox(page), id: await pane(page).getAttribute("data-id"), selected: await page.locator("svg.canvas .selected").count() });
  const before = await state();
  await expectScrollKeys(page, body);
  expect(await state()).toEqual(before);
});

test("closed_loop: a producer link's click re-renders the pane, which keeps the focus and its ring; j then scrolls it, the selection unchanged", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').click();
  await pane(page).locator("table.faces a.producer").first().click();
  await expect(pane(page)).toHaveAttribute("data-kind", "port");
  const id = await pane(page).getAttribute("data-id");
  await expect(page.locator("aside.detail.focused")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement?.matches("aside.detail"))).toBe(true);
  expect(await paneRing(page, "detail")).toBe(true);
  const level = await page.locator("svg.canvas").getAttribute("data-level");
  await press(page, "j");
  await expect(pane(page)).toHaveAttribute("data-id", id!);
  await expect(page.locator(`svg.canvas[data-level="${level}"] g.block.selected`)).toHaveCount(0);
});

test("primitive: with nothing selected the pane takes the open level's mark where an open button would stand; the root selected keeps it, its pin does not", async ({ page }) => {
  await drop(page, "primitive");
  await expect(pane(page)).toHaveAttribute("data-kind", "primitive");
  await expect(pane(page)).toHaveAttribute("data-id", "");
  await expect(pane(page).locator(".path-line button.copy + span.level-mark")).toHaveText("open level");
  await expect(pane(page).locator("button.open-level")).toHaveCount(0);
  await shot(page, "primitive", "", "detail-level-mark");
  await page.locator('g.block[data-id=""]').click();
  await expect(pane(page).locator("span.level-mark")).toHaveCount(1);
  await page.locator('g.block[data-id="⟨in⟩u"]').click();
  await expect(pane(page)).toHaveAttribute("data-kind", "pin");
  await expect(pane(page).locator("span.level-mark")).toHaveCount(0);
});
