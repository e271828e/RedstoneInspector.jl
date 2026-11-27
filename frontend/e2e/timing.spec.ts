// The timing tab and the hyperperiod chart (deployment_overlay.md answers 3, 8, 9 and 11; workspace.md answers 6
// and 7): a deployment's head list, the base grid's section with the grid report, a deployment's columns, every head a
// term of the help page's law, the build's closing sentence; the chart's rows, swatches and marks, the timeline fitted,
// scrolled under the labels or omitted, the frame tops drawn at their exact places. Figures from increment 10's
// oracle (`oracle/<fixture>.txt`); the geometry is a rule each check recomputes from the DOM.
import { test, type Page } from "@playwright/test";
import { drop, expect, fixtureText, press, pressAll, shot } from "./fixtures";

const drawer = (page: Page) => page.locator("section.drawer");
const body = (page: Page) => page.locator("section.drawer .tab-body");
const rows = (page: Page) => body(page).locator(".chart .chart-row");
/** The chart's minimum pitch and margin, `CHART_PITCH` and `CHART_PAD` of `timing.ts`. */
const PITCH = 10;
const PAD = 4;

/** Drops a model and opens the timing tab, in a drawer tall enough to read. */
async function timingOf(page: Page, name: string, text?: string): Promise<void> {
  await page.addInitScript(() => localStorage.setItem("redstone-inspector/prefs", JSON.stringify({ version: 1, sizes: { drawer: 640 } })));
  await drop(page, name, text);
  await drawer(page).locator('button.tab[data-tab="timing"]').click();
  await expect(drawer(page)).toHaveAttribute("data-tab", "timing");
}

/** A committed fixture's JSON edited: an inline copy. */
function edited(name: string, edit: (d: any) => void): string {
  const d = JSON.parse(fixtureText(name));
  edit(d);
  return JSON.stringify(d);
}

/** Each lane's due marks as `[n, cx]`, and its frame tops as `[k, x]`, read from the DOM. */
const lanes = (page: Page) => body(page).locator(".chart svg.lane").evaluateAll((ls) => ls.map((l) => ({
  D: Number(l.getAttribute("data-d")), phi: Number(l.getAttribute("data-phi")),
  marks: [...l.querySelectorAll("circle.due")].map((c) => [Number(c.getAttribute("data-n")), Number(c.getAttribute("cx"))]),
  tops: [...l.querySelectorAll("line.frame-top")].map((t) => [Number(t.getAttribute("data-k")), Number(t.getAttribute("x1"))]),
  width: Number(l.getAttribute("width")),
})));

/** The base grid's section, line by line. */
const baseGrid = (page: Page) => body(page).locator(".grid-report p, .grid-report li").allTextContents();

/** The pitch of a lane's base ticks, from two of its marks. */
const pitchOf = (marks: number[][]) => (marks[1][1] - marks[0][1]) / (marks[1][0] - marks[0][0]);

/**
 * The marks' rule: a row is due at base tick n exactly where n mod D₀ = Φ₀, n under the span's ticks, and tick n
 * stands n pitches in from the margin.
 */
function expectMarks(lane: { D: number; phi: number; marks: number[][] }, ticks: number, pitch: number): void {
  const due = Array.from({ length: ticks }, (_, n) => n).filter((n) => n % lane.D === lane.phi);
  expect(lane.marks.map((m) => m[0])).toEqual(due);
  for (const [n, cx] of lane.marks) expect(cx).toBeCloseTo(PAD + n * pitch, 6);
}

/** The head list's lines, each its items as `[name, value]`. */
const head = (page: Page) => body(page).locator("dl.head").evaluateAll((ls) => ls.map((l) =>
  [...l.querySelectorAll(".item")].map((i) => [i.querySelector("dt")!.textContent!, i.querySelector("dd")!.textContent!])));

