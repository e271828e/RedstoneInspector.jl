/// <reference types="node" />
// The harness's helper: a fixture dropped on the page as a File in a DataTransfer,
// the wait for the drawn level or the outcome text, counts, the frame's locators,
// a wire's clickable point, an element's effective opacity, the overlay's pill rows,
// screenshots and the live tab's mock socket.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Locator, type Page, type WebSocketRoute } from "@playwright/test";

const fixtures = new URL("../fixtures/", import.meta.url);
const screenshots = new URL("screenshots/", import.meta.url);

/** A committed fixture's text. */
export const fixtureText = (name: string): string => readFileSync(new URL(`${name}.json`, fixtures), "utf8");

/** The level's selector once drawn: `svg.canvas[data-level=...][data-ready]`. */
export const readyLevel = (level: string) => `svg.canvas[data-level="${level}"][data-ready]`;

/**
 * Opens the page at `at` and drops the text as a file through a `drop` event dispatched on the window, as the
 * shell's own handler receives one; waits for the level drawn or for the outcome text.
 */
export async function drop(page: Page, name: string, text = fixtureText(name), at = "/"): Promise<void> {
  await page.goto(at);
  await dropOver(page, name, text);
}

/**
 * Drops the text on the page as it stands, no navigation, so the session lives on; waits for a canvas or an
 * outcome other than the one shown before the drop.
 */
