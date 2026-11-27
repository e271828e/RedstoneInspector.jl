// The diagnostics overlay (visual_grammar.md answers 8 and 9, workspace.md
// answers 10 and 3): member halos and the chain's wires in the error hue above
// every halo, the continuation badge opening the child, the dead hop's chord, a
// probe failure's badge reading the function, amber for a warning, the port and
// wire marks on a synthetic descriptor, no dimming until a badge focuses its
// diagnostic. Counts from the oracle (`overlay.py`); geometry read off the DOM.
// A loop's badge on a pin it leaves through (answer 8 as amended by the polish batch),
// beside the port it crosses (the look pass of 2026-11-27, 1.4); a long diagnostic pill
// cut to its room, its title opening with the whole text (6.1).
import { test, type Page } from "@playwright/test";
import { drop, effectiveOpacity, expect, fixtureText, openPath, pillByPort, press, readyLevel, shot } from "./fixtures";

const svg = (page: Page) => page.locator("svg.canvas");
const drawer = (page: Page) => page.locator("section.drawer");
const halo = (page: Page, id: string) => page.locator(`g.overlay rect.mark-halo[data-id="${id}"]`);
const markWires = (page: Page) => page.locator("g.overlay path.mark-wire").evaluateAll((ps) => ps.map((p) => p.getAttribute("data-wire")).sort());
const style = (page: Page, sel: string, prop: string) => page.locator(sel).first().evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);
const opacity = (page: Page, sel: string) => style(page, sel, "opacity");
/** A port square's center in world units, from its box and its block's translation. */
const center = (page: Page, port: string) => page.locator(`rect.port[data-port="${port}"]`).evaluate((r: SVGRectElement) => {
  const b = r.getBBox(), m = (r.parentNode as SVGGElement).transform.baseVal.consolidate()!.matrix;
  return { x: b.x + b.width / 2 + m.e, y: b.y + b.height / 2 + m.f };
});

