// Wire styles by kind, the trunks' dots and the type labels (visual_grammar.md
// answers 4 and 10, workspace.md answer 7). Counts from the oracle (`grammar.py`).
import { test, type Page } from "@playwright/test";
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
/** A type label's own text, its `<title>` left out. */
const labelText = (page: Page, port: string) => page.locator(`text.type-label[data-port="${port}"]`).evaluate((t) =>
  [...t.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(""));
const labelButton = (page: Page) => page.locator("nav.breadcrumb .controls button.type-labels");

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
  await press(page, "y");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-labels", "");
  await expect(page.locator("text.type-label")).toHaveCount(10);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "true");
  // nt's NamedTuple type is cut with an ellipsis, its title the whole string; i's Int8 whole
  const full = "@NamedTuple{a::Float64, b::Float64}";
  await expect(page.locator('text.type-label[data-port="nt|out|y"] > title')).toHaveText(full);
  const cut = await labelText(page, "nt|out|y");
  expect(cut.endsWith("…")).toBe(true);
  expect(full.startsWith(cut.slice(0, -1))).toBe(true);
  expect(await labelText(page, "i|out|y")).toBe("Int8");
  await shot(page, "kinds", "", "wires");
  await press(page, "y");
  await expect(page.locator("svg.canvas")).not.toHaveAttribute("data-labels");
  await expect(page.locator("text.type-label")).toHaveCount(0);
  await labelButton(page).click();
  await expect(page.locator("text.type-label")).toHaveCount(10);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await dropOver(page, "kinds");
  await expect(page.locator("text.type-label")).toHaveCount(10);
  await labelButton(page).click();
  await expect(page.locator("text.type-label")).toHaveCount(0);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "false");
});

test("closed_loop: 19 labels at their wires' starts; mode's trunk dots on its branches; a dragged block's wires lose theirs", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "y");
  await expect(page.locator("text.type-label")).toHaveCount(19);
  const wires = rootWires("closed_loop");
  const first = new Map<string, string>();
  for (const w of wires) if (!first.has(w.port)) first.set(w.port, w.id);
  expect(first.size).toBe(19);
  for (const [port, id] of first) {
    const [x0, y0] = pointsOf((await page.locator(`path.wire[data-wire="${id}"]`).getAttribute("d"))!)[0];
    const b = await page.locator(`text.type-label[data-port="${port}"]`).evaluate((t) => {
      const r = (t as SVGTextElement).getBBox();
      return { x: r.x, y: r.y, height: r.height };
    });
    expect(Math.hypot(b.x - x0, b.y + b.height - y0), port).toBeLessThanOrEqual(8);
  }
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
});