export async function dropOver(page: Page, name: string, text = fixtureText(name)): Promise<void> {
  await page.evaluate(({ text, file }) => {
    for (const el of document.querySelectorAll("svg.canvas, pre.outcome")) (el as any).__before = true;
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForFunction(() => {
    const svg = document.querySelector("svg.canvas[data-ready]") as any;
    const outcome = document.querySelector("pre.outcome") as any;
    return (svg && !svg.__before) || (outcome && !outcome.__before && outcome.textContent !== "No file open.");
  });
}

/** Opens the level at `path` by double-clicking down from the root along it; a keyed container's field, no block, is passed. */
export async function openPath(page: Page, path: string): Promise<void> {
  const segments = path.split("/");
  for (let i = 1; i <= segments.length; i++) {
    const p = segments.slice(0, i).join("/");
    if (i < segments.length && !(await page.locator(`g.block[data-id="${p}"]`).count())) continue;
    await page.locator(`g.block[data-id="${p}"]`).dblclick();
    await page.locator(readyLevel(p)).waitFor();
  }
}

/** What the open level draws, counted by the DOM contract. */
export const counts = (page: Page) => page.evaluate(() => {
  const n = (s: string) => document.querySelectorAll(`svg.canvas ${s}`).length;
  return {
    blocks: n("g.block"), wires: n("path.wire"), inPins: n("g.block.pin.in"), outPins: n("g.block.pin.out"),
    closed: n("g.block.assembly"), stage1: n("rect.port.stage1"), pinned: n(".pinned[data-port]"),
    rootInputs: n("g.block.pin.root-input"),
    /** Pins drawn as the pointed tag, a path, and as the plain capsule, a rect. */
    tags: n("g.block.pin.root-input > path.shape"), capsules: n("g.block.pin > rect.shape"),
  };
});

/**
 * Saves `e2e/screenshots/<fixture>__<level>.png`, the root as `root` and `/` in a path as `__`; a check
 * other than the drawing prefixes its name, `<check>.<fixture>__<level>.png`. A run of a project other than
 * Chromium saves under its own folder, `e2e/screenshots/<project>/`, so the two runs never overwrite each other.
 */
export async function shot(page: Page, fixture: string, level: string, check?: string): Promise<void> {
  const name = `${check ? `${check}.` : ""}${fixture}__${level === "" ? "root" : level.replaceAll("/", "__")}.png`;
  const project = test.info().project.name;
  const dir = project === "chromium" ? screenshots : new URL(`${project}/`, screenshots);
  await page.screenshot({ path: fileURLToPath(new URL(name, dir)) });
}

/** The SVG's viewBox, the world rectangle it shows. */
export const viewBox = (page: Page) => page.evaluate(() => {
  const v = document.querySelector<SVGSVGElement>("svg.canvas")!.viewBox.baseVal;
  return { x: v.x, y: v.y, width: v.width, height: v.height };
});

/** Every block's and pin's box in world units, in drawing order. */
export const blockBoxes = (page: Page) => page.evaluate(() => [...document.querySelectorAll<SVGGElement>("svg.canvas g.block")].map((g) => {
  const b = g.getBBox(), m = g.transform.baseVal.consolidate()!.matrix;
  return { id: g.dataset.id!, x: b.x + m.e, y: b.y + m.f, width: b.width, height: b.height };
}));

/** The page's URL hash, `""` when it has none. */
export const hash = (page: Page) => page.evaluate(() => location.hash);

/** A key pressed on the page, then a frame waited for, so the view's reads see the key's effect. */
export async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
}

/** Keys pressed one after another, a prefix and its second key among them. */
export async function pressAll(page: Page, ...keys: string[]): Promise<void> {
  for (const key of keys) await press(page, key);
}

/** A pane's and the help page's scrolling step, the shell's `SCROLL_STEP`. */
export const SCROLL_STEP = 40;

/**
 * Presses `z` with `h j k l` from the scroller's top-left corner, `j` down then `k` back, `l` right then `h` back,
 * each moving it by one step along its axis.
 */
export async function expectScrollKeys(page: Page, scroller: Locator): Promise<void> {
  await scroller.evaluate((e) => e.scrollTo(0, 0));
  const keys: [string, number, number][] = [["j", 0, 1], ["k", 0, -1], ["l", 1, 0], ["h", -1, 0]];
  let x = 0, y = 0;
  for (const [key, dx, dy] of keys) {
    await pressAll(page, "z", key);
    x += dx * SCROLL_STEP;
    y += dy * SCROLL_STEP;
    expect(await scroller.evaluate((e) => [e.scrollLeft, e.scrollTop]), `z ${key}`).toEqual([x, y]);
  }
}

/** Appends a line 3000 px wide to an element, so its scroller scrolls sideways. */
export const widen = (el: Locator) => el.evaluate((e) => {
  const d = document.createElement("div");
  d.style.cssText = "width: 3000px; height: 1px";
  e.append(d);
});

/** The focused element in short: its tag and what names it among the panes' stops. */
export const cursor = (page: Page) => page.evaluate(() => {
  const a = document.activeElement as HTMLElement;
  if (a.matches("nav.tree, .viewport, aside.detail, section.drawer")) return a.matches(".viewport") ? "canvas" : a.matches("aside.detail") ? "detail" : a.matches("nav.tree") ? "tree" : "drawer";
  if (a.localName === "summary") return a.textContent!.trim();
  if (a.matches(".swatch")) return `swatch ${a.dataset.key}`;
  return `${a.localName}.${a.classList[0]} ${a.textContent!.trim().replace(/\s+/g, " ")}`;
});

/** Whether a pane, `tree`, `detail` or `drawer`, draws the focus ring on its box. */
export const paneRing = (page: Page, pane: string) =>
  page.locator(`.pane[data-pane="${pane}"]`).evaluate((p) => getComputedStyle(p).outlineStyle !== "none");

/** A collapsible section of the detail pane. */
export const section = (page: Page, name: string) => page.locator(`aside.detail details.section[data-section="${name}"]`);

/** Opens a section of the detail pane by its heading; one already open stays so. */
export async function openSection(page: Page, name: string): Promise<void> {
  const s = section(page, name);
  if (!(await s.evaluate((e) => (e as HTMLDetailsElement).open))) await s.locator("summary").click();
  await expect(s).toHaveAttribute("open");
}

/** Every element under the canvas carrying `selected`. */
export const selected = (page: Page) => page.locator("svg.canvas .selected");

/** The tree's rows, node and folder; counted with `toHaveCount`, which retries. */
export const rows = (page: Page) => page.locator("nav.tree .row");

/** The status bar, read with `toContainText` or `toHaveAttribute("data-kind", ...)`. */
export const status = (page: Page) => page.locator("footer.status");

/**
 * The first match's effective opacity: the product of the computed opacities from the element up to
 * `svg.canvas`, so a group's dim counts as well as the element's own.
 */
export const effectiveOpacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => {
  let o = 1;
  for (let n: Element | null = e; n; n = n.matches("svg.canvas") ? null : n.parentElement) o *= Number(getComputedStyle(n).opacity);
  return o;
});

type Edges = { left: number; right: number; top: number; bottom: number };
/**
 * The overlay's pills on the drawn level by block, the fixed ones in `g.overlay` and the route's in `g.route-pills`,
 * in world units, with the block's box read from its shape and whether it is a child, an input pin or an output pin.
 */