test("failure_cycle: the members haloed and the chain's two wires marked above everything, no badge, no dimming", async ({ page }) => {
  await drop(page, "failure_cycle");
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(page.locator('rect.mark-halo[data-severity="error"]')).toHaveCount(2);
  await expect(halo(page, "plant")).toHaveAttribute("data-severity", "error");
  await expect(halo(page, "ctl")).toHaveAttribute("data-severity", "error");
  expect(await markWires(page)).toEqual(["ctl|in|y", "plant|in|u"]);
  for (const id of ["ctl|in|y", "plant|in|u"]) {
    const mark = page.locator(`path.mark-wire[data-wire="${id}"]`);
    expect(await mark.getAttribute("d")).toBe(await page.locator(`path.wire[data-wire="${id}"]`).getAttribute("d"));
    expect(await style(page, `path.mark-wire[data-wire="${id}"]`, "stroke-width")).toBe("3px");
    expect(await style(page, `path.mark-wire[data-wire="${id}"]`, "stroke")).toBe(await style(page, 'rect.mark-halo[data-id="plant"]', "stroke"));
  }
  expect(await style(page, 'rect.mark-halo[data-id="plant"]', "stroke")).not.toBe(await style(page, 'g.block[data-id="plant"] > .halo', "stroke"));
  await expect(page.locator("g.badge")).toHaveCount(0);
  await expect(page.locator("path.chord")).toHaveCount(0);
  expect(await svg(page).evaluate((s) => s.lastElementChild?.classList.contains("overlay"))).toBe(true);
  // no dimming by default
  for (const c of [/legend-focus/, /diagnostic-focus/, /route-focus/]) await expect(svg(page)).not.toHaveClass(c);
  expect(await opacity(page, 'g.block[data-id="plant"] > .shape')).toBe("1");

  // the selection's halo under the error's
  await page.locator('g.block[data-id="plant"]').click();
  const selection = page.locator('g.block.selected[data-id="plant"] > .halo');
  await expect(selection).toHaveCount(1);
  expect(await opacity(page, 'g.block.selected[data-id="plant"] > .halo')).toBe("0.5");
  const after = await page.evaluate(() => {
    const sel = document.querySelector('g.block.selected[data-id="plant"] > .halo')!;
    const mark = document.querySelector('rect.mark-halo[data-id="plant"]')!;
    return !!(sel.compareDocumentPosition(mark) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(after).toBe(true);
});

test("failure_nested: plant and the root's two hops, ctl's loop badge opening ctl with pi and the two inner hops", async ({ page }) => {
  await drop(page, "failure_nested");
  await expect(halo(page, "plant")).toHaveAttribute("data-severity", "error");
  await expect(page.locator("rect.mark-halo")).toHaveCount(1);
  expect(await markWires(page)).toEqual(["ctl|in|y", "plant|in|u"]);
  const loop = page.locator('g.badge[data-id="ctl"][data-role="continues"]');
  await expect(loop).toHaveCount(1);
  await expect(page.locator("g.badge")).toHaveCount(1);
  await expect(loop.locator("text.badge-text")).toHaveText("loop");
  await expect(loop.locator("title")).toHaveText("The loop continues inside; open it to follow the chain.");
  await shot(page, "failure_nested", "", "overlay");
  await loop.click();
  await page.locator(readyLevel("ctl")).waitFor();
  await expect(halo(page, "ctl/pi")).toHaveAttribute("data-severity", "error");
  await expect(page.locator("rect.mark-halo")).toHaveCount(1);
  expect(await markWires(page)).toEqual(["ctl/pi|in|y", "⟨out⟩u|in|u"]);
  // the chain leaves ctl through its two pins, each with the loop's badge (answer 8 as amended by the polish batch)
  expect(await page.locator("g.badge").evaluateAll((bs) => bs.map((b) => [b.getAttribute("data-id"), b.getAttribute("data-role")]).sort())).toEqual([
    ["⟨in⟩y", "continues"], ["⟨out⟩u", "continues"],
  ]);
  await shot(page, "failure_nested", "ctl", "overlay");
  // the tree: a red mark on the members, on ctl (a level the chain touches) and on the root, which holds them beneath
  const mark = (path: string) => page.locator(`nav.tree .row[data-path="${path}"] span.mark[data-mark="error"]`);
  for (const p of ["plant", "ctl", "ctl/pi"]) await expect(mark(p)).toHaveAttribute("title", "1 error");
  await expect(mark("")).toHaveAttribute("title", "1 error, beneath");
});

test("failure_nested: inside ctl the pins the chain leaves through take the loop badge beside their ports, above the wire and outside the pin, as ctl's stands left of its input y at the root (answer 8 as amended by the look pass, 1.4); a click climbs to the root with the chain drawn", async ({ page }) => {
  await drop(page, "failure_nested");
  const rule = async (port: string) => {
    const q = await pillByPort(page.locator(`g.badge[data-role="continues"][data-port="${port}"]`));
    expect([q.above, q.outside, q.near, q.label], port).toEqual([true, true, true, false]);
  };
  await press(page, "y");
  await rule("ctl|in|y");
  await openPath(page, "ctl");
  await expect(page.locator('g.badge[data-role="continues"]')).toHaveCount(2);
  for (const port of ["⟨in⟩y|out|y", "⟨out⟩u|in|u"]) await rule(port);
  const badge = page.locator('g.badge[data-role="continues"][data-id="⟨in⟩y"]');
  await expect(badge).toHaveAttribute("data-severity", "error");
  await expect(badge.locator("text.badge-text")).toHaveText("loop");
  await expect(badge.locator("title")).toHaveText("The loop leaves this level here; go to the parent to follow the chain.");
  await badge.click();
  await page.locator(readyLevel("")).waitFor();
  expect(await markWires(page)).toEqual(["ctl|in|y", "plant|in|u"]);
  await expect(page.locator('g.badge[data-id="ctl"][data-role="continues"]')).toHaveCount(1);
  // the root's pins take none
  await expect(page.locator('g.badge[data-id^="⟨"]')).toHaveCount(0);
});

test("failure_dead: the dead hop's dashed chord across m from g's square to F's, its cross at the middle, 8 units across (the look pass, 7.1)", async ({ page }) => {
  await drop(page, "failure_dead");
  const chord = page.locator('path.chord[data-id="m"]');
  await expect(chord).toHaveCount(1);
  await expect(chord).toHaveAttribute("data-from", "m|in|g");
  await expect(chord).toHaveAttribute("data-to", "m|out|F");
  const ends = await chord.evaluate((p: SVGPathElement) => {
    const n = p.getTotalLength();
    const a = p.getPointAtLength(0), z = p.getPointAtLength(n);
    return { a: { x: a.x, y: a.y }, z: { x: z.x, y: z.y } };
  });
  const from = await center(page, "m|in|g"), to = await center(page, "m|out|F");
  for (const [p, q] of [[ends.a, from], [ends.z, to]]) {
    expect(Math.abs(p.x - q.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(p.y - q.y)).toBeLessThanOrEqual(0.5);
  }
  expect(await style(page, 'path.chord[data-id="m"]', "stroke-dasharray")).not.toBe("none");
  const cross = await page.locator('path.cross[data-id="m"]').evaluate((p: SVGPathElement) => {
    const b = p.getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2, width: b.width, height: b.height };
  });
  // ±4 on each axis (the look pass, 7.1)
  expect([cross.width, cross.height]).toEqual([8, 8]);
  expect(Math.abs(cross.x - (from.x + to.x) / 2)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(cross.y - (from.y + to.y) / 2)).toBeLessThanOrEqual(0.5);
  await expect(halo(page, "m")).toHaveCount(1);
  await expect(halo(page, "g2")).toHaveCount(1);
  expect(await markWires(page)).toEqual(["g2|in|e", "m|in|g"]);
  await shot(page, "failure_dead", "", "overlay");
});

test("failure_probe: t's badge reads the function, s/g's the kind in amber; t's badge focuses its row and dims the rest", async ({ page }) => {
  await drop(page, "failure_probe");
  const first = JSON.parse(fixtureText("failure_probe")).failure.diagnostics[0].message.split("\n")[0];
  const t = page.locator('g.badge[data-id="t"]');
  await expect(t).toHaveAttribute("data-role", "diagnostic");
  await expect(t).toHaveAttribute("data-severity", "error");
  await expect(t.locator("text.badge-text")).toHaveText("y_state");
  await expect(t.locator("title")).toHaveText(`y_state\n${first}`);
  // s, a closed assembly the chain never enters, carries none
  await expect(page.locator("g.badge")).toHaveCount(1);
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("2");
  const errorFill = await style(page, 'g.badge[data-id="t"] rect', "fill");

  await openPath(page, "s");
  await expect(halo(page, "s/g")).toHaveAttribute("data-severity", "warning");
  const g = page.locator('g.badge[data-id="s/g"]');
  await expect(g).toHaveAttribute("data-severity", "warning");
  await expect(g.locator("text.badge-text")).toHaveText(/^E.*…$/);
  expect(await style(page, 'g.badge[data-id="s/g"] rect', "fill")).not.toBe(errorFill);
  await shot(page, "failure_probe", "s", "overlay");

  await press(page, "Backspace");
  await page.locator(readyLevel("")).waitFor();
  await press(page, "Shift+S");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
  await t.click();
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page)).toHaveAttribute("data-tab", "diagnostics");
  await expect(svg(page)).toHaveClass(/\bdiagnostic-focus\b/);
  await expect(svg(page)).toHaveAttribute("data-focus", "0");
  await expect(page.locator('li.diagnostic[data-index="0"]')).toHaveClass(/\bcurrent\b/);
  expect(await opacity(page, 'g.block[data-id="s"] > .shape')).toBe("0.35");
  expect(await opacity(page, 'g.block[data-id="t"] > .shape')).toBe("1");
  // the overlay never dims, by its own opacity or a group's
  expect(await effectiveOpacity(page, 'rect.mark-halo[data-id="t"]')).toBe(0.5);
  expect(await effectiveOpacity(page, 'g.badge[data-id="t"]')).toBe(1);
  await press(page, "Escape");
  await expect(svg(page)).not.toHaveClass(/diagnostic-focus/);
});

/**
 * A diagnostic pill against its block, in the svg's units: its ends, the block's ends less the inset of 4, the order
 * badge's right end when one shows, its text, its title's first line, and the width of the cut one character longer.
 */
const diagnosticPill = (page: Page, id: string) => page.locator(`g.badge[data-role="diagnostic"][data-id="${id}"]`).evaluate((b, id) => {
  const g = document.querySelector<SVGGElement>(`g.block[data-id="${id}"]`)!;
  const m = g.transform.baseVal.consolidate()!.matrix, s = g.querySelector<SVGRectElement>(":scope > rect.shape")!;
  const r = b.querySelector("rect")!, v = (a: SVGAnimatedLength) => a.baseVal.value;
  const o = g.querySelector<SVGRectElement>("g.order-badge rect");
  return {
    left: v(r.x), right: v(r.x) + v(r.width), inLeft: m.e + v(s.x) + 4, inRight: m.e + v(s.x) + v(s.width) - 4,
    order: o ? m.e + v(o.x) + v(o.width) : undefined,
    text: b.querySelector("text.badge-text")!.textContent!, head: b.querySelector("title")!.textContent!.split("\n")[0],
    /** A text's width in the pill's font, measured on a clone of its text. */
    measure: (() => {
      const t = b.querySelector("text.badge-text")!;
      const head = b.querySelector("title")!.textContent!.split("\n")[0], cut = t.textContent!.slice(0, -1);
      const c = t.cloneNode() as SVGTextElement;
      c.textContent = head.slice(0, cut.length + 1) + "…";
      t.parentNode!.appendChild(c);
      const w = c.getComputedTextLength();
      c.remove();
      return w;
    })(),
  };
}, id);

test("a long diagnostic pill is cut with an ellipsis to end at the block's left inset, or 2 short of the order badge with the badges on; its title opens with the whole text (visual_grammar.md answer 8 as amended by the look pass, 6.1)", async ({ page }) => {
  await drop(page, "failure_probe");
  await openPath(page, "s");
  const p = await diagnosticPill(page, "s/g");
  expect(p.head).toBe("EmptyFaceSelection");
  expect(p.text).toMatch(/…$/);
  expect(p.head.startsWith(p.text.slice(0, -1))).toBe(true);
  expect(p.right).toBeCloseTo(p.inRight, 3);
  expect(p.left).toBeGreaterThanOrEqual(p.inLeft - 1e-3);
  // one more character would pass the inset: the cut is the longest that fits, padding 4 a side, within 3 units, as
  // the cut measures on a canvas and Firefox's svg text measures about 2 units narrower
  expect(Math.ceil(p.measure) + 8).toBeGreaterThan(p.inRight - p.inLeft - 3);
  await shot(page, "failure_probe", "s", "diagnostic-cut");
  // with the order badges on, warning's g stops short of its order badge
  await drop(page, "warning");
  await press(page, "o");
  const q = await diagnosticPill(page, "g");
  expect(q.order, "g carries an order badge").toBeDefined();
  expect(q.head).toBe("EmptyFaceSelection");
  expect(q.left).toBeGreaterThanOrEqual(q.order! + 2 - 1e-3);
  expect(q.right).toBeCloseTo(q.inRight, 3);
  expect(q.text).toMatch(/…$/);
  await shot(page, "warning", "", "diagnostic-cut-order");
});

test("warning: the drawer closed with its count, g's halo amber, nothing in the error hue", async ({ page }) => {
  await drop(page, "warning");
  await expect(drawer(page)).toHaveAttribute("data-open", "false");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("1");
  await expect(halo(page, "g")).toHaveAttribute("data-severity", "warning");
  await expect(page.locator('[data-severity="error"]')).toHaveCount(0);
});

test("a synthetic unfed input marks ctl's port and its wire in the error hue, a warning plant in amber", async ({ page }) => {
  const d = JSON.parse(fixtureText("failure_cycle"));
  d.failure.diagnostics = [{
    kind: "UnconnectedInput", severity: "error", path: "ctl", message: "`ctl/ref` is fed by nothing",
    marks: { ports: [{ path: "ctl", port: "ref" }], wires: [{ from: { path: "", port: "ref" }, to: { path: "ctl", port: "ref" } }] },
  }];
  d.failure.warnings = [{ kind: "EmptyFaceSelection", severity: "warning", path: "plant", message: "nothing passes through" }];
  await drop(page, "failure_cycle", JSON.stringify(d));
  await expect(page.locator('rect.mark-port[data-port="ctl|in|ref"]')).toHaveAttribute("data-severity", "error");
  await expect(page.locator("rect.mark-port")).toHaveCount(1);
  await expect(page.locator('path.mark-wire[data-wire="ctl|in|ref"]')).toHaveAttribute("data-severity", "error");
  await expect(page.locator("path.mark-wire")).toHaveCount(1);
  await expect(halo(page, "ctl")).toHaveAttribute("data-severity", "error");
  await expect(halo(page, "plant")).toHaveAttribute("data-severity", "warning");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("2");
});

test("failure_structure: no canvas, the drawer's two rows", async ({ page }) => {
  await drop(page, "failure_structure");
  await expect(svg(page)).toHaveCount(0);
  await expect(drawer(page)).toHaveAttribute("data-open", "true");
  await expect(drawer(page).locator('button.tab[data-tab="diagnostics"] .count')).toHaveText("2");
  await expect(page.locator("li.diagnostic")).toHaveCount(2);
});