test("timing_deployment: the head list's three lines, a colon after each name, no h_min, no attempt_budget and no event parameter, the splitting rows an item of their own, their paths alone in the code font", async ({ page }) => {
  await timingOf(page, "timing_deployment");
  expect(await head(page)).toEqual([
    [["Δt_frame:", "1/100 s"], ["Δt_base:", "1/300 s"]],
    [["algorithm:", "RK4()"], ["h_max:", "1/100 s"]],
    [["steps per unsplit frame:", "1"], ["rows that split frames:", "staggered"]],
  ]);
  // three lines on the screen, one under the other
  const tops = await body(page).locator("dl.head").evaluateAll((ls) => ls.map((l) => [...l.querySelectorAll(".item")].map((i) => Math.round(i.getBoundingClientRect().top))));
  expect(tops.map((t) => new Set(t).size)).toEqual([1, 1, 1]);
  expect(tops[1][0]).toBeGreaterThan(tops[0][0]);
  expect(tops[2][0]).toBeGreaterThan(tops[1][0]);
  // the code font is the values' and the paths', not the prose's
  const font = (item: string, sel: string) => body(page).locator(`dl.head .item[data-item="${item}"] ${sel}`).first().evaluate((e) => getComputedStyle(e).fontFamily);
  expect(await font("rows that split frames", "dd code")).toContain("monospace");
  for (const item of ["rows that split frames", "steps per unsplit frame"]) {
    expect(await font(item, "dt"), item).not.toContain("monospace");
    expect(await font(item, "dd"), item).not.toContain("monospace");
  }
  await expect(body(page).locator('dl.head .item[data-item="steps per unsplit frame"] code')).toHaveCount(0);
  // the head list comes first, then the chart, then the anchors; the law stays on the help page
  const order = await body(page).evaluate((b) => [...b.querySelectorAll("dl.head, .chart, table, .grid-report")].map((e) => e.className.split(" ")[0]));
  expect(order).toEqual(["head", "head", "head", "chart", "anchors", "grid-report", "scopes", "components"]);
  await expect(body(page)).not.toContainText("Δt(i) = Dₐ(i) · Δt(a)");
  await expect(body(page).locator("dl.head").first()).toBeVisible();
  for (const l of await head(page)) for (const [name] of l) expect(name).not.toMatch(/firing|localization/);
});

test("many splitting rows (an inline copy of library_deployment on a frame of one and a half base ticks): the item wraps inside the tab, its values under themselves", async ({ page }) => {
  await timingOf(page, "library_deployment", edited("library_deployment", (d) => (d.deployment.dt_frame = { num: 3, den: 200 })));
  await page.setViewportSize({ width: 1200, height: 1000 });
  const item = body(page).locator('dl.head .item[data-item="rows that split frames"]');
  await expect(item.locator("code")).toHaveCount(13);
  const m = await item.evaluate((e) => {
    const dd = e.querySelector("dd")!, codes = [...dd.querySelectorAll("code")].map((c) => c.getBoundingClientRect());
    const b = e.closest(".tab-body")!;
    return {
      lines: new Set(codes.map((c) => Math.round(c.top))).size, right: Math.max(...codes.map((c) => c.right)), edge: b.getBoundingClientRect().left + b.clientWidth,
      left: Math.min(...codes.map((c) => c.left)), dd: dd.getBoundingClientRect().left,
    };
  });
  expect(m.lines).toBeGreaterThan(1);
  expect(m.right).toBeLessThanOrEqual(m.edge);
  expect(m.left).toBeGreaterThanOrEqual(m.dd - 0.5);
});

test("a proposing algorithm with an h_min (an inline copy of library_deployment): h_min and attempt_budget after h_max, the steps a range as proposed", async ({ page }) => {
  await timingOf(page, "library_deployment", edited("library_deployment", (d) => {
    d.deployment.algorithm = { text: "BS3()", proposes: true };
    d.deployment.h_min = { num: 1, den: 400 };
  }));
  expect(await head(page)).toEqual([
    [["Δt_frame:", "1/100 s"], ["Δt_base:", "1/100 s"]],
    [["algorithm:", "BS3()"], ["h_max:", "1/100 s"], ["h_min:", "1/400 s"], ["attempt_budget:", "7"]],
    [["steps per frame:", "1 to 4, as proposed"]],
  ]);
  await shot(page, "library_deployment_proposing", "", "timing-tab");
});

