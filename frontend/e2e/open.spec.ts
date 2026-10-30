// Opening and climbing (workspace.md answer 3): double-click or Enter opens a
// closed assembly, Backspace goes to the parent, a leaf does not open.
import { test } from "@playwright/test";
import { drop, expect, fixtureText, openPath, readyLevel, shot } from "./fixtures";

const levelLine = (page: import("@playwright/test").Page) => page.locator("[data-level-path]");

test("closed_loop: double-click and Enter open, Backspace climbs", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="sensing"]').dblclick();
  await page.locator(readyLevel("sensing")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "sensing");
  await expect(levelLine(page)).toContainText("sensing");
  await expect(page.locator("g.block")).toHaveCount(4);

  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(9);

  await page.locator('g.block[data-id="actuators"]').click();
  await page.keyboard.press("Enter");
  await page.locator(readyLevel("actuators")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "actuators");
  await shot(page, "closed_loop", "actuators", "open");
});

test("closed_loop: a double-click on a leaf leaves the level as it is", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').dblclick();
  await page.waitForTimeout(300);
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(9);
});

test("closed_loop: Enter on a selected leaf leaves the level as it is", async ({ page }) => {
  await drop(page, "closed_loop");
  await page.locator('g.block[data-id="plant"]').click();
  await expect(page.locator('g.block.selected[data-id="plant"]')).toHaveCount(1);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator(readyLevel(""))).toHaveCount(1);
});

test("closed_loop: actuators draws its pins and its two chains in declared order", async ({ page }) => {
  type Node = { path: string; type: string; inputs: { name: string }[]; outputs: { name: string }[] };
  const nodes: Node[] = JSON.parse(fixtureText("closed_loop")).build.structure.nodes;
  const node = nodes.find((n) => n.path === "actuators")!;
  const children = nodes.filter((n) => n.path.startsWith("actuators/") && !n.path.slice(10).includes("/"));
  await drop(page, "closed_loop");
  await openPath(page, "actuators");
  const at = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll<SVGGElement>("svg.canvas g.block")]
    .map((g) => { const m = g.transform.baseVal.consolidate()!.matrix; return [g.dataset.id!, { x: m.e, y: m.f }]; })));
  const topDown = (ids: string[]) => [...ids].sort((a, b) => at[a].y - at[b].y);
  const ins = node.inputs.map((f) => `⟨in⟩${f.name}`), outs = node.outputs.map((f) => `⟨out⟩${f.name}`);
  expect(topDown(ins)).toEqual(ins);
  expect(topDown(outs)).toEqual(outs);
  // the two chains' children of one type, the limiters and the lags, top to bottom in declaration order
  const byType = new Map<string, string[]>();
  for (const n of children) byType.set(n.type, [...(byType.get(n.type) ?? []), n.path]);
  expect([...byType.values()].map((ids) => ids.length)).toEqual([2, 2]);
  for (const ids of byType.values()) expect(topDown(ids)).toEqual(ids);
});

test("closed_loop: lqr_controller runs every wire left to right, the tracker after its feeders", async ({ page }) => {
  await drop(page, "closed_loop");
  await openPath(page, "lqr_controller");
  const ends = await page.evaluate(() => [...document.querySelectorAll<SVGPathElement>("svg.canvas path.wire")]
    .map((p) => ({ id: p.dataset.wire!, x0: p.getPointAtLength(0).x, x1: p.getPointAtLength(p.getTotalLength()).x })));
  expect(ends.length).toBeGreaterThan(0);
  expect(ends.filter((e) => !(e.x0 < e.x1)).map((e) => e.id)).toEqual([]);
  const at = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll<SVGGElement>("svg.canvas g.block")]
    .map((g) => [g.dataset.id!, g.transform.baseVal.consolidate()!.matrix.e])));
  const x = (name: string) => at[`lqr_controller/${name}`];
  for (const feeder of ["state_pack", "z_pack", "z_ref_pack", "command_pack", "free_pair", "engaged"])
    expect(x("tracker"), feeder).toBeGreaterThan(x(feeder));
  expect(x("tracker")).toBeLessThan(x("u_unpack"));
});

test("rates: two deep and two Backspaces back", async ({ page }) => {
  await drop(page, "rates");
  await page.locator('g.block[data-id="fast"]').dblclick();
  await page.locator(readyLevel("fast")).waitFor();
  await page.locator('g.block[data-id="fast/outer"]').dblclick();
  await page.locator(readyLevel("fast/outer")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "fast/outer");
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("fast")).waitFor();
  await page.keyboard.press("Backspace");
  await page.locator(readyLevel("")).waitFor();
  await expect(levelLine(page)).toHaveAttribute("data-level-path", "");
  await expect(page.locator("g.block")).toHaveCount(6);
  await shot(page, "rates", "", "open");
});