export const overlayPills = (page: Page) => page.evaluate(() => {
  const out: Record<string, { kind: "child" | "in" | "out"; box: Edges; pills: (Edges & { role: string; text: string })[] }> = {};
  for (const g of document.querySelectorAll<SVGGElement>("svg.canvas :is(g.overlay, g.route-pills) > g.badge")) {
    const id = g.dataset.id!;
    if (!out[id]) {
      const b = document.querySelector<SVGGElement>(`g.blocks > g.block[data-id="${id}"]`)!;
      const m = b.transform.baseVal.consolidate()!.matrix, s = b.querySelector<SVGGraphicsElement>(":scope > .shape")!.getBBox();
      const kind = b.classList.contains("in") ? "in" : b.classList.contains("out") ? "out" : "child";
      out[id] = { kind, box: { left: m.e + s.x, right: m.e + s.x + s.width, top: m.f + s.y, bottom: m.f + s.y + s.height }, pills: [] };
    }
    const r = g.querySelector("rect")!, v = (a: SVGAnimatedLength) => a.baseVal.value;
    out[id].pills.push({ role: g.dataset.role!, text: g.querySelector("text")!.textContent!, left: v(r.x), right: v(r.x) + v(r.width), top: v(r.y), bottom: v(r.y) + v(r.height) });
  }
  return out;
}) as Promise<Record<string, { kind: "child" | "in" | "out"; box: Edges; pills: (Edges & { role: string; text: string })[] }>>;

/**
 * The rows of visual_grammar.md answers 8 and 9 at every pill on the drawn level, recomputed from the DOM, and the
 * rows returned: each pill straddles its block's bottom edge, at most one per role; on a child and an input pin the
 * row runs leftward from the right end 4 in, on an output pin rightward from the left end 4 in, 2 apart, the
 * diagnostic's first, then the loop's, then the route's.
 */
export async function expectPillRows(page: Page) {
  const rows = await overlayPills(page);
  const order = ["diagnostic", "continues", "route"];
  for (const [id, { kind, box, pills }] of Object.entries(rows)) {
    expect(new Set(pills.map((p) => p.role)).size, `${id} one pill per role`).toBe(pills.length);
    let edge = kind === "out" ? box.left + 4 : box.right - 4;
    for (const p of [...pills].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))) {
      expect(p.top < box.bottom && box.bottom < p.bottom, `${id} ${p.role} straddles the bottom edge`).toBe(true);
      expect(kind === "out" ? p.left : p.right, `${id} ${p.role} in the row`).toBeCloseTo(edge, 3);
      edge = kind === "out" ? p.right + 2 : p.left - 2;
    }
  }
  return rows;
}

/** A client point of a wire's line where the wire's own hit path is on top. */
export async function wirePoint(page: Page, id: string): Promise<{ x: number; y: number }> {
  const at = await page.evaluate((id) => {
    const hit = document.querySelector<SVGPathElement>(`path.wire-hit[data-hit="${CSS.escape(id)}"]`)!;
    const m = hit.getScreenCTM()!, length = hit.getTotalLength();
    for (let k = 1; k < 20; k++) {
      const p = hit.getPointAtLength((length * k) / 20).matrixTransform(m);
      if (document.elementFromPoint(p.x, p.y) === hit) return { x: p.x, y: p.y };
    }
    return undefined;
  }, id);
  expect(at, `a clickable point on ${id}`).toBeDefined();
  return at!;
}

export async function clickWire(page: Page, id: string): Promise<void> {
  const at = await wirePoint(page, id);
  await page.mouse.click(at.x, at.y);
}

/** The mock server behind `live()`: what the page sent and the latest connection's two moves. */
export interface LiveMock {
  /** Every text the page sent, over every connection, in order. */
  sent: string[];
  /** The connections the page opened so far. */
  connections(): number;
  /** A text frame to the page on the latest connection. */
  send(text: string): void;
  /** The latest connection closed from the server's side. */
  close(): Promise<void>;
}

/**
 * Opens the page at `path` with its socket to `/ws` answered by a mock: every connection opens, every message
 * the page sends is recorded, and the handle sends a text or closes the latest connection.
 */
export async function live(page: Page, path: string): Promise<LiveMock> {
  const routes: WebSocketRoute[] = [];
  const sent: string[] = [];
  await page.routeWebSocket("**/ws", (ws) => {
    routes.push(ws);
    ws.onMessage((m) => sent.push(typeof m === "string" ? m : m.toString()));
  });
  await page.goto(path);
  return {
    sent,
    connections: () => routes.length,
    send: (text) => routes.at(-1)!.send(text),
    close: () => routes.at(-1)!.close(),
  };
}

export { expect };