test("a fixed-step algorithm with h_min set (an inline copy of library_deployment): neither h_min nor attempt_budget", async ({ page }) => {
  await timingOf(page, "library_deployment", edited("library_deployment", (d) => (d.deployment.h_min = { num: 1, den: 400 })));
  expect((await head(page))[1]).toEqual([["algorithm:", "RK4()"], ["h_max:", "1/100 s"]]);
  await expect(body(page).locator('[data-item="h_min"], [data-item="attempt_budget"]')).toHaveCount(0);
});

test("timing: a build's tab, no head list, no chart and no law; A₀ at Δt_base, no factor in the anchors table; under it the base grid's section, the coarsest tick, the offset's sentences and the prime rows, then the closing sentence", async ({ page }) => {
  await timingOf(page, "timing");
  await expect(body(page).locator("dl.head, .chart")).toHaveCount(0);
  await expect(body(page).locator("h3")).toHaveText(["Anchors", "Base grid", "Rate scopes", "Components"]);
  await expect(body(page)).not.toContainText("Δt(i) = Dₐ(i) · Δt(a)");
  await expect(body(page).locator("table.anchors th")).toHaveText(["anchor", "Δt", "τ", "declared in"]);
  const a = (k: number) => body(page).locator(`table.anchors tr.anchor[data-index="${k}"]`);
  await expect(a(0).locator("td")).toHaveText(["A₀ (base)", "Δt_base", "0", "—"]);
  await expect(a(1).locator("td")).toHaveText(["A₁ (staggered)", "1/10 s", "1/300 s", "the root"]);
  await expect(a(2).locator("td")).toHaveText(["A₂ (fast)", "1/50 s", "0", "the root"]);
  await expect(body(page).locator("table.anchors")).not.toContainText("×");
  expect(await baseGrid(page)).toEqual([
    "coarsest admissible Δt_base: 1/300 s",
    "τ(A₁) = 1/300 s (staggered) makes the grid 6× finer. With τ(A₁) = 0 or 1/50 s, the coarsest admissible Δt_base would be 1/50 s.",
    "Prime factors of the denominator, 300 = 2²·3·5²", "2²: τ(A₁) (staggered)", "3: τ(A₁) (staggered)", "5²: Δt(A₂) (fast), τ(A₁) (staggered)",
  ]);
  // the section follows the anchors table; the primes stand apart under their own label
  await expect(body(page).locator("table.anchors + h3 + .grid-report")).toHaveCount(1);
  const gaps = await body(page).locator(".grid-report p").evaluateAll((ps) => ps.slice(1).map((p, i) => p.getBoundingClientRect().top - ps[i].getBoundingClientRect().bottom));
  expect(gaps[1]).toBeGreaterThan(gaps[0]);
  await expect(body(page).locator("table.components th")).toHaveText(["", "path", "anchor", "Dₐ", "Φₐ", "Δt", "τ"]);
  await expect(body(page).locator('tr.component[data-path="fast/outer/hold"] td')).toHaveText(["", "fast/outer/hold", "A₂ (fast)", "6", "3", "3/25 s", "3/50 s"]);
  await expect(body(page).locator("p.deployment-note")).toHaveText("The columns in base ticks and the hyperperiod chart need a deployment.");
  expect(await body(page).evaluate((b) => b.lastElementChild?.className.split(" ")[0])).toBe("deployment-note");
  await shot(page, "timing", "", "timing-tab");
});

