// Wire styles by kind, the trunks' dots and the type labels (visual_grammar.md
// answers 4 and 10, workspace.md answer 7). Counts from the oracle (`grammar.py`).
// The type labels ignore the pointer (the polish batch).
import { test, type Page } from "@playwright/test";
import { shortType } from "../src/lib/wires";
import { clickWire, drop, dropOver, expect, fixtureText, press, shot } from "./fixtures";

type End = { path: string; port: string };
type Wire = { from: End; to: End };
/** A fixture's root wires in declaration order, each with its id and its producer's port id. */
/** A root producer's full type from the fixture: a root input's, a primitive output's, an assembly output's through its output wire. */
function producerType(fixture: string, path: string, port: string): string | undefined {
  const s = JSON.parse(fixtureText(fixture)).build.structure;
  const nodes = new Map<string, any>(s.nodes.map((n: any) => [n.path, n]));
  const walk = (p: string, name: string): string | undefined => {
    const n = nodes.get(p);
    if (n.class === "primitive") return n.outputs.find((f: any) => f.name === name)?.type;
    const w = n.wires.find((x: Wire) => x.to.path === p && x.to.port === name);
    return w && w.from.path !== p ? walk(w.from.path, w.from.port) : undefined;
  };
  return path === "" ? s.root_inputs.find((r: any) => r.name === port)?.type : walk(path, port);
}

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

/**
 * The root's type labels against the rule (visual_grammar.md answer 4 as amended): one label per producer port, its
 * `data-wire` the port's first wire, start-anchored a few units right of the port's point and below the wire leaving
 * it, the unqualified type of its producer face whole, no title; the labels' group after the blocks. The port's point is
 * the first wire's first point. The place reads the first character's box, since Firefox pads a text's `getBBox`.
 * Returns the labels drawn, by port.
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
      const box = t?.getExtentOfChar(0);
      out[port] = {
        start, text, wire: t?.getAttribute("data-wire"), titled: !!t?.querySelector("title"),
        x: Number(t?.getAttribute("x")), anchor: t && getComputedStyle(t).textAnchor,
        box: box && { x: box.x, y: box.y },
        afterBlocks: t ? !!(document.querySelector("g.blocks")!.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) : undefined,
      };
    }
    return out;
  }, [...byPort]);
  const labels = new Map<string, string>();
  for (const [port, v] of Object.entries(drawn) as [string, {
    start: [number, number]; text?: string; wire?: string; titled: boolean; x: number; anchor?: string;
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
    const [block, , name] = port.split("|");
    const type = producerType(fixture, block.startsWith("⟨in⟩") ? "" : block, name);
    expect(v.text, port).toBe(shortType(type!));
    expect(v.titled, port).toBe(false);
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
  // the module dropped from the text, kept in the pane: v's StaticArraysCore.SVector
  expect(labels.get("i|out|y")).toBe("Int8");
  expect(labels.get("v|out|y")).toMatch(/^SVector\{/);
  // no title on a label, which ignores the pointer: the pane carries the whole type of its wire
  await expect(page.locator("text.type-label title")).toHaveCount(0);
  const vWire = (await page.locator('text.type-label[data-port="v|out|y"]').getAttribute("data-wire"))!;
  await clickWire(page, vWire);
  await expect(page.locator("aside.detail p.type code")).toHaveText(/^StaticArraysCore\.SVector\{/);
  await press(page, "Escape");
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

test("closed_loop: the labels by their ports; mode's trunk dots on its branches", async ({ page }) => {
  await drop(page, "closed_loop");
  const placed = await transforms(page);
  await press(page, "y");
  expect(await transforms(page)).toEqual(placed);
  const wires = rootWires("closed_loop");
  // 19 producer ports, each labelled; mode's Bool on the first of its three wires
  expect(new Set(wires.map((w) => w.port)).size).toBe(19);
  const labels = await expectLabels(page, "closed_loop");
  expect(labels.get("⟨in⟩mode|out|mode")).toBe("Bool");
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
});

test("kinds: a type label ignores the pointer, the element under it the same with the labels hidden", async ({ page }) => {
  await drop(page, "kinds");
  await press(page, "y");
  const labels = page.locator("text.type-label");
  await expect(labels.first()).toBeVisible();
  const hits = await labels.evaluateAll((ts) => ts.map((t) => {
    const r = t.getBoundingClientRect();
    const under = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { events: getComputedStyle(t).pointerEvents, label: !!under?.closest("text.type-label") };
  }));
  expect(hits.length).toBeGreaterThan(0);
  for (const h of hits) expect(h).toEqual({ events: "none", label: false });
  // the element under each label's centre is the one there with the labels hidden
  const centres = await labels.evaluateAll((ts) => ts.map((t) => { const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  const under = () => page.evaluate((ps) => ps.map(({ x, y }) => {
    const e = document.elementFromPoint(x, y)!;
    return `${e.tagName}.${e.getAttribute("class")}[${e.getAttribute("data-id") ?? e.getAttribute("data-hit") ?? e.getAttribute("data-port") ?? ""}]`;
  }), centres);
  const shown = await under();
  await press(page, "y");
  await expect(labels).toHaveCount(0);
  expect(await under()).toEqual(shown);
});
