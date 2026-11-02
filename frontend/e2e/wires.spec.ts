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
const labelButton = (page: Page) => page.locator("nav.breadcrumb .controls button.type-labels");
/** A module qualifier: a name, a dot, a name. */
const QUALIFIED = /[\p{L}_][\p{L}\p{N}_!]*\.[\p{L}_]/u;

/**
 * The root's type labels against the rule (visual_grammar.md answer 4 as amended): a producer port whose longest
 * horizontal segment, less the 6 px margins, surely fits three characters and an ellipsis has one label, one where
 * surely not none; each label sits on that segment,
 * its text box inside the segment's horizontal extent and just above it, unqualified, the full type in its title;
 * the labels' group after the blocks. Returns the labels drawn, by port.
 */
async function expectLabels(page: Page, fixture: string): Promise<Map<string, string>> {
  const byPort = new Map<string, string[]>();
  for (const w of rootWires(fixture)) byPort.set(w.port, [...(byPort.get(w.port) ?? []), w.id]);
  const drawn = await page.evaluate((ports) => {
    const font = getComputedStyle(document.querySelector("text.type-label") ?? document.body).font;
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = font;
    const out: Record<string, unknown> = {};
    for (const [port, ids] of ports) {
      let best: { wire: string; x0: number; x1: number; y: number } | undefined;
      for (const id of ids) {
        const pts = document.querySelector(`path.wire[data-wire="${CSS.escape(id)}"]`)!.getAttribute("d")!
          .split(/[ML]/).filter((s) => s.trim()).map((s) => s.split(",").map(Number));
        for (let i = 1; i < pts.length; i++) {
          const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
          if (Math.abs(ay - by) > 0.5 || ax === bx) continue;
          const s = { wire: id, x0: Math.min(ax, bx), x1: Math.max(ax, bx), y: ay };
          if (!best || s.x1 - s.x0 > best.x1 - best.x0) best = s;
        }
      }
      const t = document.querySelector<SVGTextElement>(`text.type-label[data-port="${CSS.escape(port)}"]`);
      const text = t ? [...t.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("") : undefined;
      const box = t?.getBBox();
      out[port] = {
        best, text, wire: t?.getAttribute("data-wire"), title: t?.querySelector("title")?.textContent,
        box: box && { x0: box.x, x1: box.x + box.width, bottom: box.y + box.height },
        // sure to fit three characters and the ellipsis, or sure not to
        sure: !!best && ctx.measureText("MMM…").width <= best.x1 - best.x0 - 12,
        never: !best || ctx.measureText("iii…").width > best.x1 - best.x0 - 12,
        afterBlocks: t ? !!(document.querySelector("g.blocks")!.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) : undefined,
      };
    }
    return out;
  }, [...byPort]);
  const labels = new Map<string, string>();
  for (const [port, v] of Object.entries(drawn) as [string, {
    best?: { wire: string; x0: number; x1: number; y: number }; text?: string; wire?: string; title?: string;
    box?: { x0: number; x1: number; bottom: number }; sure: boolean; never: boolean; afterBlocks?: boolean;
  }][]) {
    if (v.sure) expect(v.text, `${port} labelled`).toBeTruthy();
    if (v.never) expect(v.text, `${port} not labelled`).toBeUndefined();
    if (v.text === undefined) continue;
    labels.set(port, v.text!);
    expect(v.wire, port).toBe(v.best!.wire);
    expect(v.box!.x0, `${port} left`).toBeGreaterThanOrEqual(v.best!.x0);
    expect(v.box!.x1, `${port} right`).toBeLessThanOrEqual(v.best!.x1);
    expect(v.best!.y - v.box!.bottom, `${port} above its segment`).toBeGreaterThanOrEqual(-1);
    expect(v.best!.y - v.box!.bottom, `${port} just above`).toBeLessThanOrEqual(6);
    expect(v.text, port).not.toMatch(QUALIFIED);
    expect(v.title!.startsWith(v.text!.replace(/…$/, "")) || QUALIFIED.test(v.title!), port).toBe(true);
    expect(v.afterBlocks, port).toBe(true);
  }
  await expect(page.locator("text.type-label")).toHaveCount(labels.size);
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
  await press(page, "y");
  await expect(page.locator("svg.canvas")).toHaveAttribute("data-labels", "");
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "true");
  const labels = await expectLabels(page, "kinds");
  const n = labels.size;
  expect(n).toBeGreaterThan(5);
  // the module dropped from the text, kept in the title: v's StaticArraysCore.SVector
  expect(labels.get("i|out|y")).toBe("Int8");
  expect(labels.get("v|out|y")).toMatch(/^SVe/);
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
  await labelButton(page).click();
  await expect(page.locator("text.type-label")).toHaveCount(0);
  await expect(labelButton(page)).toHaveAttribute("aria-pressed", "false");
});

test("closed_loop: the labels on their ports' longest segments; mode's trunk dots on its branches; a dragged block's wires lose theirs", async ({ page }) => {
  await drop(page, "closed_loop");
  await press(page, "y");
  const wires = rootWires("closed_loop");
  // 19 producer ports; mode's Bool whole on its longest segment
  expect(new Set(wires.map((w) => w.port)).size).toBe(19);
  const labels = await expectLabels(page, "closed_loop");
  expect(labels.size).toBeGreaterThan(9);
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