test("library: a build's A₀ rows in Δt_base, d_pid at 2·Δt_base and Δt_base; dss's period alone refines the grid, with no alternatives, two prime rows", async ({ page }) => {
  await timingOf(page, "library");
  await expect(body(page).locator('tr.component[data-path="d_pid"] td')).toHaveText(["", "d_pid", "A₀ (base)", "2", "1", "2·Δt_base", "Δt_base"]);
  await expect(body(page).locator('tr.anchor[data-index="2"] td.dt')).toHaveText("1/50 s");
  expect(await baseGrid(page)).toEqual([
    "coarsest admissible Δt_base: 1/50 s", "Δt(A₂) = 1/50 s (dss) makes the grid 5× finer.",
    "Prime factors of the denominator, 50 = 2·5²", "2: Δt(A₁) (noise), Δt(A₂) (dss)", "5²: Δt(A₂) (dss)",
  ]);
  await expect(body(page).locator(".chart")).toHaveCount(0);
  await shot(page, "library", "", "timing-tab");
});

test("library_deployment, rates, rates_deployment, closed_loop and closed_loop_deployment: the base grid's first line and the sentences, none where every factor is 1", async ({ page }) => {
  for (const [name, first, entries] of [
    ["library_deployment", "Δt_base: 1/100 s, coarsest admissible: 1/50 s", ["Δt(A₂) = 1/50 s (dss) makes the grid 5× finer."]],
    ["rates", "coarsest admissible Δt_base: 1/50 s", ["Δt(A₁) = 1/50 s (fast) makes the grid 5× finer."]],
    ["rates_deployment", "Δt_base: 1/200 s, coarsest admissible: 1/50 s", ["Δt(A₁) = 1/50 s (fast) makes the grid 5× finer."]],
    ["closed_loop", "coarsest admissible Δt_base: 1/50 s", []],
    ["closed_loop_deployment", "Δt_base: 1/100 s, coarsest admissible: 1/50 s", []],
  ] as const) {
    await timingOf(page, name);
    const lines = await baseGrid(page);
    expect(lines.slice(0, -3), name).toEqual([first, ...entries]);
    expect(lines.at(-3), name).toBe("Prime factors of the denominator, 50 = 2·5²");
  }
});

test("a whole-second grid (an inline copy of library) shows no prime lines, an unfactored cofactor says so, and a structure with no anchors has no such section", async ({ page }) => {
  await timingOf(page, "library", edited("library", (d) => {
    const s = d.build.structure;
    s.anchors.forEach((a: any) => (a.dt = { num: 2, den: 1 }));
    s.grid = { admissible: { num: 2, den: 1 }, pool: [{ anchor: 1, kind: "period", factor: 1 }, { anchor: 2, kind: "period", factor: 1 }], primes: [] };
  }));
  expect(await baseGrid(page)).toEqual(["coarsest admissible Δt_base: 2 s"]);
  await timingOf(page, "library", edited("library", (d) => {
    Object.assign(d.build.structure.grid, { admissible: { num: 1, den: 1099511627791 }, primes: [{ prime: 1099511627791, power: 1, suppliers: [2], unfactored: true }] });
  }));
  expect((await baseGrid(page)).slice(-2)).toEqual(["Prime factors of the denominator, 1099511627791 = 1099511627791 unfactored", "1099511627791 unfactored: Δt(A₂) (dss)"]);
  await timingOf(page, "kinds");
  await expect(body(page).locator("table.anchors tr.anchor")).toHaveCount(1);
  await expect(body(page).locator("h3")).toHaveText(["Anchors", "Rate scopes", "Components"]);
  await expect(body(page).locator(".grid-report")).toHaveCount(0);
});

