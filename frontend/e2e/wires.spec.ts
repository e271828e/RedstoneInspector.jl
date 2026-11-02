// Wire styles by kind, the trunks' dots and the type labels (visual_grammar.md
// answers 4 and 10, workspace.md answer 7). Counts from the oracle (`grammar.py`).
import { test, type Page } from "@playwright/test";
import { shortType } from "../src/lib/wires";
import { drop, dropOver, expect, fixtureText, press, shot } from "./fixtures";

type End = { path: string; port: string };
type Wire = { from: End; to: End };
/** A fixture's root wires in declaration order, each with its id and its producer's port id. */
function rootWires(fixture: string): { id: string; port: string; from: End; to: End }[] {
  const root = JSON.parse(fixtureText(fixture)).build.structure.nodes.find((n: { path: string }) => n.path === "");
  return root.wires.map((w: Wire) => ({
    ...w,
    id: w.to.path === "" ? `⟨out⟩${w.to.port}|in|${w.to.port}` : `${w.to.path}|in|${w.to.port}`,
    port: w.from.path === "" ? `⟨in⟩${w.from.port}|out|${w.from.port}` : `${w.from.path}|out|${w.from.port}`,
  }));
}
/** A path's points from its `d`, `M x,y L x,y ...`. */
const pointsOf = (d: string) => d.split(/[ML]/).filter((s) => s.trim()).map((s) => s.split(",").map(Number) as [number, number]);
/** Whether a point lies on a polyline within `tol`. */
function onPolyline([x, y]: [number, number], pts: [number, number][], tol = 0.5): boolean {
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    if (Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) <= tol) return true;
  }
  return false;
}
const style = (page: Page, sel: string, prop: string) =>
  page.locator(sel).first().evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), prop);
const dots = (page: Page) => page.locator("circle.junction").evaluateAll((cs) =>
  cs.map((c) => ({ wire: c.getAttribute("data-wire")!, x: Number(c.getAttribute("cx")), y: Number(c.getAttribute("cy")) })));
const labelButton = (page: Page) => page.locator("nav.breadcrumb .controls button.type-labels");
/** A module qualifier: a name, a dot, a name. */
const QUALIFIED = /[\p{L}_][\p{L}\p{N}_!]*\.[\p{L}_]/u;

/** Every block's and pin's transform, by block id. */
const transforms = (page: Page) => page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll("svg.canvas g.block")].map((g) => [g.getAttribute("data-id")!, g.getAttribute("transform")!])));
/** Each type label's place, `x` and `y` as drawn, by port. */
const labelPlaces = (page: Page) => page.locator("text.type-label").evaluateAll((ts) =>
  Object.fromEntries(ts.map((t) => [t.getAttribute("data-port")!, [Number(t.getAttribute("x")), Number(t.getAttribute("y"))]])));
/** A block's translation, read off its transform. */
const translation = (t: string) => t.match(/-?[\d.]+/g)!.map(Number);

/**
 * The root's type labels against the rule (visual_grammar.md answer 4 as amended): one label per producer port, its
 * `data-wire` the port's first wire, start-anchored a few units right of the port's point and below the wire leaving
 * it, the unqualified type whole, the full type in its title; the labels' group after the blocks. The port's point is
 * the first wire's first point. Returns the labels drawn, by port.
 */
