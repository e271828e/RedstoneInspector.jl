// Every fixture draws each level with the oracle's counts (visual_grammar.md
// answers 1 to 4, build_release.md answer 5); a primitive root's block labelled
// with the model's label (the polish batch).
import { test } from "@playwright/test";
import { counts, drop, expect, openPath, readyLevel, shot } from "./fixtures";

interface Pins { blocks: number; wires: number; inPins: number; outPins: number; closed: number; stage1: number; pinned: number }
const row = (blocks: number, wires: number, inPins: number, outPins: number, closed: number, stage1: number, pinned: number): Pins =>
  ({ blocks, wires, inPins, outPins, closed, stage1, pinned });

// From the per-level oracle over the committed fixtures; blocks count pins plus children, the pinned marks a pinned
// root input's tag with a primitive's pinned faces (deployment_overlay.md answer 14).
const CLOSED_LOOP: Record<string, Pins> = {
  "": row(9, 30, 3, 0, 5, 6, 2),
  sensing: row(4, 3, 1, 1, 0, 1, 0),
  pid_controller: row(16, 22, 9, 2, 0, 5, 1),
  lqr_controller: row(21, 21, 11, 2, 0, 2, 1),
  selection: row(13, 12, 5, 4, 0, 2, 0),
  actuators: row(8, 6, 2, 2, 0, 2, 0),
};
// large's root draws its two output pins in reverse declaration order. Increment 6's ELK pass found one option
// that fixes it, forceNodeModelOrder, and it raises large's crossings (663 to 699), so the option stays off, the
// reversed order is accepted and no check pins the pins' order.
const RATES: Record<string, Pins> = {
  "": row(6, 5, 0, 3, 2, 1, 0),
  fast: row(5, 4, 1, 2, 1, 0, 0),
  "fast/outer": row(3, 2, 1, 1, 0, 0, 0),
  slow: row(3, 2, 1, 1, 0, 0, 0),
};
const LIBRARY: Record<string, Pins> = { "": row(43, 48, 2, 0, 0, 29, 9) };
const TIMING: Record<string, Pins> = {
  "": row(11, 9, 2, 6, 1, 0, 3),
  fast: row(7, 6, 1, 4, 1, 0, 0),
  "fast/outer": row(7, 6, 1, 3, 1, 0, 0),
  "fast/outer/deep": row(3, 2, 1, 1, 0, 0, 0),
};
const LARGE_INNER = ["b008", "b023", "b038", "b053", "b068", "b083", "b098", "b113", "b128", "b143"];
const TABLE: Record<string, Record<string, Pins>> = {
  aircraft: { "": row(3, 2, 2, 0, 0, 6, 0) },
  descent: { "": row(5, 4, 2, 0, 0, 7, 0) },
  closed_loop: CLOSED_LOOP,
  closed_loop_deployment: CLOSED_LOOP,
  containers: { "": row(8, 7, 1, 1, 1, 0, 0), scale: row(3, 2, 1, 1, 0, 0, 0) },
  primitive: { "": row(5, 4, 2, 2, 0, 1, 0) },
  kinds: { "": row(18, 10, 0, 9, 0, 9, 6) },
  rates: RATES,
  rates_deployment: RATES,
  large: { "": row(156, 323, 4, 2, 10, 294, 4), ...Object.fromEntries(LARGE_INNER.map((p) => [p, row(4, 3, 1, 1, 0, 2, 0)])) },
  failure_cycle: { "": row(5, 5, 2, 1, 0, 0, 1) },
  library: LIBRARY,
  library_deployment: LIBRARY,
  timing: TIMING,
  timing_deployment: TIMING,
  approach_deployment: {
    "": row(8, 7, 5, 0, 1, 1, 2),
    vehicle: row(11, 20, 5, 1, 4, 6, 0),
    "vehicle/actuators": row(8, 6, 2, 2, 0, 2, 0),
    "vehicle/cascade": row(16, 22, 9, 2, 0, 5, 1),
    "vehicle/selection": row(15, 14, 5, 5, 0, 3, 0),
    "vehicle/sensing": row(4, 3, 1, 1, 0, 1, 0),
  },
  events_deployment: {
    "": row(11, 7, 1, 6, 3, 2, 0),
    "pods/a": row(3, 2, 0, 1, 0, 1, 0),
    "pods/b": row(3, 2, 0, 1, 0, 1, 0),
    nest: row(4, 2, 0, 2, 1, 1, 1),
    "nest/deep": row(2, 1, 0, 1, 0, 1, 0),
  },
  failure_nested: { "": row(5, 5, 2, 1, 1, 0, 1), ctl: row(4, 3, 2, 1, 0, 0, 0) },
  failure_dead: { "": row(5, 5, 2, 0, 0, 0, 0) },
  failure_probe: { "": row(3, 1, 1, 0, 1, 0, 0), s: row(4, 3, 1, 1, 0, 0, 0) },
  warning: { "": row(4, 3, 1, 1, 0, 0, 0) },
};

for (const [fixture, levels] of Object.entries(TABLE)) {
  for (const [level, pins] of Object.entries(levels)) {
    test(`${fixture} at ${level || "the root"}: the oracle's blocks, wires, pins, closed assemblies, open squares and pinned marks, each root input a tag`, async ({ page }) => {
      const t0 = Date.now();
      await drop(page, fixture);
      await page.locator(readyLevel("")).waitFor();
      if (fixture === "large" && level === "") console.log(`large root: dropped to drawn in ${Date.now() - t0} ms`);
      if (level !== "") await openPath(page, level);
      await expect(page.locator(readyLevel(level))).toHaveCount(1);
      const c = await counts(page);
      const { rootInputs, tags, capsules, ...drawn } = c;
      expect(drawn).toEqual(pins);
      // every `in` pin of the root is a root input drawn as the pointed tag, every other pin a capsule
      expect(rootInputs).toBe(level === "" ? pins.inPins : 0);
      expect(tags).toBe(rootInputs);
      expect(capsules).toBe(pins.inPins + pins.outPins - rootInputs);
      await shot(page, fixture, level);
    });
  }
}

test("failure_structure draws nothing and says so", async ({ page }) => {
  await drop(page, "failure_structure");
  await expect(page.locator("pre.outcome")).toContainText("no structure to draw");
  await expect(page.locator("svg.canvas")).toHaveCount(0);
  await shot(page, "failure_structure", "");
});

test("primitive: the root's block draws the model's label on its bold first line", async ({ page }) => {
  await drop(page, "primitive");
  const segment = page.locator('g.block[data-id=""] text.segment');
  await expect(segment).toHaveText("primitive");
  expect(await segment.evaluate((t) => getComputedStyle(t).fontWeight)).toBe("600");
  // the first line fits the block
  const [text, shape] = await Promise.all([segment.evaluate((t: SVGTextElement) => t.getComputedTextLength()), page.locator('g.block[data-id=""] > .shape').evaluate((r: SVGRectElement) => r.width.baseVal.value)]);
  expect(text).toBeLessThan(shape);
  await shot(page, "primitive", "", "root-label");
});