test("timing_deployment: the anchors and the scopes add the base grid's columns, the scopes the key after the path; every column head is a term of the help page's law", async ({ page }) => {
  await timingOf(page, "timing_deployment");
  await expect(body(page).locator("table.anchors th")).toHaveText(["anchor", "Δt", "τ", "D₀", "Φ₀", "declared in"]);
  await expect(body(page).locator('tr.anchor[data-index="0"] td')).toHaveText(["A₀ (base)", "1/300 s", "0", "1", "0", "—"]);
  await expect(body(page).locator('tr.anchor[data-index="1"] td')).toHaveText(["A₁ (staggered)", "1/10 s", "1/300 s", "30", "1", "the root"]);
  expect((await baseGrid(page)).slice(0, 2)).toEqual([
    "Δt_base: 1/300 s, coarsest admissible: 1/300 s",
    "τ(A₁) = 1/300 s (staggered) makes the grid 6× finer. With τ(A₁) = 0 or 1/50 s, the coarsest admissible Δt_base would be 1/50 s.",
  ]);
  await expect(body(page).locator("table.scopes th")).toHaveText(["path", "key", "anchor", "Dₐ", "Φₐ", "D₀", "Φ₀", "Δt", "τ"]);
  await expect(body(page).locator('tr.scope[data-path="fast/outer"] td')).toHaveText(["fast/outer", "outer", "A₂ (fast)", "2", "1", "12", "6", "1/25 s", "1/50 s"]);
  await expect(body(page).locator("table.components th")).toHaveText(["", "path", "anchor", "Dₐ", "Φₐ", "D₀", "Φ₀", "Δt", "τ"]);
  await expect(body(page).locator('tr.component[data-path="staggered"] td')).toHaveText(["", "staggered", "A₁ (staggered)", "1", "0", "30", "1", "1/10 s", "1/300 s"]);
  await expect(body(page).locator('tr.component[data-path="staggered"]').locator("td.Da, td.phia, td.D0, td.phi0")).toHaveText(["1", "0", "30", "1"]);
  await expect(body(page).locator("p.deployment-note")).toHaveCount(0);
  // the law's terms, from the help page: each line split at its operators, an argument dropped, since a table's row names the node
  await press(page, "?");
  const terms = new Set((await page.locator("article.help table.law td").allTextContents()).flatMap((t) => t.replace(/\([ia]\)/g, "").split(/[\s=·+]+/)).filter(Boolean));
  await press(page, "?");
  expect([...terms].sort()).toEqual(["D₀", "Dₐ", "Δt", "Δt_base", "Φ₀", "Φₐ", "τ"].sort());
  const heads = await body(page).locator("table.anchors th, table.scopes th, table.components th").allTextContents();
  expect(heads.filter((h) => !["", "path", "key", "anchor", "declared in"].includes(h) && !terms.has(h))).toEqual([]);
  // the anchor's name carries the declaring scope in its tooltip
  await expect(body(page).locator('tr.anchor[data-index="2"] td.anchor span.anchor')).toHaveAttribute("title", "fast at the root");
  await expect(body(page).locator('tr.component[data-path="fast/inner"] td.anchor span.anchor')).toHaveAttribute("title", "fast at the root");
  await expect(body(page).locator('tr.anchor[data-index="0"] td.anchor span.anchor')).toHaveAttribute("title", "the base grid");
});

test("timing and timing_deployment: the words phase, offset and multiple stand nowhere on the timing tab, its tooltips included", async ({ page }) => {
  for (const name of ["timing", "timing_deployment"]) {
    await timingOf(page, name);
    const texts = await body(page).evaluate((b) => [
      ...[...b.querySelectorAll("*")].flatMap((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!)),
      ...[...b.querySelectorAll("[title], [aria-label]")].flatMap((e) => [e.getAttribute("title") ?? "", e.getAttribute("aria-label") ?? ""]),
    ]);
    expect(texts.length, name).toBeGreaterThan(100);
    expect(texts.filter((t) => /\b(phases?|offsets?|multiples?)\b/i.test(t)), name).toEqual([]);
  }
});