async function expectLabels(page: Page, fixture: string): Promise<Map<string, string>> {
  const byPort = new Map<string, string[]>();
  for (const w of rootWires(fixture)) byPort.set(w.port, [...(byPort.get(w.port) ?? []), w.id]);
  const drawn = await page.evaluate((ports) => {
    const out: Record<string, unknown> = {};
    for (const [port, ids] of ports) {
      const start = document.querySelector(`path.wire[data-wire="${CSS.escape(ids[0])}"]`)!.getAttribute("d")!
        .split(/[ML]/).filter((s) => s.trim())[0].split(",").map(Number);
      const t = document.querySelector<SVGTextElement>(`text.type-label[data-port="${CSS.escape(port)}"]`);
      const text = t ? [...t.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("") : undefined;
      const box = t?.getBBox();
      out[port] = {
        start, text, wire: t?.getAttribute("data-wire"), title: t?.querySelector("title")?.textContent,
        x: Number(t?.getAttribute("x")), anchor: t && getComputedStyle(t).textAnchor,
        box: box && { x: box.x, y: box.y },
        afterBlocks: t ? !!(document.querySelector("g.blocks")!.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) : undefined,
      };
    }
    return out;
  }, [...byPort]);
  const labels = new Map<string, string>();
  for (const [port, v] of Object.entries(drawn) as [string, {
    start: [number, number]; text?: string; wire?: string; title?: string; x: number; anchor?: string;
    box?: { x: number; y: number }; afterBlocks?: boolean;
  }][]) {
    expect(v.text, `${port} labelled`).toBeDefined();
    labels.set(port, v.text!);
    expect(v.wire, `${port} on its first wire`).toBe(byPort.get(port)![0]);
    // start-anchored: the text begins at its x, which sits just right of the port
    expect(v.anchor, port).toBe("start");
    expect(Math.abs(v.box!.x - v.x), `${port} begins at its x`).toBeLessThan(1);
    expect(v.box!.x - v.start[0], `${port} right of its port`).toBeGreaterThanOrEqual(0);
    expect(v.box!.x - v.start[0], `${port} just right`).toBeLessThanOrEqual(6);
    // below the wire leaving the port
    expect(v.box!.y - v.start[1], `${port} below its wire`).toBeGreaterThanOrEqual(-0.5);
    expect(v.box!.y - v.start[1], `${port} just below`).toBeLessThanOrEqual(8);
    // the unqualified type whole, never cut
    expect(v.text, port).toBe(shortType(v.title!));
    expect(v.text, port).not.toMatch(/…$/);
    expect(v.text, port).not.toMatch(QUALIFIED);
    expect(v.afterBlocks, port).toBe(true);
  }
  await expect(page.locator("text.type-label")).toHaveCount(byPort.size);
  return labels;
}

test("kinds: one wire of every class, each drawn by its kind; the type labels by y and the toggle, kept across a reload", async ({ page }) => {
  await drop(page, "kinds");
  const kinds = { scalar: 3, flag: 3, vector: 2, struct: 1, opaque: 1 };
  await expect(page.locator("path.wire")).toHaveCount(10);
  for (const [k, n] of Object.entries(kinds)) await expect(page.locator(`path.wire[data-kind="${k}"]`), k).toHaveCount(n);
  // the struct's core: one, the same d, drawn after the wire and narrower
  const struct = page.locator('path.wire[data-kind="struct"]');
  await expect(page.locator("path.wire-core")).toHaveCount(1);
  const core = page.locator(`path.wire-core[data-wire="${await struct.getAttribute("data-wire")}"]`);
  expect(await core.getAttribute("d")).toBe(await struct.getAttribute("d"));
  // its arrowhead rides on the core, drawn last, so the core does not cross it
  expect([await struct.getAttribute("marker-end"), await core.getAttribute("marker-end")]).toEqual([null, expect.stringMatching(/^url\(#arrow-\d+\)$/)]);
  expect(await struct.evaluate((w) => !!(w.compareDocumentPosition(document.querySelector("path.wire-core")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  expect(parseFloat(await style(page, "path.wire-core", "stroke-width"))).toBeLessThan(parseFloat(await style(page, 'path.wire[data-kind="struct"]', "stroke-width")));
  // the line patterns and weights
  for (const w of await page.locator('path.wire[data-kind="flag"]').all()) expect(await w.evaluate((e) => getComputedStyle(e).strokeDasharray)).not.toBe("none");
  for (const w of await page.locator('path.wire[data-kind="scalar"]').all()) expect(await w.evaluate((e) => getComputedStyle(e).strokeDasharray)).toBe("none");
  const opaqueDash = await style(page, 'path.wire[data-kind="opaque"]', "stroke-dasharray");
  expect(opaqueDash).not.toBe("none");
  expect(opaqueDash).not.toBe(await style(page, 'path.wire[data-kind="flag"]', "stroke-dasharray"));
  // the opaque wire's gray is lighter than a scalar's
  const channels = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number).reduce((a, b) => a + b, 0);
  const opaqueStroke = await style(page, 'path.wire[data-kind="opaque"]', "stroke"), scalarStroke = await style(page, 'path.wire[data-kind="scalar"]', "stroke");
  expect(opaqueStroke).not.toBe(scalarStroke);
  expect(channels(opaqueStroke)).toBeGreaterThan(channels(scalarStroke));
  expect(parseFloat(await style(page, 'path.wire[data-kind="vector"]', "stroke-width")))
    .toBeGreaterThan(parseFloat(await style(page, 'path.wire[data-kind="scalar"]', "stroke-width")));

  await expect(page.locator("text.type-label")).toHaveCount(0);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "false");
  // the labels are in every layout, so the toggle moves no block
  const placed = await transforms(page);
  await press(page, "y");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-labels", "");
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "true");
  expect(await transforms(page)).toEqual(placed);
  const labels = await expectLabels(page, "kinds");
  const n = labels.size;
  // the module dropped from the text, kept in the title: v's StaticArraysCore.SVector
  expect(labels.get("i|out|y")).toBe("Int8");
  expect(labels.get("v|out|y")).toMatch(/^SVector\{/);
  await expect(page.locator('text.type-label[data-port="v|out|y"] > title')).toHaveText(/^StaticArraysCore\.SVector\{/);
  // 9 px, on a halo of the background painted under the text
  const look = await page.locator('text.type-label[data-port="i|out|y"]').evaluate((t) => {
    const c = getComputedStyle(t);
    return { size: c.fontSize, order: c.paintOrder, stroke: c.stroke, bg: getComputedStyle(document.querySelector(".viewport")!).backgroundColor };
  });
  expect([look.size, look.order.split(" ")[0], look.stroke]).toEqual(["9px", "stroke", look.bg]);
  await shot(page, "kinds", "", "wires");
  await press(page, "y");
  await expect(page.locator("svg.canvas")).not.toHaveAttribute("data-labels");
  await expect(page.locator("text.type-label")).toHaveCount(0);
  await labelButton(page).click();
  await expect(page.locator("text.type-label")).toHaveCount(n);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await dropOver(page, "kinds");
  await expect(page.locator("text.type-label")).toHaveCount(n);
  // laid out afresh with the labels shown, every block where it was laid out with them hidden
  expect(await transforms(page)).toEqual(placed);
  await labelButton(page).click();
  await expect(page.locator("text.type-label")).toHaveCount(0);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "false");
});

test("closed_loop: the labels by their ports; mode's trunk dots on its branches; a dragged block's wires lose theirs and its labels follow it", async ({ page }) => {
  await drop(page, "closed_loop");
  const placed = await transforms(page);
  await press(page, "y");
  expect(await transforms(page)).toEqual(placed);
  const wires = rootWires("closed_loop");
  // 19 producer ports, each labelled; mode's Bool on the first of its three wires
  expect(new Set(wires.map((w) => w.port)).size).toBe(19);
  const labels = await expectLabels(page, "closed_loop");
  expect(labels.get("⟨in⟩mode|out|mode")).toBe("Bool");
  const was = await labelPlaces(page);
  await press(page, "y");

  // mode's three wires share one trunk: one or two dots, each on at least two of the three
  const mode = wires.filter((w) => w.port === "⟨in⟩mode|out|mode").map((w) => w.id);
  expect(mode).toHaveLength(3);
  const paths = new Map<string, [number, number][]>();
  for (const id of mode) paths.set(id, pointsOf((await page.locator(`path.wire[data-wire="${id}"]`).getAttribute("d"))!));
  const modeDots = (await dots(page)).filter((d) => mode.includes(d.wire));
  expect(modeDots.length).toBeGreaterThanOrEqual(1);
  expect(modeDots.length).toBeLessThanOrEqual(2);
  for (const d of modeDots) expect([...paths.values()].filter((p) => onPolyline([d.x, d.y], p)).length, `${d.wire} ${d.x},${d.y}`).toBeGreaterThanOrEqual(2);

  // plant dragged 120 down: its wires' dots gone, every other dot where it was
  const plant = new Set(wires.filter((w) => w.from.path === "plant" || w.to.path === "plant").map((w) => w.id));
  const before = await dots(page);
  expect(before.some((d) => plant.has(d.wire)), "a dot on a plant wire").toBe(true);
  const r = (await page.locator('g.block[data-id="plant"] > .shape').boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + 10);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2, r.y + 130, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  expect(await dots(page)).toEqual(before.filter((d) => !plant.has(d.wire)));

  // plant's labels moved with it, by its port; every other label where it was
  const moved = await transforms(page);
  const [dx, dy] = translation(moved.plant).map((v, i) => v - translation(placed.plant)[i]);
  expect(dy).toBeGreaterThan(0);
  await press(page, "y");
  await expectLabels(page, "closed_loop");
  const now = await labelPlaces(page);
  for (const [port, [x, y]] of Object.entries(was)) {
    const [ex, ey] = port.startsWith("plant|") ? [x + dx, y + dy] : [x, y];
    expect(Math.abs(now[port][0] - ex) + Math.abs(now[port][1] - ey), port).toBeLessThan(0.01);
  }
});
