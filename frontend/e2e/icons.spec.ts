// Library icons (visual_grammar.md answers 7 and 1): the glyph or the short text
// in place of the display name, keyed on the alias, then the type; the icon's
// fixed width in the sizing rule. Ids from the oracle (`grammar.py`).
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, openPath, shot } from "./fixtures";
import { CONSTANT_WIDTH, FACE_FONT, GUTTER, ICON_WIDTH, MARK, MIN_WIDTH, NAME_FONT, PAD, SEGMENT_FONT, DISPLAY_NAME_WIDTH } from "../src/canvas/size";

type Face = { name: string; pinned: boolean };
type Node = { path: string; inputs: Face[]; outputs: Face[] };
const node = (fixture: string, path: string): Node =>
  JSON.parse(fixtureText(fixture)).build.structure.nodes.find((n: Node) => n.path === path);
const icon = (page: Page, path: string) => page.locator(`g.block[data-id="${path}"] g.icon`);
/** A text icon's drawn text, its `<title>` left out. */
const iconText = (page: Page, path: string) => icon(page, path).locator("text").textContent();
/** A drawn text that is the whole string, or a prefix of it cut with an ellipsis. */
const wholeOrCut = (drawn: string | null, whole: string) =>
  drawn === whole || (!!drawn?.endsWith("…") && drawn.length > 1 && whole.startsWith(drawn.slice(0, -1)));
/** Text widths measured in the page with a canvas context, as the canvas measures them. */
const widths = (page: Page, items: [string, string][]) => page.evaluate((items) => {
  const ctx = document.createElement("canvas").getContext("2d")!;
  return items.map(([s, font]) => { ctx.font = font; return ctx.measureText(s).width; });
}, items);
/** The sizing rule's width for a leaf with an icon: the icon's width in place of the display name's. */
async function ruleWidth(page: Page, fixture: string, path: string, segment: string, second: number): Promise<number> {
  const n = node(fixture, path);
  const rows = Math.max(n.inputs.length, n.outputs.length, 1);
  const names: [string, string][] = [[segment, SEGMENT_FONT], ...[...n.inputs, ...n.outputs].map((f): [string, string] => [f.name, FACE_FONT])];
  const [seg, ...faces] = await widths(page, names);
  const face = (i: number, side: "in" | "out") => {
    const list = side === "in" ? n.inputs : n.outputs, k = side === "in" ? i : n.inputs.length + i;
    return i < list.length ? faces[k] + (list[i].pinned ? MARK : 0) : 0;
  };
  let body = 0;
  for (let i = 0; i < rows; i++) body = Math.max(body, face(i, "in") + face(i, "out"));
  return Math.ceil(Math.max(MIN_WIDTH, Math.max(seg, second) + 2 * PAD, body + 2 * PAD + GUTTER));
}
const shapeWidth = async (page: Page, path: string) => Number(await page.locator(`g.block[data-id="${path}"] > rect.shape`).getAttribute("width"));

test("closed_loop: the icons of lqr_controller and sensing, by alias before type, sized by the icon's width", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "lqr_controller");
  for (const [id, n] of [["pack", 4], ["unpack", 1], ["lqr", 1], ["constant", 1]] as const)
    await expect(page.locator(`g.icon[data-icon="${id}"]`), id).toHaveCount(n);
  await expect(page.locator("g.icon")).toHaveCount(7);
  // whole on a Mac (49 px); CI's wider Linux fonts may cut it, so the pin reads whole or cut, the title whole
  expect(wholeOrCut(await iconText(page, "lqr_controller/free_pair"), "Int8[0, 0]")).toBe(true);
  await expect(icon(page, "lqr_controller/free_pair").locator("title")).toContainText("Int8[0, 0]");
  // a Junction with no alias keeps its display name
  await expect(icon(page, "lqr_controller/engaged")).toHaveCount(0);
  await expect(page.locator('g.block[data-id="lqr_controller/engaged"] text.display')).toHaveText("Junction");
  // a block with an icon draws no display name
  await expect(page.locator('g.block[data-id="lqr_controller/state_pack"] text.display')).toHaveCount(0);
  // the icon's fixed width stands in for the display name's in the head term
  expect(await shapeWidth(page, "lqr_controller/state_pack")).toBe(await ruleWidth(page, "closed_loop", "lqr_controller/state_pack", "state_pack", ICON_WIDTH));
  await shot(page, "closed_loop", "lqr_controller", "icons");

  await page.locator("nav.breadcrumb").getByText("closed_loop").click();
  await openPath(page, "sensing");
  await expect(icon(page, "sensing/altimeter")).toHaveAttribute("data-icon", "sum");
  await expect(page.locator('g.block[data-id="sensing/altimeter"] > title')).toContainText("Redstone.Blocks.SumJunction");
  await expect(icon(page, "sensing/noise")).toHaveAttribute("data-icon", "noise");
});