test("library_deployment: four chart rows fastest first, (2, 0) with two swatches; every row on frame tops, no lines but the caption; the timeline fitted, each row due where n mod D₀ = Φ₀", async ({ page }) => {
  await timingOf(page, "library_deployment");
  await expect(body(page).locator("p.hyperperiod")).toHaveText("hyperperiod: 10 base ticks (1/10 s)");
  await expect(body(page).locator("p.joint")).toHaveCount(0);
  await expect(rows(page).locator(".dphi")).toHaveText(["D₀ 1 · Φ₀ 0", "D₀ 2 · Φ₀ 0", "D₀ 2 · Φ₀ 1", "D₀ 10 · Φ₀ 0"]);
  await expect(rows(page).locator(".count")).toHaveText(["9 primitives", "2 primitives", "1 primitive", "1 primitive"]);
  await expect(rows(page).locator(".frames")).toHaveText(Array(4).fill("on frame tops"));
  await expect(rows(page).nth(1).locator("button.swatch")).toHaveCount(2);
  expect(await rows(page).nth(1).locator("button.swatch").evaluateAll((b) => b.map((e) => e.getAttribute("data-key")))).toEqual(["0,2,0", "2,1,0"]);
  await expect(body(page).locator("line.frame-top")).toHaveCount(0);
  await expect(body(page).locator("p.frame-caption")).toHaveText("every base tick is a frame top: 1 frame in one base tick");
  await expect(body(page).locator(".chart")).toHaveAttribute("data-fit", "fit");
  const ls = await lanes(page);
  expect(ls.map((l) => [l.D, l.phi])).toEqual([[1, 0], [2, 0], [2, 1], [10, 0]]);
  const pitch = pitchOf(ls[0].marks);
  expect(pitch).toBeGreaterThanOrEqual(PITCH);
  for (const l of ls) expectMarks(l, 10, pitch);
  // fitted: the timeline ends inside the tab, which does not scroll sideways
  const fits = await body(page).evaluate((b) => {
    const lane = b.querySelector(".chart svg.lane")!.getBoundingClientRect(), chart = b.querySelector(".chart")!.getBoundingClientRect();
    return { inside: lane.right <= chart.right + 0.5, scrolls: b.scrollWidth > b.clientWidth };
  });
  expect(fits).toEqual({ inside: true, scrolls: false });
  await shot(page, "library_deployment", "", "timing-tab");
});

test("rates_deployment: a frame of two base ticks draws a frame top every two ticks over the joint period of 40, 0 to 20; three rows", async ({ page }) => {
  await timingOf(page, "rates_deployment");
  await expect(rows(page).locator(".dphi")).toHaveText(["D₀ 4 · Φ₀ 0", "D₀ 8 · Φ₀ 0", "D₀ 20 · Φ₀ 0"]);
  await expect(body(page).locator("p.frame-caption")).toHaveCount(0);
  const ls = await lanes(page);
  const pitch = pitchOf(ls[0].marks);
  for (const l of ls) {
    expectMarks(l, 40, pitch);
    expect(l.tops.map((t) => t[0])).toEqual(Array.from({ length: 21 }, (_, k) => k));
    for (const [k, x] of l.tops) expect(x).toBeCloseTo(PAD + k * 2 * pitch, 6);
  }
  await shot(page, "rates_deployment", "", "timing-tab");
});

test("a frame of one and a half base ticks (an inline copy of rates_deployment): the frame tops fall between ticks at k·3/2 pitches over the joint period, every row splits frames", async ({ page }) => {
  await timingOf(page, "rates_deployment", edited("rates_deployment", (d) => {
    d.deployment.dt_frame = { num: 3, den: 400 };
    d.deployment.h_max = { num: 3, den: 400 };
  }));
  await expect(body(page).locator("p.joint")).toHaveText("the chart spans the joint period with Δt_frame: 120 base ticks (3/5 s), 80 frames");
  await expect(rows(page).locator(".frames")).toHaveText(Array(3).fill("splits frames"));
  await expect(body(page).locator('dl.head .item[data-item="steps per unsplit frame"]')).toHaveCount(1);
  const ls = await lanes(page);
  const pitch = pitchOf(ls[0].marks);
  expectMarks(ls[0], 120, pitch);
  expect(ls[0].tops).toHaveLength(81);
  for (const [k, x] of ls[0].tops) expect(x).toBeCloseTo(PAD + k * 1.5 * pitch, 6);
  // an odd frame top stands halfway between two base ticks
  const marks = new Set(ls[0].marks.map((m) => m[1]));
  expect(ls[0].tops.filter(([k]) => k % 2 === 1).every(([, x]) => !marks.has(x))).toBe(true);
  await shot(page, "rates_deployment_frame_3_400", "", "timing-tab");
});

