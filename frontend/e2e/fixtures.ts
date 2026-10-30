/// <reference types="node" />
// The harness's helper: a fixture dropped on the page as a File in a DataTransfer,
// the wait for the drawn level or the outcome text, counts, the frame's locators,
// a wire's clickable point and screenshots.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

const fixtures = new URL("../fixtures/", import.meta.url);
const screenshots = new URL("screenshots/", import.meta.url);

/** A committed fixture's text. */
export const fixtureText = (name: string): string => readFileSync(new URL(`${name}.json`, fixtures), "utf8");

/** The level's selector once drawn: `svg.canvas[data-level=...][data-ready]`. */
export const readyLevel = (level: string) => `svg.canvas[data-level="${level}"][data-ready]`;

/**
 * Opens the page and drops the text as a file through a `drop` event dispatched on the window, as the
 * shell's own handler receives one; waits for the root level drawn or for the outcome text.
 */
export async function drop(page: Page, name: string, text = fixtureText(name)): Promise<void> {
  await page.goto("/");
  await page.evaluate(({ text, file }) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], file, { type: "application/json" }));
    window.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { text, file: `${name}.json` });
  await page.waitForFunction(() =>
    document.querySelector("svg.canvas[data-ready]") !== null
    || (document.querySelector("pre.outcome")?.textContent ?? "No file open.") !== "No file open.");
}

/** Opens the level at `path` by double-clicking down from the root along it. */
export async function openPath(page: Page, path: string): Promise<void> {
  const segments = path.split("/");
  for (let i = 1; i <= segments.length; i++) {
    const p = segments.slice(0, i).join("/");
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
 * other than the drawing prefixes its name, `<check>.<fixture>__<level>.png`.
 */
export async function shot(page: Page, fixture: string, level: string, check?: string): Promise<void> {
  const name = `${check ? `${check}.` : ""}${fixture}__${level === "" ? "root" : level.replaceAll("/", "__")}.png`;
  await page.screenshot({ path: fileURLToPath(new URL(name, screenshots)) });
}

/** Every element under the canvas carrying `selected`. */
export const selected = (page: Page) => page.locator("svg.canvas .selected");

/** The tree's rows, node and folder; counted with `toHaveCount`, which retries. */
export const rows = (page: Page) => page.locator("nav.tree .row");

/** The status bar, read with `toContainText` or `toHaveAttribute("data-kind", ...)`. */
export const status = (page: Page) => page.locator("footer.status");

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

export { expect };