test("kinds and descent: the Constant's value, its opaque frame glyph, the stop request", async ({ page }) => {
  await drop(page, "kinds");
  await expect(page.locator('g.icon[data-icon="constant"]')).toHaveCount(5);
  await expect(icon(page, "fn")).toHaveAttribute("data-icon", "constant-opaque");
  await expect(icon(page, "fn").locator("use")).toHaveAttribute("href", "#icon-constant-opaque");
  // the opened entries joined, whole or cut at CONSTANT_WIDTH (60 px cuts it on a Mac), the whole in the title
  expect(wholeOrCut(await iconText(page, "nt"), "a=1.0, b=2.0")).toBe(true);
  await expect(icon(page, "nt").locator("title")).toContainText("a=1.0, b=2.0");
  for (const p of ["nt", "mat", "v", "r", "i"]) {
    const t = (await iconText(page, p))!;
    const [w, whole] = await widths(page, [[t, NAME_FONT], [t.replace(/…$/, ""), NAME_FONT]]);
    expect(t.endsWith("…") ? w : whole, p).toBeLessThanOrEqual(CONSTANT_WIDTH);
  }
  expect(await iconText(page, "mat")).toMatch(/…$/);
  await expect(icon(page, "mat").locator("title")).toContainText("[1.0 3.0; 2.0 4.0]");
  expect(await iconText(page, "i")).toBe("0");

  await drop(page, "descent");
  await expect(icon(page, "stop")).toHaveAttribute("data-icon", "stop");
  await expect(page.locator(`symbol#icon-stop`)).toHaveCount(1);
});

// The oracle's library line: 26 of the roster's 27 ids; `constant-opaque` is kinds' alone.
const LIBRARY_IDS = [
  "sum", "or", "and", "pack", "unpack", "switch", "stop", "constant", "step", "source", "noise", "integrator",
  "limited-integrator", "lag", "state-space", "transfer-function", "relay", "unit-delay", "discrete-integrator",
  "rate-limiter", "transfer-function-z", "discrete-limited-integrator", "delay", "freeze", "pid", "lqr",
];

test("library: every roster id drawn, Delay's K from its signature, a long display name's width given up", async ({ page }) => {
  await drop(page, "library");
  for (const id of LIBRARY_IDS) await expect(page.locator(`g.icon[data-icon="${id}"]`), id).not.toHaveCount(0);
  await expect(page.locator("g.icon")).toHaveCount(31);
  await expect(icon(page, "fn")).toHaveCount(0);
  expect(await iconText(page, "delay")).toBe("z⁻³");
  // every glyph id the page draws has its symbol
  for (const id of await page.locator("g.icon use").evaluateAll((us) => us.map((u) => u.getAttribute("href")!)))
    await expect(page.locator(`symbol${id}`), id).toHaveCount(1);
  // a display name cut at 120 px would widen zoh_tf's box; the icon keeps it to the rule's width
  const [name] = await widths(page, [["DiscretizedTransferFunction", NAME_FONT]]);
  expect(await shapeWidth(page, "zoh_tf")).toBe(await ruleWidth(page, "library", "zoh_tf", "zoh_tf", ICON_WIDTH));
  expect(await shapeWidth(page, "zoh_tf")).toBeLessThan(Math.min(name, DISPLAY_NAME_WIDTH) + 2 * PAD);
  await shot(page, "library", "", "icons");
});