test("timing_deployment: the timeline at the minimum pitch scrolls the tab's body sideways under the labels, which stay; z with l and h from the drawer scroll it by the step; staggered's row splits frames", async ({ page }) => {
  await timingOf(page, "timing_deployment");
  await expect(rows(page).locator(".dphi")).toHaveText(["D₀ 6 · Φ₀ 0", "D₀ 12 · Φ₀ 6", "D₀ 24 · Φ₀ 18", "D₀ 30 · Φ₀ 1", "D₀ 36 · Φ₀ 18"]);
  await expect(body(page).locator('.chart-row[data-d="30"] .frames')).toHaveText("splits frames");
  await expect(body(page).locator('.chart-row[data-splits="true"]')).toHaveCount(1);
  await expect(body(page).locator(".chart")).toHaveAttribute("data-fit", "scroll");
  const ls = await lanes(page);
  expect(pitchOf(ls[0].marks)).toBeCloseTo(PITCH, 6);
  for (const l of ls) expectMarks(l, 360, PITCH);
  for (const [k, x] of ls[0].tops) expect(x).toBeCloseTo(PAD + k * 3 * PITCH, 6);
  expect(ls[0].tops).toHaveLength(121);
  const place = () => body(page).evaluate((b) => ({
    left: b.scrollLeft, over: b.scrollWidth > b.clientWidth,
    labels: b.querySelector(".chart .labels")!.getBoundingClientRect().left, lane: b.querySelector(".chart svg.lane")!.getBoundingClientRect().left,
  }));
  const start = await place();
  expect(start.over).toBe(true);
  await body(page).locator("h3").first().click();
  await pressAll(page, "z", "l", "z", "l");
  const moved = await place();
  expect(moved.left).toBe(80);
  expect(moved.labels).toBeCloseTo(start.labels, 0);
  expect(moved.lane).toBeCloseTo(start.lane - 80, 0);
  await pressAll(page, "z", "h");
  expect((await place()).left).toBe(40);
  await body(page).evaluate((b) => (b.scrollLeft = 0));
  await shot(page, "timing_deployment", "", "timing-tab");
});

test("the look pass's chart (9.1 to 9.4): each lane's base ticks one stroke of 6 px per tick in the lighter text color; 360 ticks drawn at 10 px; an inline copy at half the base tick, 720 ticks, past the threshold of 500", async ({ page }) => {
  await timingOf(page, "timing_deployment");
  const grid = await body(page).locator(".chart svg.lane path.grid").first().evaluate((p: SVGPathElement) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--text-light)";
    p.closest(".chart")!.appendChild(probe);
    const light = getComputedStyle(probe).color;
    probe.remove();
    const strokes = (p.getAttribute("d")!.match(/M/g) ?? []).length, b = p.getBBox();
    return { stroke: getComputedStyle(p).stroke, light, strokes, height: b.height };
  });
  expect(grid.stroke).toBe(grid.light);
  expect(grid.strokes).toBe(360);
  expect(grid.height).toBeCloseTo(6, 6);
  await expect(body(page).locator(".chart")).toHaveAttribute("data-fit", "scroll");
  await shot(page, "timing_deployment", "", "chart-pitch");
  await timingOf(page, "timing_deployment", edited("timing_deployment", (d) => {
    const s = d.deployment.schedule;
    d.deployment.dt_base = { num: 1, den: 600 };
    for (const r of [...s.anchors, ...s.rows, ...s.scopes]) [r.D, r.phi] = [r.D * 2, r.phi * 2];
  }));
  await expect(body(page).locator("p.chart-omitted")).toHaveText("chart omitted: the joint period is 720 base ticks (6/5 s)");
  await expect(body(page).locator(".chart")).toHaveAttribute("data-fit", "omitted");
  await shot(page, "timing_deployment_base_600", "", "chart-omitted");
});

test("past the threshold (an inline copy of timing_deployment at a tenth of its base tick): the timeline omitted with one line of its length, the rows kept", async ({ page }) => {
  await timingOf(page, "timing_deployment", edited("timing_deployment", (d) => {
    const s = d.deployment.schedule;
    d.deployment.dt_base = { num: 1, den: 3000 };
    for (const r of [...s.anchors, ...s.rows, ...s.scopes]) [r.D, r.phi] = [r.D * 10, r.phi * 10];
  }));
  await expect(body(page).locator("p.hyperperiod")).toHaveText("hyperperiod: 3600 base ticks (6/5 s)");
  await expect(body(page).locator("p.chart-omitted")).toHaveText("chart omitted: the joint period is 3600 base ticks (6/5 s)");
  await expect(body(page).locator(".chart")).toHaveAttribute("data-fit", "omitted");
  await expect(rows(page)).toHaveCount(5);
  await expect(body(page).locator(".chart svg.lane")).toHaveCount(0);
  await shot(page, "timing_deployment_base_3000", "", "timing-tab");
});

test("a deployment whose schedule has no rows (an inline copy of closed_loop_deployment): no hyperperiod and no chart, the head list kept", async ({ page }) => {
  await timingOf(page, "closed_loop_deployment", edited("closed_loop_deployment", (d) => (d.deployment.schedule.rows = [])));
  await expect(body(page).locator("dl.head")).toHaveCount(3);
  await expect(body(page).locator("h3")).toHaveText(["Anchors", "Base grid", "Rate scopes", "Components"]);
  await expect(body(page).locator(".chart, p.hyperperiod")).toHaveCount(0);
});

test("closed_loop_deployment: one chart row of ten swatches; a swatch toggles the legend's focus, a press in tier mode turning rate mode on, and the second press clears it; the row takes no click", async ({ page }) => {
  await timingOf(page, "closed_loop_deployment");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).locator(".dphi")).toHaveText("D₀ 2 · Φ₀ 0");
  await expect(rows(page).locator(".count")).toHaveText("10 primitives");
  const swatches = rows(page).locator("button.swatch");
  await expect(swatches).toHaveCount(10);
  await shot(page, "closed_loop_deployment", "", "timing-tab");
  const svg = page.locator("svg.canvas");
  await expect(svg).toHaveAttribute("data-mode", "tier");
  const sw = rows(page).locator('button.swatch[data-key="1,1,0"]');
  await expect(sw).toHaveAttribute("aria-pressed", "false");
  await sw.click();
  await expect(svg).toHaveAttribute("data-mode", "rate");
  await expect(svg).toHaveClass(/legend-focus/);
  await expect(svg).toHaveAttribute("data-focus", "1,1,0");
  await expect(sw).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('div.legend button.line[aria-pressed="true"]')).toHaveCount(1);
  await sw.click();
  await expect(svg).not.toHaveClass(/legend-focus/);
  await expect(sw).toHaveAttribute("aria-pressed", "false");
  await expect(svg).toHaveAttribute("data-mode", "rate");
  // the canvas's legend line and the swatch are one focus
  await page.locator('div.legend li[data-step="0"] button.line').click();
  await expect(sw).toHaveAttribute("aria-pressed", "true");
  await page.locator('div.legend li[data-step="0"] button.line').click();
  await expect(sw).toHaveAttribute("aria-pressed", "false");
  // the row itself selects nothing and focuses nothing
  await rows(page).locator(".count").click();
  await rows(page).locator(".dphi").click();
  await expect(page.locator("svg.canvas .selected")).toHaveCount(0);
  await expect(svg).not.toHaveClass(/legend-focus/);
  // the press from the keyboard: Space on the focused swatch
  await sw.focus();
  await press(page, " ");
  await expect(sw).toHaveAttribute("aria-pressed", "true");
});
